import api from './api/config'; // Default import
import { environment } from './api/config'; // Named import

export const diseaseCategoryService = {
  /**
   * Get disease categories indirectly via patient data for the current branch
   * @param {string|number} branchId - The branch ID
   * @returns {Promise<Object>} API response containing patient data with disease categories
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

      const response = await api.get('/api/v1/Patient/with-disease-categories-by-branch', config);

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
};