import api from './api';

export const createClaim = (data) => api.post('/claims', data);
export const getMyClaims = () => api.get('/claims/my-claims');
export const getIncomingClaims = () => api.get('/claims/incoming');
export const getClaimById = (id) => api.get(`/claims/${id}`);
export const makeDecision = (id, data) => api.put(`/claims/${id}/decision`, data);
export const disputeClaim = (id) => api.put(`/claims/${id}/dispute`);
