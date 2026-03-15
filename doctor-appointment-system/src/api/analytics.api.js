import api from './apiClient';

export const fetchAdminAnalytics = async () => {
    const response = await api.get('/analytics/admin/');
    return response.data;
};

export const fetchDoctorAnalytics = async () => {
    const response = await api.get('/analytics/doctor/');
    return response.data;
};
