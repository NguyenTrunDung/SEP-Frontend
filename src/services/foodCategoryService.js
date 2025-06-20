import api, { environment } from './api/config';

export const foodCategoryService = {
  async getFoodCategories(branchId = '1') {
    try {
      const effectiveBranchId = branchId || '1';
      console.log('🔍 foodCategoryService.getFoodCategories - branchId:', effectiveBranchId);
      const config = {
        params: { branchId: effectiveBranchId },
        headers: { 'X-Branch-Id': effectiveBranchId },
      };

      const response = await api.get('/api/v1/foodcategories', config);

      if (environment.features.enableLogging) {
        console.log('✅ Raw API response:', response.data);
      }

      // Extract data from ApiResponseBase
      const categories = response.data?.data || [];
      if (environment.features.enableLogging) {
        console.log('✅ Fetched food categories:', categories.length, 'items');
      }

      return categories;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch food categories:', error.response?.data?.message || error.message);
      }
      throw error; // Let the hook handle the error
    }
  },

  async getFoodCategoryById(categoryId, branchId = '1') {
    try {
      const config = {
        headers: { 'X-Branch-Id': branchId },
      };
      const response = await api.get(`/api/v1/foodcategories/${categoryId}`, config);
      return response.data?.data || null;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch food category:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  async createFoodCategory(jsonData, branchId = '1') {
    try {
      const config = {
        headers: { 'Content-Type': 'application/json', 'X-Branch-Id': branchId },
      };
      const response = await api.post('/api/v1/foodcategories', jsonData, config);
      return response.data; // Return ApiResponseBase<FoodCategoryDto>
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to create food category:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  async updateFoodCategory(categoryId, jsonData, branchId = '1') {
    try {
      const config = {
        headers: { 'Content-Type': 'application/json', 'X-Branch-Id': branchId },
      };
      const response = await api.put(`/api/v1/foodcategories/${categoryId}`, jsonData, config);
      return response.data; // Return ApiResponseBase<FoodCategoryDto>
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to update food category:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  async deleteFoodCategory(categoryId, branchId = '1') {
    try {
      const config = {
        headers: { 'X-Branch-Id': branchId },
      };
      const response = await api.delete(`/api/v1/foodcategories/${categoryId}`, config);
      return response.data; // Return ApiResponseBase<object>
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to delete food category:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },
};