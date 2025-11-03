// DynamicGreetingModal.jsx or included within the main file
import React, { useState } from "react";
import { X, Info } from "lucide-react"; // Info icon for the tooltip

const DynamicGreetingModal = ({ isOpen, onClose, onSave }) => {
  const [activeSegment, setActiveSegment] = useState("Outbound");
  const [greetingText, setGreetingText] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    // In a real application, you'd process the greetingText here,
    // potentially differentiating by activeSegment.
    // For this example, we'll just log and close.
    console.log(`Saving ${activeSegment} Greeting: ${greetingText}`);
    onSave({ segment: activeSegment, text: greetingText });
    onClose();
  };

  return (
    // Modal Overlay (fixed, full screen, semi-transparent background)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      {/* Modal Content */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 p-6 relative">
        {/* Header and Close Button */}
        <div className="flex justify-between items-start border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            Dynamic Greeting <span className="text-blue-500 font-mono text-sm ml-2">Greeting</span>
            <Info size={16} className="ml-2 text-gray-400 cursor-pointer" title="Information about the greeting variable" />
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Segment Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          {["Outbound", "Inbound"].map((segment) => (
            <button
              key={segment}
              onClick={() => setActiveSegment(segment)}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                activeSegment === segment
                  ? "border-b-2 border-blue-600 text-blue-600 font-bold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {segment}
            </button>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={greetingText}
          onChange={(e) => setGreetingText(e.target.value)}
          placeholder={`Type the ${activeSegment} greeting here...`}
          className="w-full min-h-[150px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
        />

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition shadow-md"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicGreetingModal; 