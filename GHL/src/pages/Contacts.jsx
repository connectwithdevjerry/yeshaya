// src/pages/ContactsPage.jsx
import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Ban } from 'lucide-react';
import NewContactModal from '../components/Contact/NewContact';

const Contacts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contacts, setContacts] = useState([]); 

  return (
    <div className="flex-grow bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
       
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-grow max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)} 
            className="ml-4 px-4 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 transition-colors flex items-center"
          >
            + New Contact
          </button>
        </div>

        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NAME
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EMAIL
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PHONE
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  INTERACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 text-sm">
                    <div className="flex flex-col items-center justify-center">
                      <Ban className="w-8 h-8 text-gray-400 mb-2" />
                      No contacts to display
                    </div>
                  </td>
                </tr>
              ) : (
               
                contacts.map(contact => (
                  <tr key={contact.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contact.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.email}
                    </td>
                    {/* ... other contact data */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <div className="relative">
              <select className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <ChevronRight className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 rotate-90 pointer-events-none" />
            </div>
            <span>Showing 1-10</span>
            <span className="font-medium text-gray-500">{contacts.length} Results</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="text-gray-500">Page 1 of 1</div> 
            <button className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      
      <NewContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Contacts;