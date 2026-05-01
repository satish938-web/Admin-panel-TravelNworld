import React, { useState, useEffect } from 'react';
import { HiDocumentText, HiSave, HiPencil } from 'react-icons/hi';
import ProfileButton from '../components/ProfileButton';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const PaymentTerms = () => {
  const [category, setCategory] = useState('Domestic');
  const [isEditing, setIsEditing] = useState(false);
  const [paymentContent, setPaymentContent] = useState('');

  // Fetch payment terms from backend
  useEffect(() => {
    const fetchPaymentTerms = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/policies`, {
          params: { type: 'payment', category }
        });
        setPaymentContent(res.data.data.content || '');
      } catch (error) {
        console.error("Error fetching payment terms:", error);
        setPaymentContent('');
      }
    };
    fetchPaymentTerms();
  }, [category]);

  const handleSave = async () => {
    try {
      await axios.post('http://localhost:5000/api/policies', {
        type: 'payment',
        category,
        destination: 'General',
        content: paymentContent
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setIsEditing(false);
      alert('Payment terms updated successfully!');
    } catch (error) {
      console.error("Save error:", error);
      alert('Failed to save payment terms');
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
            <h1 className="text-3xl font-bold text-slate-900">Payment Mode</h1>
            <p className="text-slate-500 mt-1">Select a category to view, edit, and manage its associated Payment Mode.</p>
          </div>
          <ProfileButton />
        </header>

        {/* Selection Area */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <label className="block text-sm font-bold text-slate-700 mb-4">Select Category</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="category"
                value="Domestic"
                checked={category === 'Domestic'}
                onChange={(e) => setCategory(e.target.value)}
                className="w-5 h-5 text-red-600 focus:ring-red-500 border-slate-300"
              />
              <span className="text-slate-600 font-medium group-hover:text-red-600 transition-colors">Domestic</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="category"
                value="International"
                checked={category === 'International'}
                onChange={(e) => setCategory(e.target.value)}
                className="w-5 h-5 text-red-600 focus:ring-red-500 border-slate-300"
              />
              <span className="text-slate-600 font-medium group-hover:text-red-600 transition-colors">International</span>
            </label>
          </div>
        </div>

        {/* Payment Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
          <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <HiDocumentText className="text-slate-400 text-xl" />
              <h2 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Associated Payment Mode</h2>
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
                value={paymentContent}
                onChange={setPaymentContent}
                modules={modules}
                readOnly={!isEditing}
                placeholder="Enter payment mode details here..."
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

export default PaymentTerms;

