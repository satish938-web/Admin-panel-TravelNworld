import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../utils/api';
import ProfileButton from '../components/ProfileButton';

const AgentLeads = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch all agents on mount
  useEffect(() => {
    const fetchAgents = async () => {
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
      } finally {
        setInitialLoading(false);
      }
    };
    fetchAgents();
  }, []);

  // Fetch leads when agent selection changes
  useEffect(() => {
    if (!selectedAgentId) {
      setLeads([]);
      return;
    }

    const fetchLeads = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/api/enquiries?agentId=${selectedAgentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setLeads(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching agent leads:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [selectedAgentId]);

  return (
    <div className="min-h-screen w-full px-4 sm:px-8 py-6 bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-[15px] p-4 sm:p-6 rounded-[2rem] border border-red-600/20 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm relative z-10">
        <div className="flex flex-col">
          <div className="text-xl sm:text-2xl lg:text-[2rem] font-black text-red-600 flex items-center gap-4">
            <i className="fas fa-user-tie"></i>
            <span>Agent Leads Master</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-1 ml-1">Monitor leads by individual travel partners</p>
        </div>
        <ProfileButton />
      </header>

      {/* Agent Selector Card */}
      <section className="bg-white rounded-[2rem] p-8 mb-8 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
               Select Agent To View Leads
            </label>
            <div className="relative">
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 font-bold text-lg rounded-2xl px-6 py-4 appearance-none outline-none focus:border-red-600/30 focus:ring-4 focus:ring-red-600/5 transition-all cursor-pointer"
              >
                <option value="">-- Choose an Agent --</option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.firstName} {agent.lastName} ({agent.company_name || 'Individual'})
                  </option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                 <i className="fas fa-chevron-down"></i>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-red-50 p-6 rounded-[1.5rem] border border-red-100 min-w-[200px]">
             <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-200">
                <i className="fas fa-bolt text-xl"></i>
             </div>
             <div>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Total Leads</p>
                <p className="text-3xl font-black text-slate-900">{leads.length}</p>
             </div>
          </div>
        </div>
      </section>

      {/* Leads Table */}
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
        {!selectedAgentId ? (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
               <i className="fas fa-mouse-pointer text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-400">Please select an agent to view their leads</h3>
          </div>
        ) : loading ? (
          <div className="p-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching Agent Data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="py-6 px-8 text-xs uppercase tracking-widest">Customer Information</th>
                  <th className="py-6 px-8 text-xs uppercase tracking-widest">Package Details</th>
                  <th className="py-6 px-8 text-xs uppercase tracking-widest">Requirements</th>
                  <th className="py-6 px-8 text-xs uppercase tracking-widest">Received Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((item) => (
                  <tr key={item._id} className="border-b border-slate-50 hover:bg-red-50/30 transition-colors">
                    <td className="py-6 px-8">
                      <div className="font-black text-slate-900 text-base">{item.name || item.firstName}</div>
                      <div className="text-sm text-slate-500 font-medium">{item.email}</div>
                      <div className="text-xs text-red-600 font-black mt-1 tracking-wider">{item.phone}</div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block shadow-sm">
                        {item.itineraryTitle || "Direct Inquiry"}
                      </div>
                      <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-tighter">Ref: {item._id.slice(-8).toUpperCase()}</p>
                    </td>
                    <td className="py-6 px-8">
                      <div className="max-w-[350px] text-slate-700 text-sm leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {item.your_requirements || item.description || "No specific requirements provided."}
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">{new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-20 text-center">
                      <div className="text-slate-300 mb-4">
                        <i className="fas fa-folder-open text-5xl"></i>
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No leads found for this agent yet.</p>
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

export default AgentLeads;
