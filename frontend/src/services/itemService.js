import api from './api';

export const getItems = (params) => api.get('/items', { params });
export const getItemById = (id) => api.get(`/items/${id}`);
export const createItem = (formData) =>
  api.post('/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateItem = (id, data) => api.put(`/items/${id}`, data);
export const deleteItem = (id) => api.delete(`/items/${id}`);
export const getMyReports = (params) => api.get('/items/my-reports', { params });
export const getItemMatches = (id) => api.get(`/items/${id}/matches`);
