import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "../utils/toast";
import ProfileButton from "./ProfileButton";
import { HiUsers } from "react-icons/hi2";
import MediaUploader from "./MediaUploader";
import { getS3Path } from "../utils/pathUtils";

// ── Helpers defined OUTSIDE the component so they are never re-created on re-render ──

import { validateEmail, validatePhone, validateName, validateRequired } from "../utils/validation";

const SectionTitle = ({ title }) => (
  <div className="border-b border-gray-200 pb-2 mt-2">
    <h2 className="text-base font-semibold text-red-700">{title}</h2>
  </div>
);

const Field = ({ label, id, name, type = "text", required = false, placeholder, value, onChange, error }) => (
  <div className="flex flex-col w-full">
    <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={id}
      name={name || id}
      value={value}
      onChange={onChange}
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      required={required}
      className={`border rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-red-500'}`}
    />
    {error && <p className="text-red-500 text-[10px] mt-1 font-semibold">{error}</p>}
  </div>
);

const TextAreaField = ({ label, id, name, rows = 3, placeholder, value, onChange, error }) => (
  <div className="flex flex-col w-full sm:col-span-2">
    <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      id={id}
      name={name || id}
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className={`border rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-red-500'}`}
    />
    {error && <p className="text-red-500 text-[10px] mt-1 font-semibold">{error}</p>}
  </div>
);



// ─────────────────────────────────────────────────────────────────────────────

const AddAgentForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    password: "",
    registeredEmail: "",
    secondaryEmails: [""],
    photo: "",
    companyAddress: { houseNo: "", street: "", area: "", city: "", state: "", postalCode: "", country: "" },
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSecondaryEmailChange = (index, value) => {
    const newEmails = [...formData.secondaryEmails];
    newEmails[index] = value;
    setFormData({ ...formData, secondaryEmails: newEmails });
  };
  const addSecondaryEmail = () => setFormData({ ...formData, secondaryEmails: [...formData.secondaryEmails, ""] });
  const removeSecondaryEmail = (index) => setFormData({ ...formData, secondaryEmails: formData.secondaryEmails.filter((_, i) => i !== index) });

  const handleCompanyAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, companyAddress: { ...prev.companyAddress, [name]: value } }));
  };

  const validate = () => {
    const newErrors = {};
    newErrors.firstName = validateName(formData.firstName, "First Name");
    newErrors.lastName = validateName(formData.lastName, "Last Name");
    newErrors.company = validateCompanyName(formData.company, "Company Name");
    newErrors.email = validateEmail(formData.email);
    newErrors.phone = validatePhone(formData.phone);
    newErrors.password = validateRequired(formData.password, "Password");
    if (formData.password && formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    // Remove null values
    Object.keys(newErrors).forEach(key => newErrors[key] === null && delete newErrors[key]);
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted errors");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const apiBase = import.meta.env.VITE_API_BASE || "";

      await axios.post(
        `${apiBase}/api/agents`,
        {
          ...formData,
          registeredEmail: formData.registeredEmail || formData.email,
          secondaryEmails: formData.secondaryEmails.filter(e => e.trim() !== ""),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Agent created successfully");
      navigate("/allagents");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Error creating agent");
    }
  };

  const sanitize = (str) => (str || "").toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w.-]+/g, "");
  const agentName = sanitize(formData.company || `${formData.firstName}-${formData.lastName}`) || "new-agent";

  return (
    <div className="w-full min-h-screen bg-white px-4 py-6 sm:px-8 rounded-2xl max-w-7xl mx-auto">
      {/* Header */}
      <header className="relative z-10 bg-white/90 backdrop-blur-xl border border-[rgba(37,99,235,0.2)] rounded-2xl shadow-md mb-6 px-6 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div className="flex items-center text-red-600 text-2xl font-bold gap-4">
          <HiUsers className="text-[#2563eb] text-3xl" />
          <span className="text-3xl font-bold">Agents</span>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <ProfileButton />
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>

        {/* ── Basic Info ─────────────────────────────── */}
        <SectionTitle title="Basic Information" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="First Name" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Enter first name" error={errors.firstName} />
          <Field label="Last Name" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Enter last name" error={errors.lastName} />
          <Field label="Company Name" id="company" name="company" value={formData.company} onChange={handleChange} placeholder="Enter company name" error={errors.company} />
          <Field label="Email" id="email" type="email" value={formData.email} onChange={handleChange} required placeholder="Enter agent email" error={errors.email} />
          <Field label="Phone Number" id="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="Enter phone number" error={errors.phone} />
          <Field label="Create Password" id="password" type="password" value={formData.password} onChange={handleChange} required placeholder="Enter secure password" error={errors.password} />
        </div>

        {/* ── Additional Info ────────────────────────── */}
        <SectionTitle title="Additional Information" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Registered Email" id="registeredEmail" type="email" value={formData.registeredEmail} onChange={handleChange} placeholder="Defaults to email if empty" />
          <div className="flex flex-col w-full">
            <MediaUploader 
              label="Profile Photo (Drag & Upload)" 
              existingUrls={formData.photo ? [formData.photo] : []} 
              onChange={(urls) => setFormData(prev => ({ ...prev, photo: urls[0] || "" }))} 
              folder={getS3Path.agentProfile(agentName)}
              baseFileName={`${agentName}-logo`}
            />
          </div>
        </div>

        <div className="space-y-4 mt-4">

          {formData.secondaryEmails.map((email, idx) => (
            <div key={idx} className="flex gap-2 items-end">
              <div className="flex-1">
                <Field label="Secondary Email" value={email} onChange={(e) => handleSecondaryEmailChange(idx, e.target.value)} placeholder="Enter secondary email" />
              </div>
              {formData.secondaryEmails.length > 1 && (
                <button type="button" onClick={() => removeSecondaryEmail(idx)} className="mb-1 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addSecondaryEmail} className="text-sm text-red-600 hover:text-red-800 font-medium">+ Add Secondary Email</button>
        </div>

        {/* ── Company Address ────────────────────────── */}
        <SectionTitle title="Company Address" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="House / Flat No." id="houseNo" name="houseNo" value={formData.companyAddress.houseNo} onChange={handleCompanyAddressChange} placeholder="e.g. 12A" />
          <Field label="Street" id="street" name="street" value={formData.companyAddress.street} onChange={handleCompanyAddressChange} placeholder="e.g. MG Road" />
          <Field label="Area / Locality" id="area" name="area" value={formData.companyAddress.area} onChange={handleCompanyAddressChange} placeholder="e.g. Connaught Place" />
          <Field label="City" id="city" name="city" value={formData.companyAddress.city} onChange={handleCompanyAddressChange} placeholder="e.g. New Delhi" />
          <Field label="State" id="state" name="state" value={formData.companyAddress.state} onChange={handleCompanyAddressChange} placeholder="e.g. Delhi" />
          <Field label="Postal Code" id="postalCode" name="postalCode" value={formData.companyAddress.postalCode} onChange={handleCompanyAddressChange} placeholder="e.g. 110001" />
          <Field label="Country" id="country" name="country" value={formData.companyAddress.country} onChange={handleCompanyAddressChange} placeholder="e.g. India" />
        </div>


        {/* ── Submit ─────────────────────────────────── */}
        <div className="pt-6 border-t border-gray-100">
          <button
            type="submit"
            className="cursor-pointer bg-blue-600 text-white font-semibold px-10 py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 w-full max-w-md flex items-center justify-center gap-2"
          >
            <HiUsers className="text-xl" />
            Create Agent Account
          </button>
          <p className="text-xs text-gray-500 mt-4 italic">
            * Branch addresses and public profile details (Overview, Packages, etc.) can be added from the "Additional Information" section after account creation.
          </p>
        </div>
      </form>
    </div>
  );
};

export default AddAgentForm;