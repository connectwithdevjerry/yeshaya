// Automatic wallet top-up.
//
// This used to be driven by a MongoDB change stream opened in index.js. The
// server runs on Vercel's serverless runtime, where nothing holds a long-lived
// change stream open, so on production that listener was not reliably firing
// and wallets could run to zero with no top-up and no warning.
//
// It is now called directly after every debit, which works the same in a
// long-running process and in a serverless function.

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const userModel = require("../model/user.model");
const billing = require("./billing");
const { createNotification } = require("../controller/notification.controller");

// A top-up must always clear the threshold. If refillAmount is smaller than the
// gap to `least`, topping up by refillAmount alone leaves the balance still
// below it, and the next debit triggers another charge — the customer's card is
// hit repeatedly to climb out. Charge whichever is larger.
const amountToClear = ({ walletBalance, least, refillAmount }) => {
  const refill = Number(refillAmount) || 10;
  const threshold = Number(least) || 0;
  const gap = threshold - Number(walletBalance || 0);
  return Math.max(refill, Math.ceil(gap > 0 ? gap : 0));
};

// Top the wallet up if it has fallen below the user's threshold.
//
// Best-effort by design: never throws into a billing path — a failed top-up
// must not also fail the charge that triggered it.
const maybeAutoTopUp = async (userId) => {
  try {
    const user = await userModel
      .findById(userId)
      .select("walletBalance autoCardPay stripeCustomerId isActive");
    if (!user) return { toppedUp: false, reason: "user-not-found" };

    if (!user.isActive || !user.autoCardPay?.status) {
      return { toppedUp: false, reason: "auto-pay-disabled" };
    }
    if (user.walletBalance >= user.autoCardPay.least) {
      return { toppedUp: false, reason: "above-threshold" };
    }
    if (!user.stripeCustomerId) {
      return { toppedUp: false, reason: "no-stripe-customer" };
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    });
    if (!paymentMethods.data.length) {
      await createNotification({
        userId,
        type: "low_balance",
        title: "Low Wallet Balance — No Card On File",
        message: `Your balance is $${user.walletBalance.toFixed(2)} and auto top-up could not run because no card is saved. Add a card to avoid interruption.`,
        metadata: { walletBalance: user.walletBalance },
      });
      return { toppedUp: false, reason: "no-card" };
    }

    const amountToCharge = amountToClear({
      walletBalance: user.walletBalance,
      least: user.autoCardPay.least,
      refillAmount: user.autoCardPay.refillAmount,
    });

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(amountToCharge * 100),
        currency: "usd",
        customer: user.stripeCustomerId,
        payment_method: paymentMethods.data[0].id,
        off_session: true,
        confirm: true,
        description: "Auto-deduction for wallet balance",
        metadata: { userId: userId.toString(), type: "AUTO_DEDUCT" },
      },
      { stripeAccount: process.env.STRIPE_PLATFORM_ACCOUNT_ID },
    );

    if (paymentIntent.status !== "succeeded") {
      console.warn(`Auto-charge not completed (${paymentIntent.status}) for ${userId}`);
      return { toppedUp: false, reason: paymentIntent.status, paymentIntentId: paymentIntent.id };
    }

    const result = await billing.creditWallet({
      userId,
      amount: amountToCharge,
      type: "AUTO_WALLET_TOPUP",
      callId: paymentIntent.id,
    });

    if (result.credited) {
      await createNotification({
        userId,
        type: "payment_received",
        title: "Wallet Auto Top-Up",
        message: `$${amountToCharge.toFixed(2)} was charged to your saved card. New balance: $${(result.balance ?? 0).toFixed(2)}.`,
        metadata: { amount: amountToCharge, paymentIntentId: paymentIntent.id },
      });
    }

    return { toppedUp: result.credited, amount: amountToCharge, paymentIntentId: paymentIntent.id };
  } catch (err) {
    if (err.code === "authentication_required") {
      console.error(`Card requires authentication for user ${userId}`);
      await createNotification({
        userId,
        type: "low_balance",
        title: "Auto Top-Up Failed",
        message: "Your card needs authentication before it can be charged. Please update your payment method.",
        metadata: {},
      }).catch(() => {});
    } else {
      console.error(`Auto-charge failed for user ${userId}:`, err.message);
    }
    return { toppedUp: false, reason: err.message };
  }
};

module.exports = { maybeAutoTopUp, amountToClear };
