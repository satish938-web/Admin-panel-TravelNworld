import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import ProfileButton from '../components/ProfileButton';

const ContactInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/contacts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        setInquiries(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching contact inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/contacts/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setInquiries(inquiries.filter(item => item._id !== id));
        Swal.fire('Deleted!', 'Inquiry has been deleted.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete inquiry.', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen w-full px-4 sm:px-8 py-6 bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-[15px] p-4 sm:p-6 rounded-[20px] border border-red-600/20 mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] relative z-10">
        <div className="text-xl sm:text-2xl lg:text-[2rem] font-bold text-red-600 flex items-center gap-3 sm:gap-4">
          <i className="fas fa-envelope-open-text"></i>
          <span>Contact Us Inquiries</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <ProfileButton />
        </div>
      </header>

      {/* Content */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading inquiries...</div>
        ) : inquiries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No contact inquiries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-red-50 text-red-600 font-semibold border-b border-red-100">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Company</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6">Message</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((item) => (
                  <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-800">{item.firstName}</td>
                    <td className="py-4 px-6 text-gray-600">{item.lastName || "N/A"}</td>
                    <td className="py-4 px-6 text-gray-600">{item.email}</td>
                    <td className="py-4 px-6 text-gray-600">{item.phone}</td>
                    <td className="py-4 px-6">
                      <div className="max-w-[300px] text-gray-600 truncate" title={item.description}>
                        {item.description}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => handleDelete(item._id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
                        title="Delete Inquiry"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactInquiries;
