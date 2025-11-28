// src/components/WorkspaceSettings.jsx
import React, { useEffect } from "react";
import Card from "../ui/Card";
import { Settings } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getCompanyDetails } from "../../../store/slices/authSlice";

const FormField = ({ id, label, type = "text", defaultValue = "", placeholder = "", icon: Icon, description }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
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
  const dispatch = useDispatch();
  const { companyDetails, companyLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch company details if not loaded
    if (!companyDetails && !companyLoading) {
      dispatch(getCompanyDetails());
    }
  }, [companyDetails, companyLoading, dispatch]);

  const company = companyDetails || {};

  return (
    <Card>
      <div className="flex justify-between items-center mb-4 border-b pb-4">
        <h2 className="text-lg font-semibold text-gray-800">My Workspace</h2>
        <span className="text-sm text-gray-500">ID: {company.agencyId ?? "—"}</span>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
        <div className="flex items-center">
          {company.logo ? (
            <img
              src={company.logo}
              alt="Company Logo"
              className="w-16 h-16 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <img
              src="https://via.placeholder.com/60"
              alt="Company Logo"
              className="w-16 h-16 rounded-full object-cover border border-gray-200"
            />
          )}
        </div>
      </div>

      <FormField id="companyName" label="Company Name" defaultValue={company.name ?? ""} />
      <FormField id="companyStreetAddress" label="Company Street Address" defaultValue={company.address ?? ""} />
      {/* If you want to split address into city/state/postal code you can parse company.address accordingly */}
      <FormField id="companyCity" label="Company City" defaultValue={company.city ?? ""} />
      <FormField id="companyState" label="Company State" defaultValue={company.state ?? ""} />
      <FormField id="companyPostalCode" label="Company Postal Code" defaultValue={company.postalCode ?? ""} />
      <FormField id="companyNumber" label="Company Number" type="tel" defaultValue={company.phoneNum ?? ""} />
      <FormField id="companyWebsite" label="Company Website" type="url" defaultValue={company.website ?? ""} />
      <FormField
        id="companyPrivacyPolicy"
        label="Company Privacy Policy"
        type="url"
        description="Link to your company's privacy policy."
        defaultValue={company.privacyPolicy ?? ""}
      />
      <FormField
        id="companyTermsConditions"
        label="Company Terms & Conditions"
        type="url"
        description="Link to your company's terms and conditions."
        defaultValue={company.terms ?? ""}
      />
      <FormField
        id="companyRefundPolicy"
        label="Company Refund Policy"
        type="url"
        description="Link to your company's refund policy."
        defaultValue={company.refundPolicy ?? ""}
      />

      <div className="flex justify-end mt-6 pt-4 border-t">
        <button className="px-6 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 transition-colors">
          Save Changes
        </button>
      </div>
    </Card>
  );
};

export default WorkspaceSettings;
