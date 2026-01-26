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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Users</h1>
          <p className="text-slate-500">View and manage system users.</p>
        </div>
        <div className="flex gap-4 items-center">
          <span className="bg-slate-100 px-3 py-1 rounded-full text-sm font-medium text-slate-600">
            {filteredUsers.length} Users Found
          </span>
          <Button onClick={handleAddUserClick}>+ Add User</Button>
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
    <Card
      onClick={() => navigate(`/users/${user.id}`, { state: { user } })}
      className="flex justify-between items-center hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-teal-200 group p-4"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className={`
              w-12 h-12 rounded-full flex items-center justify-center text-white font-bold capitalize shrink-0 text-lg shadow-sm
              ${user.role === 'admin' ? 'bg-purple-500' :
            user.role === 'doctor' ? 'bg-teal-500' :
              user.role === 'staff' ? 'bg-orange-500' : 'bg-blue-500'}
          `}>
          {user.username[0]}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-800 truncate group-hover:text-teal-700 transition-colors text-base">
            {user.role === 'doctor' ? `Dr. ${user.username}` : user.username}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs font-bold uppercase tracking-wider ${user.role === 'admin' ? 'text-purple-600' :
              user.role === 'doctor' ? 'text-teal-600' :
                user.role === 'staff' ? 'text-orange-600' : 'text-blue-600'
              }`}>
              {user.role}
            </span>
            {user.role === 'doctor' && user.specialization && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">{user.specialization}</span>
              </>
            )}
            <span className="text-slate-300">•</span>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:block">
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">
            Active
          </span>
        </div>
        <Button
          variant="secondary"
          className="text-xs px-4 py-2 shadow-sm border border-slate-200 hover:border-slate-300"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/users/${user.id}`, { state: { user } });
          }}
        >
          Manage
        </Button>
      </div>
    </Card>
  );
}
