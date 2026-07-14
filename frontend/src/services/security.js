import api from './api';

export const securityService = {
  audit: async () => {
    const response = await api.get('/api/v1/security/audit');
    return response.data;
  }
};

export default securityService;
