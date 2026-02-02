import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAllUsers } from "../../api/users.api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function ManageUsers() {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    // Set initial filter from dashboard click if present
    if (location.state?.role) {
      setFilterRole(location.state.role);
    }
    fetchUsers();
  }, [location.state]);

  const fetchUsers = () => {
    getAllUsers()
      .then(setUsers)
      .catch((err) => {
        if (err.message.includes("401") || err.message.toLowerCase().includes("unauthorized")) {
          // Token likely expired
          localStorage.clear();
          window.location.href = "/login";
        }
      })
      .finally(() => setLoading(false));
  };

  // Filter logic
  const filteredUsers = filterRole === "all"
    ? users
    : users.filter(user => user.role === filterRole);

  const tabs = [
    { id: "all", label: "All Users" },
    { id: "admin", label: "Admins" },
    { id: "doctor", label: "Doctors" },
    { id: "staff", label: "Staff" },
    { id: "patient", label: "Patients" },
  ];

  const handleAddUserClick = () => {
    // Navigate to Add User page with filter context
    const initialRole = filterRole !== 'all' && filterRole !== 'patient' ? filterRole : 'doctor';
    navigate('/users/add', { state: { role: initialRole } });
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading users...</div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Users</h1>
          <p className="text-slate-500 font-medium mt-1">View and manage system users across all roles.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          <span className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 shadow-sm">
            {filteredUsers.length} Active Accounts
          </span>
          <Button onClick={handleAddUserClick} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-black shadow-lg hover:-translate-y-0.5 transition-all flex-grow md:flex-grow-0 justify-center">
            + Add New User
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterRole(tab.id)}
            className={`
                      px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap
                      ${filterRole === tab.id
                ? "bg-white text-teal-600 border-b-2 border-teal-600"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}
                  `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filterRole === 'doctor' ? (
          // Grouped by Specialization for Doctors
          Object.entries(
            filteredUsers.reduce((acc, user) => {
              // Normalize Specialization: trim whitespace and use Title Case logic if needed, 
              // but mostly just ensure direct string matching works by trimming
              let spec = user.specialization ? user.specialization.trim() : 'Unassigned';

              // Capitalize first letter of each word to ensure consistent casing (e.g., "cardiology" vs "Cardiology")
              spec = spec.replace(/\b\w/g, l => l.toUpperCase());

              if (!acc[spec]) acc[spec] = [];
              acc[spec].push(user);
              return acc;
            }, {})
          ).map(([spec, groupUsers]) => (
            <div key={spec} className="space-y-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                {spec}
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full normal-case">{groupUsers.length}</span>
              </h3>
              <div className="grid gap-3">
                {groupUsers.map(user => (
                  <UserCard key={user.id} user={user} navigate={navigate} />
                ))}
              </div>
            </div>
          ))
        ) : (
          // Standard List for others
          <div className="grid gap-3">
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-slate-400">No users found in this category.</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} navigate={navigate} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function UserCard({ user, navigate }) {
  return (
    <div
      onClick={() => navigate(`/users/${user.id}`, { state: { user } })}
      className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className={`
              w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white font-bold capitalize shrink-0 text-xl shadow-md
              ${user.role === 'admin' ? 'bg-purple-500 shadow-purple-200' :
            user.role === 'doctor' ? 'bg-teal-500 shadow-teal-200' :
              user.role === 'staff' ? 'bg-orange-500 shadow-orange-200' : 'bg-blue-500 shadow-blue-200'}
          `}>
          {user.username[0]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-800 text-lg truncate group-hover:text-teal-700 transition-colors">
            {user.role === 'doctor' ? `Dr. ${user.username}` : user.username}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${user.role === 'admin' ? 'text-purple-600 bg-purple-50 border-purple-100' :
              user.role === 'doctor' ? 'text-teal-600 bg-teal-50 border-teal-100' :
                user.role === 'staff' ? 'text-orange-600 bg-orange-50 border-orange-100' : 'text-blue-600 bg-blue-50 border-blue-100'
              }`}>
              {user.role}
            </span>
            <span className="text-slate-300 text-xs hidden sm:inline">•</span>
            <p className="text-xs text-slate-400 truncate font-medium">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-50">
        <div className="hidden md:block">
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100 uppercase tracking-widest">
            Active
          </span>
        </div>
        <button
          className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/users/${user.id}`, { state: { user } });
          }}
        >
          Manage Profile
        </button>
      </div>
    </div>
  );
}
