import React, { useRef, useEffect, useState } from "react";
import {
  Star,
  ExternalLink,
  Pencil,
  Scale,
  Eye,
  UserPlus,
  Users,
  Lock,
  Link,
  Zap,
  Loader2,
  XCircle,
} from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { vapiConnect, deleteNumberFromVapi } from "../../../store/slices/numberSlice";

const MenuItem = ({ icon: Icon, text, onClick, isSeparator = false, disabled = false, loading = false, variant = "default" }) => {
  if (isSeparator) return <li className="my-1 border-t border-gray-200" />;

  return (
    <li>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          console.log("🔹 MenuItem clicked:", text);
          onClick?.(e);
        }}
        disabled={disabled || loading}
        className={`flex items-center w-full px-4 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          variant === "danger" 
            ? "text-red-700 hover:bg-red-50" 
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        {loading ? (
          <Loader2 size={18} className="text-gray-500 mr-3 animate-spin" />
        ) : (
          <Icon size={18} className={variant === "danger" ? "text-red-500 mr-3" : "text-gray-500 mr-3"} />
        )}
        {text}
      </button>
    </li>
  );
};

const NumbersActionsMenu = ({
  isOpen,
  onClose,
  account,
  anchorRef,
  position,
}) => {
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Get Vapi connection status from Redux
  const { vapiStatuses } = useSelector((state) => state.numbers);
  const vapiInfo = vapiStatuses[account?.id]; // account.id is the phoneSid
  const isConnectedToVapi = vapiInfo?.status === "active";

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, anchorRef]);

  if (!isOpen || !account || !position) return null;

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
          alert("Missing required information to connect to Vapi");
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

        console.log("✅ Successfully connected to Vapi:", result);
        
        alert("Successfully connected to Vapi!");
        onClose();
      } catch (error) {
        console.error("❌ Failed to connect to Vapi:", error);
        console.error("❌ Error details:", JSON.stringify(error, null, 2));
        
        // Extract meaningful error message
        const errorMessage = typeof error === 'string' 
          ? error 
          : error?.message || error?.error || "Unknown error occurred";
        
        alert(`Failed to connect to Vapi: ${errorMessage}`);
      } finally {
        setIsConnecting(false);
      }
      return;
    }

    if (action === "DisconnectVapi") {
      try {
        const confirmDisconnect = window.confirm(
          `Are you sure you want to disconnect ${account.phoneNumber} from Vapi?`
        );

        if (!confirmDisconnect) return;

        setIsDisconnecting(true);

        if (!vapiInfo || !vapiInfo.vapiPhoneNumId) {
          alert("No Vapi connection found for this number");
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

        console.log("✅ Successfully disconnected from Vapi");
        alert("Successfully disconnected from Vapi!");
        onClose();
      } catch (error) {
        console.error("❌ Failed to disconnect from Vapi:", error);
        
        const errorMessage = typeof error === 'string' 
          ? error 
          : error?.message || error?.error || "Unknown error occurred";
        
        alert(`Failed to disconnect from Vapi: ${errorMessage}`);
      } finally {
        setIsDisconnecting(false);
      }
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

  return (
    <div
      ref={menuRef}
      className="fixed w-60 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden py-1"
      style={{ top: position.top, left: position.left }}
    >
      <ul className="divide-y divide-gray-100">
        <MenuItem icon={Star} text="Rename" onClick={onClose} />
        
        {/* Conditionally show Connect or Disconnect based on Vapi status */}
        {isConnectedToVapi ? (
          <MenuItem 
            icon={XCircle} 
            text="Disconnect from Vapi"
            onClick={() => handleAction("DisconnectVapi")}
            loading={isDisconnecting}
            disabled={isDisconnecting}
            variant="danger"
          />
        ) : (
          <MenuItem
            icon={ExternalLink}
            text="Connect to Vapi"
            onClick={() => handleAction("ConnectVapi")}
            loading={isConnecting}
            disabled={isConnecting}
          />
        )}
        
        <MenuItem icon={Pencil} text="Edit account" onClick={onClose} />
        <MenuItem icon={Scale} text="Manage limits" onClick={onClose} />
        <MenuItem icon={Eye} text="Edit permissions" onClick={onClose} />
      </ul>
      <div className="pt-2 px-4 text-xs text-gray-500 border-t border-gray-100">
        <p className="font-semibold truncate">
          {account.name || "Unnamed Account"}
        </p>
        <p>Last edited: 11/05/25</p>
        {isConnectedToVapi && (
          <p className="text-green-600 font-medium mt-1">
            ✓ Connected to Vapi
          </p>
        )}
      </div>
    </div>
  );
};

export default NumbersActionsMenu;