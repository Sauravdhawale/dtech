import api from './api';

export async function getUsers() {
  const { data } = await api.get('/user/all', { params: { start: 0, length: 5000, draw: 1 } });
  return data;
}
export async function getUser(id) { const { data } = await api.get(`/user/${id}`); return data; }
export async function createUser(payload) { const response = await api.post('/user', payload); return response.data; }
export async function updateUser(id, payload) { const response = await api.put(`/user/${id}`, payload); return response.data; }
export async function deleteUser(id) { const { data } = await api.delete(`/user/${id}`); return data; }
export async function getUsersByRole(role) { const { data } = await api.get(`/user/by-role/${encodeURIComponent(role)}`); return data; }
