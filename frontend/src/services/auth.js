import api from './api';

export async function login({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function getProfile() {
  const { data } = await api.get('/user/profile');
  return data;
}

export async function logout({ email, token }) {
  const { data } = await api.post('/auth/logout', { email, token });
  return data;
}

export async function forgotPassword(email) {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
}
