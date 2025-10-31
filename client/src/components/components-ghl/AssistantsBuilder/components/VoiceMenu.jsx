import React, { useState } from "react";
import {
  X,
  Heart,
  Search,
  ChevronDown,
  Copy,
  Import,
  Settings,
  Bot,
  Mic,
} from "lucide-react";
import CopyVoiceByIdModal from "./VoiceMenuModals/CopyVoiceByIdModal";
import ElevenLabsImportModal from "./VoiceMenuModals/LabsImportModal";
import CloneYourVoiceModal from "./VoiceMenuModals/CloneYourVoiceModal";

const VoiceCard = ({ name, provider, tags, likes, onAdd }) => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between h-48 hover:shadow-md transition duration-200">
    <div>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{name}</h3>
        <span className="flex items-center text-sm text-gray-500 ml-2">
          {likes} <Heart className="w-4 h-4 ml-1 text-red-400" />
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-2">{provider}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`px-2 py-0.5 text-xs rounded-full font-medium ${
              tag.toLowerCase() === "australian"
                ? "bg-purple-100 text-purple-700"
                : tag.toLowerCase() === "american"
                ? "bg-indigo-100 text-indigo-700"
                : tag.toLowerCase() === "male"
                ? "bg-blue-100 text-blue-700"
                : tag.toLowerCase() === "female"
                ? "bg-pink-100 text-pink-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="text-sm text-gray-400">Platform Voice</p>
    </div>

    <div className="mt-auto">
      <button
        onClick={onAdd}
        className="w-full mt-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
      >
        Add to assistant
      </button>
    </div>
  </div>
);

export const VoiceMenuDrawer = ({ isOpen, onClose }) => {
  const [isCopyVoiceModalOpen, setIsCopyVoiceModalOpen] = useState(false);
  const [isElevenLabsImportModalOpen, setIsElevenLabsImportModalOpen] =
    useState(false);
  const [isCloneVoiceModalOpen, setIsCloneVoiceModalOpen] = useState(false);

  const openCopyVoiceModal = () => setIsCopyVoiceModalOpen(true);
  const closeCopyVoiceModal = () => setIsCopyVoiceModalOpen(false);
  const openElevenLabsImportModal = () => setIsElevenLabsImportModalOpen(true);
  const closeElevenLabsImportModal = () =>
    setIsElevenLabsImportModalOpen(false);

  const handleDuplicateVoice = (voiceId) => {
    console.log(`Duplicating voice with ID: ${voiceId}`);
    closeCopyVoiceModal();
  };

  const handleImportVoice = (searchText) => {
    console.log(`Importing voice with search text: ${searchText}`);
    // Here you would execute the voice import API call
  };
  const openCloneVoiceModal = () => setIsCloneVoiceModalOpen(true);
  const closeCloneVoiceModal = () => setIsCloneVoiceModalOpen(false);
  const handleCloneVoice = (voiceName) => {
    console.log(`Cloning new voice: ${voiceName}`);
    // Here you would handle the voice cloning process
  };

  if (!isOpen) return null;

  const mockVoices = [
    {
      name: "Noah (en-AU)",
      provider: "Elevenlabs",
      likes: 13,
      tags: ["Australian", "male", "Middle Aged"],
    },
    {
      name: "Angie Vendedora Colombiana",
      provider: "Elevenlabs",
      likes: 12,
      tags: [],
    },
    {
      name: "Kate",
      provider: "Play",
      likes: 12,
      tags: ["American", "female", "Middle Aged"],
    },
    {
      name: "Max",
      provider: "Elevenlabs",
      likes: 12,
      tags: ["American", "male", "Middle Aged"],
    },
    { name: "Nathalia", provider: "Elevenlabs", likes: 11, tags: [] },
    {
      name: "Mark - Natural Conversations",
      provider: "Elevenlabs",
      likes: 11,
      tags: [],
    },
    {
      name: "Susan",
      provider: "Elevenlabs",
      likes: 11,
      tags: ["American", "female", "Middle Aged"],
    },
    {
      name: "Hope - Your Conversational Bestie",
      provider: "Elevenlabs",
      likes: 10,
      tags: [],
    },
    {
      name: "Hannah The Natural Australian Voice",
      provider: "Elevenlabs",
      likes: 10,
      tags: [],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 flex items-center justify-center">
      <div
        className="w-[95%] h-[95%] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 shadow-sm flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Voice menu</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between flex-shrink-0">
          <div className="relative flex-grow max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, type, ID, etc..."
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {["Age", "Gender", "Accent", "Provider", "Platform"].map(
              (filter) => (
                <button
                  key={filter}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md border border-gray-200 hover:bg-gray-200 transition"
                >
                  <span>{filter}</span>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
              )
            )}
          </div>
        </div>

        {/* 3. Voice Grid */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {mockVoices.map((voice) => (
              <VoiceCard
                key={voice.name}
                name={voice.name}
                provider={voice.provider}
                tags={voice.tags}
                likes={voice.likes}
                onAdd={() => console.log(`Adding ${voice.name}`)}
              />
            ))}
          </div>
        </div>

        {/* 4. Footer (Current user + Actions) */}
        <div className="flex justify-between items-center px-6 py-3 border-t border-gray-200 bg-white shadow-lg flex-shrink-0">
          <div className="flex items-center space-x-0.5">
            <Bot className="w-8 h-8  inline-block mr-2" />
            <p className="text-lg font-bold text-black">Sarah</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={openCopyVoiceModal}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
              <Copy className="w-4 h-4" />
              <span>Duplicate Voice</span>
            </button>
            <button
              onClick={openElevenLabsImportModal}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
              <Import className="w-4 h-4" />
              <span>Import Voice</span>
            </button>
            <button onClick={openCloneVoiceModal} className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition">
              <Mic className="w-4 h-4" />
              <span>Clone Voice</span>
            </button>
          </div>
        </div>
      </div>
      <CopyVoiceByIdModal
        isOpen={isCopyVoiceModalOpen}
        onClose={closeCopyVoiceModal}
        onDuplicate={handleDuplicateVoice}
      />

      <ElevenLabsImportModal
        isOpen={isElevenLabsImportModalOpen}
        onClose={closeElevenLabsImportModal}
        onImport={handleImportVoice}
      />

      <CloneYourVoiceModal
        isOpen={isCloneVoiceModalOpen}
        onClose={closeCloneVoiceModal}
        onClone={handleCloneVoice}
      />
    </div>
  );
};
