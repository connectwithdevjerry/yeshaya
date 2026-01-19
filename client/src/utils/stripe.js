import { loadStripe } from "@stripe/stripe-js";

export const getStripe = (accountId) => {
  return loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    accountId ? { stripeAccount: accountId } : undefined
  );
};