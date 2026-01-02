import React from "react";
import { X, Calendar as CalendarIcon, ExternalLink, Trash2, RefreshCw } from "lucide-react";

const calendars = [
  { id: 1, name: "Veronique Upscale's Personal Calendar", code: "AM29...ALVA", current: true },
  { id: 2, name: "Testing", code: "EXSK...7GE8", current: false },
  { id: 3, name: "Cynthia Upscale's Personal Calendar", code: "FJFe...ljpf", current: false },
  { id: 4, name: "Alain Upscale's Personal Calendar", code: "Fkp1...xi0g", current: false },
  { id: 5, name: "Allen St Surin's Personal Calendar", code: "lhHT...q7d0", current: false },
  { id: 6, name: "Princess Upscale's Personal Calendar", code: "PFLq...BODG", current: false },
  { id: 7, name: "Junia Upscale's Personal Calendar", code: "Qrny...UPal", current: false },
  { id: 8, name: "James Alteus's Personal Calendar", code: "T4Th...UYF6", current: false },
  { id: 9, name: "My Booking", code: "VcyX...0D08", current: false },
];

export const CalendarModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      {/* Increased width to 5xl and added a taller min-height */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90 vh] flex flex-col overflow-hidden transition-all duration-300">
        
        {/* Header - More Padding */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-white">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Calendars</h2>
            <p className="text-sm text-gray-500">Manage and sync your connected booking calendars</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-all border border-transparent hover:border-gray-200"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content Section - Increased Grid Spacing */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#fafafa]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calendars.map((cal) => (
              <div 
                key={cal.id} 
                className={`flex flex-col p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-md ${
                  cal.current 
                    ? "border-blue-500 bg-blue-50/40 ring-4 ring-blue-500/5" 
                    : "border-white bg-white"
                }`}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-red-50 rounded-xl shrink-0">
                    <CalendarIcon className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-[15px] text-gray-900 truncate leading-tight mb-1">
                      {cal.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono tracking-tighter">
                      {cal.code}
                    </p>
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 mt-3 hover:underline">
                      Booking Page <ExternalLink size={12} />
                    </button>
                  </div>
                </div>

                {/* Footer buttons of the card */}
                <div className="mt-auto flex items-center gap-2">
                  <button className="p-2.5 border border-red-100 rounded-xl text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={16} />
                  </button>
                  <button className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                    cal.current 
                      ? "bg-white border border-gray-200 text-gray-400 cursor-default" 
                      : "bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 shadow-sm"
                  }`}>
                    {cal.current ? "Current Calendar" : "Select Calendar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer - Sturdier Button */}
        <div className="px-8 py-5 border-t border-gray-100 flex justify-end bg-white">
          <button className="flex items-center gap-3 bg-[#0f172a] text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
            <RefreshCw size={18} className="animate-hover" /> 
            Sync Calendars
          </button>
        </div>
      </div>
    </div>
  );
};