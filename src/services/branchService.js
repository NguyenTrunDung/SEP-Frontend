// services/branchService.js
import api, { environment } from './api/config';

export const branchService = {
  /**
   * Get all branches (uses X-Branch-Id header)
   * GET /api/v1/branches
   */
  async getBranches(branchId = null) {
    try {
      const config = { addBranchParams: true };

      // Override branch ID if provided
      if (branchId) {
        config.headers = { 'X-Branch-Id': branchId };
      }

      const response = await api.get('/api/v1/branches', config);

      if (environment.features.enableLogging) {
        console.log('✅ Fetched branches - Response:', response.data); // Log toàn bộ response
        console.log('✅ Fetched branches - Data length:', response.data.data?.length, 'items');
      }

      return response.data.data; // Trả mảng chi nhánh từ data
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch branches:', error.message);
      }
      throw error;
    }
  },

  /**
   * Set current branch (branch context required)
   * POST /api/v1/branches/set-current/{branchId}
   */
  async setCurrentBranch(branchId) {
    try {
      const config = {};

      // Override branch ID if provided
      if (branchId) {
        config.headers = { 'X-Branch-Id': branchId };
      }

      const response = await api.post(`/api/v1/branches/set-current/${branchId}`, {}, config);

      if (environment.features.enableLogging) {
        console.log('✅ Set current branch:', branchId);
      }

      return response.data; // Trả về toàn bộ response.data
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to set current branch:', error.message);
      }
      throw error;
    }
  },
};