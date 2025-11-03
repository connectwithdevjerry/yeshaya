// src/pages/AssistantBuilderPage.jsx
import React, { useState } from "react";
import { AssistantHeader } from "./components/AssistantHeader";
import { GlobalPromptEditor } from "./components/PromptEditor";

export const AssistantBuilderPage = () => {
  const [isToolkitOpen, setIsToolkitOpen] = useState(false);


  const toggleToolkit = (value) => {
    if (typeof value === "boolean") {
      setIsToolkitOpen(value);
    } else {
      setIsToolkitOpen((prev) => !prev);
    }
  };

  return (
    <div className="flex relative flex-col">
      <AssistantHeader />
      <div className="flex flex-1 overflow-hidden">
        <GlobalPromptEditor
          isOpen={isToolkitOpen}
          onToggle={toggleToolkit}
        />
      </div>
    </div>
  );
};
