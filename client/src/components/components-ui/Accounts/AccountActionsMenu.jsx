// src/components/components-ui/Accounts/AccountActionsMenu.jsx
import React, { useRef, useEffect } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ import navigate

const MenuItem = ({ icon: Icon, text, onClick, isSeparator = false }) => {
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
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <Icon size={18} className="text-gray-500 mr-3" />
        {text}
      </button>
    </li>
  );
};

const AccountActionsMenu = ({
  isOpen,
  onClose,
  account,
  anchorRef,
  position,
}) => {
  const menuRef = useRef(null);
  const navigate = useNavigate(); // ✅ setup navigate

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

const handleAction = (action) => {
  console.log(`🟢 handleAction triggered for: ${action}`);
  console.log("📦 Account data:", account);

  if (action === "Open") {
    try {
      const params = new URLSearchParams({
        agencyid: account.companyId || "UNKNOWN_COMPANY",
        subaccount: account.id || "NO_ID",
        allow: "yes",
        myname: account.name || "NoName",
        myemail: account.email || "noemail@example.com",
      });

      const route = `/app?${params.toString()}`;
      console.log("➡️ Navigating to:", route);
      navigate(route);
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
        <MenuItem icon={Star} text="Add to Favorites" />
        <MenuItem
          icon={ExternalLink}
          text="Open account"
          onClick={() => handleAction("Open")}
        />

        <MenuItem icon={Pencil} text="Edit account" />
        <MenuItem icon={Scale} text="Manage limits" />
        <MenuItem icon={Eye} text="Edit permissions" />
        <MenuItem isSeparator />
        <MenuItem icon={UserPlus} text="Invite member" />
        <MenuItem icon={Users} text="Manage access" />
        <MenuItem icon={Lock} text="Lock account" />
        <MenuItem icon={Link} text="Connect GHL" />
        <MenuItem isSeparator />
        <MenuItem icon={Zap} text="Turn on rebilling" />
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

export default AccountActionsMenu;
