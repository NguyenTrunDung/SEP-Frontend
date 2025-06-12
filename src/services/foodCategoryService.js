import api, { environment } from './api/config';

export const foodCategoryService = {
  async getFoodCategories(branchId) {
    try {
      const config = {
        params: { branchId }, // Add branchId as query parameter per BE
        headers: { 'X-Branch-Id': branchId }, // Include X-Branch-Id header per Postman
      };

      const response = await api.get('/api/v1/foodcategories', config);

      if (environment.features.enableLogging) {
        console.log('✅ Fetched food categories:', response.data?.data?.length, 'items');
      }

      return response.data.data; // Access nested data property from ApiResponseBase
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch food categories:', error.response?.data?.message || error.message);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch food categories');
    }
  },

  async getFoodCategoryById(categoryId, branchId) {
    try {
      const config = {
        headers: { 'X-Branch-Id': branchId }, // Include X-Branch-Id header
      };

      const response = await api.get(`/api/v1/foodcategories/${categoryId}`, config);

      if (environment.features.enableLogging) {
        console.log('✅ Fetched food category:', response.data?.data?.name);
      }

      return response.data.data; // Access nested data property
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch food category:', error.response?.data?.message || error.message);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch food category');
    }
  },

  async createFoodCategory(formData, branchId) {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json', // Match BE's expected Content-Type
          'X-Branch-Id': branchId, // Include X-Branch-Id header
        },
      };

      // Convert FormData to JSON to match FoodCategoryDto
      const jsonData = {
        name: formData.get('name'),
        sort: parseInt(formData.get('sort'), 10),
        imageUrl: formData.get('imageUrl') || '', // Use imageUrl as per Postman
      };

      const response = await api.post('/api/v1/foodcategories', jsonData, config);

      if (environment.features.enableLogging) {
        console.log('✅ Created food category:', response.data?.data?.name);
      }

      return response.data.data; // Access nested data property
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to create food category:', error.response?.data?.message || error.message);
      }
      throw new Error(error.response?.data?.message || 'Failed to create food category');
    }
  },

  async updateFoodCategory(categoryId, formData, branchId) {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json', // Match BE's expected Content-Type
          'X-Branch-Id': branchId, // Include X-Branch-Id header
        },
      };

      // Convert FormData to JSON to match FoodCategoryDto
      const jsonData = {
        name: formData.get('name'),
        sort: parseInt(formData.get('sort'), 10),
        imageUrl: formData.get('imageUrl') || '', // Use imageUrl as per Postman
      };

      const response = await api.put(`/api/v1/foodcategories/${categoryId}`, jsonData, config);

      if (environment.features.enableLogging) {
        console.log('✅ Updated food category:', response.data?.data?.name);
      }

      return response.data.data; // Access nested data property
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to update food category:', error.response?.data?.message || error.message);
      }
      throw new Error(error.response?.data?.message || 'Failed to update food category');
    }
  },

  async deleteFoodCategory(categoryId, branchId) {
    try {
      const config = {
        headers: { 'X-Branch-Id': branchId }, // Include X-Branch-Id header
      };

      const response = await api.delete(`/api/v1/foodcategories/${categoryId}`, config);

      if (environment.features.enableLogging) {
        console.log('✅ Deleted food category:', categoryId);
      }

      return response.data.data; // Access nested data property
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to delete food category:', error.response?.data?.message || error.message);
      }
      throw new Error(error.response?.data?.message || 'Failed to delete food category');
    }
  },
};