import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ConsultationContact from '../components/domain/ConsultationContact';

export default function Landing() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-teal-500 selection:text-white">
            {/* Navbar */}
            <nav className="fixed w-full z-50 px-6 py-4 flex items-center justify-between bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <span className="text-white font-bold text-lg">+</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-200">
                        LuminaHealth
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
                    <Link to="/register" className="px-5 py-2 text-sm font-bold text-white bg-teal-600 rounded-full hover:bg-teal-500 shadow-lg shadow-teal-500/20 transition-all hover:scale-105 active:scale-95">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-900/20 rounded-full blur-[120px] pointer-events-none"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 text-center max-w-4xl mx-auto space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 text-teal-400 text-sm font-medium mb-4 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                        </span>
                        Next-Generation Telemedicine
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                        Healthcare crafted for the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400">
                            modern era.
                        </span>
                    </h1>

                    <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Experience premium, seamless consultations with top-tier medical professionals.
                        LuminaHealth redefines your wellness journey with cutting-edge technology and unparalleled care.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                        <Link to="/register" className="w-full sm:w-auto px-8 py-4 text-white bg-teal-600 rounded-full font-bold text-lg hover:bg-teal-500 shadow-[0_0_40px_-10px_rgba(20,184,166,0.5)] transition-all hover:-translate-y-1">
                            Start Your Journey
                        </Link>
                        <Link to="/login" className="w-full sm:w-auto px-8 py-4 text-slate-300 bg-slate-900 border border-slate-800 rounded-full font-bold text-lg hover:bg-slate-800 hover:text-white transition-all">
                            Existing Member? Log In
                        </Link>
                    </div>
                </motion.div>

                {/* Floating UI Elements matching luxury vibe */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className="mt-20 relative w-full max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/50 p-2 shadow-2xl backdrop-blur-xl"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                        <div className="space-y-4 p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white">Virtual Consults</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Connect face-to-face with specialists from the comfort of your home using our crystal-clear platform.</p>
                        </div>
                        <div className="space-y-4 p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white">Smart Records</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Your medical history, beautifully organized and instantly accessible whenever you need it.</p>
                        </div>
                        <div className="space-y-4 p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white">Zero Wait Time</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Book appointments instantly. No more waiting rooms, just respect for your time and health.</p>
                        </div>
                    </div>
                </motion.div>
            </section>

            <div className="max-w-7xl mx-auto px-6 pb-20">
                <ConsultationContact />
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-12 text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} LuminaHealth. Redefining medical excellence.</p>
            </footer>
        </div>
    );
}
