import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { HiOutlineChatAlt2, HiPencil, HiTrash, HiStar } from "react-icons/hi";
import { getImageUrl } from "../utils/api";

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const apiBase = import.meta.env.VITE_API_BASE || "";
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchReviews();
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

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${apiBase}/api/agents/reviews/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Deleted!", "Review has been deleted.", "success");
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
        <div style="text-align: left;">
          <label style="font-weight: bold; font-size: 14px;">User Name</label>
          <input id="swal-input1" class="swal2-input" value="${review.userName}" placeholder="User Name">
          
          <label style="font-weight: bold; font-size: 14px; margin-top: 10px; display: block;">Rating (1-5)</label>
          <input id="swal-input2" type="number" min="1" max="5" class="swal2-input" value="${review.rating}">
          
          <label style="font-weight: bold; font-size: 14px; margin-top: 10px; display: block;">Comment</label>
          <textarea id="swal-input3" class="swal2-textarea" placeholder="Enter comment...">${review.comment}</textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
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
        Swal.fire("Updated!", "Review has been updated.", "success");
        fetchReviews();
      } catch (err) {
        Swal.fire("Error", "Failed to update review", "error");
      }
    }
  };

  const filteredReviews = reviews.filter(
    (r) =>
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.agentId?.company || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-2 sm:p-6 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                <HiOutlineChatAlt2 size={20} />
              </div>
              Review Management
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium italic">Moderate and manage all public reviews for travel partners.</p>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search reviews or users..."
              className="w-full md:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-red-500/10 focus:border-red-600 transition-all outline-none text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <i className="fas fa-search text-sm"></i>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
            <p className="text-slate-500 font-bold animate-pulse">Fetching Reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineChatAlt2 className="text-slate-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Reviews Found</h3>
            <p className="text-slate-500 max-w-xs mx-auto text-sm">We couldn't find any reviews matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 p-6 flex flex-col group"
              >
                {/* Agent / Partner Badge */}
                <div className="mb-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                    Partner: {review.agentId?.company || `${review.agentId?.firstName} ${review.agentId?.lastName}` || "Unknown Partner"}
                  </span>
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-black text-sm">
                      {review.userName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{review.userName}</h4>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                    <HiStar className="text-orange-500" size={14} />
                    <span className="text-orange-600 font-black text-xs">{review.rating}</span>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-slate-600 text-sm italic leading-relaxed line-clamp-4">
                    "{review.comment}"
                  </p>
                </div>

                {review.images && review.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {review.images.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={getImageUrl(img)} 
                        alt="Review" 
                        className="w-12 h-12 object-cover rounded-lg border border-slate-100"
                      />
                    ))}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(review)}
                      className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all"
                      title="Edit Review"
                    >
                      <HiPencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all"
                      title="Delete Review"
                    >
                      <HiTrash size={16} />
                    </button>
                  </div>
                  
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-red-600/30 transition-all">
                    SuperAdmin Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewManagement;
