import React, { useEffect, useState } from "react";
import Card from "../ui/Card";
import { Settings, Loader2, Upload } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCompanyDetails,
  registerCompany,
  updateCompanyDetails,
} from "../../../store/slices/authSlice";
import toast from "react-hot-toast";

const FormField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
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
      name={id}
      value={value}
      onChange={onChange}
      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
      placeholder={placeholder}
    />
  </div>
);

const WorkspaceSettings = () => {
  const dispatch = useDispatch();
  const { companyDetails, companyLoading } = useSelector((state) => state.auth);

  // Controlled form state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phoneNum: "",
    website: "",
    industry: "",
    documentationURL: "",
    hex: "#000000",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    dispatch(getCompanyDetails());
  }, [dispatch]);

  // Sync Redux state to local form state when data arrives
  useEffect(() => {
    if (companyDetails) {
      setFormData({
        name: companyDetails.name || "",
        address: companyDetails.address || "",
        phoneNum: companyDetails.phoneNum || "",
        website: companyDetails.website || "",
        industry: companyDetails.industry || "",
        documentationURL: companyDetails.documentationURL || "",
        hex: companyDetails.hex || "#000000",
      });
      setPreviewUrl(companyDetails.logo || "");
    }
  }, [companyDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const submissionData = new FormData();
    Object.keys(formData).forEach((key) => {
      submissionData.append(key, formData[key]);
    });
    if (logoFile) {
      submissionData.append("logo", logoFile);
    }

    try {
      if (companyDetails) {
        // If company exists, use Update API
        await dispatch(updateCompanyDetails(submissionData)).unwrap();
        toast.success("Workspace updated successfully");
      } else {
        // If no company, use Register API
        await dispatch(registerCompany(submissionData)).unwrap();
        toast.success("Company registered successfully");
      }
    } catch (error) {
      toast.error(error || "Action failed");
    }
  };

  if (companyLoading && !companyDetails) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 w-[800px] min-h-screen font-sans">
      <Card>
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h2 className="text-lg font-semibold text-gray-800">My Workspace</h2>
          <span className="text-sm text-gray-500 font-mono">
            ID: {companyDetails?.agencyId ?? "NEW_WORKSPACE"}
          </span>
        </div>

        {/* Logo Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Logo
          </label>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={previewUrl || "https://via.placeholder.com/60"}
                alt="Preview"
                className="w-20 h-20 rounded-lg object-cover border-2 border-gray-100 shadow-sm"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-lg cursor-pointer transition-opacity">
                <Upload size={18} />
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </label>
            </div>
            <div className="text-xs text-gray-500">
              <p className="font-medium text-gray-700">Logo Square</p>
              <p>PNG, JPG up to 2MB</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <FormField
            id="name"
            label="Company Name"
            value={formData.name}
            onChange={handleInputChange}
          />
          <FormField
            id="industry"
            label="Industry"
            value={formData.industry}
            onChange={handleInputChange}
            placeholder="e.g. Automation and AI"
          />
          <FormField
            id="address"
            label="Company Address"
            value={formData.address}
            onChange={handleInputChange}
          />
          <FormField
            id="phoneNum"
            label="Company Number"
            type="tel"
            value={formData.phoneNum}
            onChange={handleInputChange}
          />
          <FormField
            id="website"
            label="Company Website"
            type="url"
            value={formData.website}
            onChange={handleInputChange}
          />
          <FormField
            id="documentationURL"
            label="Documentation URL"
            type="url"
            value={formData.documentationURL}
            onChange={handleInputChange}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand Color (Hex)
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                name="hex"
                value={formData.hex}
                onChange={handleInputChange}
                className="h-9 w-12 border rounded-md cursor-pointer"
              />
              <input
                type="text"
                name="hex"
                value={formData.hex}
                onChange={handleInputChange}
                className="flex-1 p-2 border border-gray-300 rounded-md text-sm uppercase"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={companyLoading}
            className="flex items-center gap-2 px-6 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {companyLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {companyDetails ? "Save Changes" : "Register Company"}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default WorkspaceSettings;
