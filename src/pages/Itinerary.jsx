import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineMap, HiPencil, HiTrash, HiSearch, HiRefresh } from 'react-icons/hi';
import { MdFlightTakeoff, MdPublic } from 'react-icons/md';
import ProfileButton from '../components/ProfileButton';
import AddItineraries from '../components/AddItineraries';
import axios from 'axios';
import { toast } from '../utils/toast';

const API_BASE = import.meta.env.VITE_API_BASE || '';

/* ── Skeleton Card ─────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white/90 border border-red-600/10 rounded-3xl overflow-hidden shadow-sm animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="flex gap-2">
        <div className="h-4 w-16 bg-gray-200 rounded-full" />
        <div className="h-4 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-gray-200 rounded" />
      <div className="h-4 w-1/2 bg-gray-200 rounded" />
    </div>
  </div>
);

/* ── Empty State ───────────────────────────────────────────────────────── */
const EmptyState = ({ onAdd }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
    <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
      <HiOutlineMap className="text-red-400 text-4xl" />
    </div>
    <h3 className="text-xl font-bold text-gray-700 mb-2">No Itineraries Found</h3>
    <p className="text-gray-400 text-sm mb-6 max-w-xs">
      No itineraries match your filters, or none have been created yet.
    </p>
    <button
      onClick={onAdd}
      className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all text-sm"
    >
      + Add First Itinerary
    </button>
  </div>
);

/* ── Main Component ────────────────────────────────────────────────────── */
const Itinerary = ({ isAdminOnly = false }) => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tripType, setTripType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState(null); // null = add, object = edit
  const [deleting, setDeleting] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ domestic: 0, international: 0 });
  const [agents, setAgents] = useState([]);
  const [agentFilter, setAgentFilter] = useState('all'); // 'all', 'admin', or agentId
  const LIMIT = 12;

  const fetchAgents = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/agents`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAgents(res.data || []);
    } catch (err) {
      console.error("Error fetching agents:", err);
    }
  }, []);

  /* Fetch agent itineraries from backend */
  const fetchItineraries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        limit: LIMIT,
        skip: (page - 1) * LIMIT,
      });
      if (tripType !== 'all') params.append('type', tripType);
      if (agentFilter !== 'all') params.append('agentId', agentFilter);

      const res = await axios.get(`${API_BASE}/api/agent-itineraries?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setItineraries(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      
      // Basic stats calculation (In a real app, backend should provide this)
      const dom = (res.data.data || []).filter(it => it.type === 'domestic').length;
      const intl = (res.data.data || []).filter(it => it.type === 'international').length;
      setStats({ domestic: dom, international: intl });
    } catch (err) {
      console.error('Error fetching itineraries:', err);
      setError('Failed to load itineraries. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, tripType, agentFilter]);

  useEffect(() => {
    fetchItineraries();
    fetchAgents();
  }, [fetchItineraries, fetchAgents]);

  /* Client-side search filter */
  const filtered = itineraries.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.destination?.toLowerCase().includes(q) ||
      item.city?.toLowerCase().includes(q) ||
      item.country?.toLowerCase().includes(q)
    );
  });

  /* Delete handler */
  const handleDelete = async (slug) => {
    if (!window.confirm('Are you sure you want to delete this itinerary?')) return;
    setDeleting(slug);
    try {
      await axios.delete(`${API_BASE}/api/agent-itineraries/${slug}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setItineraries((prev) => prev.filter((it) => it.slug !== slug));
      setTotal((t) => t - 1);
      toast.success('Itinerary deleted successfully');
    } catch (err) {
      toast.error('Failed to delete itinerary');
    } finally {
      setDeleting(null);
    }
  };

  /* Edit handler — fetch full itinerary data then open modal */
  const handleEdit = async (slug) => {
    try {
      const res = await axios.get(`${API_BASE}/api/agent-itineraries/${slug}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = res.data?.data ?? res.data;
      setEditingItinerary(data);
      setShowModal(true);
    } catch (err) {
      toast.error('Failed to load itinerary data');
    }
  };

  const openAddModal = () => {
    setEditingItinerary(null);
    setShowModal(true);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.03; }
          50% { transform: translateY(-100px) rotate(180deg); opacity: 0.08; }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease both; }
      `}</style>

      {/* Animated background */}
      <div className="fixed top-0 left-0 w-full h-full -z-[1] overflow-hidden bg-slate-50" id="animatedBg">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-[0.03] animate-float bg-red-600"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${Math.random() * 10 + 5}s`,
            }}
          />
        ))}
      </div>

      <div className="p-4 sm:p-6 min-h-screen relative">

        {/* ── Header ───────────────────────────────────────────────── */}
        <header className="bg-white/90 backdrop-blur-[15px] p-4 sm:p-6 rounded-[20px] border border-red-600/20 mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3 text-xl sm:text-2xl lg:text-[2rem] font-bold text-red-600">
            <HiOutlineMap className="text-3xl" />
            <span>All Itineraries</span>
            {total > 0 && (
              <span className="text-base font-semibold text-gray-400 ml-1">({total})</span>
            )}
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Domestic</p>
              <p className="text-xl font-black text-gray-800">{stats.domestic}</p>
            </div>
            <div className="h-8 w-px bg-gray-100" />
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">International</p>
              <p className="text-xl font-black text-gray-800">{stats.international}</p>
            </div>
            <div className="h-8 w-px bg-gray-100" />
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Grand Total</p>
              <p className="text-xl font-black text-red-600">{total}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={fetchItineraries}
              title="Refresh"
              className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
            >
              <HiRefresh size={20} />
            </button>
            <ProfileButton />
          </div>
        </header>

        {/* ── Filters + Add Button ──────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by title, destination..."
              className="w-full pl-11 pr-5 py-3 border border-red-600/20 rounded-full bg-white/80 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Type filter */}
          <select
            value={tripType}
            onChange={(e) => { setTripType(e.target.value); setPage(1); }}
            className="px-6 py-3 border border-red-600/20 rounded-full bg-white/80 backdrop-blur-sm text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Trip Types</option>
            <option value="domestic">Domestic</option>
            <option value="international">International</option>
          </select>

          <select
            value={agentFilter}
            onChange={(e) => { setAgentFilter(e.target.value); setPage(1); }}
            className="px-6 py-3 border border-red-600/20 rounded-full bg-white/80 backdrop-blur-sm text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-w-[200px]"
          >
            <option value="all">Total Itineraries (All)</option>
            <option value="agents_only">All Agents (Assigned)</option>
            <option value="admin">Super Admin (Self)</option>
            {agents.map(agent => (
              <option key={agent._id} value={agent._id}>
                {agent.company || `${agent.firstName} ${agent.lastName}`}
              </option>
            ))}
          </select>

          {/* Add Button */}
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-full shadow-[0_4px_15px_rgba(220,38,38,0.3)] hover:scale-105 transition-all text-sm whitespace-nowrap"
          >
            + Add Itinerary
          </button>
        </div>

        {/* ── Error ────────────────────────────────────────────────── */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchItineraries} className="font-bold underline ml-4">Retry</button>
          </div>
        )}

        {/* ── Grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}

          {!loading && filtered.length === 0 && (
            <EmptyState onAdd={() => setShowModal(true)} />
          )}

          {!loading && filtered.map((item) => (
            <div
              key={item._id || item.slug}
              className="group bg-white/90 backdrop-blur-md border border-red-600/10 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_35px_rgba(220,38,38,0.15)] transition-all duration-300 hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-gray-100">
                {item.coverImageUrl ? (
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                    <HiOutlineMap className="text-red-300 text-5xl" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                  <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-bold uppercase tracking-wider">
                    {item.duration || 'Flexible'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    item.type === 'international'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-red-600 text-white'
                  }`}>
                    {item.type === 'international' ? '✈ Intl' : '🇮🇳 Dom'}
                  </span>
                </div>

                {/* Action Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  {/* <button
                    onClick={() => handleEdit(item.slug)}
                    className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors shadow-lg"
                    title="Edit"
                  >
                    <HiPencil size={18} />
                  </button> */}
                  <button
                    onClick={() => handleDelete(item.slug)}
                    disabled={deleting === item.slug}
                    className="w-10 h-10 rounded-full bg-white text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors shadow-lg disabled:opacity-50"
                    title="Delete"
                  >
                    <HiTrash size={18} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.type === 'domestic' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {item.type?.charAt(0).toUpperCase() + item.type?.slice(1) || 'Tour'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    📍 {item.destination || item.city || item.country || 'Global'}
                  </span>
                </div>

                <h4 className="text-base font-bold text-gray-800 mb-1 group-hover:text-red-600 transition-colors line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                  {item.shortDescription || 'An amazing travel experience awaits.'}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div>
                    <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Starting from</span>
                    <div className="text-sm font-black text-gray-800">
                      {item.asBestQuote
                        ? 'Best Quote'
                        : item.priceFrom > 0
                        ? `₹${item.priceFrom.toLocaleString('en-IN')}`
                        : 'Contact Us'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest block mb-1">
                      {item.agentId ? "Assigned Agent" : "Management"}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.agentId ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                    }`}>
                      {item.agentId 
                        ? (item.agentId.company || `${item.agentId.firstName} ${item.agentId.lastName}`)
                        : "Admin / Self"
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Pagination ───────────────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-5 py-2 rounded-full bg-white border border-red-600/20 text-sm font-semibold text-gray-600 hover:bg-red-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ← Prev
            </button>
            <span className="text-sm font-medium text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-5 py-2 rounded-full bg-white border border-red-600/20 text-sm font-semibold text-gray-600 hover:bg-red-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        )}

      </div>

      {/* ── Add Itinerary Modal ──────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[30px] shadow-2xl relative animate-fadeIn">
            {/* Modal header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md p-6 border-b border-gray-100 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-red-600 flex items-center gap-3">
                <MdFlightTakeoff />
                {editingItinerary ? 'Edit Itinerary' : 'Add New Itinerary'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-600 hover:text-white transition-all text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <AddItineraries
                initialData={editingItinerary}
                onSubmit={() => { setShowModal(false); setEditingItinerary(null); fetchItineraries(); }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Itinerary;
