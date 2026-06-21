// src/components/components-ui/Agency/BrandingTab.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Upload, Loader2, ImageIcon } from "lucide-react";
import {
  updateCompanyDetails,
  registerCompany,
  getCompanyDetails,
} from "../../../store/slices/authSlice";
import toast from "react-hot-toast";

const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <div>
      <label className="block text-sm font-semibold text-gray-800">{label}</label>
      {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
    </div>
    {children}
  </div>
);

const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white placeholder:text-gray-400";

export default function BrandingTab() {
  const dispatch = useDispatch();
  const { companyDetails, companyLoading } = useSelector((s) => s.auth);

  const [formData, setFormData] = useState({
    name: "", hex: "#1038e1", documentationURL: "",
    address: "", phoneNum: "", website: "", industry: "",
  });
  const [logoFile,   setLogoFile]   = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => { dispatch(getCompanyDetails()); }, [dispatch]);

  useEffect(() => {
    if (companyDetails) {
      setFormData({
        name:             companyDetails.name             || "",
        hex:              companyDetails.hex              || "#1038e1",
        documentationURL: companyDetails.documentationURL || "",
        address:          companyDetails.address          || "",
        phoneNum:         companyDetails.phoneNum         || "",
        website:          companyDetails.website          || "",
        industry:         companyDetails.industry         || "",
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
    if (file) {
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const data = new FormData();
    Object.keys(formData).forEach((k) => data.append(k, formData[k]));
    if (logoFile) data.append("logo", logoFile);
    try {
      if (companyDetails) {
        await dispatch(updateCompanyDetails(data)).unwrap();
        toast.success("Branding updated!");
      } else {
        await dispatch(registerCompany(data)).unwrap();
        toast.success("Company registered!");
      }
    } catch (err) {
      toast.error(err || "Failed to save branding");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-bold text-gray-900">White Label Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Customize your agency's brand identity shown to sub-accounts.</p>
      </div>

      <div className="space-y-6">

        {/* ── Logo upload ── */}
        <Field label="Company Logo" hint="Recommended: Square PNG or SVG with transparent background, min 256×256px">
          <div className="flex items-center gap-5">
            <label className="group relative w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 transition-colors">
              {previewUrl ? (
                <img src={previewUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-300" />
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                <Upload className="w-5 h-5 text-white" />
                <span className="text-[10px] text-white font-medium mt-1">Upload</span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
            <div>
              <p className="text-xs font-medium text-gray-700">Click the box to upload</p>
              <p className="text-xs text-gray-400 mt-0.5">PNG, SVG, JPG up to 2 MB</p>
              {previewUrl && (
                <button
                  onClick={() => { setLogoFile(null); setPreviewUrl(null); }}
                  className="text-xs text-red-500 hover:text-red-600 mt-1.5 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </Field>

        {/* ── Company name ── */}
        <Field label="Company Name" hint="Displayed in the sidebar and sub-account portal">
          <input
            type="text" name="name" value={formData.name}
            onChange={handleChange} placeholder="e.g. Acme Agency"
            className={inputCls}
          />
        </Field>

        {/* ── Brand color ── */}
        <Field label="Brand Color" hint="Used for accents in the white-label portal">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-xl border border-gray-200 flex-shrink-0 shadow-sm"
              style={{ backgroundColor: formData.hex }}
            />
            <input
              type="text" name="hex" value={formData.hex}
              onChange={handleChange}
              className={`${inputCls} font-mono uppercase flex-1`}
              placeholder="#1038e1"
            />
            <input
              type="color" name="hex" value={formData.hex}
              onChange={handleChange}
              className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-1 bg-white flex-shrink-0"
            />
          </div>
        </Field>

        {/* ── Documentation URL ── */}
        <Field label="Documentation URL" hint="Help link shown to sub-account users">
          <input
            type="url" name="documentationURL" value={formData.documentationURL}
            onChange={handleChange} placeholder="https://docs.yoursite.com"
            className={inputCls}
          />
        </Field>

        {/* ── Divider ── */}
        <div className="border-t border-gray-100 pt-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Additional Info</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Business Address">
              <input type="text" name="address" value={formData.address}
                onChange={handleChange} placeholder="123 Main St, City, State"
                className={inputCls} />
            </Field>
            <Field label="Phone Number">
              <input type="tel" name="phoneNum" value={formData.phoneNum}
                onChange={handleChange} placeholder="+1 (555) 000-0000"
                className={inputCls} />
            </Field>
            <Field label="Website">
              <input type="url" name="website" value={formData.website}
                onChange={handleChange} placeholder="https://yoursite.com"
                className={inputCls} />
            </Field>
            <Field label="Industry">
              <input type="text" name="industry" value={formData.industry}
                onChange={handleChange} placeholder="e.g. Real Estate, Healthcare"
                className={inputCls} />
            </Field>
          </div>
        </div>

      </div>

      {/* ── Save ── */}
      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={companyLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {companyLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {companyDetails ? "Update Branding" : "Create Workspace"}
        </button>
      </div>
    </div>
  );
}
