const axios = require("axios");
const userModel = require("../model/user.model");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
require("dotenv").config();

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
  const user = await userModel.findById(req.user);
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
    const paymentIntent = await stripe.paymentIntents.create(
      {
        // payment_method_types: ["card"],
        amount: amount * 100, // in cents ($10.00 for 1000 cents)
        currency: "usd",
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

    console.log({ paymentIntent });

    const stripeCustomerId = paymentIntent.customer;

    // Only credit wallet for intended charges
    if (userId && type === "USAGE_CHARGE") {
      const amountUsd = paymentIntent.amount / 100; // already in cents

      const user = await userModel.findById(userId);

      user.stripeCustomerId = stripeCustomerId;

      // 1. Update wallet balance
      user.walletBalance += amountUsd; // convert to dollars

      // 2. Log transaction (strongly recommended)

      user.billingEvents.push({
        callId: paymentIntent.id,
        type: "WALLET_TOPUP",
        amount: amountUsd,
      });

      await user.save();

      console.log(`Wallet credited: +${amountUsd} USD for user ${userId}`);
    }
  }

  // PAYMENT FAILED
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    const { userId } = paymentIntent.metadata || {};

    console.error("Payment failed for user:", userId);

    user.billingEvents.push({
      callId: paymentIntent.id,
      type: "WALLET_TOPUP_FAILED",
      amount: amountUsd,
    });

    // Optional:
    // - notify user
    // - pause services
    // - retry logic
  }

  res.json({ received: true });
};

// Automatic Wallet Top-Up for Low Balances
const autoTopUpLowWalletUsers = async () => {
  const WALLET_THRESHOLD_CENTS = 500; // $5
  const AUTO_TOPUP_AMOUNT_CENTS = 2000; // $20 auto top-up

  // 1️ Find users with low balance
  const users = await userModel.find({
    walletBalance: { $lt: WALLET_THRESHOLD_CENTS },
    stripeCustomerId: { $exists: true, $ne: null },
    isActive: true,
    "autoCardPay.status": true,
  });

  for (const user of users) {
    try {
      // 2️ Check for saved card
      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: "card",
      });

      if (!paymentMethods.data.length) {
        console.warn(`No saved card for user ${user._id}`);
        continue;
      }

      const paymentMethod = paymentMethods.data[0];

      // 3️ Charge card (OFF-SESSION)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: AUTO_TOPUP_AMOUNT_CENTS,
        currency: "usd",
        customer: user.stripeCustomerId,
        payment_method: paymentMethod.id,
        off_session: true,
        confirm: true,
        description: "Automatic wallet top-up",
        metadata: {
          userId: user._id.toString(),
          type: "AUTO_TOPUP",
        },
      });

      // 4️ Credit wallet
      await userModel.findByIdAndUpdate(user._id, {
        $inc: { walletBalance: AUTO_TOPUP_AMOUNT_CENTS },
        $set: { dateUpdated: new Date() },
      });

      // 5️ Log payment
      await Payment.create({
        userId: user._id,
        stripePaymentIntentId: paymentIntent.id,
        amountCents: AUTO_TOPUP_AMOUNT_CENTS,
        status: "SUCCESS",
        type: "CREDIT",
        source: "AUTO_TOPUP",
        createdAt: new Date(),
      });

      console.log(`Auto-topup success for user ${user._id}`);
    } catch (error) {
      // Very important: handle auth errors
      if (error.code === "authentication_required") {
        console.error(`Card requires authentication for user ${user._id}`);

        // Optional: notify user, disable auto-topup, send email
        continue;
      }

      console.error(`Auto-topup failed for user ${user._id}:`, error.message);
    }
  }
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

    const balanceTooLow = user.walletBalance <= 0;

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

    const typeStatus = [
      "call.ended",
      "call.analysis.completed",
      "end-of-call-report",
    ];

    if (!typeStatus.includes(type)) {
      console.log(`Call ${call.id} is currently ${call.status}`);
      return res.sendStatus(200);
    }

    // ---- IDMPOTENCY CHECK ----
    const alreadyProcessed = user.billingEvents?.some(
      (e) => e.callId === call.id && e.type === type,
    );

    if (alreadyProcessed) {
      return res.sendStatus(200);
    }

    let amountToDeduct = 0;

    if (type === "end-of-call-report") {
      amountToDeduct = req.body.message?.cost || 0;
    }

    // ---- CALL ENDED (BASE COST) ----
    if (type === "call.ended") {
      amountToDeduct = call.cost?.total || 0;
    }

    // ---- ANALYSIS COMPLETED (POST-CALL COST) ----
    if (type === "call.analysis.completed") {
      amountToDeduct = call.analysis?.cost || 0;
    }

    // ---- DEDUCT WALLET ----
    user.walletBalance -= amountToDeduct;

    user.billingEvents.push({
      callId: call.id,
      type,
      amount: amountToDeduct,
    });

    user.dateUpdated = new Date();
    await user.save();

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
    return res.send({ status: true, data: user.billingEvents || [] });
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

module.exports = {
  callBillingWebhook,
  getLatestConnectedBalance,
  chargeCustomerCard,
  stripeWebhook,
  autoTopUpLowWalletUsers,
  paymentConfirmation,
  getTransactionHistory,
  getChargingDetails,
};
