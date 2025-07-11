import api, { environment } from './api/config';

const normalizeBranchId = (branchId) => {
  const resolvedBranchId =
    branchId !== undefined && branchId !== null
      ? branchId
      : environment.multiTenant.getCurrentBranchId();

  const id =
    resolvedBranchId !== undefined && resolvedBranchId !== null
      ? String(resolvedBranchId)
      : '1';

  if (environment.features.enableLogging) {
    console.log(`🔄 Normalized branchId: ${id}`);
  }

  return id;
};

export const orderService = {
  async getOrders(branchId) {
    try {
      const currentBranchId = normalizeBranchId(branchId);
      if (environment.features.enableLogging) {
        console.log('🔍 orderService.getOrders - requesting orders for branch:', currentBranchId);
      }
      const response = await api.get(`/api/v1/order/branch/${currentBranchId}`);
      if (environment.features.enableLogging) {
        console.log('✅ Raw API response:', JSON.stringify(response.data, null, 2));
      }
      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch orders:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  async searchOrders(keyword, branchId) {
    try {
      const currentBranchId = String(branchId || environment.multiTenant.getCurrentBranchId() || '1');
      if (environment.features.enableLogging) {
        console.log('🔍 orderService.searchOrders - keyword:', keyword, 'branchId:', currentBranchId);
      }
      const response = await api.get('/api/v1/order/search', { params: { keyword, branchId: currentBranchId } });
      if (environment.features.enableLogging) {
        console.log('✅ Search orders response:', JSON.stringify(response.data, null, 2));
      }
      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to search orders:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  async filterOrders(filters) {
    try {
      const currentBranchId = String(filters.branchId || environment.multiTenant.getCurrentBranchId() || '1');
      if (environment.features.enableLogging) {
        console.log('🔍 orderService.filterOrders - filters:', { ...filters, branchId: currentBranchId });
      }
      const response = await api.get('/api/v1/order/filter', { params: { ...filters, branchId: currentBranchId } });
      if (environment.features.enableLogging) {
        console.log('✅ Filter orders response:', JSON.stringify(response.data, null, 2));
      }
      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to filter orders:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  async createOrder(orderData) {
    try {
      const currentBranchId = String(orderData.branchId || environment.multiTenant.getCurrentBranchId() || '1');
      const payload = {
        ...orderData,
        branchId: currentBranchId,
        paymentStatus: orderData.paymentStatus ? orderData.paymentStatus.toLowerCase() : 'pending', // Chuẩn hóa
      };
      if (environment.features.enableLogging) {
        console.log('🔍 orderService.createOrder - data:', JSON.stringify(payload, null, 2));
      }
      const response = await api.post('/api/v1/order/AddOrder', payload);
      if (environment.features.enableLogging) {
        console.log('✅ Created order - response:', JSON.stringify(response.data, null, 2));
      }
      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to create order:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  async updateOrder(orderId, orderData) {
    try {
      const currentBranchId = String(orderData.branchId || environment.multiTenant.getCurrentBranchId() || '1');
      const payload = {
        ...orderData,
        branchId: currentBranchId,
        paymentStatus: orderData.paymentStatus ? orderData.paymentStatus.toLowerCase() : 'pending', // Chuẩn hóa
      };
      if (environment.features.enableLogging) {
        console.log('🔍 orderService.updateOrder - ID:', orderId, 'data:', JSON.stringify(payload, null, 2));
      }
      const response = await api.put(`/api/v1/order/UpdateOrder`, payload, { params: { id: orderId } });
      if (environment.features.enableLogging) {
        console.log('✅ Updated order response:', JSON.stringify(response.data, null, 2));
      }
      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to update order:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  async deleteOrder(orderId, branchId) {
    try {
      const currentBranchId = String(branchId || environment.multiTenant.getCurrentBranchId() || '1');
      if (environment.features.enableLogging) {
        console.log('🔍 orderService.deleteOrder - ID:', orderId, 'branchId:', currentBranchId);
      }
      const response = await api.delete(`/api/v1/order/DeleteOrder`, { params: { id: orderId, branchId: currentBranchId } });
      if (environment.features.enableLogging) {
        console.log('✅ Deleted order:', JSON.stringify(response.data, null, 2));
      }
      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to delete order:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  async getOrderDetails(orderId) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 orderService.getOrderDetails - ID:', orderId);
      }
      const response = await api.get(`/api/v1/orderdetails/order/${orderId}`);
      if (environment.features.enableLogging) {
        console.log('✅ Fetched order details:', JSON.stringify(response.data, null, 2));
      }
      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to fetch order details:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },
};