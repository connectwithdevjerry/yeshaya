// src/components/components-ui/Integration/Integrations.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CheckCircle2, XCircle, ArrowUpRight, Loader2, Zap,
  Unplug, AlertTriangle, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  connectGoHighLevel,
  connectStripe,
  getIntegrationStatus,
  disconnectGoHighLevel,
  disconnectOpenAI,
  disconnectStripe,
} from "../../../store/slices/integrationSlice";
import OpenAIModal from "./OpenAIConnectModal";
import toast from "react-hot-toast";

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

// ─── Disconnect Confirm Dialog ────────────────────────────────────────────────
const DisconnectDialog = ({ name, onConfirm, onCancel, isLoading }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900">Disconnect {name}?</h3>
            <p className="text-sm text-gray-500 mt-1">
              This will remove your {name} connection. You can reconnect at any time, but existing workflows may be affected.
            </p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-60 flex items-center gap-2"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Disconnecting…</>
            ) : (
              <><Unplug className="w-4 h-4" /> Disconnect</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ─── Integration Card ─────────────────────────────────────────────────────────
const IntegrationCard = ({
  integration, isConnected, isLoading, isDisconnecting,
  onConnect, onDisconnect,
}) => {
  const { name, description, logo, accent, bg } = integration;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${accent}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Logo + status badge */}
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

        {/* Buttons */}
        <div className="mt-4 flex flex-col gap-2">
          {/* Connect / Connected button */}
          <button
            onClick={onConnect}
            disabled={isConnected || isLoading || isDisconnecting}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
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

          {/* Disconnect button — only shows when connected */}
          {isConnected && (
            <motion.button
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onDisconnect}
              disabled={isDisconnecting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDisconnecting ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Disconnecting…</>
              ) : (
                <><Unplug className="w-3.5 h-3.5" /> Disconnect</>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const IntegrationsContent = () => {
  const dispatch = useDispatch();
  const { goHighLevel, stripe, openAI, loading } = useSelector(
    (state) => state.integrations || {}
  );

  const [isOpenAIModalOpen,   setIsOpenAIModalOpen]   = useState(false);
  const [disconnectTarget,    setDisconnectTarget]    = useState(null); // { key, name }
  const [disconnecting,       setDisconnecting]       = useState(false);

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
    ghl:    { isConnected: ghlConnected,    isLoading: !!goHighLevel?.loading, isDisconnecting: goHighLevel?.loading && !ghlConnected },
    openai: { isConnected: openAIConnected, isLoading: !!openAI?.loading,      isDisconnecting: openAI?.loading && !openAIConnected },
    stripe: { isConnected: stripeConnected, isLoading: !!stripe?.loading,      isDisconnecting: stripe?.loading && !stripeConnected },
  };

  const handleConnect = {
    ghl:    () => !ghlConnected    && dispatch(connectGoHighLevel()),
    openai: () => !openAIConnected && setIsOpenAIModalOpen(true),
    stripe: () => !stripeConnected && dispatch(connectStripe()),
  };

  const disconnectThunks = {
    ghl:    disconnectGoHighLevel,
    openai: disconnectOpenAI,
    stripe: disconnectStripe,
  };

  const handleDisconnectConfirm = async () => {
    if (!disconnectTarget) return;
    setDisconnecting(true);
    try {
      await dispatch(disconnectThunks[disconnectTarget.key]()).unwrap();
      toast.success(`${disconnectTarget.name} disconnected successfully.`);
      setDisconnectTarget(null);
      dispatch(getIntegrationStatus());
    } catch (err) {
      toast.error(err || `Failed to disconnect ${disconnectTarget.name}.`);
    } finally {
      setDisconnecting(false);
    }
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
              isDisconnecting={disconnectTarget?.key === integration.key && disconnecting}
              onConnect={handleConnect[integration.key]}
              onDisconnect={() => setDisconnectTarget({ key: integration.key, name: integration.name })}
            />
          </motion.div>
        ))}
      </div>

      {/* OpenAI connect modal */}
      <OpenAIModal
        isOpen={isOpenAIModalOpen}
        onClose={() => setIsOpenAIModalOpen(false)}
      />

      {/* Disconnect confirm dialog */}
      {disconnectTarget && (
        <DisconnectDialog
          name={disconnectTarget.name}
          onConfirm={handleDisconnectConfirm}
          onCancel={() => setDisconnectTarget(null)}
          isLoading={disconnecting}
        />
      )}
    </div>
  );
};

export default IntegrationsContent;
