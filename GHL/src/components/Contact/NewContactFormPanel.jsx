// src/components/contacts/NewContactFormPanel.jsx
import React from 'react';
import { X, ChevronRight } from 'lucide-react';

export function NewContactFormPanel({ onClose }) {
  const [formData, setFormData] = React.useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact Data Submitted:', formData);

    onClose();
  };

  return (

    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 overflow-hidden">
      
 
      <div 
        className="fixed top-0 right-0 h-full bg-white shadow-2xl w-full max-w-lg transform translate-x-0 transition-transform duration-300 flex flex-col"
      >
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-start">
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 mr-4 p-1 rounded-full hover:bg-gray-100"
            title="Close"
          >
            <ChevronRight className="w-5 h-5" /> 
          </button>
          <h3 className="text-xl font-semibold text-gray-800">New Contact</h3>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="First name"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Last name"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              id="title"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              id="phone"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Company Field */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              type="text"
              id="company"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* LinkedIn Field */}
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">linkedin.com/in/</span>
                </div>
                <input
                    type="text"
                    id="linkedin"
                    className="block w-full border border-gray-300 rounded-md p-2 text-sm pl-32 focus:border-blue-500 focus:ring-blue-500"
                />
            </div>
          </div>

          {/* Owner Field (Select Dropdown) */}
          <div>
            <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
            <select
              id="owner"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option>Select a lead owner</option>
              {/* Add more owner options here */}
            </select>
          </div>
          
          {/* Add some extra padding to make sure the last element isn't cut off by the footer */}
          <div className="h-20"></div>

        </form>

        {/* Footer/Action Bar */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-end">
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2 bg-black text-white font-medium rounded-md shadow-md"
          >
            Add Contact
          </button>
        </div>

      </div>
    </div>
  );
}