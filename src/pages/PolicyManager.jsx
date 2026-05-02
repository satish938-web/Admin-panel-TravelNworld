import React, { useState, useEffect } from 'react';
import { HiDocumentText, HiSave, HiPencil, HiShieldCheck } from 'react-icons/hi';
import ProfileButton from '../components/ProfileButton';
import axios from 'axios';
import { API_BASE } from '../utils/api';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { toast } from 'react-hot-toast';

const PolicyManager = ({ type = 'privacy' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const title = type === 'privacy' ? 'Privacy Policy' : 'Terms of Use';
  const icon = type === 'privacy' ? <HiShieldCheck size={24} /> : <HiDocumentText size={24} />;

  useEffect(() => {
    const fetchPolicy = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/api/policies`, {
          params: { type, category: 'General', destination: 'General' }
        });
        setContent(res.data.data?.content || '');
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        setContent('');
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [type]);

  const handleSave = async () => {
    try {
      await axios.post(`${API_BASE}/api/policies`, {
        type,
        category: 'General',
        destination: 'General',
        content: content
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setIsEditing(false);
      toast.success(`${title} updated successfully!`);
    } catch (error) {
      console.error("Save error:", error);
      toast.error(`Failed to save ${title}`);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'clean']
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              {icon}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">{title}</h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Manage Site Policies</p>
            </div>
          </div>
          <ProfileButton />
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[600px] flex flex-col">
          <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              <h2 className="font-black text-slate-800 uppercase tracking-[0.2em] text-[10px]">Content Editor</h2>
            </div>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-sm active:scale-95 ${
                isEditing 
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200' 
                : 'bg-white text-slate-400 hover:text-red-600 border border-slate-200'
              }`}
            >
              {isEditing ? <><HiSave size={16} /> Save Changes</> : <><HiPencil size={16} /> Edit Content</>}
            </button>
          </div>
          
          <div className="p-8 flex-1 flex flex-col">
            <div className={`quill-container flex-1 ${!isEditing ? 'quill-disabled' : ''}`}>
               <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                readOnly={!isEditing}
                placeholder={`Enter ${title} content here...`}
                className="h-[500px] mb-12"
              />
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .quill-disabled .ql-toolbar { display: none; }
        .quill-disabled .ql-container.ql-snow { border-top: 1px solid #f1f5f9 !important; border-radius: 1rem; }
        .ql-container { font-size: 16px; border-bottom-left-radius: 1.5rem; border-bottom-right-radius: 1.5rem; border-color: #f1f5f9 !important; }
        .ql-toolbar { border-top-left-radius: 1.5rem; border-top-right-radius: 1.5rem; border-color: #f1f5f9 !important; background: #f8fafc; }
        .ql-editor { min-height: 400px; padding: 2rem; color: #334155; }
        .ql-editor.ql-blank::before { color: #cbd5e1; font-style: normal; }
      `}</style>
    </div>
  );
};

export default PolicyManager;
