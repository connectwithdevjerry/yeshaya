import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Type, ListOrdered, FolderUp, Globe } from "lucide-react";
import TextInputView from "./UploadModal/TextInputView";
import NameInputView from "./NameInputView";
import FaqInputView from "./UploadModal/FaqInputView";
import FileInputView from "./UploadModal/FileInputView";
import UrlInputView from "./UploadModal/UrlInputView";
import {
  addKnowledgeBase,
  clearKnowledgeBaseError,
} from "../../../store/slices/assistantsSlice";
import { toast } from "react-hot-toast";

const UploadModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState("selection");
  const [uploadData, setUploadData] = useState({
    type: "",
    content: null,
  });

  const { addingKnowledgeBase, knowledgeBaseError } = useSelector(
    (state) => state.assistants
  );

  if (!isOpen) return null;

  const handleSelect = (id) => {
    setUploadData({ type: id, content: null });

    if (id === "text") setCurrentStep("text");
    if (id === "faq") setCurrentStep("faq");
    if (id === "file") setCurrentStep("file");
    if (id === "url") setCurrentStep("url");
  };

  const handleClose = () => {
    setCurrentStep("selection");
    setUploadData({ type: "", content: null });
    dispatch(clearKnowledgeBaseError());
    onClose();
  };

  // Handle data from each input view
  const handleContentReady = (content) => {
    setUploadData((prev) => ({ ...prev, content }));
    setCurrentStep("name");
  };

  const handleFinalUpload = async (title) => {
    if (!uploadData.content || !title.trim()) {
      toast.error("Please provide all required information");
      return;
    }

    try {
      let knowledgeBaseUrl = uploadData.content;

      // Format content based on type
      if (uploadData.type === "faq") {
        // Send FAQs as a JSON string
        knowledgeBaseUrl = JSON.stringify(uploadData.content);
      } else if (uploadData.type === "file") {
        // IMPORTANT: knowledgeBaseUrl is now the actual File object
        // No changes needed here, uploadData.content already holds the File from FileInputView
        knowledgeBaseUrl = uploadData.content;
      }

      const payload = {
        knowledgeBaseUrl, // This will be a File object if type is 'file'
        title: title.trim(),
        type: uploadData.type,
      };

      console.log("📤 Dispatching to Thunk:", payload);

      // Unwrap allows us to catch errors directly in this try/catch block
      await dispatch(addKnowledgeBase(payload)).unwrap();

      toast.success("Knowledge base added successfully!");
      handleClose();
    } catch (error) {
      console.error("Failed to add knowledge base:", error);
      toast.error(error || "Failed to add knowledge base");
    }
  };
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Dynamic max-width based on step */}
      <div
        className={`bg-white rounded-xl shadow-xl w-full transition-all duration-300 overflow-hidden ${
          currentStep === "selection"
            ? "max-w-lg"
            : currentStep === "text"
            ? "max-w-2xl"
            : "max-w-md" // NameInputView is the smallest
        }`}
      >
        {currentStep === "selection" && (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-800">Upload</h2>
                <div className="w-5 h-5 border border-gray-300 rounded-full flex items-center justify-center text-[10px] text-gray-500 font-bold cursor-help">
                  i
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {[
                {
                  id: "text",
                  title: "text",
                  desc: "Input plain text to be stored.",
                  icon: <Type />,
                },
                {
                  id: "faq",
                  title: "faq",
                  desc: "Input FAQs to be stored.",
                  icon: <ListOrdered />,
                },
                {
                  id: "file",
                  title: "file",
                  desc: "Upload a file to be stored.",
                  icon: <FolderUp />,
                },
                {
                  id: "url",
                  title: "url",
                  desc: "Scrape a URL to store data.",
                  icon: <Globe />,
                },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 cursor-pointer transition-all hover:border-purple-600 hover:bg-purple-50/30 group"
                >
                  <div className="bg-black text-white p-3 rounded-lg group-hover:scale-105 transition-transform">
                    {React.cloneElement(opt.icon, { className: "w-5 h-5" })}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-gray-900 capitalize">
                      {opt.title}
                    </h3>
                    <p className="text-sm text-gray-500">{opt.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50/50">
              <button
                onClick={handleClose}
                className="px-5 py-2 text-gray-600 font-medium hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </>
        )}

        {currentStep === "text" && (
          <TextInputView
            onClose={handleClose}
            onBack={() => setCurrentStep("selection")}
            onNext={handleContentReady}
          />
        )}

        {currentStep === "faq" && (
          <FaqInputView
            onClose={handleClose}
            onBack={() => setCurrentStep("selection")}
            onNext={handleContentReady}
          />
        )}

        {currentStep === "url" && (
          <UrlInputView
            onClose={handleClose}
            onBack={() => setCurrentStep("selection")}
            onNext={handleContentReady}
          />
        )}

        {currentStep === "file" && (
          <FileInputView
            onClose={handleClose}
            onBack={() => setCurrentStep("selection")}
            onNext={handleContentReady}
          />
        )}

        {currentStep === "name" && (
          <NameInputView
            onClose={handleClose}
            onBack={() => setCurrentStep("selection")}
            onUpload={handleFinalUpload}
            isLoading={addingKnowledgeBase}
            error={knowledgeBaseError}
          />
        )}
      </div>
    </div>
  );
};

export default UploadModal;
