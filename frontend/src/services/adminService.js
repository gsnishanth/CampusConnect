import api from './api';

export const getDashboard = () => api.get('/admin/dashboard');
export const getUsers = (params) => api.get('/admin/users', { params });
export const getReports = (params) => api.get('/admin/reports', { params });
export const getClaims = (params) => api.get('/admin/claims', { params });
export const updateUserStatus = (id, data) => api.put(`/admin/users/${id}/status`, data);
export const resolveDispute = (id, data) => api.put(`/admin/claims/${id}/resolve`, data);
