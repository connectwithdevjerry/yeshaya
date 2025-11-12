// src/components/components-ghl/AssistantsBuilder/AssistantsBuilder.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AssistantHeader } from "./components/AssistantHeader";
import { GlobalPromptEditor } from "./components/PromptEditor";

export const AssistantBuilderPage = () => {
  const [isToolkitOpen, setIsToolkitOpen] = useState(false);
  const [searchParams] = useSearchParams();

  // ✅ Extract assistant ID from route parameter
  const route = searchParams.get('route') || '';
  const assistantId = route.startsWith('/assistants/') 
    ? route.split('/assistants/')[1] 
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

  return (
    <div className="flex relative flex-col h-full">
      <AssistantHeader assistantId={assistantId} />
      <div className="flex flex-1 overflow-hidden">
        <GlobalPromptEditor
          isOpen={isToolkitOpen}
          onToggle={toggleToolkit}
        />
      </div>
    </div>
  );
};