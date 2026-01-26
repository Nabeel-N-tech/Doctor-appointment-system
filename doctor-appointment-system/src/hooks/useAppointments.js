import { useEffect, useState } from "react";
import {
  getAppointments,
  createAppointment,
} from "../api/appointments.api";

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppointments()
      .then(setAppointments)
      .finally(() => setLoading(false));
  }, []);

  const bookAppointment = async (data) => {
    const newAppointment = await createAppointment(data);
    setAppointments((prev) => [...prev, newAppointment]);
    return newAppointment;
  };

  const refreshAppointments = () => {
    setLoading(true);
    return getAppointments()
      .then(setAppointments)
      .finally(() => setLoading(false));
  };

  const updateAppointmentStatus = (id, updates) => {
    setAppointments(prev => prev.map(appt =>
      appt.id === id ? { ...appt, ...updates } : appt
    ));
  };

  return {
    appointments,
    loading,
    bookAppointment,
    refreshAppointments,
    updateAppointmentStatus
  };
}
