import React, { useState, useEffect, useRef } from "react";
import { FaUser } from "react-icons/fa";
import axios from "axios";

const ProfileButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminData, setAdminData] = useState({ adminName: "Admin User", role: "Administrator", imageUrl: "" });
  const dropdownRef = useRef(null);
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin-settings/profile`);
      if (res.data.success && res.data.data) {
        setAdminData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch admin profile", err);
    }
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left z-[9999]" ref={dropdownRef}>
      {/* Avatar + Info */}
      <div
        className="flex items-center gap-3 cursor-pointer select-none"
        onClick={toggleDropdown}
      >
        <div className="rounded-full w-14 h-14 flex items-center justify-center bg-slate-100 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
          {adminData.imageUrl ? (
            <img src={adminData.imageUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center">
              <FaUser className="text-white text-2xl" />
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 leading-tight">
            {adminData.adminName}
          </h2>
          <p className="text-sm text-gray-600 font-medium">{adminData.role}</p>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999]">
          <ul className="py-2 text-gray-700">
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-md transition-colors duration-200">
              Profile
            </li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-md transition-colors duration-200">
              Change Password
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileButton;
