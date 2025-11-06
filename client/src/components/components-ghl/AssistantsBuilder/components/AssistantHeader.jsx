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
  Globe,
  Copy,
  ArrowLeft,
  Rocket,
  CircleCheck,
  ArrowDown,
  ChevronDown,
} from "lucide-react";
import { AIModelModal } from "./AiModelModal";
import { RenameAssistantModal } from "./RenameAssistantModal";
import IssuesModal from "./IssuesModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAssistantById } from "../../../../store/slices/assistantsSlice";
import { useCurrentAccount } from "../../../../hooks/useCurrentAccount";

const IconButton = ({ icon: Icon, tooltip }) => (
  <button
    className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-150"
    title={tooltip}
    aria-label={tooltip}
  >
    <Icon className="w-4 h-4" />
  </button>
);

export const AssistantHeader = ({ onSave, assistantId: propAssistantId }) => {
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isIssuesModalOpen, setIsIssuesModalOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const account = useCurrentAccount();

  const { selectedAssistant, loading } = useSelector(
    (state) => state.assistants
  );

  const assistantId = propAssistantId;

  const subaccountId = searchParams.get("subaccount") || account?.subaccount;

  // ✅ Fetch the assistant when component mounts
  useEffect(() => {
    if (assistantId && subaccountId) {
      console.log("🧩 Fetching assistant:", { assistantId, subaccountId });
      dispatch(getAssistantById({ subaccountId, assistantId }))
        .unwrap()
        .then((data) => {
          console.log("🎯 Assistant fetched successfully:", data);
        })
        .catch((error) => {
          console.error("❌ Failed to fetch assistant:", error);
        });
    } else {
      console.warn("⚠️ Missing assistantId or subaccountId", {
        assistantId,
        subaccountId,
      });
    }
  }, [dispatch, subaccountId, assistantId]);

  const handleCopyId = () => {
    if (selectedAssistant?.id) {
      navigator.clipboard.writeText(selectedAssistant.id);
    }
  };

  const toggleModelModal = () => {
    setIsModelModalOpen((prev) => !prev);
    setIsRenameModalOpen(false);
  };

  const toggleRenameModal = () => {
    setIsRenameModalOpen((prev) => !prev);
    setIsModelModalOpen(false);
  };

  const toggleIssuesModal = () => {
    setIsIssuesModalOpen((prev) => !prev);
    setIsModelModalOpen(false);
    setIsRenameModalOpen(false);
  };

  // ✅ Navigate back with account context
  const handleGoBack = () => {
    if (account) {
      const params = new URLSearchParams({
        agencyid: account.agencyid,
        subaccount: account.subaccount,
        allow: account.allow,
        myname: account.myname,
        myemail: account.myemail,
        route: "/assistants",
      });
      navigate(`/app?${params.toString()}`);
    } else {
      navigate("/assistants");
    }
  };

  const name = selectedAssistant?.name || "New Blank Assistant";
  const model = selectedAssistant?.model?.model || "GPT-4o";
  const id = selectedAssistant?.id || assistantId;

  return (
    <header className="flex justify-between items-center px-2 py-1 bg-white border-b border-gray-200">
      {/* --- Left Section --- */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleGoBack}
          className="p-3 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          title="Go Back"
        >
          <ArrowLeft className="w-3 h-3" />
        </button>

        <div className="flex flex-col gap-0">
          <div className="flex items-center space-x-2">
            <h1 className="text-md font-semibold text-gray-900">
              {loading ? "Loading..." : name}
            </h1>
            <Pencil
              onClick={toggleRenameModal}
              className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
              title="Rename Assistant"
            />
          </div>

          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <span className="font-mono text-sm">
              ID: {id ? `${id.slice(0, 4)}...${id.slice(-4)}` : "N/A"}
            </span>

            <button
              onClick={handleCopyId}
              className="p-1 rounded hover:bg-gray-100"
              title="Copy Assistant ID"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* --- Middle Section --- */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => console.log("Hello")}
            className="inline-flex items-center px-1 rounded-full text-sm font-medium space-x-1 transition-colors duration-150"
          >
            <CircleCheck className="w-3 h-3 text-gray-300" />
            <span className="text-gray-300">Saved</span>
          </button>
          <button
            onClick={toggleModelModal}
            className="flex items-center px-1 rounded-full text-sm font-medium transition-colors duration-150 "
          >
            <img
              src="https://cdn.brandfetch.io/idR3duQxYl/w/400/h/400/theme/dark/icon.jpeg"
              alt="OpenAi"
              className="w-[25px]"
            />
            <div className="hover:bg-slate-100 flex items-center py-1 rounded-md">
              <span className="font-normal">{model}</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <IconButton  icon={FlaskConical} tooltip="Experiments" />
          <IconButton icon={Users} tooltip="Users" />
          <IconButton icon={Rocket} tooltip="Testing Lab" />
          <IconButton icon={Sparkles} tooltip="Logs" />
          <IconButton icon={RotateCcw} tooltip="Refresh" />
        </div>
      </div>

      {/* --- Right Section --- */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleIssuesModal}
          className="flex items-center space-x-1 text-sm text-gray-700 cursor-pointer p-2 rounded-md hover:bg-gray-100 transition-colors duration-150 relative"
          title="View Issues"
        >
          <AlertTriangle className="w-4 h-4 text-gray-500" />
          <span>0 Issues</span>
        </button>

        <button
          onClick={onSave}
          className="flex items-center space-x-2 px-2 py-1 bg-green-50 border border-green-5  00 text-green-500 font-medium rounded-md shadow-sm transition"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* --- Modals --- */}
      <AIModelModal isOpen={isModelModalOpen} onClose={toggleModelModal} />
      <RenameAssistantModal
        isOpen={isRenameModalOpen}
        onClose={toggleRenameModal}
      />
      <IssuesModal isOpen={isIssuesModalOpen} onClose={toggleIssuesModal} />
    </header>
  );
};
