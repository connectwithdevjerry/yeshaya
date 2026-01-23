// src/components/components-ghl/AssistantsBuilder/AssistantsBuilder.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AssistantHeader } from "./components/AssistantHeader";
import { GlobalPromptEditor } from "./components/PromptEditor";
import { getSubaccountIdFromUrl } from "../../../utils/urlUtils";
import { updateAssistant } from "../../../store/slices/assistantsSlice";
import { useDispatch, useSelector } from "react-redux"; // Added useSelector
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

  // ✅ Get the specific assistant from the Redux store to access current model/provider
  const { assistants } = useSelector((state) => state.assistants);
  const currentAssistant = assistants?.find((a) => a.id === assistantId);

  useEffect(() => {
    if (currentAssistant?.model?.systemPrompt) {
      setPromptContent(currentAssistant.model.systemPrompt);
    }
    console.log("🎯 Assistant Builder loaded with ID:", assistantId);
  }, [assistantId, currentAssistant]);

  const toggleToolkit = (value) => {
    if (typeof value === "boolean") {
      setIsToolkitOpen(value);
    } else {
      setIsToolkitOpen((prev) => !prev);
    }
  };

  const handleSave = async () => {
    if (!assistantId || !subaccountId) {
      toast.error("Missing Assistant ID or Subaccount ID");
      return;
    }


    const modelSettings = currentAssistant?.model || {
      model: "gpt-3.5-turbo",
      provider: "openai"
    };

    try {
      await dispatch(
        updateAssistant({
          subaccountId,
          assistantId,
          updateData: {
            model: {
              ...modelSettings,     
              systemPrompt: promptContent, 
            },
          },
        })
      ).unwrap();

      toast.success("Saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      // Try to extract the backend's specific error message if it's a 400
      const errorDetail = error?.response?.data?.message || error?.message || "Failed to update assistant";
      toast.error(errorDetail);
    }
  };

  return (
    <div className="flex relative flex-col h-full">
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