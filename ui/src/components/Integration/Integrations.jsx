import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronRight } from "lucide-react";
import Card from "../ui/Card";
import {
  connectGoHighLevel,
  connectStripe,
  connectOpenAI,
} from "../../store/slices/integrationSlice";

const IntegrationItem = ({
  name,
  description,
  image_url,
  isConnected,
  loading,
  onClick,
}) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="flex justify-between items-center w-full py-4 border-b last:border-b-0 text-left hover:bg-gray-50 transition disabled:opacity-50"
  >
    <div className="flex items-center">
      <img src={image_url} alt={name} className="w-[40px] mr-4" />
      <div>
        <div className="text-xl font-semibold text-gray-800">{name}</div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
    </div>
    <div className="flex items-center">
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full ${
          isConnected
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        {loading ? "Connecting..." : isConnected ? "Connected" : "Connect"}
      </span>
      <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
    </div>
  </button>
);

const IntegrationsContent = () => {
  const dispatch = useDispatch();
  const { goHighLevel, stripe, openAI } = useSelector(
    (state) => state.integrations || {}
  );

  return (
    <Card>
      <IntegrationItem
        name="GoHighLevel"
        image_url="https://canny-assets.io/icons/5b918f2630865c174eaa9483fdedac22.png"
        description="Connect GoHighLevel to import your sub-accounts, manage connections & more"
        isConnected={goHighLevel?.connected}
        loading={goHighLevel?.loading}
        onClick={() => dispatch(connectGoHighLevel())}
      />

      <IntegrationItem
        name="OpenAI"
        image_url="https://cdn.brandfetch.io/idR3duQxYl/w/400/h/400/theme/dark/icon.jpeg"
        description="Connect OpenAI to use our assistant / agent framework using your own keys"
        isConnected={openAI?.connected}
        loading={openAI?.loading}
        onClick={() => dispatch(connectOpenAI())}
      />

      <IntegrationItem
        name="Stripe"
        image_url="https://freelogopng.com/images/all_img/1685814539stripe-icon-png.png"
        description="Connect Stripe to re-bill or resell AI voice minutes using your own Stripe"
        isConnected={stripe?.connected}
        loading={stripe?.loading}
        onClick={() => dispatch(connectStripe())}
      />
    </Card>
  );
};

export default IntegrationsContent;
