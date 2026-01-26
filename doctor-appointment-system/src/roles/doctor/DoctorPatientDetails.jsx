import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import toast from "react-hot-toast";
import { getLabReports } from "../../api/lab.api";
import LabReportTemplate from "../../components/domain/LabReportTemplate";

export default function DoctorPatientDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [patient, setPatient] = useState(null);
    const [activeTab, setActiveTab] = useState('clinical'); // clinical, prescription, referral, history, labs
    const [doctors, setDoctors] = useState([]);
    const [reports, setReports] = useState([]);
    const [currentAppointment, setCurrentAppointment] = useState(null);
    const [diagnosis, setDiagnosis] = useState("");
    const [selectedReport, setSelectedReport] = useState(null);
    const [showCompleteModal, setShowCompleteModal] = useState(false);

    // Form States
    const [prescriptionItems, setPrescriptionItems] = useState(() => {
        const saved = localStorage.getItem(`rx_draft_items_${id}`);
        return saved ? JSON.parse(saved) : [{ id: Date.now(), name: '', dosage: '', frequency: '1-0-1', duration: '' }];
    });
    const [notes, setNotes] = useState(() => {
        return localStorage.getItem(`rx_draft_notes_${id}`) || "";
    });
    const [isPrescribing, setIsPrescribing] = useState(false);
    const [referDoctor, setReferDoctor] = useState("");
    const [referReason, setReferReason] = useState("");
    const [referLoading, setReferLoading] = useState(false);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [editForm, setEditForm] = useState({ age: "", gender: "", blood_group: "" });

    // Vitals Logic
    const [showVitalsModal, setShowVitalsModal] = useState(false);
    const [vitalsForm, setVitalsForm] = useState({ Weight: "", "Body Temperature": "", "Pulse Rate": "", "Respiration Rate": "", BP: "" });

    const handleSaveVitals = async (e) => {
        e.preventDefault();
        if (!currentAppointment) return;
        try {
            await apiClient.patch(`/appointments/${currentAppointment.id}/status/`, {
                vitals: JSON.stringify(vitalsForm)
            });
            setCurrentAppointment(prev => ({ ...prev, vitals: JSON.stringify(vitalsForm) }));
            toast.success("Vitals recorded successfully");
            setShowVitalsModal(false);
        } catch (err) {
            toast.error("Failed to update vitals");
        }
    };

    const openVitalsModal = () => {
        const existing = getVitals();
        setVitalsForm({
            Weight: existing.Weight || existing.weight || "",
            "Body Temperature": existing["Body Temperature"] || "",
            "Pulse Rate": existing["Pulse Rate"] || "",
            "Respiration Rate": existing["Respiration Rate"] || "",
            BP: existing.BP || ""
        });
        setShowVitalsModal(true);
    };

    const openEditProfileModal = () => {
        const currentVitals = getVitals();
        setEditForm({
            age: patient.age || "",
            gender: patient.gender || "",
            blood_group: patient.blood_group || "",
            weight: currentVitals.Weight || currentVitals.weight || ""
        });
        setShowEditProfileModal(true);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        // 1. Update User Profile
        const profilePayload = {};
        if (editForm.age) profilePayload.age = editForm.age;
        if (editForm.gender) profilePayload.gender = editForm.gender;
        if (editForm.blood_group) profilePayload.blood_group = editForm.blood_group;

        try {
            await apiClient.patch(`/users/${patient.id}/`, profilePayload);
            setPatient(prev => ({ ...prev, ...profilePayload }));

            // 2. Update Weight in Vitals (if changed and appointment exists)
            if (currentAppointment && editForm.weight) {
                const currentVitals = getVitals();
                const newVitals = { ...currentVitals, Weight: editForm.weight };

                await apiClient.patch(`/appointments/${currentAppointment.id}/status/`, {
                    vitals: JSON.stringify(newVitals)
                });

                setCurrentAppointment(prev => ({ ...prev, vitals: JSON.stringify(newVitals) }));
            }

            toast.success("Patient details updated");
            setShowEditProfileModal(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update details");
        }
    };

    useEffect(() => {
        if (prescriptionItems.length > 1 || (prescriptionItems[0].name !== '')) {
            localStorage.setItem(`rx_draft_items_${id}`, JSON.stringify(prescriptionItems));
        }
        localStorage.setItem(`rx_draft_notes_${id}`, notes);
    }, [prescriptionItems, notes, id]);

    useEffect(() => {
        const saved = localStorage.getItem(`rx_draft_items_${id}`);
        if (saved && JSON.parse(saved)[0]?.name !== '') {
            toast.success("Draft prescription restored", {
                icon: '📝',
                style: {
                    borderRadius: '15px',
                    background: '#1e293b',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }
            });
        }
    }, [id]);

    useEffect(() => {
        // Fetch patient details
        apiClient.get(`/users/${id}/`)
            .then(res => setPatient(res.data))
            .catch(() => toast.error("Failed to load patient"));

        // Fetch doctors and labs
        apiClient.get('/doctors/').then(res => setDoctors(res.data));
        getLabReports().then(setReports);

        apiClient.get('/appointments/').then(res => {
            const active = res.data.find(a =>
                (String(a.patient) === String(id) || String(a.patient_id) === String(id)) &&
                ['pending', 'confirmed', 'in_progress'].includes(a.status)
            );
            setCurrentAppointment(active);
            if (active?.diagnosis) setDiagnosis(active.diagnosis);
        });
    }, [id]);

    const updateStatus = async (status) => {
        if (!currentAppointment) return;
        try {
            const payload = { status };
            if (status === 'completed') {
                payload.diagnosis = diagnosis;
            }
            await apiClient.patch(`/appointments/${currentAppointment.id}/status/`, payload);
            setCurrentAppointment(prev => ({ ...prev, ...payload }));
            toast.success(status === 'in_progress' ? "Checkup Started" : "Session Completed");
            if (status === 'completed') {
                navigate(-1);
            }
        } catch (err) {
            toast.error("Status update failed");
        }
    };

    const addPrescriptionRow = () => {
        setPrescriptionItems([...prescriptionItems, { id: Date.now(), name: '', dosage: '', frequency: '1-0-1', duration: '' }]);
    };

    const removePrescriptionRow = (id) => {
        if (prescriptionItems.length === 1) return;
        setPrescriptionItems(prescriptionItems.filter(item => item.id !== id));
    };

    const updatePrescriptionItem = (id, field, value) => {
        setPrescriptionItems(prescriptionItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handlePrescribe = async (e) => {
        e.preventDefault();
        const validItems = prescriptionItems.filter(i => i.name.trim());
        if (validItems.length === 0) return toast.error("Please add at least one medicine");

        setIsPrescribing(true);
        const formattedMedicines = validItems.map(i =>
            `${i.name} ${i.dosage ? `- ${i.dosage}` : ''} (${i.frequency}) for ${i.duration || 'N/A'}`
        ).join('\n');

        const loadingToast = toast.loading("Sending Prescription...");
        try {
            await apiClient.post('/prescriptions/create/', {
                patient_id: id,
                medicines: formattedMedicines,
                notes: notes
            });

            toast.dismiss(loadingToast);
            toast.success("Prescription Added", { duration: 4000 });

            // Clear Drafts
            localStorage.removeItem(`rx_draft_items_${id}`);
            localStorage.removeItem(`rx_draft_notes_${id}`);

            setPrescriptionItems([{ id: Date.now(), name: '', dosage: '', frequency: '1-0-1', duration: '' }]);
            setNotes("");

            // Navigate back after a short delay for the toast to be seen
            setTimeout(() => navigate(-1), 1500);
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.message || "Failed to prescribe");
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
                patient_id: id,
                to_doctor_id: referDoctor,
                reason: referReason
            });
            toast.success(`Referral Authorized`);
            setReferDoctor("");
            setReferReason("");
            navigate(-1); // Go back
        } catch (err) {
            toast.error("Referral failed");
        } finally {
            setReferLoading(false);
        }
    };

    if (!patient) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Accessing Medical Records...</p>
        </div>
    );

    const getVitals = () => {
        if (!currentAppointment?.vitals) return {};
        try {
            const parsed = typeof currentAppointment.vitals === 'string'
                ? JSON.parse(currentAppointment.vitals)
                : currentAppointment.vitals;
            // Filter out empty values
            const filtered = {};
            Object.entries(parsed).forEach(([k, v]) => {
                if (v && String(v).trim() !== "") filtered[k] = v;
            });
            return filtered;
        } catch (e) {
            return { "Clinical Notes": currentAppointment.vitals };
        }
    };

    const vitalsData = getVitals();

    return (
        <div className="min-h-screen bg-slate-50 pb-12 animate-fade-in relative z-0">
            {/* Top Bar */}
            {/* Top Bar */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 shadow-sm transition-all">
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 md:py-0 md:h-20 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all active:scale-95 border border-slate-200/50"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div>
                            <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-none">{patient.username}</h1>
                            <p className="text-[10px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Patient #{patient.id}</p>
                        </div>
                    </div>

                    <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar gap-1 bg-slate-100/50 p-1 rounded-xl">
                        {['clinical', 'prescription', 'referral', 'history', 'labs'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                     px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0
                     ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}
                   `}
                            >
                                {
                                    tab === 'clinical' ? 'Clinical' :
                                        tab === 'prescription' ? 'Prescription' :
                                            tab === 'referral' ? 'Referral' :
                                                tab === 'history' ? 'History' :
                                                    tab === 'labs' ? 'Lab Results' :
                                                        tab
                                }
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">

                {/* Left: Patient Sidebar Card */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative md:sticky md:top-24 mt-0">
                    <div className="p-6 md:p-8 text-center bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                        <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-white rounded-full flex items-center justify-center text-4xl md:text-5xl font-black text-teal-600 shadow-2xl shadow-teal-100/50 border-4 border-white mb-4">
                            {patient.username[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col gap-2 mb-6 px-4">
                            {currentAppointment ? (
                                <>
                                    {['pending', 'confirmed'].includes(currentAppointment.status) && (
                                        <Button onClick={() => updateStatus('in_progress')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                                            Start Checkup
                                        </Button>
                                    )}
                                    {currentAppointment.status === 'in_progress' && (
                                        <Button onClick={() => setShowCompleteModal(true)} className="w-full bg-slate-900 hover:bg-black text-white shadow-lg">
                                            Complete Session
                                        </Button>
                                    )}
                                    <div className="text-center mt-2">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${currentAppointment.status === 'in_progress' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}>
                                            {currentAppointment.status === 'in_progress' ? '● In Progress' : '● Ready'}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center">
                                    <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100">Viewing Record</span>
                                </div>
                            )}

                            {currentAppointment && (
                                <div className="mt-6 pt-6 border-t border-slate-100 text-left">
                                    <div className="mb-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reason for Visit</p>
                                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                            <p className="text-xs font-bold text-slate-700 leading-relaxed italic">
                                                "{currentAppointment.reason || 'No specific reason provided.'}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Date</p>
                                            <p className="text-xs font-black text-slate-700">{new Date(currentAppointment.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Time</p>
                                            <p className="text-xs font-black text-slate-700">{new Date(currentAppointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Token</p>
                                            <p className="text-xs font-black text-indigo-600">#{currentAppointment.token_number || '--'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 text-left relative group/profile">
                            <button
                                onClick={openEditProfileModal}
                                className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/profile:opacity-100 transition-all hover:scale-110 z-10"
                                title="Edit Patient Details"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                                </svg>
                            </button>

                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <span className="block text-lg md:text-xl font-black text-slate-800">{patient.age || '--'}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Age</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <span className="block text-lg md:text-xl font-black text-slate-800">{patient.gender || '--'}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sex</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <span className="block text-lg md:text-xl font-black text-slate-800">{patient.blood_group || '--'}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Blood Grp</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <span className="block text-lg md:text-xl font-black text-slate-800">{vitalsData.weight || vitalsData.Weight || '--'}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Weight</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Contact Information</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">📧</div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-slate-700 truncate">{patient.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">📞</div>
                                    <p className="text-xs font-bold text-slate-700">{patient.phone_number || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Medical History</h3>
                            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-xs font-medium text-slate-600 leading-relaxed">
                                {patient.medical_history || "No records found."}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Work Area */}
                <div className="space-y-6 min-h-[60vh]">

                    {activeTab === 'clinical' && (
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 animate-fade-in">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                                <div className="flex-1">
                                    <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg shadow-teal-100">
                                        🩺
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Clinical Overview</h2>
                                    <p className="text-slate-500 font-medium">
                                        Review primary vitals and record final diagnosis for <span className="font-bold text-slate-900">{patient.username}</span>.
                                    </p>
                                </div>

                                <div className="w-full md:w-64 space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Vitals</h3>
                                        <button
                                            onClick={openVitalsModal}
                                            className="text-[10px] font-black text-teal-600 hover:bg-teal-50 px-2 py-1 rounded transition-colors"
                                        >
                                            + Update
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(vitalsData).length > 0 ? Object.entries(vitalsData).map(([k, v]) => (
                                            <div key={k} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{k}</p>
                                                <p className="text-sm font-black text-slate-800">{v}</p>
                                            </div>
                                        )) : (
                                            <div className="col-span-2 p-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                <p className="text-[10px] font-bold text-slate-400 italic">
                                                    {currentAppointment ? "Waiting for nurse..." : "No active session"}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-10 border-t border-slate-100">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 text-left">Diagnosis & Assessment</h3>
                                <textarea
                                    className="w-full h-48 bg-slate-50 rounded-3xl p-6 font-medium text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-teal-50 border-2 border-transparent focus:border-teal-100 transition-all resize-none shadow-inner"
                                    placeholder="Enter clinical findings, assessments, and diagnosis here..."
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    disabled={currentAppointment?.status === 'completed'}
                                />
                                {currentAppointment?.status === 'in_progress' && (
                                    <div className="mt-6 flex justify-end">
                                        <Button onClick={() => setShowCompleteModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-xl hover:-translate-y-1 transition-all">
                                            Finalize & Complete Session
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'prescription' && (
                        <Card className="p-0 overflow-hidden border-none shadow-xl shadow-indigo-100/50 animate-slide-up bg-white rounded-3xl">
                            <div className="bg-indigo-600 p-6 relative overflow-hidden flex items-center justify-between">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                                <div>
                                    <h2 className="text-xl font-black tracking-tight text-white relative z-10">New Prescription</h2>
                                    <p className="text-indigo-200 text-xs font-bold mt-1 relative z-10">Digital pharmacy order</p>
                                </div>
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl text-indigo-100">💊</div>
                            </div>
                            <div className="p-6 bg-white">
                                <form onSubmit={handlePrescribe} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medication Order List</label>
                                            <button
                                                type="button"
                                                onClick={addPrescriptionRow}
                                                className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100"
                                            >
                                                + Add Line
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            {/* Header Hidden on Mobile */}
                                            <div className="hidden md:grid grid-cols-[1fr_120px_120px_150px_40px] gap-3 px-4 mb-2">
                                                <span className="text-[8px] font-black text-slate-400 uppercase">Medicine Name</span>
                                                <span className="text-[8px] font-black text-slate-400 uppercase">Dosage</span>
                                                <span className="text-[8px] font-black text-slate-400 uppercase">Frequency</span>
                                                <span className="text-[8px] font-black text-slate-400 uppercase">Duration</span>
                                                <span></span>
                                            </div>

                                            {prescriptionItems.map((item) => (
                                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_150px_40px] gap-2 md:gap-3 p-2 md:p-3 bg-slate-50 rounded-2xl border border-slate-100 items-center">
                                                    <input
                                                        className="h-10 bg-white border border-slate-200 px-3 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100"
                                                        placeholder="e.g. Paracetamol"
                                                        value={item.name}
                                                        onChange={(e) => updatePrescriptionItem(item.id, 'name', e.target.value)}
                                                    />
                                                    <input
                                                        className="h-10 bg-white border border-slate-200 px-3 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100"
                                                        placeholder="e.g. 500mg"
                                                        value={item.dosage}
                                                        onChange={(e) => updatePrescriptionItem(item.id, 'dosage', e.target.value)}
                                                    />
                                                    <select
                                                        className="h-10 bg-white border border-slate-200 px-2 rounded-xl text-[10px] font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100"
                                                        value={item.frequency}
                                                        onChange={(e) => updatePrescriptionItem(item.id, 'frequency', e.target.value)}
                                                    >
                                                        <option value="1-0-1">1-0-1 (BID)</option>
                                                        <option value="1-1-1">1-1-1 (TID)</option>
                                                        <option value="1-0-0">1-0-0 (Morning)</option>
                                                        <option value="0-0-1">0-0-1 (Night)</option>
                                                        <option value="SOS">SOS (As needed)</option>
                                                    </select>
                                                    <input
                                                        className="h-10 bg-white border border-slate-200 px-3 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100"
                                                        placeholder="e.g. 5 Days"
                                                        value={item.duration}
                                                        onChange={(e) => updatePrescriptionItem(item.id, 'duration', e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removePrescriptionRow(item.id)}
                                                        className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                        disabled={prescriptionItems.length === 1}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Pharmacy Instructions</label>
                                        <input
                                            className="w-full h-12 bg-slate-50 rounded-xl px-4 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 border border-transparent focus:border-indigo-200 transition-all"
                                            placeholder="Special notes for the dispenser..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>
                                    <Button disabled={isPrescribing} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                                        {isPrescribing ? (
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        ) : '✦ Add Prescription'}
                                    </Button>
                                </form>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'referral' && (
                        <Card className="p-0 overflow-hidden border-none shadow-xl shadow-rose-100/50 animate-slide-up bg-white rounded-3xl">
                            <div className="bg-rose-500 p-6 relative overflow-hidden flex items-center justify-between">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                                <div>
                                    <h2 className="text-xl font-black tracking-tight text-white relative z-10">Referral Order</h2>
                                    <p className="text-rose-100 text-xs font-bold mt-1 relative z-10">Transfer patient care</p>
                                </div>
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl text-rose-100">🏥</div>
                            </div>
                            <div className="p-6 bg-white">
                                <form onSubmit={handleReferral} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Specialist</label>
                                        <div className="relative">
                                            <select className="w-full h-12 bg-slate-50 rounded-xl px-4 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-rose-100 border border-transparent focus:border-rose-200 transition-all appearance-none cursor-pointer"
                                                value={referDoctor}
                                                onChange={(e) => setReferDoctor(e.target.value)}
                                            >
                                                <option value="">Select Doctor...</option>
                                                {doctors.filter(d => d.id !== user?.id).map(d => (
                                                    <option key={d.id} value={d.id}>Dr. {d.username} - {d.specialization}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Reason for Referral</label>
                                        <textarea
                                            className="w-full h-32 bg-slate-50 rounded-2xl p-4 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-rose-100 border border-transparent focus:border-rose-200 transition-all resize-none"
                                            placeholder="Clinical justification..."
                                            value={referReason}
                                            onChange={(e) => setReferReason(e.target.value)}
                                        />
                                    </div>
                                    <Button disabled={referLoading} className="w-full h-12 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                                        {referLoading ? 'Processing...' : 'Authorize Referral'}
                                    </Button>
                                </form>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'history' && (
                        <div className="bg-white p-12 text-center rounded-[2.5rem] border border-slate-100 shadow-xl opacity-60">
                            <p className="font-bold text-slate-400">History module ready for integration.</p>
                        </div>
                    )}

                    {activeTab === 'labs' && (
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 animate-fade-in">
                            <div className="text-center mb-10">
                                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-xl shadow-blue-100">
                                    🧪
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Diagnostics</h2>
                                <p className="text-slate-500 font-medium">Laboratory results for <span className="font-bold text-slate-900">{patient.username}</span>.</p>
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
                                        <div
                                            key={r.id}
                                            className="bg-slate-50 p-6 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all border-l-[6px] border-l-blue-400 cursor-pointer"
                                            onClick={() => {
                                                const batch = (reports || []).filter(item =>
                                                    item.patient === r.patient &&
                                                    Math.abs(new Date(item.date) - new Date(r.date)) < 30000
                                                );
                                                setSelectedReport(batch);
                                            }}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{r.test_name}</p>
                                                    <p className="text-xs font-bold text-slate-500">{new Date(r.date || r.created_at || Date.now()).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-2xl font-black text-slate-800">{r.observed_value} <span className="text-xs text-slate-400">{r.unit}</span></span>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-slate-200/50 flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${r.is_normal === false ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    {r.is_normal === false ? 'Requires Attention' : 'Normal Range'}
                                                </span>
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {showCompleteModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl relative">
                        <div className="text-4xl mb-4 text-center">⚠️</div>
                        <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Complete Session?</h3>
                        <p className="text-slate-500 text-center text-sm mb-6">
                            Finalize diagnosis and return to dashboard?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCompleteModal(false)}
                                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm"
                            >
                                No
                            </button>
                            <button
                                onClick={() => {
                                    setShowCompleteModal(false);
                                    updateStatus('completed');
                                }}
                                className="flex-1 py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg"
                            >
                                Yes, Complete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedReport && (
                <LabReportTemplate
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                />
            )}

            {showEditProfileModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative animate-scale-in">
                        <button
                            onClick={() => setShowEditProfileModal(false)}
                            className="absolute top-4 right-4 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all"
                        >✕</button>

                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-black text-slate-900">Update Patient Identity</h3>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mt-2">Modify demographics for {patient.username}</p>
                        </div>

                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Age (Years)</label>
                                    <input
                                        type="number"
                                        className="w-full h-12 bg-slate-50 rounded-xl px-4 font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-teal-100 border border-transparent focus:border-teal-200 transition-all"
                                        value={editForm.age}
                                        onChange={e => setEditForm({ ...editForm, age: e.target.value })}
                                        placeholder={patient.age || "e.g. 25"}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Gender</label>
                                    <select
                                        className="w-full h-12 bg-slate-50 rounded-xl px-4 font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-teal-100 border border-transparent focus:border-teal-200 transition-all appearance-none"
                                        value={editForm.gender}
                                        onChange={e => setEditForm({ ...editForm, gender: e.target.value })}
                                    >
                                        <option value="">Select...</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Blood Group</label>
                                <select
                                    className="w-full h-12 bg-slate-50 rounded-xl px-4 font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-teal-100 border border-transparent focus:border-teal-200 transition-all appearance-none"
                                    value={editForm.blood_group}
                                    onChange={e => setEditForm({ ...editForm, blood_group: e.target.value })}
                                >
                                    <option value="">Select...</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Weight (kg)</label>
                                <input
                                    type="text"
                                    className="w-full h-12 bg-slate-50 rounded-xl px-4 font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-teal-100 border border-transparent focus:border-teal-200 transition-all"
                                    value={editForm.weight || ""}
                                    onChange={e => setEditForm({ ...editForm, weight: e.target.value })}
                                    placeholder="e.g. 70"
                                />
                            </div>

                            <Button type="submit" className="w-full h-14 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all mt-4">
                                Save Changes
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {showVitalsModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative animate-scale-in">
                        <button
                            onClick={() => setShowVitalsModal(false)}
                            className="absolute top-4 right-4 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all"
                        >✕</button>

                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-black text-slate-900">Record Vitals</h3>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mt-2">Current session readings</p>
                        </div>

                        <form onSubmit={handleSaveVitals} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Weight (kg)</label>
                                    <input className="w-full h-12 bg-slate-50 rounded-xl px-4 font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-teal-100 border border-transparent focus:border-teal-200"
                                        value={vitalsForm.Weight} onChange={e => setVitalsForm({ ...vitalsForm, Weight: e.target.value })} placeholder="e.g. 70" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">BP (mmHg)</label>
                                    <input className="w-full h-12 bg-slate-50 rounded-xl px-4 font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-teal-100 border border-transparent focus:border-teal-200"
                                        value={vitalsForm.BP} onChange={e => setVitalsForm({ ...vitalsForm, BP: e.target.value })} placeholder="e.g. 120/80" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Temperature (°F)</label>
                                <input className="w-full h-12 bg-slate-50 rounded-xl px-4 font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-teal-100 border border-transparent focus:border-teal-200"
                                    value={vitalsForm["Body Temperature"]} onChange={e => setVitalsForm({ ...vitalsForm, "Body Temperature": e.target.value })} placeholder="e.g. 98.6" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Pulse (bpm)</label>
                                    <input className="w-full h-12 bg-slate-50 rounded-xl px-4 font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-teal-100 border border-transparent focus:border-teal-200"
                                        value={vitalsForm["Pulse Rate"]} onChange={e => setVitalsForm({ ...vitalsForm, "Pulse Rate": e.target.value })} placeholder="e.g. 72" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Resp. Rate</label>
                                    <input className="w-full h-12 bg-slate-50 rounded-xl px-4 font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-teal-100 border border-transparent focus:border-teal-200"
                                        value={vitalsForm["Respiration Rate"]} onChange={e => setVitalsForm({ ...vitalsForm, "Respiration Rate": e.target.value })} placeholder="e.g. 16" />
                                </div>
                            </div>

                            <Button className="w-full h-14 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all mt-4">
                                Update Records
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
}
