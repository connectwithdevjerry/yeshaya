// src/components/components-ghl/Knowledge/UploadModal/FaqInputView.jsx
import React, { useState } from "react";
import { MessageSquare, Plus, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-gray-300";

const FaqInputView = ({ onClose, onBack, onNext }) => {
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);

  const addFaq    = () => setFaqs((p) => [...p, { question: "", answer: "" }]);
  const removeFaq = (i) => faqs.length > 1 && setFaqs((p) => p.filter((_, idx) => idx !== i));
  const update    = (i, field, val) => setFaqs((p) => p.map((f, idx) => idx === i ? { ...f, [field]: val } : f));

  const isValid = faqs.every((f) => f.question.trim() && f.answer.trim());

  return (
    <>
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Add FAQ pairs</p>
              <p className="text-xs text-gray-400 mt-0.5">{faqs.length} pair{faqs.length !== 1 ? "s" : ""} · all fields required</p>
            </div>
          </div>
          <button
            onClick={addFaq}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Pair
          </button>
        </div>

        <div className="max-h-[52vh] overflow-y-auto space-y-3 pr-0.5">
          <AnimatePresence>
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.18 }}
                className="bg-gray-50/70 rounded-2xl border border-gray-100 p-4 space-y-2.5 group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                    #{i + 1}
                  </span>
                  {faqs.length > 1 && (
                    <button
                      onClick={() => removeFaq(i)}
                      className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Question…"
                    value={faq.question}
                    onChange={(e) => update(i, "question", e.target.value)}
                    className={inputCls}
                  />
                  <textarea
                    placeholder="Answer…"
                    value={faq.answer}
                    onChange={(e) => update(i, "answer", e.target.value)}
                    rows={2}
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <button
          onClick={() => isValid && onNext(faqs)}
          disabled={!isValid}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow-md shadow-emerald-500/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
};

export default FaqInputView;
