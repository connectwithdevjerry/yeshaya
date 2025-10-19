// src/components/ui/Button.jsx
import React from "react";

export const Button = ({ children, variant = "outline", className = "", ...props }) => {
  const base =
    "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const styles =
    variant === "outline"
      ? "border bg-black border-gray-300 text-white hover:bg-gray-900 focus:ring-gray-200"
      : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300";

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
};
