import React, { useState } from "react";
import { HiUsers } from "react-icons/hi2";
import { HiPencil, HiTrash, HiEye } from "react-icons/hi";
import ProfileButton from "./ProfileButton";

const UserList = () => {
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const users = [
    {
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      phone: "+1 (555) 123-4567",
    },
    {
      name: "Bob Smith",
      email: "bob.smith@example.com",
      phone: "+1 (555) 987-6543",
    },
    {
      name: "Charlie Davis",
      email: "charlie.davis@example.com",
      phone: "+1 (555) 555-7890",
    },
    {
      name: "David Wilson",
      email: "david.wilson@example.com",
      phone: "+1 (555) 444-1234",
    },
  ];

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (value) => {
    setSearch(value);
    setShowSuggestions(false);
  };

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email} ${user.phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full px-4 sm:px-8 py-6 bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-[15px] p-4 sm:p-6 rounded-[20px] border border-red-600/20 mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] relative z-10">
        <div className="text-xl sm:text-2xl lg:text-[2rem] font-bold text-red-600 flex items-center gap-3 sm:gap-4">
          <HiUsers />
          <span>Admin</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <ProfileButton />
        </div>
      </header>

      {/* Search Input */}
      <div className="relative flex justify-end mb-6">
        <div className="w-full sm:w-1/3 relative">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            value={search}
            onChange={handleSearch}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            onFocus={() => search && setShowSuggestions(true)}
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && search.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-200 shadow-md rounded-md w-full mt-1 max-h-40 overflow-y-auto">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(user.name)}
                    className="px-4 py-2 hover:bg-red-50 cursor-pointer text-sm"
                  >
                    {user.name}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500 text-sm">
                  No users found
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Responsive Table/Card */}
      <div className="overflow-x-auto">
        {/* Table for md and above */}
        <table className="min-w-[600px] w-full bg-white rounded-2xl shadow-md hidden md:table">
          <thead>
            <tr className="bg-[linear-gradient(45deg,rgba(37,99,235,0.1),rgba(220,38,38,0.1))] text-[#2563eb]">
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Phone</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={index} className="hover:bg-gray-100 transition">
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.phone}</td>
                <td className="py-3 px-4 flex gap-3">
                  <button
                    className="text-red-600 hover:text-red-800 p-2 rounded"
                    aria-label={`View ${user.name}`}
                    onClick={() => alert(`View user: ${user.name}`)}
                  >
                    <HiEye size={20} className="cursor-pointer" />
                  </button>
                  <button
                    className="text-green-600 hover:text-green-800 p-2 rounded"
                    aria-label={`Edit ${user.name}`}
                    onClick={() => alert(`Edit user: ${user.name}`)}
                  >
                    <HiPencil size={20} className="cursor-pointer" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 p-2 rounded"
                    aria-label={`Delete ${user.name}`}
                    onClick={() => alert(`Delete user: ${user.name}`)}
                  >
                    <HiTrash size={20} className="cursor-pointer" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Card view for small screens */}
        <div className="flex flex-col space-y-4 md:hidden">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md p-4 flex flex-col space-y-2"
              >
                <div className="text-lg font-semibold text-[#2563eb]">
                  {user.name}
                </div>
                <div className="text-sm text-gray-700">
                  <strong>Email:</strong> {user.email}
                </div>
                <div className="text-sm text-gray-700">
                  <strong>Phone:</strong> {user.phone}
                </div>
                <div className="flex gap-4 mt-2">
                  <button
                    className="text-red-600 hover:text-red-800 p-2 rounded"
                    aria-label={`View ${user.name}`}
                    onClick={() => alert(`View user: ${user.name}`)}
                  >
                    <HiEye size={20} className="cursor-pointer" />
                  </button>
                  <button
                    className="text-green-600 hover:text-green-800 p-2 rounded"
                    aria-label={`Edit ${user.name}`}
                    onClick={() => alert(`Edit user: ${user.name}`)}
                  >
                    <HiPencil size={20} className="cursor-pointer" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 p-2 rounded"
                    aria-label={`Delete ${user.name}`}
                    onClick={() => alert(`Delete user: ${user.name}`)}
                  >
                    <HiTrash size={20} className="cursor-pointer" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              No users found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;
