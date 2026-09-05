// src/components/components-ghl/AssistantsBuilder/AssistantsBuilder.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { AssistantHeader } from "./components/AssistantHeader";
import { GlobalPromptEditor } from "./components/PromptEditor";
import {
  getSubaccountIdFromUrl,
  getAssistantIdFromUrl,
} from "../../../utils/urlUtils";
import {
  updateAssistant,
  fetchAssistants,
} from "../../../store/slices/assistantsSlice";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

export const AssistantBuilderPage = () => {
  const [isToolkitOpen, setIsToolkitOpen] = useState(false);
  const [promptContent, setPromptContent] = useState("");
  // The prompt as it stands on the server. Held separately from promptContent
  // so "has anything changed?" is a comparison, and so it can be moved forward
  // after a save without waiting for the assistant list to come round again.
  // null until the editor has been seeded — before that there is nothing to
  // compare against, and the button must not offer to save an empty editor
  // over a real prompt.
  const [savedPrompt, setSavedPrompt] = useState(null);

  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const assistantId = getAssistantIdFromUrl(searchParams);

  const assistants = useSelector((state) => state.assistants.data);

  const currentAssistant = assistants?.find((a) => a.id === assistantId);


  const initializedAssistantId = useRef(null);

  useEffect(() => {
    if (subaccountId) {
      dispatch(fetchAssistants(subaccountId));
    }
  }, [dispatch, subaccountId]);

  useEffect(() => {
    if (currentAssistant && currentAssistant.id !== initializedAssistantId.current) {
      if (currentAssistant.model?.systemPrompt !== undefined) {
        setPromptContent(currentAssistant.model.systemPrompt || "");
        setSavedPrompt(currentAssistant.model.systemPrompt || "");
      }
      initializedAssistantId.current = currentAssistant.id;
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
    if (!assistantId || !subaccountId || !currentAssistant) {
      toast.error("Assistant data not fully loaded yet.");
      return;
    }

    try {
      await dispatch(
        updateAssistant({
          subaccountId,
          assistantId,
          updateData: {
            model: {
              ...currentAssistant.model, // preserve existing model
              systemPrompt: promptContent, // update only this
            },
          },
        }),
      ).unwrap();

      setSavedPrompt(promptContent);
      toast.success("Saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(error?.message || "Failed to update assistant");
    }
  };

  return (
    <div className="flex relative flex-col h-full">
      <Toaster position="top-right" />

      <AssistantHeader
        assistantId={assistantId}
        onSave={handleSave}
        hasUnsavedChanges={savedPrompt !== null && promptContent !== savedPrompt}
      />

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
