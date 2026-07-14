import api from './api';

export const ambulanceService = {
  getAllAmbulances: async (params = {}) => {
    const response = await api.get('/api/v1/ambulances', { params });
    return response.data;
  },

  getAmbulanceById: async (id) => {
    const response = await api.get(`/api/v1/ambulances/${id}`);
    return response.data;
  },

  createAmbulance: async (ambulanceData) => {
    const response = await api.post('/api/v1/ambulances', ambulanceData);
    return response.data;
  },

  updateAmbulance: async (id, ambulanceData) => {
    const response = await api.put(`/api/v1/ambulances/${id}`, ambulanceData);
    return response.data;
  },

  deleteAmbulance: async (id) => {
    const response = await api.delete(`/api/v1/ambulances/${id}`);
    return response.data;
  }
};

export default ambulanceService;
