import api, { environment } from './api/config';

export const foodService = {
    /**
     * Get all foods by branch (uses X-Branch-Id header)
     * GET /api/v1/foods?branchId={branchId}
     */
    async getFoods(branchId = null) {
        try {
            const config = { addBranchParam: true };

            // Override branch ID if provided
            if (branchId) {
                config.headers = { 'X-Branch-Id': branchId };
            }

            const response = await api.get('/api/v1/foods', config);

            if (environment.features.enableLogging) {
                console.log('✅ Fetched foods:', response.data?.length, 'items');
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch foods:', error.message);
            }
            throw error;
        }
    },

    /**
     * Get food by ID (branch context from header)
     * GET /api/v1/foods/{id}
     */
    async getFoodById(foodId, branchId = null) {
        try {
            const config = {};

            // Override branch ID if provided
            if (branchId) {
                config.headers = { 'X-Branch-Id': branchId };
            }

            const response = await api.get(`/api/v1/foods/${foodId}`, config);

            if (environment.features.enableLogging) {
                console.log('✅ Fetched food:', response.data?.name);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch food:', error.message);
            }
            throw error;
        }
    },

    /**
     * Create food (branch context required)
     * POST /api/v1/foods
     */
    async createFood(foodData, branchId = null) {
        try {
            const config = {};

            // Override branch ID if provided
            if (branchId) {
                config.headers = { 'X-Branch-Id': branchId };
            }

            const payload = {
                name: foodData.name,
                categoryId: foodData.categoryId,
                description: foodData.description,
                priceForGuest: foodData.priceForGuest,
                ...foodData
            };

            const response = await api.post('/api/v1/foods', payload, config);

            if (environment.features.enableLogging) {
                console.log('✅ Created food:', response.data?.name);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to create food:', error.message);
            }
            throw error;
        }
    },

    /**
     * Update food (branch context required)
     * PUT /api/v1/foods/{id}
     */
    async updateFood(foodId, foodData, branchId = null) {
        try {
            const config = {};

            // Override branch ID if provided
            if (branchId) {
                config.headers = { 'X-Branch-Id': branchId };
            }

            const payload = {
                name: foodData.name,
                categoryId: foodData.categoryId,
                description: foodData.description,
                priceForGuest: foodData.priceForGuest,
                ...foodData
            };

            const response = await api.put(`/api/v1/foods/${foodId}`, payload, config);

            if (environment.features.enableLogging) {
                console.log('✅ Updated food:', response.data?.name);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to update food:', error.message);
            }
            throw error;
        }
    },

    /**
     * Delete food (branch context required)
     * DELETE /api/v1/foods/{id}
     */
    async deleteFood(foodId, branchId = null) {
        try {
            const config = {};

            // Override branch ID if provided
            if (branchId) {
                config.headers = { 'X-Branch-Id': branchId };
            }

            const response = await api.delete(`/api/v1/foods/${foodId}`, config);

            if (environment.features.enableLogging) {
                console.log('✅ Deleted food:', foodId);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to delete food:', error.message);
            }
            throw error;
        }
    },

    /**
     * Get foods by category
     */
    async getFoodsByCategory(categoryId, branchId = null) {
        try {
            const foods = await this.getFoods(branchId);
            const filteredFoods = foods.filter(food => food.categoryId === categoryId);

            if (environment.features.enableLogging) {
                console.log('✅ Fetched foods by category:', filteredFoods.length, 'items');
            }

            return filteredFoods;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch foods by category:', error.message);
            }
            throw error;
        }
    }
}; 