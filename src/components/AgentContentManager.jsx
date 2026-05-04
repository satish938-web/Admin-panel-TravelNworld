import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { HiOutlineTrash, HiOutlinePencilSquare, HiOutlineInformationCircle, HiXMark } from "react-icons/hi2";
import { HiSave, HiOutlineChatAlt2, HiStar, HiTrash, HiPencil, HiExternalLink, HiUserGroup, HiTrendingUp, HiFilter } from "react-icons/hi";
import { toast } from "../utils/toast";
import { 
  FaSuitcase, FaClock, FaMapMarkerAlt, FaUser, FaImage, 
  FaInfoCircle, FaListAlt, FaTags, FaImages, FaVideo, 
  FaBlog, FaQuoteLeft, FaChevronLeft, FaChevronRight , FaStar 
} from "react-icons/fa";
import ProfileButton from "./ProfileButton";
import MediaUploader from "./MediaUploader";
import { getS3Path, sanitize } from "../utils/pathUtils";
import { getImageUrl, API_BASE, PUBLIC_FRONTEND_URL } from "../utils/api";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const SectionTitle = ({ title }) => (
  <div className="border-b border-gray-200 pb-2 mb-6">
    <h2 className="text-xl font-bold text-blue-700">{title}</h2>
  </div>
);

const Field = ({ label, id, name, type = "text", value, onChange, placeholder }) => (
  <div className="flex flex-col w-full">
    <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={name || id}
      value={value}
      onChange={onChange}
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
    />
  </div>
);

const TextAreaField = ({ label, id, name, rows = 6, value, onChange, placeholder }) => (
  <div className="flex flex-col w-full">
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
      className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
    />
  </div>
);

const TagInput = ({ label, value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState("");
  const tags = typeof value === "string" ? value.split(",").map(t => t.trim()).filter(t => t !== "") : [];


  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        const newTags = [...tags, inputValue.trim()];
        onChange(newTags.join(","));
      }
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      const newTags = tags.slice(0, -1);
      onChange(newTags.join(","));
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    onChange(newTags.join(","));
  };

  return (
    <div className="flex flex-col w-full">
      <label className="text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="border border-gray-300 rounded-2xl px-4 py-2 w-full focus-within:ring-2 focus-within:ring-blue-500 transition-all bg-white min-h-[100px] flex flex-wrap gap-2 items-start content-start">
        {tags.map((tag, idx) => (
          <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-800">
              <HiXMark size={14} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : "Add more..."}
          className="flex-1 outline-none py-2 text-sm text-slate-700 bg-transparent min-w-[120px]"
        />
      </div>
      <p className="mt-2 text-[10px] text-slate-400 font-medium italic">Press Enter or comma to add a tag. These will appear as beautiful cards on the profile.</p>
    </div>
  );
};

const TestimonialEditor = ({ testimonials, onChange, agentName, agentId }) => {
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {testimonials.map((t, idx) => (
          <div key={idx} className="border border-gray-200 p-6 rounded-2xl relative bg-white shadow-sm group">
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-4 right-4 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100"
            >
              Remove
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Customer Name" value={t.name} onChange={(e) => handleUpdate(idx, "name", e.target.value)} placeholder="e.g. John Doe" />
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={t.date ? (t.date.includes('-') ? t.date : new Date(t.date).toISOString().split('T')[0]) : ''}
                  onChange={(e) => handleUpdate(idx, "date", e.target.value)}
                  className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-slate-50 font-medium text-slate-700"
                  style={{ colorScheme: 'light' }}
                />
              </div>
              <div className="sm:col-span-2">
                <TextAreaField label="Review Text" value={t.text} onChange={(e) => handleUpdate(idx, "text", e.target.value)} rows={3} />
              </div>
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <MediaUploader
                  key={`${agentId}-testimonial-image-${idx}`}
                  label="Trip Image (Drag & Upload)"
                  existingUrls={t.image ? [t.image] : []}
                  onChange={(urls) => handleUpdate(idx, "image", urls[0] || "")}
                  folder={getS3Path.agentTestimonials(agentName)}
                  baseFileName={`${t.name}-testimonial`}
                />
                <MediaUploader
                  key={`${agentId}-testimonial-avatar-${idx}`}
                  label="Customer Avatar (Drag & Upload)"
                  existingUrls={t.profile ? [t.profile] : []}
                  onChange={(urls) => handleUpdate(idx, "profile", urls[0] || "")}
                  folder={getS3Path.agentTestimonials(agentName)}
                  baseFileName={`${t.name}-avatar`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all font-bold bg-white"
      >
        + Add New Testimonial
      </button>
    </div>
  );
};

const SECTIONS = [
  { id: "photo", label: "Profile Photo", icon: FaUser },
  { id: "bannerImage", label: "Banner Image", icon: FaImage },
  { id: "branchAddresses", label: "Branches", icon: FaMapMarkerAlt },
  { id: "overview", label: "Overview", icon: FaInfoCircle },
  { id: "quickInfo", label: "Quick Info", icon: FaListAlt },
  { id: "services", label: "Services", icon: FaTags },
  { id: "tourPackages", label: "Packages", icon: FaSuitcase },
  { id: "agentPhotos", label: "Gallery", icon: FaImages },
  { id: "agentVideos", label: "Videos", icon: FaVideo },
  { id: "reviewsList", label: "Reviews", icon: FaStar },
  { id: "blogs", label: "Blog", icon: FaBlog },
  { id: "testimonials", label: "Testimonials", icon: FaQuoteLeft },
];

const AgentContentManager = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [selectedSection, setSelectedSection] = useState(SECTIONS[0].id);
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [itineraries, setItineraries] = useState([]);
  const [itinerariesLoading, setItinerariesLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [publicReviews, setPublicReviews] = useState([]);
  const [publicReviewsLoading, setPublicReviewsLoading] = useState(false);
  const [showReviewEditModal, setShowReviewEditModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const agentName = agentData ? (agentData.company || `${agentData.firstName} ${agentData.lastName}`) : "unknown";

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/agents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAgents(res.data.data || []);
    } catch (err) {
      console.error("Error fetching agents", err);
    }
  };

  useEffect(() => {
    if (selectedAgentId) {
      fetchAgentDetails(selectedAgentId);
    } else {
      setAgentData(null);
    }
  }, [selectedAgentId]);

  const fetchAgentDetails = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/agents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data;
      
      // Auto-migrate old blog data to the new blogs array if needed
      if ((!data.blogs || data.blogs.length === 0) && data.blogDescription) {
        data.blogs = [{
          title: data.blogTitle || "Latest Story",
          content: data.blogDescription || "",
          image: data.blogImage || "",
          isPublished: data.isBlogPublished !== false,
          createdAt: new Date()
        }];
      }
      
      setAgentData(data);
    } catch (err) {
      console.error("Error fetching agent details", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchItineraries = async (agentId) => {
    setItinerariesLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/agent-itineraries?agentId=${agentId}`);
      setItineraries(res.data.data || []);
    } catch (err) {
      console.error("Error fetching itineraries", err);
    } finally {
      setItinerariesLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAgentId && selectedSection === "tourPackages") {
      fetchItineraries(selectedAgentId);
    }
    if (selectedAgentId && selectedSection === "reviewsList") {
      fetchPublicReviews(selectedAgentId);
    }
  }, [selectedAgentId, selectedSection]);

  const fetchPublicReviews = async (agentId) => {
    setPublicReviewsLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Since our API currently gets ALL reviews, we filter here or update API
      const res = await axios.get(`${API_BASE}/api/agents/all/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter for this specific agent
      const agentIdToFilter = agentId?._id || agentId;
      const filtered = (res.data.data || []).filter(r => r.agentId === agentIdToFilter || r.agentId?._id === agentIdToFilter);
      setPublicReviews(filtered);
    } catch (err) {
      console.error("Error fetching public reviews", err);
    } finally {
      setPublicReviewsLoading(false);
    }
  };

  const deletePublicReview = async (reviewId) => {
    const result = await Swal.fire({
      title: "Delete Public Review?",
      text: "This review was submitted by a user. Are you sure you want to delete it?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it"
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE}/api/agents/reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Public review removed!");
        fetchPublicReviews(selectedAgentId);
      } catch (err) {
        toast.error("Failed to delete review");
      }
    }
  };

  const handleUpdateField = (field, value) => {
    setAgentData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBranchAddressChange = (index, e) => {
    const { name, value } = e.target;
    const newAddresses = [...(agentData.branchAddresses || [])];
    newAddresses[index] = { ...newAddresses[index], [name]: value };
    handleUpdateField("branchAddresses", newAddresses);
  };

  const addBranchAddress = () => {
    const newAddresses = [...(agentData.branchAddresses || []), { houseNo: "", street: "", area: "", city: "", state: "", postalCode: "", country: "" }];
    handleUpdateField("branchAddresses", newAddresses);
  };

  const removeBranchAddress = (index) => {
    const newAddresses = (agentData.branchAddresses || []).filter((_, i) => i !== index);
    handleUpdateField("branchAddresses", newAddresses);
  };

  const handleSave = async () => {
    if (!selectedAgentId || !agentData) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      let payload = { [selectedSection]: agentData[selectedSection] };

      await axios.put(`${API_BASE}/api/agents/${selectedAgentId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAgentDetails(selectedAgentId);
      const sectionLabel = SECTIONS.find(s => s.id === selectedSection)?.label || selectedSection;
      toast.success(`${sectionLabel} updated successfully!`);
    } catch (err) {
      console.error("Error saving section", err);
      toast.error("Error saving section");
    } finally {
      setSaving(false);
    }
  };

  const renderSectionEditor = () => {
    if (!agentData) return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-100">
        <HiOutlineInformationCircle size={48} className="mb-4" />
        <p className="text-lg font-medium">Please select an agent to begin editing</p>
      </div>
    );

    switch (selectedSection) {
      case "photo":
        return (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <MediaUploader
              key={`${selectedAgentId}-photo`}
              label="Agent Logo / Profile Photo (Drag & Upload)"
              existingUrls={agentData.photo ? [agentData.photo] : []}
              onChange={(urls) => handleUpdateField("photo", urls[0] || "")}
              folder={getS3Path.agentProfile(agentName)}
              baseFileName={`${agentName}-logo`}
            />
            <p className="mt-4 text-[10px] text-slate-400 font-medium italic">This logo appears in the circular profile area on the public page.</p>
          </div>
        );
      case "bannerImage":
        return (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <MediaUploader
              key={`${selectedAgentId}-banner`}
              label="Agent Profile Banners (Drag & Upload Multiple)"
              maxFiles={10}
              existingUrls={Array.isArray(agentData.bannerImage) ? agentData.bannerImage : (agentData.bannerImage ? [agentData.bannerImage] : [])}
              onChange={(urls) => handleUpdateField("bannerImage", urls)}
              folder={getS3Path.agentBanner(agentName)}
              baseFileName={`${agentName}-banner`}
            />
            <p className="mt-4 text-[10px] text-slate-400 font-medium italic">These banners appear as a carousel background on the agent's public profile. You can upload up to 10 images.</p>
          </div>
        );
      case "branchAddresses":
        return (
          <div className="space-y-8">
            {(agentData.branchAddresses || []).map((addr, idx) => (
              <div key={idx} className="border border-gray-200 p-8 rounded-2xl relative bg-white shadow-sm">
                <button type="button" onClick={() => removeBranchAddress(idx)} className="absolute top-4 right-4 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-all">Remove Branch</button>
                <h4 className="text-sm font-bold mb-6 text-blue-600 uppercase tracking-widest">Branch Location {idx + 1}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="House / Flat No." name="houseNo" value={addr.houseNo} onChange={(e) => handleBranchAddressChange(idx, e)} />
                  <Field label="Street" name="street" value={addr.street} onChange={(e) => handleBranchAddressChange(idx, e)} />
                  <Field label="Area / Locality" name="area" value={addr.area} onChange={(e) => handleBranchAddressChange(idx, e)} />
                  <Field label="City" name="city" value={addr.city} onChange={(e) => handleBranchAddressChange(idx, e)} />
                  <Field label="State" name="state" value={addr.state} onChange={(e) => handleBranchAddressChange(idx, e)} />
                  <Field label="Postal Code" name="postalCode" value={addr.postalCode} onChange={(e) => handleBranchAddressChange(idx, e)} />
                  <div className="sm:col-span-2">
                    <Field label="Country" name="country" value={addr.country} onChange={(e) => handleBranchAddressChange(idx, e)} />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addBranchAddress} className="w-full py-5 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all font-bold bg-white">
              + Add New Branch Office
            </button>
          </div>
        );
      case "overview":
        return <TextAreaField label="Agent Professional Overview" value={agentData.overview || ""} onChange={(e) => handleUpdateField("overview", e.target.value)} placeholder="Tell the world about this travel agent..." />;
      case "quickInfo":
        return <TextAreaField label="Quick Facts & Information" value={agentData.quickInfo || ""} onChange={(e) => handleUpdateField("quickInfo", e.target.value)} placeholder="Key bullet points or summary..." />;
      case "services":
        return <TagInput label="Services & Highlights (Tags)" value={agentData.services || ""} onChange={(val) => handleUpdateField("services", val)} placeholder="e.g. Flight Booking, Visa Assistance, Custom Tours..." />;
      case "tourPackages":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-slate-500 font-medium italic">These itineraries are assigned specifically to this agent. You can manage them here.</p>
            </div>

            {itinerariesLoading ? (
              <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : itineraries.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaSuitcase className="text-slate-300" size={24} />
                </div>
                <h3 className="text-slate-900 font-bold mb-1">No Itineraries Found</h3>
                <p className="text-slate-400 text-xs">Assign an itinerary to this agent from the 'Add Itineraries' section.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {itineraries.map((it) => (
                  <div key={it._id} className="group bg-white border border-slate-100 rounded-2xl p-3 sm:p-4 hover:shadow-xl hover:shadow-blue-500/5 transition-all relative overflow-hidden">
                    <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
                      <div className="w-full xs:w-20 h-32 xs:h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                        <img src={it.coverImageUrl || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=200&auto=format&fit=crop"} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start">
                          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black uppercase tracking-widest mb-1">
                            {it.type}
                          </span>
                          <div className="flex gap-1 xs:hidden">
                            <button onClick={() => { setSelectedItinerary(it); setShowEditModal(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><HiOutlinePencilSquare size={16} /></button>
                            <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><HiOutlineTrash size={16} /></button>
                          </div>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm truncate mb-1">{it.title}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1"><FaMapMarkerAlt size={10} className="text-blue-500" /> {it.destination}</span>
                          <span className="flex items-center gap-1"><FaClock size={10} className="text-blue-500" /> {it.duration}</span>
                        </div>
                        <div className="mt-2 text-blue-600 font-bold text-xs">₹{it.discountedPrice || it.priceFrom}</div>
                      </div>
                      <div className="hidden xs:flex flex-col gap-1">
                        <button
                          onClick={() => { setSelectedItinerary(it); setShowEditModal(true); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <HiOutlinePencilSquare size={18} />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm("Delete this itinerary for this agent?")) {
                              try {
                                const token = localStorage.getItem("token");
                                await axios.delete(`${API_BASE}/api/agent-itineraries/${it.slug}`, {
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                toast.success("Itinerary deleted");
                                fetchItineraries(selectedAgentId);
                              } catch (e) { toast.error("Error deleting"); }
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <HiOutlineTrash size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Edit Modal - Rendered at bottom of component */}
          </div>
        );
      case "agentPhotos":
        return (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <MediaUploader
              key={`${selectedAgentId}-gallery`}
              label="Agent Gallery (Photos & Videos)"
              maxFiles={50}
              existingUrls={Array.isArray(agentData.agentPhotos) ? agentData.agentPhotos : []}
              onChange={(urls) => handleUpdateField("agentPhotos", urls)}
              folder={getS3Path.agentGallery(agentName)}
              baseFileName={`${agentName}-gallery`}
            />
            <p className="mt-4 text-[10px] text-slate-400 font-medium italic">These files reflect in the 'Guest Memories & Media' section on your public profile.</p>
          </div>
        );
      case "agentVideos":
        return (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <MediaUploader
              key={`${selectedAgentId}-videos`}
              label="Customer Video Testimonials (Drag & Upload MP4)"
              existingUrls={Array.isArray(agentData.agentVideos) ? agentData.agentVideos : []}
              onChange={(urls) => handleUpdateField("agentVideos", urls)}
              folder={getS3Path.agentVideos(agentName)}
              baseFileName={`${agentName}-video`}
            />
            <p className="mt-4 text-[10px] text-slate-400 font-medium italic">These videos will appear in the 'Videos' section of your public profile under Happy Travelers.</p>
          </div>
        );
      case "reviewsList":
        const reviews = Array.isArray(agentData.reviewsList) ? agentData.reviewsList : [];
        
        // Calculate stats for public reviews
        const publicStats = {
          total: publicReviews.length,
          avg: publicReviews.length > 0 
            ? (publicReviews.reduce((acc, curr) => acc + curr.rating, 0) / publicReviews.length).toFixed(1)
            : "0.0",
          fiveStars: publicReviews.filter(r => r.rating === 5).length
        };

        return (
          <div className="space-y-10 animate-fadeIn">
            {/* --- Manual Reviews Section --- */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Manual Reviews</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Directly added by administrator</p>
                </div>
                <button 
                  onClick={() => {
                    const newReviews = [{ name: "", rating: 5, comment: "", date: new Date().toISOString() }, ...reviews];
                    handleUpdateField("reviewsList", newReviews);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                >
                  <span className="text-lg">+</span> Add Review
                </button>
              </div>

              <div className="space-y-6 relative z-10">
                {reviews.map((rev, idx) => (
                  <div key={idx} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 relative group hover:border-blue-200 transition-all">
                    <button 
                      onClick={() => {
                        const filtered = reviews.filter((_, i) => i !== idx);
                        handleUpdateField("reviewsList", filtered);
                      }}
                      className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <HiTrash size={16} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reviewer Name</label>
                        <input
                          type="text"
                          value={rev.name || ""}
                          onChange={(e) => {
                            const updated = [...reviews];
                            updated[idx].name = e.target.value;
                            handleUpdateField("reviewsList", updated);
                          }}
                          className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700"
                          placeholder="e.g. John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rating</label>
                        <div className="relative">
                          <select
                            value={rev.rating || 5}
                            onChange={(e) => {
                              const updated = [...reviews];
                              updated[idx].rating = parseInt(e.target.value);
                              handleUpdateField("reviewsList", updated);
                            }}
                            className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 appearance-none cursor-pointer"
                          >
                            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                          </select>
                          <HiStar className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Review Content</label>
                      <textarea
                        value={rev.comment || ""}
                        onChange={(e) => {
                          const updated = [...reviews];
                          updated[idx].comment = e.target.value;
                          handleUpdateField("reviewsList", updated);
                        }}
                        className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 min-h-[100px] text-slate-600 font-medium"
                        placeholder="Write the review content here..."
                      />
                    </div>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="text-center py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center gap-3">
                    <HiOutlineChatAlt2 className="text-slate-200" size={40} />
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No manual reviews added</p>
                  </div>
                )}
              </div>
            </div>

            {/* --- Public User Reviews Section --- */}
            <div className="pt-10">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-200">
                      <HiOutlineChatAlt2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Public Feedback</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Reviews submitted via public profile</p>
                    </div>
                  </div>
                </div>

                {/* Local Stats for Public Reviews */}
                <div className="flex gap-4">
                  <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                      <HiUserGroup size={16} />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                      <p className="text-sm font-black text-slate-900">{publicStats.total}</p>
                    </div>
                  </div>
                  <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                      <HiStar size={16} />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Rating</p>
                      <p className="text-sm font-black text-slate-900">{publicStats.avg}</p>
                    </div>
                  </div>
                </div>
              </div>

              {publicReviewsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Loading Feedback...</p>
                </div>
              ) : publicReviews.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-100">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HiOutlineChatAlt2 className="text-slate-200" size={32} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">No Public Reviews</h3>
                  <p className="text-slate-400 max-w-xs mx-auto text-xs font-bold uppercase tracking-widest">Start by sharing your profile with customers!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {publicReviews.map((rev) => (
                    <div key={rev._id} className="group bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 relative flex flex-col">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 font-black text-lg border border-slate-100 group-hover:bg-orange-600 group-hover:text-white group-hover:border-transparent transition-all duration-300">
                            {rev.userName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-sm tracking-tight uppercase">{rev.userName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <HiStar key={i} size={10} className={i < rev.rating ? "text-orange-400" : "text-slate-100"} />
                                ))}
                              </div>
                              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                {new Date(rev.createdAt).toLocaleDateString("en-US", { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <button 
                            onClick={() => {
                              setEditingReview(rev);
                              setShowReviewEditModal(true);
                            }}
                            className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                            title="Edit Review"
                          >
                            <HiPencil size={16} />
                          </button>
                          <button 
                            onClick={() => deletePublicReview(rev._id)}
                            className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            title="Delete Review"
                          >
                            <HiTrash size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1">
                        <p className="text-slate-600 text-[13px] italic leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                          "{rev.comment}"
                        </p>
                      </div>

                      {rev.images && rev.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-5">
                          {rev.images.map((img, idx) => (
                            <img 
                              key={idx} 
                              src={getImageUrl(img)} 
                              alt="Review" 
                              className="w-12 h-12 object-cover rounded-xl border border-slate-100 hover:scale-105 transition-transform cursor-pointer"
                            />
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-6 w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                        <div className="w-0 group-hover:w-full h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-1000"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case "blogs":
        const blogs = agentData.blogs || [];
        
        const handleBlogUpdate = (idx, field, val) => {
          const updatedBlogs = [...blogs];
          updatedBlogs[idx] = { ...updatedBlogs[idx], [field]: val };
          handleUpdateField("blogs", updatedBlogs);
        };
        const addNewBlog = () => {
          handleUpdateField("blogs", [...blogs, { title: "", content: "", image: "", isPublished: true, createdAt: new Date() }]);
        };
        const removeBlog = (idx) => {
          if (window.confirm("Are you sure you want to delete this travel story? This cannot be undone.")) {
            handleUpdateField("blogs", blogs.filter((_, i) => i !== idx));
          }
        };

        return (
          <div className="space-y-6 animate-fadeIn">
            {blogs.map((blog, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 relative group">
                <button 
                  onClick={() => removeBlog(idx)}
                  className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-white hover:bg-red-500 transition-all bg-slate-50 rounded-2xl shadow-sm group"
                  title="Delete Story"
                >
                  <HiOutlineTrash size={22} />
                </button>

                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xs font-black">
                    {idx + 1}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Story #{idx + 1}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Blog Title</label>
                    <input
                      type="text"
                      placeholder="Enter Blog Title"
                      value={blog.title || ""}
                      onChange={(e) => handleBlogUpdate(idx, "title", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none transition-all font-medium bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Visibility</label>
                    <select 
                      value={blog.isPublished !== false ? "Public" : "Private"}
                      onChange={(e) => handleBlogUpdate(idx, "isPublished", e.target.value === "Public")}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none bg-slate-50 font-medium cursor-pointer"
                    >
                      <option value="Public">Public</option>
                      <option value="Private">Private / Draft</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cover Image</label>
                  <MediaUploader
                    key={`${selectedAgentId}-blog-${idx}`}
                    label=""
                    maxFiles={1}
                    existingUrls={blog.image ? [blog.image] : []}
                    onChange={(urls) => handleBlogUpdate(idx, "image", urls[0] || "")}
                    folder={getS3Path.blog(agentName, blog.title)}
                    baseFileName={blog.title || `blog-${idx}`}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Blog Content</label>
                  <div className="quill-wrapper">
                    <ReactQuill
                      theme="snow"
                      value={blog.content || ""}
                      onChange={(val) => handleBlogUpdate(idx, "content", val)}
                      style={{ height: '250px', marginBottom: '50px' }}
                      placeholder="Share your travel story..."
                      className="bg-white rounded-xl"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addNewBlog}
              className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 hover:border-red-600 hover:text-red-600 hover:bg-red-50/30 transition-all font-black uppercase tracking-widest flex flex-col items-center gap-2"
            >
              <span className="text-2xl">+</span>
              <span className="text-[10px]">Add New Travel Story</span>
            </button>
            
            <p className="mt-4 text-[10px] text-slate-400 font-medium italic text-center">Don't forget to click "Save Changes" at the bottom after adding your stories.</p>
          </div>
        );
      case "testimonials":
        return (
          <TestimonialEditor
            testimonials={agentData.testimonials || []}
            onChange={(updated) => handleUpdateField("testimonials", updated)}
            agentName={agentName}
            agentId={selectedAgentId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(220, 38, 38, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(220, 38, 38, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(220, 38, 38, 0.4);
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="w-full min-h-screen bg-[#f8fafc] pb-20">
        {/* Modern Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4 sm:px-8 py-4 mb-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                <HiOutlineInformationCircle size={28} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 leading-tight">Agent Content Manager</h1>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Premium Profile Management</p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all appearance-none"
                >
                  <option value="">Select Agent to Edit</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.company || `${agent.firstName} ${agent.lastName}`}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <i className="fas fa-chevron-down text-xs"></i>
                </div>
              </div>
              
              {agentData && (
                <>
                  {selectedAgentId && (
                    <a
                      href={`${PUBLIC_FRONTEND_URL}/verified-transport-details/${selectedAgentId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-6 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all border border-slate-200 shadow-sm"
                    >
                      <HiExternalLink size={20} className="text-blue-500" />
                      View Public Profile
                    </a>
                  )}
                  
                  <button
                    onClick={handleSave}
                    disabled={saving || !selectedAgentId}
                    className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <HiSave size={20} className="group-hover:scale-110 transition-transform" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
              <ProfileButton />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Horizontal Navigation Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 mb-8 sticky top-24 z-40">
            <div className="flex overflow-x-auto gap-2 p-1 custom-scrollbar scroll-smooth">
              {SECTIONS.map((sec) => {
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedSection(sec.id)}
                    className={`
                      flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all
                      ${selectedSection === sec.id
                        ? "bg-red-600 text-white shadow-md shadow-red-100 scale-105"
                        : "text-slate-500 hover:bg-slate-50 hover:text-red-600"
                      }
                    `}
                  >
                    <Icon size={16} />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="animate-fadeIn">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mb-4"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching Content...</p>
              </div>
            ) : !selectedAgentId ? (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                  <FaUser size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No Agent Selected</h3>
                <p className="text-slate-400 text-sm font-medium max-w-xs text-center leading-relaxed">
                  Please choose an agent from the top bar to manage their profile and additional information.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      {SECTIONS.find(s => s.id === selectedSection)?.label}
                    </h2>
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                    Step 2 of 2
                  </div>
                </div>
                
                <div className="p-8">
                  {renderSectionEditor()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedItinerary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <FaSuitcase size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Edit Itinerary</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Customize package details</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-900">
                <HiXMark size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Title" value={selectedItinerary.title} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, title: e.target.value })} />
                <Field label="Duration" value={selectedItinerary.duration} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, duration: e.target.value })} />
                <Field label="Destination" value={selectedItinerary.destination} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, destination: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Price (₹)" type="number" value={selectedItinerary.priceFrom} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, priceFrom: e.target.value })} />
                  <Field label="Discounted (₹)" type="number" value={selectedItinerary.discountedPrice} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, discountedPrice: e.target.value })} />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Departure Date</label>
                  <div className="relative group">
                    <input
                      type="date"
                      value={selectedItinerary.departureDate ? new Date(selectedItinerary.departureDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setSelectedItinerary({ ...selectedItinerary, departureDate: e.target.value })}
                      className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-slate-50 font-medium text-slate-700 appearance-none"
                      style={{ colorScheme: 'light' }}
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                      <FaClock size={16} />
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-400 font-medium italic">Click the icon or field to open the calendar picker.</p>
                </div>

                <div className="p-1">
                  <MediaUploader
                    label="Itinerary Cover & Gallery (Drag & Upload)"
                    existingUrls={selectedItinerary.gallery || [selectedItinerary.coverImageUrl].filter(Boolean)}
                    onChange={(urls) => setSelectedItinerary({ ...selectedItinerary, gallery: urls, coverImageUrl: urls[0] || "" })}
                    folder={getS3Path.itinerary(agentName, selectedItinerary.title)}
                    baseFileName={selectedItinerary.title}
                  />
                </div>
              </div>
              <TextAreaField label="Description" rows={4} value={selectedItinerary.shortDescription || selectedItinerary.destinationDetail} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, shortDescription: e.target.value })} />
              <TextAreaField label="Inclusions (comma separated)" rows={3} value={Array.isArray(selectedItinerary.inclusions) ? selectedItinerary.inclusions.join(", ") : selectedItinerary.inclusions} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, inclusions: e.target.value })} />
              <TextAreaField label="Exclusions (comma separated)" rows={3} value={Array.isArray(selectedItinerary.exclusions) ? selectedItinerary.exclusions.join(", ") : selectedItinerary.exclusions} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, exclusions: e.target.value })} />
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-4">
              <button onClick={() => setShowEditModal(false)} className="px-8 py-4 text-slate-500 font-bold hover:text-slate-900 transition-colors uppercase tracking-widest text-xs">Cancel</button>
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("token");
                    await axios.put(`${API_BASE}/api/agent-itineraries/${selectedItinerary.slug}`, selectedItinerary, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    toast.success("Itinerary updated successfully!");
                    setShowEditModal(false);
                    fetchItineraries(selectedAgentId);
                  } catch (e) { toast.error("Error updating itinerary"); }
                }}
                className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
              >
                Update Itinerary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Public Review Edit Modal */}
      {showReviewEditModal && editingReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 animate-fadeIn">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-orange-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                  <HiOutlineChatAlt2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Edit Public Review</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Update visitor feedback</p>
                </div>
              </div>
              <button onClick={() => setShowReviewEditModal(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-900">
                <HiXMark size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">User Name</label>
                  <input
                    type="text"
                    value={editingReview.userName}
                    onChange={(e) => setEditingReview({ ...editingReview, userName: e.target.value })}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 font-bold text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Rating</label>
                  <select
                    value={editingReview.rating}
                    onChange={(e) => setEditingReview({ ...editingReview, rating: parseInt(e.target.value) })}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 font-bold text-slate-700 appearance-none cursor-pointer"
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Review Comment</label>
                <textarea
                  value={editingReview.comment}
                  onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                  rows={4}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 font-medium text-slate-600 leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Review Images</label>
                <div className="p-1">
                  <MediaUploader
                    label="Drop or Select Images"
                    maxFiles={10}
                    accept="image/*"
                    existingUrls={editingReview.images || []}
                    onChange={(urls) => setEditingReview({ ...editingReview, images: urls })}
                    folder={getS3Path.agentGallery(agentName)}
                    baseFileName={`${editingReview.userName}-review`}
                  />
                </div>
                <p className="text-[9px] text-slate-400 font-medium italic text-center">Manage photos shared by this user.</p>
              </div>
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-4">
              <button onClick={() => setShowReviewEditModal(false)} className="px-6 py-3 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-900 transition-colors">Cancel</button>
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("token");
                    await axios.put(`${API_BASE}/api/agents/reviews/${editingReview._id}`, editingReview, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    toast.success("Review updated successfully!");
                    setShowReviewEditModal(false);
                    fetchPublicReviews(selectedAgentId);
                  } catch (e) { toast.error("Error updating review"); }
                }}
                className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-orange-700 transition-all shadow-xl shadow-orange-200 active:scale-95"
              >
                Update Review
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AgentContentManager;
