import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { HiArrowLeft } from 'react-icons/hi';
import ProfileButton from '../components/ProfileButton';
import MediaUploader from '../components/MediaUploader';
import { getS3Path } from '../utils/pathUtils';
import axios from 'axios';
import { API_BASE } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { toast } from '../utils/toast';

const CreateBlog = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('Public');
  const [coverImageKey, setCoverImageKey] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!title || !content) return toast.error("Please fill Title and Content");
    if (!coverImageKey) return toast.error("Please upload a cover image");

    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    try {
      setLoading(true);
      const blogData = {
        title,
        slug,
        content,
        coverImage: coverImageKey,
        isPublished: visibility === 'Public'
      };

      await axios.post(`${API_BASE}/api/blogs`, blogData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });
      toast.success("Blog post created successfully!");
      navigate('/blogs-list');
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error(error.response?.data?.message || "Error saving blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-red-50 rounded-full text-red-600 transition-all">
              <HiArrowLeft className="text-2xl" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Create New Post</h1>
          </div>
          <ProfileButton />
        </header>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Title</label>
              <input
                type="text" placeholder="Enter Blog Title" required
                value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Visibility</label>
              <select
                value={visibility} onChange={(e) => setVisibility(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none bg-white font-medium"
              >
                <option value="Public">Public</option>
                <option value="Private">Draft/Private</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-4">
             <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cover Image</label>
             <MediaUploader
                label=""
                maxFiles={1}
                existingUrls={coverImageKey ? [coverImageKey] : []}
                onChange={(urls) => setCoverImageKey(urls[0] || "")}
                folder={getS3Path.blog("superadmin", title)}
                baseFileName={title}
             />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Content</label>
            <div className="quill-wrapper">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                style={{ height: '300px', marginBottom: '50px' }}
                placeholder="Share your travel story..."
                className="bg-white rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => navigate(-1)} className="px-8 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-12 rounded-xl transition-all shadow-xl shadow-red-100 active:scale-95 disabled:opacity-50">
              {loading ? "Publishing..." : "Publish Blog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog;
