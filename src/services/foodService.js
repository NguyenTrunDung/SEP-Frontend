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
     * Uses the GET /api/v1/foods endpoint with branchId query parameter
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
     * Get foods by specific branch ID
     * Uses the GET /api/v1/foods/branch/{branchId} endpoint
     * @param {string|number} branchId - The branch ID
     * @returns {Promise<Array>} Array of food objects
     */
    async getFoodsByBranch(branchId) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 foodService.getFoodsByBranch - branchId:', branchId);
            }

            const response = await api.get(`${environment.api.endpoints.foods}/branch/${branchId}`);

            if (environment.features.enableLogging) {
                console.log('✅ Fetched foods by branch:', response.data);
            }

            // This endpoint returns raw data without ApiResponseBase wrapper
            return response.data || [];
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch foods by branch:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    },

    /**
     * Get a specific food by ID
     * Uses the GET /api/v1/foods/{id} endpoint
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
     * Create a new food (basic DTO without image)
     * Uses the POST /api/v1/foods endpoint
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
     * Create a new food with image upload
     * Uses the POST /api/v1/foods/create endpoint with multipart/form-data
     * @param {Object} foodData - The food data to create
     * @param {File} imageFile - The image file to upload (optional)
     * @returns {Promise<Object|null>} Created food data or null
     */
    async createFoodWithImage(foodData, imageFile = null) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 foodService.createFoodWithImage - data:', foodData, 'image:', imageFile?.name);
            }

            // Get current branch ID
            const currentBranchId = environment.multiTenant.getCurrentBranchId();

            // Create FormData for multipart upload
            const formData = new FormData();
            formData.append('Name', foodData.name || '');
            formData.append('Description', foodData.description || '');
            formData.append('CategoryId', foodData.categoryId?.toString() || '');
            formData.append('IsAddOn', foodData.isAddOn || false);
            formData.append('IsSetDish', foodData.isSetDish || false);
            formData.append('PriceForGuest', foodData.priceForGuest?.toString() || '0');
            formData.append('PriceForPatient', foodData.priceForPatient?.toString() || '0');
            formData.append('PriceForStaff', foodData.priceForStaff?.toString() || '0');
            formData.append('Sort', foodData.sort?.toString() || '1');
            formData.append('BranchId', currentBranchId || '1');

            if (imageFile) {
                formData.append('Image', imageFile);
            }

            const response = await api.post(`${environment.api.endpoints.foods}/create`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (environment.features.enableLogging) {
                console.log('✅ Created food with image:', response.data);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to create food with image:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    },

    /**
     * Update an existing food (basic DTO without image)
     * Uses the PUT /api/v1/foods/{id} endpoint
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
     * Update an existing food with image upload
     * Uses the PUT /api/v1/foods/update/{id} endpoint with multipart/form-data
     * @param {string|number} id - The food ID to update
     * @param {Object} foodData - The updated food data
     * @param {File} imageFile - The image file to upload (optional)
     * @returns {Promise<Object|null>} Updated food data or null
     */
    async updateFoodWithImage(id, foodData, imageFile = null) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 foodService.updateFoodWithImage - ID:', id, 'data:', foodData, 'image:', imageFile?.name);
            }

            // Get current branch ID
            const currentBranchId = environment.multiTenant.getCurrentBranchId();

            // Create FormData for multipart upload
            const formData = new FormData();
            formData.append('Name', foodData.name || '');
            formData.append('Description', foodData.description || '');
            formData.append('CategoryId', foodData.categoryId?.toString() || '');
            formData.append('IsAddOn', foodData.isAddOn || false);
            formData.append('IsSetDish', foodData.isSetDish || false);
            formData.append('PriceForGuest', foodData.priceForGuest?.toString() || '0');
            formData.append('PriceForPatient', foodData.priceForPatient?.toString() || '0');
            formData.append('PriceForStaff', foodData.priceForStaff?.toString() || '0');
            formData.append('Sort', foodData.sort?.toString() || '1');
            formData.append('BranchId', currentBranchId || '1');

            if (imageFile) {
                formData.append('Image', imageFile);
            }

            const response = await api.put(`${environment.api.endpoints.foods}/update/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (environment.features.enableLogging) {
                console.log('✅ Updated food with image:', response.data);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to update food with image:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    },

    /**
     * Delete a food
     * Uses the DELETE /api/v1/foods/{id} endpoint
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