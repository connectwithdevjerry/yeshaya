// src/components/shared/TabButton.jsx

import React from 'react';

/**
 * A reusable component for tab navigation buttons.
 * @param {object} props
 * @param {boolean} props.isActive - Whether the current tab is selected.
 * @param {React.ReactNode} props.children - The content of the button (the tab name).
 * @param {function} props.onClick - The handler function when the button is clicked.
 * @param {boolean} [props.topLevel=false] - If true, applies styling for top-most page tabs 
 * (like Account, Workspace). If false, applies styling for sub-tabs (like Subscriptions, Call List).
 */
const TabButton = ({ isActive, children, onClick, topLevel = false }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 text-sm font-medium transition-colors cursor-pointer 
      ${
        // Top-Level Tabs (e.g., Settings: Account, Workspace)
        topLevel
          ? `rounded-t-md ${isActive 
              ? 'text-indigo-600 bg-white shadow-sm font-semibold' 
              : 'text-gray-500 hover:text-gray-700'}`
          
        // Sub-Tabs or Dashboard Main Tabs (e.g., Data Center, Subscriptions)
          : `py-2.5 ${isActive 
              ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold' 
              : 'text-gray-600 hover:text-indigo-600 hover:border-b-2 hover:border-indigo-100'}`
      }
    `}
  >
    {children}
  </button>
);

export default TabButton;