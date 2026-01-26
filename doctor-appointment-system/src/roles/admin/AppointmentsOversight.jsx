import { useEffect, useState } from "react";
import { getAppointmentsByRole, updateAppointmentStatus } from "../../api/appointments.api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function AppointmentOversight() {
  const [appointments, setAppointments] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getAppointmentsByRole();
      const sorted = Array.isArray(data) ? data.sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
      setAppointments(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateAppointmentStatus(id, { status: newStatus });
      // Update local state
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      if (selectedApp?.id === id) {
        setSelectedApp(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesFilter = filter === "all" || a.status === filter;
    const patientName = a.patient?.username || a.patient || "";
    const doctorName = a.doctor?.username || a.doctor || "";
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">Synchronizing appointments...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">

      {/* Header & Stats */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Appointments</h1>
          </div>
          <p className="text-slate-500 font-medium">Comprehensive oversight of all clinic bookings.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full xl:w-auto">
          {[
            { label: 'Pending', count: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
            { label: 'Confirmed', count: stats.confirmed, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
            { label: 'Completed', count: stats.completed, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
            { label: 'Total', count: stats.total, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} ${stat.border} border p-4 rounded-xl text-center transition-all hover:shadow-md`}>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Controls: Search & Filters */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
            <input
              type="text"
              placeholder="Search by patient or doctor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-teal-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                    capitalize px-5 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap
                    ${filter === f
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}
                  `}
            >
              {f}
            </button>
          ))}
        </div>
      </Card>

      {/* Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-spring">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-white relative">
              <button
                onClick={() => setSelectedApp(null)}
                className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center text-2xl">📅</div>
                <div>
                  <h2 className="text-2xl font-black">Appointment</h2>
                  <p className="text-teal-50 mt-1 font-medium opacity-90 text-sm">Token Number #{selectedApp.token_number || '--'}</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient</p>
                  <p className="text-lg font-bold text-slate-800">{selectedApp.patient?.username || selectedApp.patient}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Doctor</p>
                  <p className="text-lg font-bold text-teal-600">Dr. {selectedApp.doctor?.username || selectedApp.doctor}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Schedule</p>
                <p className="text-lg font-medium text-slate-700">{formatDate(selectedApp.date)}</p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reason for Visit</p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-600 italic text-sm leading-relaxed">
                  "{selectedApp.reason || 'No specific reason provided by the patient.'}"
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Manual Status Override</p>
                <div className="flex gap-2">
                  {['pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusUpdate(selectedApp.id, s)}
                      className={`
                         flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all
                         ${selectedApp.status === s
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}
                       `}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <Button onClick={() => setSelectedApp(null)} className="w-full sm:w-auto">
                Finish Review
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content: Appointment Cards */}
      <div className="grid gap-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((app) => (
            <Card key={app.id} className="group hover:border-teal-200 transition-all p-5 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getStatusColor(app.status).split(' ')[0]}`}></div>

              <div className="flex items-center gap-5 flex-1">
                <div className="flex flex-col items-center justify-center w-16 h-16 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Token</span>
                  <span className="text-2xl font-black text-slate-800 leading-none">{app.token_number || '--'}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-800 text-lg tracking-tight leading-none">{app.patient?.username || app.patient}</h3>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium text-sm">
                    Dr. {app.doctor?.username || app.doctor} • {formatDate(app.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto pl-20 md:pl-0">
                <div className="hidden sm:flex gap-2">
                  {app.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(app.id, 'confirmed')}
                      className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      title="Confirm Appointment"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </button>
                  )}
                  {app.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(app.id, 'completed')}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      title="Mark Completed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </button>
                  )}
                </div>
                <Button variant="secondary" onClick={() => setSelectedApp(app)} className="text-xs">
                  Details
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="text-5xl mb-4 grayscale opacity-20">📭</div>
            <h3 className="text-lg font-bold text-slate-700">No appointments found</h3>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters.</p>
            <Button
              variant="outline"
              onClick={() => { setFilter('all'); setSearchTerm(''); }}
              className="mt-6"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}
