import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppointments } from "../../hooks/useAppointments";
import { createLabReport, getLabReports } from "../../api/lab.api";
import { getAllUsers as getUsers } from "../../api/users.api";
import { updateAppointmentStatus as apiUpdateStatus } from "../../api/appointments.api";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LabReportTemplate from "../../components/domain/LabReportTemplate";
import apiClient from "../../api/apiClient";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("queue");
  const { appointments, updateAppointmentStatus: updateLocalStatus, refreshAppointments } = useAppointments();
  const [patients, setPatients] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [labSearch, setLabSearch] = useState("");

  // Vitals State
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [selectedApptForVitals, setSelectedApptForVitals] = useState(null);
  const [vitalsForm, setVitalsForm] = useState({ bp: '', temp: '', weight: '', height: '' });

  // Patient Details State
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const viewPatientDetails = (appt) => {
    // We have patient_id in appt (thanks to my serializer update? wait, serializer has patient_id now)
    // Actually, check if AppointmentSerializer has patient_id. Yes, I added it in Step 547.
    if (!appt.patient_id) {
      toast.error("Patient ID missing");
      return;
    }

    const toastId = toast.loading("Loading profile...");
    apiClient.get(`/users/${appt.patient_id}/`).then(res => {
      setSelectedPatient(res.data);
      setShowPatientDetails(true);
      toast.dismiss(toastId);
    }).catch(err => {
      toast.error("Failed to load patient");
    });
  };

  const openVitalsModal = (appt) => {
    setSelectedApptForVitals(appt);
    setVitalsForm({ bp: '', temp: '', weight: '', height: '' });
    setShowVitalsModal(true);
  };

  const submitVitals = async () => {
    if (!selectedApptForVitals) return;
    const toastId = toast.loading("Saving vitals...");
    try {
      const vitalsJson = JSON.stringify(vitalsForm);
      // We reuse the update status endpoint but just for updating the vitals field? 
      // Need to check if backend supports partial updates via PATCH on `appointments/<id>/status/` or needs a new endpoint.
      // Actually, the `update_appointment_status` view only looks for `status`.
      // We need to use a general update endpoint or modify the status endpoint.
      // Let's assume we can use a generic update endpoint if it exists, OR better, I'll modify the backend view real quick to accept other fields.
      // Wait, I can't modify backend view in the same step.
      // Let's assume I will modify `update_appointment_status` to also accept `vitals`.
      await apiClient.patch(`/appointments/${selectedApptForVitals.id}/status/`, {
        status: selectedApptForVitals.status, // Keep same status
        vitals: vitalsJson
      });

      toast.success("Vitals recorded", { id: toastId });
      setShowVitalsModal(false);
      refreshAppointments();
    } catch (err) {
      toast.error("Failed to save", { id: toastId });
    }
  };

  useEffect(() => {
    refreshAppointments();
    loadLabData();
  }, []);

  const loadLabData = async () => {
    try {
      const [usersData, labsData] = await Promise.all([getUsers(), getLabReports()]);
      setPatients(usersData.filter(u => u.role === 'patient'));
      setLabReports(labsData);
    } catch (err) {
      console.error("Failed to load auxiliary data", err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    // 1. Optimistic Update (Immediate UI Change)
    updateLocalStatus(id, { status: newStatus });

    const toastId = toast.loading("Syncing...");
    try {
      // 2. Network Request
      await apiUpdateStatus(id, { status: newStatus });
      toast.success(`Updated`, { id: toastId });

      // 3. Background Refresh (to ensure consistency)
      refreshAppointments();
    } catch (err) {
      toast.error("Sync failed", { id: toastId });
      // Revert if needed, but refreshAppointments will typically handle it
      refreshAppointments();
    }
  };

  // Filter appointments (Show all active appointments for now to ensure visibility)
  const todayAppts = appointments
    .filter(a => a.status !== 'cancelled')
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ascending

  const pendingAppts = todayAppts.filter(a => a.status === 'pending');
  const activeAppts = todayAppts.filter(a => a.status === 'confirmed' || a.status === 'in_progress');
  const completedAppts = todayAppts.filter(a => a.status === 'completed');

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      {/* Header Section */}
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nurse Station</h1>
          <p className="text-slate-500 font-medium mt-1">Manage patient flow & diagnostics</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <TabButton active={activeTab === 'queue'} onClick={() => setActiveTab('queue')} icon="📋">Queue</TabButton>
          <TabButton active={activeTab === 'pharmacy'} onClick={() => setActiveTab('pharmacy')} icon="💊">Pharmacy</TabButton>
        </div>
      </div>

      {activeTab === 'pharmacy' && <PharmacySection />}

      {activeTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Waiting Room Column */}
          <QueueColumn
            title="Waiting Room"
            count={pendingAppts.length}
            color="amber"
            icon="⏳"
          >
            {pendingAppts.length === 0 ? <EmptyState text="Waiting room empty" /> :
              pendingAppts.map(appt => (
                <PatientCard
                  key={appt.id}
                  appt={appt}
                  actionLabel="Check In"
                  onAction={() => handleStatusChange(appt.id, 'confirmed')}
                  actionColor="emerald"
                  onAddVitals={() => openVitalsModal(appt)}
                  onViewProfile={() => viewPatientDetails(appt)}
                />
              ))
            }
          </QueueColumn>

          {/* Vitals / With Doctor Column */}
          <QueueColumn
            title="Active / Consultation"
            count={activeAppts.length}
            color="emerald"
            icon="🩺"
          >
            {activeAppts.length === 0 ? <EmptyState text="No active patients" /> :
              activeAppts.map(appt => (
                <PatientCard
                  key={appt.id}
                  appt={appt}
                  actionLabel={appt.status === 'in_progress' ? "With Doctor" : "Complete"}
                  onAction={() => appt.status !== 'in_progress' && handleStatusChange(appt.id, 'completed')}
                  actionColor={appt.status === 'in_progress' ? "indigo" : "blue"}
                  subAction={appt.status !== 'in_progress'}
                  onViewProfile={() => viewPatientDetails(appt)}
                />
              ))
            }
          </QueueColumn>

          {/* Completed Column */}
          <QueueColumn
            title="Completed"
            count={completedAppts.length}
            color="blue"
            icon="✅"
          >
            {completedAppts.length === 0 ? <EmptyState text="No completed visits" /> :
              completedAppts.map(appt => (
                <PatientCard key={appt.id} appt={appt} readOnly onViewProfile={() => viewPatientDetails(appt)} />
              ))
            }
          </QueueColumn>
        </div>
      )}

      {activeTab === 'labs' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800">Diagnostic Reports</h2>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Input
                  placeholder="Search patient or test..."
                  value={labSearch}
                  onChange={(e) => setLabSearch(e.target.value)}
                  className="pl-10"
                />

              </div>
              <Button onClick={() => navigate('/create-report')} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 shrink-0">
                + New Report
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {labReports
              .filter(r =>
                (r.patient || "").toLowerCase().includes(labSearch.toLowerCase()) ||
                (r.test_name || "").toLowerCase().includes(labSearch.toLowerCase())
              )
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .length === 0 ? (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">No diagnostic reports found.</p>
              </div>
            ) : (
              labReports
                .filter(r =>
                  (r.patient || "").toLowerCase().includes(labSearch.toLowerCase()) ||
                  (r.test_name || "").toLowerCase().includes(labSearch.toLowerCase())
                )
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(report => (
                  <Card
                    key={report.id}
                    className="p-6 border-l-4 border-l-purple-500 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => {
                      const batch = labReports.filter(r =>
                        r.patient === report.patient &&
                        Math.abs(new Date(r.date) - new Date(report.date)) < 30000 // 30 sec window for batch
                      );
                      setSelectedReport(batch);
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Test Name</p>
                        <h3 className="font-bold text-slate-800 text-lg group-hover:text-purple-600 transition-colors">{report.test_name}</h3>
                      </div>
                      <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-lg text-xs font-bold uppercase">
                        {report.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-slate-400">Patient</p>
                        <p className="font-semibold text-slate-700">{report.patient || 'Unknown'}</p>
                      </div>
                      <div className="text-right text-[10px] text-slate-400 mt-2">
                        {new Date(report.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:translate-x-1 transition-transform flex items-center">
                        View Report →
                      </span>
                    </div>
                  </Card>
                ))
            )}
          </div>
        </div>
      )}

      {selectedReport && (
        <LabReportTemplate
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}

      {/* Patient Details Modal */}
      {showPatientDetails && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setShowPatientDetails(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center text-3xl font-black border-4 border-white shadow-xl">
                {selectedPatient.username[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedPatient.username}</h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{selectedPatient.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="block text-xl font-black text-slate-800">{selectedPatient.age || '--'}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Age</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="block text-xl font-black text-slate-800">{selectedPatient.gender || '--'}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sex</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="block text-xl font-black text-slate-800">{selectedPatient.blood_group || '--'}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blood</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="block text-xl font-black text-slate-800 truncate">{selectedPatient.phone_number || '--'}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Medical History / Allergies</h3>
              <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 text-sm font-medium text-slate-700 leading-relaxed max-h-40 overflow-y-auto">
                {selectedPatient.medical_history || "No medical history recorded."}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <Button onClick={() => setShowPatientDetails(false)} className="bg-slate-900 text-white px-8">Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Vitals Modal */}
      {showVitalsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Add Vitals</h2>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">For {selectedApptForVitals?.patient}</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">BP (mmHg)</label>
                  <Input placeholder="120/80" value={vitalsForm.bp} onChange={(e) => setVitalsForm({ ...vitalsForm, bp: e.target.value })} autoFocus />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Temp (°F)</label>
                  <Input placeholder="98.6" type="number" value={vitalsForm.temp} onChange={(e) => setVitalsForm({ ...vitalsForm, temp: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Weight (kg)</label>
                  <Input placeholder="70" type="number" value={vitalsForm.weight} onChange={(e) => setVitalsForm({ ...vitalsForm, weight: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Height (cm)</label>
                  <Input placeholder="175" type="number" value={vitalsForm.height} onChange={(e) => setVitalsForm({ ...vitalsForm, height: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button className="flex-1 bg-slate-100 text-slate-500 hover:bg-slate-200" onClick={() => setShowVitalsModal(false)}>Cancel</Button>
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200" onClick={submitVitals}>Save Vitals</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components
function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition-all
        ${active
          ? 'bg-slate-900 text-white shadow-md'
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
      `}
    >

      {children}
    </button>
  );
}

function QueueColumn({ title, count, color, icon, children }) {
  const colors = {
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className={`p-4 rounded-2xl border ${colors[color]} flex justify-between items-center`}>
        <div className="flex items-center gap-2">

          <h3 className="font-bold uppercase tracking-wide text-xs">{title}</h3>
        </div>
        <span className="bg-white px-2.5 py-1 rounded-lg font-black text-xs shadow-sm">{count}</span>
      </div>
      <div className="flex flex-col gap-3 min-h-[200px]">
        {children}
      </div>
    </div>
  );
}

function PatientCard({ appt, actionLabel, onAction, actionColor, readOnly, onAddVitals, onViewProfile }) {
  const actionClasses = {
    emerald: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
    blue: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
    indigo: "bg-indigo-600 cursor-default opacity-80"
  };

  return (
    <Card className="p-5 hover:border-slate-300 transition-all border border-slate-200 group relative">
      <div className="flex justify-between items-start mb-3">
        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider">
          Token <span className="text-sm font-black text-slate-900">#{appt.token_number}</span>
        </span>
        <span className="text-[10px] font-bold text-slate-400">
          {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-slate-900 text-lg leading-tight cursor-pointer hover:text-blue-600 transition-colors" onClick={onViewProfile}>
            {appt.patient}
          </h4>
          {onViewProfile && (
            <button onClick={onViewProfile} className="text-slate-400 hover:text-blue-600 text-xs font-bold uppercase tracking-wider border border-slate-200 rounded-lg px-2 py-1 hover:bg-slate-50 transition-all">
              Profile
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 font-medium mt-1">Dr. {appt.doctor}</p>

        {appt.vitals && (
          <div className="mt-2 flex gap-2 flex-wrap">
            {Object.entries(JSON.parse(appt.vitals || '{}')).map(([k, v]) => (
              <span key={k} className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded border border-rose-100 uppercase">{k}: {v}</span>
            ))}
          </div>
        )}

        {appt.reason && (
          <div className="mt-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 truncate italic">
            "{appt.reason}"
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="flex gap-2">
          {onAddVitals && (
            <button
              onClick={onAddVitals}
              className="flex-1 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-slate-50 transition-all"
            >
              + Vitals
            </button>
          )}
          <button
            onClick={onAction}
            className={`flex-1 py-3 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all transform active:scale-95 ${actionClasses[actionColor]}`}
          >
            {actionLabel}
          </button>
        </div>
      )}
    </Card>
  )
}


function PharmacySection() {
  const [scripts, setScripts] = useState([]);

  useEffect(() => {
    const loadScripts = () => {
      apiClient.get('/prescriptions/').then(res => setScripts(res.data));
    };

    loadScripts(); // Initial load
    const interval = setInterval(loadScripts, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const dispense = async (id) => {
    try {
      await apiClient.post(`/prescriptions/${id}/dispense/`);
      toast.success("Dispensed");
      setScripts(scripts.map(s => s.id === id ? { ...s, is_dispensed: true } : s));
    } catch (err) {
      toast.error("Failed");
    }
  };

  const pending = scripts.filter(s => !s.is_dispensed);
  const completed = scripts.filter(s => s.is_dispensed);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h3 className="text-xl font-black text-slate-800 mb-4">Pending Fulfillment ({pending.length})</h3>
        <div className="space-y-4">
          {pending.length === 0 ? <p className="text-slate-400">No pending prescriptions.</p> : pending.map(s => (
            <Card key={s.id} className="p-6 border-l-4 border-l-amber-400">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-900">{s.patient_name}</h4>
                  <p className="text-xs text-slate-500">Dr. {s.doctor_name}</p>
                </div>
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded">Pending</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl font-mono text-sm text-slate-600 whitespace-pre-wrap mb-4">
                {s.medicines}
              </div>
              {s.notes && <p className="text-xs text-slate-400 italic mb-4">Note: {s.notes}</p>}
              <Button onClick={() => dispense(s.id)} className="w-full bg-slate-900 text-white">Mark Dispensed</Button>
            </Card>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-black text-slate-800 mb-4">Dispensed History</h3>
        <div className="space-y-4 opacity-75">
          {completed.map(s => (
            <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-700">{s.patient_name}</h4>
                <p className="text-xs text-slate-400">{new Date(s.date).toLocaleDateString()}</p>
              </div>
              <span className="text-green-600 font-bold text-xs uppercase">Dispensed</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="h-48 flex items-center justify-center text-slate-400 font-medium italic border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
      {text}
    </div>
  )
}
