import api from './api/config';

// Patient Service for Disease-Based Food Ordering
export const patientService = {
    // Get all patients with disease categories for a branch
    async getPatientsByBranch(branchId) {
        const response = await api.get('/api/v1/Patient/with-disease-categories-by-branch', {
            params: { branchId }
        });
        return response.data;
    },

    // Get patient with disease categories
    async getPatientWithDiseaseCategories(patientId) {
        const response = await api.get(`/api/v1/patients/${patientId}/with-disease-categories`);
        return response.data;
    },

    // Get allowed foods for a patient based on their disease categories
    async getAllowedFoodsForPatient(patientId, diseaseCategoryId = null) {
        const params = {};
        if (diseaseCategoryId) {
            params.diseaseCategoryId = diseaseCategoryId;
        }

        // Debug logging
        console.log('🍽️ patientService.getAllowedFoodsForPatient:', {
            patientId,
            diseaseCategoryId,
            params
        });

        const response = await api.get(`/api/v1/DiseaseCategoryFoodRestrictions/patient/${patientId}/allowed-foods`, {
            params
        });
        return response.data;
    },

    // Validate single food for a patient
    async validateFoodForPatient(patientId, foodId) {
        const response = await api.get(`/api/v1/DiseaseCategoryFoodRestrictions/patient/${patientId}/validate-food/${foodId}`);
        return response.data;
    },

    // Bulk validate foods for a patient
    async bulkValidateFoodsForPatient(patientId, foodIds) {
        const response = await api.post(`/api/v1/DiseaseCategoryFoodRestrictions/patient/${patientId}/validate-foods`, {
            foodIds
        });
        return response.data;
    },

    // Create order for patient with food validation
    async createPatientOrder(orderData) {
        const response = await api.post('/api/v1/orders/patient-order', orderData);
        return response.data;
    },

    // Get patient order history
    async getPatientOrderHistory(patientId) {
        const response = await api.get(`/api/v1/orders/patient/${patientId}/history`);
        return response.data;
    },

    // CRUD operations for disease category food restrictions
    async createDiseaseCategoryFoodRestriction(restrictionData) {
        const response = await api.post('/api/v1/DiseaseCategoryFoodRestrictions', restrictionData);
        return response.data;
    },

    async updateDiseaseCategoryFoodRestriction(id, restrictionData) {
        const response = await api.put(`/api/v1/DiseaseCategoryFoodRestrictions/${id}`, restrictionData);
        return response.data;
    },

    async deleteDiseaseCategoryFoodRestriction(id) {
        const response = await api.delete(`/api/v1/DiseaseCategoryFoodRestrictions/${id}`);
        return response.data;
    },

    async getDiseaseCategoryFoodRestriction(id) {
        const response = await api.get(`/api/v1/DiseaseCategoryFoodRestrictions/${id}`);
        return response.data;
    },

    async getAllDiseaseCategoryFoodRestrictions() {
        const response = await api.get('/api/v1/DiseaseCategoryFoodRestrictions');
        return response.data;
    },

    // Bulk operations for disease category food restrictions
    async bulkCreateDiseaseCategoryFoodRestrictions(restrictionsData) {
        const response = await api.post('/api/v1/DiseaseCategoryFoodRestrictions/bulk-create', restrictionsData);
        return response.data;
    },

    async bulkUpdateDiseaseCategoryFoodRestrictions(restrictionsData) {
        const response = await api.put('/api/v1/DiseaseCategoryFoodRestrictions/bulk-update', restrictionsData);
        return response.data;
    },

    async bulkDeleteDiseaseCategoryFoodRestrictions(ids) {
        const response = await api.delete('/api/v1/DiseaseCategoryFoodRestrictions/bulk-delete', {
            data: { ids }
        });
        return response.data;
    }
};

// Disease Category Service
export const diseaseCategoryService = {
    // Get all disease categories for a branch
    async getDiseaseCategories(branchId) {
        const response = await api.get('/api/v1/diseasecategories', {
            params: { branchId }
        });
        return response.data;
    },

    // Get active disease categories
    async getActiveDiseaseCategories(branchId) {
        const response = await api.get('/api/v1/diseasecategories/active', {
            params: { branchId }
        });
        return response.data;
    },

    // Get disease categories with food restriction counts
    async getDiseaseCategoriesWithFoodRestrictionCounts(branchId) {
        const response = await api.get('/api/v1/diseasecategories/with-food-restriction-counts', {
            params: { branchId }
        });
        return response.data;
    }
};

// Food Restriction Service
export const foodRestrictionService = {
    // Get all food restrictions for a branch
    async getFoodRestrictions(branchId) {
        const response = await api.get('/api/v1/diseasecategoryfoodrestrictions', {
            params: { branchId }
        });
        return response.data;
    },

    // Get active food restrictions
    async getActiveFoodRestrictions(branchId) {
        const response = await api.get('/api/v1/diseasecategoryfoodrestrictions/active', {
            params: { branchId }
        });
        return response.data;
    },

    // Create a food restriction
    async createFoodRestriction(restrictionData) {
        const response = await api.post('/api/v1/diseasecategoryfoodrestrictions', restrictionData);
        return response.data;
    },

    // Update a food restriction
    async updateFoodRestriction(restrictionId, restrictionData) {
        const response = await api.put(`/api/v1/diseasecategoryfoodrestrictions/${restrictionId}`, restrictionData);
        return response.data;
    },

    // Delete a food restriction
    async deleteFoodRestriction(restrictionId) {
        const response = await api.delete(`/api/v1/diseasecategoryfoodrestrictions/${restrictionId}`);
        return response.data;
    }
};

// Order Service for Nurse Food Ordering
export const nurseOrderService = {
    // Create an order for a patient (with food validation)
    async createOrderForPatient(orderData, branchId) {
        // First validate foods for the patient
        const validationResults = await patientService.validateFoodsForPatient(
            orderData.patientId,
            orderData.foodIds,
            branchId
        );

        // Check if any food is not allowed
        const restrictedFoods = validationResults.data?.filter(result => !result.isAllowed) || [];

        if (restrictedFoods.length > 0) {
            const restrictedFoodNames = restrictedFoods.map(f => f.foodName).join(', ');
            throw new Error(`The following foods are restricted for this patient: ${restrictedFoodNames}`);
        }

        // If all foods are allowed, create the order
        const response = await api.post('/api/v1/orders', {
            ...orderData,
            orderType: 'NURSE_ORDER', // Mark as nurse-assisted order
            validationResults: validationResults.data // Include validation results for audit
        });

        return response.data;
    },

    // Get order history for a patient
    async getOrderHistoryForPatient(patientId, branchId) {
        const response = await api.get(`/api/v1/orders/patient/${patientId}`, {
            params: { branchId }
        });
        return response.data;
    },

    // Get orders by nurse
    async getOrdersByNurse(nurseId, branchId) {
        const response = await api.get('/api/v1/orders/by-nurse', {
            params: { nurseId, branchId }
        });
        return response.data;
    }
};

export default {
    patientService,
    diseaseCategoryService,
    foodRestrictionService,
    nurseOrderService
}; 