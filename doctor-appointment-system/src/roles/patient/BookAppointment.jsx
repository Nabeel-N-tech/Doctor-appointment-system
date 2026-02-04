import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import { useAppointments } from "../../hooks/useAppointments";
import { getDoctors } from "../../api/users.api";
import { payForAppointment } from "../../api/appointments.api";
import StripePaymentModal from "../../components/payment/StripePaymentModal";

export default function BookAppointment() {
  const { bookAppointment } = useAppointments();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [bookingResult, setBookingResult] = useState(null);

  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingAppointmentId, setPendingAppointmentId] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    getDoctors()
      .then(setDoctors)
      .catch(() => toast.error("Could not reach our care network right now"))
      .finally(() => setLoading(false));
  }, []);

  const specializations = useMemo(() => {
    // Normalize categories to Title Case to prevent duplicates (e.g., 'cardiology' vs 'Cardiology')
    const specs = new Set(doctors.map(d => {
      const s = d.specialization || "General Care";
      return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }));
    return ["All", ...Array.from(specs)];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (activeFilter === "All") return doctors;
    return doctors.filter(d => {
      const s = d.specialization || "General Care";
      // Compare normalized strings
      return (s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()) === activeFilter;
    });
  }, [doctors, activeFilter]);

  // Calculate date limits once
  const minDateTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }, []);

  const maxDateTime = useMemo(() => {
    const future = new Date();
    future.setMonth(future.getMonth() + 3); // Limit to 3 months
    future.setMinutes(future.getMinutes() - future.getTimezoneOffset());
    return future.toISOString().slice(0, 16);
  }, []);

  const handleBook = async (e) => {
    if (e) e.preventDefault();
    if (!selectedDoctor || !date) {
      toast.error("Please pick a time for your visit");
      return;
    }

    const selectedDate = new Date(date);
    const now = new Date();
    if (selectedDate < now) {
      toast.error("Please select a valid date and time.");
      return;
    }

    const toastId = toast.loading("Reserving time slot...");
    setProcessing(true);

    try {
      // 1. Create Appointment (Pending Status)
      const result = await bookAppointment({
        doctor_id: selectedDoctor.id,
        date: selectedDate.toISOString(),
        reason: reason
      });

      // 2. Open Payment Modal
      setPendingAppointmentId(result.id);

      // Store result with pending status
      setBookingResult({
        token: result.token_number,
        id: result.id,
        date: date,
        doctor: selectedDoctor,
        payment_status: 'pending'
      });

      setShowPaymentModal(true);
      toast.dismiss(toastId);

    } catch (err) {
      console.error(err);
      toast.error("Could not reserve slot. Please try again.", { id: toastId });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
      <div className="w-16 h-16 border-4 border-slate-100 border-t-teal-500 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-medium tracking-wide text-sm">Preparing your wellness portal...</p>
    </div>
  );

  // Success View 
  const BookingSuccess = ({ id, token, date, doctor, payment_status, onBookAnother }) => {
    return (
      <div className="max-w-2xl mx-auto mt-8 animate-fade-in text-center p-6 bg-white rounded-[3rem] shadow-2xl shadow-slate-100 border border-slate-50">
        <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner">
          ✨
        </div>

        <h2 className="text-4xl font-serif font-medium text-slate-800 mb-4">
          All Set!
        </h2>
        <p className="text-slate-500 text-lg mb-12 max-w-md mx-auto leading-relaxed">
          Your appointment with <strong className="text-teal-700">Dr. {doctor?.username}</strong> has been secured. Payment was successful.
        </p>

        <div className="grid md:grid-cols-2 gap-6 text-left max-w-lg mx-auto mb-12">
          <div className="bg-slate-50 p-6 rounded-3xl">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">When</p>
            <p className="font-medium text-slate-800 text-lg">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <p className="text-slate-500">{new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
          </div>
          <div className="bg-teal-600 p-6 rounded-3xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
            <p className="text-xs text-teal-200 font-bold uppercase tracking-widest mb-2">Your Token</p>
            <p className="font-serif text-5xl">#{token}</p>
          </div>
        </div>

        <div className="space-y-4 max-w-xs mx-auto">
          <Button variant="ghost" onClick={() => window.location.href = '/'} className="w-full text-slate-400 hover:text-slate-600">
            Return to Home
          </Button>
          <Button onClick={onBookAnother} className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium">
            Book Another
          </Button>
        </div>
      </div>
    );
  };

  if (bookingResult && bookingResult.payment_status === 'paid') return <BookingSuccess {...bookingResult} onBookAnother={() => setBookingResult(null)} />;

  return (
    <div className="container max-w-7xl mx-auto pb-24 animate-fade-in px-6">

      {/* Payment Modal */}
      {showPaymentModal && pendingAppointmentId && (
        <StripePaymentModal
          appointmentId={pendingAppointmentId}
          onClose={async () => {
            setShowPaymentModal(false);
            try {
              const { cancelAppointment } = await import("../../api/appointments.api");
              await cancelAppointment(pendingAppointmentId);
              toast("Reservation cancelled due to incomplete payment.");
            } catch (e) {
              console.error(e);
            }
            setPendingAppointmentId(null);
            setBookingResult(null);
          }}
          onSuccess={() => {
            setShowPaymentModal(false);
            // Update local state to show success
            setBookingResult(prev => ({ ...prev, payment_status: 'paid' }));
            toast.success("Booking & Payment Confirmed!");
            // Clear form
            setDate("");
            setReason("");
            setSelectedDoctor(null);
            setPendingAppointmentId(null);
          }}
        />
      )}

      {/* Header Section */}
      <div className="py-12">
        <h1 className="text-4xl md:text-5xl font-serif text-slate-800 mb-4 tracking-tight">
          Here for your <span className="italic text-teal-600 font-medium">wellness</span>.
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl">
          Connect with empathetic professionals who listen. No rush, just care.
        </p>

        {/* Filter Pills */}
        <div className="flex gap-2 mt-8 overflow-x-auto pb-4 scrollbar-hide">
          {specializations.map(spec => (
            <button
              key={spec}
              onClick={() => setActiveFilter(spec)}
              className={`
                       px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border whitespace-nowrap flex-shrink-0
                       ${activeFilter === spec
                  ? "bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-200"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"}
                   `}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">

        {/* Doctor Grid (Left) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                onClick={() => doc.is_available && setSelectedDoctor(doc)}
                className={`
                        relative flex flex-col p-6 rounded-[2rem] transition-all duration-300 border-2
                        ${!doc.is_available ? 'bg-slate-50 border-transparent opacity-60 cursor-not-allowed grayscale-[0.5]' :
                    selectedDoctor?.id === doc.id
                      ? 'bg-white border-teal-500 shadow-xl shadow-teal-100/50 scale-[1.02] z-10 cursor-pointer'
                      : 'bg-white border-transparent shadow-sm hover:shadow-lg hover:shadow-slate-100 hover:-translate-y-1 hover:border-slate-100 cursor-pointer'}
                    `}
              >
                {/* Mock Data Generation based on ID/Name for consistency */}
                {(() => {
                  const seed = doc.id + doc.username.length;
                  const rating = (4.5 + (seed % 5) / 10).toFixed(1);
                  const reviews = 50 + (seed * 13) % 200;
                  const exp = 5 + (seed % 20);
                  const patients = (0.5 + (seed % 30) / 10).toFixed(1);

                  return (
                    <>
                      <div className="flex items-start justify-between w-full mb-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-serif transition-colors duration-300 bg-slate-50 text-slate-400">
                          {doc.username[0]}
                        </div>
                        {rating > 4.8 && (
                          <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Top Rated
                          </span>
                        )}
                      </div>

                      <div className="mb-4">
                        <h3 className="font-serif text-lg text-slate-800 font-bold leading-tight">Dr. {doc.username}</h3>
                        <p className="text-xs font-medium text-teal-600 uppercase tracking-wide mt-1">{doc.specialization || "General Care"} • {exp} Years Exp.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 w-full mb-6">
                        <div className="bg-slate-50 p-2 rounded-xl text-center">
                          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Rating</p>
                          <p className="text-slate-700 font-bold text-sm flex items-center justify-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {rating} <span className="text-slate-300 font-normal">({reviews})</span>
                          </p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl text-center">
                          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Patients</p>
                          <p className="text-slate-700 font-bold text-sm">{patients}k+</p>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between w-full pt-4 border-t border-slate-50">
                        {doc.is_available ? (
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-green-600">
                            <span className="relative flex h-2 w-2">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 ${selectedDoctor?.id !== doc.id && 'hidden'}`}></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Available
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                            Offline
                          </div>
                        )}
                        <div className="text-slate-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">No doctors found for this category.</p>
              <button onClick={() => setActiveFilter("All")} className="mt-4 text-teal-600 font-bold text-sm hover:underline">Clear Filters</button>
            </div>
          )}
        </div>

        {/* Booking Form (Right - Sticky / Bottom Sheet) */}
        <div className={`
            lg:col-span-4 lg:block transition-all duration-500 z-50
            ${selectedDoctor ? 'fixed bottom-0 left-0 right-0' : 'hidden'}
            lg:sticky lg:top-8 lg:p-0
        `}>
          {/* Mobile Backdrop */}
          {selectedDoctor && (
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden -z-10 animate-fade-in"
              onClick={() => setSelectedDoctor(null)}
            ></div>
          )}

          <div className={`
                bg-white rounded-t-[2.5rem] lg:rounded-[2.5rem] p-6 md:p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 h-[85vh] lg:h-auto overflow-y-auto lg:overflow-visible custom-scrollbar
                ${selectedDoctor ? 'animate-slide-up' : ''}
            `}>
            {/* Mobile Drag Handle / Close */}
            <div className="flex justify-center mb-6 lg:hidden">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
            </div>

            <div className="mb-8 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Appointment</p>
                <h2 className="font-serif text-3xl text-slate-800 leading-tight">
                  {selectedDoctor ? (
                    <>Book with <span className="block text-teal-600">Dr. {selectedDoctor.username}</span></>
                  ) : (
                    <span className="text-slate-300">Select a doctor to begin</span>
                  )}
                </h2>
              </div>
              {/* Close Button for Mobile */}
              <button
                onClick={() => setSelectedDoctor(null)}
                className="lg:hidden p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Date Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Date</label>
                <div className="relative group">
                  <input
                    type="datetime-local"
                    min={minDateTime}
                    max={maxDateTime}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border-2 border-transparent focus:border-slate-100 rounded-2xl pl-12 pr-4 py-5 text-slate-800 font-medium transition-all outline-none appearance-none text-lg"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>



              {/* Reason Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Reason for visit</label>
                <textarea
                  placeholder=""
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border-2 border-transparent focus:border-slate-100 rounded-2xl px-5 py-5 text-slate-800 font-medium transition-all outline-none resize-none h-40 text-lg"
                />
              </div>

              <button
                type="button"
                onClick={handleBook}
                disabled={!selectedDoctor || !date || processing} // Add processing disabled state
                className={`w-full font-bold py-6 rounded-2xl transition-all transform hover:-translate-y-1 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:transform-none shadow-xl shadow-blue-200 text-xl
                  ${processing ? 'bg-slate-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 text-white'}
                `}
              >
                {processing ? "Processing..." : `Pay ${selectedDoctor?.consultation_fee || 50} & Book`}
              </button>

              <div className="text-center flex items-center justify-center gap-2 text-slate-400 text-xs font-medium pb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Secure & Private
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
