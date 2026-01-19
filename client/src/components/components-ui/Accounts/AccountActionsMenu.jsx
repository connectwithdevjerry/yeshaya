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
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { authorizeGoHighLevel } from "../../../store/slices/integrationSlice";

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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();

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
            "/blog",
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
          route: targetRoute, // ✅ Include the route as a parameter
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

    if (action === "AuthorizeGHL") {
      dispatch(
        authorizeGoHighLevel({
          accountId: account.id, // This is your subaccountId
          accountType: "Company",
          installationType: "directInstallation",
        }),
      );
      onClose();
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
        <MenuItem icon={Star} text="Add to Favorites" onClick={onClose} />
        <MenuItem
          icon={ExternalLink}
          text="Open account"
          onClick={() => handleAction("Open")}
        />
        <MenuItem
          icon={Link}
          text="Authorize GHL"
          onClick={() => handleAction("AuthorizeGHL")}
        />
        <MenuItem icon={Pencil} text="Edit account" onClick={onClose} />
        <MenuItem icon={Scale} text="Manage limits" onClick={onClose} />
        <MenuItem icon={Eye} text="Edit permissions" onClick={onClose} />
        <MenuItem isSeparator />
        <MenuItem icon={UserPlus} text="Invite member" onClick={onClose} />
        <MenuItem icon={Users} text="Manage access" onClick={onClose} />
        <MenuItem icon={Lock} text="Lock account" onClick={onClose} />
        <MenuItem icon={Link} text="Connect GHL" onClick={onClose} />
        <MenuItem isSeparator />
        <MenuItem icon={Zap} text="Turn on rebilling" onClick={onClose} />
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
