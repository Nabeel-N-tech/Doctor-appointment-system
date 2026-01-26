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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-gray-500 font-bold mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.users}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-gray-500 font-bold mb-2">Doctors</h3>
          <p className="text-3xl font-bold text-green-600">{stats.doctors}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-gray-500 font-bold mb-2">Patients</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.patients}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-gray-500 font-bold mb-2">Appointments</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.appointments}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Manage Users</h2>
          <p className="text-gray-600 mb-4">Add, edit, or remove doctors and patients.</p>
          <Link to="/users" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Go to Users
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Appointments</h2>
          <p className="text-gray-600 mb-4">View and manage all hospital appointments.</p>
          <Link to="/appointments" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            View Appointments
          </Link>
        </div>
      </div>
    </div>
  );
}

