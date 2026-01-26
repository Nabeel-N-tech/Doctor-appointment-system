import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { getAppointments } from "../../api/appointments.api";
import { useAuth } from "../../auth/AuthContext";
import LabResultCard from "../../components/domain/LabResultCard";
import LabReportTemplate from "../../components/domain/LabReportTemplate";
import { getLabReports } from "../../api/lab.api";
import apiClient from "../../api/apiClient";
import toast from "react-hot-toast";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [listView, setListView] = useState('active'); // 'active' | 'history'
  const [doctors, setDoctors] = useState([]);

  const [declineModal, setDeclineModal] = useState({ show: false, apptId: null });
  const [declineReason, setDeclineReason] = useState("");

  const [isAvailable, setIsAvailable] = useState(true);

  // Run this code when the dashboard loads to get fresh data
  useEffect(() => {
    getAppointments().then(setAppointments);
    getLabReports().then(setReports);
    apiClient.get('/doctors/').then(res => setDoctors(res.data));
    apiClient.get('/profile/').then(res => setIsAvailable(res.data.is_available));
  }, []);

  // Switch the doctor's status between "Available" and "Unavailable"
  const toggleAvailability = async () => {
    try {
      const res = await apiClient.post('/doctor/toggle-availability/');
      setIsAvailable(res.data.is_available);
      toast.success(res.data.message);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleUpdateStatus = async (id, newStatus, reason = "") => {
    const loadingToast = toast.loading(`${newStatus === 'confirmed' ? 'Confirming' : 'Declining'} appointment...`);
    try {
      const { updateAppointmentStatus: updateApi } = await import("../../api/appointments.api");
      const updates = { status: newStatus };
      if (reason) updates.decline_reason = reason;

      await updateApi(id, updates);

      // Update local state
      setAppointments(prev => prev.map(a =>
        a.id === id ? { ...a, status: newStatus, decline_reason: reason } : a
      ));

      toast.success(`Appointment ${newStatus}`, { id: loadingToast });
      setDeclineModal({ show: false, apptId: null });
      setDeclineReason("");
    } catch (err) {
      toast.error("Failed to update status", { id: loadingToast });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const todayCount = appointments.filter(
    (a) => new Date(a.date).toDateString() === new Date().toDateString() && a.status !== 'cancelled'
  ).length;

  const uniquePatients = new Set(appointments.map(a => a.patient_id)).size;

  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const activeAppointments = appointments.filter(a =>
    listView === 'active'
      ? (a.status !== 'completed' && a.status !== 'cancelled' && a.status !== 'pending')
      : (a.status === 'completed')
  );

  const handlePatientClick = (patientId) => {
    if (patientId) {
      navigate(`/patient/${patientId}`);
    } else {
      toast.error("Patient details not available");
    }
  };

  const handleReferralInit = async (appointment) => {
    try {
      const usersResponse = await apiClient.get('/users/');
      const patientData = usersResponse.data.find(u => u.username === appointment.patient);
      if (patientData) {
        setReferringPatient(patientData);
      }
    } catch (err) {
      toast.error("Failed to initialize referral");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 p-2">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            {getGreeting()}, <span className="text-teal-600">Dr. {user.username}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">
            Your daily medical command center.
          </p>
        </div>

        <div className={`
             flex items-center gap-4 px-2 py-2 rounded-full border transition-all duration-300
             ${isAvailable ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}
        `}>
          <div className="px-6">
            <span className={`block text-[10px] font-black uppercase tracking-widest ${isAvailable ? 'text-emerald-600' : 'text-slate-400'}`}>Status</span>
            <span className={`block font-bold text-sm ${isAvailable ? 'text-emerald-900' : 'text-slate-500'}`}>
              {isAvailable ? 'Accepting Patients' : 'Unavailable'}
            </span>
          </div>
          <button
            onClick={toggleAvailability}
            className={`w-16 h-9 rounded-full relative transition-colors duration-300 focus:outline-none ${isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 left-1 bg-white w-7 h-7 rounded-full shadow-md transition-transform duration-300 ${isAvailable ? 'translate-x-7' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Today's Appointments", value: todayCount, color: "teal", bg: "bg-teal-50", text: "text-teal-600" },
          { label: "Unique Patients", value: uniquePatients, color: "indigo", bg: "bg-indigo-50", text: "text-indigo-600" },
          { label: "Approval Rating", value: "98%", color: "emerald", bg: "bg-emerald-50", text: "text-emerald-600" }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl p-5 shadow-lg shadow-slate-100/50 flex flex-col justify-center gap-3 hover:-translate-y-1 transition-transform duration-300 border border-slate-100">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center text-xl mb-1`}>

            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Areas */}
      <div className="mt-8">
        <div className="flex items-center justify-between px-2 mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight text-left">
              {listView === 'active' ? 'Active Schedule' : 'Completed Patients'}
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase mt-1 text-left">
              {listView === 'active' ? 'Real-time patient queue' : 'Session history'}
            </p>
          </div>
          <div className="bg-slate-100 p-1 rounded-xl flex">
            <button
              onClick={() => setListView('active')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${listView === 'active' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Queue
            </button>
            <button
              onClick={() => setListView('history')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${listView === 'history' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              History
            </button>
          </div>

        </div>

        <div className="space-y-6">
          {/* Pending Reviews Section */}
          {pendingAppointments.length > 0 && listView === 'active' && (
            <div className="mb-10 animate-slide-up">
              <div className="flex items-center gap-3 mb-4 px-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest">Pending Confirmation</h3>
              </div>
              <div className="grid gap-4">
                {pendingAppointments.map(a => (
                  <div key={a.id} className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100/50 shadow-sm transition-all hover:shadow-md hover:border-amber-200 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/30 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-left">
                      <div className="flex items-center gap-6 w-full md:w-auto text-left">
                        <div className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center border border-amber-100 shadow-sm text-amber-700 shrink-0">
                          <span className="text-2xl font-black leading-none">?</span>
                          <span className="text-[8px] font-black uppercase tracking-widest mt-1">Pending</span>
                        </div>
                        <div className="text-left">
                          <h4 className="font-black text-slate-900 text-lg leading-none">{a.patient}</h4>
                          <div className="flex items-center gap-2 text-amber-600 text-xs font-bold mt-2">
                            <span>{new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                            <span className="mx-1 opacity-30">|</span>
                            <span>{new Date(a.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 mt-2 italic truncate max-w-[200px]">"{a.reason || 'No reason provided'}"</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <button
                          onClick={() => setDeclineModal({ show: true, apptId: a.id })}
                          className="h-11 px-6 bg-white text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all border border-rose-100 shadow-sm"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(a.id, 'confirmed')}
                          className="h-11 px-7 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 shadow-xl shadow-amber-200 transition-all active:scale-95"
                        >
                          Confirm Appt
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {appointments.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-left">
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center text-4xl mb-4 mx-auto shadow-inner"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs text-center">No active appointments</p>
            </div>
          ) : (
            activeAppointments.slice(0, 10).map(a => (
              <div key={a.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-slate-200 group">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                  {/* Left: Token & Main Info */}
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] text-slate-800 group-hover:scale-105 transition-transform shrink-0">
                      <span className="text-2xl font-black leading-none">{a.token_number || '#'}</span>
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">Token</span>
                    </div>
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h4 className="font-black text-slate-900 text-lg leading-none truncate">{a.patient}</h4>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${a.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          a.status === 'in_progress' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                            a.status === 'cancelled' ? 'bg-slate-100 text-slate-400 border-slate-200' :
                              'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                          {a.status === 'in_progress' ? '● In Progress' : a.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                        <span>{new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-end shrink-0">
                    {a.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeclineModal({ show: true, apptId: a.id })}
                          className="h-10 px-4 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100 flex items-center justify-center"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(a.id, 'confirmed')}
                          className="h-10 px-5 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-700 shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center"
                        >
                          Confirm
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handlePatientClick(a.patient_id)}
                          className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-white hover:text-slate-800 hover:shadow-md border border-transparent hover:border-slate-100 flex items-center justify-center transition-all"
                        >
                          <span className="text-lg leading-none mb-1">↗</span>
                        </button>
                        <button
                          onClick={() => handlePatientClick(a.patient_id)}
                          className="h-10 px-5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
                        >
                          {listView === 'active' ? 'Consult' : 'Review'} <span>→</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>


      {/* Decline Reason Modal */}
      {declineModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-scale-in">
            <h3 className="text-xl font-black text-slate-900 mb-2">Reason for Decline</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Please provide a reason. This will be visible to the patient.</p>

            <textarea
              className="w-full h-32 bg-slate-50 rounded-2xl p-4 font-bold text-sm text-slate-700 outline-none focus:ring-4 focus:ring-rose-50 focus:bg-white transition-all resize-none border-2 border-transparent focus:border-rose-100"
              placeholder="e.g. Doctor is unavailable, please reschedule for tomorrow..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              autoFocus
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeclineModal({ show: false, apptId: null })}
                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(declineModal.apptId, 'cancelled', declineReason)}
                className="flex-1 py-4 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DoctorLabReportsList({ appointments }) {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    getLabReports().then(setReports);
  }, []);

  // Filter reports to only show those for patients currently in the schedule
  // Safe check for appointments
  const activePatientNames = new Set((appointments || []).map(a => a.patient));

  const filteredReports = reports.filter(r =>
    activePatientNames.has(r.patient_username) ||
    activePatientNames.has(r.patient_name) ||
    activePatientNames.has(r.patient)
  ).slice(0, 5);

  if (filteredReports.length === 0) return (
    <div className="p-8 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No relevant diagnostics found</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {filteredReports.map(r => (
        <div key={r.id} className="bg-white p-5 rounded-3xl border-l-[6px] border-l-teal-400 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">PATIENT: {r.patient_username || r.patient_name || r.patient || 'Unknown'}</p>
              <h4 className="text-lg font-black text-slate-800 leading-tight">{r.test_name}</h4>
            </div>
            <div className="text-right">
              <span className="block text-xl font-black text-slate-900 leading-none">{r.observed_value} <span className="text-[10px] text-slate-400 font-bold uppercase">{r.unit}</span></span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">

              {new Date(r.date || r.created_at || Date.now()).toLocaleDateString()}
            </div>
            <button
              onClick={() => setSelectedReport(r)}
              className="text-[9px] font-black text-teal-600 uppercase tracking-widest hover:underline decoration-teal-300 underline-offset-4 cursor-pointer"
            >
              Check Report →
            </button>
          </div>
        </div>
      ))}
      {selectedReport && (
        <LabReportTemplate report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </div>
  )
}

function ConsultationModal({ patient, doctors, reports, onClose }) {
  const [activeTab, setActiveTab] = useState('clinical'); // clinical, prescription, history, referral
  const [medicines, setMedicines] = useState("");
  const [notes, setNotes] = useState("");
  const [isPrescribing, setIsPrescribing] = useState(false);
  const [referDoctor, setReferDoctor] = useState("");
  const [referReason, setReferReason] = useState("");
  const [referLoading, setReferLoading] = useState(false);

  const handlePrescribe = async (e) => {
    e.preventDefault();
    if (!medicines) return toast.error("Please add medicines");
    setIsPrescribing(true);
    try {
      await apiClient.post('/prescriptions/create/', {
        patient_id: patient.id,
        medicines: medicines,
        notes: notes
      });
      toast.success("Prescription Sent to Pharmacy");
      setMedicines("");
      setNotes("");
      setActiveTab('clinical');
    } catch (err) {
      toast.error("Failed to prescribe");
    } finally {
      setIsPrescribing(false);
    }
  };

  const handleReferral = async (e) => {
    e.preventDefault();
    if (!referDoctor) return toast.error("Select a doctor");
    setReferLoading(true);
    try {
      await apiClient.post('/referrals/create/', {
        patient_id: patient.id,
        to_doctor_id: referDoctor,
        reason: referReason
      });
      toast.success(`Patient referred successfully`);
      setReferDoctor("");
      setReferReason("");
      setActiveTab('clinical');
    } catch (err) {
      toast.error("Referral failed");
    } finally {
      setReferLoading(false);
    }
  };

  // Generate pseudo-data for display if missing
  const lastVisit = "2 days ago";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-2 sm:p-4 animate-fade-in text-left">
      <div className="bg-white w-full max-w-[95vw] md:max-w-6xl h-[92vh] rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row ring-1 ring-slate-900/5">

        {/* Sidebar / Patient Bio */}
        <div className="w-full md:w-80 lg:w-96 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200/60 flex flex-col shrink-0 max-h-[30vh] md:max-h-full overflow-y-auto custom-scrollbar">
          <div className="p-4 md:p-8 md:pb-6 text-center border-b border-slate-200/60 flex md:block items-center justify-between gap-4 sticky top-0 bg-slate-50 z-10">
            <div className="flex md:block items-center gap-4">
              <div className="w-16 h-16 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center text-2xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-teal-500 to-emerald-600 shadow-xl shadow-slate-200 border-4 border-white shrink-0 mx-auto transition-transform hover:scale-105 duration-300">
                {patient.username[0].toUpperCase()}
              </div>
              <div className="text-left md:text-center md:mt-4">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">{patient.username}</h2>
                <span className="inline-block mt-1 px-3 py-1 bg-teal-100/50 text-teal-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-teal-100">
                  Patient #{patient.id || '---'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Quick Vitals Grid */}
            <div className="grid grid-cols-3 md:grid-cols-2 gap-2 md:gap-3">
              {[
                { label: "Age", value: patient.age || '--', unit: "Yrs" },
                { label: "Blood", value: patient.blood_group || '--', unit: "Type" },
                { label: "Sex", value: patient.gender || '--', unit: "" },
              ].map((vital, idx) => (
                <div key={idx} className="bg-white p-2 md:p-3 rounded-2xl border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
                  <span className="block text-xl md:text-2xl font-black text-slate-800 leading-none mb-1">{vital.value}</span>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{vital.label}</p>
                </div>
              ))}
              <div className="bg-white p-2 md:p-3 rounded-2xl border border-slate-100 shadow-sm text-center block md:hidden">
                <span className="block text-xl font-black text-emerald-500">OK</span>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
              </div>
            </div>

            {/* Detailed Info */}
            <div className="space-y-3 md:space-y-4">
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 text-sm"></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                    <p className="font-bold text-slate-700 text-sm truncate max-w-[150px]">{patient.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center text-violet-500 text-sm"></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                    <p className="font-bold text-slate-700 text-sm">{patient.phone_number || "No contact"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-rose-50/80 p-5 rounded-3xl border border-rose-100/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ring-4 ring-rose-200"></div>
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Medical History</p>
                </div>
                <p className="font-medium text-slate-700 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                  {patient.medical_history || "No significant medical history recorded."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto p-4 text-center hidden md:block opacity-60">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Visit: {lastVisit}</p>
          </div>
        </div>

        {/* Main Work Area */}
        <div className="flex-1 flex flex-col bg-white min-w-0 h-full overflow-hidden relative">
          {/* Toolbar */}
          <div className="h-16 md:h-20 border-b border-slate-100 flex items-center justify-between px-4 md:px-8 bg-white z-20 shrink-0">
            <div className="flex gap-1 bg-slate-100/50 p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full md:max-w-none">
              {['clinical', 'prescription', 'referral', 'labs'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-4 py-2 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap flex-shrink-0
                    ${activeTab === tab
                      ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}
                  `}
                >
                  {
                    tab === 'clinical' ? 'Overview' :
                      tab === 'prescription' ? 'Prescription' :
                        tab === 'referral' ? 'Referral' :
                          tab === 'labs' ? 'Lab Results' :
                            tab
                  }
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 ml-2 rounded-full bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 font-black flex items-center justify-center transition-all shrink-0 hover:rotate-90 duration-300"
            >
              ✕
            </button>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 bg-slate-50/30 custom-scrollbar">
            {activeTab === 'clinical' && (
              <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-8">
                <div className="text-center group cursor-default">
                  <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-xl shadow-teal-100 group-hover:scale-110 transition-transform duration-500 ease-out">

                  </div>
                  <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Clinical Session</h2>
                  <p className="text-slate-500 font-medium max-w-lg mx-auto text-base md:text-lg leading-relaxed">
                    Documenting for <span className="font-bold text-slate-900 bg-teal-50 px-2 py-0.5 rounded-lg">{patient.username}</span>.
                  </p>
                </div>

                {/* Vitals Placeholders */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 opacity-40 hover:opacity-100 transition-opacity duration-500 grayscale hover:grayscale-0">
                  {['Body Temperature', 'Pulse Rate', 'Respiration Rate'].map((vital, i) => (
                    <div key={vital} className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-center justify-between sm:block group">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-teal-500 transition-colors">{vital}</p>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-slate-200 group-hover:text-slate-800 transition-colors">--</span>
                        <span className="text-[10px] font-bold text-slate-300 mb-1">N/A</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'prescription' && (
              <div className="max-w-3xl mx-auto animate-slide-up pb-10">
                <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-slate-100 relative overflow-hidden ring-1 ring-slate-900/5">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl opacity-60 -mr-20 -mt-20 pointer-events-none"></div>

                  <div className="mb-8 relative z-10">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                      New Order
                    </span>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">e-Prescription</h3>
                  </div>

                  <form onSubmit={handlePrescribe} className="space-y-6 relative z-10">
                    <div className="space-y-3">
                      <label className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                        <span>Medicines List (Rx)</span>
                        <span className="text-indigo-500">Auto-Format Enabled</span>
                      </label>
                      <textarea
                        className="w-full h-48 bg-slate-50 rounded-3xl p-6 font-mono text-sm font-medium text-slate-700 outline-none transition-all resize-none border-2 border-transparent focus:border-indigo-500 focus:bg-white shadow-inner"
                        placeholder={`1. Tab Amoxicillin 500mg\n   - 1-0-1 (After Food) x 5 days...`}
                        value={medicines}
                        onChange={(e) => setMedicines(e.target.value)}
                        autoFocus
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Pharmacy Notes</label>
                      <input
                        className="w-full h-14 bg-slate-50 rounded-2xl px-6 font-bold text-slate-700 outline-none transition-all border-2 border-transparent focus:border-indigo-500 focus:bg-white shadow-inner"
                        placeholder="e.g. Brand substitution allowed..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    <Button disabled={isPrescribing} className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-300 hover:shadow-2xl hover:bg-black hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all flex items-center justify-center gap-3 mt-4">
                      <span>{isPrescribing ? 'Transmitting...' : 'Sign & Transmit Order'}</span>
                      {!isPrescribing && <span className="text-lg">→</span>}
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'referral' && (
              <div className="max-w-2xl mx-auto animate-slide-up pb-10">
                <div className="bg-white p-6 md:p-10 rounded-[2rem] border border-slate-100 shadow-xl shadow-rose-100/50 ring-1 ring-slate-900/5 relative overflow-hidden">
                  <div className="text-center mb-8 relative z-10">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-rose-100">

                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Referral Order</h3>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mt-2">Transfer care to another specialist</p>
                  </div>

                  <form onSubmit={handleReferral} className="space-y-6 relative z-10">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Specialist</label>
                      <div className="relative">
                        <select
                          className="w-full h-16 bg-slate-50 rounded-2xl px-6 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-rose-50/50 focus:bg-white transition-all appearance-none cursor-pointer border-2 border-transparent focus:border-rose-200"
                          value={referDoctor}
                          onChange={(e) => setReferDoctor(e.target.value)}
                        >
                          <option value="">Select a Doctor...</option>
                          {doctors.filter(d => d.username !== 'Current User').map(d => (
                            <option key={d.id} value={d.id}>Dr. {d.username} - {d.specialization}</option>
                          ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold">▼</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-indigo-300 uppercase tracking-widest px-1">Reason</label>
                      <textarea
                        className="w-full h-36 bg-slate-50 rounded-3xl p-6 font-bold text-sm text-slate-700 outline-none focus:ring-4 focus:ring-rose-50/50 focus:bg-white transition-all resize-none border-2 border-transparent focus:border-rose-200"
                        placeholder="Describe the reason for referral..."
                        value={referReason}
                        onChange={(e) => setReferReason(e.target.value)}
                      />
                    </div>
                    <Button disabled={referLoading} className="w-full h-16 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-rose-200 hover:shadow-2xl hover:-translate-y-0.5 transition-all text-xs flex items-center justify-center gap-2">
                      {referLoading ? 'Processing...' : 'Authorize Transfer'}
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'labs' && (
              <div className="max-w-4xl mx-auto animate-slide-up pb-10">
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-blue-100">

                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Diagnostics Reports</h3>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mt-2">Laboratory results for {patient.username}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const patientReports = (reports || []).filter(r =>
                      r.patient_username === patient.username ||
                      r.patient_name === patient.username ||
                      r.patient === patient.username
                    ).sort((a, b) => new Date(b.date || b.created_at || Date.now()) - new Date(a.date || a.created_at || Date.now()));

                    if (patientReports.length === 0) return (
                      <div className="col-span-full p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No lab reports on file</p>
                      </div>
                    );

                    return patientReports.map(r => (
                      <div key={r.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3">
                            {r.test_name}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(r.date || r.created_at || Date.now()).toLocaleDateString()}</span>
                        </div>

                        <div className="mt-2 mb-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-800">{r.observed_value}</span>
                            <span className="text-xs font-black text-slate-400 uppercase">{r.unit}</span>
                          </div>
                          <p className="text-xs text-slate-400 font-medium mt-1">Observed Value</p>
                        </div>

                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${r.is_normal === false ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {r.is_normal === false ? 'Attention' : 'Normal Range'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-3 md:p-4 border-t border-slate-50 flex justify-between items-center text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-4 md:px-8 shrink-0">
          <span>ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
          <span className="text-teal-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span> <span className="hidden sm:inline">HIPAA Compliant</span></span>
        </div>
      </div>
    </div>
  );
}
