import { useEffect, useState } from "react";
import { getAppointmentsByRole } from "../../api/appointments.api";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/feedback/EmptyState";
import { useNavigate } from "react-router-dom";

export default function Schedule() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAppointmentsByRole()
      .then(data => {
        // Sort by date
        const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setAppointments(sorted);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  // Group by Date
  const grouped = appointments.reduce((groups, appointment) => {
    const date = new Date(appointment.date).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {});

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Schedule</h1>
          <p className="text-slate-500 font-medium mt-2">Manage your upcoming appointments and patient visits.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
          <span className="bg-white px-4 py-2 rounded-lg font-black text-slate-900 shadow-sm text-sm">
            {appointments.length} Upcoming
          </span>
        </div>
      </div>

      {appointments.length === 0 && (
        <EmptyState message="No appointments scheduled." />
      )}

      <div className="space-y-8">
        {Object.entries(grouped).map(([date, appts]) => (
          <div key={date} className="animate-fade-in">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 sticky top-20 bg-slate-50/95 backdrop-blur py-2 z-10 w-fit px-4 rounded-full border border-slate-200 shadow-sm">
              {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {appts.map((a) => (
                <Card
                  key={a.id}
                  className="p-5 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group border-0 shadow-md ring-1 ring-slate-100"
                  onClick={() => navigate(`/patient/${a.patient_id || a.patient_id_placeholder || a.patient.id || 1}`)} // Fallback if id missing, but patient_id should be there from serializer
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-indigo-200">
                        {a.patient[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{a.patient}</h4>
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                          ID: #{a.id.toString().padStart(4, '0')}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50 bg-slate-50/50 -mx-5 -mb-5 px-5 py-3">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                      <span className="text-lg">🕒</span>
                      {new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>
                    <span className="text-xs font-black text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                      View Details →
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    completed: "bg-blue-50 text-blue-700 border-blue-100",
    cancelled: "bg-slate-100 text-slate-500 border-slate-200"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.cancelled}`}>
      {status}
    </span>
  );
}
