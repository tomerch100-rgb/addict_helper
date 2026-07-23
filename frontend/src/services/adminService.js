import api from './api';

export const getPendingUsers = async () => {
    const response = await api.get('/admin/pending-users');
    return response.data;
};

export const approveUser = async (userId) => {
    const response = await api.put(`/admin/users/${userId}/approve`);
    return response.data;
};

export const getStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};

export const getSuccessRelapseTrend = async (weeks = 6) => {
    const response = await api.get('/admin/analytics/success-relapse-trend', { params: { weeks } });
    return response.data;
};

export const getPatientOutcomes = async () => {
    const response = await api.get('/admin/patient-outcomes');
    return response.data;
};

export const getEmergencyFeed = async () => {
    const response = await api.get('/admin/emergency-feed');
    return response.data;
};

export const getAuditLogs = async (limit = 25) => {
    const response = await api.get('/admin/audit-logs', { params: { limit } });
    return response.data;
};
