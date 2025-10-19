import React from "react";
import { Wifi } from "lucide-react";

const OauthConnectionPopup = ({ onClose }) => (
  <div className="absolute right-4 z-50 w-80 bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800">Oauth Connection</h3>
      <Wifi className="w-5 h-5 text-gray-400" />
    </div>

    {/* Connection Status Card */}
    <div className="p-4">
      <div className="flex items-center p-4 bg-indigo-50 border border-indigo-200 rounded-md">
        <div className="mr-4 p-2 rounded-full bg-indigo-200 text-indigo-700">
          <Wifi className="w-5 h-5" />
        </div>
        <div>
          <div className="text-base font-semibold text-gray-800">Connection</div>
          <div className="text-sm text-indigo-600">Connection up-to-date</div>
        </div>
      </div>
    </div>
    
    {/* Footer */}
    <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100"
      >
        Close
      </button>
    </div>
  </div>
);

export default OauthConnectionPopup;