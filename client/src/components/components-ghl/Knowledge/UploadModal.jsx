// src/components/components-ghl/Knowledge/UploadModal.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Type, MessageSquare, FolderUp, Globe, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TextInputView  from "./UploadModal/TextInputView";
import NameInputView  from "./NameInputView";
import FaqInputView   from "./UploadModal/FaqInputView";
import FileInputView  from "./UploadModal/FileInputView";
import UrlInputView   from "./UploadModal/UrlInputView";
import { addKnowledgeBase, clearKnowledgeBaseError } from "../../../store/slices/assistantsSlice";
import { toast } from "react-hot-toast";
import { getSubaccountIdFromUrl } from "../../../utils/urlUtils";
import { useSearchParams } from "react-router-dom";

/* ── source type options ── */
const SOURCE_TYPES = [
  {
    id:       "text",
    label:    "Plain Text",
    desc:     "Paste or type content to be embedded.",
    icon:     Type,
    gradient: "from-indigo-500 to-violet-500",
    soft:     "bg-indigo-50",
    text:     "text-indigo-500",
  },
  {
    id:       "faq",
    label:    "FAQ",
    desc:     "Add question & answer pairs.",
    icon:     MessageSquare,
    gradient: "from-emerald-500 to-teal-500",
    soft:     "bg-emerald-50",
    text:     "text-emerald-500",
  },
  {
    id:       "file",
    label:    "File Upload",
    desc:     "Upload a PDF, DOCX, or TXT file.",
    icon:     FolderUp,
    gradient: "from-violet-500 to-purple-500",
    soft:     "bg-violet-50",
    text:     "text-violet-500",
  },
  {
    id:       "url",
    label:    "Website URL",
    desc:     "Scrape a web page for content.",
    icon:     Globe,
    gradient: "from-orange-500 to-amber-500",
    soft:     "bg-orange-50",
    text:     "text-orange-500",
  },
];

/* ── step label map ── */
const STEP_LABELS = {
  selection: "Choose Source",
  text:      "Enter Content",
  faq:       "Enter Content",
  file:      "Upload File",
  url:       "Enter URL",
  name:      "Name It",
};

const STEP_ORDER = ["selection", "content", "name"];

const getStepIndex = (step) => {
  if (step === "selection") return 0;
  if (step === "name")      return 2;
  return 1;
};

/* ── stepper ── */
const Stepper = ({ currentStep }) => {
  const idx = getStepIndex(currentStep);
  return (
    <div className="flex items-center gap-0 px-6 py-3 border-b border-gray-100 bg-gray-50/60">
      {["Source", "Content", "Name"].map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
              ${i < idx  ? "bg-indigo-500 text-white"
              : i === idx ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30"
              : "bg-gray-100 text-gray-400"}`}
            >
              {i < idx ? "✓" : i + 1}
            </div>
            <span className={`text-xs font-medium transition-colors
              ${i === idx ? "text-indigo-600" : i < idx ? "text-gray-500" : "text-gray-300"}`}>
              {label}
            </span>
          </div>
          {i < 2 && (
            <div className={`flex-1 h-px mx-3 transition-colors ${i < idx ? "bg-indigo-300" : "bg-gray-200"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const UploadModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const [currentStep, setCurrentStep] = useState("selection");
  const [uploadData,  setUploadData]  = useState({ type: "", content: null });
  const [direction,   setDirection]   = useState(1); // 1 = forward, -1 = back

  const { addingKnowledgeBase, knowledgeBaseError } = useSelector((s) => s.assistants);

  if (!isOpen) return null;

  const goTo = (step, dir = 1) => { setDirection(dir); setCurrentStep(step); };

  const handleSelect = (id) => {
    setUploadData({ type: id, content: null });
    goTo(id, 1);
  };

  const handleClose = () => {
    setCurrentStep("selection");
    setUploadData({ type: "", content: null });
    setDirection(1);
    dispatch(clearKnowledgeBaseError());
    onClose();
  };

  const handleContentReady = (content) => {
    setUploadData((p) => ({ ...p, content }));
    goTo("name", 1);
  };

  const handleBack = () => {
    if (currentStep === "name") {
      goTo(uploadData.type, -1);
    } else {
      goTo("selection", -1);
    }
  };

  const handleFinalUpload = async (title) => {
    if (!uploadData.content || !title.trim()) {
      toast.error("Please provide all required information");
      return;
    }
    try {
      let knowledgeBaseUrl = uploadData.content;
      if (uploadData.type === "faq") knowledgeBaseUrl = JSON.stringify(uploadData.content);
      if (uploadData.type === "file") knowledgeBaseUrl = uploadData.content;
      await dispatch(addKnowledgeBase({ knowledgeBaseUrl, title: title.trim(), type: uploadData.type, subaccountId })).unwrap();
      toast.success("Knowledge base added!");
      handleClose();
    } catch (err) {
      toast.error(err || "Failed to add knowledge base");
    }
  };

  const variants = {
    enter:  (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit:   (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  const modalWidth =
    currentStep === "text" ? "max-w-2xl" :
    currentStep === "name" ? "max-w-sm"  : "max-w-lg";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        key={modalWidth}
        layout
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className={`bg-white rounded-2xl shadow-2xl w-full ${modalWidth} overflow-hidden`}
      >
        {/* ── Modal header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">New Knowledge Base</h2>
              <p className="text-xs text-gray-400 mt-0.5">{STEP_LABELS[currentStep]}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Stepper ── */}
        <Stepper currentStep={currentStep} />

        {/* ── Animated step body ── */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {/* Selection */}
            {currentStep === "selection" && (
              <div className="p-5 space-y-3">
                {SOURCE_TYPES.map((opt) => (
                  <motion.button
                    key={opt.id}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(opt.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all group text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${opt.gradient} flex items-center justify-center shadow-sm flex-shrink-0`}>
                      <opt.icon className="w-4.5 h-4.5 text-white" size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-gray-200 group-hover:border-indigo-400 flex items-center justify-center flex-shrink-0 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.button>
                ))}
                <div className="flex justify-end pt-1">
                  <button onClick={handleClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {currentStep === "text" && (
              <TextInputView onClose={handleClose} onBack={handleBack} onNext={handleContentReady} />
            )}
            {currentStep === "faq" && (
              <FaqInputView onClose={handleClose} onBack={handleBack} onNext={handleContentReady} />
            )}
            {currentStep === "url" && (
              <UrlInputView onClose={handleClose} onBack={handleBack} onNext={handleContentReady} />
            )}
            {currentStep === "file" && (
              <FileInputView onClose={handleClose} onBack={handleBack} onNext={handleContentReady} />
            )}
            {currentStep === "name" && (
              <NameInputView
                onClose={handleClose}
                onBack={handleBack}
                onUpload={handleFinalUpload}
                isLoading={addingKnowledgeBase}
                error={knowledgeBaseError}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default UploadModal;
