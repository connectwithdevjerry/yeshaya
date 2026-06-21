// src/components/shared/TabButton.jsx
import React from 'react';

export const TabButton = ({ text, isActive, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-150 ${
      isActive
        ? 'border-indigo-500 text-indigo-600'
        : 'border-transparent text-slate-500 hover:text-slate-700'
    }`}
  >
    {Icon && <Icon className="w-4 h-4 mr-1 inline-block" />}
    {text}
  </button>
);
