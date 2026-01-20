import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  AlertCircle,
  Sparkles,
  Copy,
  Code, // ✅ Added for JSON button
  Loader2,
  Check, // ✅ Added for feedback
} from "lucide-react";
import { ChatLabView } from "./ChatLab";
import { VoiceLabView } from "./VoiceLab";
import { ToolkitSidebar } from "./AssistantSidebar";
import { GeneratePromptModal } from "./GeneratePromptModal";
import DynamicGreetingModal from "./DynamicGreetingModal";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { VoiceMenuDrawer } from "./VoiceMenu";
import { VoiceSettingsDropdown } from "./VoiceMenuModals/VoiceSettingsDropdown";
import { PromptSnippetsDropdown } from "./PromptSnippetsModal";
import { toast } from "react-hot-toast";
import { generateOutboundCallUrl } from "../../../../store/slices/assistantsSlice";

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

export const GlobalPromptEditor = ({ promptContent, setPromptContent }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Builder");
  const [isToolkitOpen, setIsToolkitOpen] = useState(true);
  const [isGeneratePromptModalOpen, setIsGeneratePromptModalOpen] =
    useState(false);
  const [isDynamicGreetingModalOpen, setIsDynamicGreetingModalOpen] =
    useState(false);
  const [isSnippetsOpen, setIsSnippetsOpen] = useState(false);

  // ✅ States for loading and success feedback
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(null); // 'url' or 'json'

  const maxChars = 8024;
  const charCount = promptContent.length;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { selectedAssistant } = useSelector((state) => state.assistants);
  const [voiceDisplay, setVoiceDisplay] = useState("Select Voice");
  const [phoneNumber, setPhoneNumber] = useState("+1222342743");
  const [assistantTag, setAssistantTag] = useState("");

  // ✅ Unified Logic for URL and Full JSON copying
  const handleCopyAction = async (type) => {
    if (!selectedAssistant?.id) {
      toast.error("No Assistant ID found");
      return;
    }

    setIsGenerating(true);
    try {
      const resultAction = await dispatch(
        generateOutboundCallUrl({ assistantId: selectedAssistant.id }),
      );

      if (generateOutboundCallUrl.fulfilled.match(resultAction)) {
        const responseData = resultAction.payload;

        if (type === "url") {
          // Copy only the nested URL string
          const urlOnly = responseData?.data?.url || responseData?.url;
          await navigator.clipboard.writeText(urlOnly);
          toast.success("Outbound URL copied!");
        } else {
          // ✅ Copy the EXACT full JSON structure
          const jsonString = JSON.stringify(responseData, null, 2);
          await navigator.clipboard.writeText(jsonString);
          toast.success("Full JSON structure copied!");
        }

        // Show brief success icon
        setCopySuccess(type);
        setTimeout(() => setCopySuccess(null), 2000);
      } else {
        toast.error(resultAction.payload || "API Error");
      }
    } catch (err) {
      toast.error("Clipboard access failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSnippet = (snippetText) => {
    setPromptContent((prev) => prev + snippetText);
  };

  const formatVoiceDisplay = (voice) => {
    if (!voice) return "Select Voice";
    if (voice.provider === "azure" && voice.voiceId) {
      const parts = voice.voiceId.split("-");
      return parts[parts.length - 1].replace("Neural", "");
    }
    return voice.voiceId || "Select Voice";
  };

  useEffect(() => {
    if (selectedAssistant && !promptContent) {
      const systemPrompt = selectedAssistant.model?.systemPrompt || "";
      const endCallPhrases = selectedAssistant.endCallPhrases || [];

      let formattedContent = systemPrompt;

      if (endCallPhrases.length > 0) {
        formattedContent += `\n\n--- End Call Phrases ---\n${endCallPhrases.map((p) => `• ${p}`).join("\n")}`;
      }

      setPromptContent(formattedContent);
      if (selectedAssistant.voice)
        setVoiceDisplay(formatVoiceDisplay(selectedAssistant.voice));
      if (selectedAssistant.id) setAssistantTag(selectedAssistant.id);
      if (selectedAssistant.phoneNumber)
        setPhoneNumber(selectedAssistant.phoneNumber);
    }
  }, [selectedAssistant]);

  const getContextualPath = (targetRoute) => {
    const params = new URLSearchParams({
      agencyid: searchParams.get("agencyid") || "",
      subaccount: searchParams.get("subaccount") || "",
      route: targetRoute,
    });
    return `/app?${params.toString()}`;
  };

  const toggleToolkit = () => setIsToolkitOpen((prev) => !prev);
  const openGeneratePromptModal = () => setIsGeneratePromptModalOpen(true);
  const closeGeneratePromptModal = () => setIsGeneratePromptModalOpen(false);
  const openDynamicGreetingModal = () => setIsDynamicGreetingModalOpen(true);
  const closeDynamicGreetingModal = () => setIsDynamicGreetingModalOpen(false);
  const [isVoiceMenuOpen, setIsVoiceMenuOpen] = useState(false);
  const openVoiceMenu = () => setIsVoiceMenuOpen(true);
  const closeVoiceMenu = () => setIsVoiceMenuOpen(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);

  useEffect(() => {
    if (activeTab !== "Builder") setIsToolkitOpen(false);
  }, [activeTab]);

  const renderContentView = () => {
    if (activeTab === "Chat Lab") return <ChatLabView />;
    if (activeTab === "Voice Lab") return <VoiceLabView />;

    return (
      <div className="flex h-full">
        <div className="flex-1 bg-gray-50 border-r overflow-y-auto no-scrollbar">
          <div className="flex flex-wrap justify-between items-center bg-white px-6 py-1 border-b shadow-sm gap-3">
            <h2 className="text-md font-semibold text-gray-800 flex items-center space-x-2">
              <span>Global Prompt</span>
              <span className="text-[10px] font-normal text-gray-500">
                {charCount} / {maxChars}
              </span>
              <AlertCircle
                className="w-4 h-4 text-gray-400 cursor-pointer"
                title="Help"
              />
            </h2>

            <div className="flex flex-wrap items-center space-x-4 text-sm text-blue-600 gap-y-2">
              <button
                className="flex items-center p-2 space-x-1 hover:bg-blue-50"
                onClick={openDynamicGreetingModal}
              >
                <X className="w-3 h-3" />
                <span>Dynamic Greeting</span>
              </button>

              <button className="hover:bg-blue-50 p-2 flex items-center gap-1">
                <Tags size={15} /> Fields
              </button>

              {/* ✅ ACTION GROUP: Split URL & JSON Button */}
              <div className="flex items-center border border-blue-200 rounded-md bg-white overflow-hidden shadow-sm">
                <button
                  onClick={() => handleCopyAction("url")}
                  disabled={isGenerating}
                  className="hover:bg-blue-50 p-2 flex items-center gap-1.5 border-r border-blue-100 disabled:opacity-50 transition-colors"
                  title="Copy Outbound URL"
                >
                  {isGenerating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : copySuccess === "url" ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                  <span className="font-semibold">URL</span>
                </button>
                <button
                  onClick={() => handleCopyAction("json")}
                  disabled={isGenerating}
                  className="hover:bg-blue-50 p-2 flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                  title="Copy Full JSON Response"
                >
                  {isGenerating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : copySuccess === "json" ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Code size={14} />
                  )}
                  <span className="font-semibold">JSON</span>
                </button>
              </div>

              <div className="relative">
                <button
                  className="hover:bg-blue-50 p-2 flex items-center gap-1"
                  onClick={() => setIsSnippetsOpen(!isSnippetsOpen)}
                >
                  <Pencil size={15} /> Snippet
                </button>
                <PromptSnippetsDropdown
                  isOpen={isSnippetsOpen}
                  onClose={() => setIsSnippetsOpen(false)}
                  onAddSnippet={handleAddSnippet}
                />
              </div>
            </div>

            <div className="mt-2 sm:mt-0">
              <button
                className="flex text-sm items-center p-2 rounded-md space-x-1 hover:bg-blue-50 text-blue-600"
                onClick={openGeneratePromptModal}
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate</span>
              </button>
            </div>
          </div>

          <div className="p-2">
            <textarea
              className="w-full no-scrollbar h-[600px] p-4 text-gray-800 bg-gray-50 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 overflow-y-auto"
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
              placeholder="Enter your prompt here..."
            />
          </div>
        </div>

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
      <div className="flex justify-between items-center py-2 px-4 border-b border-gray-200">
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

        <div className="flex gap-2 items-center">
          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-1 cursor-pointer">
            <div
              className="flex items-center space-x-2"
              onClick={() => navigate(getContextualPath("/activetags"))}
            >
              <Tag className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-mono text-gray-700 truncate max-w-[140px]">
                {assistantTag
                  ? `${assistantTag.slice(0, 8)}...${assistantTag.slice(-8)}`
                  : "No ID"}
              </span>
            </div>
            <div className="flex items-center space-x-2 border-l-2 pl-2">
              <button className="text-gray-400 p-1 rounded-full hover:bg-gray-100">
                <Settings size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-1 cursor-pointer">
            <div
              onClick={() => navigate(getContextualPath("/call"))}
              className="flex items-center space-x-2"
            >
              <Phone size={16} className="text-gray-400" />
              <span className="text-sm font-mono text-gray-700">
                {phoneNumber}
              </span>
            </div>
            <div className="flex items-center space-x-2 border-l-2 pl-2">
              <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                <Settings size={16} />
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-1 cursor-pointer">
              <div
                className="flex items-center space-x-2"
                onClick={openVoiceMenu}
              >
                <Volume2 size={16} className="text-gray-400" />
                <span className="text-sm font-mono text-gray-700">
                  {voiceDisplay}
                </span>
              </div>
              <div className="flex items-center space-x-2 border-l-2 pl-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVoiceSettingsOpen(!isVoiceSettingsOpen);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>
            <VoiceSettingsDropdown
              isOpen={isVoiceSettingsOpen}
              onClose={() => setIsVoiceSettingsOpen(false)}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">{renderContentView()}</div>

      {activeTab === "Builder" && !isToolkitOpen && (
        <button
          onClick={toggleToolkit}
          className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 z-10 p-2 bg-white border border-gray-300 rounded-full shadow-md text-gray-500 hover:text-blue-600 transition"
        >
          <ArrowLeft size={20} />
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
