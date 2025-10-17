import React from "react";

const HeaderFilters = () => {
  return (
    <div className="flex text-gray-600 gap-3 mb-6">

      <div className="flex items-center justify-between flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search by number, name, ID, etc..."
          className="border rounded-md px-3 py-2 w-[300px] text-sm"
        />
        <select className="border rounded-md px-2 py-2 text-sm">
          <option>Filter by status</option>
        </select>
        <select className="border rounded-md px-2 py-2 text-sm">
          <option>Filter by reason</option>
        </select>
        <select className="border rounded-md px-2 py-2 text-sm">
          <option>Filter by sentiment</option>
        </select>
        <input type="date" className="border rounded-md px-2 py-2 text-sm" />
        <input type="date" className="border rounded-md px-2 py-2 text-sm" />
      </div>
    </div>
  );
};

export default HeaderFilters;
