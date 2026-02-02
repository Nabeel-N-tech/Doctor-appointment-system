import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerRequest } from "../auth/auth.service";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  User, Mail, Lock, Calendar, Phone, MapPin,
  Activity, FileText, HeartPulse, ArrowRight,
  ShieldCheck, ArrowLeft
} from "lucide-react";

const InputField = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Icon className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
    </div>
    <input
      {...props}
      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
    />
  </div>
);

const SelectField = ({ icon: Icon, options, ...props }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Icon className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
    </div>
    <select
      {...props}
      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm appearance-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
    </div>
  </div>
);

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "patient",
    age: "",
    gender: "",
    phone_number: "",
    address: "",
    blood_group: "",
    medical_history: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (formData.password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (formData.phone_number.length !== 10) {
      toast.error("Phone number must be 10 digits");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      await registerRequest(formData);
      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.log(err);
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Artistic/Branding */}
      <div className="hidden xl:flex xl:w-1/3 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-indigo-900 opacity-90 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542884775-829d854da350?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center" />

        <div className="relative z-20 flex flex-col justify-between h-full p-12 text-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg">
              <HeartPulse className="w-6 h-6 text-teal-300" />
            </div>
            <span className="text-xl font-bold tracking-tight">MediCare Prime</span>
          </div>

          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-black leading-tight"
            >
              Join Our <br />
              <span className="text-teal-300">Community.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-slate-300 font-medium"
            >
              Start your journey towards better health. Create your patient profile in seconds and get access to top-tier medical specialists.
            </motion.p>

            <div className="pt-8 space-y-4">
              {[
                "Secure Medical Records",
                "Instant Appointments",
                "24/7 Specialist Access"
              ].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="flex items-center gap-3"
                >
                  <div className="p-1 bg-teal-500/20 rounded-full">
                    <ShieldCheck className="w-4 h-4 text-teal-300" />
                  </div>
                  <span className="font-medium text-slate-200">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-sm text-slate-400 font-medium">
            © 2026 MediCare Prime. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full xl:w-2/3 flex flex-col items-center justify-center p-4 sm:p-8 bg-slate-50 min-h-screen overflow-y-auto relative">
        {/* Mobile Background Decoration */}
        <div className="xl:hidden absolute inset-0 bg-slate-100 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-80 bg-slate-900 rounded-b-[3rem]"></div>
        </div>

        {/* Mobile Branding Header */}
        <div className="xl:hidden flex flex-col items-center mb-6 relative z-10 mt-8">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl shadow-lg mb-3 ring-1 ring-white/20">
            <HeartPulse className="w-8 h-8 text-teal-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">HealthPortal</h1>
          <p className="text-slate-400 text-sm font-medium">Join Our Community</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-8 sm:p-12 my-4 relative z-10"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
              <p className="text-slate-500 mt-1">Join us to manage your appointments and records.</p>
            </div>
            <Link
              to="/login"
              className="hidden sm:flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Info Section */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <InputField icon={User} name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <InputField icon={Mail} name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
                </div>
                <InputField icon={Lock} name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                <InputField icon={ShieldCheck} name="confirmPassword" type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </div>

            <div className="border-t border-slate-100 my-4"></div>

            {/* Personal Info Section */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField icon={Calendar} name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} required />
                <SelectField
                  icon={User}
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "Select Gender" },
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" }
                  ]}
                  required
                />
                <InputField icon={Phone} name="phone_number" type="tel" placeholder="Phone Number (10 digits)" value={formData.phone_number} onChange={handleChange} maxLength="10" required />
                <SelectField
                  icon={Activity}
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "Blood Group" },
                    { value: "A+", label: "A+" },
                    { value: "A-", label: "A-" },
                    { value: "B+", label: "B+" },
                    { value: "B-", label: "B-" },
                    { value: "AB+", label: "AB+" },
                    { value: "AB-", label: "AB-" },
                    { value: "O+", label: "O+" },
                    { value: "O-", label: "O-" }
                  ]}
                  required
                />
                <div className="col-span-1 md:col-span-2">
                  <InputField icon={MapPin} name="address" placeholder="Residential Address" value={formData.address} onChange={handleChange} required />
                </div>
                <div className="col-span-1 md:col-span-2 relative group">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FileText className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  </div>
                  <textarea
                    name="medical_history"
                    value={formData.medical_history}
                    onChange={handleChange}
                    placeholder="Brief Medical History (e.g., Allergies, Past Surgeries)"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-relaxed bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm h-24 resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent rounded-xl shadow-lg shadow-teal-500/20 text-md font-bold text-white bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Create Account <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </div>

            <div className="text-center sm:hidden">
              <Link to="/login" className="text-sm font-bold text-teal-600 hover:text-teal-700">
                Already have an account? Login
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
