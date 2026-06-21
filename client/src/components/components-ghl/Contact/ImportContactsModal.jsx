// src/components/components-ghl/Contact/ImportContactsModal.jsx
import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import {
  X, UploadCloud, FileText, Loader2, CheckCircle2,
  AlertTriangle, ArrowRight, Download, Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { importContacts, fetchContacts } from "../../../store/slices/assistantsSlice";

// Possible CSV header → contact field aliases
const FIELD_ALIASES = {
  firstName: ["firstname", "first name", "first", "fname", "given name"],
  lastName:  ["lastname", "last name", "last", "lname", "surname", "family name"],
  email:     ["email", "email address", "e-mail", "mail"],
  phone:     ["phone", "phone number", "mobile", "cell", "telephone", "tel"],
  company:   ["company", "organization", "organisation", "business"],
  title:     ["title", "job title", "position", "role"],
  linkedin:  ["linkedin", "linkedin url", "linked in"],
};

// Map a CSV row's keys to our contact fields
const mapRow = (row) => {
  const contact = {};
  Object.entries(row).forEach(([key, value]) => {
    const norm = key.trim().toLowerCase();
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      if (aliases.includes(norm)) {
        contact[field] = (value || "").trim();
        break;
      }
    }
  });
  return contact;
};

const StatPill = ({ label, value, color }) => (
  <div className={`flex-1 rounded-xl p-3 text-center ${color}`}>
    <p className="text-2xl font-black tabular-nums">{value}</p>
    <p className="text-[11px] font-medium mt-0.5 opacity-80">{label}</p>
  </div>
);

const ImportContactsModal = ({ isOpen, onClose, subaccountId }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [parsed,    setParsed]    = useState([]);   // mapped contact objects
  const [fileName,  setFileName]  = useState("");
  const [importing, setImporting] = useState(false);
  const [result,    setResult]    = useState(null); // { added, merged, skipped, errors }

  const reset = () => {
    setParsed([]); setFileName(""); setResult(null); setImporting(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a .csv file");
      return;
    }
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const mapped = results.data
          .map(mapRow)
          .filter((c) => c.firstName || c.email || c.phone);
        if (mapped.length === 0) {
          toast.error("No valid rows found. Check your column headers.");
          return;
        }
        setParsed(mapped);
        toast.success(`Parsed ${mapped.length} contacts`);
      },
      error: () => toast.error("Failed to parse CSV file"),
    });
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await dispatch(importContacts({ subaccountId, contacts: parsed })).unwrap();
      setResult(res);
      dispatch(fetchContacts({ subaccountId }));
      toast.success("Import complete");
    } catch (err) {
      toast.error(err || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = "firstName,lastName,email,phone,company,title,linkedin\nJane,Doe,jane@example.com,+15550001234,Acme Inc,CEO,janedoe\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "contacts_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                <UploadCloud className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Import Contacts</h3>
                <p className="text-xs text-gray-400 mt-0.5">Upload a CSV file to bulk add contacts</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* ── Result view ── */}
            {result ? (
              <div className="space-y-5">
                <div className="flex flex-col items-center text-center py-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h4 className="text-base font-bold text-gray-900">Import Complete</h4>
                  <p className="text-xs text-gray-500 mt-1">Your contacts have been processed.</p>
                </div>

                <div className="flex gap-2">
                  <StatPill label="Added"   value={result.added}   color="bg-emerald-50 text-emerald-700" />
                  <StatPill label="Merged"  value={result.merged}  color="bg-blue-50 text-blue-700" />
                  <StatPill label="Skipped" value={result.skipped} color="bg-gray-100 text-gray-600" />
                </div>

                {result.errors?.length > 0 && (
                  <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <p className="text-xs font-semibold text-amber-700">{result.errors.length} skipped rows</p>
                    </div>
                    <div className="max-h-28 overflow-y-auto space-y-1">
                      {result.errors.slice(0, 20).map((e, i) => (
                        <p key={i} className="text-[11px] text-amber-600">Row {e.row}: {e.reason}</p>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md hover:brightness-110 transition-all"
                >
                  Done
                </button>
              </div>
            ) : parsed.length === 0 ? (
              /* ── Upload view ── */
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                    <UploadCloud className="w-6 h-6 text-indigo-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-400 mt-1">CSV file up to 1000 contacts</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                </div>

                <button
                  onClick={downloadTemplate}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download CSV template
                </button>

                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    <span className="font-semibold text-gray-600">Supported columns:</span> firstName, lastName, email, phone, company, title, linkedin. Column names are matched flexibly (e.g. "First Name", "E-mail", "Mobile").
                  </p>
                </div>
              </div>
            ) : (
              /* ── Preview view ── */
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                  <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700 truncate flex-1">{fileName}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
                    <Users className="w-3.5 h-3.5" /> {parsed.length}
                  </span>
                </div>

                {/* Preview table */}
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="grid grid-cols-3 gap-2 px-3 py-2 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    <span>Name</span><span>Email</span><span>Phone</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                    {parsed.slice(0, 50).map((c, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2 px-3 py-2 text-xs">
                        <span className="font-medium text-gray-700 truncate">{[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}</span>
                        <span className="text-gray-500 truncate">{c.email || "—"}</span>
                        <span className="text-gray-500 truncate">{c.phone || "—"}</span>
                      </div>
                    ))}
                  </div>
                  {parsed.length > 50 && (
                    <p className="text-[11px] text-gray-400 text-center py-2 bg-gray-50/50">+ {parsed.length - 50} more rows</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={reset}
                    disabled={importing}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    Choose another file
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md hover:brightness-110 transition-all disabled:opacity-60"
                  >
                    {importing
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</>
                      : <>Import {parsed.length} <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImportContactsModal;
