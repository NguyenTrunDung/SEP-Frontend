import api from './api/config';
import environment from '../config/environment';

export const patientService = {
  async getPatientsByBranch(branchId) {
    // Resolve departmentId from reliable sources on reload
    let userDepartmentId = localStorage.getItem('userDepartmentId');
    if (!userDepartmentId) {
      try {
        const userRaw = localStorage.getItem('userData');
        if (userRaw) {
          const user = JSON.parse(userRaw);
          if (user && user.departmentId != null) {
            userDepartmentId = String(user.departmentId);
            localStorage.setItem('userDepartmentId', userDepartmentId);
          }
        }
      } catch (_) { /* ignore */ }
    }

    const params = { branchId: parseInt(branchId, 10) };

    // Add departmentId filter if available
    if (userDepartmentId) {
      params.departmentId = parseInt(userDepartmentId, 10);
    }

    try {
      const response = await api.get('/api/v1/Patient/with-disease-categories-by-branch', {
        params,
      });
      return response.data;
    } catch (error) {
      // Handle 404 "Patients not found" specifically
      if (error.response?.status === 404) {
        // Return empty array with a message for 404
        return {
          data: [],
          message: 'Không tìm thấy bệnh nhân nào trong khoa của bạn',
          status: 'success',
          totalCount: 0
        };
      }
      // Re-throw other errors
      throw error;
    }
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
      departmentId: patientData.departmentId ? parseInt(patientData.departmentId, 10) : null,
    };

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

  async assignDiseaseCategories(patientId, diseaseCategoryIds, branchId) {
    try {
      const responses = [];
      for (const categoryId of diseaseCategoryIds || []) {
        const payload = {
          patientId: patientId, // Gửi patientId dưới dạng chuỗi
          diseaseCategoryId: parseInt(categoryId, 10),
          branchId: parseInt(branchId, 10),
        };
        if (environment.features.enableLogging) {
          console.log('🔍 patientService.assignDiseaseCategories - Sending POST payload:', JSON.stringify(payload, null, 2));
        }
        const response = await api.post('/api/v1/PatientDiseaseCategory', payload);
        responses.push(response.data);
        if (environment.features.enableLogging) {
          console.log('✅ patientService.assignDiseaseCategories - Success for category:', categoryId, JSON.stringify(response.data, null, 2));
        }
      }
      return responses;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ patientService.assignDiseaseCategories - Error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
      throw new Error(error.response?.data?.message || 'Lỗi khi gán nhóm bệnh');
    }
  },

  async updateDiseaseCategories(patientId, diseaseCategoryIds, branchId) {
    try {
      // Lấy danh sách liên kết hiện tại
      const response = await api.get('/api/v1/PatientDiseaseCategory', {
        params: { branchId: parseInt(branchId, 10) },
      });
      const currentAssignments = response.data.data.filter(item => item.patientId === patientId);

      // Danh sách diseaseCategoryIds hiện tại
      const currentCategoryIds = currentAssignments.map(item => item.diseaseCategoryId);
      const newCategoryIds = diseaseCategoryIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

      // Xác định các bản ghi cần xóa (có trong hiện tại nhưng không có trong danh sách mới)
      const idsToDelete = currentAssignments
        .filter(item => !newCategoryIds.includes(item.diseaseCategoryId))
        .map(item => item.id);

      // Xóa các liên kết không còn cần
      for (const id of idsToDelete) {
        if (environment.features.enableLogging) {
          console.log('🔍 patientService.updateDiseaseCategories - Deleting assignment ID:', id);
        }
        await api.delete('/api/v1/PatientDiseaseCategory', {
          params: { id },
        });
        if (environment.features.enableLogging) {
          console.log('✅ patientService.updateDiseaseCategories - Deleted assignment ID:', id);
        }
      }

      // Xác định các id cần thêm (có trong danh sách mới nhưng không có trong hiện tại)
      const idsToAdd = newCategoryIds.filter(id => !currentCategoryIds.includes(id));

      // Xác định các id cần cập nhật (có trong cả hiện tại và mới)
      const idsToUpdate = currentAssignments
        .filter(item => newCategoryIds.includes(item.diseaseCategoryId))
        .map(item => ({
          id: item.id,
          diseaseCategoryId: item.diseaseCategoryId,
        }));

      const responses = [];

      // Cập nhật các liên kết hiện có (nếu cần)
      for (const assignment of idsToUpdate) {
        const payload = {
          patientId: patientId,
          diseaseCategoryId: assignment.diseaseCategoryId,
          branchId: parseInt(branchId, 10),
        };
        if (environment.features.enableLogging) {
          console.log('🔍 patientService.updateDiseaseCategories - Sending PUT payload for ID:', assignment.id, JSON.stringify(payload, null, 2));
        }
        const response = await api.put('/api/v1/PatientDiseaseCategory', payload, {
          params: { id: assignment.id },
        });
        responses.push(response.data);
        if (environment.features.enableLogging) {
          console.log('✅ patientService.updateDiseaseCategories - Updated assignment ID:', assignment.id, JSON.stringify(response.data, null, 2));
        }
      }

      // Thêm các liên kết mới
      for (const categoryId of idsToAdd) {
        const payload = {
          patientId: patientId,
          diseaseCategoryId: categoryId,
          branchId: parseInt(branchId, 10),
        };
        if (environment.features.enableLogging) {
          console.log('🔍 patientService.updateDiseaseCategories - Sending POST payload:', JSON.stringify(payload, null, 2));
        }
        const response = await api.post('/api/v1/PatientDiseaseCategory', payload);
        responses.push(response.data);
        if (environment.features.enableLogging) {
          console.log('✅ patientService.updateDiseaseCategories - Success for category:', categoryId, JSON.stringify(response.data, null, 2));
        }
      }

      return responses;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ patientService.updateDiseaseCategories - Error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
      throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật nhóm bệnh');
    }
  },

async updatePatient(patientId, patientData, branchId) {
  const payload = {
    ...patientData,
    branchId: parseInt(branchId, 10),
    departmentId: patientData.departmentId ? parseInt(patientData.departmentId, 10) : null,
    diseaseCategoryIds: patientData.diseaseCategoryIds || [], // Đảm bảo diseaseCategoryIds được gửi
  };

  try {
    if (environment.features.enableLogging) {
      console.log('🔍 patientService.updatePatient - Sending payload:', JSON.stringify(payload, null, 2));
    }
    const response = await api.put(`/api/v1/Patient/${patientId}`, payload);
    if (environment.features.enableLogging) {
      console.log('✅ patientService.updatePatient - Success:', JSON.stringify(response.data, null, 2));
    }
    return response.data;
  } catch (error) {
    if (environment.features.enableLogging) {
      console.error('❌ patientService.updatePatient - Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    // throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật bệnh nhân');
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

  async clearDiseaseCategories(patientId, branchId) {
    try {
      const response = await api.get('/api/v1/PatientDiseaseCategory', {
        params: { branchId: parseInt(branchId, 10) },
      });
      const patientAssignments = response.data.data.filter(item => item.patientId === patientId);

      for (const assignment of patientAssignments) {
        if (environment.features.enableLogging) {
          console.log('🔍 patientService.clearDiseaseCategories - Deleting assignment ID:', assignment.id);
        }
        await api.delete('/api/v1/PatientDiseaseCategory', {
          params: { id: assignment.id },
        });
        if (environment.features.enableLogging) {
          console.log('✅ patientService.clearDiseaseCategories - Deleted assignment ID:', assignment.id);
        }
      }
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ patientService.clearDiseaseCategories - Error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
      console.warn('Warning: Failed to clear existing disease categories, proceeding with assignment');
    }
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

      const orderDto = {
        branchId: normalizedBranchId,
        userId: orderData.userId || 'NURSE_DEFAULT',
        patientId: orderData.patientId,
        isPatientOrder: true,
        orderDate: orderData.orderDate || new Date().toISOString(),
        receiveDate: orderData.receiveDate ? new Date(orderData.receiveDate).toISOString() : null,
        receiveTime: orderData.receiveTime || '45 phút',
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
          qty: Number(item.qty || item.quantity || 0),
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