import api from './api';

export const patientService = {
  getAllPatients: async (params = {}) => {
    const response = await api.get('/api/v1/patients', { params });
    return response.data;
  },

  getPatientById: async (id) => {
    const response = await api.get(`/api/v1/patients/${id}`);
    return response.data;
  },

  createPatient: async (patientData) => {
    const response = await api.post('/api/v1/patients', patientData);
    return response.data;
  },

  updatePatient: async (id, patientData) => {
    const response = await api.put(`/api/v1/patients/${id}`, patientData);
    return response.data;
  },

  deletePatient: async (id) => {
    const response = await api.delete(`/api/v1/patients/${id}`);
    return response.data;
  }
};

export default patientService;
