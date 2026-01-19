const axios = require("axios");
const userModel = require("../model/user.model");
require("dotenv").config();

// billing flow:
// 1. take money from user's card to his platform account
// 2. remove what he owes from his platform account to my own account (done)
// 3. his usage is charged from my own account which I must have connected to vapi and twilio (done)

// run this after every logins, after a
const processDailyUsageBilling = async (req, res) => {
  const { userId, assistantIds, phoneNumbers } = req.body;
  const vapiToken = process.env.VAPI_TOKEN;

  try {
    let totalUsageCost = 0;

    // --- VAPI USAGE ---
    const vapiResponses = await Promise.all(
      assistantIds.map((id) =>
        axios.get(`https://api.vapi.ai/call`, {
          params: {
            assistantId: id,
            createdAtGe: new Date(
              Date.now() - 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          headers: { Authorization: `Bearer ${vapiToken}` },
        })
      )
    );

    vapiResponses.forEach((r) =>
      r.data.forEach((call) => (totalUsageCost += call.cost || 0))
    );

    // --- TWILIO USAGE ---
    const twilioResponses = await Promise.all(
      phoneNumbers.map((num) =>
        axios.get(
          `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_SID}/Calls.json`,
          {
            params: {
              To: num,
              StartTimeGe: new Date(
                Date.now() - 24 * 60 * 60 * 1000
              ).toISOString(),
            },
            auth: {
              username: process.env.TWILIO_SID,
              password: process.env.TWILIO_AUTH_TOKEN,
            },
          }
        )
      )
    );

    twilioResponses.forEach((r) =>
      r.data.calls.forEach(
        (c) => (totalUsageCost += Math.abs(parseFloat(c.price || 0)))
      )
    );

    if (totalUsageCost <= 0) {
      return res.send({ status: true, message: "No usage to bill" });
    }

    const usageCents = Math.round(totalUsageCost * 100);

    // --- FETCH USER ---
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).send({ status: false, message: "User not found" });
    }

    if (user.walletBalance < usageCents) {
      // HARD STOP
      // Disable assistants / numbers here
      return res.status(402).send({
        status: false,
        message: "Insufficient wallet balance",
      });
    }

    // --- DEDUCT FROM WALLET ---
    user.walletBalance -= usageCents;
    user.dateUpdated = new Date();
    await user.save();

    res.send({
      status: true,
      billedAmountUSD: totalUsageCost.toFixed(4),
      deductedCents: usageCents,
      newWalletBalanceUSD: (user.walletBalance / 100).toFixed(2),
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

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
  const userId = req.user;
  const { amount } = req.body;

  try {
    // 1️ Fetch user
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).send({
        status: false,
        message: "User not found",
      });
    }

    // 2️ Create Stripe Customer if not exists
    if (!user.stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        phone: user.phoneNumber || undefined,
        metadata: { userId: user._id.toString() },
      });

      user.stripeCustomerId = stripeCustomer.id;
      await user.save();
    }

    // 3️ Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: "usd",
      customer: user.stripeCustomerId,
      // ON-SESSION charge; user must provide card via frontend
      setup_future_usage: "off_session", // optional: save for future charges
      metadata: {
        userId: userId.toString(),
        type: "USAGE_CHARGE",
      },
    });

    // 4️⃣ Return client_secret to frontend
    res.send({
      status: true,
      clientSecret: paymentIntent.client_secret,
      message: "Stripe Customer ready, collect card on frontend",
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
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
      const amountCents = paymentIntent.amount; // already in cents

      const u = await userModel.findById(userId);

      // 1. Update wallet balance
      const user = await userModel.findByIdAndUpdate(
        userId,
        {
          $inc: { walletBalance: u.walletBalance + amountCents },
          $set: { dateUpdated: new Date() },
        },
        { new: true }
      );

      // 2. Log transaction (strongly recommended)
      await Payment.create({
        userId,
        stripePaymentIntentId: paymentIntent.id,
        amountCents,
        type: "CREDIT",
        source: "STRIPE",
        status: "SUCCESS",
        createdAt: new Date(),
      });

      console.log(`Wallet credited: +${amountCents} cents for user ${userId}`);
    }
  }

  // PAYMENT FAILED
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    const { userId } = paymentIntent.metadata || {};

    console.error("Payment failed for user:", userId);

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
    autoCardCharging: true,
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
          }
        );
        console.log("Call terminated successfully due to low balance.");
      } catch (terminateErr) {
        // If it's a 404, the call already ended naturally
        if (terminateErr.response?.status !== 404) {
          console.error(
            "Terminate Error:",
            terminateErr.response?.data || terminateErr.message
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
      (e) => e.callId === call.id && e.type === type
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

module.exports = {
  callBillingWebhook,
  getLatestConnectedBalance,
  chargeCustomerCard,
  stripeWebhook,
  autoTopUpLowWalletUsers,
};
