import api, { environment } from './api/config';

/**
 * Area Service
 * Handles all area-related API operations with multi-tenant support
 * 
 * Branch Context Strategy:
 * - API interceptor automatically adds X-Branch-Id header from current branch context
 * - HOMMS.BranchId cookie provides persistent branch context
 * - Query parameters added for endpoints that require them
 * - No manual header management needed - interceptor handles everything
 * 
 * Backend API Structure (AreasController.cs):
 * - GET /api/v{version}/areas?branchId={branchId} - Get areas by branch
 * - GET /api/v{version}/areas/{id} - Get area by ID  
 * - POST /api/v{version}/areas - Create area
 * - PUT /api/v{version}/areas/{id} - Update area


 * - DELETE /api/v{version}/areas/{id} - Delete area
 * 
 * All responses are wrapped in ApiResponseBase<T> format:
 * { data: T, message: string, status: string, totalCount?: number }
 */
export const areaService = {
  /**
   * Get all areas for the current branch
   * @param {string|number} branchBId - The branch ID to get areas for (optional, uses current branch if not provided)
   * @returns {Promise<Object>} API response containing array of area objects
   */
  async getAreas(branchId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 areaService.getAreas - requesting areas for branch:', branchId);
      }

      const currentBranchId = branchId || environment.multiTenant.getCurrentBranchId() || '1';

      const config = {
        params: { branchId: currentBranchId }
      };

      const response = await api.get('/api/v1/areas', config);

      if (environment.features.enableLogging) {
        console.log('✅ Raw API response:', response.data);
        console.log('📍 Used branchId query param:', currentBranchId);
      }

      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch areas:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  /**
   * Get a specific area by ID
   * @param {string|number} areaId - The area ID
   * @returns {Promise<Object>} API response containing area object or null if not found
   */
  async getAreaById(areaId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 areaService.getAreaById - ID:', areaId);
      }

      const response = await api.get(`/api/v1/areas/${areaId}`);

      if (environment.features.enableLogging) {
        console.log('✅ Fetched area by ID:', response.data);
      }

      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch area:', error.response?.data?.message || error.message);
      }

      if (error.response?.status === 404) {
        return { data: null, message: 'Area not found', status: 'error' };
      }
      throw error;
    }
  },

  /**
   * Create a new area
   * @param {Object} areaData - The area data to create (CreateAreaDto)
   * @returns {Promise<Object>} API response containing created area data
   */
  async createArea(areaData) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 areaService.createArea - data:', areaData);
      }

      const response = await api.post('/api/v1/areas', areaData);

      if (environment.features.enableLogging) {
        console.log('✅ Created area - response:', response.data);
      }

      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to create area:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  /**
   * Update an existing area
   * @param {string|number} areaId - The area ID to update
   * @param {Object} areaData - The updated area data (UpdateAreaDto)
   * @returns {Promise<Object>} API response containing updated area data
   */
  async updateArea(areaId, areaData) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 areaService.updateArea - ID:', areaId, 'data:', areaData);
      }

      const response = await api.put(`/api/v1/areas/${areaId}`, areaData);

      if (environment.features.enableLogging) {
        console.log('✅ Updated area:', response.data);
      }

      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to update area:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  /**
   * Delete an area
   * @param {string|number} areaId - The area ID to delete
   * @returns {Promise<Object>} API response containing deletion result
   */
  async deleteArea(areaId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 areaService.deleteArea - ID:', areaId);
      }

      const response = await api.delete(`/api/v1/areas/${areaId}`);

      if (environment.features.enableLogging) {
        console.log('✅ Deleted area:', response.data);
      }

      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to delete area:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  /**
   * Validate if area name is unique within a branch
   * @param {string|number} branchId - Branch ID
   * @param {string} name - Area name to validate
   * @param {string|number} excludeId - Area ID to exclude from validation (optional)
   * @returns {Promise<boolean>} True if name is unique, false otherwise
   */
  async validateAreaName(branchId, name, excludeId = null) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 areaService.validateAreaName - branchId:', branchId, 'name:', name, 'excludeId:', excludeId);
      }

      const config = {
        params: { branchId, name, excludeId }
      };

      const response = await api.get('/api/v1/areas/validate-name', config);

      if (environment.features.enableLogging) {
        console.log('✅ Validate area name response:', response.data);
      }

      return response.data?.data || false;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to validate area name:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  }
};