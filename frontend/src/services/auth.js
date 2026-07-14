import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/v1/auth/login', { email, password });
    return response.data;
  },

  register: async (name, email, password, role, hospitalId = null) => {
    const response = await api.post('/api/v1/auth/register', {
      name,
      email,
      password,
      role,
      hospital_id: hospitalId || null
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  }
};

export default authService;
