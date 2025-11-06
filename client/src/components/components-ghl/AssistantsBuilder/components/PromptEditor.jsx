import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  HelpCircle,
  ChevronsRight,
  X,
  Phone,
  Tag,
  Settings,
  ArrowLeft,
  Tags,
  Pencil,
  Sparkle,
  Volume2,
} from "lucide-react";
import { ChatLabView } from "./ChatLab";
import { VoiceLabView } from "./VoiceLab";
import { ToolkitSidebar } from "./AssistantSidebar";
import { GeneratePromptModal } from "./GeneratePromptModal";
import DynamicGreetingModal from "./DynamicGreetingModal";
import { useNavigate } from "react-router-dom";
import { VoiceMenuDrawer } from "./VoiceMenu";

const TabButton = ({ text, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium border transition-colors duration-200 ${
      isActive
        ? "border-gray-300 bg-gray-100 text-black font-bold rounded-md text-[15px]"
        : "border-transparent rounded-md text-gray-500 hover:bg-gray-100 hover:border-gray-300"
    }`}
  >
    {text}
  </button>
);

export const GlobalPromptEditor = () => {
  const [activeTab, setActiveTab] = useState("Builder");
  const [promptContent, setPromptContent] = useState(
    "Enter your prompt here..."
  );
  const [isToolkitOpen, setIsToolkitOpen] = useState(true);
  const [isGeneratePromptModalOpen, setIsGeneratePromptModalOpen] =
    useState(false);
  const [isDynamicGreetingModalOpen, setIsDynamicGreetingModalOpen] =
    useState(false);
  const maxChars = 8024;
  const charCount = promptContent.length;
  const navigate = useNavigate();
  
  // ✅ Get assistant data from Redux
  const { selectedAssistant } = useSelector((state) => state.assistants);
  const [voiceDisplay, setVoiceDisplay] = useState("Marrisa");

  const toggleToolkit = () => setIsToolkitOpen((prev) => !prev);
  const openGeneratePromptModal = () => setIsGeneratePromptModalOpen(true);
  const closeGeneratePromptModal = () => setIsGeneratePromptModalOpen(false);
  const openDynamicGreetingModal = () => setIsDynamicGreetingModalOpen(true);
  const closeDynamicGreetingModal = () => setIsDynamicGreetingModalOpen(false);
  const [isVoiceMenuOpen, setIsVoiceMenuOpen] = useState(false);
  const openVoiceMenu = () => setIsVoiceMenuOpen(true);
  const closeVoiceMenu = () => setIsVoiceMenuOpen(false);

  // ✅ Populate prompt content when assistant data loads
  useEffect(() => {
    if (selectedAssistant) {
      const firstMessage = selectedAssistant.firstMessage || "";
      const endCallPhrases = selectedAssistant.endCallPhrases || [];
      
      // Format the prompt content
      let formattedContent = firstMessage;
      
      if (endCallPhrases.length > 0) {
        formattedContent += `\n\nEnd Call Phrases:\n${endCallPhrases.map(phrase => `- ${phrase}`).join('\n')}`;
      }
      
      setPromptContent(formattedContent);
      
      // Update voice display
      if (selectedAssistant.voice?.voiceId) {
        setVoiceDisplay(selectedAssistant.voice.voiceId);
      }
    }
  }, [selectedAssistant]);

  useEffect(() => {
    if (activeTab !== "Builder") {
      setIsToolkitOpen(false);
    }
  }, [activeTab]);

  const renderContentView = () => {
    if (activeTab === "Chat Lab") return <ChatLabView />;
    if (activeTab === "Voice Lab") return <VoiceLabView />;

    // Default Builder view
    return (
      <div className="flex h-full">
        {/* Prompt Editor */}
        <div className="flex-1 bg-gray-50 border-r overflow-y-auto">
          <div className="flex justify-between items-center bg-white px-6 py-3 border-b shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-3">
              <span>Global Prompt</span>
              <span className="text-sm font-normal text-gray-500">
                {charCount} / {maxChars}
              </span>
              <HelpCircle
                className="w-4 h-4 text-gray-400 cursor-pointer"
                title="Help"
              />
            </h2>

            <div className="flex items-center space-x-4 text-sm text-blue-600">
              <button
                className="flex items-center space-x-1 hover:underline"
                onClick={openDynamicGreetingModal}
              >
                <X className="w-3 h-3" />
                <span>Dynamic Greeting</span>
              </button>
              <button className="hover:underline flex items-center gap-1">
                {" "}
                <Tags size={15} /> Fields & Values
              </button>
              <button className="hover:underline  flex items-center gap-1">
                {" "}
                <Pencil size={15} /> Add Snippet
              </button>
              <button
                className="flex items-center space-x-1 hover:underline"
                onClick={openGeneratePromptModal}
              >
                <Sparkle className="w-4 h-4" />
                <span>Generate Prompt</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <textarea
              className="w-full min-h-[400px] p-4 text-gray-800 bg-gray-50 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
              placeholder="Enter your prompt here..."
            />
          </div>
        </div>

        {/* Toolkit Sidebar */}
        <ToolkitSidebar
          isOpen={isToolkitOpen}
          onToggle={setIsToolkitOpen}
          activeTab={activeTab}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 bg-white relative">
      {/* Tabs Header */}
      <div className="flex justify-between items-center py-2 px-4 border-b border-gray-200 ">
        <div className="flex space-x-1">
          {["Builder", "Voice Lab", "Chat Lab"].map((tab) => (
            <TabButton
              key={tab}
              text={tab}
              isActive={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            />
          ))}
        </div>

        {/* Right Controls */}
        <div className="flex gap-2 items-center">
          <div
            onClick={() => navigate("/activetags")}
            className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-1 cursor-pointer"
          >
            <Tag className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-mono text-gray-700 truncate max-w-[140px]">
              1761056664694×928651361970399400
            </span>
            <div className="flex items-center space-x-2">
              <button
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div
            onClick={() => navigate("/numbers")}
            className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-1 cursor-pointer"
          >
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-mono text-gray-700 truncate max-w-[120px]">
              +1222342743
            </span>
            <div className="flex items-center space-x-2">
              <button
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div onClick={openVoiceMenu} className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-1 cursor-pointer">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-mono text-gray-700 truncate max-w-[150px]">
              {voiceDisplay}
            </span>
            <div className="flex items-center space-x-2">
              <button
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">{renderContentView()}</div>

      {/* Floating Button */}
      {activeTab === "Builder" && !isToolkitOpen && (
        <button
          onClick={toggleToolkit}
          className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 z-10 p-2 bg-white border border-gray-300 rounded-full shadow-md text-gray-500 hover:text-blue-600 transition"
          title="Show Toolkit"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      <GeneratePromptModal
        isOpen={isGeneratePromptModalOpen}
        onClose={closeGeneratePromptModal}
      />
      <DynamicGreetingModal
        isOpen={isDynamicGreetingModalOpen}
        onClose={closeDynamicGreetingModal}
      />
      <VoiceMenuDrawer isOpen={isVoiceMenuOpen} onClose={closeVoiceMenu} />
    </div>
  );
};