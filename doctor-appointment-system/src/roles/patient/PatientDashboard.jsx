import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useAppointments } from "../../hooks/useAppointments";
import { useAuth } from "../../auth/AuthContext";
import { getLabReports } from "../../api/lab.api";

export default function PatientDashboard() {
  // Get the current logged-in user details
  const { user } = useAuth();

  // Get the list of assignments (appointments) from our custom hook
  const { appointments } = useAppointments();

  // State to keep track of how many lab reports exist
  const [reportCount, setReportCount] = useState(0);

  // When the component loads (or user changes), fetch the lab reports
  useEffect(() => {
    getLabReports()
      .then(data => setReportCount(data.length))
      .catch(err => console.error(err));
  }, [user]);

  // Filter the list to find only future visits that are confirmed or pending
  const upcomingAppointments = appointments.filter(
    (a) => new Date(a.date) > new Date() && (a.status === 'confirmed' || a.status === 'pending')
  );

  return (
    <div className="space-y-12 animate-fade-in pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[3rem] bg-white p-8 md:p-12 text-slate-800 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-slate-100">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100 rounded-full blur-[80px] opacity-60 -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-[80px] opacity-60 -ml-16 -mb-16 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-2">
            <p className="text-teal-600 font-bold uppercase tracking-widest text-xs">Patient Dashboard</p>
            <h1 className="text-4xl md:text-5xl font-serif leading-tight">
              Hello, <span className="text-teal-600 italic">{user.username}</span>.
            </h1>
            <p className="text-slate-500 text-lg max-w-md">
              Here is your daily health summary. You have <strong className="text-slate-800 border-b-2 border-teal-200">{upcomingAppointments.length} upcoming</strong> visits.
            </p>
          </div>

          <Link to="/book">
            <button className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 group shadow-xl hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 active:translate-y-0">
              <span>Book Appointment</span>

            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/history?filter=upcoming" className="group">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 h-full relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]"></span>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Next Steps</p>
            </div>
            <p className="text-6xl font-serif text-slate-800 mb-2 tracking-tight group-hover:scale-105 transition-transform origin-left">{upcomingAppointments.length}</p>
            <p className="text-slate-500 font-medium text-sm">Upcoming Visits</p>
          </div>
        </Link>

        <Link to="/history" className="group">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 h-full relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">History</p>
            </div>
            <p className="text-6xl font-serif text-slate-800 mb-2 tracking-tight group-hover:scale-105 transition-transform origin-left">{appointments.length}</p>
            <p className="text-slate-500 font-medium text-sm">Total Consultations</p>
          </div>
        </Link>

        <Link to="/lab-reports" className="group">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 h-full relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lab Results</p>
            </div>
            <p className="text-6xl font-serif text-slate-800 mb-2 tracking-tight group-hover:scale-105 transition-transform origin-left">{reportCount}</p>
            <p className="text-slate-500 font-medium text-sm">Reports Available</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-end mb-8 px-2">
          <div>
            <h2 className="text-3xl font-serif text-slate-800">Recent Activity</h2>
            <p className="text-slate-400 text-sm font-medium mt-1">Your latest medical interactions</p>
          </div>
          <Link to="/history" className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">View All &rarr;</Link>
        </div>

        <div className="grid gap-4">
          {appointments.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">No recent activity.</p>
              <Link to="/book" className="mt-4 inline-block text-teal-600 font-bold text-sm hover:underline">Book your first visit</Link>
            </div>
          ) : (
            appointments.slice(0, 3).sort((a, b) => new Date(b.date) - new Date(a.date)).map((a) => (
              <div key={a.id} className="group flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-6">
                  <div className={`
                             w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-serif
                             ${a.status === 'confirmed' ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-500'}
                          `}>
                    {(a.doctor_name || a.doctor || "?")[0]}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-slate-800 font-bold">Dr. {a.doctor_name || a.doctor}</h3>
                    <p className="text-slate-400 text-sm font-medium">{new Date(a.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className={`
                               px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider hidden md:block
                               ${a.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      a.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        a.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                          'bg-slate-100 text-slate-500'}
                           `}>
                    {a.status === 'cancelled' ? 'Declined' : a.status}
                  </span>
                  <Link to={`/history`} className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 hover:bg-slate-50 hover:text-slate-600 transition-all">

                  </Link>
                </div>

                {/* Decline reason preview for cancelled appointments */}
                {a.status === 'cancelled' && (
                  <div className={`w-full mt-4 p-4 rounded-2xl border text-left ${a.decline_reason ? 'bg-rose-50/50 border-rose-100/30' : 'bg-slate-50 border-slate-100'}`}>
                    {a.decline_reason ? (
                      <>
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Doctor's Note
                        </p>
                        <p className="text-xs font-bold text-rose-700 italic opacity-80 truncate">"{a.decline_reason}"</p>
                      </>
                    ) : (
                      <p className="text-xs font-bold text-slate-400 italic">Appointment cancelled.</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
