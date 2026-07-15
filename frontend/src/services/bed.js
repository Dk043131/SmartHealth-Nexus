import api from './api';

export const bedService = {
  getAllBeds: async (params = {}) => {
    const response = await api.get('/api/v1/beds', { params });
    return response.data;
  },

  getBedById: async (id) => {
    const response = await api.get(`/api/v1/beds/${id}`);
    return response.data;
  },

  createBed: async (bedData) => {
    const response = await api.post('/api/v1/beds', bedData);
    return response.data;
  },

  updateBed: async (id, bedData) => {
    const response = await api.put(`/api/v1/beds/${id}`, bedData);
    return response.data;
  },

  deleteBed: async (id) => {
    const response = await api.delete(`/api/v1/beds/${id}`);
    return response.data;
  }
};

export default bedService;
