import api, { environment } from './api/config';

/**
 * Disease Category Service
 * Handles all disease category-related API operations with multi-tenant support
 * 
 * Branch Context Strategy:
 * - API interceptor automatically adds X-Branch-Id header from current branch context
 * - HOMMS.BranchId cookie provides persistent branch context
 * - Query parameters added for endpoints that require them
 * - No manual header management needed - interceptor handles everything
 * 
 * Backend API Structure (DiseaseCategoriesController.cs):
 * - GET /api/v{version}/disease-categories?branchId={branchId} - Get disease categories by branch
 * - GET /api/v{version}/disease-categories/{id} - Get disease category by ID
 * - POST /api/v{version}/disease-categories - Create disease category
 * - PUT /api/v{version}/disease-categories/{id} - Update disease category
 * - DELETE /api/v{version}/disease-categories/{id} - Delete disease category
 * 
 * All responses are wrapped in ApiResponseBase<T> format:
 * { data: T, message: string, status: string, totalCount?: number }
 */
export const diseaseCategoryService = {
  /**
   * Get all disease categories for the current branch
   * @param {string|number} branchId - The branch ID to get disease categories for (optional, uses current branch if not provided)
   * @returns {Promise<Object>} API response containing array of disease category objects
   */
  async getDiseaseCategories(branchId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 diseaseCategoryService.getDiseaseCategories - requesting for branch:', branchId);
      }

      const currentBranchId = branchId || environment.multiTenant.getCurrentBranchId() || '1';

      const config = {
        params: { branchId: currentBranchId }
      };

      const response = await api.get('/api/v1/disease-categories', config);

      if (environment.features.enableLogging) {
        console.log('✅ Raw API response:', response.data);
        console.log('📍 Used branchId query param:', currentBranchId);
      }

      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch disease categories:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  /**
   * Get a specific disease category by ID
   * @param {string|number} categoryId - The disease category ID
   * @returns {Promise<Object>} API response containing disease category object or null if not found
   */
  async getDiseaseCategoryById(categoryId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 diseaseCategoryService.getDiseaseCategoryById - ID:', categoryId);
      }

      const response = await api.get(`/api/v1/disease-categories/${categoryId}`);

      if (environment.features.enableLogging) {
        console.log('✅ Fetched disease category by ID:', response.data);
      }

      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch disease category:', error.response?.data?.message || error.message);
      }

      if (error.response?.status === 404) {
        return { data: null, message: 'Disease category not found', status: 'error' };
      }
      throw error;
    }
  },

  /**
   * Create a new disease category
   * @param {Object} categoryData - The disease category data to create (CreateDiseaseCategoryDto)
   * @returns {Promise<Object>} API response containing created disease category data
   */
  async createDiseaseCategory(categoryData) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 diseaseCategoryService.createDiseaseCategory - data:', categoryData);
      }

      const response = await api.post('/api/v1/disease-categories', categoryData);

      if (environment.features.enableLogging) {
        console.log('✅ Created disease category - response:', response.data);
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
   * Update an existing disease category
   * @param {string|number} categoryId - The disease category ID to update
   * @param {Object} categoryData - The updated disease category data (UpdateDiseaseCategoryDto)
   * @returns {Promise<Object>} API response containing updated disease category data
   */
  async updateDiseaseCategory(categoryId, categoryData) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 diseaseCategoryService.updateDiseaseCategory - ID:', categoryId, 'data:', categoryData);
      }

      const response = await api.put(`/api/v1/disease-categories/${categoryId}`, categoryData);

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
   * @param {string|number} categoryId - The disease category ID to delete
   * @returns {Promise<Object>} API response containing deletion result
   */
  async deleteDiseaseCategory(categoryId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 diseaseCategoryService.deleteDiseaseCategory - ID:', categoryId);
      }

      const response = await api.delete(`/api/v1/disease-categories/${categoryId}`);

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
   * Validate if disease category name is unique within a branch
   * @param {string|number} branchId - Branch ID
   * @param {string} name - Disease category name to validate
   * @param {string|number} excludeId - Disease category ID to exclude from validation (optional)
   * @returns {Promise<boolean>} True if name is unique, false otherwise
   */
  async validateDiseaseCategoryName(branchId, name, excludeId = null) {
    try {
      const currentBranchId = String(branchId || environment.multiTenant.getCurrentBranchId() || '1');
      const normalizedName = name.trim().toLowerCase();
      if (!normalizedName) {
        throw new Error('Tên danh mục bệnh không hợp lệ');
      }

      if (environment.features.enableLogging) {
        console.log('🔍 diseaseCategoryService.validateDiseaseCategoryName - Sending request:', {
          branchId: currentBranchId,
          name: normalizedName,
          excludeId,
          url: `/api/v1/disease-categories/validate-name?branchId=${currentBranchId}&name=${encodeURIComponent(normalizedName)}${excludeId ? `&excludeId=${excludeId}` : ''}`
        });
      }

      const config = {
        params: { branchId: currentBranchId, name: normalizedName, excludeId },
        headers: { 'X-Branch-Id': currentBranchId }
      };

      const response = await api.get('/api/v1/disease-categories/validate-name', config);

      if (environment.features.enableLogging) {
        console.log('✅ Validate disease category name response for branch', currentBranchId, ':', response.data);
      }

      const isUnique = response.data?.data === true;
      if (!isUnique) {
        console.warn(`⚠️ Disease category name "${normalizedName}" reported as duplicate in branch ${currentBranchId}. Response:`, response.data);

        const categoriesResponse = await this.getDiseaseCategories(currentBranchId);
        const categories = categoriesResponse.data || [];
        const duplicateCategory = categories.find(category =>
          category.name.toLowerCase() === normalizedName &&
          String(category.branchId) === currentBranchId &&
          (!excludeId || category.id !== excludeId)
        );

        if (!duplicateCategory) {
          console.error(`❌ Backend incorrectly reported "${normalizedName}" as duplicate in branch ${currentBranchId}. No matching category found. Forcing isUnique=true as workaround.`);
          return true;
        }

        console.warn(`⚠️ Confirmed duplicate category in branch ${currentBranchId}:`, duplicateCategory);
      }

      return isUnique;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to validate disease category name:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  }
};