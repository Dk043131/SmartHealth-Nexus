import api from './api';

export const syncService = {
  upload: async (payload) => {
    const response = await api.post('/api/v1/sync/upload', payload);
    return response.data;
  },

  download: async () => {
    const response = await api.post('/api/v1/sync/download');
    return response.data;
  },

  status: async () => {
    const response = await api.get('/api/v1/sync/status');
    return response.data;
  }
};

export default syncService;
