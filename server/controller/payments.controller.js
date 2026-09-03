const axios = require("axios");
const userModel = require("../model/user.model");
const numberSettingModel = require("../model/numberSetting.model");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createNotification } = require("./notification.controller");
const { resolveSubaccountId, checkUsageLimit, featureEnabled } = require("../helpers/snapshotLimits");
const { captureVapiCall } = require("../helpers/customerMemory");
const billing = require("../helpers/billing");
const { maybeAutoTopUp } = require("../helpers/autoTopUp");
require("dotenv").config();

const CHARGE_TYPES = ["end-of-call-report", "call.ended", "call.analysis.completed"];

// Resolve our Twilio phoneSid for a Vapi call (via stored numberDetails)
const resolvePhoneSid = (user, call) => {
  const vapiPhoneId = call.phoneNumberId || call.phoneNumber?.id;
  if (!vapiPhoneId) return null;
  for (const sub of user.ghlSubAccountIds || []) {
    for (const ast of sub.vapiAssistants || []) {
      const nd = (ast.numberDetails || []).find((n) => n.vapiPhoneNumId === vapiPhoneId);
      if (nd) return nd.phoneSid;
    }
  }
  return null;
};

// Check this number's configured limits (calls/day, monthly budget) against
// recorded usage. Returns a reason string if a limit is exceeded, else null.
const checkNumberLimits = async (user, phoneSid) => {
  if (!phoneSid) return null;
  const setting = await numberSettingModel.findOne({ userId: user._id, phoneSid }).lean();
  const limits = setting?.limits;
  if (!limits) return null;

  const { callsToday, monthSpend } = await billing.numberUsage(user, phoneSid);

  if (limits.maxCallsPerDay > 0 && callsToday >= limits.maxCallsPerDay) {
    return `Daily call limit reached (${limits.maxCallsPerDay}) for this number.`;
  }
  if (limits.monthlyBudget > 0 && monthSpend >= limits.monthlyBudget) {
    return `Monthly budget ($${limits.monthlyBudget}) reached for this number.`;
  }
  return null;
};

// billing flow:
// 1. take money from user's card to his platform account
// 2. remove what he owes from his platform account to my own account (done)
// 3. his usage is charged from my own account which I must have connected to vapi and twilio (done)

const getLatestConnectedBalance = async (req, res) => {
  const { connectedAccountId } = req.params; // or req.query

  try {
    const balance = await stripe.balance.retrieve({
      // This header tells Stripe to look at the CUSTOMER'S account, not yours.
      stripeAccount: connectedAccountId,
    });

    // Extracting USD balances (or change to your primary currency)
    const available = balance.available.find((b) => b.currency === "usd");
    const pending = balance.pending.find((b) => b.currency === "usd");

    res.send({
      status: true,
      data: {
        accountId: connectedAccountId,
        availableBalance: (available.amount / 100).toFixed(2), // Convert cents to dollars
        pendingBalance: (pending.amount / 100).toFixed(2),
        currency: available.currency.toUpperCase(),
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Stripe Balance Error:", error.message);
    res.status(500).send({ status: false, message: error.message });
  }
};

const chargeCustomerCard = async (req, res) => {
  // 1. Lookup the connected account's ID for the customer being paid
  // In a real app, this ID comes from your database based on who the customer is paying.
  const { amount } = req.body;
  const userId = req.user;
  const user = await userModel.findById(userId);
  const connectedAccountId = await user.stripeUserId;
  const stripeAccountId = process.env.STRIPE_PLATFORM_ACCOUNT_ID;

  console.log(
    "Charging card for user:",
    req.user,
    "on account:",
    stripeAccountId,
  );

  if (!connectedAccountId) {
    // return res
    //   .status(404)
    //   .json({ error: "Connected account ID not found for this user." });
    return res.send({
      status: false,
      message: "Connected account ID not found for this user.",
    });
  }

  try {
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        metadata: { userId: userId },
        email: user.email,
      });

      user.stripeCustomerId = customer.id;
      await user.save();
    }

    const paymentIntent = await stripe.paymentIntents.create(
      {
        // payment_method_types: ["card"],
        amount: Math.round(amount * 100), // in cents (integer)
        currency: "usd",
        customer: user.stripeCustomerId,
        setup_future_usage: "off_session",
        // CRITICAL: Use the Stripe-Account header to act on their behalf
        automatic_payment_methods: { enabled: true },
        metadata: {
          userId: req.user,
          type: "USAGE_CHARGE",
        },
      },
      {
        stripeAccount: stripeAccountId,
      },
    );

    // The connected account receives the funds and pays Stripe fees.
    // The PaymentIntent created belongs to the connected account, not your platform.

    return res.send({
      status: true,
      message: "Payment Intent created successfully.",
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      accountId: stripeAccountId,
    });
  } catch (error) {
    console.error(
      "Error creating Payment Intent on behalf of connected account:",
      error,
    );
    return res.send({
      status: false,
      message: error.message,
    });
  }
};

// confirm payment server-side (usually done on frontend)
const paymentConfirmation = async (req, res) => {
  // This can be used if you want to confirm payment server-side
  // but usually frontend handles it with Stripe.js
  const userId = req.user;
  const user = await userModel.findById(userId);
  const { paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      return res.send({ status: true, message: "Payment successful" });
    } else {
      return res.send({ status: false, message: "Payment not completed" });
    }
  } catch (error) {
    return res.send({ status: false, message: error.message });
  }
};

const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  // console.log("Received Stripe webhook:", req.body);

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // PAYMENT SUCCESSFUL
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const { userId, type } = paymentIntent.metadata || {};

    // Only credit wallet for intended charges
    if (userId && type === "USAGE_CHARGE") {
      const amountUsd = paymentIntent.amount / 100; // already in cents
      const paymentMethodId = paymentIntent.payment_method;

      const user = await userModel.findById(userId);
      if (!user) return res.json({ received: true });

      const pm = paymentMethodId ? await stripe.paymentMethods.retrieve(paymentMethodId) : null;

      if (pm && !pm.customer) {
        // attach payment method to customer
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: user.stripeCustomerId,
        });

        await stripe.customers.update(user.stripeCustomerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      }

      // Credit the wallet atomically. Idempotency is enforced by a unique index
      // on the PaymentIntent id, so a Stripe retry cannot double-credit.
      const result = await billing.creditWallet({
        userId,
        amount: amountUsd,
        type: "WALLET_TOPUP",
        callId: paymentIntent.id,
      });

      if (!result.credited) {
        console.log(`Skipping duplicate top-up for ${paymentIntent.id}`);
        return res.json({ received: true });
      }

      await createNotification({
        userId,
        type: "payment_received",
        title: "Wallet Topped Up",
        message: `$${amountUsd.toFixed(2)} has been added to your wallet. New balance: $${(result.balance ?? 0).toFixed(2)}.`,
        metadata: { amount: amountUsd, paymentIntentId: paymentIntent.id },
      });

      console.log(`Wallet credited: +${amountUsd} USD for user ${userId}`);
    }
  }

  // PAYMENT FAILED
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    const { userId } = paymentIntent.metadata || {};

    console.error("Payment failed for user:", userId);

    if (userId) {
      await billing.recordEvent({
        userId,
        type: "WALLET_TOPUP_FAILED",
        amount: (paymentIntent.amount || 0) / 100,
        callId: paymentIntent.id,
      });
    }
  }

  res.json({ received: true });
};

// autoTopUpLowWalletUsers

// Automatic Wallet Top-Up for Low Balances
const autoTopUpLowWalletUsers = async (req, res) => {
  const { userId } = req.body;
  console.log("Auto-charge triggered for user:", userId);

  const result = await maybeAutoTopUp(userId);

  if (result.toppedUp) {
    return res.send({
      status: true,
      message: "Auto-charge successful",
      paymentIntentId: result.paymentIntentId,
    });
  }

  const benign = ["above-threshold", "auto-pay-disabled"];
  return res
    .status(benign.includes(result.reason) ? 200 : 400)
    .send({ status: benign.includes(result.reason), message: result.reason });
};

const callBillingWebhook = async (req, res) => {
  try {
    const { type, call, artifact } = req.body.message;

    console.log("Received billing webhook:", req.body);

    if (!call || !call.id || !call.assistantId) {
      return res.status(400).send("Invalid payload");
    }

    const user = await userModel.findOne({
      "ghlSubAccountIds.vapiAssistants.assistantId": call.assistantId,
    });

    // Check user existence BEFORE touching its fields
    const balanceTooLow = !!user && user.walletBalance <= 0;

    if (!user || balanceTooLow) {
      res.status(200).json({
        error: balanceTooLow
          ? "Your account balance is too low to start this call. Please top up."
          : "This assistant is not linked to any user account in our platform.",
      });

      try {
        await axios.post(
          `https://api.vapi.ai/call/${call.id}/terminate`,
          {}, // Empty body for POST
          {
            headers: {
              Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
              "Content-Type": "application/json",
            },
          },
        );
        console.log("Call terminated successfully due to low balance.");
      } catch (terminateErr) {
        // If it's a 404, the call already ended naturally
        if (terminateErr.response?.status !== 404) {
          console.error(
            "Terminate Error:",
            terminateErr.response?.data || terminateErr.message,
          );
        }
      }

      return; // don't retry
    }

    // ---- PER-NUMBER LIMITS (max calls/day, monthly budget) ----
    const phoneSid = resolvePhoneSid(user, call);
    const subaccountId = resolveSubaccountId(user, call.assistantId);

    // ---- SNAPSHOT USAGE CAP: monthly call-minutes per sub-account ----
    // ---- FEATURE GATE: agency may have voice calling disabled ----
    const limitReason =
      (featureEnabled(user, "voice") ? null : "Voice calling is disabled for this agency.") ||
      (await checkNumberLimits(user, phoneSid)) ||
      (await checkUsageLimit(user, subaccountId, "calling"));
    if (limitReason) {
      res.status(200).json({ error: limitReason });
      try {
        await axios.post(`https://api.vapi.ai/call/${call.id}/terminate`, {}, {
          headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}`, "Content-Type": "application/json" },
        });
        console.log(`Call terminated — ${limitReason}`);
      } catch (e) {
        if (e.response?.status !== 404) console.error("Terminate Error:", e.response?.data || e.message);
      }
      return;
    }

    const typeStatus = CHARGE_TYPES;

    if (!typeStatus.includes(type)) {
      console.log(`Call ${call.id} is currently ${call.status}`);
      return res.sendStatus(200);
    }

    // Call duration (seconds) — used for usage caps, notifications, and memory.
    const durationSec = call.endedAt && call.startedAt
      ? Math.round((new Date(call.endedAt) - new Date(call.startedAt)) / 1000)
      : (Number(call.durationSeconds) ? Math.round(call.durationSeconds) : null);

    // ---- PER-CUSTOMER MEMORY ----
    // Runs before the billing idempotency guard: whichever event bills the call
    // first is not necessarily the one carrying the transcript. captureVapiCall
    // dedupes on the Vapi call id and ignores events with no content, so every
    // event can safely be offered to it.
    await captureVapiCall({
      user,
      call,
      artifact,
      analysis: req.body.message?.analysis,
      messages: req.body.message?.artifact?.messages,
      subaccountId,
      durationSec,
    });

    // Resolve the final call cost from whichever event arrived first.
    // end-of-call-report carries the complete cost; the others are fallbacks.
    let amountToDeduct = 0;
    if (type === "end-of-call-report") {
      amountToDeduct = req.body.message?.cost ?? call.cost?.total ?? 0;
    } else if (type === "call.ended") {
      amountToDeduct = call.cost?.total ?? 0;
    } else if (type === "call.analysis.completed") {
      amountToDeduct = call.analysis?.cost ?? 0;
    }
    amountToDeduct = Number(amountToDeduct) || 0;

    // ---- DEDUCT WALLET ----
    // One charge per call, whichever of Vapi's three events arrives first: the
    // idempotency key is the call id, not the event type, and it is enforced by
    // a unique index rather than by scanning history in memory.
    const charge = await billing.chargeWallet({
      user,
      amount: amountToDeduct,
      type,
      kind: "call",
      callId: call.id,
      idempotencyKey: `call:${call.id}`,
      subaccountId: subaccountId || undefined,
      phoneSid: phoneSid || undefined,
      durationSec: durationSec || undefined,
    });

    if (!charge.charged) {
      return res.sendStatus(200); // already billed for this call
    }

    await maybeAutoTopUp(user._id);

    // Fire call completed notification
    if (type === "end-of-call-report" || type === "call.ended") {
      const durationText = durationSec != null
        ? `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`
        : "Unknown duration";

      await createNotification({
        userId: user._id,
        type: "call_completed",
        title: "Call Completed",
        message: `A call has ended. Duration: ${durationText}. Cost: $${charge.amount.toFixed(4)}.`,
        metadata: { callId: call.id, cost: charge.amount, duration: durationSec },
      });
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("Vapi billing webhook error:", err);
    return res.sendStatus(500); // allow retry
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user;
    const user = await userModel.findById(userId);
    if (!user) return res.send({ status: false, message: "User not found" });

    // Merged view of the billingEvent collection and any history still on the
    // user document, so nothing disappears before the backfill has run.
    const data = await billing.listEvents(user);
    return res.send({ status: true, data });
  } catch (error) {
    return res.send({ status: false, message: error.message });
  }
};

const getChargingDetails = async (req, res) => {
  try {
    const userId = req.user;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.send({ status: false, message: "User not found" });
    }

    let cardDetails = null;

    console.log(user.stripeCustomerId);

    console.log("customer id: ", user.stripeCustomerId);

    // Fetch card details from Stripe if a customer ID exists
    if (user.stripeCustomerId) {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: "card",
        limit: 1, // Get the primary/latest card
      });

      if (paymentMethods.data.length > 0) {
        const card = paymentMethods.data[0].card;
        cardDetails = {
          brand: card.brand,
          last4: card.last4,
          expMonth: card.exp_month,
          expYear: card.exp_year,
        };
      }
    }

    return res.send({
      status: true,
      data: {
        autoCharging: user.autoCardPay || {
          status: false,
          least: 25,
          refillAmount: 50,
        },
        card: cardDetails, // Will be null if no card is attached
      },
    });
  } catch (error) {
    console.error("Stripe/DB Error:", error.message);
    return res.send({ status: false, message: error.message });
  }
};

const updateAutoChargingSettings = async (req, res) => {
  try {
    const userId = req.user;
    const { status, least, refillAmount } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.send({ status: false, message: "User not found" });
    }

    const nextLeast = least !== undefined ? Number(least) : user.autoCardPay.least;
    const nextRefill =
      refillAmount !== undefined ? Number(refillAmount) : user.autoCardPay.refillAmount;

    if (!(nextLeast >= 0) || !(nextRefill > 0)) {
      return res.send({
        status: false,
        message: "Threshold must be zero or more and refill amount must be greater than zero.",
      });
    }

    // A refill smaller than the threshold leaves the balance still below it
    // after topping up, so the next charge triggers another top-up — the card
    // gets hit repeatedly to climb out. Reject the combination up front.
    if (nextRefill < nextLeast) {
      return res.send({
        status: false,
        message: `Refill amount ($${nextRefill}) must be at least the low-balance threshold ($${nextLeast}), otherwise one top-up cannot clear it.`,
      });
    }

    user.autoCardPay = {
      status: status !== undefined ? status : user.autoCardPay.status,
      least: nextLeast,
      refillAmount: nextRefill,
    };

    await user.save();

    return res.send({ status: true, message: "Settings updated successfully" });
  } catch (error) {
    console.error("DB Error:", error.message);
    return res.send({ status: false, message: error.message });
  }
};

const handleVapiSmsBilling = async (req, res) => {
  try {
    const { message } = req.body;

    // 1. Only process if this is a tool call for sending SMS
    if (message.type === "tool-calls") {
      const smsTool = message.toolCalls.find(
        (tool) => tool.function.name === "send_sms",
      );

      if (smsTool) {
        // Find user via metadata passed from Vapi call
        // (Ensure you pass 'userId' in the assistant's customer metadata)
        const userId = message.call?.customer?.extension;
        const user = await userModel.findById(userId);

        if (!user) return res.status(404).send("User not found");

        // Tagging the sub-account is what puts this charge into the monthly
        // message cap and onto the agency's invoice; without it the spend was
        // invisible to both.
        const subaccountId = resolveSubaccountId(user, message.call?.assistantId);

        await billing.chargeWallet({
          user,
          amount: billing.SMS_PRICE,
          type: "SMS_CHARGE",
          kind: "sms",
          callId: smsTool.id,
          subaccountId: subaccountId || undefined,
          idempotencyKey: `sms:${smsTool.id}`,
        });

        await maybeAutoTopUp(user._id);

        return res.status(200).json({
          results: [
            { toolCallId: smsTool.id, result: "SMS processed and billed." },
          ],
        });
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Billing Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ─── Stripe Customer Portal Link ─────────────────────────────────────────────
const getStripePortalLink = async (req, res) => {
  try {
    const userId = req.user;
    const { flow } = req.query; // "payment_method_update" | "billing_address_update" | undefined

    console.log("🔄 getStripePortalLink → userId:", userId, "flow:", flow);

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    // Create Stripe customer if one doesn't exist yet
    if (!user.stripeCustomerId) {
      console.log("📋 Creating new Stripe customer for user:", userId);
      const customer = await stripe.customers.create({
        metadata: { userId: userId.toString() },
        email:    user.email,
      });
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    const returnUrl = `${process.env.FRONTEND_URL}/settings?tab=billing`;

    // Build session params
    const sessionParams = {
      customer:   user.stripeCustomerId,
      return_url: returnUrl,
    };

    // Only payment_method_update is a valid Stripe portal flow type
    // All other actions (billing info, invoices) are handled by the general portal
    if (flow === "payment_method_update") {
      sessionParams.flow_data = { type: "payment_method_update" };
    }

    const session = await stripe.billingPortal.sessions.create(sessionParams);

    console.log("✅ getStripePortalLink → portal URL created:", session.url);
    return res.status(200).json({ status: true, url: session.url });
  } catch (err) {
    console.error("❌ getStripePortalLink error:", err.message);
    return res.status(500).json({ status: false, message: err.message || "Failed to generate portal link" });
  }
};

module.exports = {
  callBillingWebhook,
  getLatestConnectedBalance,
  chargeCustomerCard,
  stripeWebhook,
  autoTopUpLowWalletUsers,
  paymentConfirmation,
  getTransactionHistory,
  getChargingDetails,
  updateAutoChargingSettings,
  getStripePortalLink,
};
