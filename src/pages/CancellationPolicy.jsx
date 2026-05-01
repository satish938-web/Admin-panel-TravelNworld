import React, { useState, useEffect } from 'react';
import { HiDocumentText, HiSave, HiPencil } from 'react-icons/hi';
import ProfileButton from '../components/ProfileButton';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const CancellationPolicy = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [policyContent, setPolicyContent] = useState('');

  // Fetch cancellation policy from backend
  useEffect(() => {
    const fetchCancellationPolicy = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/policies`, {
          params: { type: 'cancellation' }
        });
        setPolicyContent(res.data.data.content || '');
      } catch (error) {
        console.error("Error fetching cancellation policy:", error);
      }
    };
    fetchCancellationPolicy();
  }, []);

  const handleSave = async () => {
    try {
      await axios.post('http://localhost:5000/api/policies', {
        type: 'cancellation',
        category: 'General',
        destination: 'General',
        content: policyContent
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setIsEditing(false);
      alert('Cancellation policy updated successfully!');
    } catch (error) {
      console.error("Save error:", error);
      alert('Failed to save cancellation policy');
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

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Cancellation Policy Management</h1>
            <p className="text-slate-500 mt-1">View, edit, and manage the general cancellation policy.</p>
          </div>
          <ProfileButton />
        </header>

        {/* Policy Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
          <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <HiDocumentText className="text-slate-400 text-xl" />
              <h2 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Cancellation Policy Content</h2>
            </div>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all shadow-sm ${
                isEditing 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-slate-50 text-slate-400 hover:text-red-600'
              }`}
            >
              {isEditing ? <><HiSave /> Save</> : <><HiPencil /> Edit</>}
            </button>
          </div>
          
          <div className="p-8 flex-1 flex flex-col">
            <div className={`quill-container flex-1 ${!isEditing ? 'quill-disabled' : ''}`}>
              <ReactQuill
                theme="snow"
                value={policyContent}
                onChange={setPolicyContent}
                modules={modules}
                readOnly={!isEditing}
                placeholder="Enter cancellation policy details here..."
                className="h-[400px] mb-12"
              />
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .quill-disabled .ql-toolbar { display: none; }
        .quill-disabled .ql-container.ql-snow { border-top: 1px solid #ebeef5 !important; }
        .ql-container { font-size: 16px; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; }
        .ql-toolbar { border-top-left-radius: 12px; border-top-right-radius: 12px; }
      `}</style>
    </div>
  );
};

export default CancellationPolicy;

