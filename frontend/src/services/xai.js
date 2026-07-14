import api from './api';

export const xaiService = {
  getExplanation: async (params = {}) => {
    const response = await api.get('/api/v1/xai/explanations', { params });
    return response.data;
  },

  getSmartAlerts: async () => {
    const response = await api.get('/api/v1/xai/alerts');
    return response.data;
  },

  getRiskIntelligence: async () => {
    const response = await api.get('/api/v1/xai/risk');
    return response.data;
  },

  getConfidence: async (params = {}) => {
    const response = await api.get('/api/v1/xai/confidence', { params });
    return response.data;
  },

  getAuditTrail: async () => {
    const response = await api.get('/api/v1/xai/audit');
    return response.data;
  },

  getNarrative: async (params = {}) => {
    const response = await api.get('/api/v1/xai/narratives', { params });
    return response.data;
  },

  getFeatureImportance: async (params = {}) => {
    const response = await api.get('/api/v1/xai/feature-importance', { params });
    return response.data;
  }
};

export default xaiService;
