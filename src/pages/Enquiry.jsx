import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import ProfileButton from './ProfileButton';

const Enquiry = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [homeEnquiries, setHomeEnquiries] = useState([]);
  const [contactEnquiries, setContactEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const homeRes = await axios.get('http://localhost:5000/api/enquiries', { headers });
      if (homeRes.data.success) setHomeEnquiries(homeRes.data.data);

      const contactRes = await axios.get('http://localhost:5000/api/contacts', { headers });
      if (contactRes.data.success) setContactEnquiries(contactRes.data.data);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, type) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const endpoint = type === 'home' ? `http://localhost:5000/api/enquiries/${id}` : `http://localhost:5000/api/contacts/${id}`;
        
        await axios.delete(endpoint, { headers: { Authorization: `Bearer ${token}` } });
        if (type === 'home') setHomeEnquiries(homeEnquiries.filter(i => i._id !== id));
        else setContactEnquiries(contactEnquiries.filter(i => i._id !== id));
        
        Swal.fire('Deleted!', 'Inquiry has been removed.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete.', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen w-full px-4 sm:px-8 py-6 bg-[#f8fafc]">
      <header className="bg-white/90 backdrop-blur-[15px] p-4 sm:p-6 rounded-[20px] border border-red-600/20 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="text-xl sm:text-2xl font-bold text-red-600 flex items-center gap-3">
          <i className="fas fa-question-circle"></i>
          <span>Manage Inquiries</span>
        </div>
        <ProfileButton />
      </header>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 bg-white p-2 rounded-2xl w-fit shadow-sm border border-gray-100">
        <button 
          onClick={() => setActiveTab('home')}
          className={`px-6 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'home' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Home Enquiries
        </button>
        <button 
          onClick={() => setActiveTab('contact')}
          className={`px-6 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'contact' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Contact Us
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading inquiries...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-red-50 text-red-600 font-semibold border-b border-red-100">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Company / Location</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Requirements / Message</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'home' ? homeEnquiries : contactEnquiries).map((item) => (
                  <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-800">{item.name || item.firstName}</td>
                    <td className="py-4 px-6 text-gray-600">{item.company_name || item.lastName || item.location || "N/A"}</td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-800 font-medium">{item.email}</div>
                      <div className="text-xs text-gray-500">{item.phone}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="max-w-[300px] text-gray-600 truncate" title={item.your_requirements || item.description}>
                        {item.your_requirements || item.description}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => handleDelete(item._id, activeTab)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-all">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {(activeTab === 'home' ? homeEnquiries : contactEnquiries).length === 0 && (
                  <tr><td colSpan="5" className="p-12 text-center text-gray-500">No inquiries found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Enquiry;
