import api from './api';

export const healthService = {
  liveness: async () => {
    const response = await api.get('/api/v1/health/liveness');
    return response.data;
  },

  readiness: async () => {
    const response = await api.get('/api/v1/health/readiness');
    return response.data;
  },

  details: async () => {
    const response = await api.get('/api/v1/health/details');
    return response.data;
  }
};

export default healthService;
