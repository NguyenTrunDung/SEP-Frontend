import api, { environment } from './api/config';

export const locationService = {
  async getAreas(branchId) {
    try {
      if (!branchId) throw new Error('Thiếu branchId khi gọi getAreas');

      if (environment.features.enableLogging) {
        console.log('🔍 locationService.getAreas for branchId:', branchId);
      }

      const config = {
        params: { branchId },
      };

      const response = await api.get('/api/v1/areas', config);
      console.log('✅ API /api/v1/areas response:', response.data); // Log để kiểm tra

      if (environment.features.enableLogging) {
        console.log('✅ Fetched areas:', response.data);
      }

      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch areas:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  async getLocationsByArea(areaId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 locationService.getLocationsByArea - areaId:', areaId);
      }

      const config = { params: { areaId } };
      const response = await api.get('/api/v1/locations/by-area', config);

      if (environment.features.enableLogging) {
        console.log('✅ Full API response:', response.data);
      }

      const res = response.data;

      if (res.status !== 'success') {
        console.warn('⚠️ Response status not success:', res.message);
        return [];
      }

      if (!Array.isArray(res.data)) {
        console.warn('⚠️ Invalid data format. Expected an array:', res.data);
        return [];
      }

      return res.data;
    } catch (error) {
      console.error('❌ Failed to fetch locations:', error.response?.data || error.message);
      throw error;
    }
  },

  async getLocationById(locationId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 locationService.getLocationById - ID:', locationId);
      }
      const response = await api.get(`/api/v1/locations/${locationId}`);
      if (environment.features.enableLogging) {
        console.log('✅ Fetched location by ID:', response.data);
      }
      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch location:', error.response?.data?.message || error.message);
      }
      if (error.response?.status === 404) {
        return { data: null, message: 'Location not found', status: 'error' };
      }
      throw error;
    }
  },

  async createLocation(locationData) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 locationService.createLocation - data:', locationData);
      }
      if (!locationData.name || !locationData.areaId || !locationData.branchId) {
        throw new Error('Thiếu các trường bắt buộc: name, areaId, hoặc branchId');
      }
      const response = await api.post('/api/v1/locations', locationData);
      console.log('✅ Created location - response:', response.data);
      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to create location:', error.response?.data || error.message);
      }
      throw error;
    }
  },

  async updateLocation(locationId, locationData) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 locationService.updateLocation - ID:', locationId, 'data:', locationData);
      }
      const response = await api.put(`/api/v1/locations/${locationId}`, locationData);
      if (environment.features.enableLogging) {
        console.log('✅ Updated location:', response.data);
      }
      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to update location:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  async deleteLocation(locationId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 locationService.deleteLocation - ID:', locationId);
      }
      const response = await api.delete(`/api/v1/locations/${locationId}`);
      if (environment.features.enableLogging) {
        console.log('✅ Deleted location:', response.data);
      }
      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to delete location:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  async validateLocationName(areaId, name, excludeId = null) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 locationService.validateLocationName - areaId:', areaId, 'name:', name, 'excludeId:', excludeId);
      }
      if (!areaId || !name || name.trim() === '') {
        throw new Error('areaId và name là bắt buộc');
      }
      const config = { params: { areaId, name: name.trim(), excludeId } };
      const response = await api.get('/api/v1/locations/validate-name', config);
      if (environment.features.enableLogging) {
        console.log('✅ Validate location name response:', response.data);
      }
      if (response.data?.status === 'error') {
        throw new Error(response.data.message || 'Tên vị trí không hợp lệ');
      }
      return response.data?.data === true;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to validate location name:', error.response?.data?.message || error.message);
      }
      throw new Error(error.response?.data?.message || 'Lỗi khi kiểm tra tên vị trí');
    }
  },
};