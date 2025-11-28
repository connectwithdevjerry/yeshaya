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
} from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { vapiConnect, getVapiConnectionStatus } from "../../../store/slices/numberSlice";

const MenuItem = ({ icon: Icon, text, onClick, isSeparator = false, disabled = false, loading = false }) => {
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
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 size={18} className="text-gray-500 mr-3 animate-spin" />
        ) : (
          <Icon size={18} className="text-gray-500 mr-3" />
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
        
        // After successful connection, check the status with the new vapiPhoneNumId
        if (result.newPhoneNumberId) {
          console.log("🔄 Checking Vapi connection status with ID:", result.newPhoneNumberId);
          
          try {
            await dispatch(
              getVapiConnectionStatus({
                vapiPhoneNumId: result.newPhoneNumberId,
                subaccountId: account.companyId,
                assistantId: account.assistantId,
                phoneSid: account.id,
                number: account.phoneNumber,
              })
            ).unwrap();
            
            console.log("✅ Status check completed");
          } catch (statusError) {
            console.warn("⚠️ Status check failed (but connection succeeded):", statusError);
          }
        }
        
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
        <MenuItem
          icon={ExternalLink}
          text="Connect to Vapi"
          onClick={() => handleAction("ConnectVapi")}
          loading={isConnecting}
          disabled={isConnecting}
        />
        <MenuItem icon={Pencil} text="Edit account" onClick={onClose} />
        <MenuItem icon={Scale} text="Manage limits" onClick={onClose} />
        <MenuItem icon={Eye} text="Edit permissions" onClick={onClose} />
      </ul>
      <div className="pt-2 px-4 text-xs text-gray-500 border-t border-gray-100">
        <p className="font-semibold truncate">
          {account.name || "Unnamed Account"}
        </p>
        <p>Last edited: 11/05/25</p>
      </div>
    </div>
  );
};

export default NumbersActionsMenu;