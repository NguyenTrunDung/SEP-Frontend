import api from './api/config'; // Default import
import { environment } from './api/config'; // Named import

export const diseaseCategoryService = {
  /**
   * Get disease categories for the current branch
   * @param {string|number} branchId - The branch ID
   * @returns {Promise<Object>} API response containing disease categories
   */
  async getDiseaseCategories(branchId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 diseaseCategoryService.getDiseaseCategories - requesting for branch:', branchId);
      }

      const currentBranchId = branchId || environment.multiTenant.getCurrentBranchId() || '1';
      const config = {
        params: { branchId: currentBranchId },
      };

      const response = await api.get('/api/v1/DiseaseCategories', config);

      if (environment.features.enableLogging) {
        console.log('✅ Raw API response:', response.data);
        console.log('📍 Used branchId query param:', currentBranchId);
      }

      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch disease categories:', error.response?.data?.message || error.message);
      }
      if (error.response?.status === 404) {
        return { data: [], message: 'No disease categories found', status: 'error' };
      }
      throw error;
    }
  },

  /**
   * Create a new disease category with just the name field
   * @param {Object} data - The disease category data
   * @param {string} data.name - The name of the disease category
   * @param {string|number} branchId - The branch ID
   * @returns {Promise<Object>} API response containing the created disease category
   */
  async createDiseaseCategory(data, branchId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 diseaseCategoryService.createDiseaseCategory - creating:', data);
      }

      const currentBranchId = branchId || environment.multiTenant.getCurrentBranchId() || '1';

      // Only send the name field as required by the simplified API
      const createData = {
        name: data.name
      };

      const response = await api.post('/api/v1/DiseaseCategories', createData, {
        params: { branchId: currentBranchId }
      });

      if (environment.features.enableLogging) {
        console.log('✅ Created disease category:', response.data);
      }

      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to create disease category:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  /**
   * Update an existing disease category with just the name field
   * @param {Object} data - The disease category data
   * @param {number} data.id - The disease category ID
   * @param {string} data.name - The name of the disease category
   * @param {string|number} branchId - The branch ID
   * @returns {Promise<Object>} API response containing the updated disease category
   */
  async updateDiseaseCategory(data, branchId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 diseaseCategoryService.updateDiseaseCategory - updating:', data);
      }

      const currentBranchId = branchId || environment.multiTenant.getCurrentBranchId() || '1';

      // Only send the name field as required by the simplified API
      const updateData = {
        name: data.name
      };

      const response = await api.put(`/api/v1/DiseaseCategories/${data.id}`, updateData, {
        params: { branchId: currentBranchId }
      });

      if (environment.features.enableLogging) {
        console.log('✅ Updated disease category:', response.data);
      }

      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to update disease category:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  /**
   * Delete a disease category
   * @param {number} id - The disease category ID
   * @param {string|number} branchId - The branch ID
   * @returns {Promise<Object>} API response
   */
  async deleteDiseaseCategory(id, branchId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 diseaseCategoryService.deleteDiseaseCategory - deleting:', id);
      }

      const currentBranchId = branchId || environment.multiTenant.getCurrentBranchId() || '1';

      const response = await api.delete(`/api/v1/DiseaseCategories/${id}`, {
        params: { branchId: currentBranchId }
      });

      if (environment.features.enableLogging) {
        console.log('✅ Deleted disease category:', response.data);
      }

      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to delete disease category:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  /**
   * Get a single disease category by ID
   * @param {number} id - The disease category ID
   * @param {string|number} branchId - The branch ID
   * @returns {Promise<Object>} API response containing the disease category
   */
  async getDiseaseCategoryById(id, branchId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 diseaseCategoryService.getDiseaseCategoryById - requesting:', id);
      }

      const currentBranchId = branchId || environment.multiTenant.getCurrentBranchId() || '1';

      const response = await api.get(`/api/v1/DiseaseCategories/${id}`, {
        params: { branchId: currentBranchId }
      });

      if (environment.features.enableLogging) {
        console.log('✅ Retrieved disease category:', response.data);
      }

      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to get disease category:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },
};