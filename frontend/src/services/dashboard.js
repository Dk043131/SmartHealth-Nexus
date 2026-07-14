import api from './api';

export const dashboardService = {
  getSummary: async () => {
    const response = await api.get('/api/v1/dashboard/summary');
    return response.data;
  },

  getKPIs: async () => {
    const response = await api.get('/api/v1/dashboard/kpis');
    return response.data;
  },

  getMapMarkers: async () => {
    const response = await api.get('/api/v1/dashboard/map');
    return response.data;
  },

  getActivityTimeline: async () => {
    const response = await api.get('/api/v1/dashboard/activity');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/api/v1/dashboard/analytics');
    return response.data;
  },

  getAlerts: async (params = {}) => {
    const response = await api.get('/api/v1/alerts', { params });
    return response.data;
  },

  createAlert: async (alertData) => {
    const response = await api.post('/api/v1/alerts', alertData);
    return response.data;
  },

  updateAlert: async (id, alertData) => {
    const response = await api.put(`/api/v1/alerts/${id}`, alertData);
    return response.data;
  }
};

export default dashboardService;
