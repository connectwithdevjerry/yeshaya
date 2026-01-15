// src/components/components-ghl/AssistantsBuilder/AssistantsBuilder.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AssistantHeader } from "./components/AssistantHeader";
import { GlobalPromptEditor } from "./components/PromptEditor";
import { getSubaccountIdFromUrl } from "../../../utils/urlUtils";
import { updateAssistant } from "../../../store/slices/assistantsSlice";
import { useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast"; 

export const AssistantBuilderPage = () => {
  const [isToolkitOpen, setIsToolkitOpen] = useState(false);
  const [promptContent, setPromptContent] = useState("");
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const subaccountId = getSubaccountIdFromUrl(searchParams);

  const route = searchParams.get("route") || "";
  const assistantId = route.startsWith("/assistants/")
    ? route.split("/assistants/")[1]
    : null;

  useEffect(() => {
    console.log("🎯 Assistant Builder loaded with ID:", assistantId);
  }, [assistantId]);

  const toggleToolkit = (value) => {
    if (typeof value === "boolean") {
      setIsToolkitOpen(value);
    } else {
      setIsToolkitOpen((prev) => !prev);
    }
  };

  // ✅ Updated handleSave with Toast logic
  const handleSave = async () => {
    if (!assistantId || !subaccountId) {
      toast.error("Missing Assistant ID or Subaccount ID");
      return;
    }

    try {
      // .unwrap() allows us to catch errors or proceed on success
      await dispatch(
        updateAssistant({
          subaccountId,
          assistantId,
          updateData: {
            firstMessage: promptContent,
          },
        })
      ).unwrap();

      toast.success("Saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(error?.message || "Failed to update assistant");
    }
  };

  return (
    <div className="flex relative flex-col h-full">
      {/* ✅ Add Toaster here so notifications can render */}
      <Toaster position="top-right" /> 
      
      <AssistantHeader assistantId={assistantId} onSave={handleSave} />
      <div className="flex flex-1 overflow-hidden">
        <GlobalPromptEditor
          isOpen={isToolkitOpen}
          onToggle={toggleToolkit}
          promptContent={promptContent}
          setPromptContent={setPromptContent}
        />
      </div>
    </div>
  );
};