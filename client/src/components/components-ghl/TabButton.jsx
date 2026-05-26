// src/components/shared/TabButton.jsx
import React from 'react';
import { motion } from 'framer-motion';

/**
 * A reusable component for tab navigation buttons.
 * @param {boolean} props.isActive - Whether the current tab is selected.
 * @param {React.ReactNode} props.children - The content of the button.
 * @param {function} props.onClick - Handler when the button is clicked.
 * @param {boolean} [props.topLevel=false] - If true, applies top-level page tab styling.
 */
const TabButton = ({ isActive, children, onClick, topLevel = false }) => (
  <motion.button
    onClick={onClick}
    whileHover={!isActive ? { y: -1 } : {}}
    transition={{ duration: 0.15 }}
    className={`
      px-4 py-2 text-sm font-medium transition-all duration-150 cursor-pointer
      ${
        topLevel
          ? `rounded-lg ${isActive
              ? 'text-indigo-600 bg-indigo-50 font-semibold shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`
          : `py-2.5 ${isActive
              ? 'text-indigo-600 border-b-2 border-indigo-500 font-semibold'
              : 'text-gray-500 hover:text-indigo-500 hover:border-b-2 hover:border-indigo-200'}`
      }
    `}
  >
    {children}
  </motion.button>
);

export default TabButton;
