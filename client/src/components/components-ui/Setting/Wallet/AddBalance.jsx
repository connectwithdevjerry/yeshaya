// src/components/TopUpBalanceModal.jsx
import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { chargeConnectedAccount } from "../../../../store/slices/integrationSlice";
import { fetchWalletBalance } from "../../../../store/slices/assistantsSlice";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getStripe } from "../../../../utils/stripe";

const CheckoutForm = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isPaying, setIsPaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsPaying(true);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
      redirect: "if_required",
    });

    if (result.error) {
      console.error("❌ Stripe Payment Error:", result.error);
      toast.error(result.error.message);
      setIsPaying(false);
    } else if (
      result.paymentIntent &&
      result.paymentIntent.status === "succeeded"
    ) {
      // THIS IS YOUR SUCCESS LOG
      console.log("✅ Stripe PaymentIntent Response:", result.paymentIntent);

      toast.success("Payment successful!");
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <PaymentElement onReady={() => setIsReady(true)} />
      <button
        type="submit"
        disabled={!stripe || isPaying || !isReady}
        className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-md disabled:opacity-50"
      >
        {!isReady
          ? "Loading Payment..."
          : isPaying
            ? "Processing..."
            : "Confirm Payment"}
      </button>
    </form>
  );
};

const TopUpBalanceModal = ({ isOpen, onClose, currentBalance }) => {
  const dispatch = useDispatch();
  const [clientSecret, setClientSecret] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({
    secret: null,
    accountId: null,
  });

  const { isCharging } = useSelector((state) => state.assistants);

  const initialBalance = currentBalance || 0;
  const minRefillAmount = 1;
  const maxRefillAmount = 500;

  const [refillAmount, setRefillAmount] = useState(10.0);
  if (!isOpen) return null;

  const totalBalance = initialBalance + refillAmount;

  const handleRefillChange = (e) => {
    const value = parseFloat(e.target.value);
    setRefillAmount(value);
  };

  const handleAddBalance = async () => {
    try {
      const response = await dispatch(
        chargeConnectedAccount(refillAmount),
      ).unwrap();

      console.log("DEBUG: Backend Response Data:", {
        clientSecret: response.clientSecret,
        accountId: response.accountId,
      });

      setPaymentInfo({
        secret: response.clientSecret,
        accountId: response.accountId,
      });

      const promise = getStripe(response.accountId);

      // DEBUG LOG 2: Check the promise initialization
      console.log(
        "DEBUG: Initializing Stripe with Account ID:",
        response.accountId,
      );

      setStripePromise(promise);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white w-full rounded-lg shadow-2xl max-w-md mx-4 p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Top up balance
          </h3>
          <button
            onClick={onClose}
            disabled={isCharging}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center text-sm font-medium text-gray-700 mb-1">
            <span>Current balance</span>
            <span>{formatCurrency(initialBalance)}</span>
          </div>

          <div className="flex justify-between items-center mb-4">
            <p className="text-3xl font-bold text-gray-800">
              {formatCurrency(refillAmount)}
            </p>
            <p className="text-gray-500 text-sm">
              {formatCurrency(maxRefillAmount)} Max
            </p>
          </div>

          <input
            type="range"
            min={minRefillAmount}
            max={maxRefillAmount}
            step="1"
            value={refillAmount}
            onChange={handleRefillChange}
            disabled={isCharging}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg accent-indigo-600 disabled:opacity-50"
          />
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6 text-gray-800">
          <div className="flex justify-between py-1">
            <span>Current Balance</span>
            <span className="font-semibold">
              {formatCurrency(initialBalance)}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-gray-200 mb-2">
            <span>Top-up Amount</span>
            <span className="font-semibold text-green-600">
              + {formatCurrency(refillAmount)}
            </span>
          </div>

          <div className="flex justify-between pt-2 text-lg font-bold">
            <span>New Total</span>
            <span>{formatCurrency(totalBalance)}</span>
          </div>
        </div>

        <div className="flex justify-center w-full">
          {paymentInfo.secret && stripePromise ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: paymentInfo.secret,
              }}
              key={paymentInfo.secret}
            >
              <CheckoutForm
                onSuccess={() => {
                  dispatch(fetchWalletBalance());
                  onClose();
                }}
              />
            </Elements>
          ) : (
            <button
              onClick={handleAddBalance}
              disabled={isCharging}
              className="w-full py-3 bg-indigo-600 text-white rounded-md transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {isCharging ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Creating payment...
                </span>
              ) : (
                `Add ${formatCurrency(refillAmount)}`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopUpBalanceModal;
