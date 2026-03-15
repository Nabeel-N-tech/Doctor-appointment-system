import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllUsers } from "../../api/users.api";
import { getAppointments } from "../../api/appointments.api";
import { useAuth } from "../../auth/AuthContext";
import { fetchAdminAnalytics } from "../../api/analytics.api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, Stethoscope, HeartPulse, CalendarCheck, Activity, ArrowRight } from "lucide-react";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    doctors: 0,
    patients: 0,
    appointments: 0,
  });
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const users = await getAllUsers();
        const appts = await getAppointments();
        const analyticsData = await fetchAdminAnalytics();

        if (users && Array.isArray(users)) {
          setStats({
            users: users.length,
            doctors: users.filter(u => u.role === 'doctor').length,
            patients: users.filter(u => u.role === 'patient').length,
            appointments: Array.isArray(appts) ? appts.length : 0,
          });
        }

        if (analyticsData) {
          setAnalytics(analyticsData);
        }
      } catch (e) {
        console.error("Failed to load admin stats", e);
      }
    }
    loadData();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.username}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Users size={24} /></div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Users</h3>
            <p className="text-3xl font-black text-slate-800">{stats.users}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col items-start gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Stethoscope size={24} /></div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Doctors</h3>
            <p className="text-3xl font-black text-slate-800">{stats.doctors}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col items-start gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><HeartPulse size={24} /></div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Patients</h3>
            <p className="text-3xl font-black text-slate-800">{stats.patients}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col items-start gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><CalendarCheck size={24} /></div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Appointments</h3>
            <p className="text-3xl font-black text-slate-800">{stats.appointments}</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      {analytics && (
        <div className="mb-8 border border-slate-100 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Activity size={20} /></span>
            Analytics Overview
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Trends */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-4">Revenue Trends (6 Months)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <LineChart data={analytics.revenue_trends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                    <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Appointment Statuses */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-4">Appointment Status Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={analytics.appointment_status} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis dataKey="status" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, textTransform: 'capitalize' }} width={80} />
                    <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Demographics - Age */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-4">Patient Age Demographics</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie data={analytics.demographics_age} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {analytics.demographics_age.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Demographics - Gender */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-4">Patient Gender Demographics</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie data={analytics.demographics_gender} cx="50%" cy="50%" outerRadius={80} paddingAngle={2} dataKey="value">
                      {analytics.demographics_gender.map((entry, index) => (
                        <Cell key={`cell-gender-${index}`} fill={['#3b82f6', '#ec4899', '#8b5cf6'][index % 3]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all group">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Users size={24} /></div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Manage Users</h2>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed">Add, edit, or remove doctors, staff, and patient accounts from the system.</p>
          <Link to="/users" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Go to Users <ArrowRight size={16} />
          </Link>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all group">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><CalendarCheck size={24} /></div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Appointments</h2>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed">Oversee all hospital appointments, check status, and manage schedules.</p>
          <Link to="/appointments" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            View Appointments <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

