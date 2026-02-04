import { useState, useEffect } from "react";
import { createUser, updateUser } from "../../api/users.api";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import toast from "react-hot-toast";

export default function AddUser() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user: currentUser } = useAuth();
    const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "doctor" });
    const [initialUser, setInitialUser] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        // Pre-select role if passed via navigation state
        if (location.state?.role && location.state.role !== 'all') {
            setNewUser(prev => ({ ...prev, role: location.state.role }));
        }

        // Handle Edit Mode
        if (location.state?.userToEdit) {
            setIsEditMode(true);
            const { username, email, role, id } = location.state.userToEdit;
            const userData = { username, email, role, id, password: "" };
            setNewUser(userData);
            setInitialUser(userData);
        }
    }, [location.state]);

    const hasChanges = () => {
        if (!isEditMode) return true; // Always allow create
        if (!initialUser) return false;

        return newUser.email !== initialUser.email ||
            newUser.password !== "" ||
            newUser.role !== initialUser.role ||
            newUser.specialization !== initialUser.specialization;
    };

    const handleSubmit = async () => {
        if (isEditMode && !hasChanges()) {
            toast("No changes detected", { icon: "ℹ️" });
            return;
        }

        try {
            if (isEditMode) {
                await updateUser(newUser.id, newUser);
                toast.success("User updated successfully");
            } else {
                await createUser(newUser);
                toast.success(`${newUser.role} created successfully`);
            }
            navigate("/users"); // Go back to list
        } catch (err) {
            toast.error(err.message);
        }
    };

    const isSelfEdit = isEditMode && currentUser?.id === newUser.id;

    return (
        <div className="max-w-2xl mx-auto animate-fade-in-up py-8">
            <div className="mb-8">
                <Button variant="ghost" onClick={() => navigate("/users")} className="mb-4 text-slate-500 hover:text-slate-800 -ml-4">
                    &larr; Back to Users
                </Button>
                <h1 className="text-3xl font-bold text-slate-900">{isEditMode ? "Edit User" : "Add New User"}</h1>
                <p className="text-slate-500 mt-2">
                    {isEditMode ? "Update account details and role permissions." : "Create a new account for a Doctor, Staff member, or Administrator."}
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                {/* Role Selection Header */}
                {/* Role Selection Header - Create Mode Only */}
                {!isEditMode && (
                    <div className="bg-slate-50 px-8 py-8 border-b border-slate-100">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                            Select Role
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { id: 'doctor', label: 'Doctor', icon: '🩺', color: 'teal', desc: 'Medical Provider' },
                                { id: 'staff', label: 'Staff', icon: '🪪', color: 'orange', desc: 'Clinic Support' },
                                { id: 'admin', label: 'Admin', icon: '🛡️', color: 'purple', desc: 'Full Access' }
                            ].map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => setNewUser({ ...newUser, role: role.id })}
                                    className={`
                                    flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden group text-left
                                    ${newUser.role === role.id
                                            ? `border-${role.color}-500 bg-white shadow-lg ring-1 ring-${role.color}-500 transform scale-[1.02]`
                                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'}
                                `}
                                >
                                    <span className={`text-3xl mb-3 transition-transform duration-300 ${newUser.role === role.id ? 'scale-110' : 'group-hover:scale-110'}`}>{role.icon}</span>
                                    <span className={`font-bold text-lg ${newUser.role === role.id ? `text-${role.color}-700` : 'text-slate-700'}`}>{role.label}</span>
                                    <span className="text-xs text-slate-400 font-medium mt-1">{role.desc}</span>

                                    {newUser.role === role.id && (
                                        <div className={`absolute top-3 right-3 w-3 h-3 rounded-full bg-${role.color}-500 animate-pulse`}></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Form Body */}
                <div className="p-8 space-y-8">
                    {/* Identity Section */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">Account Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Role Display (Edit Mode Only) */}
                            {isEditMode && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Current Role</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3.5 text-slate-400">🛡️</span>
                                        <Input
                                            value={newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)}
                                            readOnly
                                            className="pl-10 h-12 bg-slate-100 border-slate-200 text-slate-500 font-medium cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">
                                    {newUser.role === 'doctor' ? 'Surname / Username' : 'Username'}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3.5 text-slate-400">
                                        {newUser.role === 'doctor' ? '👨‍⚕️' : '👤'}
                                    </span>
                                    <Input
                                        placeholder=""
                                        value={newUser.username}
                                        onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                        className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors disabled:bg-slate-100 disabled:text-slate-500"
                                        disabled={isEditMode}
                                    />
                                    {newUser.role === 'doctor' && (
                                        <p className="text-[10px] text-slate-400 mt-1 pl-1">
                                            "Dr." prefix will be added automatically in displays.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3.5 text-slate-400">✉️</span>
                                    <Input
                                        type="email"
                                        placeholder=""
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">Security & Access</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">
                                    {isEditMode ? "New Password (Optional)" : "Set Password"}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3.5 text-slate-400">🔒</span>
                                    <Input
                                        type="password"
                                        placeholder=""
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Specialization (Doctor Only) */}
                            {newUser.role === 'doctor' && (
                                <div className="space-y-1.5 animate-fade-in-up">
                                    <label className="text-sm font-semibold text-teal-700 flex items-center gap-1">
                                        Specialization <span className="text-teal-400 text-xs">(Required)</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3.5 text-teal-500">🩺</span>
                                        <div className="relative">
                                            <input
                                                list="specializations"
                                                placeholder=""
                                                value={newUser.specialization || ""}
                                                onChange={e => setNewUser({ ...newUser, specialization: e.target.value })}
                                                className="w-full pl-10 h-12 border border-teal-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-teal-50/20 transition-all font-medium text-slate-700"
                                            />
                                            <datalist id="specializations">
                                                <option value="General Practice" />
                                                <option value="Cardiology" />
                                                <option value="Dermatology" />
                                                <option value="Neurology" />
                                                <option value="Pediatrics" />
                                                <option value="Orthopedics" />
                                                <option value="Gynecology" />
                                                <option value="Ophthalmology" />
                                                <option value="Psychiatry" />
                                                <option value="Radiology" />
                                                <option value="Urology" />
                                                <option value="Oncology" />
                                                <option value="Dentistry" />
                                            </datalist>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-teal-600/70 pl-1">
                                        Choose from the list or type a new one.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/users")}
                        className="text-slate-500 hover:text-slate-800 font-medium h-12 px-6"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isEditMode && !hasChanges()}
                        className={`shadow-xl shadow-teal-500/20 px-10 h-12 text-lg font-semibold tracking-wide transform active:scale-95 transition-all
                            ${isEditMode && !hasChanges() ? 'opacity-50 cursor-not-allowed bg-slate-400 shadow-none' : ''}
                        `}
                    >
                        {isEditMode ? "Update Account" : "Create Account"}
                    </Button>
                </div>
            </div>
        </div >
    );
}
