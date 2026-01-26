import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  X,
  Heart,
  Search,
  ChevronDown,
  Copy,
  Import,
  Bot,
  Mic,
} from "lucide-react";
import toast from "react-hot-toast";
import { updateAssistant } from "../../../../store/slices/assistantsSlice";
import {
  getSubaccountIdFromUrl,
  getAssistantIdFromUrl,
} from "../../../../utils/urlUtils";
import CopyVoiceByIdModal from "./VoiceMenuModals/CopyVoiceByIdModal";
import ElevenLabsImportModal from "./VoiceMenuModals/LabsImportModal";
import CloneYourVoiceModal from "./VoiceMenuModals/CloneYourVoiceModal";

const mockVoices = [
  // --- AZURE VOICES ---
  { label: "Jenny (US)", provider: "azure", voiceId: "en-US-JennyNeural", likes: 20, tags: ["American", "female", "assistant"] },
  { label: "Guy (US)", provider: "azure", voiceId: "en-US-GuyNeural", likes: 18, tags: ["American", "male", "natural"] },
  { label: "Aria (US)", provider: "azure", voiceId: "en-US-AriaNeural", likes: 19, tags: ["assistant", "friendly", "female"] },
  { label: "Sonia (UK)", provider: "azure", voiceId: "en-GB-SoniaNeural", likes: 14, tags: ["British", "female"] },
  { label: "Nanami (JP)", provider: "azure", voiceId: "ja-JP-NanamiNeural", likes: 22, tags: ["Japanese", "female", "polite"] },
  {
    label: "Davis (US)",
    provider: "azure",
    voiceId: "en-US-DavisNeural",
    likes: 15,
    tags: ["professional", "male"],
  },
  {
    label: "Sara (US)",
    provider: "azure",
    voiceId: "en-US-SaraNeural",
    likes: 14,
    tags: ["calm", "female"],
  },
  {
    label: "Brandon (US)",
    provider: "azure",
    voiceId: "en-US-BrandonNeural",
    likes: 13,
    tags: ["male", "corporate"],
  },
  {
    label: "Ryan (UK)",
    provider: "azure",
    voiceId: "en-GB-RyanNeural",
    likes: 13,
    tags: ["British", "male"],
  },
  {
    label: "Natasha (AU)",
    provider: "azure",
    voiceId: "en-AU-NatashaNeural",
    likes: 12,
    tags: ["Australian", "female"],
  },
  {
    label: "William (AU)",
    provider: "azure",
    voiceId: "en-AU-WilliamNeural",
    likes: 11,
    tags: ["Australian", "male"],
  },
  
  // --- OPENAI VOICES ---
  { label: "Alloy", provider: "openai", voiceId: "alloy", likes: 16, tags: ["neutral", "versatile"] },
  { label: "Nova", provider: "openai", voiceId: "nova", likes: 15, tags: ["warm", "female"] },
  { label: "Onyx", provider: "openai", voiceId: "onyx", likes: 14, tags: ["deep", "male"] },
  { label: "Shimmer", provider: "openai", voiceId: "shimmer", likes: 13, tags: ["soft", "friendly"] },
    {
    label: "Echo",
    provider: "openai",
    voiceId: "echo",
    likes: 12,
    tags: ["assistant"],
  },
  {
    label: "Zephyr",
    provider: "openai",
    voiceId: "zephyr",
    likes: 11,
    tags: ["calm", "male"],
  },
  {
    label: "Luna",
    provider: "openai",
    voiceId: "luna",
    likes: 10,
    tags: ["bright", "female"],
  },
  
];

const VoiceCard = ({ label, provider, tags, likes, onAdd, isSelected }) => (
  <div className={`bg-white border ${isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"} rounded-lg shadow-sm p-4 flex flex-col justify-between h-48 hover:shadow-md transition duration-200`}>
    <div>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{label}</h3>
        <span className="flex items-center text-sm text-gray-500 ml-2">
          {likes} <Heart className="w-4 h-4 ml-1 text-red-400" />
        </span>
      </div>
      <p className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wider">{provider}</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {tags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 text-xs rounded-full font-medium bg-gray-100 text-gray-700">{tag}</span>
        ))}
      </div>
    </div>
    <button
      onClick={onAdd}
      className={`w-full py-1.5 text-sm border rounded-md transition ${
        isSelected ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" : "border-gray-300 hover:bg-gray-100"
      }`}
    >
      {isSelected ? "Selected" : "Add to assistant"}
    </button>
  </div>
);

export const VoiceMenuDrawer = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { selectedAssistant } = useSelector((state) => state.assistants);
  const [searchParams] = useSearchParams();

  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const assistantId = getAssistantIdFromUrl(searchParams);

  // --- State for Filters ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("All");
  const [isProviderFilterOpen, setIsProviderFilterOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- Modals State ---
  const [isCopyVoiceModalOpen, setIsCopyVoiceModalOpen] = useState(false);
  const [isElevenLabsImportModalOpen, setIsElevenLabsImportModalOpen] = useState(false);
  const [isCloneVoiceModalOpen, setIsCloneVoiceModalOpen] = useState(false);

  // --- Filter Logic ---
  const filteredVoices = useMemo(() => {
    return mockVoices.filter((voice) => {
      const matchesSearch = 
        voice.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voice.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesProvider = 
        selectedProvider === "All" || 
        voice.provider.toLowerCase() === selectedProvider.toLowerCase();

      return matchesSearch && matchesProvider;
    });
  }, [searchQuery, selectedProvider]);

  if (!isOpen) return null;

  const handleAddVoice = async (voice) => {
    if (!subaccountId || !assistantId) {
      toast.error('Missing subaccount or assistant ID');
      return;
    }

    setIsSaving(true);

    try {
      const updateData = {
        voice: {
          provider: voice.provider,
          voiceId: voice.voiceId,
        },
      };

      await dispatch(
        updateAssistant({ subaccountId, assistantId, updateData })
      ).unwrap();

      toast.success(`Voice "${voice.label}" applied successfully!`);
    } catch (error) {
      console.error('❌ Error saving voice:', error);
      toast.error('Failed to save voice');
    } finally {
      setIsSaving(false);
    }
  };

  const isVoiceSelected = (voiceId) => selectedAssistant?.voice?.voiceId === voiceId;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 flex items-center justify-center">
      <div className="w-[95%] h-[95%] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Voice menu</h2>
          <button onClick={onClose}><X /></button>
        </div>

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-grow max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Functional Provider Filter */}
            <div className="relative">
              <button 
                onClick={() => setIsProviderFilterOpen(!isProviderFilterOpen)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md border border-gray-200 hover:bg-gray-200 transition"
              >
                <span>Provider: {selectedProvider}</span>
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isProviderFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProviderFilterOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1">
                  {["All", "Azure", "OpenAI", "ElevenLabs"].map((p) => (
                    <button
                      key={p}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => {
                        setSelectedProvider(p);
                        setIsProviderFilterOpen(false);
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Visual Placeholders for other filters */}
            {["Age", "Gender", "Accent"].map((filter) => (
              <button key={filter} className="flex items-center px-3 py-2 text-sm font-medium text-gray-400 bg-gray-50 rounded-md border border-gray-100 cursor-not-allowed">
                <span>{filter}</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Grid Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {isSaving && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-700">Updating Assistant Voice...</span>
            </div>
          )}

          {filteredVoices.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredVoices.map((voice) => (
                <VoiceCard
                  key={voice.voiceId}
                  {...voice}
                  isSelected={isVoiceSelected(voice.voiceId)}
                  onAdd={() => handleAddVoice(voice)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p>No voices found matching your criteria.</p>
              <button 
                onClick={() => {setSearchQuery(""); setSelectedProvider("All");}}
                className="mt-2 text-blue-600 hover:underline text-sm"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-3 border-t bg-white">
          <div className="flex items-center space-x-2">
            <Bot className="w-6 h-6 text-blue-600" />
            <span className="font-semibold">{selectedAssistant?.name || "Assistant"}</span>
          </div>
        </div>
      </div>

      <CopyVoiceByIdModal isOpen={isCopyVoiceModalOpen} onClose={() => setIsCopyVoiceModalOpen(false)} />
      <ElevenLabsImportModal isOpen={isElevenLabsImportModalOpen} onClose={() => setIsElevenLabsImportModalOpen(false)} />
      <CloneYourVoiceModal isOpen={isCloneVoiceModalOpen} onClose={() => setIsCloneVoiceModalOpen(false)} />
    </div>
  );
};