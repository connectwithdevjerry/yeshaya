// src/components/Card.jsx

import React from 'react';

const Card = ({ children }) => (
  <div className="bg-white shadow-md rounded-lg p-6 mb-6">
    {children}
  </div>
);

export default Card;