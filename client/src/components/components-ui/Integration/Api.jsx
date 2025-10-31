// src/components/APIKeysContent.jsx

import React from 'react';
import { Key } from 'lucide-react';
import Card from '../ui/Card'; 

const APIKeysContent = () => (
  <Card>
    <h2 className="text-lg font-semibold text-gray-700 mb-4">REST API Keys</h2>
    
    {/* Table Header */}
    <div className="grid grid-cols-4 gap-4 py-3 border-b text-sm font-medium text-gray-500 uppercase tracking-wider">
      <div>Key</div>
      <div>Expires On</div>
      <div>Created</div>
      <div>Version</div>
    </div>

    {/* Table Body - No Keys */}
    <div className="text-center py-16">
      <p className="text-gray-500">No keys to display</p>
    </div>
    
    {/* Pagination and Button */}
    <div className="flex justify-between items-center pt-4 border-t">
      <div className="text-sm text-gray-500">
        Page 1 of 1
      </div>
      <div className="flex items-center space-x-2">
        <button className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
          &lt;
        </button>
        <button className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
          &gt;
        </button>
      </div>
    </div>

    {/* Generate Key Button */}
    <div className="flex justify-end mt-4">
      <button className="flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 transition-colors">
        <Key className="w-4 h-4 mr-2" /> Generate Key
      </button>
    </div>
  </Card>
);

export default APIKeysContent;