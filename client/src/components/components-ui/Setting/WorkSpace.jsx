// src/components/components-ui/Setting/WorkSpace.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, Upload, ImageIcon, Building2 } from "lucide-react";
import {
  getCompanyDetails,
  registerCompany,
  updateCompanyDetails,
} from "../../../store/slices/authSlice";
import toast from "react-hot-toast";

const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white placeholder:text-gray-400";

const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <div>
      <label className="block text-sm font-semibold text-gray-800">{label}</label>
      {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
    </div>
    {children}
  </div>
);

const WorkspaceSettings = () => {
  const dispatch = useDispatch();
  const { companyDetails, companyLoading } = useSelector((s) => s.auth);

  const [formData, setFormData] = useState({
    name: "", address: "", phoneNum: "", website: "",
    industry: "", documentationURL: "", hex: "#1038e1",
  });
  const [logoFile,   setLogoFile]   = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => { dispatch(getCompanyDetails()); }, [dispatch]);

  useEffect(() => {
    if (companyDetails) {
      setFormData({
        name:             companyDetails.name             || "",
        address:          companyDetails.address          || "",
        phoneNum:         companyDetails.phoneNum         || "",
        website:          companyDetails.website          || "",
        industry:         companyDetails.industry         || "",
        documentationURL: companyDetails.documentationURL || "",
        hex:              companyDetails.hex              || "#1038e1",
      });
      if (companyDetails.logo) setPreviewUrl(companyDetails.logo);
    }
  }, [companyDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) { setLogoFile(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const handleSave = async () => {
    const data = new FormData();
    Object.keys(formData).forEach((k) => data.append(k, formData[k]));
    if (logoFile) data.append("logo", logoFile);
    try {
      if (companyDetails) {
        await dispatch(updateCompanyDetails(data)).unwrap();
        toast.success("Workspace updated!");
      } else {
        await dispatch(registerCompany(data)).unwrap();
        toast.success("Workspace created!");
      }
    } catch (err) {
      toast.error(err || "Failed to save");
    }
  };

  if (companyLoading && !companyDetails) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Section header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">My Workspace</h3>
            <p className="text-xs text-gray-500 font-mono">
              {companyDetails?.agencyId ? `ID: ${companyDetails.agencyId}` : "New workspace"}
            </p>
          </div>
        </div>
      </div>

      {/* Logo upload */}
      <Field label="Company Logo" hint="Square PNG or SVG, min 256×256px, up to 2 MB">
        <div className="flex items-center gap-5">
          <label className="group relative w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 transition-colors">
            {previewUrl
              ? <img src={previewUrl} alt="Logo" className="w-full h-full object-contain" />
              : <ImageIcon className="w-7 h-7 text-gray-300" />
            }
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
              <Upload className="w-4 h-4 text-white" />
              <span className="text-[10px] text-white font-medium mt-1">Upload</span>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
          <div>
            <p className="text-xs font-medium text-gray-700">Click to upload</p>
            <p className="text-xs text-gray-400 mt-0.5">PNG, SVG, JPG up to 2 MB</p>
            {previewUrl && (
              <button
                onClick={() => { setLogoFile(null); setPreviewUrl(""); }}
                className="text-xs text-red-500 hover:text-red-600 mt-1.5 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </Field>

      {/* Fields grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Company Name">
          <input type="text" name="name" value={formData.name} onChange={handleChange}
            placeholder="Acme Agency" className={inputCls} />
        </Field>
        <Field label="Industry">
          <input type="text" name="industry" value={formData.industry} onChange={handleChange}
            placeholder="e.g. Real Estate, Healthcare" className={inputCls} />
        </Field>
        <Field label="Business Address">
          <input type="text" name="address" value={formData.address} onChange={handleChange}
            placeholder="123 Main St, City, State" className={inputCls} />
        </Field>
        <Field label="Phone Number">
          <input type="tel" name="phoneNum" value={formData.phoneNum} onChange={handleChange}
            placeholder="+1 (555) 000-0000" className={inputCls} />
        </Field>
        <Field label="Website">
          <input type="url" name="website" value={formData.website} onChange={handleChange}
            placeholder="https://yoursite.com" className={inputCls} />
        </Field>
        <Field label="Documentation URL">
          <input type="url" name="documentationURL" value={formData.documentationURL} onChange={handleChange}
            placeholder="https://docs.yoursite.com" className={inputCls} />
        </Field>
      </div>

      {/* Brand color */}
      <Field label="Brand Color" hint="Used for accents in the white-label portal">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl border border-gray-200 flex-shrink-0 shadow-sm"
            style={{ backgroundColor: formData.hex }} />
          <input type="text" name="hex" value={formData.hex} onChange={handleChange}
            className={`${inputCls} font-mono uppercase flex-1`} placeholder="#1038e1" />
          <input type="color" name="hex" value={formData.hex} onChange={handleChange}
            className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-1 bg-white flex-shrink-0" />
        </div>
      </Field>

      {/* Save */}
      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={companyLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {companyLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {companyDetails ? "Save Changes" : "Create Workspace"}
        </button>
      </div>
    </div>
  );
};

export default WorkspaceSettings;
