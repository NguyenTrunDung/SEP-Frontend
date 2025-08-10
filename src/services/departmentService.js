import api, { environment } from './api/config';

const departmentService = {
  getDepartments: async (branchId) => {
    try {
      const response = await api.get(`/api/v1/Department`, {
        params: { branchId },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      throw error;
    }
  },

  getDepartmentById: async (id) => {
    try {
      const response = await api.get(`/api/v1/Department/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch department ${id}:`, error);
      throw error;
    }
  },

  createDepartment: async (deptData, branchId) => {
    try {
      const payload = {
        name: deptData.name?.trim(),
        branchId: Number(branchId),
        locationId: Number(deptData.locationId),
      };
      console.log('🔍 Sending create department payload:', payload);
      const response = await api.post(`/api/v1/Department`, payload);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create department:', error.response?.data || error);
      throw error;
    }
  },

  updateDepartment: async (deptId, deptData) => {
    try {
      const payload = {
        name: deptData.name?.trim(),
        locationId: Number(deptData.locationId),
        branchId: Number(deptData.branchId), // Added branchId to match BE DTO
      };
      console.log('🔍 Sending update department payload:', { id: deptId, ...payload });
      const response = await api.put(`/api/v1/Department/${deptId}`, payload);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update department:', error.response?.data || error);
      throw error;
    }
  },

  deleteDepartment: async (deptId) => {
    try {
      const response = await api.delete(`/api/v1/Department/${deptId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to delete department:', error.response?.data || error);
      throw error;
    }
  },
};

export { departmentService };