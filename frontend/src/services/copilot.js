import api from './api';

export const copilotService = {
  chat: async (query, language = 'en') => {
    const response = await api.post('/api/v1/copilot/chat', null, {
      params: { query, language }
    });
    return response.data;
  },

  voice: async (query, language = 'en') => {
    const response = await api.post('/api/v1/copilot/voice', null, {
      params: { query, language }
    });
    return response.data;
  },

  ocr: async (file, hospitalId) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/copilot/ocr', formData, {
      params: { hospital_id: hospitalId },
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  inventoryScan: async (file, hospitalId) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/copilot/inventory-scan', formData, {
      params: { hospital_id: hospitalId },
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/api/v1/copilot/history');
    return response.data;
  },

  getLanguages: async () => {
    const response = await api.get('/api/v1/copilot/languages');
    return response.data;
  },

  translate: async (text, targetLang) => {
    const response = await api.post('/api/v1/copilot/translate', null, {
      params: { text, target_lang: targetLang }
    });
    return response.data;
  }
};

export default copilotService;
