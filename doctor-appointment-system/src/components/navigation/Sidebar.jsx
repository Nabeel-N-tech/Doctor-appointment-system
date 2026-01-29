import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

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

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const links = linksByRole[user.role] || [];

  return (
    <>
      {/* Overlay (mobile) */}
      <div
        className={`
          fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 z-50
          h-screen w-[18rem] shrink-0
          bg-white shadow-2xl border-l border-slate-100
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          md:hidden
          flex flex-col
          overflow-hidden
        `}
      >
        {/* Mobile Header (Close Button) */}
        <div className="p-6 flex justify-between items-center border-b border-slate-100 bg-white">
          <div>
            <span className="font-black text-xl text-slate-800 tracking-tight">Menu</span>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Navigation</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 mt-2">Main Menu</p>
          {links.map((link) => {
            const isActive = location.pathname === link.path ||
              (link.path !== '/' && location.pathname.startsWith(link.path));

            return (
              <Link
                key={link.label}
                to={link.path}
                className={`
                  flex items-center gap-4 px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200 group relative overflow-hidden
                  ${isActive
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                    : "text-slate-500 hover:bg-white hover:text-teal-700 hover:shadow-md hover:shadow-slate-200/50"}
                `}
                onClick={onClose}
              >
                <span className="tracking-wide pl-1">{link.label}</span>
                {isActive && (
                  <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile-Only Account Actions */}
        <div className="md:hidden px-6 py-6 border-t border-slate-100 space-y-2 bg-slate-50/50">
          <p className="px-1 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Account</p>
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl text-slate-600 hover:bg-white hover:shadow-sm transition-all pl-5"
            onClick={onClose}
          >
            <span>My Profile</span>
          </Link>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all text-left pl-5"
          >
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
