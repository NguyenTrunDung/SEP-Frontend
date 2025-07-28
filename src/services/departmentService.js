import api, { environment } from './api/config';

export const departmentService = {
  /**
   * Get all departments for the current branch
   * @param {string|number} branchId - The branch ID to get departments for
   * @returns {Promise<Object>} API response containing array of department objects
   */
  async getDepartments(branchId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 departmentService.getDepartments - requesting departments for branch:', branchId);
      }

      const currentBranchId = String(branchId || environment.multiTenant.getCurrentBranchId() || '1');

      const config = {
        params: { branchId: currentBranchId },
      };

      const response = await api.get('/api/v1/Department', config);

      if (environment.features.enableLogging) {
        console.log('✅ Raw API response:', response.data);
        console.log('📍 Used branchId query param:', currentBranchId);
      }

      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch departments:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  /**
   * Get a specific department by ID
   * @param {string|number} deptId - The department ID
   * @returns {Promise<Object>} API response containing department object or null if not found
   */
  async getDepartmentById(deptId) {
    try {
      if (!deptId) {
        throw new Error('Department ID is required');
      }

      if (environment.features.enableLogging) {
        console.log('🔍 departmentService.getDepartmentById - ID:', deptId);
      }

      const response = await api.get(`/api/v1/Department/${deptId}`);

      if (environment.features.enableLogging) {
        console.log('✅ Fetched department by ID:', response.data);
      }

      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch department:', error.response?.data?.message || error.message);
      }

      if (error.response?.status === 404) {
        return { data: null, message: 'Department not found', status: 'error' };
      }
      throw error;
    }
  },

  /**
   * Create a new department
   * @param {Object} deptData - The department data (e.g., { name: string })
   * @param {string|number} branchId - The branch ID for the department
   * @returns {Promise<Object>} API response containing created department data
   */
  async createDepartment(deptData, branchId) {
    try {
      if (!deptData?.name) {
        throw new Error('Department name is required');
      }
      if (!branchId) {
        throw new Error('Branch ID is required');
      }

      const payload = {
        name: deptData.name.trim(),
        branchId: parseInt(String(branchId)),
      };

      if (environment.features.enableLogging) {
        console.log('🔍 departmentService.createDepartment - payload:', payload);
      }

      const response = await api.post('/api/v1/Department', payload);

      if (environment.features.enableLogging) {
        console.log('✅ Created department - response:', response.data);
      }

      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to create department:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  /**
   * Update an existing department
   * @param {string|number} deptId - The department ID to update
   * @param {Object} deptData - The updated department data (UpdateDepartmentDto)
   * @returns {Promise<Object|null>} Updated department object or null if not found
   */
  async updateDepartment(deptId, deptData) {
    try {
      if (!deptId) {
        throw new Error('Department ID is required');
      }
      if (!deptData?.name) {
        throw new Error('Department name is required');
      }

      if (environment.features.enableLogging) {
        console.log(`🔍 Updating department ID: ${deptId}`, deptData);
      }

      const response = await api.put(`/api/v1/Department/${deptId}`, deptData);

      if (environment.features.enableLogging) {
        console.log('✅ Updated department:', response.data);
      }

      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error(`❌ Failed to update department: ${error.response?.data?.message || error.message}`);
      }

      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Delete a department
   * @param {string|number} deptId - The department ID to delete
   * @returns {Promise<Object>} API response containing deletion result
   */
  async deleteDepartment(deptId) {
    try {
      if (!deptId) {
        throw new Error('Department ID is required');
      }

      if (environment.features.enableLogging) {
        console.log('🔍 departmentService.deleteDepartment - ID:', deptId);
      }

      const response = await api.delete(`/api/v1/Department/${deptId}`);

      if (environment.features.enableLogging) {
        console.log('✅ Deleted department:', response.data);
      }

      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to delete department:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },
};