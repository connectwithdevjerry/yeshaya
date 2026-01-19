import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux"; // ✅ Added useDispatch
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
  Loader2 
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
import { toast } from "react-hot-toast"; // ✅ Added toast
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
  const dispatch = useDispatch(); // ✅ Initialize dispatch
  const [activeTab, setActiveTab] = useState("Builder");
  const [isToolkitOpen, setIsToolkitOpen] = useState(true);
  const [isGeneratePromptModalOpen, setIsGeneratePromptModalOpen] = useState(false);
  const [isDynamicGreetingModalOpen, setIsDynamicGreetingModalOpen] = useState(false);
  const [isSnippetsOpen, setIsSnippetsOpen] = useState(false);
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false); // ✅ Track API loading state
  
  const maxChars = 8024;
  const charCount = promptContent.length;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // ✅ Get assistant data from Redux
  const { selectedAssistant } = useSelector((state) => state.assistants);
  const [voiceDisplay, setVoiceDisplay] = useState("Select Voice");
  const [modelDisplay, setModelDisplay] = useState("GPT-4o");
  const [phoneNumber, setPhoneNumber] = useState("+1222342743");
  const [assistantTag, setAssistantTag] = useState("");

  // ✅ Handle Copy Outbound URL Logic
  const handleCopyOutboundUrl = async () => {
    if (!selectedAssistant?.id) {
      toast.error("No Assistant ID found");
      return;
    }

    setIsGeneratingUrl(true);
    try {
      const resultAction = await dispatch(
        generateOutboundCallUrl({ assistantId: selectedAssistant.id })
      );

      if (generateOutboundCallUrl.fulfilled.match(resultAction)) {
        // Access data.url from your API response structure
        const urlToCopy = resultAction.payload.url; 
        
        await navigator.clipboard.writeText(urlToCopy);
        toast.success("Outbound URL copied to clipboard!");
      } else {
        toast.error(resultAction.payload || "Failed to generate URL");
      }
    } catch (err) {
      toast.error("Error accessing clipboard");
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  const handleAddSnippet = (snippetText) => {
    setPromptContent((prev) => prev + snippetText);
    console.log("✅ Snippet added to prompt");
  };

  const formatVoiceDisplay = (voice) => {
    if (!voice) return "Select Voice";
    if (voice.provider === "azure" && voice.voiceId) {
      const parts = voice.voiceId.split("-");
      const name = parts[parts.length - 1].replace("Neural", "");
      return name;
    }
    return voice.voiceId || "Select Voice";
  };

  const formatModelDisplay = (model) => {
    if (!model) return "GPT-4o";
    const modelName = model.model || "gpt-4o";
    const modelMap = {
      "gpt-4o": "GPT-4o",
      "gpt-4": "GPT-4",
      "gpt-3.5-turbo": "GPT-3.5 Turbo",
      "claude-3-opus": "Claude 3 Opus",
      "claude-3-sonnet": "Claude 3 Sonnet",
    };
    return modelMap[modelName] || modelName;
  };

  useEffect(() => {
    if (selectedAssistant && !promptContent) {
      const firstMessage = selectedAssistant.firstMessage || "";
      const endCallPhrases = selectedAssistant.endCallPhrases || [];
      let formattedContent = firstMessage;
      if (endCallPhrases.length > 0) {
        formattedContent += `\n\n--- End Call Phrases ---\n${endCallPhrases
          .map((phrase) => `• ${phrase}`)
          .join("\n")}`;
      }
      setPromptContent(formattedContent);

      if (selectedAssistant.voice) setVoiceDisplay(formatVoiceDisplay(selectedAssistant.voice));
      if (selectedAssistant.model) setModelDisplay(formatModelDisplay(selectedAssistant.model));
      if (selectedAssistant.id) setAssistantTag(selectedAssistant.id);
      if (selectedAssistant.phoneNumber) setPhoneNumber(selectedAssistant.phoneNumber);
    }
  }, [selectedAssistant]);

  const getContextualPath = (targetRoute) => {
    const agencyid = searchParams.get("agencyid");
    const subaccount = searchParams.get("subaccount");
    const params = new URLSearchParams({
      agencyid: agencyid || "",
      subaccount: subaccount || "",
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
                {charCount} / {maxChars} characters
              </span>
              <AlertCircle className="w-4 h-4 text-gray-400 cursor-pointer" title="Help" />
            </h2>

            <div className="flex flex-wrap items-center space-x-4 text-sm text-blue-600 gap-y-2">
              <button className="flex items-center p-2 space-x-1 hover:bg-blue-50" onClick={openDynamicGreetingModal}>
                <X className="w-3 h-3" />
                <span>Dynamic Greeting</span>
              </button>
              
              <button className="hover:bg-blue-50 p-2 flex items-center gap-1">
                <Tags size={15} /> Fields & Values
              </button>

              {/* ✅ Updated Copy Outbound URL Button */}
              <button
                onClick={handleCopyOutboundUrl}
                disabled={isGeneratingUrl}
                className="hover:bg-blue-50 p-2 flex items-center gap-1 disabled:opacity-50 transition-opacity"
              >
                {isGeneratingUrl ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Copy size={15} />
                )}
                <span>{isGeneratingUrl ? "Generating..." : "Copy Outbound URL"}</span>
              </button>

              <div className="relative">
                <button
                  className="hover:bg-blue-50 p-2 flex items-center gap-1"
                  onClick={() => setIsSnippetsOpen(!isSnippetsOpen)}
                >
                  <Pencil size={15} /> Add Snippet
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
                <span>Generate Prompt</span>
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

        <ToolkitSidebar isOpen={isToolkitOpen} onToggle={setIsToolkitOpen} activeTab={activeTab} />
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 bg-white relative">
      <div className="flex justify-between items-center py-2 px-4 border-b border-gray-200">
        <div className="flex space-x-1">
          {["Builder", "Voice Lab", "Chat Lab"].map((tab) => (
            <TabButton key={tab} text={tab} isActive={activeTab === tab} onClick={() => setActiveTab(tab)} />
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-1 cursor-pointer">
            <div className="flex items-center space-x-2" onClick={() => navigate(getContextualPath("/activetags"))}>
              <Tag className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-mono text-gray-700 truncate max-w-[140px]">
                {assistantTag ? `${assistantTag.slice(0, 8)}...${assistantTag.slice(-8)}` : "No ID"}
              </span>
            </div>
            <div className="flex items-center space-x-2 border-l-2 hover:text-gray-600 pl-2">
              <button className="text-gray-400 p-1 rounded-full hover:bg-gray-100" title="Settings">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-1 cursor-pointer">
            <div onClick={() => navigate(getContextualPath("/call"))} className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-mono text-gray-700 truncate max-w-[120px]">{phoneNumber}</span>
            </div>
            <div className="flex items-center space-x-2 border-l-2 pl-2">
              <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100" title="Settings">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-1 cursor-pointer">
              <div className="flex items-center space-x-2" onClick={openVoiceMenu}>
                <Volume2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-mono text-gray-700 truncate max-w-[150px]">{voiceDisplay}</span>
              </div>
              <div className="flex items-center space-x-2 border-l-2 pl-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVoiceSettingsOpen(!isVoiceSettingsOpen);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
            <VoiceSettingsDropdown isOpen={isVoiceSettingsOpen} onClose={() => setIsVoiceSettingsOpen(false)} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">{renderContentView()}</div>

      {activeTab === "Builder" && !isToolkitOpen && (
        <button
          onClick={toggleToolkit}
          className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 z-10 p-2 bg-white border border-gray-300 rounded-full shadow-md text-gray-500 hover:text-blue-600 transition"
          title="Show Toolkit"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      <GeneratePromptModal isOpen={isGeneratePromptModalOpen} onClose={closeGeneratePromptModal} />
      <DynamicGreetingModal isOpen={isDynamicGreetingModalOpen} onClose={closeDynamicGreetingModal} />
      <VoiceMenuDrawer isOpen={isVoiceMenuOpen} onClose={closeVoiceMenu} />
    </div>
  );
};