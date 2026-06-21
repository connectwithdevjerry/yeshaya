// src/components/components-ghl/AssistantsBuilder/components/VoiceMenu.jsx
import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  X, Heart, Search, ChevronDown, Volume2, Check, Loader2, Bot, SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { updateAssistant } from "../../../../store/slices/assistantsSlice";
import { getSubaccountIdFromUrl, getAssistantIdFromUrl } from "../../../../utils/urlUtils";
import CopyVoiceByIdModal from "./VoiceMenuModals/CopyVoiceByIdModal";
import ElevenLabsImportModal from "./VoiceMenuModals/LabsImportModal";
import CloneYourVoiceModal from "./VoiceMenuModals/CloneYourVoiceModal";

const PROVIDER_COLORS = {
  azure:       { pill: "bg-sky-100 text-sky-700",      dot: "bg-sky-400"     },
  openai:      { pill: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-400" },
  elevenlabs:  { pill: "bg-violet-100 text-violet-700", dot: "bg-violet-400"  },
};

const mockVoices = [
  { label: "Jenny (US)",    provider: "azure",  voiceId: "en-US-JennyNeural",    likes: 20, tags: ["American", "female", "assistant"] },
  { label: "Guy (US)",      provider: "azure",  voiceId: "en-US-GuyNeural",      likes: 18, tags: ["American", "male", "natural"] },
  { label: "Aria (US)",     provider: "azure",  voiceId: "en-US-AriaNeural",     likes: 19, tags: ["assistant", "friendly", "female"] },
  { label: "Sonia (UK)",    provider: "azure",  voiceId: "en-GB-SoniaNeural",    likes: 14, tags: ["British", "female"] },
  { label: "Nanami (JP)",   provider: "azure",  voiceId: "ja-JP-NanamiNeural",   likes: 22, tags: ["Japanese", "female", "polite"] },
  { label: "Davis (US)",    provider: "azure",  voiceId: "en-US-DavisNeural",    likes: 15, tags: ["professional", "male"] },
  { label: "Sara (US)",     provider: "azure",  voiceId: "en-US-SaraNeural",     likes: 14, tags: ["calm", "female"] },
  { label: "Brandon (US)",  provider: "azure",  voiceId: "en-US-BrandonNeural",  likes: 13, tags: ["male", "corporate"] },
  { label: "Ryan (UK)",     provider: "azure",  voiceId: "en-GB-RyanNeural",     likes: 13, tags: ["British", "male"] },
  { label: "Natasha (AU)",  provider: "azure",  voiceId: "en-AU-NatashaNeural",  likes: 12, tags: ["Australian", "female"] },
  { label: "William (AU)",  provider: "azure",  voiceId: "en-AU-WilliamNeural",  likes: 11, tags: ["Australian", "male"] },
  { label: "Alloy",         provider: "openai", voiceId: "alloy",                likes: 16, tags: ["neutral", "versatile"] },
  { label: "Nova",          provider: "openai", voiceId: "nova",                 likes: 15, tags: ["warm", "female"] },
  { label: "Onyx",          provider: "openai", voiceId: "onyx",                 likes: 14, tags: ["deep", "male"] },
  { label: "Shimmer",       provider: "openai", voiceId: "shimmer",              likes: 13, tags: ["soft", "friendly"] },
  { label: "Echo",          provider: "openai", voiceId: "echo",                 likes: 12, tags: ["assistant"] },
  { label: "Zephyr",        provider: "openai", voiceId: "zephyr",               likes: 11, tags: ["calm", "male"] },
  { label: "Luna",          provider: "openai", voiceId: "luna",                 likes: 10, tags: ["bright", "female"] },
];

const ProviderPill = ({ provider }) => {
  const cls = PROVIDER_COLORS[provider?.toLowerCase()] || { pill: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };
  return (
    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cls.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cls.dot}`} />
      {provider}
    </span>
  );
};

const VoiceCard = ({ label, provider, tags, likes, onAdd, isSelected, isSaving }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`relative bg-white border rounded-2xl p-4 flex flex-col justify-between h-44 transition-all duration-200 ${
      isSelected
        ? "border-indigo-300 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/10"
        : "border-gray-100 hover:border-indigo-200 hover:shadow-sm"
    }`}
  >
    {isSelected && (
      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
        <Check className="w-3 h-3 text-white" />
      </div>
    )}
    <div>
      <h3 className="text-sm font-bold text-gray-800 truncate pr-7 mb-2">{label}</h3>
      <ProviderPill provider={provider} />
      <div className="flex flex-wrap gap-1 mt-2">
        {tags.slice(0, 3).map((tag) => (
          <span key={tag} className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-500">
            {tag}
          </span>
        ))}
      </div>
    </div>
    <div className="flex items-center justify-between mt-2">
      <span className="flex items-center gap-1 text-xs text-gray-400">
        <Heart className="w-3 h-3 text-rose-400" /> {likes}
      </span>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onAdd}
        disabled={isSaving}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
          isSelected
            ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/20"
            : "border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
        } disabled:opacity-60`}
      >
        {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : isSelected ? <Check className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
        {isSelected ? "Applied" : "Use voice"}
      </motion.button>
    </div>
  </motion.div>
);

const FilterDropdown = ({ label, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
          value !== "All"
            ? "border-indigo-200 bg-indigo-50 text-indigo-600"
            : "border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
        }`}
      >
        {label}: <span className="font-bold">{value}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full mt-1 right-0 w-36 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1"
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`flex items-center justify-between w-full px-3 py-2 text-xs transition-colors ${
                  value === opt ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {opt}
                {value === opt && <Check className="w-3 h-3 text-indigo-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const VoiceMenuDrawer = ({ isOpen, onClose }) => {
  const dispatch     = useDispatch();
  const { selectedAssistant } = useSelector((s) => s.assistants);
  const [searchParams] = useSearchParams();

  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const assistantId  = getAssistantIdFromUrl(searchParams);

  const [searchQuery,       setSearchQuery]       = useState("");
  const [selectedProvider,  setSelectedProvider]  = useState("All");
  const [selectedGender,    setSelectedGender]    = useState("All");
  const [selectedAccent,    setSelectedAccent]    = useState("All");
  const [savingVoiceId,     setSavingVoiceId]     = useState(null);

  const hasTag = (v, t) => v.tags.some((tag) => tag.toLowerCase() === t.toLowerCase());

  const [isCopyVoiceModalOpen,        setIsCopyVoiceModalOpen]        = useState(false);
  const [isElevenLabsImportModalOpen, setIsElevenLabsImportModalOpen] = useState(false);
  const [isCloneVoiceModalOpen,       setIsCloneVoiceModalOpen]       = useState(false);

  const filteredVoices = useMemo(() => mockVoices.filter((v) => {
    const matchSearch   = v.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchProvider = selectedProvider === "All" || v.provider.toLowerCase() === selectedProvider.toLowerCase();
    const matchGender   = selectedGender === "All" || hasTag(v, selectedGender);
    const matchAccent   = selectedAccent === "All" || hasTag(v, selectedAccent);
    return matchSearch && matchProvider && matchGender && matchAccent;
  }), [searchQuery, selectedProvider, selectedGender, selectedAccent]);

  const handleAddVoice = async (voice) => {
    if (!subaccountId || !assistantId) { toast.error("Missing IDs"); return; }
    setSavingVoiceId(voice.voiceId);
    try {
      await dispatch(updateAssistant({
        subaccountId, assistantId,
        updateData: { voice: { provider: voice.provider, voiceId: voice.voiceId } },
      })).unwrap();
      toast.success(`"${voice.label}" applied!`);
    } catch {
      toast.error("Failed to save voice");
    } finally {
      setSavingVoiceId(null);
    }
  };

  const isVoiceSelected = (voiceId) => selectedAssistant?.voice?.voiceId === voiceId;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="w-full max-w-6xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                    <Volume2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Voice Library</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{mockVoices.length} voices available</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filters */}
              <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-gray-50/40">
                <div className="relative flex-grow max-w-sm w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                  <input
                    type="text"
                    placeholder="Search by name or tag…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-300"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
                  <FilterDropdown
                    label="Provider"
                    options={["All", "Azure", "OpenAI", "ElevenLabs"]}
                    value={selectedProvider}
                    onChange={setSelectedProvider}
                  />
                  <FilterDropdown
                    label="Gender"
                    options={["All", "Female", "Male"]}
                    value={selectedGender}
                    onChange={setSelectedGender}
                  />
                  <FilterDropdown
                    label="Accent"
                    options={["All", "American", "British", "Australian", "Japanese"]}
                    value={selectedAccent}
                    onChange={setSelectedAccent}
                  />
                </div>
              </div>

              {/* Voice grid */}
              <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30">
                {filteredVoices.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    <AnimatePresence>
                      {filteredVoices.map((voice, i) => (
                        <motion.div
                          key={voice.voiceId}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          <VoiceCard
                            {...voice}
                            isSelected={isVoiceSelected(voice.voiceId)}
                            isSaving={savingVoiceId === voice.voiceId}
                            onAdd={() => handleAddVoice(voice)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <Volume2 className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">No voices match your filters</p>
                    <button
                      onClick={() => { setSearchQuery(""); setSelectedProvider("All"); setSelectedGender("All"); setSelectedAccent("All"); }}
                      className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
                    >
                      Reset filters
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {selectedAssistant?.name || "Assistant"}
                  </span>
                  {selectedAssistant?.voice?.voiceId && (
                    <span className="text-xs text-gray-400 font-mono">· {selectedAssistant.voice.voiceId}</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {filteredVoices.length} result{filteredVoices.length !== 1 ? "s" : ""}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CopyVoiceByIdModal    isOpen={isCopyVoiceModalOpen}        onClose={() => setIsCopyVoiceModalOpen(false)} />
      <ElevenLabsImportModal isOpen={isElevenLabsImportModalOpen} onClose={() => setIsElevenLabsImportModalOpen(false)} />
      <CloneYourVoiceModal   isOpen={isCloneVoiceModalOpen}       onClose={() => setIsCloneVoiceModalOpen(false)} />
    </>
  );
};
