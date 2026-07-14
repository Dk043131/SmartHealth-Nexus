import api from './api';

export const citizenService = {
  hospitals: async (params = {}) => {
    const response = await api.get('/api/v1/citizen/hospitals', { params });
    return response.data;
  },

  availability: async (hospitalId) => {
    const response = await api.get('/api/v1/citizen/availability', {
      params: { hospital_id: hospitalId }
    });
    return response.data;
  },

  emergency: async () => {
    const response = await api.get('/api/v1/citizen/emergency');
    return response.data;
  },

  alerts: async () => {
    const response = await api.get('/api/v1/citizen/alerts');
    return response.data;
  }
};

export default citizenService;
