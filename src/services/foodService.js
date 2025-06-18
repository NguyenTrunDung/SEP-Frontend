import api, { environment } from './api/config';

export const foodService = {
  async getFoods(branchId = '1') {
    try {
      const effectiveBranchId = branchId || '1';
      console.log('🔍 foodService.getFoods - branchId:', effectiveBranchId);
      const config = {
        params: { branchId: effectiveBranchId },
        headers: {
          'X-Branch-Id': effectiveBranchId,
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      };

      const response = await api.get('/api/v1/foods', config);

      if (environment.features.enableLogging) {
        console.log('✅ Raw API response:', response.data);
      }

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

  async getFood(id, branchId = '1') {
    try {
      const config = {
        headers: {
          'X-Branch-Id': branchId,
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      };
      const response = await api.get(`/api/v1/foods/${id}`, config);
      if (environment.features.enableLogging) {
        console.log('✅ Fetched food by ID:', response.data);
      }
      return response.data?.data || null;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch food:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  async createFood(foodDto, branchId = '1') {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'X-Branch-Id': branchId,
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      };
      const response = await api.post('/api/v1/foods', foodDto, config);
      return response.data?.data || null;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to create food:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  async updateFood(id, foodDto, branchId = '1') {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'X-Branch-Id': branchId,
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      };
      const response = await api.put(`/api/v1/foods/${id}`, foodDto, config);
      return response.data?.data || null;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to update food:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  async deleteFood(id, branchId = '1') {
    try {
      const config = {
        headers: {
          'X-Branch-Id': branchId,
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      };
      const response = await api.delete(`/api/v1/foods/${id}`, config);
      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to delete food:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },
};