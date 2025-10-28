import React, { useState } from 'react';
import { Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';

export function NumberPool() {
  const [pools, setPools] = useState([
    {
      id: 'pool-1',
      name: 'New Pool: ...',
      updated: 'Oct 28, 2025 10:13 am',
      numbersCount: 0,
    },
  ]);

  const addNewPool = () => {
    const newPool = {
      id: `pool-${pools.length + 1}`,
      name: `New Pool: ${pools.length + 1}`,
      updated: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      numbersCount: 0,
    };
    setPools((prevPools) => [...prevPools, newPool]);
  };

  const deletePool = (id) => {
    setPools((prevPools) => prevPools.filter((pool) => pool.id !== id));
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex justify-end items-center mb-6">
        {/* <h1 className="text-xl font-semibold text-gray-900">Home</h1> */}
        <button
          onClick={addNewPool}
          className="flex items-center space-x-2 px-4 py-2 bg-black text-white font-medium rounded-md shadow-sm "
        >
          <Plus className="w-5 h-5" />
          <span>New Number Pool</span>
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full border">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                NAME
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                UPDATED
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                NUMBERS
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pools.map((pool) => (
              <tr key={pool.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {pool.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {pool.updated}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  {pool.numbersCount} numbers
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {/* More button - placeholder for a dropdown */}
                    <button
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                      title="More actions"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {/* Edit button */}
                    <button
                      className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-gray-100"
                      title="Edit"
                     
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={() => deletePool(pool.id)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-gray-100"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination and Results Info */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <label htmlFor="per-page" className="sr-only">
              Items per page
            </label>
            <select
              id="per-page"
              name="per-page"
              className="block px-1 py-1 text-base border border-gray-400  sm:text-sm rounded-md"
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span className='text-lg text-gray-300'>|</span>
            
            <span>Showing 1 - 10 </span>
            <span className='text-lg text-gray-300'>|</span>
            <span>{pools.length} Results</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <span>Page 1 of 1</span>
            <nav className="relative z-0 inline-flex gap-2 -space-x-px rounded-md shadow-sm ml-4" aria-label="Pagination">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Previous</span>
                {/* Heroicon name: solid/chevron-left */}
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Next</span>
                {/* Heroicon name: solid/chevron-right */}
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
       <div className="fixed bottom-4 right-4 text-gray-500 text-xs">
        Activate Windows <br/> Go to Settings to activate Windows.
      </div>
    </div>
  );
}