// src/components/components-ui/Integration/Integrations.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle2, XCircle, ArrowUpRight, Loader2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import {
  connectGoHighLevel,
  connectStripe,
  getIntegrationStatus,
} from "../../../store/slices/integrationSlice";
import OpenAIModal from "./OpenAIConnectModal";

const INTEGRATIONS = [
  {
    key:         "ghl",
    name:        "GoHighLevel",
    description: "Import sub-accounts, manage connections and automate workflows.",
    logo:        "https://canny-assets.io/icons/5b918f2630865c174eaa9483fdedac22.png",
    accent:      "from-orange-400 to-amber-500",
    bg:          "bg-orange-50",
  },
  {
    key:         "openai",
    name:        "OpenAI",
    description: "Bring your own API key to power assistants and agent frameworks.",
    logo:        "https://cdn.brandfetch.io/idR3duQxYl/w/400/h/400/theme/dark/icon.jpeg",
    accent:      "from-gray-700 to-gray-900",
    bg:          "bg-gray-50",
  },
  {
    key:         "stripe",
    name:        "Stripe",
    description: "Re-bill or resell AI voice minutes using your own Stripe account.",
    logo:        "https://freelogopng.com/images/all_img/1685814539stripe-icon-png.png",
    accent:      "from-violet-500 to-indigo-600",
    bg:          "bg-violet-50",
  },
];

const IntegrationCard = ({ integration, isConnected, isLoading, onClick }) => {
  const { name, description, logo, accent, bg } = integration;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${accent}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Logo + status */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 border border-gray-100`}>
            <img src={logo} alt={name} className="w-7 h-7 object-contain rounded" />
          </div>

          {isConnected ? (
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 font-semibold">
              <XCircle className="w-3 h-3" /> Not connected
            </span>
          )}
        </div>

        {/* Name + description */}
        <h3 className="text-sm font-bold text-gray-900 mb-1">{name}</h3>
        <p className="text-xs text-gray-500 leading-relaxed flex-1">{description}</p>

        {/* Action button */}
        <button
          onClick={onClick}
          disabled={isConnected || isLoading}
          className={`mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
            ${isConnected
              ? "bg-gray-50 text-gray-400 border border-gray-100 cursor-default"
              : `bg-gradient-to-r ${accent} text-white shadow-sm hover:brightness-110 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed`
            }`}
        >
          {isLoading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Connecting…</>
          ) : isConnected ? (
            <><CheckCircle2 className="w-3.5 h-3.5" /> Connected</>
          ) : (
            <><Zap className="w-3.5 h-3.5" /> Connect <ArrowUpRight className="w-3.5 h-3.5" /></>
          )}
        </button>
      </div>
    </motion.div>
  );
};

const IntegrationsContent = () => {
  const dispatch = useDispatch();
  const { goHighLevel, stripe, openAI, loading } = useSelector(
    (state) => state.integrations || {}
  );

  const [isOpenAIModalOpen, setIsOpenAIModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getIntegrationStatus());
  }, [dispatch]);

  const compareDates = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate).getTime() > Date.now();
  };

  const ghlConnected    = compareDates(goHighLevel?.expiryDate);
  const openAIConnected = openAI?.message === "API Key is valid.";
  const stripeConnected = !!stripe?.presence;

  const statusMap = {
    ghl:    { isConnected: ghlConnected,    isLoading: !!goHighLevel?.loading },
    openai: { isConnected: openAIConnected, isLoading: !!openAI?.loading      },
    stripe: { isConnected: stripeConnected, isLoading: !!stripe?.loading      },
  };

  const handleClick = {
    ghl:    () => !ghlConnected    && dispatch(connectGoHighLevel()),
    openai: () => !openAIConnected && setIsOpenAIModalOpen(true),
    stripe: () => !stripeConnected && dispatch(connectStripe()),
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Connected Apps</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {[ghlConnected, openAIConnected, stripeConnected].filter(Boolean).length} of {INTEGRATIONS.length} integrations active
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Refreshing…
          </div>
        )}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {INTEGRATIONS.map((integration, idx) => (
          <motion.div
            key={integration.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.06 }}
          >
            <IntegrationCard
              integration={integration}
              isConnected={statusMap[integration.key].isConnected}
              isLoading={statusMap[integration.key].isLoading}
              onClick={handleClick[integration.key]}
            />
          </motion.div>
        ))}
      </div>

      <OpenAIModal
        isOpen={isOpenAIModalOpen}
        onClose={() => setIsOpenAIModalOpen(false)}
      />
    </div>
  );
};

export default IntegrationsContent;
