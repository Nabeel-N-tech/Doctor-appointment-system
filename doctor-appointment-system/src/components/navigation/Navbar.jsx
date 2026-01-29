import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import NotificationBell from "./NotificationBell";

const linksByRole = {
  patient: [
    { label: "Dashboard", path: "/" },
    { label: "History", path: "/history" },
    { label: "Lab Reports", path: "/lab-reports" },
    { label: "Book Appointment", path: "/book" },
  ],
  doctor: [
    { label: "Dashboard", path: "/" },
    { label: "Schedule", path: "/schedule" },
    { label: "Availability", path: "/availability" },
  ],
  admin: [
    { label: "Dashboard", path: "/" },
    { label: "Manage Users", path: "/users" },
    { label: "Appointments", path: "/appointments" },
  ],
  staff: [
    { label: "Dashboard", path: "/" },
    { label: "Create Report", path: "/create-report" },
  ],
};

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const currentLinks = user ? linksByRole[user.role] || [] : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-700 border-purple-200";
      case "doctor": return "bg-teal-100 text-teal-700 border-teal-200";
      case "staff": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const navLinks = [
    { name: "My Profile", path: "/profile" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm transition-all duration-300">
        <div className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">

          <div className="flex items-center gap-12">
            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-3.5 group relative z-50">
              <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                <span className="text-white font-black text-2xl tracking-tighter">H</span>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl text-slate-900 tracking-tight leading-none group-hover:text-teal-700 transition-colors">
                  HealthPortal
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5 group-hover:tracking-[0.25em] transition-all">
                  Medical System
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links - MOVED TO RIGHT SECTION */}
          </div>

          {/* Right Section */}
          {user && (
            <div className="flex items-center gap-2 sm:gap-6">

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center gap-1 mr-2">
                {currentLinks.map((link) => {
                  const isActive = location.pathname === link.path ||
                    (link.path !== '/' && location.pathname.startsWith(link.path));

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`
                      relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 group
                      ${isActive
                          ? "text-teal-700 bg-teal-50"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}
                    `}
                    >
                      <span className="flex items-center">
                        {link.label}
                      </span>
                      {isActive && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-500"></span>
                      )}
                    </Link>
                  );
                })}
              </div>

              <div className="hidden md:block">
                <NotificationBell />
              </div>

              {/* Mobile Sidebar Toggle (Hamburger) */}
              <button
                onClick={onMenuClick}
                className="md:hidden relative z-50 p-2 text-slate-500 hover:bg-slate-100/50 rounded-xl transition-all active:scale-95"
                aria-label="Toggle Menu"
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5">
                  <span className="block w-6 h-0.5 bg-slate-800 rounded-full transition-all"></span>
                  <span className="block w-4 h-0.5 bg-slate-800 rounded-full transition-all"></span>
                  <span className="block w-6 h-0.5 bg-slate-800 rounded-full transition-all"></span>
                </div>
              </button>

              {/* Desktop Profile Dropdown */}
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`
                    flex items-center gap-3 focus:outline-none group pl-1 pr-1 py-1 rounded-2xl transition-all duration-300 border
                    ${dropdownOpen ? 'bg-slate-50 border-slate-200 shadow-inner' : 'bg-transparent border-transparent hover:bg-slate-50'}
                  `}
                >
                  <div className="hidden lg:flex flex-col items-end mr-1">
                    <span className="text-sm font-bold text-slate-700 group-hover:text-teal-700 transition-colors">
                      {user.username}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider border ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
                    {user.username ? user.username[0].toUpperCase() : "U"}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-2 animate-fade-in-up origin-top-right transform z-50">
                    <div className="px-4 py-3 border-b border-slate-100/50 mb-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user.email || user.username}</p>
                    </div>

                    <div className="space-y-1">
                      {navLinks.map(link => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 rounded-xl hover:bg-teal-50 hover:text-teal-700 transition-all group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-teal-500 transition-colors"></span>
                          {link.name}
                        </Link>
                      ))}
                    </div>

                    <div className="border-t border-slate-100/50 mt-2 pt-2">
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors flex items-center gap-2 group"
                      >
                        <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
