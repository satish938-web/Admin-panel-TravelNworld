import React, { useState, useEffect } from 'react';
import { HiLocationMarker, HiTrash, HiSearch, HiStar, HiPlus, HiX, HiVideoCamera, HiPhotograph, HiCheckCircle, HiChartBar } from 'react-icons/hi';
import ProfileButton from '../components/ProfileButton';
import MediaUploader from '../components/MediaUploader';
import axios from 'axios';
import { getS3Path } from '../utils/pathUtils';

const TestimonialList = () => {
  const [activeTab, setActiveTab] = useState('all'); // all, text, video
  const [searchTerm, setSearchTerm] = useState('');
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    content: '',
    rating: 5,
    type: 'text',
    location: '',
    videoUrl: '',
    visibility: 'Public'
  });
  const [uploadedUrl, setUploadedUrl] = useState("");

  const API_BASE = 'http://localhost:5000/api/testimonials';

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      setTestimonials(res.data.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        [formData.type === 'video' ? 'videoUrl' : 'image']: uploadedUrl
      };

      await axios.post(API_BASE, payload, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
      setIsModalOpen(false);
      resetForm();
      fetchTestimonials();
    } catch (error) {
      console.error("Save error:", error);
      alert("Error: " + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this testimonial? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchTestimonials();
      } catch (error) {
        alert("Delete failed");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', role: '', content: '', rating: 5,
      type: 'text', location: '', videoUrl: '',
      visibility: 'Public'
    });
    setUploadedUrl("");
  };

  const filteredTestimonials = testimonials.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.location && t.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTab = activeTab === 'all' || t.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: testimonials.length,
    video: testimonials.filter(t => t.type === 'video').length,
    text: testimonials.filter(t => t.type === 'text').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Premium Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-[2rem] p-8 mb-8 shadow-2xl shadow-red-200 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2">Testimonials Master</h1>
              <p className="text-red-100 font-medium opacity-90">Manage your brand's social proof and traveler stories.</p>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
              <ProfileButton />
            </div>
          </div>
          {/* Decorative Circles */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-red-400/20 rounded-full blur-3xl"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Stories', value: stats.total, icon: HiChartBar, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Video Clips', value: stats.video, icon: HiVideoCamera, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Written Reviews', value: stats.text, icon: HiPhotograph, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center text-2xl`}>
                <stat.icon />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Section */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            {/* Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full lg:w-auto">
              {['all', 'text', 'video'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-red-600'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search & Add */}
            <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="relative w-full md:w-80">
                <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search testimonials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-red-500 outline-none transition-all bg-slate-50/50"
                />
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-red-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-200 active:scale-95"
              >
                <HiPlus className="text-xl" /> Add Testimonial
              </button>
            </div>
          </div>
        </div>

        {/* Data Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold animate-pulse">Synchronizing Stories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTestimonials.map((t) => (
              <div key={t._id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all group relative">
                {/* Visual Preview */}
                <div className="aspect-[4/3] bg-slate-900 relative overflow-hidden">
                  {t.type === 'video' ? (
                    <div className="w-full h-full relative group/video">
                      <video src={t.videoUrl} className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <a href={t.videoUrl} target="_blank" rel="noreferrer" className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/30 hover:bg-red-600 transition-all shadow-2xl">
                          <i className="fas fa-play ml-1"></i>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <img src={t.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  )}

                  {/* Badges */}
                  <div className="absolute top-5 left-5 flex gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${t.type === 'video' ? 'bg-red-600/80 border-red-400 text-white' : 'bg-red-600/80 border-red-400 text-white'
                      }`}>
                      {t.type}
                    </span>
                  </div>
                  <div className="absolute bottom-5 left-5 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-[10px] font-bold">
                    <HiLocationMarker className="text-red-400" />
                    {t.location || 'Global'}
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-8 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-slate-900 text-xl leading-tight">{t.name}</h3>
                      <p className="text-slate-400 text-xs font-black uppercase tracking-tighter mt-1">{t.role}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <HiStar key={i} className={`text-lg ${i < t.rating ? 'text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute -top-2 -left-2 text-3xl text-slate-100 font-serif leading-none">“</span>
                    <p className="text-slate-600 text-sm leading-relaxed italic line-clamp-3 pl-4 pr-2">
                      {t.content || "An incredible journey that exceeded all expectations. The attention to detail and service was simply world-class."}
                    </p>
                  </div>

                  <div className="pt-6 flex gap-3">
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="flex-1 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all border border-slate-100 hover:border-red-100"
                    >
                      <HiTrash className="text-xl" />
                      <span>Remove</span>
                    </button>
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                      <HiCheckCircle className={t.visibility === 'Public' ? 'text-emerald-500' : 'text-slate-200'} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add Testimonial */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 overflow-y-auto">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl relative">
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-400 hover:text-red-600 transition-all z-[110]"
              >
                <HiX className="text-2xl" />
              </button>

              <div className="p-10 space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-black text-slate-900">New Social Proof</h2>
                  <p className="text-slate-400 font-medium">Add a new success story to your dashboard.</p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  {/* Type Toggle */}
                  <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem]">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'text' })}
                      className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-2xl font-black text-sm transition-all ${formData.type === 'text' ? 'bg-white shadow-xl text-red-600' : 'text-slate-500'}`}
                    >
                      <HiPhotograph className="text-xl" /> Image Story
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'video' })}
                      className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-2xl font-black text-sm transition-all ${formData.type === 'video' ? 'bg-white shadow-xl text-red-600' : 'text-slate-500'}`}
                    >
                      <HiVideoCamera className="text-xl" /> Video Clip
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Client Full Name</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-bold" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Profession / Title</label>
                      <input type="text" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-bold" placeholder="e.g. Happy Traveler" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Destination / Location</label>
                    <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-bold" placeholder="e.g. Switzerland" />
                  </div>

                  {/* File Upload Area */}
                    <MediaUploader
                      label={`${formData.type === 'video' ? 'Video' : 'Image'} Testimonial (Drag & Upload)`}
                      existingUrls={uploadedUrl ? [uploadedUrl] : []}
                      onChange={(urls) => setUploadedUrl(urls[0] || "")}
                      multiple={false}
                      folder={getS3Path.siteTestimonials(formData.name)}
                      baseFileName={formData.name}
                    />

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Review Summary</label>
                    <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-bold h-24" placeholder="Share the feedback..."></textarea>
                  </div>

                  <div className="flex items-center justify-between bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Trust Level</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button key={num} type="button" onClick={() => setFormData({ ...formData, rating: num })} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${formData.rating >= num ? 'bg-amber-400 text-white shadow-lg' : 'bg-white text-slate-300'}`}>
                          <HiStar />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-red-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Publishing Story...
                      </div>
                    ) : 'Publish Testimonial'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialList;


