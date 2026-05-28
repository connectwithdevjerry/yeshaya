// src/components/components-ghl/AssistantsBuilder/components/PromptEditor.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  X,
  Phone,
  Tag,
  Settings,
  Pencil,
  Volume2,
  AlertCircle,
  Sparkles,
  Copy,
  Code,
  Loader2,
  Check,
  Wand2,
  MessageSquare,
  Mic,
  Wrench,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatLabView } from "./ChatLab";
import { VoiceLabView } from "./VoiceLab";
import { ToolkitSidebar } from "./AssistantSidebar";
import { GeneratePromptModal } from "./GeneratePromptModal";
import DynamicGreetingModal from "./DynamicGreetingModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import { VoiceMenuDrawer } from "./VoiceMenu";
import { VoiceSettingsDropdown } from "./VoiceMenuModals/VoiceSettingsDropdown";
import { PromptSnippetsDropdown } from "./PromptSnippetsModal";
import { toast } from "react-hot-toast";
import { generateOutboundCallUrl } from "../../../../store/slices/assistantsSlice";

const TABS = [
  { id: "Builder",   label: "Builder",   icon: Wrench },
  { id: "Voice Lab", label: "Voice Lab", icon: Mic },
  { id: "Chat Lab",  label: "Chat Lab",  icon: MessageSquare },
];

const TabButton = ({ tab, isActive, onClick }) => {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
        isActive
          ? "text-indigo-600 bg-indigo-50"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {tab.label}
      {isActive && (
        <motion.div
          layoutId="tab-indicator"
          className="absolute inset-0 rounded-xl ring-2 ring-indigo-500/30 pointer-events-none"
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
        />
      )}
    </button>
  );
};

const PillButton = ({ icon: Icon, label, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all ${className}`}
  >
    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
    {label}
  </button>
);

export const GlobalPromptEditor = ({ promptContent, setPromptContent }) => {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab,                   setActiveTab]                   = useState("Builder");
  const [isToolkitOpen,               setIsToolkitOpen]               = useState(true);
  const [isGeneratePromptModalOpen,   setIsGeneratePromptModalOpen]   = useState(false);
  const [isDynamicGreetingModalOpen,  setIsDynamicGreetingModalOpen]  = useState(false);
  const [isSnippetsOpen,              setIsSnippetsOpen]              = useState(false);
  const [isVoiceMenuOpen,             setIsVoiceMenuOpen]             = useState(false);
  const [isVoiceSettingsOpen,         setIsVoiceSettingsOpen]         = useState(false);
  const [isGenerating,                setIsGenerating]                = useState(false);
  const [copySuccess,                 setCopySuccess]                 = useState(null);

  const maxChars  = 8024;
  const charCount = promptContent.length;
  const pct       = Math.min((charCount / maxChars) * 100, 100);

  const { selectedAssistant } = useSelector((s) => s.assistants);
  const [voiceDisplay,  setVoiceDisplay]  = useState("Select Voice");
  const [phoneNumber,   setPhoneNumber]   = useState("+1222342743");
  const [assistantTag,  setAssistantTag]  = useState("");

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
      setPromptContent(systemPrompt);
      if (selectedAssistant.voice)       setVoiceDisplay(formatVoiceDisplay(selectedAssistant.voice));
      if (selectedAssistant.id)          setAssistantTag(selectedAssistant.id);
      if (selectedAssistant.phoneNumber) setPhoneNumber(selectedAssistant.phoneNumber);
    }
  }, [selectedAssistant]);

  useEffect(() => {
    if (activeTab !== "Builder") setIsToolkitOpen(false);
  }, [activeTab]);

  const getContextualPath = (targetRoute) => {
    const params = new URLSearchParams({
      agencyid:   searchParams.get("agencyid") || "",
      subaccount: searchParams.get("subaccount") || "",
      route:      targetRoute,
    });
    return `/app?${params.toString()}`;
  };

  const handleCopyAction = async (type) => {
    if (!selectedAssistant?.id) { toast.error("No Assistant ID found"); return; }
    setIsGenerating(true);
    try {
      const resultAction = await dispatch(generateOutboundCallUrl({ assistantId: selectedAssistant.id }));
      if (generateOutboundCallUrl.fulfilled.match(resultAction)) {
        const responseData = resultAction.payload;
        if (type === "url") {
          const urlOnly = responseData?.data?.url || responseData?.url;
          if (!urlOnly) throw new Error("URL not found");
          await navigator.clipboard.writeText(urlOnly);
          toast.success("Outbound URL copied!");
        } else {
          const jsonTemplate = {
            fromNumber:    selectedAssistant?.phoneNumber || "+18302895783",
            customerNumber: "+2349137628206",
            dynamicValues:  { firstName: "Jeremiah" },
          };
          await navigator.clipboard.writeText(JSON.stringify(jsonTemplate, null, 4));
          toast.success("JSON Payload copied!");
        }
        setCopySuccess(type);
        setTimeout(() => setCopySuccess(null), 2000);
      } else {
        toast.error(resultAction.payload || "API Error");
      }
    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSnippet = (snippetText) => setPromptContent((prev) => prev + snippetText);

  const renderBuilderContent = () => (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col bg-gray-50 border-r border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap justify-between items-center bg-white px-5 py-3 border-b border-gray-100 gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-gray-800">Global Prompt</h2>

            {/* Character bar */}
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${pct > 90 ? "bg-rose-500" : pct > 70 ? "bg-amber-400" : "bg-indigo-500"}`}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className={`text-[10px] font-medium tabular-nums ${pct > 90 ? "text-rose-500" : "text-gray-400"}`}>
                {charCount.toLocaleString()} / {maxChars.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PillButton icon={X}      label="Dynamic Greeting" onClick={() => setIsDynamicGreetingModalOpen(true)} />

            {/* URL + JSON split button */}
            <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <button
                onClick={() => handleCopyAction("url")}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border-r border-gray-200 transition-all disabled:opacity-50"
                title="Copy Outbound URL"
              >
                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : copySuccess === "url" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                URL
              </button>
              <button
                onClick={() => handleCopyAction("json")}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all disabled:opacity-50"
                title="Copy JSON Payload"
              >
                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : copySuccess === "json" ? <Check className="w-3 h-3 text-emerald-500" /> : <Code className="w-3 h-3" />}
                JSON
              </button>
            </div>

            <div className="relative">
              <PillButton icon={Pencil} label="Snippet" onClick={() => setIsSnippetsOpen(!isSnippetsOpen)} />
              <PromptSnippetsDropdown
                isOpen={isSnippetsOpen}
                onClose={() => setIsSnippetsOpen(false)}
                onAddSnippet={handleAddSnippet}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={() => setIsGeneratePromptModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-semibold shadow-sm hover:brightness-110 transition-all"
            >
              <Wand2 className="w-3.5 h-3.5" /> Generate
            </motion.button>
          </div>
        </div>

        {/* Textarea */}
        <div className="flex-1 p-3 overflow-hidden">
          <textarea
            className="w-full h-full p-4 text-sm text-gray-800 bg-white border border-gray-100 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 font-mono leading-relaxed transition-all no-scrollbar shadow-sm placeholder:text-gray-300"
            value={promptContent}
            onChange={(e) => setPromptContent(e.target.value)}
            placeholder="Write your assistant's system prompt here…"
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

  return (
    <div className="flex flex-col flex-1 bg-white relative overflow-hidden">
      {/* Tab bar + pill controls */}
      <div className="flex justify-between items-center py-2 px-4 border-b border-gray-100 bg-white">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Assistant tag pill */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white cursor-pointer hover:border-indigo-200 hover:bg-indigo-50 transition-all"
            onClick={() => navigate(getContextualPath("/activetags"))}
          >
            <Tag className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-mono text-gray-600 truncate max-w-[120px]">
              {assistantTag ? `${assistantTag.slice(0, 6)}…${assistantTag.slice(-4)}` : "No ID"}
            </span>
            <div className="border-l border-gray-200 pl-1.5 ml-0.5">
              <Settings className="w-3 h-3 text-gray-400" />
            </div>
          </div>

          {/* Phone pill */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white cursor-pointer hover:border-indigo-200 hover:bg-indigo-50 transition-all"
            onClick={() => navigate(getContextualPath("/call"))}
          >
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-mono text-gray-600">{phoneNumber}</span>
            <div className="border-l border-gray-200 pl-1.5 ml-0.5">
              <Settings className="w-3 h-3 text-gray-400" />
            </div>
          </div>

          {/* Voice pill */}
          <div className="relative">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white cursor-pointer hover:border-violet-200 hover:bg-violet-50 transition-all">
              <div className="flex items-center gap-1.5" onClick={() => setIsVoiceMenuOpen(true)}>
                <Volume2 className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-mono text-gray-600">{voiceDisplay}</span>
              </div>
              <div className="border-l border-gray-200 pl-1.5 ml-0.5">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsVoiceSettingsOpen(!isVoiceSettingsOpen); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Settings className="w-3 h-3" />
                </button>
              </div>
            </div>
            <VoiceSettingsDropdown
              isOpen={isVoiceSettingsOpen}
              onClose={() => setIsVoiceSettingsOpen(false)}
            />
          </div>

          {/* Toolkit toggle */}
          {activeTab === "Builder" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsToolkitOpen((p) => !p)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all text-xs font-medium ${
                isToolkitOpen
                  ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                  : "border-gray-200 bg-white text-gray-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Toolkit
              <ChevronRight className={`w-3 h-3 transition-transform ${isToolkitOpen ? "rotate-180" : ""}`} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            {activeTab === "Chat Lab"  && <ChatLabView />}
            {activeTab === "Voice Lab" && <VoiceLabView />}
            {activeTab === "Builder"   && renderBuilderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <GeneratePromptModal
        isOpen={isGeneratePromptModalOpen}
        onClose={() => setIsGeneratePromptModalOpen(false)}
      />
      <DynamicGreetingModal
        isOpen={isDynamicGreetingModalOpen}
        onClose={() => setIsDynamicGreetingModalOpen(false)}
      />
      <VoiceMenuDrawer isOpen={isVoiceMenuOpen} onClose={() => setIsVoiceMenuOpen(false)} />
    </div>
  );
};
