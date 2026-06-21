// src/components/components-ghl/Numbers/NumberActionsMenu.jsx
import React, { useRef, useEffect, useState } from "react";
import {
  Star, ExternalLink, Pencil, Scale, Eye,
  Loader2, XCircle, Wifi, WifiOff, Phone, Copy, Hash, Info, Bot,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { vapiConnect, deleteNumberFromVapi } from "../../../store/slices/numberSlice";
import toast from "react-hot-toast";
<<<<<<< HEAD
import ConfirmDeleteModal from "../ConfirmDeleteModal";
=======
>>>>>>> projects-ui

const MenuItem = ({ icon: Icon, label, onClick, disabled, loading, variant = "default" }) => (
  <motion.button
    whileHover={{ x: 2 }}
    type="button"
    onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
    disabled={disabled || loading}
    className={`flex items-center w-full gap-3 px-4 py-2.5 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-xl ${
      variant === "danger"
        ? "text-rose-600 hover:bg-rose-50"
        : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
    }`}
  >
    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
      variant === "danger" ? "bg-rose-100" : "bg-gray-100"
    }`}>
      {loading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
        : <Icon className={`w-3.5 h-3.5 ${variant === "danger" ? "text-rose-500" : "text-gray-500"}`} />
      }
    </div>
    <span className="font-medium">{label}</span>
  </motion.button>
);

const NumbersActionsMenu = ({ isOpen, onClose, account, anchorRef, position, onAction }) => {
  const menuRef       = useRef(null);
  const navigate      = useNavigate();
  const location      = useLocation();
  const [searchParams] = useSearchParams();
  const dispatch      = useDispatch();

  const [isConnecting,    setIsConnecting]    = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const { vapiStatuses }   = useSelector((s) => s.numbers || {});
  const vapiInfo           = vapiStatuses?.[account?.id];
  const isConnectedToVapi  = vapiInfo?.isConnected === true;
  const isChecking         = Boolean(vapiInfo?.checking);

  useEffect(() => {
<<<<<<< HEAD
    const handleClickOutside = (event) => {
      // Don't close meny if the confirmation modal is open
      if (showDisconnectModal) return;

=======
    const handleClickOutside = (e) => {
>>>>>>> projects-ui
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        anchorRef?.current && !anchorRef.current.contains(e.target)
      ) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, anchorRef, showDisconnectModal]);

  if (!isOpen || !account || !position) return null;

<<<<<<< HEAD
  const handleAction = async (action) => {
    console.log(`🟢 handleAction triggered for: ${action}`);
    console.log("📦 Account data:", account);

    if (action === "ConnectVapi") {
      try {
        setIsConnecting(true);
        
        // Validate required fields
        if (!account.companyId || !account.assistantId || !account.phoneNumber || !account.id) {
          console.error("❌ Missing required fields:", {
            companyId: account.companyId,
            assistantId: account.assistantId,
            phoneNumber: account.phoneNumber,
            id: account.id
          });
          toast.error("Missing required information to connect");
          setIsConnecting(false);
          return;
        }

        console.log("🚀 Attempting to connect to Vapi with:", {
          subaccountId: account.companyId,
          assistantId: account.assistantId,
          number: account.phoneNumber,
          phoneSid: account.id,
        });
        
        const result = await dispatch(
          vapiConnect({
            subaccountId: account.companyId,
            assistantId: account.assistantId,
            number: account.phoneNumber,
            phoneSid: account.id, // This is the Twilio SID
          })
        ).unwrap();

        console.log("✅ Successfully connected :", result);
        
        toast.success("Number Connected Successfully");
        onClose();
      } catch (error) {
        console.error("❌ Failed to connect to Vapi:", error);
        console.error("❌ Error details:", JSON.stringify(error, null, 2));
        
        // Extract meaningful error message
        const errorMessage = typeof error === 'string' 
          ? error 
          : error?.message || error?.error || "Unknown error occurred";
        
        toast.error(`Failed to connect: ${errorMessage}`);
      } finally {
        setIsConnecting(false);
      }
      return;
    }

    if (action === "DisconnectVapi") {
      setShowDisconnectModal(true);
      return;
    }

    if (action === "Open") {
      try {
        let targetRoute = "/assistants";

        if (location.pathname === "/app") {
          targetRoute = searchParams.get("route") || "/assistants";
        } else if (
          [
            "/inbox",
            "/call",
            "/contacts",
            "/knowledge",
            "/assistants",
            "/activetags",
            "/numbers",
            "/pools",
            "/widgets",
            "/helps",
            "/ghl_settings",
            '/blog'
          ].includes(location.pathname)
        ) {
          targetRoute = location.pathname;
        }

        const params = new URLSearchParams({
          agencyid: account.companyId || "UNKNOWN_COMPANY",
          subaccount: account.id || "NO_ID",
          allow: "yes",
          myname: account.name || "NoName",
          myemail: account.email || "noemail@example.com",
          route: targetRoute,
        });

        const url = `/app?${params.toString()}`;

        console.log("➡️ Navigating to:", url);

        onClose();

        setTimeout(() => {
          navigate(url);
        }, 0);

        return;
      } catch (err) {
        console.error("❌ Navigation error:", err);
      }
    }

    onClose();
  };

  const confirmDisconnectVapi = async () => {
    setShowDisconnectModal(false);
    try {
      setIsDisconnecting(true);

      if (!vapiInfo || !vapiInfo.vapiPhoneNumId) {
        toast.error("No connection found for this number");
        setIsDisconnecting(false);
        return;
      }

      console.log("🚀 Attempting to disconnect from Vapi with:", {
        phoneNum: account.phoneNumber,
        phoneSid: account.id,
      });

      await dispatch(
        deleteNumberFromVapi({
          phoneNum: account.phoneNumber,
          phoneSid: account.id,
        })
      ).unwrap();

      console.log("✅ Successfully disconnected");
      toast.success("Successfully disconnected");
      onClose();
    } catch (error) {
      console.error("❌ Failed to disconnect from Vapi:", error);
      
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || error?.error || "Unknown error occurred";
      
      toast.error(`Failed to disconnect: ${errorMessage}`);
=======
  const act = (sectionName) => { onAction?.(sectionName, account); onClose(); };
  const copy = (text, label) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${label} copied`))
      .catch(() => toast.error("Copy failed"));
    onClose();
  };

  const handleConnect = async () => {
    if (!account.companyId || !account.assistantId || !account.phoneNumber || !account.id) {
      toast.error("Missing required information to connect");
      return;
    }
    setIsConnecting(true);
    try {
      await dispatch(vapiConnect({
        subaccountId: account.companyId,
        assistantId:  account.assistantId,
        number:       account.phoneNumber,
        phoneSid:     account.id,
      })).unwrap();
      toast.success("Number connected successfully!");
      onClose();
    } catch (err) {
      const msg = typeof err === "string" ? err : err?.message || "Unknown error";
      toast.error(`Failed to connect: ${msg}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!vapiInfo?.vapiPhoneNumId) { toast.error("No Vapi connection found"); return; }
    setIsDisconnecting(true);
    try {
      await dispatch(deleteNumberFromVapi({ phoneNum: account.phoneNumber, phoneSid: account.id })).unwrap();
      toast.success("Disconnected successfully");
      onClose();
    } catch (err) {
      const msg = typeof err === "string" ? err : err?.message || "Unknown error";
      toast.error(`Failed to disconnect: ${msg}`);
>>>>>>> projects-ui
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
<<<<<<< HEAD
    <>
    <div
      ref={menuRef}
      className="fixed w-60 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden py-1"
      style={{ top: position.top, left: position.left }}
    >
      <ul className="divide-y divide-gray-100">
        <MenuItem icon={Star} text="Rename" onClick={onClose} />

        {/* Show Checking... if status is being determined */}
        {isChecking && (
          <li>
            <div className="flex items-center w-full px-4 py-2 text-sm text-gray-700">
              <Loader2 size={18} className="text-gray-500 mr-3 animate-spin" />
              Checking Vapi status...
=======
    <AnimatePresence>
      {isOpen && (
        <>
        {/* Click-catching backdrop — closes the menu on any outside click */}
        <div className="fixed inset-0 z-40" onClick={onClose} />
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ type: "spring", damping: 24, stiffness: 300 }}
          className="fixed w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden py-2"
          style={{ top: position.top, left: position.left }}
        >
          {/* Number info header */}
          <div className="px-4 py-3 border-b border-gray-100 mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                <Phone className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">{account.name || "Unnamed"}</p>
                <p className="text-[10px] font-mono text-gray-400 truncate">{account.phoneNumber}</p>
              </div>
>>>>>>> projects-ui
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {isConnectedToVapi ? (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                  <Wifi className="w-2.5 h-2.5" /> Connected
                </span>
              ) : isChecking ? (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" /> Checking…
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                  <WifiOff className="w-2.5 h-2.5" /> Not connected
                </span>
              )}
            </div>
          </div>

          <div className="px-2 space-y-0.5">
            <MenuItem icon={Star}   label="Rename"           onClick={() => act("rename")} />
            <MenuItem icon={Pencil} label="Edit Account"     onClick={() => act("account")} />
            <MenuItem icon={Scale}  label="Manage Limits"    onClick={() => act("limits")} />
            <MenuItem icon={Bot}    label="Change Assistant" onClick={() => act("assistant")} />

<<<<<<< HEAD
        <MenuItem icon={Pencil} text="Edit account" onClick={onClose} />
        <MenuItem icon={Scale} text="Manage limits" onClick={onClose} />
        <MenuItem icon={Eye} text="Edit permissions" onClick={onClose} />
      </ul>
      <div className="pt-2 px-4 text-xs text-gray-500 border-t border-gray-100">
        <p className="font-semibold truncate">
          {account.name || "Unnamed Account"}
        </p>
        <p>Last edited: 11/05/25</p>
        {/* Footer connection message based on isConnected boolean */}
        {isConnectedToVapi && (
          <p className="text-green-600 font-medium mt-1">
            ✓ Connect Number
          </p>
        )}
        {!isConnectedToVapi && !isChecking && (
          <p className="text-gray-500 mt-1">Not connected</p>
        )}
      </div>
    </div>
    <ConfirmDeleteModal
      isOpen={showDisconnectModal}
      onClose={() => setShowDisconnectModal(false)}
      onConfirm={confirmDisconnectVapi}
      title={`Disconnect ${account.phoneNumber}`}
    />
    </>
=======
            <div className="my-1 border-t border-gray-100" />

            <MenuItem icon={Info} label="View Details" onClick={() => act("details")} />
            <MenuItem icon={Copy} label="Copy Number"  onClick={() => copy(account.phoneNumber, "Number")} />
            <MenuItem icon={Hash} label="Copy SID"     onClick={() => copy(account.id, "SID")} />

            <div className="my-1 border-t border-gray-100" />

            {isChecking ? (
              <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400">
                <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>Checking status…</span>
              </div>
            ) : isConnectedToVapi ? (
              <MenuItem
                icon={XCircle}
                label="Disconnect"
                onClick={handleDisconnect}
                loading={isDisconnecting}
                disabled={isDisconnecting}
                variant="danger"
              />
            ) : (
              <MenuItem
                icon={ExternalLink}
                label="Connect"
                onClick={handleConnect}
                loading={isConnecting}
                disabled={isConnecting}
              />
            )}
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
>>>>>>> projects-ui
  );
};

export default NumbersActionsMenu;
