// src/components/Card.jsx
import React from 'react';

const Card = ({ children, className = "", hover = true }) => (
  <div
    className={`bg-white shadow-sm rounded-xl p-6 mb-6 border border-gray-100 border-t-2 border-t-indigo-500/30
      ${hover ? 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200' : ''}
      ${className}`}
  >
    {children}
  </div>
);

export default Card;
