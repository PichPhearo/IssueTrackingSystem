import client from './client';

export const getIssues = (params) => client.get('/issues', { params });
export const getIssue = (id) => client.get(`/issues/${id}`);
export const createIssue = (data) => client.post('/issues', data);
export const updateIssue = (id, data) => client.put(`/issues/${id}`, data);
export const deleteIssue = (id) => client.delete(`/issues/${id}`);
export const updateStatus = (id, status) => client.patch(`/issues/${id}/status`, { status });
