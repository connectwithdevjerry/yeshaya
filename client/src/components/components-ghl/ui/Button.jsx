// src/components/ui/Button.jsx
import React from "react";
import { motion } from "framer-motion";

export const Button = ({
  children,
  variant = "outline",
  className = "",
  loading = false,
  disabled,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const styles = {
    outline:
      "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:brightness-110 focus:ring-indigo-500",
    solid:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary:
      "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-300",
    ghost:
      "text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-300",
    danger:
      "bg-red-600 text-white hover:bg-red-700 shadow-sm focus:ring-red-500",
  };

  const variantClass = styles[variant] ?? styles.outline;

  return (
    <motion.button
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      transition={{ duration: 0.1 }}
      className={`${base} ${variantClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </motion.button>
  );
};
