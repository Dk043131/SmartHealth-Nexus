import api from './api';

export const optimizationService = {
  getMedicineOptimization: async () => {
    const response = await api.get('/api/v1/optimization/medicine');
    return response.data;
  },

  getBedOptimization: async () => {
    const response = await api.get('/api/v1/optimization/beds');
    return response.data;
  },

  getDoctorOptimization: async () => {
    const response = await api.get('/api/v1/optimization/doctors');
    return response.data;
  },

  getAmbulanceOptimization: async (hospitalId) => {
    const response = await api.get('/api/v1/optimization/ambulances', {
      params: { hospital_id: hospitalId }
    });
    return response.data;
  },

  getReadinessIndices: async () => {
    const response = await api.get('/api/v1/optimization/resources');
    return response.data;
  },

  getRecommendations: async () => {
    const response = await api.get('/api/v1/optimization/recommendations');
    return response.data;
  },

  runSimulation: async (scenario, severity) => {
    const response = await api.post('/api/v1/optimization/simulation', null, {
      params: { scenario, severity }
    });
    return response.data;
  }
};

export default optimizationService;
