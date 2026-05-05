import React, { useState, useEffect } from "react";
import { HiUsers } from "react-icons/hi2";
import { HiPencil, HiTrash, HiEye, HiCheckCircle, HiXCircle, HiExternalLink } from "react-icons/hi";
import { toast } from "../utils/toast";
import ProfileButton from "./ProfileButton";
import axios from "axios";
import { API_BASE, PUBLIC_FRONTEND_URL, getImageUrl } from "../utils/api";
import MediaUploader from "./MediaUploader";
import { getS3Path } from "../utils/pathUtils";

// ── Helpers defined OUTSIDE the component so they are never re-created on re-render ──

const ViewRow = ({ label, value, fullWidth }) => (
  <div className={`space-y-1 ${fullWidth ? "sm:col-span-2" : ""}`}>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium text-gray-900">{value || "N/A"}</p>
  </div>
);

const EditField = ({ label, name, value, type = "text", onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      name={name}
      type={type}
      value={value || ""}
      onChange={onChange}
      className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-red-500 focus:ring-red-200"
    />
  </div>
);

const EditTextArea = ({ label, name, value, onChange, rows = 3 }) => (
  <div className="sm:col-span-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-red-500 focus:ring-red-200"
    />
  </div>
);

const SectionLabel = ({ title }) => (
  <p className="text-sm font-semibold text-red-700 border-b border-gray-200 pb-1 mt-2">{title}</p>
);

const TestimonialEditor = ({ testimonials, onChange, agentName }) => {
  const handleAdd = () => {
    onChange([...testimonials, { name: "", text: "", rating: 5, image: "", profile: "", date: "" }]);
  };
  const handleRemove = (idx) => {
    onChange(testimonials.filter((_, i) => i !== idx));
  };
  const handleUpdate = (idx, field, value) => {
    const updated = testimonials.map((t, i) => i === idx ? { ...t, [field]: value } : t);
    onChange(updated);
  };

  return (
    <div className="space-y-4 sm:col-span-2">
      <label className="text-sm font-medium text-gray-700">Our Happy Customers (Testimonials)</label>
      <div className="grid grid-cols-1 gap-4">
        {testimonials.map((t, idx) => (
          <div key={idx} className="border border-gray-200 p-4 rounded-xl relative bg-gray-50 group">
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <HiTrash size={16} />
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EditField label="Customer Name" value={t.name} onChange={(e) => handleUpdate(idx, "name", e.target.value)} />
              <EditField label="Date" value={t.date} onChange={(e) => handleUpdate(idx, "date", e.target.value)} />
              <EditTextArea label="Review Text" value={t.text} onChange={(e) => handleUpdate(idx, "text", e.target.value)} rows={2} />
              <MediaUploader
                label="Trip Image (Drag & Upload)"
                existingUrls={t.image ? [t.image] : []}
                onChange={(urls) => handleUpdate(idx, "image", urls[0] || "")}
                folder={getS3Path.agentTestimonials(agentName)}
                baseFileName={`${t.name}-testimonial`}
              />
              <MediaUploader
                label="Customer Avatar (Drag & Upload)"
                existingUrls={t.profile ? [t.profile] : []}
                onChange={(urls) => handleUpdate(idx, "profile", urls[0] || "")}
                folder={getS3Path.agentTestimonials(agentName)}
                baseFileName={`${t.name}-avatar`}
              />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-red-400 hover:text-red-500 transition-all text-sm font-medium"
      >
        + Add Testimonial
      </button>
    </div>
  );
};

const formatAddress = (addr) => {
  if (!addr) return "N/A";
  const filled = [addr.houseNo, addr.street, addr.area, addr.city, addr.state, addr.postalCode, addr.country]
    .filter(Boolean).join(", ");
  return filled || "N/A";
};

// ─────────────────────────────────────────────────────────────────────────────

const AgentList = () => {
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    registeredEmail: "",
    secondaryEmails: [""],
    photo: "",
    companyAddress: { houseNo: "", street: "", area: "", city: "", state: "", postalCode: "", country: "" },
    branchAddresses: [{ houseNo: "", street: "", area: "", city: "", state: "", postalCode: "", country: "" }],
    overview: "",
    agentPhotos: [],
    tourPackages: "",
    quickInfo: "",
    services: "",
    reviews: "",
    blog: "",
    blogDescription: "",
    testimonials: [],
    bannerImage: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/agents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAgents(res.data.data || []);
    } catch (err) {
      console.error("Error fetching agents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleVerify = async (agentId, currentVerified) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/api/agents/${agentId}`,
        { isVerified: !currentVerified },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAgents();
      toast.success("Verification status updated");
    } catch (err) {
      console.error("Error updating verification", err);
      toast.error(err.response?.data?.message || "Unable to update verification");
    }
  };

  const handleSearch = (e) => { setSearch(e.target.value); setShowSuggestions(true); };
  const handleSuggestionClick = (value) => { setSearch(value); setShowSuggestions(false); };
  const handleView = async (agent) => {
    try {
      const token = localStorage.getItem("token");
      const [agentRes, itiRes] = await Promise.all([
        axios.get(`${API_BASE}/api/agents/${agent._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/agent-itineraries?agentId=${agent._id}&limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);
      setSelectedAgent({ 
        ...agentRes.data.data, 
        assignedItineraries: itiRes.data.data || [] 
      });
    } catch (err) {
      console.error("Error fetching agent details", err);
      toast.error("Failed to load full agent details");
      setSelectedAgent(agent);
    }
  };
  const handleCloseView = () => { setSelectedAgent(null); };

  const handleEditClick = (agent) => {
    setEditData({
      firstName: agent.firstName || "",
      lastName: agent.lastName || "",
      company: agent.company || "",
      email: agent.email || "",
      phone: agent.phone || "",
      registeredEmail: agent.registeredEmail || "",
      secondaryEmails: Array.isArray(agent.secondaryEmails) && agent.secondaryEmails.length > 0 ? agent.secondaryEmails : [""],
      photo: agent.photo || "",
      companyAddress: {
        houseNo: agent.companyAddress?.houseNo || "",
        street: agent.companyAddress?.street || "",
        area: agent.companyAddress?.area || "",
        city: agent.companyAddress?.city || "",
        state: agent.companyAddress?.state || "",
        postalCode: agent.companyAddress?.postalCode || "",
        country: agent.companyAddress?.country || "",
      },
      branchAddresses: Array.isArray(agent.branchAddresses) && agent.branchAddresses.length > 0 ? agent.branchAddresses : [{
        houseNo: "", street: "", area: "", city: "", state: "", postalCode: "", country: ""
      }],
      overview: agent.overview || "",
      agentPhotos: Array.isArray(agent.agentPhotos) ? agent.agentPhotos : (agent.agentPhotos ? [agent.agentPhotos] : []),
      tourPackages: agent.tourPackages || "",
      quickInfo: agent.quickInfo || "",
      services: Array.isArray(agent.services) ? agent.services.join(", ") : (agent.services || ""),
      reviews: agent.reviews || "",
      blog: agent.blog || "",
      blogDescription: agent.blogDescription || "",
      testimonials: Array.isArray(agent.testimonials) ? agent.testimonials : [],
      tags: Array.isArray(agent.tags) ? agent.tags.join(", ") : (agent.tags || ""),
      bannerImage: agent.bannerImage || "",
    });
    setSelectedAgent(agent);
    setShowEditModal(true);
  };

  const sanitize = (str) => (str || "").toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w.-]+/g, "");
  const agentNameForFolder = sanitize(editData.company || `${editData.firstName}-${editData.lastName}`) || "agent";

  // Flat fields
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSecondaryEmailChange = (index, value) => {
    const newEmails = [...editData.secondaryEmails];
    newEmails[index] = value;
    setEditData({ ...editData, secondaryEmails: newEmails });
  };
  const addSecondaryEmail = () => setEditData({ ...editData, secondaryEmails: [...editData.secondaryEmails, ""] });
  const removeSecondaryEmail = (index) => setEditData({ ...editData, secondaryEmails: editData.secondaryEmails.filter((_, i) => i !== index) });

  // Nested address fields
  const handleAddressChange = (addressKey) => (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [addressKey]: { ...prev[addressKey], [name]: value },
    }));
  };

  const handleBranchAddressChange = (index, e) => {
    const { name, value } = e.target;
    const newAddresses = [...editData.branchAddresses];
    newAddresses[index] = { ...newAddresses[index], [name]: value };
    setEditData({ ...editData, branchAddresses: newAddresses });
  };
  const addBranchAddress = () => setEditData({ ...editData, branchAddresses: [...editData.branchAddresses, { houseNo: "", street: "", area: "", city: "", state: "", postalCode: "", country: "" }] });
  const removeBranchAddress = (index) => setEditData({ ...editData, branchAddresses: editData.branchAddresses.filter((_, i) => i !== index) });

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedAgent) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      
      // Send all fields managed in the modal
      const payload = {
        ...editData,
        secondaryEmails: editData.secondaryEmails.filter((e) => e.trim() !== ""),
        branchAddresses: editData.branchAddresses.filter((a) =>
          Object.values(a).some((v) => (v || "").trim() !== "")
        ),
      };

      await axios.put(`${API_BASE}/api/agents/${selectedAgent._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchAgents();
      setShowEditModal(false);
      setSelectedAgent(null);
      toast.success("Agent details updated successfully!");
    } catch (err) {
      console.error("Error updating agent", err);
      toast.error(err.response?.data?.message || "Unable to update agent");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (agentId) => {
    if (!window.confirm("Delete this agent?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/api/agents/${agentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchAgents();
      toast.success("Agent deleted successfully");
    } catch (err) {
      console.error("Error deleting agent", err);
      toast.error(err.response?.data?.message || "Unable to delete agent");
    }
  };

  const filteredAgents = agents.filter((agent) => {
    const agentName = `${agent.firstName || ""} ${agent.lastName || ""}`.trim();
    return `${agentName} ${agent.email || ""} ${agent.phone || ""}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const getAgentName = (agent) =>
    `${agent.firstName || ""} ${agent.lastName || ""}`.trim();

  return (
    <div className="min-h-screen w-full px-4 sm:px-8 py-6 bg-[#f8fafc]">
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

      {/* Search */}
      <div className="relative flex justify-end mb-6">
        <div className="w-full sm:w-1/3 relative">
          <input
            type="text"
            placeholder="Search agents..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            value={search}
            onChange={handleSearch}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            onFocus={() => search && setShowSuggestions(true)}
          />
          {showSuggestions && search.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-200 shadow-md rounded-md w-full mt-1 max-h-40 overflow-y-auto">
              {filteredAgents.length > 0 ? (
                filteredAgents.map((agent, index) => (
                  <li key={index} onClick={() => handleSuggestionClick(getAgentName(agent))} className="px-4 py-2 hover:bg-red-50 cursor-pointer text-sm">
                    {getAgentName(agent)}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500 text-sm">No agents found</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Table (md+) */}
      <div className="overflow-x-auto">
        <table className="min-w-[600px] w-full bg-white rounded-2xl shadow-md hidden md:table">
          <thead>
            <tr className="bg-[linear-gradient(45deg,rgba(37,99,235,0.1),rgba(220,38,38,0.1))] text-[#2563eb]">
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Phone</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgents.map((agent, index) => {
              const agentName = getAgentName(agent);
              return (
                <tr key={index} className="hover:bg-gray-100 transition">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {agent.company ? (
                      <div className="flex flex-col">
                        <span className="font-bold">{agent.company}</span>
                        <span className="text-xs text-gray-500 font-normal">({agentName})</span>
                      </div>
                    ) : agentName}
                  </td>
                  <td className="py-3 px-4">{agent.email}</td>
                  <td className="py-3 px-4">{agent.phone}</td>
                  <td className="py-3 px-4 flex gap-3">
                    {/* <a
                      href={`${PUBLIC_FRONTEND_URL}/verified-transport-details/${agent._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 p-2 rounded"
                      title="View Public Profile"
                    >
                      <HiExternalLink size={20} className="cursor-pointer" />
                    </a> */}
                    <button className="text-red-600 hover:text-red-800 p-2 rounded" onClick={() => handleView(agent)}>
                      <HiEye size={20} className="cursor-pointer" />
                    </button>
                    {/* <button className="text-green-600 hover:text-green-800 p-2 rounded" onClick={() => handleEditClick(agent)}>
                      <HiPencil size={20} className="cursor-pointer" />
                    </button> */}
                    <button
                      onClick={() => handleVerify(agent._id, agent.isVerified)}
                      className={`px-3 py-1 rounded text-xs ${agent.isVerified ? "bg-green-500 text-white" : "bg-gray-300 text-black"}`}
                    >
                      {agent.isVerified ? "Verified" : "Verify"}
                    </button>
                    <button className="text-red-600 hover:text-red-800 p-2 rounded" onClick={() => handleDelete(agent._id)}>
                      <HiTrash size={20} className="cursor-pointer" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredAgents.length === 0 && (
              <tr><td colSpan="4" className="text-center py-4 text-gray-500">No agents found.</td></tr>
            )}
          </tbody>
        </table>

        {/* Card view (mobile) */}
        <div className="flex flex-col space-y-4 md:hidden">
          {filteredAgents.length > 0 ? (
            filteredAgents.map((agent, index) => {
              const agentName = getAgentName(agent);
              return (
                <div key={index} className="bg-white rounded-2xl shadow-md p-4 flex flex-col space-y-2">
                  <div className="text-lg font-semibold text-[#2563eb]">{agentName}</div>
                  <div className="text-sm text-gray-700"><strong>Email:</strong> {agent.email}</div>
                  <div className="text-sm text-gray-700"><strong>Phone:</strong> {agent.phone}</div>
                  <div className="flex gap-4 mt-2">
                    {/* <a
                      href={`${PUBLIC_FRONTEND_URL}/verified-transport-details/${agent._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 p-2 rounded"
                    >
                      <HiExternalLink size={20} className="cursor-pointer" />
                    </a> */}
                    <button className="text-red-600 hover:text-red-800 p-2 rounded" onClick={() => handleView(agent)}>
                      <HiEye size={20} className="cursor-pointer" />
                    </button>
                    {/* <button className="text-green-600 hover:text-green-800 p-2 rounded" onClick={() => handleEditClick(agent)}>
                      <HiPencil size={20} className="cursor-pointer" />
                    </button> */}
                    <button
                      onClick={() => handleVerify(agent._id, agent.isVerified)}
                      className={`px-3 py-1 rounded text-xs ${agent.isVerified ? "bg-green-500 text-white" : "bg-gray-300 text-black"}`}
                    >
                      {agent.isVerified ? "Verified" : "Verify"}
                    </button>
                    <button className="text-red-600 hover:text-red-800 p-2 rounded" onClick={() => handleDelete(agent._id)}>
                      <HiTrash size={20} className="cursor-pointer" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-gray-500">No agents found.</div>
          )}
        </div>
      </div>

      {/* ── VIEW MODAL ─────────────────────────────────── */}
      {selectedAgent && !showEditModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-[#1e3a8a]">Agent Details</h2>
                <p className="text-sm text-gray-500">Full record from the database</p>
              </div>
              <button className="text-gray-500 hover:text-gray-900" onClick={handleCloseView}>✕</button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <ViewRow label="Name" value={getAgentName(selectedAgent)} />
              <ViewRow label="Email" value={selectedAgent.email} />
              <ViewRow label="Phone" value={selectedAgent.phone} />
              <ViewRow label="WhatsApp" value={selectedAgent.whatsapp} />
              <ViewRow label="Role" value={selectedAgent.role} />
              <ViewRow label="Status" value={selectedAgent.isActive ? "Active" : "Inactive"} />
              <ViewRow label="Verification" value={selectedAgent.isVerified ? "Verified" : "Unverified"} />
              <ViewRow label="Company" value={selectedAgent.company} />
              
              <ViewRow label="Registered Email" value={selectedAgent.registeredEmail} fullWidth />
              
              {Array.isArray(selectedAgent.secondaryEmails) && selectedAgent.secondaryEmails.length > 0 && (
                <div className="sm:col-span-2 space-y-1">
                  <p className="text-sm text-gray-500">Secondary Emails</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.secondaryEmails.filter(Boolean).map((email, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">{email}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedAgent.photo && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Profile Photo</p>
                  <img src={getImageUrl(selectedAgent.photo)} alt="Agent" className="w-20 h-20 rounded-2xl object-cover border border-gray-200 shadow-sm" />
                </div>
              )}

              {Array.isArray(selectedAgent.bannerImage) && selectedAgent.bannerImage.length > 0 && (
                <div className="sm:col-span-2 space-y-2">
                  <p className="text-sm text-gray-500">Banner Images</p>
                  <div className="flex flex-wrap gap-3">
                    {selectedAgent.bannerImage.map((img, i) => (
                      <img key={i} src={getImageUrl(img)} alt={`Banner-${i}`} className="h-24 w-40 rounded-xl object-cover border border-gray-200 shadow-sm" />
                    ))}
                  </div>
                </div>
              )}

              <ViewRow label="Company Address" value={formatAddress(selectedAgent.companyAddress)} fullWidth />
              
              {Array.isArray(selectedAgent.branchAddresses) && selectedAgent.branchAddresses.length > 0 && (
                <div className="sm:col-span-2 space-y-3">
                  <p className="text-sm text-gray-500">Branch Addresses</p>
                  <div className="space-y-2">
                    {selectedAgent.branchAddresses.map((addr, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                        <span className="font-bold text-gray-400 mr-2">#{idx+1}</span>
                        {formatAddress(addr)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <ViewRow label="Overview" value={selectedAgent.overview} fullWidth />
              
              <div className="sm:col-span-2 space-y-2">
                <p className="text-sm text-gray-500">Gallery (Photos & Videos)</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Array.isArray(selectedAgent.agentPhotos) && selectedAgent.agentPhotos.map((url, i) => (
                    <img key={`photo-${i}`} src={getImageUrl(url)} alt={`gallery-${i}`} className="w-full aspect-video object-cover rounded-xl border shadow-sm" />
                  ))}
                  {Array.isArray(selectedAgent.agentVideos) && selectedAgent.agentVideos.map((url, i) => (
                    <video key={`video-${i}`} src={getImageUrl(url)} className="w-full aspect-video object-cover rounded-xl border shadow-sm" controls />
                  ))}
                  {(!selectedAgent.agentPhotos?.length && !selectedAgent.agentVideos?.length) && <p className="text-sm text-gray-400 italic">No media uploaded</p>}
                </div>
              </div>

              <ViewRow label="Services" value={Array.isArray(selectedAgent.services) ? selectedAgent.services.join(", ") : selectedAgent.services} fullWidth />
              
              <div className="sm:col-span-2 space-y-3">
                <p className="text-sm text-gray-500">Live Tour Packages (Itineraries)</p>
                {selectedAgent.assignedItineraries?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedAgent.assignedItineraries.map((iti, idx) => (
                      <div key={idx} className="flex gap-3 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <img 
                          src={getImageUrl(iti.coverImageUrl)} 
                          className="w-16 h-16 rounded-xl object-cover" 
                          alt={iti.title}
                          onError={(e) => { e.target.src = "https://via.placeholder.com/100?text=Tour"; }}
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-bold text-gray-800 truncate">{iti.title}</h5>
                          <p className="text-[10px] text-red-600 font-semibold">{iti.destination} · {iti.duration}</p>
                          <p className="text-[10px] text-gray-500 mt-1 font-bold">₹{iti.priceFrom?.toLocaleString() || "On Request"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ViewRow label="" value={selectedAgent.tourPackages} fullWidth />
                )}
              </div>
              
              {Array.isArray(selectedAgent.testimonials) && selectedAgent.testimonials.length > 0 && (
                <div className="sm:col-span-2 space-y-3">
                  <p className="text-sm text-gray-500">Customer Testimonials</p>
                  <div className="grid gap-4">
                    {selectedAgent.testimonials.map((t, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          {t.profile && <img src={getImageUrl(t.profile)} className="w-8 h-8 rounded-full" />}
                          <span className="font-bold text-sm text-gray-800">{t.name}</span>
                          <span className="text-xs text-gray-400 ml-auto">{t.date}</span>
                        </div>
                        <p className="text-xs text-gray-600 italic">"{t.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(selectedAgent.blogs) && selectedAgent.blogs.length > 0 && (
                <div className="sm:col-span-2 space-y-3">
                  <p className="text-sm text-gray-500">Travel Stories (Blogs)</p>
                  <div className="grid gap-4">
                    {selectedAgent.blogs.map((blog, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4">
                        {blog.image && <img src={getImageUrl(blog.image)} className="w-20 h-20 rounded-xl object-cover" />}
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-gray-800">{blog.title}</h4>
                          <p className="text-[10px] text-gray-500 line-clamp-2 mt-1">{blog.content?.replace(/<[^>]*>/g, '')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(selectedAgent.reviewsList) && selectedAgent.reviewsList.length > 0 && (
                <div className="sm:col-span-2 space-y-3">
                  <p className="text-sm text-gray-500">Manual Reviews</p>
                  <div className="grid gap-3">
                    {selectedAgent.reviewsList.map((rev, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                        <div className="flex justify-between font-bold text-gray-700 mb-1">
                          <span>{rev.name}</span>
                          <span className="text-orange-500">{"★".repeat(rev.rating)}</span>
                        </div>
                        <p className="text-gray-600">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <ViewRow label="Quick Info" value={selectedAgent.quickInfo} fullWidth />
              <ViewRow label="Created" value={selectedAgent.createdAt ? new Date(selectedAgent.createdAt).toLocaleString() : "N/A"} fullWidth />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {/* <button className="rounded-xl bg-red-600 px-5 py-3 text-white hover:bg-red-700" onClick={() => handleEditClick(selectedAgent)}>Edit</button> */}
              <button className="rounded-xl bg-red-600 px-5 py-3 text-white hover:bg-red-700" onClick={() => handleDelete(selectedAgent._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ─────────────────────────────────── */}
      {showEditModal && selectedAgent && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-[#1e3a8a]">Edit Agent</h2>
                <p className="text-sm text-gray-500">Update the fields below and save changes.</p>
              </div>
              <button className="text-gray-500 hover:text-gray-900" onClick={() => setShowEditModal(false)}>✕</button>
            </div>

            <form className="space-y-5" onSubmit={handleSaveEdit}>

              <SectionLabel title="Basic Information" />
              <div className="grid gap-4 sm:grid-cols-2">
                <EditField label="First Name" name="firstName" value={editData.firstName} onChange={handleEditChange} />
                <EditField label="Last Name" name="lastName" value={editData.lastName} onChange={handleEditChange} />
                <EditField label="Company Name" name="company" value={editData.company} onChange={handleEditChange} />
                <EditField label="Email" name="email" type="email" value={editData.email} onChange={handleEditChange} />
                <EditField label="Phone" name="phone" value={editData.phone} onChange={handleEditChange} />
              </div>

              <SectionLabel title="Additional Information" />
              <div className="grid gap-4 sm:grid-cols-2">
                <EditField label="Registered Email" name="registeredEmail" type="email" value={editData.registeredEmail} onChange={handleEditChange} />
              </div>
              <div className="space-y-3">
                {editData.secondaryEmails.map((email, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <EditField label="Secondary Email" type="email" value={email} onChange={(e) => handleSecondaryEmailChange(idx, e.target.value)} />
                    </div>
                    {editData.secondaryEmails.length > 1 && (
                      <button type="button" onClick={() => removeSecondaryEmail(idx)} className="mb-1 p-2 rounded bg-red-100 text-red-600 hover:bg-red-200">
                        <HiTrash size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addSecondaryEmail} className="text-sm text-red-600 hover:text-red-800 font-medium">
                  + Add Secondary Email
                </button>
              </div>
              <div className="space-y-2">
                <MediaUploader
                  label="Agent Profile Photo (Drag & Upload)"
                  existingUrls={editData.photo ? [editData.photo] : []}
                  onChange={(urls) => setEditData(prev => ({ ...prev, photo: urls[0] || "" }))}
                  multiple={false}
                  folder={getS3Path.agentProfile(agentNameForFolder)}
                  baseFileName={`${agentNameForFolder}-logo`}
                />
                <MediaUploader
                  label="Agent Profile Banner (Drag & Upload)"
                  existingUrls={editData.bannerImage ? [editData.bannerImage] : []}
                  onChange={(urls) => setEditData(prev => ({ ...prev, bannerImage: urls[0] || "" }))}
                  multiple={false}
                  folder={getS3Path.agentBanner(agentNameForFolder)}
                  baseFileName={`${agentNameForFolder}-banner`}
                />
              </div>

              <SectionLabel title="Company Address" />
              <div className="grid gap-4 sm:grid-cols-2">
                <EditField label="House / Flat No." name="houseNo" value={editData.companyAddress.houseNo} onChange={handleAddressChange("companyAddress")} />
                <EditField label="Street" name="street" value={editData.companyAddress.street} onChange={handleAddressChange("companyAddress")} />
                <EditField label="Area / Locality" name="area" value={editData.companyAddress.area} onChange={handleAddressChange("companyAddress")} />
                <EditField label="City" name="city" value={editData.companyAddress.city} onChange={handleAddressChange("companyAddress")} />
                <EditField label="State" name="state" value={editData.companyAddress.state} onChange={handleAddressChange("companyAddress")} />
                <EditField label="Postal Code" name="postalCode" value={editData.companyAddress.postalCode} onChange={handleAddressChange("companyAddress")} />
              </div>
              <EditField label="Country" name="country" value={editData.companyAddress.country} onChange={handleAddressChange("companyAddress")} />

              <SectionLabel title="Branch Addresses" />
              <div className="space-y-6">
                {editData.branchAddresses.map((addr, idx) => (
                  <div key={idx} className="border border-gray-200 p-4 rounded-xl relative">
                    {editData.branchAddresses.length > 1 && (
                      <button type="button" onClick={() => removeBranchAddress(idx)} className="absolute top-4 right-4 p-2 rounded bg-red-100 text-red-600 hover:bg-red-200">
                        <HiTrash size={16} />
                      </button>
                    )}
                    <h4 className="text-sm font-semibold mb-3">Branch {idx + 1}</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <EditField label="House / Flat No." name="houseNo" value={addr.houseNo} onChange={(e) => handleBranchAddressChange(idx, e)} />
                      <EditField label="Street" name="street" value={addr.street} onChange={(e) => handleBranchAddressChange(idx, e)} />
                      <EditField label="Area / Locality" name="area" value={addr.area} onChange={(e) => handleBranchAddressChange(idx, e)} />
                      <EditField label="City" name="city" value={addr.city} onChange={(e) => handleBranchAddressChange(idx, e)} />
                      <EditField label="State" name="state" value={addr.state} onChange={(e) => handleBranchAddressChange(idx, e)} />
                      <EditField label="Postal Code" name="postalCode" value={addr.postalCode} onChange={(e) => handleBranchAddressChange(idx, e)} />
                    </div>
                    <div className="mt-4">
                      <EditField label="Country" name="country" value={addr.country} onChange={(e) => handleBranchAddressChange(idx, e)} />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addBranchAddress} className="text-sm text-red-600 hover:text-red-800 font-medium">
                  + Add Branch Address
                </button>
              </div>

              <SectionLabel title="Additional Details" />
              <div className="grid gap-4 sm:grid-cols-2">
                <EditTextArea label="Overview" name="overview" value={editData.overview} onChange={handleEditChange} />
                <div className="sm:col-span-2">
                  <MediaUploader
                    label="Photos & Videos"
                    existingUrls={Array.isArray(editData.agentPhotos) ? editData.agentPhotos : []}
                    onChange={(urls) => setEditData((prev) => ({ ...prev, agentPhotos: urls }))}
                    folder={getS3Path.agentGallery(agentNameForFolder)}
                    baseFileName={`${agentNameForFolder}-gallery`}
                  />
                </div>
                <EditTextArea label="Tour Packages" name="tourPackages" value={editData.tourPackages} onChange={handleEditChange} />
                <EditTextArea label="Quick Info" name="quickInfo" value={editData.quickInfo} onChange={handleEditChange} />
                <EditTextArea label="Services" name="services" value={editData.services} onChange={handleEditChange} />
                <EditTextArea label="Reviews" name="reviews" value={editData.reviews} onChange={handleEditChange} />
                <EditTextArea label="Blog Links" name="blog" value={editData.blog} onChange={handleEditChange} placeholder="Enter blog links..." />
                <EditTextArea label="Blog Detailed Description" name="blogDescription" value={editData.blogDescription} onChange={handleEditChange} placeholder="Write detailed blog content here..." rows={6} />
                <TestimonialEditor
                  testimonials={editData.testimonials}
                  onChange={(updated) => setEditData(prev => ({ ...prev, testimonials: updated }))}
                  agentName={agentNameForFolder}
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="submit" disabled={isSaving} className="rounded-xl bg-red-600 px-5 py-3 text-white hover:bg-red-700 disabled:opacity-60">
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
                <button 
                  type="button" 
                  className="rounded-xl border border-gray-200 px-8 py-3 text-gray-700 font-bold hover:bg-gray-100 transition-all" 
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentList;