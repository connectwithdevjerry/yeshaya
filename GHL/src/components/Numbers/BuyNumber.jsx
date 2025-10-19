// src/components/numbers/BuyNumberModal.jsx
import React, { useState } from 'react';
import { X, MessageSquare, Phone, FileText, Lock } from 'lucide-react';

// Dummy data for available numbers
const dummyNumbers = [
    { number: 'us +1 (475) 221-9500', capabilities: [MessageSquare, Phone, FileText, Lock] },
    { number: 'us +1 (681) 667-1358', capabilities: [MessageSquare, Phone] },
    { number: 'us +1 (681) 260-1782', capabilities: [MessageSquare, Phone] },
    { number: 'us +1 (731) 944-8247', capabilities: [MessageSquare, Phone] },
    { number: 'us +1 (731) 324-8727', capabilities: [MessageSquare, Phone] },
    { number: 'us +1 (731) 310-8431', capabilities: [MessageSquare, Phone] },
    { number: 'us +1 (928) 392-1078', capabilities: [MessageSquare, Phone] },
    { number: 'us +1 (928) 250-7247', capabilities: [MessageSquare, Phone] },
    { number: 'us +1 (928) 240-5122', capabilities: [MessageSquare, Phone] },
    { number: 'us +1 (681) 223-0965', capabilities: [MessageSquare, Phone] },
];

const BuyNumberModal = ({ isOpen, onClose }) => {
  const [areaCode, setAreaCode] = useState('');
  const [availableNumbers, setAvailableNumbers] = useState(dummyNumbers);
  const [selectedNumber, setSelectedNumber] = useState(null);

  if (!isOpen) return null;

  const handleSearch = () => {
    
    console.log('Searching for area code:', areaCode);
    setAvailableNumbers(dummyNumbers); 
  };
  
  const handleBuy = () => {
    if (selectedNumber) {
      console.log('Buying Number:', selectedNumber.number);
      onClose();
      setSelectedNumber(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6 relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Buy phone number</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-end mb-6">
          <div className="flex-grow">
            <label htmlFor="area-code" className="block text-sm text-gray-700 sr-only">
              Desired area code (US only)
            </label>
            <input
              type="text"
              id="area-code"
              value={areaCode}
              onChange={(e) => setAreaCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Desired area code (US only)"
            />
          </div>
          <button
            onClick={handleSearch}
            className="ml-3 px-4 py-2 bg-black text-white text-sm font-medium rounded-md shadow-sm hover:bg-gray-800 transition-colors"
          >
            Search
          </button>
        </div>
        
        {/* Table/List of Available Numbers */}
        <div className="text-sm font-medium text-gray-600 mb-2 flex justify-between items-center">
            <span>Home</span>
            <span className="text-gray-400">50</span> {/* Dummy count */}
        </div>

        <div className="bg-gray-50 rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  NUMBER
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  AVAILABLE
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {availableNumbers.map((item, index) => (
                <tr 
                  key={index} 
                  className={`cursor-pointer ${selectedNumber?.number === item.number ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                  onClick={() => setSelectedNumber(item)}
                >
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-800 flex items-center">
                    {item.number}
                    {item.capabilities.map((Icon, idx) => (
                        <Icon key={idx} className="w-4 h-4 text-gray-500 ml-2" title={Icon.name} />
                    ))}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                    yes
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex justify-end text-xs text-gray-500 mt-2">
            <span className="mr-3">Page 1 of 5</span>
            <button className="p-1 disabled:opacity-50">{'<'}</button>
            <button className="p-1 disabled:opacity-50">{'>'}</button>
        </div>


        {/* Modal Footer */}
        <div className="flex justify-end items-center space-x-3 pt-4 border-t border-gray-200 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700">
            Close
          </button>
          <button
            onClick={handleBuy}
            disabled={!selectedNumber}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
          >
            Buy Number
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyNumberModal;