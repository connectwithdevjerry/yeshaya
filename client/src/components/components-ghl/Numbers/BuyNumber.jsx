// src/components/components-ghl/Numbers/BuyNumber.jsx
import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Phone, Volume2, Loader2, Truck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAvailableNumbers } from '../../../store/slices/numberSlice';

// Helper function to get capability icons
const getCapabilityIcons = (capabilities) => {
  const icons = [];
  
  if (capabilities.SMS) {
    icons.push({ Icon: MessageSquare, name: 'SMS', key: 'sms' });
  }

  if (capabilities.MMS) {
    icons.push({ Icon: Truck, name: 'MMS', key: 'mms' });
  }
  
  if (capabilities.voice) {
    icons.push({ Icon: Phone, name: 'Voice Call', key: 'phone' });
    icons.push({ Icon: Volume2, name: 'Audio', key: 'audio' });
  }
  
  return icons;
};

const BuyNumberModal = ({ isOpen, onClose }) => {
  const [areaCode, setAreaCode] = useState('');
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const dispatch = useDispatch();
  const { data: availableNumbers, loading, error } = useSelector((state) => state.numbers);

  // ✅ Fetch numbers when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAvailableNumbers());
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  // ✅ Filter numbers by area code
  const filteredNumbers = areaCode.trim()
    ? availableNumbers.filter((num) =>
        num.phoneNumber.includes(areaCode.replace(/\D/g, ''))
      )
    : availableNumbers;

  // ✅ Pagination
  const totalPages = Math.ceil(filteredNumbers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNumbers = filteredNumbers.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on search
    setSelectedNumber(null);
  };

  const handleBuy = async () => {
    if (selectedNumber) {
      console.log('Buying Number:', selectedNumber.phoneNumber);
      // TODO: Implement buy number API call here
      // await dispatch(buyNumber(selectedNumber.phoneNumber));
      onClose();
      setSelectedNumber(null);
      setAreaCode('');
    }
  };

  const handlePageChange = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 relative max-h-[90vh] flex flex-col">
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
            <label htmlFor="area-code" className="block text-sm text-gray-700 mb-1">
              Desired area code (US only)
            </label>
            <input
              type="text"
              id="area-code"
              value={areaCode}
              onChange={(e) => setAreaCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="e.g., 217"
              maxLength="3"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="ml-3 px-4 py-2 bg-black text-white text-sm font-medium rounded-md shadow-sm hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Results Count */}
        <div className="text-sm font-medium text-gray-600 mb-2 flex justify-between items-center">
          <span>Available Numbers</span>
          <span className="text-gray-400">{filteredNumbers.length} numbers</span>
        </div>

        {/* Table/List of Available Numbers */}
        <div className="bg-gray-50 rounded-lg shadow-sm overflow-hidden border border-gray-200 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="ml-3 text-gray-600">Loading numbers...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-red-500">
              <p>Error: {error}</p>
            </div>
          ) : paginatedNumbers.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <p>No numbers available for this area code</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-500 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase">
                    NUMBER
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase">
                    LOCATION
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase">
                    CAPABILITIES
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase">
                    AVAILABLE
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedNumbers.map((item, index) => {
                  const capabilityIcons = getCapabilityIcons(item.capabilities);
                  const isSelected = selectedNumber?.phoneNumber === item.phoneNumber;

                  return (
                    <tr
                      key={item.phoneNumber}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedNumber(item)}
                    >
                      {/* Number */}
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-800">
                        <div className="flex flex-col">
                          <span className="font-semibold">{item.friendlyName}</span>
                          <span className="text-xs text-gray-500">{item.phoneNumber}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex flex-col">
                          <span>{item.locality}, {item.region}</span>
                          <span className="text-xs text-gray-500">{item.postalCode || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Capabilities */}
                      <td className="px-6 py-2 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          {capabilityIcons.map(({ Icon, name, key }) => (
                            <div
                              key={key}
                              className="relative group"
                              title={name}
                            >
                              <Icon className="w-4 h-4 text-gray-500 hover:text-indigo-600 transition-colors" />
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Available */}
                      <td className="px-6 py-2 whitespace-nowrap text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Yes
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && paginatedNumbers.length > 0 && (
          <div className="flex justify-between items-center text-sm text-gray-500 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <span>
                Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredNumbers.length)} of {filteredNumbers.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span>Page {currentPage} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange('prev')}
                  disabled={currentPage === 1}
                  className="p-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  {'<'}
                </button>
                <button
                  onClick={() => handlePageChange('next')}
                  disabled={currentPage === totalPages}
                  className="p-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  {'>'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-between items-center space-x-3 pt-4 border-t border-gray-200 mt-6">
          {/* Selected Number Info */}
          {selectedNumber && (
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <span className="font-medium">Selected:</span>
              <span className="text-indigo-600 font-semibold">{selectedNumber.friendlyName}</span>
            </div>
          )}
          
          <div className="flex gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={handleBuy}
              disabled={!selectedNumber}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
            >
              Buy Number
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyNumberModal;