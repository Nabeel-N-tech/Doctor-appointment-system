import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest } from "../auth/auth.service";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, HeartPulse, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginRequest(formData);
      if (data) {
        login(data.access, data.role, data.username);
        toast.success(`Welcome back, ${data.username}!`);
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      toast.error("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Artistic/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-blue-900 opacity-90 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />

        <div className="relative z-20 flex flex-col justify-between h-full p-12 text-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg">
              <HeartPulse className="w-6 h-6 text-teal-300" />
            </div>
            <span className="text-xl font-bold tracking-tight">HealthPortal</span>
          </div>

          <div className="space-y-6 max-w-lg">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-black leading-tight"
            >
              HealthPortal <br />
              <span className="text-teal-300"></span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-slate-300 font-medium"
            >
              Experience a new era of medical care where technology meets compassion. Manage your health journey with elegance and ease.
            </motion.p>
          </div>

          <div className="text-sm text-slate-400 font-medium">
            © 2026 HealthPortal. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 relative overflow-hidden"
      >
        {/* Mobile Background Decoration (Visible only on small screens) */}
        <div className="lg:hidden absolute inset-0 bg-slate-100">
          <div className="absolute top-0 left-0 w-full h-64 bg-slate-900 rounded-b-[3rem]"></div>
        </div>

        <div className="w-full max-w-md space-y-8 relative z-10">

          {/* Mobile Branding Header */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl shadow-lg mb-3 ring-1 ring-white/20">
              <HeartPulse className="w-8 h-8 text-teal-400" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">HealthPortal</h1>
            <p className="text-slate-400 text-sm font-medium">Your Health, Your Way</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50">
            <div className="text-center lg:text-left space-y-2 mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
              <p className="text-slate-500">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm focus:bg-white"
                    required
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-teal-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 transition-all" />
                  <span className="text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-teal-500/20 text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign in <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-400">New to our platform?</span>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-1 text-slate-800 font-bold hover:text-teal-600 transition-colors"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
