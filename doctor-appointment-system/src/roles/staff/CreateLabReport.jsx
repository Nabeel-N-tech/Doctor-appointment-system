import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createLabReport } from "../../api/lab.api";
import { getAllUsers } from "../../api/users.api";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function CreateLabReport() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Form State
    const [patientId, setPatientId] = useState("");

    const [testItems, setTestItems] = useState([
        { id: Date.now(), test_name: "", observed_value: "", unit: "mg/dL", reference_range: "" }
    ]);

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        try {
            const users = await getAllUsers();
            setPatients(users.filter(u => u.role === 'patient'));
        } catch (err) {
            toast.error("Failed to load patient list");
        } finally {
            setLoading(false);
        }
    };

    const addTestRow = () => {
        setTestItems([...testItems, { id: Date.now(), test_name: "", observed_value: "", unit: "mg/dL", reference_range: "" }]);
    };

    const removeTestRow = (id) => {
        if (testItems.length === 1) return;
        setTestItems(testItems.filter(item => item.id !== id));
    };

    const handleItemChange = (id, field, value) => {
        setTestItems(testItems.map(item => item.id === id ? { ...item, [field]: value } : item));
    };



    const filteredPatients = patients.filter(p =>
        p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(p.id).includes(searchTerm)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!patientId) return toast.error("Please select a patient");

        const validItems = testItems.filter(i => i.test_name && i.observed_value);
        if (validItems.length === 0) return toast.error("Please add at least one test with a value");

        setIsSubmitting(true);
        try {
            const payload = {
                patient_id: patientId,
                reports: validItems.map(item => ({
                    test_name: item.test_name,
                    observed_value: item.observed_value,
                    unit: item.unit,
                    reference_range: item.reference_range
                }))
            };

            await createLabReport(payload);
            toast.success("Lab Reports Batch Uploaded!");
            navigate("/");
        } catch (err) {
            toast.error("Failed to upload reports.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 flex justify-center">
            <div className="w-full max-w-5xl">

                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link to="/" className="text-slate-500 hover:text-slate-800 text-sm font-bold flex items-center gap-2 mb-2 transition-colors">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Generate Lab Report</h1>
                        <p className="text-slate-500 font-medium italic">Support for multiple tests in a single entry</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                    <div className="space-y-6">
                        {/* 1. Patient Selection */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-blue-200">1</div>
                                    <h3 className="text-xl font-black text-slate-800">Identify Patient</h3>
                                </div>
                                {selectedPatient && (
                                    <button
                                        onClick={() => {
                                            setSelectedPatient(null);
                                            setPatientId("");
                                        }}
                                        className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        Change Patient
                                    </button>
                                )}
                            </div>

                            {!selectedPatient ? (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold pr-12"
                                            placeholder=""
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div className="max-h-64 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                        {searchTerm && filteredPatients.length === 0 ? (
                                            <p className="text-center py-4 text-slate-400 font-medium">No patients found matches "{searchTerm}"</p>
                                        ) : (
                                            (searchTerm ? filteredPatients : []).map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => {
                                                        setSelectedPatient(p);
                                                        setPatientId(p.id);
                                                        setSearchTerm("");
                                                    }}
                                                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all group"
                                                >
                                                    <div className="flex items-center gap-4 text-left">
                                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-blue-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform text-sm">
                                                            {p.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900 leading-none mb-1">{p.username}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {p.id}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-slate-300 group-hover:text-blue-500 transition-colors">→</span>
                                                </button>
                                            ))
                                        )}
                                        {!searchTerm && patients.length > 0 && (
                                            <p className="text-center py-10 text-slate-300 font-black uppercase tracking-widest text-[10px]">
                                                Search above to find a patient
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-6 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 animate-fade-in">
                                    <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center text-3xl font-black text-blue-600 shadow-xl shadow-blue-200/50 border-2 border-white">
                                        {selectedPatient.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="text-2xl font-black text-slate-900 tracking-tight">{selectedPatient.username}</h4>
                                            <span className="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-lg shadow-blue-200">Selected</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Patient ID: <span className="text-slate-600">{selectedPatient.id}</span></p>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Role: <span className="text-slate-600">{selectedPatient.role}</span></p>
                                        </div>
                                    </div>
                                    <div className="hidden md:block">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                                            ✓
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Test Items (Bulk Selection) */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="bg-emerald-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-emerald-200">2</div>
                                    <h3 className="text-xl font-black text-slate-800">Test Specifications</h3>
                                </div>
                                <button
                                    onClick={addTestRow}
                                    className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100"
                                >
                                    + Add Metric
                                </button>
                            </div>

                            <div className="space-y-4">
                                {testItems.map((item, index) => (
                                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group animate-fade-in">
                                        <div className="md:col-span-4">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Test Name</label>
                                            <input
                                                className="w-full h-11 bg-white border border-slate-200 px-3 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                                                placeholder=""
                                                value={item.test_name}
                                                onChange={(e) => handleItemChange(item.id, "test_name", e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Value</label>
                                            <input
                                                className="w-full h-11 bg-white border border-slate-200 px-3 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                                                placeholder=""
                                                value={item.observed_value}
                                                onChange={(e) => handleItemChange(item.id, "observed_value", e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Unit</label>
                                            <input
                                                className="w-full h-11 bg-white border border-slate-200 px-3 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                                                placeholder=""
                                                value={item.unit}
                                                onChange={(e) => handleItemChange(item.id, "unit", e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Ref Range</label>
                                            <input
                                                className="w-full h-11 bg-white border border-slate-200 px-3 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                                                placeholder=""
                                                value={item.reference_range}
                                                onChange={(e) => handleItemChange(item.id, "reference_range", e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-1 flex items-end">
                                            <button
                                                onClick={() => removeTestRow(item.id)}
                                                className="h-11 w-full flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                disabled={testItems.length === 1}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>

                    {/* Right: Submit Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white sticky top-10 shadow-2xl shadow-slate-900/30 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                            <h4 className="text-lg font-black mb-6 tracking-tight">Report Summary</h4>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Total Tests</p>
                                    <p className="text-2xl font-black">{testItems.filter(i => i.test_name && i.observed_value).length}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Target Patient</p>
                                    <p className="text-sm font-bold truncate">{selectedPatient?.username || "None Selected"}</p>
                                </div>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full py-5 mt-10 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black rounded-2xl shadow-xl shadow-emerald-900/40 hover:-translate-y-1 active:translate-y-0 transition-all uppercase tracking-widest text-[11px]"
                            >
                                {isSubmitting ? "Uploading..." : "Publish Full Report"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
