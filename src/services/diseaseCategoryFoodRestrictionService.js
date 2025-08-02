import api from './api/config';
import { environment } from './api/config';

export const diseaseCategoryFoodRestrictionService = {
    /**
     * Get all disease category food restrictions for a branch
     * @param {string|number} branchId - The branch ID
     * @returns {Promise<Object>} API response containing food restrictions
     */
    async getDiseaseCategoryFoodRestrictions(branchId) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 diseaseCategoryFoodRestrictionService.getDiseaseCategoryFoodRestrictions - requesting for branch:', branchId);
            }

            const currentBranchId = branchId || environment.multiTenant.getCurrentBranchId() || '1';
            const config = {
                params: { branchId: currentBranchId },
            };

            const response = await api.get('/api/v1/DiseaseCategoryFoodRestrictions', config);

            if (environment.features.enableLogging) {
                console.log('✅ Raw API response:', response.data);
                console.log('📍 Used branchId query param:', currentBranchId);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch disease category food restrictions:', error.response?.data?.message || error.message);
            }
            if (error.response?.status === 404) {
                return { data: [], message: 'No food restrictions found', status: 'error' };
            }
            throw error;
        }
    },

    /**
     * Get disease categories for a branch
     * @param {string|number} branchId - The branch ID
     * @returns {Promise<Object>} API response containing disease categories
     */
    async getDiseaseCategories(branchId) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 diseaseCategoryFoodRestrictionService.getDiseaseCategories - requesting for branch:', branchId);
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
     * Create a new disease category food restriction
     * @param {Object} restrictionData - The restriction data (note: restrictionLevel field is no longer used)
     * @returns {Promise<Object>} API response
     */
    async createDiseaseCategoryFoodRestriction(restrictionData) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 diseaseCategoryFoodRestrictionService.createDiseaseCategoryFoodRestriction - creating:', restrictionData);
            }

            const response = await api.post('/api/v1/DiseaseCategoryFoodRestrictions', restrictionData);

            if (environment.features.enableLogging) {
                console.log('✅ Created food restriction:', response.data);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to create food restriction:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    },

    /**
     * Update an existing disease category food restriction
     * @param {number} id - The restriction ID
     * @param {Object} restrictionData - The updated restriction data (note: restrictionLevel field is no longer used)
     * @returns {Promise<Object>} API response
     */
    async updateDiseaseCategoryFoodRestriction(id, restrictionData) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 diseaseCategoryFoodRestrictionService.updateDiseaseCategoryFoodRestriction - updating:', { id, restrictionData });
            }

            const response = await api.put(`/api/v1/DiseaseCategoryFoodRestrictions/${id}`, restrictionData);

            if (environment.features.enableLogging) {
                console.log('✅ Updated food restriction:', response.data);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to update food restriction:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    },

    /**
     * Delete a disease category food restriction
     * @param {number} id - The restriction ID
     * @returns {Promise<Object>} API response
     */
    async deleteDiseaseCategoryFoodRestriction(id) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 diseaseCategoryFoodRestrictionService.deleteDiseaseCategoryFoodRestriction - deleting:', id);
            }

            const response = await api.delete(`/api/v1/DiseaseCategoryFoodRestrictions/${id}`);

            if (environment.features.enableLogging) {
                console.log('✅ Deleted food restriction:', response.data);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to delete food restriction:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    },

    /**
     * Get a specific disease category food restriction by ID
     * @param {number} id - The restriction ID
     * @returns {Promise<Object>} API response
     */
    async getDiseaseCategoryFoodRestriction(id) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 diseaseCategoryFoodRestrictionService.getDiseaseCategoryFoodRestriction - getting:', id);
            }

            const response = await api.get(`/api/v1/DiseaseCategoryFoodRestrictions/${id}`);

            if (environment.features.enableLogging) {
                console.log('✅ Got food restriction:', response.data);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to get food restriction:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    },
}; 