import React from 'react'
import ReBilling from '../../components/components-ui/Rebilling/ReBilling';
import AgencyHeader from '../../components/components-ui/Rebilling/RebillingHeader';

const Rebilling = () => {
 return (
    <div className=" bg-gray-50 p-6">
      {/* Connected Account Header */}
      <AgencyHeader />

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Gross volume (Today)</p>
          <h2 className="text-2xl font-semibold text-gray-900">$0.00</h2>
          <p className="text-xs text-gray-500 mt-1">11:49 am</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">
            Gross volume (Trailing 30 days)
          </p>
          <h2 className="text-2xl font-semibold text-gray-900">$0.00</h2>
        </div>
      </div>

      {/* Re-billing Revenue Section */}
      <ReBilling/>
    </div>
  );
};


export default Rebilling