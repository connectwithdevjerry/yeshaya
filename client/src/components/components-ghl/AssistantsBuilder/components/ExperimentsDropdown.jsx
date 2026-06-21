import React from "react";
import { useSelector } from "react-redux";
import { CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { auditAssistant } from "../../../../utils/assistantAudit";

export const ExperimentsDropdown = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const selectedAssistant = useSelector((s) => s.assistants?.selectedAssistant);
  const { checks, issueCount } = auditAssistant(selectedAssistant);
  const total = checks.length;
  const passed = total - issueCount;

  return (
    <>
      {/* Backdrop to close when clicking outside */}
      <div className="fixed inset-0 z-[90]" onClick={onClose} />

      <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-800">Readiness Audit</h3>
          </div>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              issueCount === 0
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {passed}/{total} ready
          </span>
        </div>

        {/* Checks */}
        <div className="p-3 space-y-1.5 max-h-80 overflow-y-auto">
          {checks.map((item) => {
            const ok = item.status === "pass";
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-2.5 border border-gray-100 rounded-xl"
              >
                <div
                  className={`p-1.5 rounded-lg mt-0.5 flex-shrink-0 ${
                    ok ? "bg-emerald-50" : "bg-amber-50"
                  }`}
                >
                  {ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400 leading-snug">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 flex justify-between items-center border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {issueCount === 0
              ? "All checks passed"
              : `${issueCount} item${issueCount > 1 ? "s" : ""} need attention`}
          </span>
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-800 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};
