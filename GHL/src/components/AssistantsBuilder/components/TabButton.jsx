// src/components/shared/TabButton.jsx
import React from 'react';

export const TabButton = ({ text, isActive, icon: Icon, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-150 ${
            isActive
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
    >
        {Icon && <Icon className="w-4 h-4 mr-1 inline-block" />}
        {text}
    </button>
);