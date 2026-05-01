import React, { useState, useEffect } from "react";
import ProfileButton from "../components/ProfileButton";
import MediaUploader from "../components/MediaUploader";
import axios from "axios";
import { getS3Path } from "../utils/pathUtils";

const HomeTopBanner = () => {
  const [banners, setBanners] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [position, setPosition] = useState("top");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    desc: "",
    startDate: "",
    endDate: "",
  });
  const [image, setImage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchBanners = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE || "";
      const res = await axios.get(`${apiBase}/api/banners?position=${position}`);
      setBanners(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [position]);

  const resetForm = () => {
    setShowForm(false);
    setForm({ title: "", desc: "", startDate: "", endDate: "" });
    setImage("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.desc || !form.startDate || !form.endDate) {
      alert("Please fill all fields before saving.");
      return;
    }

    const apiBase = import.meta.env.VITE_API_BASE || "";
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login again before adding a banner.");
      return;
    }

    const payload = {
      title: form.title,
      desc: form.desc,
      startDate: form.startDate,
      endDate: form.endDate,
      position: position,
      isActive: true,
      imageUrl: image
    };

    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`${apiBase}/api/banners/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${apiBase}/api/banners`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      resetForm();
      fetchBanners();
    } catch (error) {
      console.error("Banner save failed", error.response?.data || error.message || error);
      alert(`Failed to save banner: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE || "";
      await axios.delete(`${apiBase}/api/banners/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchBanners();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete banner");
    }
  };

  const handleEdit = (b) => {
    setEditingId(b._id);
    setForm({
      title: b.title,
      desc: b.desc || "",
      startDate: b.startDate?.slice(0, 10) || "",
      endDate: b.endDate?.slice(0, 10) || "",
    });
    setImage(b.imageUrl || "");
    setShowForm(true);
  };

  const filteredBanners = banners.filter((banner) => {
    const matchesSearch =
      banner.title?.toLowerCase().includes(search.toLowerCase()) ||
      banner.desc?.toLowerCase().includes(search.toLowerCase());

    const bannerStart = new Date(banner.startDate);
    const bannerEnd = new Date(banner.endDate);
    const filterStart = startDate ? new Date(startDate) : null;
    const filterEnd = endDate ? new Date(endDate) : null;

    const matchesStart = filterStart ? bannerStart >= filterStart : true;
    const matchesEnd = filterEnd ? bannerEnd <= filterEnd : true;

    return matchesSearch && matchesStart && matchesEnd;
  });

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-10">
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes hoverGlow {
          0%, 100% { box-shadow: 0 0 0 rgba(59, 130, 246, 0.35); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }
        }

        .banner-modal {
          animation: slideUpFade 0.35s ease-out forwards;
        }

        .upload-dropzone {
          background: linear-gradient(180deg, rgba(59,130,246,0.06), rgba(59,130,246,0.02));
          border: 2px dashed rgba(59,130,246,0.35);
        }

        .upload-dropzone:hover {
          border-color: rgba(59,130,246,0.65);
          background: rgba(59,130,246,0.08);
        }

        .banner-card:hover {
          transform: translateY(-4px);
        }
      `}</style>

      <div className="mb-6 rounded-[24px] border border-blue-600/20 bg-white/95 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] font-semibold text-blue-600/80">
              Banner Ads
            </p>
            <h1>
              Home {position === "top" ? "Top" : "Middle"} Banner
            </h1>
            <p className="mt-2 text-sm text-slate-500 max-w-xl">
              Create and manage homepage top banner promotions with rich preview cards and a smooth upload experience.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(59,130,246,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(59,130,246,0.25)]"
            >
              <span className="text-base">+</span> Add Banner
            </button>
            <ProfileButton />
          </div>
        </div>
      </div>


<div className="flex gap-3 mb-4">
  {["top", "middle"].map((type) => (
    <button
      key={type}
      onClick={() => setPosition(type)}
      className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
        position === type
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {type === "top" ? "Top Banner" : "Middle Banner"}
    </button>
  ))}
</div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-6">
          <div className="rounded-[24px] border border-blue-600/20 bg-white/95 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-slate-900">Filters</h2>
                <p className="mt-1 text-sm text-slate-500">Search in active banners or filter by display date.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <input
                placeholder="Search banners"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredBanners.map((b) => (
              <article
                key={b._id}
                className="banner-card overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.05)] transition-transform duration-300"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="h-48 w-full object-cover transition duration-500 hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/70 to-transparent p-4 text-white">
                    <p className="text-sm uppercase tracking-[0.18em] font-semibold text-cyan-300"> {position === "top" ? "Top Banner" : "Middle Banner"}</p>
                    <h3 className="mt-1 text-lg font-bold">{b.title}</h3>
                  </div>
                </div>

                <div className="space-y-3 p-5">
                  <p className="text-sm leading-6 text-slate-600 line-clamp-3">{b.desc || "No description available."}</p>
                  <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">Start: {b.startDate?.slice(0, 10)}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">End: {b.endDate?.slice(0, 10)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => handleEdit(b)}
                      className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[24px] border border-blue-600/20 bg-gradient-to-br from-cyan-50 to-slate-50 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
              Quick tip
            </p>
            <h2 className="mt-3 text-xl font-bold text-slate-900">Banner Visibility</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Use the filters to review active campaigns, then open the banner form to update text and image quickly with a consistent admin-style popup.
            </p>
          </div>
        </aside>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="banner-modal w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_35px_80px_rgba(15,23,42,0.18)]"
          >
            <div className="flex flex-col gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-6 text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-sky-200">{editingId ? "Edit Banner" : "New Banner"}</p>
                <h2 className="mt-2 text-2xl font-extrabold">{editingId ? "Update top banner" : "Create top banner"}</h2>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <div className="grid gap-6 p-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5">
                <label className="block text-sm font-semibold text-slate-800">Title</label>
                <input
                  placeholder="Banner title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />

                <label className="block text-sm font-semibold text-slate-800">Description</label>
                <textarea
                  rows={4}
                  placeholder="Write a short caption for the banner"
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800">Start date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="mt-2 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800">End date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="mt-2 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <MediaUploader
                  label="Banner Image (Drag & Upload)"
                  existingUrls={image ? [image] : []}
                  onChange={(urls) => setImage(urls[0] || "")}
                  folder={getS3Path.banner(`home-${position}-banner`, form.title)}
                  baseFileName={form.title}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {saving ? "Saving..." : editingId ? "Update banner" : "Create banner"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default HomeTopBanner;
