// src/components/components-ghl/AssistantsBuilder/components/AssistantHeader.jsx
import React, { useState, useEffect } from "react";
import {
  Pencil,
  Save,
  FlaskConical,
  Users,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Copy,
  ArrowLeft,
  Rocket,
  CircleCheck,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { AIModelModal } from "./AiModelModal";
import { RenameAssistantModal } from "./RenameAssistantModal";
import IssuesModal from "./IssuesModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAssistantById } from "../../../../store/slices/assistantsSlice";
import { auditAssistant } from "../../../../utils/assistantAudit";
import { useCurrentAccount } from "../../../../hooks/useCurrentAccount";
import { LogsModal } from "./LogsModal";
import { ExperimentsDropdown } from "./ExperimentsDropdown";
import { CollabSessionDropdown } from "./CollabSessionDropdown";
import toast from "react-hot-toast";

const IconButton = ({ icon: Icon, tooltip, onClick, active }) => (
  <motion.button
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.94 }}
    onClick={onClick}
    className={`p-2 rounded-xl transition-all duration-150 ${
      active
        ? "bg-indigo-50 text-indigo-600"
        : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
    }`}
    title={tooltip}
    aria-label={tooltip}
  >
    <Icon className="w-4 h-4" />
  </motion.button>
);

const formatModelDisplay = (model) => {
  if (!model) return "GPT-4o";
  const modelName = model.model || "gpt-4o";
  const modelMap = {
    "gpt-4o": "GPT-4o",
    "gpt-4": "GPT-4",
    "gpt-3.5-turbo": "GPT-3.5 Turbo",
    "gpt-4-turbo": "GPT-4 Turbo",
    "claude-3-opus": "Claude 3 Opus",
    "claude-3-sonnet": "Claude 3 Sonnet",
    "claude-3-haiku": "Claude 3 Haiku",
  };
  return modelMap[modelName] || modelName.toUpperCase().replace(/-/g, " ");
};

const getModelIcon = (model) => {
  if (!model) return "https://cdn.brandfetch.io/idR3duQxYl/w/400/h/400/theme/dark/icon.jpeg";
  const provider = model.provider?.toLowerCase() || "";
  if (provider === "openai")    return "https://cdn.brandfetch.io/idR3duQxYl/w/400/h/400/theme/dark/icon.jpeg";
  if (provider === "anthropic") return "https://cdn.builtin.com/cdn-cgi/image/f=auto,fit=contain,w=200,h=200,q=100/sites/www.builtin.com/files/2022-09/3_50.jpg";
  if (provider === "google")    return "https://cdn-icons-png.flaticon.com/128/15465/15465679.png";
  return "https://cdn.brandfetch.io/idR3duQxYl/w/400/h/400/theme/dark/icon.jpeg";
};

export const AssistantHeader = ({ onSave, assistantId: propAssistantId }) => {
  const [isModelModalOpen,   setIsModelModalOpen]   = useState(false);
  const [isRenameModalOpen,  setIsRenameModalOpen]  = useState(false);
  const [isIssuesModalOpen,  setIsIssuesModalOpen]  = useState(false);
  const [isLogsModalOpen,    setIsLogsModalOpen]    = useState(false);
  const [isExperimentsOpen,  setIsExperimentsOpen]  = useState(false);
  const [isUsersOpen,        setIsUsersOpen]        = useState(false);
  const [saving,             setSaving]             = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const navigate     = useNavigate();
  const dispatch     = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const account      = useCurrentAccount();

  const { selectedAssistant, loading } = useSelector((s) => s.assistants);
  // Selected as primitives: an object literal from useSelector has a new
  // identity every call and would re-render on any store change.
  const calendarLinked  = useSelector((s) => s.assistants?.calendarLinked);
  const calendarMissing = useSelector((s) => s.assistants?.calendarMissing);
  const calendarRecon   = useSelector((s) => s.assistants?.calendarReconnectRequired);
  const calendarStatus =
    calendarLinked === null || calendarLinked === undefined
      ? null // not checked yet — the audit simply omits the booking row
      : { calendarLinked, calendarMissing, reconnectRequired: calendarRecon };
  const assistantId  = propAssistantId;
  const subaccountId = searchParams.get("subaccount") || account?.subaccount;

  useEffect(() => {
    if (assistantId && subaccountId) {
      dispatch(getAssistantById({ subaccountId, assistantId }))
        .unwrap()
        .catch((error) => console.error("❌ Failed to fetch assistant:", error));
    }
  }, [dispatch, subaccountId, assistantId]);

  const handleCopyId = () => {
    if (selectedAssistant?.id) {
      navigator.clipboard
        .writeText(selectedAssistant.id)
        .then(() => toast.success("Assistant ID copied!"))
        .catch(() => toast.error("Failed to copy ID"));
    }
  };

  const handleRefresh = async () => {
    if (!assistantId || !subaccountId) return;
    setRefreshing(true);
    try {
      await dispatch(getAssistantById({ subaccountId, assistantId })).unwrap();
      toast.success("Assistant reloaded");
    } catch {
      toast.error("Failed to reload assistant");
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenTestingLab = () => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", "Chat Lab");
    setSearchParams(params);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave?.();
      toast.success("Saved!");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleGoBack = () => {
    if (account) {
      const params = new URLSearchParams({
        agencyid:   account.agencyid,
        subaccount: account.subaccount,
        allow:      account.allow,
        myname:     account.myname,
        myemail:    account.myemail,
        route:      "/assistants",
      });
      navigate(`/app?${params.toString()}`);
    } else {
      navigate("/assistants");
    }
  };

  const { checks, issueCount } = auditAssistant(selectedAssistant, calendarStatus);
  const name         = selectedAssistant?.name || "New Blank Assistant";
  const model        = selectedAssistant?.model;
  const modelDisplay = formatModelDisplay(model);
  const modelIcon    = getModelIcon(model);
  const id           = selectedAssistant?.id || assistantId;

  return (
    <header className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-gray-100 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200 transition-all"
          title="Back to Assistants"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs font-medium">Back</span>
        </motion.button>

        <div className="h-6 w-px bg-gray-100" />

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
            ) : (
              <h1 className="text-sm font-bold text-gray-900 leading-tight">{name}</h1>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => { setIsRenameModalOpen(true); setIsModelModalOpen(false); }}
              className="p-1 rounded-lg text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
              title="Rename"
            >
              <Pencil className="w-3 h-3" />
            </motion.button>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-gray-400">
              {id ? `${id.slice(0, 6)}…${id.slice(-4)}` : "—"}
            </span>
            <button
              onClick={handleCopyId}
              className="p-0.5 rounded hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-colors"
              title="Copy ID"
            >
              <Copy className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle */}
      <div className="flex items-center gap-2">
        {/* Model pill */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          onClick={() => { setIsModelModalOpen((p) => !p); setIsRenameModalOpen(false); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all"
        >
          <img src={modelIcon} alt="Model" className="w-5 h-5 rounded-md object-cover" />
          <span className="text-xs font-medium text-gray-700 lowercase">
            {modelDisplay.replace(/\s+/g, "-")}
          </span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </motion.button>

        {/* Saved indicator */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-400">
          <CircleCheck className="w-3 h-3 text-gray-300" />
          <span>Saved</span>
        </div>

        <div className="h-5 w-px bg-gray-100" />

        {/* Icon buttons */}
        <div className="flex items-center gap-0.5 relative">
          <div className="relative">
            <IconButton
              icon={FlaskConical}
              tooltip="Experiments"
              active={isExperimentsOpen}
              onClick={() => setIsExperimentsOpen(!isExperimentsOpen)}
            />
            <ExperimentsDropdown
              isOpen={isExperimentsOpen}
              onClose={() => setIsExperimentsOpen(false)}
            />
          </div>

          <div className="relative">
            <IconButton
              icon={Users}
              tooltip="Collaborators"
              active={isUsersOpen}
              onClick={() => setIsUsersOpen(!isUsersOpen)}
            />
            <CollabSessionDropdown
              isOpen={isUsersOpen}
              onClose={() => setIsUsersOpen(false)}
            />
          </div>

          <IconButton icon={Rocket}   tooltip="Open Testing Lab (Chat)" onClick={handleOpenTestingLab} />
          <IconButton icon={Sparkles} tooltip="Logs" active={isLogsModalOpen} onClick={() => setIsLogsModalOpen((p) => !p)} />
          <IconButton icon={RotateCcw} tooltip="Reload assistant" active={refreshing} onClick={handleRefresh} />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsIssuesModalOpen((p) => !p)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-transparent transition-all ${
            issueCount > 0
              ? "text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-100"
              : "text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          {issueCount} {issueCount === 1 ? "Issue" : "Issues"}
        </button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-70"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          Save Changes
        </motion.button>
      </div>

      {/* Modals */}
      <AIModelModal         isOpen={isModelModalOpen}  onClose={() => setIsModelModalOpen(false)} />
      <RenameAssistantModal isOpen={isRenameModalOpen} onClose={() => setIsRenameModalOpen(false)} />
      <IssuesModal          isOpen={isIssuesModalOpen} onClose={() => setIsIssuesModalOpen(false)} checks={checks} />
      <LogsModal            isOpen={isLogsModalOpen}   onClose={() => setIsLogsModalOpen(false)} assistantId={assistantId} subaccountId={subaccountId} />
    </header>
  );
};
