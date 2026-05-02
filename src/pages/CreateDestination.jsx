import React, { useState, useEffect } from 'react';
import { HiGlobeAlt, HiLocationMarker, HiPhotograph, HiPencil, HiTrash, HiPlus } from 'react-icons/hi';
import ProfileButton from '../components/ProfileButton';
import axios from 'axios';
import { API_BASE } from '../utils/api';
import { getS3Path } from '../utils/pathUtils';
import MediaUploader from '../components/MediaUploader';

/* ─── Global Styles ──────────────────────────────────────────────────────── */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    *, *::before, *::after {
      font-family: 'Plus Jakarta Sans', sans-serif;
      box-sizing: border-box;
    }

    .cd-fade-in  { animation: cdFadeUp .35s ease both; }
    .cd-row:hover { background: #fff5f5 !important; }

    @keyframes cdFadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: none; }
    }

    .cd-input {
      width: 100%;
      padding: 12px 16px;
      border-radius: 14px;
      border: 1.5px solid #e5e7eb;
      background: #fafafa;
      font-size: 14px;
      font-weight: 500;
      color: #111827;
      outline: none;
      transition: all .2s;
    }
    .cd-input:focus {
      border-color: #ef4444;
      background: white;
      box-shadow: 0 0 0 4px rgba(239,68,68,.08);
    }

    .cd-badge {
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
  `}</style>
);

/* ─── Category badge colours ─────────────────────────────────────────────── */
const CAT_COLORS = {
  trending: { bg: '#fff7ed', color: '#c2410c' },
  exclusive: { bg: '#f0fdf4', color: '#15803d' },
  weekend: { bg: '#eff6ff', color: '#1d4ed8' },
  home: { bg: '#fdf4ff', color: '#7e22ce' },
  honeymoon: { bg: '#fff1f2', color: '#be123c' },
};

/* ─── Small reusable pieces ──────────────────────────────────────────────── */
const FieldLabel = ({ children }) => (
  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">{children}</p>
);

const Alert = ({ type, msg, onClose }) => {
  const s = type === 'error'
    ? { bg: '#fff1f2', border: '#fecdd3', color: '#be123c' }
    : { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' };
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mb-4"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      <span>{type === 'error' ? '⚠' : '✓'}</span>
      <span className="flex-1">{msg}</span>
      {onClose && <button onClick={onClose} className="opacity-50 hover:opacity-100 text-lg leading-none">×</button>}
    </div>
  );
};

const RedCheck = ({ label, checked, onChange }) => (
  <div className="flex items-center gap-2.5 cursor-pointer group" onClick={onChange}>
    <div
      className="w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center transition-all"
      style={{
        borderColor: checked ? '#ef4444' : '#d1d5db',
        background: checked ? '#ef4444' : 'white',
      }}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
    <span className={`text-sm font-medium capitalize transition-colors ${checked ? 'text-red-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
      {label}
    </span>
  </div>
);

const StatCard = ({ label, value, color }) => (
  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-black" style={{ color }}>{value}</p>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────────────── */
const CreateDestination = () => {

  /* form state */
  const [destinationName, setDestinationName] = useState('');
  const [destinationType, setDestinationType] = useState('Domestic');
  const [shortDescription, setShortDescription] = useState('');
  const [categories, setCategories] = useState({
    trending: false,
    exclusive: false,
    weekend: false,
    home: false,
    honeymoon: false,
  });
  const [coverImageUrl, setCoverImageUrl] = useState('');

  /* list state */
  const [destinations, setDestinations] = useState([]);
  const [allDestinations, setAllDestinations] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /* modal state */
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [agents, setAgents] = useState([]);
  const [createItineraryToggle, setCreateItineraryToggle] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [itineraryDuration, setItineraryDuration] = useState("");
  const [itineraryPrice, setItineraryPrice] = useState("");

  useEffect(() => {
    fetchAll();
    fetchAgents();
  }, []);

  useEffect(() => {
    fetchFiltered();
  }, [destinationType]);

  const getAuthToken = () => {
    let token = localStorage.getItem('token') || localStorage.getItem('twz_auth_token');
    if (token) token = token.replace(/^["']|["']$/g, "");
    return token;
  };

  const fetchFiltered = async () => {
    try {
      setLoading(true);
      const type = destinationType.toLowerCase();
      const res = await axios.get(`${API_BASE}/api/destinations/type/${type}`);
      setDestinations(res.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load destinations');
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = async () => {
    try {
      const [domRes, intRes] = await Promise.all([
        axios.get(`${API_BASE}/api/destinations/type/domestic`),
        axios.get(`${API_BASE}/api/destinations/type/international`),
      ]);
      setAllDestinations([
        ...(domRes.data.data || []),
        ...(intRes.data.data || []),
      ]);
    } catch (err) {
      console.warn("Stats fetch failed", err);
    }
  };

  const fetchAgents = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await axios.get(`${API_BASE}/api/agents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAgents(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch agents", err);
    }
  };

  const redirectLogin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('twz_auth_token');
    window.location.href = '/login';
  };

  const handleCategoryToggle = (cat) => {
    setCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const clearForm = () => {
    setDestinationName('');
    setShortDescription('');
    setCoverImageUrl('');
    setCategories({ trending: false, exclusive: false, weekend: false, home: false, honeymoon: false });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!destinationName.trim()) { setError('Destination name is required'); return; }
    if (createItineraryToggle && !selectedAgentId) { setError('Please select an agent for the itinerary'); return; }

    try {
      setLoading(true); setError('');
      const token = getAuthToken();
      if (!token) { redirectLogin(); return; }

      // 1. Save Destination
      const destData = {
        name: destinationName.trim(),
        type: destinationType.toLowerCase(),
        shortDescription,
        categories,
        coverImageUrl: coverImageUrl
      };

      const destRes = await axios.post(`${API_BASE}/api/destinations`, destData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const destinationId = destRes.data.data?._id;
      const destinationImgUrl = destRes.data.data?.coverImageUrl || coverImageUrl;

      // 2. Create Itinerary if toggled
      if (createItineraryToggle) {
        const itineraryPayload = {
          title: `${destinationName} Special Package`,
          travelType: destinationType,
          destination: destinationName,
          duration: itineraryDuration || "3 Nights / 4 Days",
          standardPrice: Number(itineraryPrice.replace(/[^0-9]/g, '')) || 0,
          destinationDetail: shortDescription || `Explore the beauty of ${destinationName}`,
          mediaUrls: destinationImgUrl ? [destinationImgUrl] : [],
          visibility: "Public"
        };

        await axios.post(`${API_BASE}/api/itineraries`, itineraryPayload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // 3. Map to Agent's Tours & Packages
        const agent = agents.find(a => a._id === selectedAgentId);
        if (agent) {
          let currentPackages = [];
          try {
            currentPackages = agent.tourPackages ? JSON.parse(agent.tourPackages) : [];
            if (!Array.isArray(currentPackages)) currentPackages = [];
          } catch (e) { currentPackages = []; }

          const newPkg = {
            destination: destinationName,
            description: shortDescription || `Enjoy a premium trip to ${destinationName}`,
            price: itineraryPrice ? (itineraryPrice.startsWith('₹') ? itineraryPrice : `₹${itineraryPrice}`) : "₹0"
          };

          const updatedPackages = JSON.stringify([...currentPackages, newPkg]);

          // Update agent record
          await axios.put(`${API_BASE}/api/agents/${selectedAgentId}`, {
            ...agent, // Keep existing data
            tourPackages: updatedPackages
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }

      setSuccess(createItineraryToggle ? 'Destination and Itinerary created successfully!' : 'Destination created successfully!');
      clearForm();
      setCreateItineraryToggle(false);
      setSelectedAgentId("");
      setItineraryDuration("");
      setItineraryPrice("");
      await Promise.all([fetchFiltered(), fetchAll()]);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save destination');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dest) => {
    setEditingDestination({ ...dest });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const token = getAuthToken();
      await axios.put(`${API_BASE}/api/destinations/${editingDestination._id}`, editingDestination, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Updated successfully');
      setIsEditModalOpen(false);
      await Promise.all([fetchFiltered(), fetchAll()]);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this destination?')) return;
    try {
      setLoading(true);
      const token = getAuthToken();
      await axios.delete(`${API_BASE}/api/destinations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Deleted successfully');
      await Promise.all([fetchFiltered(), fetchAll()]);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Delete failed');
    } finally {
      setLoading(false);
    }
  };

  /* ── derived counts ─────────────────────────────────────────── */
  const domCount = allDestinations.filter(d => d.type?.toLowerCase() === 'domestic').length;
  const intCount = allDestinations.filter(d => d.type?.toLowerCase() === 'international').length;
  const totalCount = allDestinations.length;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <GlobalStyle />

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-red-600 text-[10px] font-bold uppercase tracking-widest mb-1">Destination Manager</p>
            <h1 className="text-slate-900 text-3xl font-black tracking-tight">Create & Manage Destinations</h1>
          </div>
          <ProfileButton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <aside className="lg:col-span-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Total" value={totalCount} color="#6b7280" />
              <StatCard label="Domestic" value={domCount} color="#2563eb" />
              <StatCard label="International" value={intCount} color="#d97706" />
              <StatCard label="Active" value={totalCount} color="#16a34a" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm sticky top-6">
              <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg,#7f1d1d,#dc2626)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,.15)' }}>
                  <HiGlobeAlt className="text-white text-xl" />
                </div>
                <h2 className="text-white font-bold text-base">New Destination</h2>
                <p className="text-red-100 text-xs mt-1">Add a new travel spot to the website</p>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-5">
                {error && <Alert type="error" msg={error} onClose={() => setError('')} />}
                {success && <Alert type="success" msg={success} />}

                <div>
                  <FieldLabel>Destination Type</FieldLabel>
                  <div className="flex gap-2 p-1 rounded-xl bg-gray-100 w-fit">
                    {['Domestic', 'International'].map(t => (
                      <button
                        key={t} type="button"
                        onClick={() => setDestinationType(t)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${destinationType === t ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel>Destination Name *</FieldLabel>
                  <input type="text" className="cd-input" placeholder="e.g. Manali, Himachal" value={destinationName} onChange={e => setDestinationName(e.target.value)} />
                </div>

                <div>
                  <FieldLabel>Short Description</FieldLabel>
                  <textarea className="cd-input h-24 resize-none" placeholder="Briefly describe the highlights..." value={shortDescription} onChange={e => setShortDescription(e.target.value)} />
                </div>

                <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-extrabold text-red-900 uppercase tracking-tight">Create Itinerary Also?</p>
                      <p className="text-[10px] font-medium text-red-600 leading-tight">Link this destination to an agent's Tours & Packages automatically.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCreateItineraryToggle(!createItineraryToggle)}
                      className={`w-12 h-6 rounded-full transition-all relative ${createItineraryToggle ? 'bg-red-600' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${createItineraryToggle ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  {createItineraryToggle && (
                    <div className="mt-4 space-y-4">
                      <select className="cd-input bg-white text-xs" value={selectedAgentId} onChange={e => setSelectedAgentId(e.target.value)}>
                        <option value="">Select Agent</option>
                        {agents.map(a => <option key={a._id} value={a._id}>{a.company || a.firstName}</option>)}
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" className="cd-input bg-white text-xs" placeholder="Duration" value={itineraryDuration} onChange={e => setItineraryDuration(e.target.value)} />
                        <input type="text" className="cd-input bg-white text-xs" placeholder="Price (₹)" value={itineraryPrice} onChange={e => setItineraryPrice(e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <FieldLabel>Cover Image</FieldLabel>
                  <MediaUploader
                    label=""
                    maxFiles={1}
                    existingUrls={coverImageUrl ? [coverImageUrl] : []}
                    onChange={(urls) => setCoverImageUrl(urls[0] || "")}
                    folder={getS3Path.destination(destinationName)}
                    baseFileName={destinationName}
                  />
                </div>

                <div>
                  <FieldLabel>Categories</FieldLabel>
                  <div className="grid grid-cols-2 gap-y-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    {Object.keys(categories).map(cat => (
                      <RedCheck key={cat} label={cat} checked={categories[cat]} onChange={() => handleCategoryToggle(cat)} />
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-200 hover:bg-red-700 transition-all disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create Destination'}
                </button>
              </form>
            </div>
          </aside>

          <section className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{destinationType} Destinations</h3>
                  <p className="text-slate-400 text-xs">Currently showing {destinations.length} results</p>
                </div>
                <div className="flex gap-2">
                  {['Domestic', 'International'].map(t => (
                    <button key={t} onClick={() => setDestinationType(t)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${destinationType === t ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400 hover:text-gray-600'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-7 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Destination</th>
                      <th className="px-7 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Categories</th>
                      <th className="px-7 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {destinations.map(dest => (
                      <tr key={dest._id} className="cd-row transition-colors">
                        <td className="px-7 py-5">
                          <div className="flex items-center gap-4">
                            <img src={dest.coverImageUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{dest.name}</p>
                              <p className="text-slate-400 text-xs truncate max-w-[200px]">{dest.shortDescription}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-7 py-5">
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(dest.categories || {}).filter(([, v]) => v).map(([k]) => (
                              <span key={k} className="cd-badge" style={{ background: CAT_COLORS[k]?.bg, color: CAT_COLORS[k]?.color }}>{k}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-7 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEdit(dest)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><HiPencil /></button>
                            <button onClick={() => handleDelete(dest._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><HiTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>

      {isEditModalOpen && editingDestination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">Edit Destination</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div>
                <FieldLabel>Destination Name</FieldLabel>
                <input type="text" className="cd-input" value={editingDestination.name} onChange={e => setEditingDestination({ ...editingDestination, name: e.target.value })} />
              </div>
              <div>
                <FieldLabel>Short Description</FieldLabel>
                <textarea className="cd-input h-32 resize-none" value={editingDestination.shortDescription} onChange={e => setEditingDestination({ ...editingDestination, shortDescription: e.target.value })} />
              </div>
              <div>
                <FieldLabel>Cover Image</FieldLabel>
                <MediaUploader
                  label=""
                  maxFiles={1}
                  existingUrls={editingDestination.coverImageUrl ? [editingDestination.coverImageUrl] : []}
                  onChange={(urls) => setEditingDestination({ ...editingDestination, coverImageUrl: urls[0] || "" })}
                  folder={getS3Path.destination(editingDestination.name)}
                  baseFileName={editingDestination.name}
                />
              </div>
              <div>
                <FieldLabel>Categories</FieldLabel>
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50">
                  {Object.keys(CAT_COLORS).map(cat => (
                    <RedCheck key={cat} label={cat} checked={editingDestination.categories?.[cat]} onChange={() => setEditingDestination({ ...editingDestination, categories: { ...editingDestination.categories, [cat]: !editingDestination.categories?.[cat] } })} />
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-4 rounded-2xl bg-red-600 text-white font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all">Update Destination</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateDestination;