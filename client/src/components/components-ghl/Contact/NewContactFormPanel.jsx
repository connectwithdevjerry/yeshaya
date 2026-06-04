// src/components/components-ghl/Contact/NewContactFormPanel.jsx
import React, { useEffect, useState } from "react";
import {
  X, Loader2, User, Mail, Phone, Building2,
  Briefcase, Linkedin, UserPlus, Save, ChevronRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createContact, updateContact, fetchContacts, clearContactStatus } from "../../../store/slices/assistantsSlice";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

/* ── reusable field wrapper ── */
const Field = ({ label, required, error, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
      {label}
      {required && <span className="text-rose-400 text-sm leading-none">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-rose-500 flex items-center gap-1">{error}</p>}
  </div>
);

/* ── validation helpers (mirror backend) ── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (e) => EMAIL_RE.test((e || "").trim().toLowerCase());
const isValidPhone = (p) => {
  const digits = (p || "").replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
};

const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none transition-all placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500";

/* ── avatar preview ── */
const GRAD_COLORS = [
  "from-indigo-500 to-violet-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
];
const getGrad = (name = "") => GRAD_COLORS[(name.charCodeAt(0) || 0) % GRAD_COLORS.length];

const AvatarPreview = ({ first, last }) => {
  const initials = `${(first?.[0] || "").toUpperCase()}${(last?.[0] || "").toUpperCase()}`;
  return (
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGrad(first || "A")} flex items-center justify-center shadow-md flex-shrink-0`}>
      {initials
        ? <span className="text-white text-lg font-bold">{initials}</span>
        : <User className="w-6 h-6 text-white/70" />
      }
    </div>
  );
};

export function NewContactFormPanel({ onClose, subaccountId, initialData }) {
  const dispatch = useDispatch();
  const isEditing = !!(initialData?._id || initialData?.id);
  const { contactActionLoading } = useSelector((s) => s.assistants);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "",
    phone: "", linkedin: "", company: "", title: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => { dispatch(clearContactStatus()); }, [dispatch]);

  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        firstName: initialData.firstName || "",
        lastName:  initialData.lastName  || "",
        email:     initialData.email     || "",
        phone:     initialData.phone     || "",
        linkedin:  initialData.linkedin  || "",
        company:   initialData.company   || "",
        title:     initialData.title     || "",
      });
    }
  }, [initialData, isEditing]);

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    const key = id || name;
    setFormData((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = "First name is required";
    if (!formData.email.trim()) {
      e.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      e.email = "Enter a valid email address";
    }
    if (formData.phone.trim() && !isValidPhone(formData.phone)) {
      e.phone = "Phone must be 7–15 digits";
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    try {
      if (isEditing) {
        await dispatch(updateContact({
          subaccountId,
          contactId:   initialData._id || initialData.id,
          contactData: formData,
        })).unwrap();
        toast.success("Contact updated");
      } else {
        const result = await dispatch(createContact({ subaccountId, contactData: formData })).unwrap();
        if (result?.merged) {
          toast.success("Matched an existing contact and updated it");
        } else {
          toast.success("Contact created");
        }
      }
      dispatch(fetchContacts({ subaccountId }));
      onClose();
    } catch (err) {
      toast.error(err || `Failed to ${isEditing ? "update" : "create"} contact`);
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <motion.div
        key="panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
      >

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              {isEditing
                ? <Save className="w-4 h-4 text-indigo-500" />
                : <UserPlus className="w-4 h-4 text-indigo-500" />
              }
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                {isEditing ? "Edit Contact" : "New Contact"}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {isEditing ? "Update contact details below" : "Fill in the details to add a new contact"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Avatar preview strip ── */}
        <div className="flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-indigo-50/60 to-violet-50/40 border-b border-gray-100">
          <AvatarPreview first={formData.firstName} last={formData.lastName} />
          <div className="min-w-0">
            <p className="text-base font-semibold text-gray-800 truncate">
              {formData.firstName || formData.lastName
                ? `${formData.firstName} ${formData.lastName}`.trim()
                : <span className="text-gray-300 font-normal">Full name</span>
              }
            </p>
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {formData.title && formData.company
                ? `${formData.title} · ${formData.company}`
                : formData.title || formData.company || <span className="text-gray-300">Title · Company</span>
              }
            </p>
            <p className="text-xs text-indigo-400 truncate mt-0.5">
              {formData.email || <span className="text-gray-300">email@example.com</span>}
            </p>
          </div>
        </div>

        {/* ── Form ── */}
        <form
          id="contact-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" required error={errors.firstName}>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Jane"
                  className={`${inputCls} pl-9 ${errors.firstName ? "border-rose-300 focus:border-rose-400 focus:ring-rose-500/20" : ""}`}
                  autoFocus
                />
              </div>
            </Field>
            <Field label="Last Name">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Smith"
                className={inputCls}
              />
            </Field>
          </div>

          {/* Email */}
          <Field label="Email" required error={errors.email}>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@example.com"
                className={`${inputCls} pl-9 ${errors.email ? "border-rose-300 focus:border-rose-400 focus:ring-rose-500/20" : ""}`}
              />
            </div>
          </Field>

          {/* Phone */}
          <Field label="Phone" error={errors.phone}>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className={`${inputCls} pl-9 ${errors.phone ? "border-rose-300 focus:border-rose-400 focus:ring-rose-500/20" : ""}`}
              />
            </div>
          </Field>

          {/* Company + Title row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company">
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                <input
                  type="text"
                  id="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Acme Inc."
                  className={`${inputCls} pl-9`}
                />
              </div>
            </Field>
            <Field label="Title">
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="CEO"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </Field>
          </div>

          {/* LinkedIn */}
          <Field label="LinkedIn">
            <div className="relative flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
              <span className="flex items-center gap-1.5 pl-3 pr-2 text-xs text-gray-400 border-r border-gray-200 h-full py-2.5 bg-gray-50 flex-shrink-0 select-none">
                <Linkedin className="w-3.5 h-3.5 text-blue-500" />
                linkedin.com/in/
              </span>
              <input
                type="text"
                id="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="username"
                className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-gray-300"
              />
            </div>
          </Field>
        </form>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="contact-form"
            disabled={contactActionLoading}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {contactActionLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEditing ? "Saving…" : "Adding…"}
              </>
            ) : (
              <>
                {isEditing ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isEditing ? "Save Changes" : "Add Contact"}
              </>
            )}
          </button>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
