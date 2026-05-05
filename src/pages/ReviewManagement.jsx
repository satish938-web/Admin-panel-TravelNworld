import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  HiOutlineChatAlt2, 
  HiPencil, 
  HiTrash, 
  HiStar, 
  HiFilter, 
  HiUserGroup, 
  HiTrendingUp,
  HiChevronDown,
  HiSearch
} from "react-icons/hi";
import { getImageUrl } from "../utils/api";

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("all");
  
  const apiBase = import.meta.env.VITE_API_BASE || "";
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = user.role === "SUPERADMIN";

  useEffect(() => {
    fetchReviews();
    if (isSuperAdmin) fetchAgents();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBase}/api/agents/all/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data.data || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      Swal.fire("Error", "Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await axios.get(`${apiBase}/api/agents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAgents(res.data.data || []);
    } catch (err) {
      console.error("Error fetching agents:", err);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Review?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
      background: "#ffffff",
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl px-6 py-2.5 font-bold',
        cancelButton: 'rounded-xl px-6 py-2.5 font-bold'
      }
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${apiBase}/api/agents/reviews/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire({
          title: "Deleted!",
          text: "Review has been removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
        fetchReviews();
      } catch (err) {
        Swal.fire("Error", "Failed to delete review", "error");
      }
    }
  };

  const handleEdit = async (review) => {
    const { value: formValues } = await Swal.fire({
      title: "Edit Review",
      html: `
        <div style="text-align: left; padding: 10px;">
          <label style="font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">User Name</label>
          <input id="swal-input1" class="swal2-input" style="border-radius: 12px; font-size: 14px;" value="${review.userName}" placeholder="User Name">
          
          <label style="font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 15px; display: block;">Rating (1-5)</label>
          <input id="swal-input2" type="number" min="1" max="5" class="swal2-input" style="border-radius: 12px; font-size: 14px;" value="${review.rating}">
          
          <label style="font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 15px; display: block;">Comment</label>
          <textarea id="swal-input3" class="swal2-textarea" style="border-radius: 12px; font-size: 14px; min-height: 100px;" placeholder="Enter comment...">${review.comment}</textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Update Review",
      confirmButtonColor: "#ef4444",
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl px-8 py-3 font-bold',
        cancelButton: 'rounded-xl px-8 py-3 font-bold'
      },
      preConfirm: () => {
        return {
          userName: document.getElementById("swal-input1").value,
          rating: document.getElementById("swal-input2").value,
          comment: document.getElementById("swal-input3").value,
        };
      },
    });

    if (formValues) {
      try {
        await axios.put(`${apiBase}/api/agents/reviews/${review._id}`, formValues, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire({
          title: "Updated!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
        fetchReviews();
      } catch (err) {
        Swal.fire("Error", "Failed to update review", "error");
      }
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesSearch = 
        r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.agentId?.company || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAgent = selectedAgent === "all" || r.agentId?._id === selectedAgent;
      
      return matchesSearch && matchesAgent;
    });
  }, [reviews, searchTerm, selectedAgent]);

  const stats = useMemo(() => {
    const total = filteredReviews.length;
    const avg = total > 0 
      ? (filteredReviews.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1)
      : 0;
    const fiveStars = filteredReviews.filter(r => r.rating === 5).length;
    return { total, avg, fiveStars };
  }, [filteredReviews]);

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto">
        {/* --- Header Section --- */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-200 animate-pulse-slow">
                <HiOutlineChatAlt2 size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Review Center
                </h1>
                <p className="text-slate-500 text-sm font-medium">
                  {isSuperAdmin ? "Global moderation and feedback analysis" : "Manage your partner feedback and ratings"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {isSuperAdmin && (
              <div className="relative w-full sm:w-64 group">
                <select 
                  className="w-full pl-10 pr-10 py-3 bg-white rounded-2xl border-2 border-slate-100 focus:border-red-500/20 focus:ring-4 focus:ring-red-500/5 transition-all outline-none text-sm font-bold text-slate-700 appearance-none shadow-sm group-hover:border-slate-200"
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                >
                  <option value="all">All Partners</option>
                  {agents.map(a => (
                    <option key={a._id} value={a._id}>{a.company || `${a.firstName} ${a.lastName}`}</option>
                  ))}
                </select>
                <HiFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-red-500 transition-colors" size={18} />
                <HiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            )}
            
            <div className="relative w-full sm:w-80 group">
              <input
                type="text"
                placeholder="Search feedback..."
                className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border-2 border-slate-100 focus:border-red-500/20 focus:ring-4 focus:ring-red-500/5 transition-all outline-none text-sm font-bold text-slate-700 shadow-sm group-hover:border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-red-500 transition-colors" size={20} />
            </div>
          </div>
        </div>

        {/* --- Stats Overview --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Total Reviews", value: stats.total, icon: HiOutlineChatAlt2, color: "blue" },
            { label: "Avg. Rating", value: stats.avg, icon: HiStar, color: "orange", suffix: "/ 5.0" },
            { label: "5-Star Ratings", value: stats.fiveStars, icon: HiTrendingUp, color: "green" },
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${item.color}-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500 opacity-50`}></div>
              <div className="flex items-center gap-5 relative z-10">
                <div className={`w-14 h-14 bg-${item.color}-50 rounded-2xl flex items-center justify-center text-${item.color}-600 shadow-inner`}>
                  <item.icon size={24} />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{item.label}</p>
                  <h3 className="text-2xl font-black text-slate-900 leading-none">
                    {item.value} <span className="text-xs font-bold text-slate-400 ml-1">{item.suffix || ""}</span>
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- Content Grid --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mb-6"></div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Synchronizing Data...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-100">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
              <HiOutlineChatAlt2 className="text-slate-200" size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No Feedback Found</h3>
            <p className="text-slate-400 max-w-sm mx-auto text-sm font-medium leading-relaxed">
              {selectedAgent !== "all" 
                ? "This partner hasn't received any reviews yet. Check back soon!" 
                : "Your filter criteria didn't match any results. Try adjusting your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {filteredReviews.map((review) => (
              <div
                key={review._id}
                className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 p-7 flex flex-col relative"
              >
                {/* Float Decoration */}
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl pointer-events-none"></div>

                <div className="flex items-start justify-between mb-6 relative">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-lg shadow-inner group-hover:from-red-500 group-hover:to-red-600 group-hover:text-white group-hover:border-transparent transition-all duration-300">
                      {review.userName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm leading-tight tracking-tight uppercase">{review.userName}</h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <HiStar 
                              key={i} 
                              size={12} 
                              className={i < review.rating ? "text-orange-400" : "text-slate-200"} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          {new Date(review.createdAt).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {isSuperAdmin && (
                  <div className="mb-5">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 rounded-xl border border-blue-100/50 w-fit">
                      <HiUserGroup className="text-blue-500" size={14} />
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest truncate max-w-[150px]">
                        {review.agentId?.company || `${review.agentId?.firstName} ${review.agentId?.lastName}` || "Unknown Partner"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex-1 min-h-[80px]">
                  <p className="text-slate-600 text-[13px] italic leading-[1.8] font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                    "{review.comment}"
                  </p>
                </div>

                {review.images && review.images.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 mt-6">
                    {review.images.map((img, idx) => (
                      <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-slate-50 shadow-sm hover:scale-105 transition-transform cursor-pointer group/img">
                        <img 
                          src={getImageUrl(img)} 
                          alt="Review" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity"></div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* <button
                      onClick={() => handleEdit(review)}
                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
                      title="Edit Review"
                    >
                      <HiPencil size={18} />
                    </button> */}
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-200 transition-all active:scale-95"
                      title="Delete Review"
                    >
                      <HiTrash size={18} />
                    </button>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-red-500/40 transition-all">
                      Review Integrity
                    </span>
                    <div className="w-8 h-1 bg-red-100 rounded-full mt-1 group-hover:w-full transition-all duration-700"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          text-indent: 1px;
          text-overflow: '';
        }
      `}</style>
    </div>
  );
};

export default ReviewManagement;
