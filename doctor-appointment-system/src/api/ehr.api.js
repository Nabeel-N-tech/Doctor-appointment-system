import api from './apiClient';

export const fetchMedicalRecords = async (patientId) => {
    const response = await api.get(`/medical-records/${patientId}/`);
    return response.data;
};

export const createMedicalRecord = async (data) => {
    const response = await api.post('/medical-records/create/', data);
    return response.data;
};
