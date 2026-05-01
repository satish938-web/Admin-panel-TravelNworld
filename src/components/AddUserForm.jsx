import React, { useState } from "react";
import ProfileButton from "./ProfileButton";
import { HiUsers } from "react-icons/hi2";

const AddUserForm = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting user data:", formData);
    // You can later replace this with your API call
  };

  return (
    <div className="w-full min-h-screen bg-white px-4 py-6 sm:px-8 rounded-2xl max-w-7xl mx-auto">
      {/* Header */}
      <header className="relative z-10 bg-white/90 backdrop-blur-xl border border-[rgba(37,99,235,0.2)] rounded-2xl shadow-md mb-6 px-6 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div className="flex items-center text-red-600 text-2xl font-bold gap-4">
          <HiUsers className="text-[#2563eb] text-3xl" />
          <span className="text-3xl font-bold">Add User</span>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <ProfileButton />
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: First Name & Last Name */}
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          <div className="flex flex-col w-full max-w-md">
            <label htmlFor="firstname" className="text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              placeholder="Enter first name"
              required
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex flex-col w-full max-w-md">
            <label htmlFor="lastname" className="text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              placeholder="Enter last name"
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Row 2: Email */}
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          <div className="flex flex-col w-full max-w-md">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter user email"
              required
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex flex-col w-full max-w-md">
            <label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Row 3: Password */}
        <div className="flex flex-col w-full max-w-md">
          <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter secure password"
            required
            className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="cursor-pointer bg-red-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-red-700 transition w-full max-w-md"
        >
          Save User
        </button>
      </form>
    </div>
  );
};

export default AddUserForm;
