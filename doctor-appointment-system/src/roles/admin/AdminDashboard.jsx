import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllUsers } from "../../api/users.api";
import { getAppointments } from "../../api/appointments.api";
import { useAuth } from "../../auth/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    doctors: 0,
    patients: 0,
    appointments: 0,
  });

  useEffect(() => {
    // Simple fetch aggregation
    async function loadData() {
      try {
        const users = await getAllUsers();
        const appts = await getAppointments();

        if (users && Array.isArray(users)) {
          setStats({
            users: users.length,
            doctors: users.filter(u => u.role === 'doctor').length,
            patients: users.filter(u => u.role === 'patient').length,
            appointments: Array.isArray(appts) ? appts.length : 0,
          });
        }
      } catch (e) {
        console.error("Failed to load admin stats", e);
      }
    }
    loadData();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.username}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Users</h3>
          <p className="text-3xl font-black text-blue-600">{stats.users}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Doctors</h3>
          <p className="text-3xl font-black text-emerald-600">{stats.doctors}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Patients</h3>
          <p className="text-3xl font-black text-purple-600">{stats.patients}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Appointments</h3>
          <p className="text-3xl font-black text-orange-600">{stats.appointments}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all group">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">👥</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Manage Users</h2>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed">Add, edit, or remove doctors, staff, and patient accounts from the system.</p>
          <Link to="/users" className="inline-block bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Go to Users →
          </Link>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all group">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📅</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Appointments</h2>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed">Oversee all hospital appointments, check status, and manage schedules.</p>
          <Link to="/appointments" className="inline-block bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            View Appointments →
          </Link>
        </div>
      </div>
    </div>
  );
}

