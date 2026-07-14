import api from './api';

export const jobsService = {
  active: async () => {
    const response = await api.get('/api/v1/jobs/active');
    return response.data;
  },

  trigger: async (jobId) => {
    const response = await api.post('/api/v1/jobs/trigger', null, {
      params: { job_id: jobId }
    });
    return response.data;
  }
};

export default jobsService;
