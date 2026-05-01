import React, { useState, useEffect } from 'react';
import { HiVideoCamera, HiUpload, HiTrash, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import ProfileButton from '../components/ProfileButton';
import MediaUploader from '../components/MediaUploader';
import { getS3Path } from '../utils/pathUtils';
import { API_BASE } from '../utils/api';

const HeroVideoManagement = () => {
  const [selectedPage, setSelectedPage] = useState('home');
  const [visibility, setVisibility] = useState('Public');
  const [activeFilter, setActiveFilter] = useState('Home');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [uploadedVideos, setUploadedVideos] = useState([]);

  const pages = ['home', 'about', 'domestic', 'international', 'contact', 'blog'];
  const filters = ['Home', 'About', 'Domestic', 'International', 'Contact', 'Blog'];

  // Load hero videos from backend on mount
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE}/api/hero-videos/all`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const formattedVideos = data.data.map(video => ({
            id: video._id,
            page: video.title || 'Home',
            visibility: video.isActive ? 'Public' : 'Private',
            url: video.url,
          }));
          setUploadedVideos(formattedVideos);
        }
      } catch (error) {
        console.error("Failed to fetch hero videos:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!videoUrl) { alert("Please upload a video first"); return; }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const pageTitle = selectedPage.charAt(0).toUpperCase() + selectedPage.slice(1);
      const pageSpecificVideos = uploadedVideos.filter(v => v.page === pageTitle);

      // Call backend API to save hero video to database
      const response = await fetch(`${API_BASE}/api/hero-videos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: pageTitle,
          url: videoUrl,
          order: pageSpecificVideos.length,
          isActive: visibility === "Public",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save hero video");
      }

      const data = await response.json();
      const newVideo = {
        id: data.data._id,
        page: pageTitle,
        visibility: visibility,
        url: videoUrl,
      };
      
      setUploadedVideos([newVideo, ...uploadedVideos]);
      setVideoUrl('');
      alert("Video uploaded and set as Hero Video successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading video: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE}/api/hero-videos/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete video");
        }

        setUploadedVideos(uploadedVideos.filter(v => v.id !== id));
        alert("Video deleted successfully!");
      } catch (error) {
        console.error("Delete error:", error);
        alert("Error deleting video: " + error.message);
      }
    }
  };

  const toggleVisibility = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const video = uploadedVideos.find(v => v.id === id);
      const newIsActive = video.visibility === 'Public' ? false : true;

      const response = await fetch(`${API_BASE}/api/hero-videos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: newIsActive,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update visibility");
      }

      setUploadedVideos(uploadedVideos.map(v =>
        v.id === id ? { ...v, visibility: v.visibility === 'Public' ? 'Private' : 'Public' } : v
      ));
    } catch (error) {
      console.error("Toggle visibility error:", error);
      alert("Error updating visibility: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-3xl font-bold text-slate-900">Manage All Page Hero Videos</h1>
          <ProfileButton />
        </header>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Select Page */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <i className="fas fa-th-large text-slate-400"></i>
                  Select Page
                </label>
                <select
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all bg-white"
                >
                  {pages.map(page => (
                    <option key={page} value={page}>{page}</option>
                  ))}
                </select>
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <i className="fas fa-eye text-slate-400"></i>
                  Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all bg-white"
                >
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>
            </div>

            {/* Video Upload Area */}
            <div className="space-y-2">
              <MediaUploader
                label="Hero Section Video (Drag & Upload)"
                existingUrls={videoUrl ? [videoUrl] : []}
                onChange={(urls) => setVideoUrl(urls[0] || "")}
                multiple={false}
                folder={getS3Path.video(`hero-${selectedPage}`, `hero-${selectedPage}`)}
                baseFileName={`hero-${selectedPage}`}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#94a3b8] hover:bg-red-600 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-slate-200 active:transform active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Processing..." : "Upload and Set as Hero Video"}
            </button>
          </form>
        </div>

        {/* Uploaded Videos List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <h2 className="text-2xl font-bold text-slate-900">Uploaded Videos</h2>
            <div className="flex flex-wrap gap-2">
              {filters.map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2 rounded-lg font-bold transition-all ${activeFilter === filter
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 space-y-6">
            {uploadedVideos.filter(v => activeFilter === 'All' || v.page === activeFilter).map((video) => (
              <div key={video.id} className="group border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-all bg-white flex flex-col md:flex-row gap-6 items-center">
                {/* Video Preview */}
                <div className="w-full md:w-64 aspect-video bg-slate-900 rounded-xl overflow-hidden relative border border-slate-200 shadow-inner group-hover:shadow-lg transition-all">
                  <video 
                    className="w-full h-full object-cover" 
                    controls 
                    preload="metadata"
                    src={video.url}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>

                <div className="flex-1 space-y-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-slate-900">{video.page}</h3>
                  <p className="text-slate-400 font-mono text-sm">ID: {video.id}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleVisibility(video.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${video.visibility === 'Public' ? 'bg-green-500' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${video.visibility === 'Public' ? 'translate-x-6' : ''}`}></div>
                    </button>
                    <span className={`text-sm font-bold ${video.visibility === 'Public' ? 'text-green-600' : 'text-slate-400'}`}>
                      {video.visibility}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                  >
                    <HiTrash className="text-xl" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroVideoManagement;
