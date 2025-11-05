// src/components/assistant/AssistantHeader.jsx
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
} from "lucide-react";
import { AIModelModal } from "./AiModelModal";
import { RenameAssistantModal } from "./RenameAssistantModal";
import IssuesModal from "./IssuesModal";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAssistantById } from "../../../../store/slices/assistantsSlice";

const StatusBadge = ({
  text,
  bgColor,
  textColor,
  icon: Icon,
  onClick,
  isInteractive = false,
}) => (
  <button
    onClick={isInteractive ? onClick : undefined}
    className={`inline-flex items-center px-2.5 py-2 rounded-full text-sm font-medium space-x-1 transition-colors duration-150
      ${bgColor} ${textColor} ${
      isInteractive ? "cursor-pointer hover:bg-gray-200" : "cursor-default"
    }`}
    title={isInteractive ? "Click to change model" : ""}
  >
    {Icon && <Icon className="w-5 h-5" />}
    <span>{text}</span>
  </button>
);

const IconButton = ({ icon: Icon, tooltip }) => (
  <button
    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-150"
    title={tooltip}
    aria-label={tooltip}
  >
    <Icon className="w-5 h-5" />
  </button>
);

export const AssistantHeader = ({
  onSave,
  subaccountId = "p0JBk5SQLtFmAlkf6f7q",
}) => {
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isIssuesModalOpen, setIsIssuesModalOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { assistantId } = useParams();

  const { selectedAssistant, loading } = useSelector(
    (state) => state.assistants
  );

  // ✅ Fetch the assistant when component mounts
  useEffect(() => {
    if (assistantId) {
      console.log("🧩 Route assistantId:", assistantId);
      console.log(subaccountId)
      dispatch(getAssistantById({ subaccountId, assistantId }))
        .unwrap()
        .then((data) => {
          console.log("🎯 Redux fetched assistant ID:", data?.id);
        })
        .catch((error) => {
          console.error("❌ Failed to fetch assistant:", error);
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

  const name = selectedAssistant?.name || "New Blank Assistant";
  const model = selectedAssistant?.model || "GPT-4o";
  const id = selectedAssistant?.id || assistantId;

  return (
    <header className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
      {/* --- Left Section --- */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/assistants")}
          className="p-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold text-gray-900">
              {loading ? "Loading..." : name}
            </h1>
            <Pencil
              onClick={toggleRenameModal}
              className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
              title="Rename Assistant"
            />
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="font-mono">ID: {id}</span>
            <button
              onClick={handleCopyId}
              className="p-1 rounded hover:bg-gray-100"
              title="Copy Assistant ID"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* --- Middle Section --- */}
      <div className="flex items-center space-x-4">
        <StatusBadge
          text="Saved"
          bgColor="bg-gray-100"
          textColor="text-gray-600"
        />
        <StatusBadge
          text={model}
          bgColor="bg-purple-100"
          textColor="text-purple-600"
          icon={Globe}
          onClick={toggleModelModal}
          isInteractive={true}
        />

        <div className="flex items-center space-x-2">
          <IconButton icon={FlaskConical} tooltip="Experiments" />
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
          className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 shadow-sm transition"
        >
          <Save className="w-5 h-5" />
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
