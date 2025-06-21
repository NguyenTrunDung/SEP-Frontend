import api, { environment } from './api/config';

/**
 * Food Category Service
 * Handles all food category-related API operations with multi-tenant support
 * 
 * Branch Context Strategy:
 * - API interceptor automatically adds X-Branch-Id header from current branch context
 * - HOMMS.BranchId cookie provides persistent branch context
 * - Query parameters added for endpoints that require them
 * - No manual header management needed - interceptor handles everything
 */
export const foodCategoryService = {
  /**
   * Get all food categories for the current branch
   * @returns {Promise<Array>} Array of food category objects
   */
  async getFoodCategories() {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 foodCategoryService.getFoodCategories - requesting categories for current branch');
      }

      // Get current branch ID for query parameter
      const currentBranchId = environment.multiTenant.getCurrentBranchId();

      const config = {
        params: {
          branchId: currentBranchId || '1' // Fallback to branch 1 if no current branch
        }
      };

      const response = await api.get(environment.api.endpoints.foodCategories, config);

      if (environment.features.enableLogging) {
        console.log('✅ Raw API response:', response.data);
        console.log('📍 Used branchId query param:', currentBranchId || '1');
      }

      // Extract data from ApiResponseBase<T>
      const categories = response.data?.data || [];

      if (environment.features.enableLogging) {
        console.log('✅ Fetched food categories:', categories.length, 'items');
      }

      return categories;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch food categories:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  /**
   * Get a specific food category by ID
   * @param {string|number} categoryId - The category ID
   * @returns {Promise<Object|null>} Food category object or null if not found
   */
  async getFoodCategoryById(categoryId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 foodCategoryService.getFoodCategoryById - ID:', categoryId);
      }

      // Get current branch ID for query parameter  
      const currentBranchId = environment.multiTenant.getCurrentBranchId();

      const config = {
        params: {
          branchId: currentBranchId || '1'
        }
      };

      const response = await api.get(`${environment.api.endpoints.foodCategories}/${categoryId}`, config);

      if (environment.features.enableLogging) {
        console.log('✅ Fetched food category by ID:', response.data);
      }

      // Extract data from ApiResponseBase<T>
      return response.data?.data || null;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch food category:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  /**
   * Create a new food category
   * @param {Object} categoryData - The category data to create
   * @returns {Promise<Object>} Created category data wrapped in ApiResponseBase
   */
  async createFoodCategory(categoryData) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 foodCategoryService.createFoodCategory - data:', categoryData);
      }

      // Get current branch ID for query parameter
      const currentBranchId = environment.multiTenant.getCurrentBranchId();

      const config = {
        params: {
          branchId: currentBranchId || '1'
        }
      };

      const response = await api.post(environment.api.endpoints.foodCategories, categoryData, config);

      if (environment.features.enableLogging) {
        console.log('✅ Created food category:', response.data);
      }

      // Return full ApiResponseBase<T> for consistent handling
      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to create food category:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  /**
   * Update an existing food category
   * @param {string|number} categoryId - The category ID to update
   * @param {Object} categoryData - The updated category data
   * @returns {Promise<Object>} Updated category data wrapped in ApiResponseBase
   */
  async updateFoodCategory(categoryId, categoryData) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 foodCategoryService.updateFoodCategory - ID:', categoryId, 'data:', categoryData);
      }

      // Get current branch ID for query parameter
      const currentBranchId = environment.multiTenant.getCurrentBranchId();

      const config = {
        params: {
          branchId: currentBranchId || '1'
        }
      };

      const response = await api.put(`${environment.api.endpoints.foodCategories}/${categoryId}`, categoryData, config);

      if (environment.features.enableLogging) {
        console.log('✅ Updated food category:', response.data);
      }

      // Return full ApiResponseBase<T> for consistent handling
      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to update food category:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  /**
   * Delete a food category
   * @param {string|number} categoryId - The category ID to delete
   * @returns {Promise<Object>} Deletion result wrapped in ApiResponseBase
   */
  async deleteFoodCategory(categoryId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 foodCategoryService.deleteFoodCategory - ID:', categoryId);
      }

      // Get current branch ID for query parameter
      const currentBranchId = environment.multiTenant.getCurrentBranchId();

      const config = {
        params: {
          branchId: currentBranchId || '1'
        }
      };

      const response = await api.delete(`${environment.api.endpoints.foodCategories}/${categoryId}`, config);

      if (environment.features.enableLogging) {
        console.log('✅ Deleted food category:', response.data);
      }

      // Return full ApiResponseBase<T> for consistent handling
      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to delete food category:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },
};