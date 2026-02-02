import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { updateProfile, getProfile } from "../api/users.api";
import toast from "react-hot-toast";


const COUNTRY_CODES = [
    { code: "+91", country: "IN", limit: 10 },
    { code: "+1", country: "US", limit: 10 },
    { code: "+44", country: "UK", limit: 10 },
    { code: "+971", country: "UAE", limit: 9 },
];

export default function Profile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [countryCode, setCountryCode] = useState("+91");
    const [isEditing, setIsEditing] = useState(false);
    const [originalData, setOriginalData] = useState(null);
    const [profileData, setProfileData] = useState({
        username: "",
        email: "",
        phone_number: "",
        address: "",
        age: "",
        gender: "",
        blood_group: "",
        medical_history: ""
    });

    useEffect(() => {
        if (user) {
            loadProfile();
        }
    }, [user]);

    const loadProfile = async () => {
        try {
            const data = await getProfile();

            let initialPhone = data.phone_number || "";
            let initialCode = "+91";

            // Try to match existing country code
            const matched = COUNTRY_CODES.find(c => initialPhone.startsWith(c.code));
            if (matched) {
                initialCode = matched.code;
                initialPhone = initialPhone.replace(matched.code, "");
            }

            setCountryCode(initialCode);
            const initialData = {
                username: data.username || "",
                email: data.email || "",
                phone_number: initialPhone,
                address: data.address || "",
                age: data.age || "",
                gender: data.gender || "",
                blood_group: data.blood_group || "",
                medical_history: data.medical_history || "",
                specialization: data.specialization || ""
            };
            setProfileData(initialData);
            setOriginalData(initialData);
        } catch (error) {
            console.error("Failed to load profile", error);
            // Fallback to basic user info if API fails
            if (user) {
                setProfileData(prev => ({
                    ...prev,
                    username: user.username || "",
                    role: user.role
                }));
            }
        }
    };

    const handleUpdate = async () => {
        setLoading(true);
        const toastId = toast.loading("Updating...");
        try {
            // Combine code and number
            // Sanitize payload
            const payload = {
                phone_number: profileData.phone_number ? `${countryCode}${profileData.phone_number}` : null,
                address: profileData.address,
                medical_history: profileData.medical_history,
                age: profileData.age === "" ? null : profileData.age,
                gender: profileData.gender === "" ? null : profileData.gender,
                blood_group: profileData.blood_group === "" ? null : profileData.blood_group,
                specialization: profileData.specialization // In case doctor 
            };

            await updateProfile(payload);
            toast.success("Profile updated!", { id: toastId });
            setIsEditing(false); // Exit edit mode on success
            // Update original data to match current
            setOriginalData({ ...profileData });
        } catch (e) {
            console.error("Update failed", e);
            const errorMsg = e.response?.data ? JSON.stringify(e.response.data) : "Failed to update.";
            toast.error(errorMsg, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const currentLimit = COUNTRY_CODES.find(c => c.code === countryCode)?.limit || 10;

    // Check for changes (simple deep compare for flat object)
    const hasChanges = JSON.stringify(profileData) !== JSON.stringify(originalData);

    const isPatient = user?.role === 'patient';
    const isDoctor = user?.role === 'doctor';
    const isStaff = user?.role === 'staff';

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm tracking-wide hover:bg-teal-700 transition-all active:scale-95 shadow-lg shadow-teal-200"
                    >
                        <span></span> Edit Profile
                    </button>
                )}
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 relative">
                {/* Visual Indicator for Edit Mode */}
                {isEditing && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-t-2xl animate-pulse"></div>
                )}

                {/* Account Info (Read Only) */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
                        <div className="w-full mt-1 p-3 bg-slate-50 border border-transparent rounded-lg text-slate-700 font-black">
                            {profileData.username}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                        <div className="w-full mt-1 p-3 bg-slate-50 border border-transparent rounded-lg text-slate-700 font-black">
                            {profileData.email}
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* Editable Fields */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        Personal Details
                        {isEditing && <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">Editing Enabled</span>}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Age</label>
                            <input className={`w-full p-3 rounded-lg outline-none transition-all ${isEditing ? 'bg-white border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-50' : 'bg-slate-50 border-transparent text-slate-600'}`}
                                type="number"
                                value={profileData.age || ''}
                                disabled={!isEditing}
                                placeholder={isEditing ? "Enter age" : "Not set"}
                                onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Gender</label>
                            <select className={`w-full p-3 rounded-lg outline-none transition-all ${isEditing ? 'bg-white border border-slate-200 focus:border-teal-500' : 'bg-slate-50 border-transparent text-slate-600 disabled:opacity-100 appearance-none'}`}
                                value={profileData.gender || ''}
                                disabled={!isEditing}
                                onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Blood Group</label>
                            <select className={`w-full p-3 rounded-lg outline-none transition-all ${isEditing ? 'bg-white border border-slate-200 focus:border-teal-500' : 'bg-slate-50 border-transparent text-slate-600 disabled:opacity-100 appearance-none'}`}
                                value={profileData.blood_group || ''}
                                disabled={!isEditing}
                                onChange={(e) => setProfileData({ ...profileData, blood_group: e.target.value })}
                            >
                                <option value="">Select Blood Group</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                    <option key={bg} value={bg}>{bg}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Phone</label>
                            <div className="flex gap-2">
                                <select
                                    className={`w-24 p-3 rounded-lg font-bold text-slate-700 outline-none transition-all ${isEditing ? 'bg-slate-50 border border-slate-200 focus:border-teal-500' : 'bg-slate-50 border-transparent disabled:opacity-100 appearance-none pointer-events-none'}`}
                                    value={countryCode}
                                    disabled={!isEditing}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                >
                                    {COUNTRY_CODES.map((c) => (
                                        <option key={c.code} value={c.code}>
                                            {c.country} ({c.code})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    className={`flex-1 p-3 rounded-lg outline-none transition-all ${isEditing ? 'bg-white border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-50' : 'bg-slate-50 border-transparent text-slate-600'}`}
                                    type="tel"
                                    placeholder={isEditing ? `${currentLimit} digits` : "Not set"}
                                    value={profileData.phone_number || ''}
                                    disabled={!isEditing}
                                    maxLength={currentLimit}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || (/^\d+$/.test(val) && val.length <= currentLimit)) {
                                            setProfileData({ ...profileData, phone_number: val });
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Address</label>
                        <textarea className={`w-full p-3 rounded-lg outline-none transition-all h-24 resize-none ${isEditing ? 'bg-white border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-50' : 'bg-slate-50 border-transparent text-slate-600'}`}
                            value={profileData.address || ''}
                            disabled={!isEditing}
                            placeholder={isEditing ? "Enter your residential address..." : "No address provided."}
                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        ></textarea>
                    </div>

                </div>

                {/* Medical History - Only for Patients */}
                {isPatient && (
                    <div>
                        <label className="text-xs font-bold text-red-500 uppercase mb-1 block">Medical History / Allergies</label>
                        <textarea className={`w-full p-3 rounded-lg outline-none transition-all h-24 resize-none ${isEditing ? 'bg-red-50 border border-red-100 focus:border-red-300 focus:ring-4 focus:ring-red-50 text-red-900' : 'bg-red-50/50 border-transparent text-slate-600'}`}
                            placeholder={isEditing ? "Any allergies or chronic conditions..." : "No medical history recorded."}
                            value={profileData.medical_history || ''}
                            disabled={!isEditing}
                            onChange={(e) => setProfileData({ ...profileData, medical_history: e.target.value })}
                        ></textarea>
                    </div>
                )}

                {/* Doctor/Staff Specific Fields */}
                {(isDoctor || isStaff) && (
                    <div className="pt-4 border-t border-slate-100">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-4">
                            Professional Details
                        </h3>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Specialization / Department</label>
                            <input className={`w-full p-3 rounded-lg outline-none transition-all ${isEditing && isDoctor ? 'bg-white border border-slate-200 focus:border-teal-500' : 'bg-slate-50 border-transparent text-slate-600'}`}
                                type="text"
                                value={profileData.specialization || (isStaff ? "Hospital Staff" : "")}
                                disabled={!isEditing || isStaff} // Staff usually can't edit dept or it's hardcoded
                                placeholder="e.g. Cardiology"
                                onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                            />
                        </div>
                    </div>
                )}
            </div>

            {isEditing && (
                <div className="flex flex-col sm:flex-row justify-end pt-4 gap-3 animate-fade-in-up">
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            // Reset logic could go here if we kept original state separate
                            toast("Changes cancelled", { icon: "" });
                        }}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={loading || !hasChanges}
                        className="w-full sm:w-auto bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-teal-200"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            )}
        </div>
    );
}
