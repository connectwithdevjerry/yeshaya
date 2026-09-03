// src/components/components-ui/Accounts/AccountActionsMenu.jsx
import React, { useRef, useEffect } from "react";
import {
  Star, ExternalLink, Pencil, Link, Zap, Archive,
} from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  authorizeGoHighLevel,
  toggleSubAccountFavorite,
  toggleSubAccountArchive,
} from "../../../store/slices/integrationSlice";
import toast from "react-hot-toast";

const MenuItem = ({ icon: Icon, text, onClick, isSeparator = false, active = false, danger = false }) => {
  if (isSeparator) return <li className="my-1 border-t border-gray-100" />;
  return (
    <li>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
        className={`flex items-center w-full px-4 py-2.5 text-sm transition-colors text-left gap-3
          ${danger  ? "text-red-500 hover:bg-red-50"
          : active  ? "text-indigo-600 bg-indigo-50/60 hover:bg-indigo-50"
          : "text-gray-700 hover:bg-gray-50"}`}
      >
        <Icon size={15} className={danger ? "text-red-400" : active ? "text-indigo-500" : "text-gray-400"} />
        <span className="font-medium">{text}</span>
        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />}
      </button>
    </li>
  );
};

const AccountActionsMenu = ({ isOpen, onClose, account, anchorRef, position, onEdit }) => {
  const menuRef  = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        anchorRef.current && !anchorRef.current.contains(e.target)
      ) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, anchorRef]);

  if (!isOpen || !account || !position) return null;

  const isFavorite = !!account.isFavorite;
  const isArchived = !!account.isArchived;

  const handleOpen = () => {
    try {
      let targetRoute = "/assistants";
      if (location.pathname === "/app") {
        targetRoute = searchParams.get("route") || "/assistants";
      } else if (["/inbox","/call","/contacts","/knowledge","/assistants","/activetags","/numbers","/pools","/widgets","/helps","/ghl_settings","/blog"].includes(location.pathname)) {
        targetRoute = location.pathname;
      }
      const params = new URLSearchParams({
        agencyid:   account.companyId || "UNKNOWN",
        subaccount: account.id || "NO_ID",
        allow:      "yes",
        myname:     account.name  || "NoName",
        myemail:    account.email || "noemail@example.com",
        route:      targetRoute,
      });
      window.open(`/app?${params.toString()}`, "_blank");
      onClose();
    } catch (err) {
      console.error("Navigation error:", err);
    }
  };

  const handleAuthorize = () => {
    dispatch(authorizeGoHighLevel({ accountId: account.id, accountType: "Company", installationType: "directInstallation" }));
    onClose();
  };

  const handleFavorite = async () => {
    try {
      await dispatch(toggleSubAccountFavorite(account.id)).unwrap();
      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
      onClose();
    } catch (err) {
      toast.error("Failed to update favorite");
    }
  };

  const handleArchive = async () => {
    try {
      await dispatch(toggleSubAccountArchive(account.id)).unwrap();
      toast.success(isArchived ? "Account unarchived" : "Account archived");
      onClose();
    } catch (err) {
      toast.error("Failed to update archive status");
    }
  };

  const handleEdit = () => {
    onClose();
    onEdit?.(account);
  };

  const handleRebilling = () => {
    navigate("/rebilling");
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden py-1.5"
      style={{ top: position.top, left: position.left }}
    >
      {/* Account label */}
      <div className="px-4 py-2.5 border-b border-gray-50 mb-1">
        <p className="text-xs font-bold text-gray-800 truncate">{account.customName || account.name || "Unnamed"}</p>
        <p className="text-[10px] text-gray-400 mt-0.5 font-mono truncate">{account.id?.slice(0, 16)}…</p>
      </div>

      <ul>
        <MenuItem icon={Star}         text={isFavorite ? "Remove from Favorites" : "Add to Favorites"} active={isFavorite} onClick={handleFavorite} />
        <MenuItem icon={ExternalLink} text="Open account"   onClick={handleOpen}      />
        <MenuItem icon={Link}         text="Authorize GHL"  onClick={handleAuthorize} />
        <MenuItem icon={Pencil}       text="Edit account"   onClick={handleEdit}      />
        <MenuItem isSeparator />
        <MenuItem icon={Zap}          text="Go to Rebilling" onClick={handleRebilling} />
        <MenuItem icon={Archive}      text={isArchived ? "Unarchive account" : "Archive account"} active={isArchived} onClick={handleArchive} />
      </ul>
    </div>
  );
};

export default AccountActionsMenu;
