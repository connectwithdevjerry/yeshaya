// src/pages/NumbersPage.jsx
import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Ban, Home, Upload, ShoppingCart } from 'lucide-react';
import TabButton from '../../../components/components-ghl/TabButton';
import ImportNumberModal from '../../../components/components-ghl/Numbers/ImportNumber';
import BuyNumberModal from '../../../components/components-ghl/Numbers/BuyNumber';
const numbers = [];

const Numbers = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); 

  const headers = ['NAME', 'NUMBER', 'UPDATED', 'REPUTATION', 'VERIFIED', 'CALLER ID', 'LINKED ASSISTANT'];

  return (
    <div className="flex-grow bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        

        <div className="flex justify-end items-center mb-6">
          
          <div className="flex items-center space-x-3">

            {/* Import Number Button */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 transition-colors flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" /> Import a Number
            </button>
            
            
            <button
              onClick={() => setIsBuyModalOpen(true)}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 transition-colors flex items-center"
            >
              <ShoppingCart className="w-4 h-4 mr-2" /> Buy a Number
            </button>
          </div>
        </div>

        
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg shadow-sm">
          <TabButton isActive={activeTab === 'all'} onClick={() => setActiveTab('all')}>
            All 0
          </TabButton>
          <TabButton isActive={activeTab === 'bought'} onClick={() => setActiveTab('bought')}>
            Bought 0
          </TabButton>
          <TabButton isActive={activeTab === 'imported'} onClick={() => setActiveTab('imported')}>
            Imported 0
          </TabButton>
        </div>

        
        <div className="text-sm font-medium text-gray-600 mb-4 flex items-center space-x-2">
            <Home className='w-4 h-4' />
            <span>Home</span>
            <span className="ml-auto text-gray-400">0 / 0</span>
        </div>

       
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header) => (
                  <th 
                    key={header}
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {numbers.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="px-6 py-12 text-center text-gray-500 text-sm">
                    <div className="flex flex-col items-center justify-center">
                      <Ban className="w-8 h-8 text-gray-400 mb-2" />
                      No numbers to display
                    </div>
                  </td>
                </tr>
              ) : (
                
                null
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <div className="relative">
              <select className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option>10</option>
              </select>
            </div>
            <span>Showing 1-10</span>
            <span className="font-medium text-gray-500">0 Results</span>
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

      {/* Modals */}
      <ImportNumberModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      <BuyNumberModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} />
    </div>
  );
};

export default Numbers;