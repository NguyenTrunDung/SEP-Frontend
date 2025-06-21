import api, { environment } from './api/config';

/**
 * Food Service
 * Handles all food-related API operations with multi-tenant support
 * 
 * Branch Context Strategy:
 * - API interceptor automatically adds X-Branch-Id header from current branch context
 * - HOMMS.BranchId cookie provides persistent branch context
 * - No manual header management needed - interceptor handles everything
 */
export const foodService = {
    /**
     * Get all foods for the current branch
     * @returns {Promise<Array>} Array of food objects
     */
    async getFoods() {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 foodService.getFoods - requesting foods for current branch');
            }

            // Get current branch ID for query parameter
            const currentBranchId = environment.multiTenant.getCurrentBranchId();

            const config = {
                params: {
                    branchId: currentBranchId || '1' // Fallback to branch 1 if no current branch
                }
            };
            const response = await api.get(environment.api.endpoints.foods, config);

            if (environment.features.enableLogging) {
                console.log('✅ Raw API response:', response.data);
            }

            // Extract data from ApiResponseBase<T>
            const foods = response.data?.data || [];

            if (environment.features.enableLogging) {
                console.log('✅ Fetched foods:', foods.length, 'items');
            }

            return foods;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch foods:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    },

    /**
     * Get a specific food by ID
     * @param {string|number} id - The food ID
     * @returns {Promise<Object|null>} Food object or null if not found
     */
    async getFood(id) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 foodService.getFood - ID:', id);
            }

            const response = await api.get(`${environment.api.endpoints.foods}/${id}`);

            if (environment.features.enableLogging) {
                console.log('✅ Fetched food by ID:', response.data);
            }

            // Extract data from ApiResponseBase<T>
            return response.data?.data || null;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch food:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    },

    /**
     * Create a new food
     * @param {Object} foodDto - The food data to create
     * @returns {Promise<Object|null>} Created food data or null
     */
    async createFood(foodDto) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 foodService.createFood - data:', foodDto);
            }

            const response = await api.post(environment.api.endpoints.foods, foodDto);

            if (environment.features.enableLogging) {
                console.log('✅ Created food:', response.data);
            }

            // Extract data from ApiResponseBase<T>
            return response.data?.data || null;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to create food:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    },

    /**
     * Update an existing food
     * @param {string|number} id - The food ID to update
     * @param {Object} foodDto - The updated food data
     * @returns {Promise<Object|null>} Updated food data or null
     */
    async updateFood(id, foodDto) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 foodService.updateFood - ID:', id, 'data:', foodDto);
            }

            const response = await api.put(`${environment.api.endpoints.foods}/${id}`, foodDto);

            if (environment.features.enableLogging) {
                console.log('✅ Updated food:', response.data);
            }

            // Extract data from ApiResponseBase<T>
            return response.data?.data || null;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to update food:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    },

    /**
     * Delete a food
     * @param {string|number} id - The food ID to delete
     * @returns {Promise<Object>} Deletion result wrapped in ApiResponseBase
     */
    async deleteFood(id) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 foodService.deleteFood - ID:', id);
            }

            const response = await api.delete(`${environment.api.endpoints.foods}/${id}`);

            if (environment.features.enableLogging) {
                console.log('✅ Deleted food:', response.data);
            }

            // Return full ApiResponseBase<T> for consistent handling
            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to delete food:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    },
};