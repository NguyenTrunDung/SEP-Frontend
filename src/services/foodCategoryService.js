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
 * 
 * Backend API Structure (FoodCategoriesController.cs):
 * - GET /api/v1/foodcategories?branchId={branchId} - Get categories by branch
 * - GET /api/v1/foodcategories/{id} - Get category by ID  
 * - POST /api/v1/foodcategories - Create category
 * - PUT /api/v1/foodcategories/{id} - Update category
 * - DELETE /api/v1/foodcategories/{id} - Delete category
 * 
 * All responses are wrapped in ApiResponseBase<T> format:
 * { data: T, message: string, status: string, totalCount?: number }
 */
export const foodCategoryService = {
  /**
 * Get all food categories for the current branch
 * Uses the GET /api/v1/foodcategories endpoint with branchId query parameter
 * @param {string|number} branchId - The branch ID to get categories for (optional, uses current branch if not provided)
 * @returns {Promise<Array>} Array of food category objects
 */
  async getFoodCategories(branchId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 foodCategoryService.getFoodCategories - requesting categories for branch:', branchId);
      }

      // Get current branch ID for query parameter if not provided
      const currentBranchId = branchId || environment.multiTenant.getCurrentBranchId();

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

      // Extract data from ApiResponseBase<IEnumerable<FoodCategoryDto>>
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
 * Uses the GET /api/v1/foodcategories/{id} endpoint
 * @param {string|number} categoryId - The category ID
 * @returns {Promise<Object|null>} Food category object or null if not found
 */
  async getFoodCategoryById(categoryId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 foodCategoryService.getFoodCategoryById - ID:', categoryId);
      }

      const response = await api.get(`${environment.api.endpoints.foodCategories}/${categoryId}`);

      if (environment.features.enableLogging) {
        console.log('✅ Fetched food category by ID:', response.data);
      }

      // Extract data from ApiResponseBase<FoodCategoryDto>
      return response.data?.data || null;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch food category:', error.response?.data?.message || error.message);
      }

      // Handle 404 gracefully
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create a new food category
   * Uses the POST /api/v1/foodcategories endpoint
   * @param {Object} categoryData - The category data to create
   * @param {string} categoryData.name - Category name
   * @param {string} categoryData.imageUrl - Category image URL (optional)
   * @param {number} categoryData.sort - Sort order
   * @param {number} categoryData.branchId - Branch ID
   * @returns {Promise<Object>} Created category data wrapped in ApiResponseBase
   */
  async createFoodCategory(categoryData) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 foodCategoryService.createFoodCategory - data:', categoryData);
      }

      const response = await api.post(environment.api.endpoints.foodCategories, categoryData);

      if (environment.features.enableLogging) {
        console.log('✅ Created food category:', response.data);
      }

      // Return full ApiResponseBase<FoodCategoryDto> for consistent handling
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
   * Uses the PUT /api/v1/foodcategories/{id} endpoint
   * @param {string|number} categoryId - The category ID to update
   * @param {Object} categoryData - The updated category data
   * @returns {Promise<Object>} Updated category data wrapped in ApiResponseBase
   */
  async updateFoodCategory(categoryId, categoryData) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 foodCategoryService.updateFoodCategory - ID:', categoryId, 'data:', categoryData);
      }

      const response = await api.put(`${environment.api.endpoints.foodCategories}/${categoryId}`, categoryData);

      if (environment.features.enableLogging) {
        console.log('✅ Updated food category:', response.data);
      }

      // Return full ApiResponseBase<FoodCategoryDto> for consistent handling
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
   * Uses the DELETE /api/v1/foodcategories/{id} endpoint
   * @param {string|number} categoryId - The category ID to delete
   * @returns {Promise<Object>} Deletion result wrapped in ApiResponseBase
   */
  async deleteFoodCategory(categoryId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 foodCategoryService.deleteFoodCategory - ID:', categoryId);
      }

      const response = await api.delete(`${environment.api.endpoints.foodCategories}/${categoryId}`);

      if (environment.features.enableLogging) {
        console.log('✅ Deleted food category:', response.data);
      }

      // Return full ApiResponseBase<object> for consistent handling
      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to delete food category:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  // Additional utility methods for backward compatibility and convenience

  /**
   * Get categories by branch (alias for getFoodCategories)
   * @param {string|number} branchId - The branch ID
   * @returns {Promise<Array>} Array of categories
   */
  async getCategoriesByBranch(branchId) {
    return this.getFoodCategories(branchId);
  },

  /**
   * Get all food categories for the current branch (convenience method)
   * Uses current branch from environment if no branchId provided
   * @returns {Promise<Array>} Array of food category objects
   */
  async getCurrentBranchCategories() {
    const currentBranchId = environment.multiTenant.getCurrentBranchId();
    return this.getFoodCategories(currentBranchId);
  },

  /**
   * Create category with form data (helper for forms)
   * @param {Object} formData - Form data object
   * @param {string|number} branchId - Branch ID to assign
   * @returns {Object} Category data object ready for API
   */
  createCategoryFromForm(formData, branchId) {
    return {
      name: formData.name,
      imageUrl: formData.imageUrl || '',
      sort: parseInt(formData.sort, 10) || 0,
      branchId: parseInt(branchId, 10)
    };
  },

  /**
   * Update category with form data (helper for forms)
   * @param {string|number} categoryId - Category ID to update
   * @param {Object} formData - Form data object
   * @param {string|number} branchId - Branch ID
   * @returns {Object} Category data object ready for API
   */
  updateCategoryFromForm(categoryId, formData, branchId) {
    return {
      name: formData.name,
      imageUrl: formData.imageUrl || '',
      sort: parseInt(formData.sort, 10) || 0,
      branchId: parseInt(branchId, 10)
    };
  },

  // ==================== IMAGE UPLOAD METHODS ====================
  // Following the same pattern as foodService.js

  /**
   * Create food category with image upload
   * Uses the POST /api/v1/foodcategories/create endpoint (multipart/form-data)
   * @param {Object} categoryData - The category data
   * @param {File} imageFile - The image file to upload (optional)
   * @param {string|number} branchId - Branch ID
   * @returns {Promise<Object>} Created category with uploaded image
   */
  async createFoodCategoryWithImage(categoryData, imageFile = null, branchId = null) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 foodCategoryService.createFoodCategoryWithImage - data:', categoryData, 'hasImage:', !!imageFile);
      }

      const currentBranchId = branchId || environment.multiTenant.getCurrentBranchId() || '1';

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('Name', categoryData.name || '');
      formData.append('ImageUrl', categoryData.imageUrl || '');
      formData.append('Sort', (categoryData.sort || 0).toString());
      formData.append('BranchId', currentBranchId.toString());

      if (imageFile) {
        formData.append('Image', imageFile);
      }

      const response = await api.post(`${environment.api.endpoints.foodCategories}/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (environment.features.enableLogging) {
        console.log('✅ Created food category with image:', response.data);
      }

      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to create food category with image:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  /**
   * Update food category with image upload
   * Uses the PUT /api/v1/foodcategories/update/{id} endpoint (multipart/form-data)
   * @param {string|number} categoryId - The category ID to update
   * @param {Object} categoryData - The updated category data
   * @param {File} imageFile - The image file to upload (optional)
   * @param {string|number} branchId - Branch ID
   * @returns {Promise<Object>} Updated category with uploaded image
   */
  async updateFoodCategoryWithImage(categoryId, categoryData, imageFile = null, branchId = null) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 foodCategoryService.updateFoodCategoryWithImage - ID:', categoryId, 'data:', categoryData, 'hasImage:', !!imageFile);
      }

      const currentBranchId = branchId || environment.multiTenant.getCurrentBranchId() || '1';

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('Name', categoryData.name || '');
      formData.append('ImageUrl', categoryData.imageUrl || '');
      formData.append('Sort', (categoryData.sort || 0).toString());
      formData.append('BranchId', currentBranchId.toString());

      if (imageFile) {
        formData.append('Image', imageFile);
      }

      const response = await api.put(`${environment.api.endpoints.foodCategories}/update/${categoryId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (environment.features.enableLogging) {
        console.log('✅ Updated food category with image:', response.data);
      }

      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to update food category with image:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  /**
   * Create category with Cloudinary URL (no file upload)
   * @param {Object} categoryData - Category data with imageUrl from Cloudinary
   * @param {string|number} branchId - Branch ID
   * @returns {Promise<Object>} Created category
   */
  async createFoodCategoryWithCloudinary(categoryData, branchId = null) {
    return this.createFoodCategoryWithImage(categoryData, null, branchId);
  },

  /**
   * Update category with Cloudinary URL (no file upload)
   * @param {string|number} categoryId - Category ID
   * @param {Object} categoryData - Category data with imageUrl from Cloudinary
   * @param {string|number} branchId - Branch ID
   * @returns {Promise<Object>} Updated category
   */
  async updateFoodCategoryWithCloudinary(categoryId, categoryData, branchId = null) {
    return this.updateFoodCategoryWithImage(categoryId, categoryData, null, branchId);
  }
};