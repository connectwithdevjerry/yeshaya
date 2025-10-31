// src/components/AccountSettings.jsx

import React from "react";
import Card from "../ui/Card";

const AccountSettings = () => {
  return (
    <div className="bg-slate-50 w-[800px] min-h-screen font-sans">
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">My Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              id="firstName"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder=""
              defaultValue="" // Example: can be dynamic
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 invisible mb-1"
            >
              Full Name (hidden label)
            </label>
            <input
              type="text"
              id="lastName"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder=""
              defaultValue="" // Example: can be dynamic
            />
          </div>
        </div>
        <div className="mb-6">
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder=""
            defaultValue="" // Example: can be dynamic
          />
        </div>
        <div className="flex justify-end">
          <button className="px-6 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 transition-colors">
            Save Changes
          </button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Account Security
        </h2>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <label
              htmlFor="emailAddress"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <p id="emailAddress" className="text-gray-600 text-base">
              kenny@mail.yashayah.ai
            </p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 transition-colors">
            Change Email
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <p id="password" className="text-gray-600 text-base">
              ************
            </p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 transition-colors">
            Reset Password
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AccountSettings;
