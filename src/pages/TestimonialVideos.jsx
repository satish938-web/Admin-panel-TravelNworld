import React, { useState, useRef, useEffect } from 'react';
import { HiVideoCamera, HiLocationMarker, HiTrash, HiPlus, HiCloudUpload } from 'react-icons/hi';
import ProfileButton from '../components/ProfileButton';
import MediaUploader from '../components/MediaUploader';
import axios from 'axios';
import { getS3Path } from '../utils/pathUtils';

const TestimonialVideos = () => {
  const fileInputRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState('Public');
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const API_BASE = 'http://localhost:5000/api/testimonials';

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await axios.get(API_BASE);
      // Filter only video testimonials
      const videoData = res.data.data.filter(t => t.type === 'video');
      setTestimonials(videoData);
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !location || !videoUrl) {
      alert("Please fill all fields and upload a video");
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: title,
        location: location,
        visibility: visibility,
        type: 'video',
        videoUrl: videoUrl
      };

      await axios.post(API_BASE, payload, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      setTitle('');
      setLocation('');
      setVideoUrl('');
      alert("Testimonial video uploaded successfully!");
      fetchTestimonials();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Make sure you are logged in as admin.");
    } finally {
      setUploading(false);
    }

  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this testimonial?")) {
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

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-3xl font-bold text-slate-900">Video Testimonials</h1>
          <ProfileButton />
        </header>

        {/* Upload Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
            <HiVideoCamera className="text-red-600 text-xl" />
            <h2 className="font-bold text-slate-800">Upload New Video</h2>
          </div>

          <form onSubmit={handleUpload} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Side: Video selection */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700">Video Testimonial</label>
                <MediaUploader
                  label="Video Testimonial (Drag & Upload)"
                  existingUrls={videoUrl ? [videoUrl] : []}
                  onChange={(urls) => setVideoUrl(urls[0] || "")}
                  multiple={false}
                  folder={getS3Path.siteTestimonials(title)}
                  baseFileName={title}
                />
              </div>

              {/* Right Side: Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Client Name / Title</label>
                  <input type="text" placeholder="e.g. Mr. Sharma's Family Trip" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Location</label>
                  <input type="text" placeholder="e.g. Manali, Himachal" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Visibility</label>
                  <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none bg-white font-medium">
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className={`bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-12 rounded-2xl transition-all shadow-lg shadow-red-200 flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading to S3...
                  </>
                ) : (
                  <>
                    <HiCloudUpload className="text-xl" />
                    Upload Testimonial
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* List Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HiPlus className="text-green-500 text-2xl rotate-45" />
              <h2 className="text-xl font-bold text-slate-900">Manage Videos ({testimonials.length})</h2>
            </div>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="text-center py-10 text-slate-400 font-medium">Loading testimonials...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonials.map((t) => (
                  <div key={t._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                    <div className="aspect-video bg-slate-900 relative flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <video src={t.videoUrl} className="w-full h-full object-cover opacity-60"></video>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <a href={t.videoUrl} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                          <i className="fas fa-play ml-1"></i>
                        </a>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-slate-900 line-clamp-1">{t.name}</h3>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <HiLocationMarker className="text-red-500" />
                        <span>{t.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase ${t.visibility === 'Public' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                          {t.visibility}
                        </span>
                        <span className="text-slate-300 text-[10px]">{new Date(t.createdAt).toLocaleDateString()}</span>
                      </div>
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="w-full mt-2 bg-red-50 hover:bg-red-600 text-red-500 hover:text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        <HiTrash /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading && testimonials.length === 0 && (
              <div className="text-center py-10 text-slate-400">No video testimonials found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialVideos;

