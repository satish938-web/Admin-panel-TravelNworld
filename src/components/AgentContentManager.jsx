import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  HiOutlineTrash, HiOutlinePencilSquare, HiOutlineInformationCircle, HiXMark,
  HiChevronLeft, HiChevronRight
} from "react-icons/hi2";
import { 
  HiSave, HiStar, HiTrash, HiPencil, HiExternalLink, 
  HiUserGroup, HiTrendingUp, HiFilter, HiSearch, HiOutlineChatAlt2
} from "react-icons/hi";
import { toast } from "../utils/toast";
import { 
  FaSuitcase, FaClock, FaMapMarkerAlt, FaUser, FaImage, 
  FaInfoCircle, FaListAlt, FaTags, FaImages, FaVideo, 
  FaBlog, FaQuoteLeft, FaChevronLeft, FaChevronRight, FaStar 
} from "react-icons/fa";
import ProfileButton from "./ProfileButton";
import MediaUploader from "./MediaUploader";
import { getS3Path, sanitize } from "../utils/pathUtils";
import { getImageUrl, API_BASE, PUBLIC_FRONTEND_URL } from "../utils/api";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const QUILL_STYLE = `
  .ql-container {
    font-family: 'Inter', sans-serif !important;
    font-size: 14px !important;
  }
  .ql-editor {
    min-height: 200px;
    line-height: 1.6;
    color: #334155;
  }
  .ql-toolbar.ql-snow {
    border-top-left-radius: 1.5rem;
    border-top-right-radius: 1.5rem;
    background: #fff;
    border: 1px solid #f1f5f9 !important;
    padding: 0.75rem !important;
  }
  .ql-container.ql-snow {
    border: 1px solid #f1f5f9 !important;
    border-top: none !important;
    border-bottom-left-radius: 1.5rem;
    border-bottom-right-radius: 1.5rem;
    background: transparent;
  }
`;

const Field = ({ label, id, name, type = "text", value, onChange, placeholder, disabled }) => (
  <div className="flex flex-col w-full">
    <label htmlFor={id} className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={name || id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>
);

const TextAreaField = ({ label, id, name, rows = 4, value, onChange, placeholder }) => (
  <div className="flex flex-col w-full">
    <label htmlFor={id} className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
      {label}
    </label>
    <textarea
      id={id}
      name={name || id}
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300 resize-none"
    />
  </div>
);

const TagInput = ({ label, value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState("");
  const tags = Array.isArray(value) ? value : (typeof value === "string" ? value.split(",").map(t => t.trim()).filter(t => t !== "") : []);

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!tags.includes(newTag)) onChange([...tags, newTag]);
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col w-full">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{label}</label>
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-wrap gap-2 min-h-[100px] focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
        {tags.map((tag, idx) => (
          <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-600 rounded-xl text-xs font-black border border-blue-100 shadow-sm">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))} className="hover:text-red-500 transition-colors">
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
          className="flex-1 outline-none py-1.5 text-sm font-bold text-slate-700 bg-transparent min-w-[120px]"
        />
      </div>
    </div>
  );
};

const TestimonialEditor = ({ testimonials, onChange, agentName, agentId }) => {
  const handleAdd = () => onChange([...testimonials, { name: "", text: "", rating: 5, image: "", profile: "", date: "" }]);
  const handleRemove = (idx) => onChange(testimonials.filter((_, i) => i !== idx));
  const handleUpdate = (idx, field, value) => onChange(testimonials.map((t, i) => i === idx ? { ...t, [field]: value } : t));

  return (
    <div className="space-y-8">
      {testimonials.map((t, idx) => (
        <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative group hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500">
          <button onClick={() => handleRemove(idx)} className="absolute top-6 right-6 w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all">
            <HiTrash size={20} />
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Field label="Customer Name" value={t.name} onChange={(e) => handleUpdate(idx, "name", e.target.value)} />
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Review Date</label>
              <input type="date" value={t.date ? (t.date.includes('-') ? t.date : new Date(t.date).toISOString().split('T')[0]) : ''} onChange={(e) => handleUpdate(idx, "date", e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none" />
            </div>
            <div className="lg:col-span-2">
              <TextAreaField label="Review Narrative" value={t.text} onChange={(e) => handleUpdate(idx, "text", e.target.value)} rows={3} />
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              <MediaUploader label="Trip Photo" existingUrls={t.image ? [t.image] : []} onChange={(urls) => handleUpdate(idx, "image", urls[0] || "")} folder={getS3Path.agentTestimonials(agentName)} />
              <MediaUploader label="Customer Profile" existingUrls={t.profile ? [t.profile] : []} onChange={(urls) => handleUpdate(idx, "profile", urls[0] || "")} folder={getS3Path.agentTestimonials(agentName)} />
            </div>
          </div>
        </div>
      ))}
      <button onClick={handleAdd} className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black uppercase tracking-[0.2em] text-xs hover:border-blue-500 hover:text-blue-600 transition-all hover:bg-blue-50/30">
        + Add Curated Testimonial
      </button>
    </div>
  );
};

const SECTIONS = [
  { id: "agencyInfo", label: "Brand Profile", icon: <FaUser />, color: "from-blue-500 to-indigo-600" },
  { id: "tourPackages", label: "Inventory", icon: <FaSuitcase />, color: "from-emerald-500 to-teal-600" },
  { id: "reviewsList", label: "Public Feedback", icon: <FaStar />, color: "from-orange-500 to-red-600" },
  { id: "testimonials", label: "Curated Reviews", icon: <FaQuoteLeft />, color: "from-purple-500 to-fuchsia-600" },
  { id: "blogs", label: "Media & Blogs", icon: <FaBlog />, color: "from-pink-500 to-rose-600" },
  { id: "agentPhotos", label: "Agency Gallery", icon: <FaImages />, color: "from-cyan-500 to-blue-600" },
  { id: "branchAddresses", label: "Locations", icon: <FaMapMarkerAlt />, color: "from-slate-500 to-slate-700" },
];

const AgentContentManager = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [selectedSection, setSelectedSection] = useState("agencyInfo");
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
  const [mediaBusy, setMediaBusy] = useState(false);
  const [itineraryPage, setItineraryPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => { fetchAgents(); }, []);
  const agentName = agentData ? (agentData.company || `${agentData.firstName} ${agentData.lastName}`) : "unknown";

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/agents`, { headers: { Authorization: `Bearer ${token}` } });
      setAgents(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (selectedAgentId) fetchAgentDetails(selectedAgentId);
    else setAgentData(null);
  }, [selectedAgentId]);

  const fetchAgentDetails = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/agents/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setAgentData(res.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchItineraries = async (agentId) => {
    setItinerariesLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/agent-itineraries?agentId=${agentId}`, { headers: { Authorization: `Bearer ${token}` } });
      setItineraries(res.data.data || []);
    } catch (err) { console.error(err); } finally { setItinerariesLoading(false); }
  };

  const fetchPublicReviews = async (agentId) => {
    setPublicReviewsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/agents/all/reviews`, { headers: { Authorization: `Bearer ${token}` } });
      const idToFilter = agentId?._id || agentId;
      setPublicReviews((res.data.data || []).filter(r => r.agentId === idToFilter || r.agentId?._id === idToFilter));
    } catch (err) { console.error(err); } finally { setPublicReviewsLoading(false); }
  };

  useEffect(() => {
    if (selectedAgentId && selectedSection === "tourPackages") {
      fetchItineraries(selectedAgentId);
      setItineraryPage(1);
    }
    if (selectedAgentId && selectedSection === "reviewsList") {
      fetchPublicReviews(selectedAgentId);
      setReviewPage(1);
    }
  }, [selectedAgentId, selectedSection]);

  const handleSave = async () => {
    if (!selectedAgentId || !agentData) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const sectionKey = selectedSection === "agencyInfo" ? "overview" : selectedSection;
      let payload = { [sectionKey]: agentData[sectionKey] };
      if (selectedSection === "agencyInfo") {
        payload = { 
          company: agentData.company, 
          description: agentData.description, 
          phone: agentData.phone, 
          email: agentData.email,
          photo: agentData.photo,
          bannerImage: agentData.bannerImage,
          overview: agentData.overview
        };
      }
      await axios.put(`${API_BASE}/api/agents/${selectedAgentId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Profile section updated successfully!");
      fetchAgentDetails(selectedAgentId);
    } catch (err) { toast.error("Error saving section"); } finally { setSaving(false); }
  };

  const renderSectionEditor = () => {
    if (!agentData) return null;

    switch (selectedSection) {
      case "agencyInfo":
        return (
          <div className="space-y-10 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center">
                  <MediaUploader label="Official Agency Logo" maxFiles={1} existingUrls={[agentData.photo].filter(Boolean)} onChange={(urls) => setAgentData({...agentData, photo: urls[0]})} folder={getS3Path.agentProfile(agentName)} />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 text-center leading-relaxed">Identity for public listing</p>
                </div>
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 blur-3xl group-hover:bg-blue-600/40 transition-all duration-700"></div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-6 relative z-10">Inventory Health</h4>
                  <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-end"><span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Active Packages</span><span className="text-3xl font-black text-white">{itineraries.length}</span></div>
                    <div className="flex justify-between items-end"><span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Public Reviews</span><span className="text-3xl font-black text-white">{publicReviews.length}</span></div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><FaInfoCircle size={24} /></div><div><h3 className="text-xl font-black text-slate-900 tracking-tight">Core Credentials</h3><p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Global Agency Identity</p></div></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Field label="Agency Name" value={agentData.company} onChange={(e) => setAgentData({...agentData, company: e.target.value})} />
                    <Field label="Headline" placeholder="Expert in Luxury Tours" value={agentData.description} onChange={(e) => setAgentData({...agentData, description: e.target.value})} />
                    <Field label="Primary Contact" value={agentData.phone} onChange={(e) => setAgentData({...agentData, phone: e.target.value})} />
                    <Field label="Support Email" value={agentData.email} onChange={(e) => setAgentData({...agentData, email: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><FaListAlt size={24} /></div><div><h3 className="text-xl font-black text-slate-900 tracking-tight">Professional Narrative</h3><p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Formatted Overview & History</p></div></div>
              <div className="prose-slate max-w-none"><ReactQuill theme="snow" value={agentData.overview || ""} onChange={(val) => setAgentData({...agentData, overview: val})} className="bg-slate-50 rounded-[2rem] overflow-hidden border-none" style={{ minHeight: '300px' }} /></div>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm"><MediaUploader label="Public Brand Banners & Gallery" existingUrls={agentData.bannerImage} onChange={(urls) => setAgentData({...agentData, bannerImage: urls})} folder={getS3Path.agentProfile(agentName)} /></div>
          </div>
        );
      case "tourPackages":
        return (
          <div className="space-y-10 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div><h3 className="text-2xl font-black text-slate-900 tracking-tight">Travel Inventory</h3><p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manage assigned itineraries & custom packages</p></div>
              <button onClick={() => fetchItineraries(selectedAgentId)} className="px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-3">
                <HiTrendingUp className="text-blue-400" /> Refresh Storefront
              </button>
            </div>
            {itinerariesLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-6"><div className="w-16 h-16 border-[6px] border-blue-50 border-t-blue-600 rounded-full animate-spin"></div><p className="text-slate-400 font-black text-xs uppercase tracking-widest">Synchronizing Packages...</p></div>
            ) : itineraries.length === 0 ? (
              <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-100"><div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-300"><FaSuitcase size={48} /></div><h3 className="text-2xl font-black text-slate-900 mb-2">No Active Packages</h3><p className="text-slate-400 text-sm font-medium">Link global itineraries to this agent to build their inventory.</p></div>
            ) : (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10">
                  {itineraries.slice((itineraryPage - 1) * ITEMS_PER_PAGE, itineraryPage * ITEMS_PER_PAGE).map((it) => (
                    <div key={it._id} className="group bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-700 flex flex-col">
                      <div className="relative h-64 overflow-hidden">
                        <img src={getImageUrl(it.coverImageUrl)} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                        <div className="absolute top-6 left-6 flex gap-3">
                          <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-xl">{it.type}</span>
                          {it.visibility === "Public" && <span className="px-4 py-2 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20">Active</span>}
                        </div>
                        <div className="absolute bottom-6 left-6 right-6">
                          <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2"><FaMapMarkerAlt /> {it.destination}</div>
                          <h4 className="text-xl font-black text-white leading-tight line-clamp-2">{it.title}</h4>
                        </div>
                      </div>
                      <div className="p-8 flex-1 flex flex-col">
                        <div className="grid grid-cols-2 gap-6 mb-8">
                          <div className="flex flex-col"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Timeframe</span><span className="text-sm font-black text-slate-900 flex items-center gap-2"><FaClock className="text-blue-500" /> {it.duration}</span></div>
                          <div className="flex flex-col"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Valuation</span><span className="text-sm font-black text-emerald-600">{it.asBestQuote ? "Best Quote" : `₹${it.discountedPrice || it.priceFrom}`}</span></div>
                        </div>
                        <div className="flex gap-4 mt-auto">
                          <button onClick={() => { setSelectedItinerary(it); setShowEditModal(true); }} className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"><HiOutlinePencilSquare size={18} /> Edit Detailed Package</button>
                          <button onClick={() => window.open(`${PUBLIC_FRONTEND_URL}/itinerary/${it.slug}`, "_blank")} className="w-14 h-14 bg-slate-50 text-slate-400 rounded-[1.5rem] flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all border border-slate-100 shadow-sm"><HiExternalLink size={24} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Itinerary Pagination Controls */}
                {itineraries.length > ITEMS_PER_PAGE && (
                  <div className="flex justify-center items-center gap-3 py-6">
                    <button 
                      onClick={() => setItineraryPage(p => Math.max(1, p - 1))}
                      disabled={itineraryPage === 1}
                      className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                    >
                      <FaChevronLeft size={14} />
                    </button>
                    <div className="flex gap-2">
                      {[...Array(Math.ceil(itineraries.length / ITEMS_PER_PAGE))].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setItineraryPage(i + 1)}
                          className={`w-12 h-12 rounded-2xl font-black text-xs transition-all shadow-sm ${
                            itineraryPage === i + 1 
                              ? "bg-slate-900 text-white shadow-xl shadow-slate-200 scale-110" 
                              : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setItineraryPage(p => Math.min(Math.ceil(itineraries.length / ITEMS_PER_PAGE), p + 1))}
                      disabled={itineraryPage === Math.ceil(itineraries.length / ITEMS_PER_PAGE)}
                      className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                    >
                      <FaChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case "reviewsList":
        return (
          <div className="space-y-10 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000"></div>
                    <h3 className="text-xl font-black text-slate-900 mb-1 relative z-10">Feedback Center</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8 relative z-10">Real-time user submissions</p>
                    <div className="space-y-6 relative z-10">
                      <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Reviews</span><span className="text-2xl font-black text-slate-900">{publicReviews.length}</span></div>
                      <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Rating</span><span className="text-2xl font-black text-orange-500">{(publicReviews.reduce((a,c)=>a+c.rating,0)/Math.max(1, publicReviews.length)).toFixed(1)} <FaStar className="inline mb-1" size={16} /></span></div>
                    </div>
                 </div>
              </div>
              <div className="lg:col-span-2 space-y-8">
                 {publicReviewsLoading ? <div className="animate-pulse space-y-4">{[1,2].map(i=><div key={i} className="h-40 bg-slate-100 rounded-[2rem]"></div>)}</div> : publicReviews.length === 0 ? <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200"><HiOutlineChatAlt2 className="mx-auto text-slate-200 mb-4" size={40} /><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No customer reviews yet</p></div> : (
                   <div className="space-y-6">
                     {publicReviews.slice((reviewPage - 1) * ITEMS_PER_PAGE, reviewPage * ITEMS_PER_PAGE).map(rev => (
                       <div key={rev._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                         <div className="flex justify-between items-start mb-6">
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-300 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all">{rev.userName.charAt(0)}</div>
                             <div><h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">{rev.userName}</h4><div className="flex gap-0.5 mt-1">{[...Array(5)].map((_,i)=><FaStar key={i} size={10} className={i < rev.rating ? "text-orange-400" : "text-slate-100"} />)}</div></div>
                           </div>
                           <button onClick={() => deletePublicReview(rev._id)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><HiTrash size={18} /></button>
                         </div>
                         <p className="text-slate-600 text-sm italic leading-relaxed">"{rev.comment}"</p>
                       </div>
                     ))}

                     {/* Review Pagination Controls */}
                     {publicReviews.length > ITEMS_PER_PAGE && (
                        <div className="flex justify-center items-center gap-3 pt-4">
                          <button 
                            onClick={() => setReviewPage(p => Math.max(1, p - 1))}
                            disabled={reviewPage === 1}
                            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:border-orange-600 transition-all disabled:opacity-30 shadow-sm"
                          >
                            <FaChevronLeft size={12} />
                          </button>
                          <div className="flex gap-2">
                            {[...Array(Math.ceil(publicReviews.length / ITEMS_PER_PAGE))].map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setReviewPage(i + 1)}
                                className={`w-10 h-10 rounded-xl font-black text-[10px] transition-all ${
                                  reviewPage === i + 1 
                                    ? "bg-slate-900 text-white shadow-lg" 
                                    : "bg-white text-slate-500 border border-slate-100"
                                }`}
                              >
                                {i + 1}
                              </button>
                            ))}
                          </div>
                          <button 
                            onClick={() => setReviewPage(p => Math.min(Math.ceil(publicReviews.length / ITEMS_PER_PAGE), p + 1))}
                            disabled={reviewPage === Math.ceil(publicReviews.length / ITEMS_PER_PAGE)}
                            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:border-orange-600 transition-all disabled:opacity-30 shadow-sm"
                          >
                            <FaChevronRight size={12} />
                          </button>
                        </div>
                      )}
                   </div>
                 )}
              </div>
            </div>
          </div>
        );
      case "blogs":
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div><h3 className="text-2xl font-black text-slate-900 tracking-tight">Content Studio</h3><p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manage travel stories & agency news</p></div>
              <button onClick={() => setAgentData({...agentData, blogs: [{title: "", content: "", image: "", isPublished: true, createdAt: new Date()}, ...(agentData.blogs || [])]})} className="px-10 py-4 bg-purple-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-purple-700 transition-all shadow-xl shadow-purple-200">+ New Story</button>
            </div>
            <div className="grid grid-cols-1 gap-10">
              {(agentData.blogs || []).map((blog, idx) => (
                <div key={idx} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500">
                  <div className="flex justify-between items-center mb-8">
                    <span className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-100">Draft #{idx + 1}</span>
                    <button onClick={() => setAgentData({...agentData, blogs: agentData.blogs.filter((_,i)=>i!==idx)})} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><HiTrash size={18} /></button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-8">
                       <Field label="Blog Title" value={blog.title} onChange={(e) => { const n = [...agentData.blogs]; n[idx].title = e.target.value; setAgentData({...agentData, blogs: n}); }} />
                       <MediaUploader label="Feature Image" existingUrls={blog.image ? [blog.image] : []} onChange={(urls) => { const n = [...agentData.blogs]; n[idx].image = urls[0]; setAgentData({...agentData, blogs: n}); }} folder={getS3Path.agentBlogs(agentName)} />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Article Content</label>
                       <ReactQuill theme="snow" value={blog.content} onChange={(val) => { const n = [...agentData.blogs]; n[idx].content = val; setAgentData({...agentData, blogs: n}); }} className="bg-slate-50 rounded-3xl overflow-hidden border-none" style={{ minHeight: '300px' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "testimonials":
        return <TestimonialEditor testimonials={agentData.testimonials || []} onChange={(val) => setAgentData({...agentData, testimonials: val})} agentName={agentName} agentId={selectedAgentId} />;
      case "agentPhotos":
        return <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm"><MediaUploader label="Agency Gallery Portfolio" existingUrls={agentData.agentPhotos} onChange={(urls) => setAgentData({...agentData, agentPhotos: urls})} folder={getS3Path.agentGallery(agentName)} maxFiles={50} /></div>;
      case "branchAddresses":
        return (
          <div className="space-y-8 animate-fadeIn">
             {(agentData.branchAddresses || []).map((addr, idx) => (
               <div key={idx} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative group hover:border-slate-300 transition-all">
                  <button onClick={() => removeBranchAddress(idx)} className="absolute top-6 right-6 w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><HiTrash size={20} /></button>
                  <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-10">Operational Branch #{idx + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     <Field label="Building / No." name="houseNo" value={addr.houseNo} onChange={(e) => handleBranchAddressChange(idx, e)} />
                     <Field label="Street / Landmark" name="street" value={addr.street} onChange={(e) => handleBranchAddressChange(idx, e)} />
                     <Field label="Area" name="area" value={addr.area} onChange={(e) => handleBranchAddressChange(idx, e)} />
                     <Field label="City" name="city" value={addr.city} onChange={(e) => handleBranchAddressChange(idx, e)} />
                     <Field label="Postal Code" name="postalCode" value={addr.postalCode} onChange={(e) => handleBranchAddressChange(idx, e)} />
                     <Field label="Country" name="country" value={addr.country} onChange={(e) => handleBranchAddressChange(idx, e)} />
                  </div>
               </div>
             ))}
             <button onClick={addBranchAddress} className="w-full py-10 border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] hover:border-blue-500 hover:text-blue-600 transition-all hover:bg-blue-50/30">+ Register New Office Location</button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 selection:bg-blue-100 selection:text-blue-900">
      <style>{QUILL_STYLE}</style>
      <div className="bg-white border-b border-slate-200 sticky top-0 z-[60] backdrop-blur-md bg-white/90">
        <div className="max-w-[1700px] mx-auto px-8 lg:px-12 h-24 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-200"><FaUser size={20} /></div>
              <div><h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Content Manager</h1><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Elite Administrative Control</p></div>
            </div>
            <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-3 gap-4 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all min-w-[380px]">
              <HiSearch className="text-slate-400" size={20} />
              <select className="bg-transparent border-none outline-none text-sm font-black text-slate-700 w-full cursor-pointer appearance-none" value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)}>
                <option value="">Select Authorized Partner...</option>
                {agents.map(a => <option key={a._id} value={a._id}>{a.company || `${a.firstName} ${a.lastName}`}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {selectedAgentId && (
              <button onClick={handleSave} disabled={saving} className="px-10 py-4 bg-gradient-to-r from-red-600 to-blue-700 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <HiSave size={20} />}
                {saving ? "Synchronizing..." : "Save Brand Profile"}
              </button>
            )}
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden shadow-sm">
               {agentData?.photo ? <img src={getImageUrl(agentData.photo)} className="w-full h-full object-cover" /> : <FaUser size={24} />}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-8 lg:px-12 pt-12">
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden sticky top-36">
              <div className="p-10 border-b border-slate-100 bg-slate-50/50"><h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1.5">Command Center</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sectional Management</p></div>
              <div className="p-4 space-y-2">
                {SECTIONS.map(section => (
                  <button key={section.id} onClick={() => setSelectedSection(section.id)} className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] transition-all group relative overflow-hidden ${selectedSection === section.id ? "bg-slate-900 text-white shadow-2xl shadow-slate-300" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>
                    <div className="flex items-center gap-5 relative z-10">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${selectedSection === section.id ? `bg-gradient-to-br ${section.color} text-white shadow-lg` : "bg-slate-100 text-slate-400 group-hover:bg-white"}`}>{section.icon}</div>
                      <span className="font-black text-xs uppercase tracking-[0.1em]">{section.label}</span>
                    </div>
                    {selectedSection === section.id && <div className="w-1.5 h-6 bg-blue-500 rounded-full relative z-10 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9">
            {!selectedAgentId ? (
              <div className="bg-white rounded-[4rem] border border-slate-200 shadow-sm p-32 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center text-blue-600 mb-10 animate-bounce shadow-2xl shadow-blue-100"><FaUser size={48} /></div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Partner Access Restricted</h3>
                <p className="text-slate-400 text-sm font-medium max-w-sm leading-relaxed mx-auto uppercase tracking-widest">Select a verified travel partner to begin brand synchronization.</p>
              </div>
            ) : (
              <div className="space-y-12">
                 <div className="flex items-center justify-between"><div className="flex items-center gap-6"><div className={`w-3 h-12 rounded-full bg-gradient-to-b ${SECTIONS.find(s => s.id === selectedSection)?.color} shadow-lg`}></div><div><h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{SECTIONS.find(s => s.id === selectedSection)?.label}</h2><p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-3">Active Workspace · Profile Integrity Monitoring</p></div></div></div>
                 {renderSectionEditor()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Itinerary Modal */}
      {showEditModal && selectedItinerary && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[3.5rem] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 animate-scaleUp">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-200"><FaSuitcase size={32} /></div>
                <div><h3 className="text-2xl font-black text-slate-900 tracking-tight">Refine Itinerary</h3><p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Package Calibration & Logistics</p></div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm"><HiXMark size={28} /></button>
            </div>
            <div className="p-10 overflow-y-auto space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <Field label="Package Title" value={selectedItinerary.title} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, title: e.target.value })} />
                <Field label="Travel Duration" value={selectedItinerary.duration} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, duration: e.target.value })} />
                <Field label="Primary Destination" value={selectedItinerary.destination} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, destination: e.target.value })} />
                <div className="grid grid-cols-2 gap-6">
                  <Field label="Standard Rate" type="number" value={selectedItinerary.priceFrom} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, priceFrom: e.target.value })} />
                  <Field label="Offer Rate" type="number" value={selectedItinerary.discountedPrice} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, discountedPrice: e.target.value })} />
                </div>
              </div>
              <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100"><MediaUploader label="Itinerary Visual Assets" existingUrls={selectedItinerary.gallery || [selectedItinerary.coverImageUrl].filter(Boolean)} onChange={(urls) => setSelectedItinerary({ ...selectedItinerary, gallery: urls, coverImageUrl: urls[0] || "" })} onBusy={setMediaBusy} folder={getS3Path.itinerary(agentName, selectedItinerary.title)} /></div>
              <div className="space-y-10">
                <TextAreaField label="Executive Summary" rows={6} value={selectedItinerary.destinationDetail || selectedItinerary.shortDescription} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, destinationDetail: e.target.value, shortDescription: e.target.value })} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <TextAreaField label="Inclusions" value={Array.isArray(selectedItinerary.inclusions) ? selectedItinerary.inclusions.join(", ") : selectedItinerary.inclusions} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, inclusions: e.target.value })} />
                  <TextAreaField label="Exclusions" value={Array.isArray(selectedItinerary.exclusions) ? selectedItinerary.exclusions.join(", ") : selectedItinerary.exclusions} onChange={(e) => setSelectedItinerary({ ...selectedItinerary, exclusions: e.target.value })} />
                </div>
                {(!selectedItinerary.dayPlans || selectedItinerary.dayPlans.length === 0) ? (
                  <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-6">No day-by-day logistics added</p>
                    <button onClick={() => setSelectedItinerary({ ...selectedItinerary, dayPlans: [{ day: 1, title: "Day 1", locationDetail: "" }] })} className="px-12 py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-500/20">+ Initialize Day Plans</button>
                  </div>
                ) : (
                  <div className="bg-blue-50/30 p-10 rounded-[3rem] border border-blue-100 space-y-8">
                    <div className="flex justify-between items-center"><h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3"><FaClock className="text-blue-600" /> Itinerary Timeline ({selectedItinerary.dayPlans.length} Days)</h4><button onClick={() => setSelectedItinerary({ ...selectedItinerary, dayPlans: [...selectedItinerary.dayPlans, { day: selectedItinerary.dayPlans.length + 1, title: `Day ${selectedItinerary.dayPlans.length + 1}`, locationDetail: "" }] })} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">+ Add Segment</button></div>
                    <div className="space-y-6">
                      {selectedItinerary.dayPlans.map((plan, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2rem] border border-blue-100 shadow-sm relative group">
                          <button onClick={() => setSelectedItinerary({ ...selectedItinerary, dayPlans: selectedItinerary.dayPlans.filter((_, idx) => idx !== i).map((p, idx) => ({ ...p, day: idx + 1 })) })} className="absolute top-4 right-4 w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"><HiXMark size={16} /></button>
                          <div className="flex gap-6">
                            <span className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-sm font-black flex-shrink-0 shadow-lg shadow-blue-200">D{plan.day}</span>
                            <div className="flex-1 space-y-3">
                              <input className="w-full font-black text-slate-900 outline-none text-lg bg-transparent border-b-2 border-transparent focus:border-blue-500 transition-all" value={plan.title} onChange={(e) => { const n = [...selectedItinerary.dayPlans]; n[i].title = e.target.value; setSelectedItinerary({...selectedItinerary, dayPlans: n}); }} />
                              <textarea className="w-full text-sm text-slate-500 outline-none bg-transparent resize-none leading-relaxed" rows={2} value={plan.locationDetail} onChange={(e) => { const n = [...selectedItinerary.dayPlans]; n[i].locationDetail = e.target.value; setSelectedItinerary({...selectedItinerary, dayPlans: n}); }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-6">
              <button onClick={() => setShowEditModal(false)} className="px-10 py-5 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-900 transition-colors">Abort Changes</button>
              <button disabled={itineraryUpdating || mediaBusy} onClick={async () => {
                setItineraryUpdating(true);
                try {
                  const token = localStorage.getItem("token");
                  await axios.put(`${API_BASE}/api/agent-itineraries/${selectedItinerary.slug}`, selectedItinerary, { headers: { Authorization: `Bearer ${token}` } });
                  toast.success("Inventory segment updated!"); setShowEditModal(false); fetchItineraries(selectedAgentId);
                } catch (e) { toast.error("Sync Failure"); } finally { setItineraryUpdating(false); }
              }} className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-600 transition-all shadow-2xl disabled:opacity-50 flex items-center gap-4">
                {(itineraryUpdating || mediaBusy) && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                {mediaBusy ? "Processing Assets..." : itineraryUpdating ? "Synchronizing..." : "Commit Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentContentManager;
