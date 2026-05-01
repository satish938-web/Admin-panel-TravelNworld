import React, { useState, useEffect } from 'react';
import { HiSearch, HiTrash, HiPencil, HiEye, HiPlus, HiCalendar } from 'react-icons/hi';
import ProfileButton from '../components/ProfileButton';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BlogsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Blogs from Backend
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/blogs?isAdmin=true');
      setBlogs(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await axios.delete(`http://localhost:5000/api/blogs/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
          }
        });
        setBlogs(blogs.filter(blog => blog._id !== id));
      } catch (error) {
        alert("Failed to delete blog");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Blogs Management</h1>
            <p className="text-slate-500 mt-1">Manage and edit your travel stories.</p>
          </div>
          <div className="flex items-center gap-4">
          <button 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-100 active:scale-95 font-bold"
            onClick={() => navigate('/create-blog')}
          >
            <HiPlus /> New Blog
          </button>
             <ProfileButton />
          </div>
        </header>

        {/* Search & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3 relative">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-red-500/20 outline-none transition-all bg-white shadow-sm"
            />
          </div>
          <div className="bg-red-600 rounded-2xl p-4 flex items-center justify-center text-white shadow-lg shadow-red-200">
            <div className="text-center">
              <p className="text-red-100 text-xs font-bold uppercase tracking-wider">Total Blogs</p>
              <p className="text-2xl font-bold">{blogs.length}</p>
            </div>
          </div>
        </div>

        {/* Blogs Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-medium italic">Loading your stories...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase())).map((blog) => (
              <div key={blog._id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={blog.coverImage || 'https://via.placeholder.com/400x250?text=Travel+N+World'} 
                    alt={blog.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                      blog.isPublished ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'
                    }`}>
                      {blog.isPublished ? 'Public' : 'Draft'}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                    <HiCalendar className="text-red-500" />
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <h3 className="font-bold text-slate-900 text-lg line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                    {blog.title}
                  </h3>
                  
                  <div className="pt-4 border-t border-slate-50 flex gap-2">
                    <button 
                      onClick={() => navigate(`/edit-blog/${blog._id}`)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold py-2.5 rounded-xl transition-all"
                    >
                      <HiPencil />
                      Edit
                    </button>
                    <button className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
                      <HiEye />
                    </button>
                    <button 
                      onClick={() => handleDelete(blog._id)}
                      className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                    >
                      <HiTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {blogs.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-100">
                <p className="text-slate-400 font-medium">No blog posts found. Add your first story!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsList;

