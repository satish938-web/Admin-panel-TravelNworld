import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom"
import logo from "../assets/image/logo.jpeg";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownState, setDropdownState] = useState({
    admin: false,
    itineraries: false,
    bannerAds: false,
    agent: false,
    destinations: false,
    testimonials: false,
    blog: false,
    terms: false,
    home: false,
  });

  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      // Call  backend logout route
      const response = await fetch('/api/auth/logout', { // Adjust URL to your API path
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // If using Bearer tokens
        }
      });

      if (response.ok) {
        // 2. Clear local storage/session storage
        localStorage.removeItem('token'); // Or whatever key you use
        localStorage.removeItem('user');

        // 3. Redirect to login page
        navigate('/login');
      }
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback: clear local data and redirect anyway
      localStorage.clear();
      navigate('/login');
    }
  }

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-rotate {
          animation: rotate 3s linear infinite;
        }

        .nav-link-before {
          position: relative;
          overflow: hidden;
        }

        .nav-link-before::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, rgb(220, 38, 38), rgb(220, 38, 38));
          opacity: 0.1;
          transition: left 0.3s ease;
        }

        .nav-link-before:hover::before {
          left: 0;
        }

        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar-scroll::-webkit-scrollbar-track {
          background: rgba(220, 38, 38, 0.05);
          border-radius: 10px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(220, 38, 38, 0.3);
          border-radius: 10px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(220, 38, 38, 0.5);
        }

        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(220, 38, 38, 0.3) rgba(220, 38, 38, 0.05);
        }
      `}</style>

      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        rel="stylesheet"
      />

      <aside
        className={`
          sidebar-scroll
          fixed top-0 left-0 w-[280px] h-screen
          bg-white/95 backdrop-blur-[15px] 
          border-r border-red-600/20 
          z-[1000] 
          transition-transform duration-300 ease-in-out
          shadow-[2px_0_20px_rgba(0,0,0,0.1)]
          overflow-y-auto overflow-x-hidden
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
        id="sidebar"
      >
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-[15px] p-4 sm:p-6 border-b border-red-600/20 text-center">
          <div className="flex items-center justify-center mb-1">
            <img src={logo} alt="TravelnWorld Logo" className="h-12 w-auto object-contain" />
          </div>
          <div className="text-xs sm:text-sm text-gray-500 font-bold uppercase tracking-widest">
            Super Admin Dashboard
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="py-4 pb-8">
          {/* Dashboard */}
          <div className="mx-4 my-1">
            <Link
              to="/"
              className={`
                nav-link-before
                flex items-center gap-3 px-5 py-2.5
                text-gray-800 no-underline rounded-xl
                transition-all duration-300
                ${isActive("/")
                  ? "bg-gradient-to-r from-red-600/10 to-red-600/10 text-red-600 shadow-[0_4px_15px_rgba(220,38,38,0.2)]"
                  : "hover:bg-red-600/10 hover:text-red-600 hover:translate-x-1"
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fas fa-tachometer-alt text-base w-5 text-center"></i>
              <span className="text-[13px] sm:text-sm">Dashboard</span>
            </Link>
          </div>

          {/* User Dropdown */}
          <div className="mx-4 my-1">
            <div
              className="nav-link-before flex items-center justify-between px-5 py-2.5 text-gray-800 rounded-xl transition-all duration-300 cursor-pointer hover:bg-red-600/10 hover:text-red-600 hover:translate-x-1"
              onClick={() =>
                setDropdownState((prev) => ({
                  ...prev,
                  admin: !prev.admin,
                }))
              }
            >
              <div className="flex items-center gap-3">
                <i className="fas fa-user-shield text-base w-5 text-center"></i>
                <span className="text-[13px] sm:text-sm">Admin Management</span>
              </div>
              <i
                className={`fas fa-chevron-right text-xs sm:text-sm transition-transform duration-300 ${dropdownState.admin ? "rotate-90" : ""
                  }`}
              ></i>
            </div>
            <div
              className={`pl-6 overflow-hidden transition-all duration-300 ${dropdownState.admin ? "max-h-[500px]" : "max-h-0"
                }`}
            >
              <Link
                to="/allusers"
                className={`block px-6 py-2 my-1 text-xs sm:text-sm rounded-lg transition-all duration-200 no-underline ${isActive("/allusers")
                    ? "text-red-600 bg-red-600/10 font-medium"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-600/10"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                All admin
              </Link>
              <Link
                to="/adduser"
                className={`block px-6 py-2 my-1 text-xs sm:text-sm rounded-lg transition-all duration-200 no-underline ${isActive("/adduser")
                    ? "text-red-600 bg-red-600/10 font-medium"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-600/10"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                Add admin
              </Link>
            </div>
          </div>

          {/* Agent Dropdown */}
          <div className="mx-4 my-1">
            <div
              className="nav-link-before flex items-center justify-between px-6 py-4 text-gray-800 rounded-xl transition-all duration-300 cursor-pointer hover:bg-red-600/10 hover:text-red-600 hover:translate-x-1"
              onClick={() =>
                setDropdownState((prev) => ({
                  ...prev,
                  agent: !prev.agent,
                }))
              }
            >
              <div className="flex items-center gap-4">
                <i className="fas fa-users text-base w-5 text-center"></i>
                <span className="text-[13px] sm:text-sm">Agent</span>
              </div>
              <i
                className={`fas fa-chevron-right text-xs sm:text-sm transition-transform duration-300 ${dropdownState.agent ? "rotate-90" : ""
                  }`}
              ></i>
            </div>
            <div
              className={`pl-6 overflow-hidden transition-all duration-300 ${dropdownState.agent ? "max-h-[500px]" : "max-h-0"
                }`}
            >
              <Link
                to="/allagents"
                className={`block px-6 py-3 my-1 text-sm sm:text-base rounded-lg transition-all duration-200 no-underline ${isActive("/allagents")
                    ? "text-red-600 bg-red-600/10 font-medium"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-600/10"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                All Agents
              </Link>
              <Link
                to="/addagent"
                className={`block px-6 py-3 my-1 text-sm sm:text-base rounded-lg transition-all duration-200 no-underline ${isActive("/addagent")
                    ? "text-red-600 bg-red-600/10 font-medium"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-600/10"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                Add Agent
              </Link>
              <Link
                to="/manage-agent-content"
                className={`block px-6 py-3 my-1 text-sm sm:text-base rounded-lg transition-all duration-200 no-underline ${isActive("/manage-agent-content")
                    ? "text-red-600 bg-red-600/10 font-medium"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-600/10"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                Additional Information
              </Link>
            </div>
          </div>

          {/* Itineraries Dropdown */}
          <div className="mx-4 my-1">
            <div
              className="nav-link-before flex items-center justify-between px-6 py-4 text-gray-800 rounded-xl transition-all duration-300 cursor-pointer hover:bg-red-600/10 hover:text-red-600 hover:translate-x-1"
              onClick={() =>
                setDropdownState((prev) => ({
                  ...prev,
                  itineraries: !prev.itineraries,
                }))
              }
            >
              <div className="flex items-center gap-4">
                <i className="fas fa-route text-base w-5 text-center"></i>
                <span className="text-[13px] sm:text-sm">Itineraries</span>
              </div>
              <i
                className={`fas fa-chevron-right text-xs sm:text-sm transition-transform duration-300 ${dropdownState.itineraries ? "rotate-90" : ""
                  }`}
              ></i>
            </div>
            <div
              className={`pl-6 overflow-hidden transition-all duration-300 ${dropdownState.itineraries ? "max-h-[500px]" : "max-h-0"
                }`}
            >
              <Link
                to="/itineraries"
                className={`block px-6 py-3 my-1 text-sm sm:text-base rounded-lg transition-all duration-200 no-underline ${isActive("/itineraries")
                    ? "text-red-600 bg-red-600/10 font-medium"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-600/10"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                All Itineraries
              </Link>
              <Link
                to="/additineraries"
                className={`block px-6 py-3 my-1 text-sm sm:text-base rounded-lg transition-all duration-200 no-underline ${isActive("/additineraries")
                    ? "text-red-600 bg-red-600/10 font-medium"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-600/10"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                Add Itinerary
              </Link>
            </div>
          </div>

          {/* Destinations Dropdown */}
          <div className="mx-4 my-1">
            <div
              className="nav-link-before flex items-center justify-between px-6 py-4 text-gray-800 rounded-xl transition-all duration-300 cursor-pointer hover:bg-red-600/10 hover:text-red-600 hover:translate-x-1"
              onClick={() =>
                setDropdownState((prev) => ({
                  ...prev,
                  destinations: !prev.destinations,
                }))
              }
            >
              <div className="flex items-center gap-4">
                <i className="fas fa-map-marker-alt text-base w-5 text-center"></i>
                <span className="text-[13px] sm:text-sm font-semibold">Destinations</span>
              </div>
              <i
                className={`fas fa-chevron-right text-xs sm:text-sm transition-transform duration-300 ${dropdownState.destinations ? "rotate-90" : ""
                  }`}
              ></i>
            </div>
            <div
              className={`pl-6 overflow-hidden transition-all duration-300 ${dropdownState.destinations ? "max-h-[500px]" : "max-h-0"
                }`}
            >
              <Link
                to="/create-destination"
                className={`flex items-center gap-3 px-6 py-3 my-1 text-sm sm:text-base rounded-lg transition-all duration-200 no-underline ${isActive("/create-destination")
                    ? "text-red-600 bg-red-600/10 font-medium"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-600/10"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <i className="fas fa-location-dot w-5 text-center"></i>
                <span>Create Destination</span>
              </Link>
              <Link
                to="/create-city"
                className={`flex items-center gap-3 px-6 py-3 my-1 text-sm sm:text-base rounded-lg transition-all duration-200 no-underline ${isActive("/create-city")
                    ? "text-red-600 bg-red-600/10 font-medium"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-600/10"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <i className="fas fa-city w-5 text-center"></i>
                <span>Create City</span>
              </Link>
            </div>
          </div>

          {/* Home Management Dropdown */}
          <div className="mx-4 my-1">
            <div
              className="nav-link-before flex items-center justify-between px-6 py-4 text-gray-800 rounded-xl transition-all duration-300 cursor-pointer hover:bg-red-600/10 hover:text-red-600 hover:translate-x-1"
              onClick={() =>
                setDropdownState((prev) => ({
                  ...prev,
                  home: !prev.home,
                }))
              }
            >
              <div className="flex items-center gap-4">
                <i className="fas fa-home text-base w-5 text-center"></i>
                <span className="text-[13px] sm:text-sm font-semibold">Home Management</span>
              </div>
              <i
                className={`fas fa-chevron-right text-xs sm:text-sm transition-transform duration-300 ${dropdownState.home ? "rotate-90" : ""
                  }`}
              ></i>
            </div>
            <div
              className={`pl-6 overflow-hidden transition-all duration-300 ${dropdownState.home ? "max-h-[800px]" : "max-h-0"
                }`}
            >
              <Link
                to="/hero-video"
                className={`flex items-center gap-3 px-6 py-3 my-1 text-sm sm:text-base rounded-lg transition-all duration-200 no-underline ${isActive("/hero-video")
                    ? "text-red-600 bg-red-600/10 font-bold"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-600/10"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <i className="fas fa-file-video w-5 text-center"></i>
                <span>Hero Video</span>
              </Link>
              
              <Link
                to="/customer-gallery"
                className={`flex items-center gap-3 px-6 py-3 my-1 text-sm sm:text-base rounded-lg transition-all duration-200 no-underline ${isActive("/customer-gallery")
                    ? "text-red-600 bg-red-600/10 font-bold"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-600/10"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <i className="fas fa-images w-5 text-center"></i>
                <span>Customer Gallery</span>
              </Link>

              <Link
                to="/testimonial-list"
                className={`flex items-center gap-3 px-6 py-3 my-1 text-sm sm:text-base rounded-lg transition-all duration-200 no-underline ${isActive("/testimonial-list")
                    ? "text-red-600 bg-red-600/10 font-bold shadow-[0_4px_15px_rgba(220,38,38,0.1)]"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-600/10"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <i className="fas fa-star w-5 text-center"></i>
                <span>Testimonials</span>
              </Link>

              {/* Legal / Terms items moved here */}
              <Link
                to="/privacy-policy"
                className={`flex items-center gap-3 px-6 py-3 my-1 text-sm sm:text-base rounded-lg transition-all duration-200 no-underline ${isActive("/privacy-policy")
                    ? "text-red-600 bg-red-600/10 font-bold"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-600/10"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <i className="fas fa-user-shield w-5 text-center"></i>
                <span>Privacy Policy</span>
              </Link>
              <Link
                to="/terms-of-use"
                className={`flex items-center gap-3 px-6 py-3 my-1 text-sm sm:text-base rounded-lg transition-all duration-200 no-underline ${isActive("/terms-of-use")
                    ? "text-red-600 bg-red-600/10 font-bold"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-600/10"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <i className="fas fa-file-contract w-5 text-center"></i>
                <span>Terms of Use</span>
              </Link>
            </div>
          </div>


          {/* Blog Dropdown */}
          <div className="mx-4 my-1">
            <div
              className="nav-link-before flex items-center justify-between px-6 py-4 text-gray-800 rounded-xl transition-all duration-300 cursor-pointer hover:bg-red-600/10 hover:text-red-600 hover:translate-x-1"
              onClick={() =>
                setDropdownState((prev) => ({
                  ...prev,
                  blog: !prev.blog,
                }))
              }
            >
              <div className="flex items-center gap-4">
                <i className="fas fa-blog text-base w-5 text-center"></i>
                <span className="text-[13px] sm:text-sm font-semibold">Blog</span>
              </div>
              <i
                className={`fas fa-chevron-right text-xs sm:text-sm transition-transform duration-300 ${dropdownState.blog ? "rotate-90" : ""
                  }`}
              ></i>
            </div>
            <div
              className={`pl-6 overflow-hidden transition-all duration-300 ${dropdownState.blog ? "max-h-[500px]" : "max-h-0"
                }`}
            >
              <Link
                to="/create-blog"
                className={`flex items-center gap-3 px-6 py-3 my-1 text-sm sm:text-base rounded-lg transition-all duration-200 no-underline ${isActive("/create-blog")
                    ? "text-red-600 bg-red-600/10 font-medium"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-600/10"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <i className="fas fa-pen w-5 text-center"></i>
                <span>Create Blog</span>
              </Link>
              <Link
                to="/blogs-list"
                className={`flex items-center gap-3 px-6 py-3 my-1 text-sm sm:text-base rounded-lg transition-all duration-200 no-underline ${isActive("/blogs-list")
                    ? "text-red-600 bg-red-600/10 font-medium"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-600/10"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <i className="fas fa-list-ul w-5 text-center"></i>
                <span>Blogs List</span>
              </Link>
            </div>
          </div>



          {/* Team Management */}
          <div className="mx-4 my-1">
            <a
              href="manage-team.html"
              className="nav-link-before flex items-center gap-4 px-6 py-4 text-gray-800 no-underline rounded-xl transition-all duration-300 hover:bg-red-600/10 hover:text-red-600 hover:translate-x-1"
            >
              <i className="fas fa-user-friends text-base w-5 text-center"></i>
              <span className="text-[13px] sm:text-sm">Team Management</span>
            </a>
          </div>
          {/* Banners */}
          <div className="mx-4 my-1">
            <div
              className="nav-link-before flex items-center justify-between px-6 py-4 text-gray-800 rounded-xl transition-all duration-300 cursor-pointer hover:bg-red-600/10 hover:text-red-600 hover:translate-x-1"
              onClick={() =>
                setDropdownState((prev) => ({
                  ...prev,
                  bannerAds: !prev.bannerAds,
                }))
              }
            >
              <div className="flex items-center gap-4">
                <i className="fas fa-ad text-base w-5 text-center"></i>
                <span className="text-[13px] sm:text-sm">Banner Ads</span>
              </div>
              <i
                className={`fas fa-chevron-right text-xs sm:text-sm transition-transform duration-300 ${dropdownState.bannerAds ? "rotate-90" : ""
                  }`}
              ></i>
            </div>

            <div
              className={`pl-6 overflow-hidden transition-all duration-300 ${dropdownState.bannerAds ? "max-h-[500px]" : "max-h-0"
                }`}
            >
              <Link
                to="/topbanner"
                className={`block px-6 py-3 my-1 text-sm sm:text-base rounded-lg transition-all duration-200 no-underline ${isActive("/bannerads/home-top")
                    ? "text-red-600 bg-red-600/10 font-medium"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-600/10"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                Home Top Banner
              </Link>

              <Link
                to="/bannerads/manage"
                className={`block px-6 py-3 my-1 text-sm sm:text-base rounded-lg transition-all duration-200 no-underline ${isActive("/bannerads/manage")
                    ? "text-red-600 bg-red-600/10 font-medium"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-600/10"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                Manage Banner Ads
              </Link>
            </div>
          </div>

          {/* Export PDF */}
          <div className="mx-4 my-1">
            <Link
              to="/exportdata"
              className={`
                nav-link-before
                flex items-center gap-4 px-6 py-4
                text-gray-800 no-underline rounded-xl
                transition-all duration-300
                ${isActive("/exportdata")
                  ? "bg-gradient-to-r from-red-600/10 to-red-600/10 text-red-600 shadow-[0_4px_15px_rgba(37,99,235,0.2)]"
                  : "hover:bg-red-600/10 hover:text-red-600 hover:translate-x-1"
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fas fa-file-pdf text-base w-5 text-center"></i>
              <span className="text-[13px] sm:text-sm">Export PDF</span>
            </Link>
          </div>

          {/* Inquiries */}
          <div className="mx-4 my-1">
            <Link
              to="/enquries"
              className={`
                nav-link-before
                flex items-center gap-4 px-6 py-4
                text-gray-800 no-underline rounded-xl
                transition-all duration-300
                ${isActive("/enquries")
                  ? "text-red-600 bg-red-600/10 font-bold shadow-[0_4px_15px_rgba(220,38,38,0.1)]"
                  : "hover:bg-red-600/10 hover:text-red-600 hover:translate-x-1"
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fas fa-question-circle text-base w-5 text-center"></i>
              <span className="text-[13px] sm:text-sm font-semibold">Inquiries</span>
            </Link>
          </div>

          {/* Global Review Management (SuperAdmin Only) */}
          {JSON.parse(localStorage.getItem("user"))?.role === "SUPERADMIN" && (
            <div className="mx-4 my-1">
              <Link
                to="/reviews"
                className={`
                  nav-link-before
                  flex items-center gap-4 px-6 py-4
                  text-gray-800 no-underline rounded-xl
                  transition-all duration-300
                  ${isActive("/reviews")
                    ? "text-red-600 bg-red-600/10 font-bold shadow-[0_4px_15px_rgba(220,38,38,0.1)]"
                    : "hover:bg-red-600/10 hover:text-red-600 hover:translate-x-1"
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <i className="fas fa-comment-dots text-base w-5 text-center"></i>
                <span className="text-[13px] sm:text-sm font-semibold">Global Reviews</span>
              </Link>
            </div>
          )}

          {/* Logout */}
          <div className="mx-4 my-1">
            <button
              onClick={handleLogout}
              className="w-full nav-link-before flex items-center gap-4 px-6 py-4 text-gray-800 no-underline rounded-xl transition-all duration-300 hover:bg-red-600/10 hover:text-red-600 hover:translate-x-1"
            >
              <i className="fas fa-sign-out-alt text-base w-5 text-center"></i>
              <span className="text-[13px] sm:text-sm">Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
