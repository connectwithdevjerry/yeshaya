import React, { useState } from "react";

export default function ResourcesTab() {
  const [assistantId, setAssistantId] = useState("");

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Resources</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Assistant Snapshots <span className="text-gray-500">(Added on creation)</span>
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Input the assistant ID to snapshot..."
              value={assistantId}
              onChange={(e) => setAssistantId(e.target.value)}
              className="flex-1 border rounded-md px-3 py-2 text-sm"
            />
            <button className="bg-gray-200 px-3 py-2 rounded-md text-sm hover:bg-gray-300">
              +
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center md:justify-end mt-6">
        <button className="bg-black text-white text-sm font-medium py-2 px-5 rounded-md hover:bg-gray-900">
          Save Changes
        </button>
      </div>
    </div>
  );
}
