import React from 'react';

const Integration = () => {

  return (
   <div className="bg-slate-50 min-h-screen p-8 font-sans">
      
      {/* Main Card Container */}
      <div className="max-w-4xl bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        
        {/* Card Header */}
        <header className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            CRM Integration
          </h2>
        </header>

        {/* Card Body */}
        <main className="p-6">
          
          {/* Inner Content Box */}
          <div className="border border-gray-200 rounded-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Connect to your CRM
            </h3>
            
            <ol className="list-decimal list-inside space-y-3 text-gray-600 text-sm mb-10">
              <li>
                Click the button to be taken to the connection page to sync your AI portal with your CRM.
              </li>
              <li>
                Select your account with the location ID you are matching to this account and allow all access for the AI to help manage your business.
              </li>
              <li>
                The connection will bring you back here when you are done.
              </li>
            </ol>

            {/* Action Link */}
            <div className="flex justify-end">
              <button className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
                Reset connection
              </button>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
};

export default Integration;