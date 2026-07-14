import api from './api';

export const aiService = {
  getMedicineDemand: async (params = {}) => {
    const response = await api.get('/api/v1/ai/medicine-demand', { params });
    return response.data;
  },

  getDiseaseForecast: async (params = {}) => {
    const response = await api.get('/api/v1/ai/disease-forecast', { params });
    return response.data;
  },

  getPatientForecast: async (params = {}) => {
    const response = await api.get('/api/v1/ai/patient-forecast', { params });
    return response.data;
  },

  getBedForecast: async (params = {}) => {
    const response = await api.get('/api/v1/ai/bed-forecast', { params });
    return response.data;
  },

  getDoctorWorkload: async (params = {}) => {
    const response = await api.get('/api/v1/ai/doctor-workload', { params });
    return response.data;
  },

  getAmbulanceDemand: async (params = {}) => {
    const response = await api.get('/api/v1/ai/ambulance-demand', { params });
    return response.data;
  },

  triggerRetraining: async () => {
    const response = await api.post('/api/v1/ai/retrain');
    return response.data;
  }
};

export default aiService;
