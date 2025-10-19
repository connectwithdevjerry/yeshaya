// src/components/WorkspaceSettings.jsx

import React from "react";
import Card from "../ui/Card";
import { Settings } from "lucide-react";

const FormField = ({
  id,
  label,
  type = "text",
  defaultValue = "",
  placeholder = "",
  icon: Icon,
  description,
}) => (
  <div className="mb-4">
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
      {description && (
        <span className="ml-1 text-gray-400 cursor-help" title={description}>
          <Settings className="inline-block w-4 h-4" />
        </span>
      )}
    </label>
    <input
      type={type}
      id={id}
      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
      placeholder={placeholder}
      defaultValue={defaultValue}
    />
  </div>
);

const WorkspaceSettings = () => {
  return (
    <div className="bg-slate-50 w-[800px] min-h-screen font-sans">
      <Card>
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h2 className="text-lg font-semibold text-gray-800">My Workspace</h2>
          <span className="text-sm text-gray-500">ID: 1759....2100</span>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Logo
          </label>
          <div className="flex items-center">
            {/* Replace with actual image or image upload component */}
            <img
              src="https://via.placeholder.com/60" // Placeholder image
              alt="Company Logo"
              className="w-16 h-16 rounded-full object-cover border border-gray-200"
            />
            {/* Optionally add an upload button here */}
          </div>
        </div>

        <FormField
          id="companyName"
          label="Company Name"
          defaultValue="YaashaYah"
        />
        <FormField id="companyStreetAddress" label="Company Street Address" />
        <FormField id="companyCity" label="Company City" />
        <FormField id="companyState" label="Company State" />
        <FormField id="companyPostalCode" label="Company Postal Code" />
        <FormField id="companyNumber" label="Company Number" type="tel" />
        <FormField id="companyWebsite" label="Company Website" type="url" />
        <FormField
          id="companyPrivacyPolicy"
          label="Company Privacy Policy"
          type="url"
          description="Link to your company's privacy policy."
        />
        <FormField
          id="companyTermsConditions"
          label="Company Terms & Conditions"
          type="url"
          description="Link to your company's terms and conditions."
        />
        <FormField
          id="companyRefundPolicy"
          label="Company Refund Policy"
          type="url"
          description="Link to your company's refund policy."
        />

        <div className="flex justify-end mt-6 pt-4 border-t">
          <button className="px-6 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 transition-colors">
            Save Changes
          </button>
        </div>
      </Card>
    </div>
  );
};

export default WorkspaceSettings;
