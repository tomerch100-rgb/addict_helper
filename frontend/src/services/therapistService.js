import api from './api';

export const getDashboardSummary = async () => {
    const response = await api.get('/therapist/me/summary');
    return response.data;
};

export const getAssignedPatients = async () => {
    const response = await api.get('/therapist/me/patients');
    return response.data;
};

export const getCrisisTimeline = async () => {
    const response = await api.get('/therapist/me/crisis-timeline');
    return response.data;
};

export const getSentimentTrend = async (days = 7) => {
    const response = await api.get('/therapist/me/sentiment-trend', { params: { days } });
    return response.data;
};

export const getPatientFile = async (patientId) => {
    const response = await api.get(`/therapist/me/patients/${patientId}/file`);
    return response.data;
};

export const resolveSession = async (sessionId) => {
    const response = await api.post(`/therapist/me/sessions/${sessionId}/resolve`);
    return response.data;
};
