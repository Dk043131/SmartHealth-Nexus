import api from './api';

export const hospitalService = {
  getAllHospitals: async (params = {}) => {
    const response = await api.get('/api/v1/hospitals', { params });
    return response.data;
  },

  getHospitalById: async (id) => {
    const response = await api.get(`/api/v1/hospitals/${id}`);
    return response.data;
  },

  createHospital: async (hospitalData) => {
    const response = await api.post('/api/v1/hospitals', hospitalData);
    return response.data;
  },

  updateHospital: async (id, hospitalData) => {
    const response = await api.put(`/api/v1/hospitals/${id}`, hospitalData);
    return response.data;
  },

  deleteHospital: async (id) => {
    const response = await api.delete(`/api/v1/hospitals/${id}`);
    return response.data;
  }
};

export default hospitalService;
