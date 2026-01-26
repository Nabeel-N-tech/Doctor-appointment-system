import { useEffect, useState } from "react";
import {
  getDoctorAvailability,
  toggleAvailability,
} from "../../api/availability.api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useAuth } from "../../auth/AuthContext";
import toast from "react-hot-toast";

export default function Availability() {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.username) {
      getDoctorAvailability(user.username)
        .then(setSlots)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleToggle = async (slot) => {
    const updated = await toggleAvailability(user.username, slot);
    setSlots(updated);
    toast.success("Availability updated");
  };

  const allSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "02:00 PM",
    "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM"
  ];

  if (loading) return <div className="p-10 text-center text-slate-500">Loading availability...</div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Availability</h1>
          <p className="text-slate-500">Select the time slots you are available for appointments.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="w-3 h-3 rounded-full bg-teal-500"></span> Available
          <span className="w-3 h-3 rounded-full bg-slate-200 ml-2"></span> Unavailable
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {allSlots.map((slot) => {
          const active = slots.includes(slot);

          return (
            <button
              key={slot}
              onClick={() => handleToggle(slot)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2
                ${active
                  ? "border-teal-500 bg-teal-50 text-teal-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"}
              `}
            >
              <span className="font-bold text-lg">{slot}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${active ? "bg-teal-200 text-teal-800" : "bg-slate-100"}`}>
                {active ? "Available" : "Off"}
              </span>

              {active && (
                <div className="absolute top-2 right-2 text-teal-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
