import { useState } from "react";
import { MessageCircle, Phone, AlertCircle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ConsultationContact() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState("");

    const sanitizeNumber = (num) => {
        // Remove all non-digit characters
        return num.replace(/\D/g, "");
    };

    const handleWhatsApp = () => {
        if (!phoneNumber.trim()) {
            setError("Please enter a phone number");
            toast.error("Phone number is required");
            return;
        }

        const sanitized = sanitizeNumber(phoneNumber);
        if (sanitized.length < 10) {
            setError("Please enter a valid phone number with country code");
            toast.error("Invalid phone number");
            return;
        }

        setError("");
        const message = "Hello, I would like to book an online consultation from your website.";
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${sanitized}?text=${encodedMessage}`;

        window.open(whatsappUrl, "_blank");
    };

    const handleCall = () => {
        if (!phoneNumber.trim()) {
            setError("Please enter a phone number");
            toast.error("Phone number is required");
            return;
        }

        const sanitized = sanitizeNumber(phoneNumber);
        if (sanitized.length < 10) {
            setError("Please enter a valid phone number");
            toast.error("Invalid phone number");
            return;
        }

        setError("");
        window.location.href = `tel:+${sanitized}`;
    };

    return (
        <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -ml-16 -mb-16 opacity-50"></div>

            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2 mx-auto">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Direct Support
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif text-slate-900 leading-tight">
                        Contact for <span className="text-emerald-600 italic">Consultation</span>
                    </h2>
                    <p className="text-slate-500 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
                        Need immediate assistance? Connect with our consultants through WhatsApp or a direct call.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="relative max-w-md mx-auto group">
                        <div className={`
                            absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-20 transition-opacity duration-500
                        `}></div>
                        <input
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => {
                                setPhoneNumber(e.target.value);
                                if (error) setError("");
                            }}
                            placeholder="Enter WhatsApp number with country code (e.g. 919876543210)"
                            className={`
                                w-full bg-slate-50 border-2 px-6 py-5 rounded-2xl text-slate-800 font-medium transition-all outline-none text-center text-lg relative z-10
                                ${error ? 'border-rose-100 bg-rose-50/30' : 'border-transparent focus:border-emerald-100 focus:bg-white focus:shadow-xl focus:shadow-emerald-500/5'}
                            `}
                        />
                        {error && (
                            <div className="flex items-center justify-center gap-2 mt-3 text-rose-500 text-xs font-bold animate-shake">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                        <button
                            onClick={handleWhatsApp}
                            className="bg-[#25D366] hover:bg-[#20ba5a] text-white px-6 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 group"
                        >
                            <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                            <span>WhatsApp Chat</span>
                        </button>
                        <button
                            onClick={handleCall}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 group"
                        >
                            <Phone size={20} className="group-hover:scale-110 transition-transform" />
                            <span>Call Consultant</span>
                        </button>
                    </div>
                </div>

                <div className="pt-4 flex items-center justify-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        Secure Chat
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        24/7 Availability
                    </div>
                </div>
            </div>
        </section>
    );
}
