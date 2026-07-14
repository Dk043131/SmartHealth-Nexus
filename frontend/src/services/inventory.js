import api from './api';

export const inventoryService = {
  getInventory: async (params = {}) => {
    const response = await api.get('/api/v1/inventory', { params });
    return response.data;
  },

  updateInventory: async (id, inventoryData) => {
    const response = await api.put(`/api/v1/inventory/${id}`, inventoryData);
    return response.data;
  },

  createInventory: async (inventoryData) => {
    const response = await api.post('/api/v1/inventory', inventoryData);
    return response.data;
  },

  getAllMedicines: async (params = {}) => {
    const response = await api.get('/api/v1/medicines', { params });
    return response.data;
  },

  createMedicine: async (medicineData) => {
    const response = await api.post('/api/v1/medicines', medicineData);
    return response.data;
  }
};

export default inventoryService;
