import api from './api/config';
import environment from '../config/environment';

export const patientService = {
  async getPatientsByBranch(branchId) {
    const response = await api.get('/api/v1/Patient/with-disease-categories-by-branch', {
      params: { branchId: parseInt(branchId, 10) },
    });
    return response.data;
  },

  async searchPatients(searchTerm, branchId) {
    const response = await api.get('/api/v1/Patient/search', {
      params: {
        searchTerm,
        branchId: parseInt(branchId, 10),
      },
    });
    return response.data;
  },

  async getPatientsByRoom(roomNumber, branchId) {
    const response = await api.get('/api/v1/Patient/by-room', {
      params: {
        roomNumber,
        branchId: parseInt(branchId, 10),
      },
    });
    return response.data;
  },

  async getPatientWithDiseaseCategories(patientId) {
    const response = await api.get(`/api/v1/Patient/with-disease-categories`, {
      params: { patientId },
    });
    return response.data;
  },

  async createPatient(patientData, branchId) {
    const payload = {
      ...patientData,
      branchId: parseInt(branchId, 10),
      departmentId: patientData.departmentId ? parseInt(patientData.departmentId, 10) : null, // Explicitly include departmentId
    };

    if (!payload.diseaseCategoryIds?.length) {
      delete payload.diseaseCategoryIds;
    }

    try {
      if (environment.features.enableLogging) {
        console.log('🔍 patientService.createPatient - Sending payload:', JSON.stringify(payload, null, 2));
      }
      const response = await api.post('/api/v1/Patient', payload);
      if (environment.features.enableLogging) {
        console.log('✅ patientService.createPatient - Success:', JSON.stringify(response.data, null, 2));
      }
      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ patientService.createPatient - Error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
      throw new Error(error.response?.data?.message || 'Lỗi khi tạo bệnh nhân');
    }
  },

  async updatePatient(patientId, patientData, branchId) {
    try {
      const payload = {
        ...patientData,
        branchId: parseInt(branchId, 10),
        departmentId: patientData.departmentId ? parseInt(patientData.departmentId, 10) : null,
      };

      if (!payload.diseaseCategoryIds?.length) {
        delete payload.diseaseCategoryIds;
      }

      console.log('🔍 Sending update patient payload:', JSON.stringify(payload, null, 2));

      const response = await api.put(`/api/v1/Patient/${patientId}`, payload);
      console.log('✅ Update patient response:', JSON.stringify(response.data, null, 2));

      return response.data;
    } catch (error) {
      console.error('❌ Update patient error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật bệnh nhân');
    }
  },

  async deletePatient(patientId, branchId) {
    try {
      const response = await api.delete(`/api/v1/Patient/${patientId}`, {
        params: { branchId: parseInt(branchId, 10) },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Lỗi khi xóa bệnh nhân');
    }
  },

  async assignDiseaseCategories(patientId, diseaseCategoryIds, branchId) {
    const response = await api.post(`/api/v1/Patient/${patientId}/disease-categories`, {
      diseaseCategoryIds,
      branchId: parseInt(branchId, 10),
    });
    return response.data;
  },

  async getPatientOrderHistory(patientId) {
    const response = await api.get(`/api/v1/orders/patient/${patientId}/history`);
    return response.data;
  },
};

export const diseaseCategoryService = {
  async getDiseaseCategories(branchId) {
    const response = await api.get('/api/v1/diseasecategories', {
      params: { branchId: parseInt(branchId, 10) },
    });
    return response.data;
  },

  async getActiveDiseaseCategories(branchId) {
    const response = await api.get('/api/v1/diseasecategories/active', {
      params: { branchId: parseInt(branchId, 10) },
    });
    return response.data;
  },

  async getDiseaseCategoriesWithFoodRestrictionCounts(branchId) {
    const response = await api.get('/api/v1/diseasecategories/with-food-restriction-counts', {
      params: { branchId: parseInt(branchId, 10) },
    });
    return response.data;
  },
};

export const nurseOrderService = {
  async createOrderForPatient(orderData, branchId) {
    try {
      const normalizedBranchId = parseInt(branchId, 10);
      console.log(`🔍 nurseOrderService.createOrderForPatient - Sending to /api/v1/order/AddOrderV2`, JSON.stringify(orderData, null, 2));

      // Map orderData to OrderDtoV2 structure
      const orderDto = {
        branchId: normalizedBranchId,
        userId: orderData.userId || 'NURSE_DEFAULT',
        patientId: orderData.patientId,
        isPatientOrder: true,
        orderDate: orderData.orderDate || new Date().toISOString(),
        receiveDate: orderData.receiveDate ? new Date(orderData.receiveDate).toISOString() : null,
        receiveTime: orderData.receiveTime || '12:00',
        receiveType: orderData.receiveType || 'Giao tận nơi',
        type: orderData.type || 'Patient',
        status: orderData.status || 'Confirmed',
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone || '0000000000',
        customerAddress: orderData.customerAddress || 'Phòng bệnh nhân',
        total: orderData.total || 0,
        shippingFee: orderData.shippingFee || 0,
        foodToolFee: orderData.foodToolFee || 0,
        paymentMethod: orderData.paymentMethod || 3,
        isPaid: orderData.isPaid !== undefined ? orderData.isPaid : true,
        walletAmountUsed: orderData.walletAmountUsed || 0,
        code: orderData.code || `ORD${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        note: orderData.note || '',
        locationId: orderData.locationId || null,
        orderDetails: orderData.orderDetails.map(item => ({
          foodId: Number(item.foodId),
          orderId: 0,
          qty: Number(item.quantity),
          price: Number(item.price || 0),
          total: Number(item.total || 0),
          note: item.note || null,
          foodName: item.foodName || '',
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        })),
      };

      const response = await api.post('/api/v1/order/AddOrderV2', orderDto, {
        headers: normalizedBranchId ? { 'X-Branch-Id': normalizedBranchId } : {},
      });

      console.log('✅ nurseOrderService.createOrderForPatient - Success:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('❌ nurseOrderService.createOrderForPatient - Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create patient order';
      throw new Error(errorMessage);
    }
  },

  async getOrderHistoryForPatient(patientId, branchId) {
    const response = await api.get(`/api/v1/orders/patient/${patientId}`, {
      params: { branchId: parseInt(branchId, 10) },
    });
    return response.data;
  },

  async getOrdersByNurse(nurseId, branchId) {
    const response = await api.get('/api/v1/orders/by-nurse', {
      params: { nurseId, branchId: parseInt(branchId, 10) },
    });
    return response.data;
  },
};

export default {
  patientService,
  diseaseCategoryService,
  nurseOrderService,
};