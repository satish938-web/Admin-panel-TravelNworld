import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../utils/api';
import Swal from 'sweetalert2';
import ProfileButton from './ProfileButton';

const Enquiry = () => {
  const [activeTab, setActiveTab] = useState('home'); // 'home' or 'contact'
  const [homeEnquiries, setHomeEnquiries] = useState([]);
  const [contactEnquiries, setContactEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  
  // Get user info to check role
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAgent = user.role === 'AGENT';
  const isSuperAdmin = user.role === 'SUPERADMIN';

  const fetchAgents = async () => {
    if (!isSuperAdmin) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/api/agents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAgents(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch Home Page Enquiries / Leads
      let enquiryEndpoint = isAgent ? `${API_BASE}/api/enquiries/my-leads` : `${API_BASE}/api/enquiries`;
      if (selectedAgentId && !isAgent) {
        enquiryEndpoint += `?agentId=${selectedAgentId}`;
      }

      const homeRes = await axios.get(enquiryEndpoint, { headers });
      if (homeRes.data.success) {
        setHomeEnquiries(homeRes.data.data);
      }

      // Fetch Contact Us Inquiries (Only if not agent, or if you want agents to see them too)
      if (!isAgent) {
        const contactRes = await axios.get(`${API_BASE}/api/contacts`, { headers });
        if (contactRes.data.success) {
          setContactEnquiries(contactRes.data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchData();
  }, [selectedAgentId]);

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
        const endpoint = type === 'home' ? `${API_BASE}/api/enquiries/${id}` : `${API_BASE}/api/contacts/${id}`;

        await axios.delete(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (type === 'home') {
          setHomeEnquiries(homeEnquiries.filter(item => item._id !== id));
        } else {
          setContactEnquiries(contactEnquiries.filter(item => item._id !== id));
        }

        Swal.fire('Deleted!', 'Inquiry has been removed.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete inquiry.', 'error');
      }
    }
  };

  const currentData = activeTab === 'home' ? homeEnquiries : contactEnquiries;

  return (
    <div className="min-h-screen w-full px-4 sm:px-8 py-6 bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-[15px] p-4 sm:p-6 rounded-[20px] border border-red-600/20 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm relative z-10">
        <div className="text-xl sm:text-2xl lg:text-[2rem] font-bold text-red-600 flex items-center gap-3 sm:gap-4">
          <i className="fas fa-question-circle"></i>
          <span>Inquiries Management</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <ProfileButton />
        </div>
      </header>

      {/* Tabs & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex gap-4 bg-white p-2 rounded-2xl w-fit shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'home' ? 'bg-red-600 text-white shadow-lg scale-105' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <i className="fas fa-home mr-2"></i> Home Queries
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'contact' ? 'bg-red-600 text-white shadow-lg scale-105' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <i className="fas fa-envelope mr-2"></i> Contact Us
          </button>
        </div>

        {/* Agent Filter for Super Admin */}
        {isSuperAdmin && activeTab === 'home' && (
          <div className="flex items-center gap-4 bg-white p-3 px-6 rounded-2xl shadow-sm border border-red-100">
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
              <i className="fas fa-filter mr-2 text-red-600"></i> Filter By Agent:
            </span>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="bg-red-50 border-none text-red-600 font-bold text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-red-600/20 min-w-[200px]"
            >
              <option value="">All Agents / Global</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.firstName} {agent.lastName} ({agent.company || 'Individual'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {loading ? (
          <div className="p-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Fetching inquiries...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-red-50 text-red-600 font-semibold border-b border-red-100">
                  <th className="py-5 px-6">User Details</th>
                  <th className="py-5 px-6">Package / Destination</th>
                  <th className="py-5 px-6">Inquiry Details</th>
                  <th className="py-5 px-6">Date</th>
                  <th className="py-5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item) => (
                  <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <td className="py-5 px-6">
                      <div className="font-bold text-gray-800">{item.name || item.firstName}</div>
                      <div className="text-sm text-gray-500">{item.email}</div>
                      <div className="text-xs text-red-500 font-medium">{item.phone}</div>
                    </td>
                    <td className="py-5 px-6 text-gray-600">
                      {item.itineraryTitle ? (
                        <div className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-xs font-bold inline-block border border-red-100">
                          {item.itineraryTitle}
                        </div>
                      ) : (
                        <div className="font-medium">{item.company_name || item.lastName || "Individual"}</div>
                      )}
                      <div className="text-xs mt-1 text-gray-400">{item.location || "N/A"}</div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="max-w-[400px] text-gray-700 text-sm leading-relaxed" title={item.your_requirements || item.description}>
                        {item.your_requirements || item.description}
                      </div>
                    </td>
                    <td className="py-5 px-6 text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-5 px-6 text-center">
                      <button
                        onClick={() => handleDelete(item._id, activeTab)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-full transition-all"
                        title="Delete Inquiry"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {currentData.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-20 text-center">
                      <i className="fas fa-inbox text-4xl text-gray-200 mb-4 block"></i>
                      <p className="text-gray-400">No {activeTab === 'home' ? 'home' : 'contact'} inquiries found.</p>
                    </td>
                  </tr>
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