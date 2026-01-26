import apiClient from "./apiClient";
// API Client refactored

export async function createAppointment(appointmentData) {
  const { data } = await apiClient.post("/appointments/create/", appointmentData);
  return data;
}

export async function getAppointments() {
  const { data } = await apiClient.get(`/appointments/?_t=${new Date().getTime()}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
  return data;
}

export async function updateAppointmentStatus(id, updates) {
  const { data } = await apiClient.patch(`/appointments/${id}/status/`, updates);
  return data;
}

export const getAppointmentsByRole = getAppointments;

export async function payForAppointment(id) {
  const { data } = await apiClient.post(`/appointments/${id}/pay/`, {});
  return data;
}

export async function cancelAppointment(id) {
  const { data } = await apiClient.post(`/appointments/${id}/cancel/`, {});
  return data;
}

export async function createPaymentIntent(id) {
  const { data } = await apiClient.post(`/appointments/create-payment-intent/${id}/`, {});
  return data;
}
