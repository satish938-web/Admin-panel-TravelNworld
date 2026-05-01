import React, { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { FaCalendarAlt, FaFileExport, FaEye, FaDownload } from "react-icons/fa";
import { MdPeopleAlt } from "react-icons/md";
import { TbCategoryFilled } from "react-icons/tb";
import ProfileButton from "./ProfileButton";

const ExportData = () => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exportType, setExportType] = useState("employees");
  const [selectedFields, setSelectedFields] = useState([]);
  const [exportFormat, setExportFormat] = useState("pdf");

  const dataFields = [
    "Employee Id",
    "Full Name",
    "Email",
    "Address",
    "Phone Number",
    "Join Date",
    "Department",
    "Role",
  ];

  const handleFieldChange = (fieldValue) => {
    setSelectedFields((prev) =>
      prev.includes(fieldValue)
        ? prev.filter((f) => f !== fieldValue)
        : [...prev, fieldValue]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      dateFrom,
      dateTo,
      exportType,
      selectedFields,
      exportFormat,
    };
    console.log("Form Data Submitted:", formData);
    alert("Form data logged in console.");
  };

  return (
    <div className="w-full min-h-screen bg-white px-4 py-6 sm:px-8 rounded-2xl max-w-7xl mx-auto">
      {/* Header with shadow */}
      <div className="bg-white/90 backdrop-blur-[15px] p-4 sm:p-6 rounded-[20px] border border-red-600/20 mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        {/* Left: Icon and Title */}
        <div className="flex items-center gap-3 sm:gap-4 text-red-600 text-xl sm:text-2xl lg:text-[2rem] font-bold">
          <IoSettingsSharp className="text-[1.8rem] sm:text-[2rem]" />
          <h1>Export Configuration</h1>
        </div>

        {/* Right: Profile Button */}
        <div className="flex items-center gap-3 z-10 sm:gap-4">
          <ProfileButton />
        </div>
      </div>

      {/* Form */}
      <form className="pt-10 px-2 sm:px-5" onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6 lg:gap-12 w-full">
          {/* Date Range Section */}
          <div className="flex flex-col gap-3 w-full lg:w-1/2">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-xl text-gray-600" />
              <h2 className="font-semibold text-xl text-gray-800">
                Date Range
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-2">
              <input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 w-full sm:w-auto flex-grow"
              />
              <span className="text-gray-500 font-medium select-none">to</span>
              <input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 w-full sm:w-auto flex-grow"
              />
            </div>
          </div>

          {/* Export Type Dropdown */}
          <div className="flex flex-col gap-2 w-full lg:w-1/2">
            <label
              htmlFor="export-type"
              className="text-gray-700 font-medium flex items-center gap-2"
            >
              <MdPeopleAlt className="text-xl text-gray-600" />
              Select Export Type
            </label>
            <select
              id="export-type"
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="employees">All Employees</option>
              <option value="agents">All Agents</option>
            </select>
          </div>
        </div>

        <div className="pt-10">
          <div className="flex items-center gap-2 mb-4">
            <TbCategoryFilled className="text-xl text-gray-600" />
            <h2 className="text-2xl font-semibold capitalize text-gray-600">
              Select Data Fields to Include
            </h2>
          </div>

          {/* Checkbox list for data fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {dataFields.map((field) => {
              const fieldValue = field.toLowerCase().replace(/\s+/g, "_");
              return (
                <label
                  key={field}
                  className="flex items-center gap-2 cursor-pointer text-gray-700 border border-gray-300 rounded-md shadow-sm p-3"
                >
                  <input
                    type="checkbox"
                    name="dataFields"
                    value={fieldValue}
                    checked={selectedFields.includes(fieldValue)}
                    onChange={() => handleFieldChange(fieldValue)}
                    className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                  />
                  <span className="select-none">{field}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="pt-10">
          <div className="flex items-center gap-2 mb-4">
            <FaFileExport className="text-xl text-gray-600" />
            <h2 className="capitalize text-2xl font-semibold  text-gray-600">
              Export Format
            </h2>
          </div>
          <select
            id="export-format"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
          </select>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-6">
            <button
              type="button"
              className="border-2 border-red-600 flex items-center justify-center gap-2 rounded-md shadow-sm text-red-600 cursor-pointer px-6 py-2 font-semibold transform transition-transform duration-300 hover:scale-105 w-full sm:w-auto"
              onClick={() => alert("Preview clicked!")}
            >
              <FaEye className="text-red-600" />
              Preview Data
            </button>

            <button
              type="submit"
              className="border-2 text-white bg-gradient-to-r from-red-600 to-red-600 flex items-center justify-center gap-2 rounded-md shadow-sm cursor-pointer px-6 py-2 font-semibold transform transition-transform duration-300 hover:scale-105 w-full sm:w-auto"
            >
              <FaDownload className="text-white" />
              Export Data
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ExportData;
