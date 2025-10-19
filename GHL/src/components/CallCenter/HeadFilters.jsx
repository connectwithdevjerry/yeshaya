import React from "react";

const HeaderFilters = () => {
  return (
    <div className="flex p-6 text-gray-400 gap-3 mb-2">
      <div className="flex items-center justify-evenly flex-wrap gap-8">
        <input
          type="text"
          placeholder="Search by number, name, ID, etc..."
          className="border rounded-md px-3 py-2 w-[300px] text-sm"
        />
        <select className="border rounded-md px-2 py-2 text-sm">
          <option className="text-gray-300">Filter by status</option>
          <option></option>
          <option>Queued</option>
          <option>Ongoing</option>
          <option>Finished</option>
          <option>Not Connected</option>
        </select>
        <select className="border rounded-md px-2 py-2 text-sm">
          <option>Filter by reason</option>
          <option></option>
          <option>Queued</option>
          <option>Ongoing</option>
          <option>Finished</option>
          <option>Not Connected</option>
        </select>
        <select className="border rounded-md px-2 py-2 text-sm">
          <option>Filter by sentiment</option>
          <option></option>
          <option>Positive</option>
          <option>Neural</option>
          <option>Negative</option>
          <option>Unknown</option>
        </select>
        <input type="date" className="border rounded-md px-2 py-2 text-sm" />
        <input type="date" className="border rounded-md px-2 py-2 text-sm" />
      </div>
    </div>
  );
};

export default HeaderFilters;
