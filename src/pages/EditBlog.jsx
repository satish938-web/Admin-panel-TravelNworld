import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { HiArrowLeft } from 'react-icons/hi';
import ProfileButton from '../components/ProfileButton';
import MediaUploader from '../components/MediaUploader';
import axios from 'axios';
import { API_BASE } from '../utils/api';
import { getS3Path } from '../utils/pathUtils';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from '../utils/toast';

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('Public');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/blogs/id/${id}`);
        const blog = res.data.data;
        setTitle(blog.title);
        setCoverImageUrl(blog.coverImage);
        setContent(blog.content);
        setVisibility(blog.isPublished ? 'Public' : 'Private');
        setLoading(false);
      } catch (error) {
        console.error("Error fetching blog:", error);
        toast.error("Failed to load blog data");
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!title || !content) return toast.error("Please fill Title and Content");

    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    try {
      const blogData = {
        title,
        slug,
        content,
        coverImage: coverImageUrl,
        isPublished: visibility === 'Public'
      };

      await axios.put(`${API_BASE}/api/blogs/${id}`, blogData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });
      toast.success("Blog updated successfully!");
      navigate('/blogs-list');
    } catch (error) {
      console.error("Error updating blog:", error);
      toast.error(error.response?.data?.message || "Error updating blog");
    }
  };

  if (loading) return <div className="text-center py-20">Loading blog data...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-red-50 rounded-full text-red-600 transition-all">
              <HiArrowLeft className="text-2xl" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Edit Blog Post</h1>
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
                label="Cover Image (Drag & Upload)"
                existingUrls={coverImageUrl ? [coverImageUrl] : []}
                onChange={(urls) => setCoverImageUrl(urls[0] || "")}
                multiple={false}
                folder={getS3Path.blog(title)}
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
                className="bg-white rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => navigate(-1)} className="px-8 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-12 rounded-xl transition-all shadow-xl shadow-red-100 active:scale-95">
              Update Blog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBlog;
