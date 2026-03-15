import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSearchParams, Link } from "react-router-dom";
import { useAppointments } from "../../hooks/useAppointments";
import { cancelAppointment, payForAppointment } from "../../api/appointments.api";
import StripePaymentModal from "../../components/payment/StripePaymentModal";
import { Video } from "lucide-react";

export default function AppointmentHistory() {
  const { appointments, refreshAppointments, updateAppointmentStatus } = useAppointments();
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState({ show: false, apptId: null });
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("filter");

  const paymentSuccess = searchParams.get("payment_success");
  const apptId = searchParams.get("appt_id");

  useEffect(() => {
    refreshAppointments();

    if (paymentSuccess === "true" && apptId) {
      payForAppointment(apptId)
        .then(() => {
          toast.success("Payment Successful!");
          searchParams.delete("payment_success");
          searchParams.delete("appt_id");
          setSearchParams(searchParams);
          refreshAppointments();
        })
        .catch(() => {
          toast.error("Error confirming payment status");
        });
    }
  }, [paymentSuccess, apptId]);

  const clearFilter = () => {
    setSearchParams({});
  };

  const filteredAppointments = filter === "upcoming"
    ? appointments.filter(a => new Date(a.date) > new Date() && (a.status === 'confirmed' || a.status === 'pending'))
    : appointments;

  const sortedAppointments = [...filteredAppointments].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handlePay = (appt) => {
    setShowPaymentModal({ show: true, apptId: appt.id });
  };

  return (
    <div className="pb-32 space-y-8 animate-fade-in px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">My Journey</p>
          <h1 className="text-3xl md:text-4xl font-serif text-slate-800 tracking-tight">
            {filter === "upcoming" ? "Walking In Soon" : "Visit History"}
          </h1>
        </div>
        {filter === "upcoming" && (
          <button
            onClick={clearFilter}
            className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-3 rounded-full transition-all w-full md:w-auto"
          >
            Show All Visits
          </button>
        )}
      </div>

      {sortedAppointments.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[2.5rem] shadow-sm border border-slate-50 mx-2 md:mx-0">
          <h3 className="text-xl font-serif text-slate-800 mb-2">No visits found</h3>
          <p className="text-slate-400 font-medium">Your wellness journey starts when you are ready.</p>
          {filter === "upcoming" && (
            <button onClick={clearFilter} className="mt-6 text-teal-600 font-bold text-sm hover:opacity-80">View Past History</button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6">
          {sortedAppointments.map((a) => (
            <div
              key={a.id}
              className="group relative bg-white p-5 md:p-8 rounded-[2rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden border border-slate-50"
              onClick={() => setSelectedAppt(a)}
            >
              {/* Decorative Gradient Blob */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                <div className="flex gap-4 md:gap-6 items-center">
                  <div className={`
                        w-16 h-16 md:w-20 md:h-20 rounded-2xl flex flex-col items-center justify-center shrink-0 transition-colors duration-300
                        ${a.status === 'confirmed' ? 'bg-teal-50 text-teal-700' :
                      a.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-400'}
                  `}>
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-60">Token</span>
                    <span className="text-xl md:text-2xl font-serif font-bold">#{a.token_number}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif text-lg md:text-2xl text-slate-800">Dr. {a.doctor_name || a.doctor}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${a.consultation_type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        {a.consultation_type === 'online' ? 'Video' : 'In-Person'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs md:text-base font-medium">
                      {(a.consultation_type === 'online' && a.status === 'pending')
                        ? 'Schedule Awaiting Doctor'
                        : new Date(a.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-slate-400 text-xs md:text-sm mt-0.5">
                      {(a.consultation_type === 'online' && a.status === 'pending')
                        ? 'You will receive a notification via WhatsApp'
                        : `${new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} • ${a.reason || "General Checkup"}`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 border-slate-50 pt-4 md:pt-0 mt-2 md:mt-0">
                  <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2
                        ${a.status === 'confirmed' ? 'bg-green-100/50 text-green-700' :
                      a.status === 'pending' ? 'bg-amber-100/50 text-amber-700' :
                        a.status === 'cancelled' ? 'bg-rose-100/50 text-rose-700' :
                          'bg-slate-100 text-slate-500'}
                    `}>
                    <span className={`w-2 h-2 rounded-full ${a.status === 'confirmed' ? 'bg-green-500' : a.status === 'pending' ? 'bg-amber-500' : a.status === 'cancelled' ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
                    {a.status === 'cancelled' ? 'Declined' : a.status}
                  </div>

                  {(a.status === 'confirmed' || a.status === 'in_progress') && (
                    <Link
                      to={`/video-call/${a.id}`}
                      onClick={(e) => e.stopPropagation()} // don't open modal
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-rose-100"
                    >
                      <Video size={16} /> Join
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Premium Detail Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Glass Backdrop */}
          <div
            className="absolute inset-0 glass-dark animate-fade-in"
            onClick={() => setSelectedAppt(null)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-6 md:p-10 shadow-2xl animate-scale-in overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-blue-500"></div>

            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Appointment Details</p>
                <h2 className="text-3xl font-serif text-slate-800">#{selectedAppt.token_number}</h2>
              </div>
              <button
                onClick={() => setSelectedAppt(null)}
                className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl font-serif text-slate-700 shadow-sm shrink-0">
                  {(selectedAppt.doctor_name || selectedAppt.doctor || "?")[0]}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Doctor</p>
                  <p className="text-lg font-bold text-slate-800">Dr. {selectedAppt.doctor_name || selectedAppt.doctor}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Date & Time</p>
                  <p className="font-semibold text-slate-800">{new Date(selectedAppt.date).toLocaleDateString()} {new Date(selectedAppt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 items-center justify-center flex flex-col">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Mode</p>
                  <p className={`font-semibold ${selectedAppt.consultation_type === 'online' ? 'text-blue-600' : 'text-slate-800'}`}>
                    {selectedAppt.consultation_type === 'online' ? '💻 Online Video' : '🏥 In-Person'}
                  </p>
                </div>
              </div>

              {selectedAppt.consultation_type === 'online' && selectedAppt.status === 'pending' && (
                <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 mb-1">Doctor Is Scheduling Your Time</h4>
                    <p className="text-xs text-blue-700 leading-relaxed font-semibold">
                      Your consultant will review your request and set the consultation time. You'll be notified via WhatsApp and Email once it's scheduled.
                    </p>
                  </div>
                </div>
              )}

              {selectedAppt.status === 'cancelled' && selectedAppt.decline_reason && (
                <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 animate-slide-up">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🚫</span>
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Reason for Decline</p>
                  </div>
                  <p className="text-sm font-bold text-rose-700 leading-relaxed italic">
                    "{selectedAppt.decline_reason}"
                  </p>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">
                    {selectedAppt.payment_status === 'paid' ? 'Payment Status' : 'Amount Due'}
                  </p>
                  <p className={`text-2xl font-serif ${selectedAppt.payment_status === 'paid' ? 'text-green-600' : 'text-slate-800'}`}>
                    {selectedAppt.payment_status === 'paid' ? 'Payment Successful' : (selectedAppt.doctor_fee || 50)}
                  </p>
                </div>

                {selectedAppt.payment_status !== 'paid' && selectedAppt.status !== 'cancelled' ? (
                  <button
                    onClick={() => handlePay(selectedAppt)}
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200"
                  >
                    Pay Now
                  </button>
                ) : selectedAppt.status === 'cancelled' ? (
                  <div className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-500 font-bold text-sm tracking-wide">
                    CANCELLED
                  </div>
                ) : null}

                {(selectedAppt.status === 'confirmed' || selectedAppt.status === 'in_progress') && (
                  <Link
                    to={`/video-call/${selectedAppt.id}`}
                    className="bg-rose-50 text-rose-600 px-8 py-4 rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-sm border border-rose-100 flex items-center justify-center gap-2"
                  >
                    <Video size={18} /> Join Video Call
                  </Link>
                )}
              </div>

              {selectedAppt.status === 'pending' && (
                <button
                  onClick={async () => {
                    if (confirm("Cancel this appointment?")) {
                      try {
                        await cancelAppointment(selectedAppt.id);
                        toast.success("Cancelled");
                        setSelectedAppt(null);
                        refreshAppointments();
                      } catch (e) { toast.error("Error cancelling"); }
                    }
                  }}
                  className="w-full text-center text-red-500 font-bold text-xs hover:text-red-600 hover:underline mt-4"
                >
                  Cancel Appointment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showPaymentModal.show && (
        <StripePaymentModal
          appointmentId={showPaymentModal.apptId}
          onClose={() => setShowPaymentModal({ show: false, apptId: null })}
          onSuccess={() => {
            setShowPaymentModal({ show: false, apptId: null });
            refreshAppointments();
            if (selectedAppt) setSelectedAppt({ ...selectedAppt, payment_status: 'paid' });
          }}
        />
      )}
    </div>
  );
}
