// src/components/assistant/AssistantHeader.jsx
import React, { useState } from "react";
import {
  Pencil,
  Save,
  Settings,
  Loader,
  Zap,
  AlertTriangle,
  Database,
  ArrowLeft,
  Beaker,
  RotateCcw,
  Globe,
} from "lucide-react";
import { AIModelModal } from "./AiModelModal";
import { RenameAssistantModal } from "./RenameAssistantModal";


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
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium space-x-1 transition-colors duration-150
      ${bgColor} ${textColor} ${
      isInteractive ? "cursor-pointer hover:bg-gray-200" : "cursor-default"
    }`}
    title={isInteractive ? "Click to change model" : ""}
  >
    {Icon && <Icon className="w-3.5 h-3.5" />}
    <span>{text}</span>
  </button>
);

// --- Icon Button (toolbar) ---
const IconButton = ({ icon: Icon, tooltip }) => (
  <button
    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-150"
    title={tooltip}
    aria-label={tooltip}
  >
    <Icon className="w-5 h-5" />
  </button>
);

export const AssistantHeader = ({ onBack, onSave }) => {
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  const toggleModelModal = () => {
    setIsModelModalOpen((prev) => !prev);
    setIsRenameModalOpen(false); 
  };

  const toggleRenameModal = () => {
    setIsRenameModalOpen((prev) => !prev);
    setIsModelModalOpen(false); 
  };

  return (
    <header className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-200">

      <div className="flex items-center space-x-4">

        <button
          onClick={onBack}
          className="p-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>


        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold text-gray-900">
              New Blank Assistant
            </h1>
            <Pencil
              onClick={toggleRenameModal}
              className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
              title="Rename Assistant"
            />
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="font-mono">ID: 1761_9400</span>
            <button
              className="p-1 rounded hover:bg-gray-100"
              title="Copy Assistant ID"
            >
              <Database className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* --- Middle: Status + Tools --- */}
      <div className="flex items-center space-x-4">

        <StatusBadge
          text="Saved"
          bgColor="bg-gray-100"
          textColor="text-gray-600"
        />
        <StatusBadge
          text="GPT-4o"
          bgColor="bg-purple-100"
          textColor="text-purple-600"
          icon={Globe}
          onClick={toggleModelModal}
          isInteractive={true}
        />

        {/* Toolbar Actions */}
        <div className="flex items-center space-x-2">
          <IconButton icon={Settings} tooltip="Settings" />
          <IconButton icon={Zap} tooltip="Quick Actions" />
          <IconButton icon={Beaker} tooltip="Testing Lab" />
          <IconButton icon={Loader} tooltip="Logs" />
          <IconButton icon={RotateCcw} tooltip="Refresh" />
          <IconButton icon={AlertTriangle} tooltip="Debug Mode" />
        </div>
      </div>


      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1 text-sm text-gray-700">
          <AlertTriangle className="w-4 h-4 text-gray-500" />
          <span>0 Issues</span>
        </div>

        <button
          onClick={onSave}
          className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 shadow-sm transition"
        >
          <Save className="w-5 h-5" />
          <span>Save Changes</span>
        </button>
      </div>

      <AIModelModal isOpen={isModelModalOpen} onClose={toggleModelModal} />
      <RenameAssistantModal
        isOpen={isRenameModalOpen}
        onClose={toggleRenameModal}
      />
    </header>
  );
};
