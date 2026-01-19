import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/Button";
import { Upload, Loader2 } from "lucide-react";
import { 
  updateCompanyDetails, 
  registerCompany, 
  getCompanyDetails 
} from "../../../store/slices/authSlice";
import toast from "react-hot-toast";

export default function BrandingTab() {
  const dispatch = useDispatch();
  const { companyDetails, companyLoading } = useSelector((state) => state.auth);

  // Local Form State
  const [formData, setFormData] = useState({
    name: "",
    hex: "#1038e1",
    documentationURL: "",
    // Including existing fields required by the API
    address: "",
    phoneNum: "",
    website: "",
    industry: ""
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("/logo.png");

  // 1. Fetch details on mount
  useEffect(() => {
    dispatch(getCompanyDetails());
  }, [dispatch]);

  // 2. Sync Redux state to local state
  useEffect(() => {
    if (companyDetails) {
      setFormData({
        name: companyDetails.name || "",
        hex: companyDetails.hex || "#1038e1",
        documentationURL: companyDetails.documentationURL || "",
        address: companyDetails.address || "",
        phoneNum: companyDetails.phoneNum || "",
        website: companyDetails.website || "",
        industry: companyDetails.industry || ""
      });
      if (companyDetails.logo) setPreviewUrl(companyDetails.logo);
    }
  }, [companyDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    const data = new FormData();
    // Append all text fields
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    // Append logo if a new one was selected
    if (logoFile) {
      data.append("logo", logoFile);
    }

    try {
      if (companyDetails) {
        await dispatch(updateCompanyDetails(data)).unwrap();
        toast.success("Branding updated successfully!");
      } else {
        await dispatch(registerCompany(data)).unwrap();
        toast.success("Company registered successfully!");
      }
    } catch (err) {
      toast.error(err || "Failed to save branding");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">White Label Settings</h2>
      <div className="bg-gray-50 p-6 rounded-xl space-y-6">
        
        {/* Company Logo */}
        <div>
          <label className="block text-sm font-medium mb-2">Company Logo</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-md border bg-white flex items-center justify-center overflow-hidden relative group">
              <img
                src={previewUrl}
                alt="Company Logo"
                className="object-contain w-full h-full"
              />
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Upload className="text-white w-6 h-6" />
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            </div>
            <p className="text-xs text-gray-500">Recommended: Square PNG with transparent background.</p>
          </div>
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Company Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g. Swiftflow"
            className="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-100 outline-none"
          />
        </div>

        {/* Brand Color */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Brand Color Hex Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              name="hex"
              value={formData.hex}
              onChange={handleInputChange}
              className="border rounded-md px-3 py-2 w-full font-mono uppercase"
            />
            <input
              type="color"
              name="hex"
              value={formData.hex}
              onChange={handleInputChange}
              className="w-12 h-10 border rounded-md cursor-pointer p-1 bg-white"
            />
          </div>
        </div>

        {/* Documentation URL */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Documentation URL
          </label>
          <input
            type="url"
            name="documentationURL"
            value={formData.documentationURL}
            onChange={handleInputChange}
            placeholder="https://docs.yashayah.ai"
            className="w-full border rounded-md px-3 py-2 outline-none"
          />
        </div>

        {/* Action Button */}
        <Button 
          onClick={handleUpdate} 
          disabled={companyLoading}
          className="mt-4 w-full sm:w-auto flex items-center gap-2"
        >
          {companyLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {companyDetails ? "Update Branding" : "Create Workspace"}
        </Button>
      </div>
    </div>
  );
}