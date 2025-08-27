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
  async getOrdersByBranchWithFilters(branchId, filters = {}, options = {}) {
    try {
      const normalizedBranchId = normalizeBranchId(branchId);

      if (environment.features.enableLogging) {
        console.log(`🔍 Fetching orders for branch: ${normalizedBranchId}`, { filters });
      }

      const queryParams = {};

      if (filters.startOrderDate) {
        queryParams.startOrderDate = filters.startOrderDate;
      }
      if (filters.endOrderDate) {
        queryParams.endOrderDate = filters.endOrderDate;
      }
      if (filters.startReceiveDate) {
        queryParams.startReceiveDate = filters.startReceiveDate;
      }
      if (filters.endReceiveDate) {
        queryParams.endReceiveDate = filters.endReceiveDate;
      }
      if (filters.receiveTime) {
        queryParams.receiveTime = filters.receiveTime;
      }
      if (filters.status) {
        queryParams.status = Array.isArray(filters.status) ? filters.status.join(',') : filters.status;
      }
      if (filters.customerName) {
        queryParams.customerName = filters.customerName;
      }
      if (filters.customerPhone) {
        queryParams.customerPhone = filters.customerPhone;
      }
      if (filters.minTotal) {
        queryParams.minTotal = filters.minTotal;
      }
      if (filters.maxTotal) {
        queryParams.maxTotal = filters.maxTotal;
      }
      if (filters.code) {
        queryParams.code = filters.code;
      }
      if (filters.keyword) {
        queryParams.keyword = filters.keyword;
      }
      if (filters.isPaid !== undefined && filters.isPaid !== null) {
        queryParams.isPaid = filters.isPaid;
      }
      if (filters.isOrderPatient !== undefined && filters.isOrderPatient !== null) {
        queryParams.IsPatientOrder = filters.isOrderPatient;
      }

      // Ensure patientId is included in the response
      queryParams.includePatientId = true;

      if (environment.features.enableLogging) {
        console.log(`🔍 Query parameters sent to API:`, queryParams);
      }

      const response = await api.get(`/api/v1/order/branch/${normalizedBranchId}`, {
        params: queryParams,
        headers: normalizedBranchId ? { 'X-Branch-Id': normalizedBranchId } : {},
        ...options
      });

      // Normalize the response to ensure patientId is included
      const normalizedData = response.data.data.map(order => ({
        ...order,
        patientId: order.patientId || null, // Ensure patientId is explicitly included, even if null
      }));

      if (environment.features.enableLogging) {
        console.log(`✅ Received orders for branch ${normalizedBranchId}:`, normalizedData);
      }

      return { ...response.data, data: normalizedData };
    } catch (error) {
      console.error('Failed to fetch orders by branch with filters:', error);
      throw error;
    }
  },

  async getOrdersByBranch(branchId, options = {}) {
    return this.getOrdersByBranchWithFilters(branchId, {}, options);
  },

  async searchOrders(keyword, branchId, options = {}) {
    return this.getOrdersByBranchWithFilters(branchId, { keyword }, options);
  },

  async filterOrders(filters = {}, options = {}) {
    const { branchId, ...otherFilters } = filters;
    return this.getOrdersByBranchWithFilters(branchId, otherFilters, options);
  },

  async getOrderDetails(orderId, options = {}) {
    try {
      const response = await api.get(`/api/v1/orderdetails/order/${orderId}`, options);
      console.log(`🔍 Raw order details for order ${orderId}:`, response.data);
      const normalizedData = response.data.data.map(item => {
        const qty = item.Qty ?? item.quantity ?? item.qty ?? 1;
        const food = item.food || {};
        console.log(`🔍 Normalizing item for order ${orderId}:`, { item, qty });
        return {
          ...item,
          id: item.id || `item-${Math.random()}`,
          Qty: qty,
          foodName: item.foodName || item.FoodName || food.name || `Món ăn ID ${item.foodId || 'Unknown'}`,
          imageUrl: food.imageUrl || item.image || null,
          price: item.price ?? 0,
          total: item.total ?? (item.price ?? 0) * qty,
        };
      });
      console.log(`🔍 Normalized order details for order ${orderId}:`, normalizedData);
      return { ...response.data, data: normalizedData };
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      throw error;
    }
  },

  async getOrderDetailsWithPatientInfo(orderId, options = {}) {
    try {
      const response = await api.get(`/api/v1/orderdetails/order/${orderId}/with-patient-info`, options);
      console.log(`🔍 Raw order details with patient info for order ${orderId}:`, response.data);
      const normalizedData = response.data.data.map(item => {
        const qty = item.Qty ?? item.quantity ?? item.qty ?? 1;
        const food = item.food || {};
        console.log(`🔍 Normalizing item with patient info for order ${orderId}:`, { item, qty });
        return {
          ...item,
          id: item.id || `item-${Math.random()}`,
          Qty: qty,
          foodName: item.foodName || item.FoodName || food.name || `Món ăn ID ${item.foodId || 'Unknown'}`,
          imageUrl: food.imageUrl || item.image || null,
          price: item.price ?? 0,
          total: item.total ?? (item.price ?? 0) * qty,
          patientInfo: item.patientInfo || null,
        };
      });
      console.log(`🔍 Normalized order details with patient info for order ${orderId}:`, normalizedData);
      return { ...response.data, data: normalizedData };
    } catch (error) {
      console.error('Failed to fetch order details with patient info:', error);
      throw error;
    }
  },

  async getFoodDetails(foodId, branchId) {
    try {
      const response = await api.get(`/api/v1/food/${foodId}/branch/${branchId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch food details for foodId ${foodId}:`, error);
      return {};
    }
  },

  async getUserDetails(userId, branchId) {
    try {
      const normalizedBranchId = normalizeBranchId(branchId);
      const response = await api.get(`/api/v1/BranchUserManagement/${userId}/branch/${normalizedBranchId}`, {
        headers: { 'X-Branch-Id': normalizedBranchId },
      });
      if (environment.features.enableLogging) {
        console.log(`✅ Fetched user details for userId ${userId} in branch ${normalizedBranchId}:`, JSON.stringify(response.data, null, 2));
      }
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch user details for userId ${userId} in branch ${branchId}:`, error);
      throw error;
    }
  },

  async createOrder(orderData, branchId, options = {}) {
    console.log('this._mapPaymentMethod(orderData.paymentMethod):', this._mapPaymentMethod(orderData.paymentMethod));
    try {
      const orderDto = {
        branchId: branchId,
        userId: orderData.userId,
        isPatientOrder: false,
        orderDate: new Date().toISOString(),
        receiveDate: orderData.receiveDate ? new Date(orderData.receiveDate).toISOString() : null,
        receiveTime: orderData.receiveTime,
        receiveType: orderData.receiveMethod || 'Giao tận nơi',
        status: 'Pending',
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerAddress: orderData.customerAddress,
        total: orderData.total,
        shippingFee: orderData.shippingFee || 0,
        foodToolFee: orderData.includeUtensils ? 5000 : 0,
        paymentMethod: 1,
        isPaid: true,
        note: orderData.note,
        locationId: orderData.locationId || null,
        orderDetails: orderData.cartItems.map(item => ({
          foodId: item.FoodId || item.ID,
          qty: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          note: item.note || null,
          foodName: item.dishName
        }))
      };

      console.log('Creating order with data:', orderDto);

      const response = await api.post('/api/v1/order/AddOrderV2', orderDto, {
        headers: branchId ? { 'X-Branch-Id': branchId } : {},
        ...options
      });

      console.log('Order created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create order:', error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.errors ||
        error.message ||
        'Failed to create order';
      throw new Error(errorMessage);
    }
  },

  async createPatientOrder(orderData, branchId, options = {}) {
    try {
      const normalizedBranchId = normalizeBranchId(branchId);
      const orderDto = {
        branchId: normalizedBranchId,
        userId: orderData.userId || 'NURSE_DEFAULT',
        patientId: orderData.patientId,
        isPatientOrder: true,
        orderDate: orderData.orderDate || new Date().toISOString(),
        receiveDate: orderData.receiveDate ? new Date(orderData.receiveDate).toISOString() : null,
        receiveTime: orderData.receiveTime || '08:00',
        receiveType: orderData.receiveMethod || 'Giao tận nơi',
        type: orderData.type || 'Patient',
        status: orderData.status || 'Pending',
        customerName: orderData.customerName || 'Unknown Patient',
        customerPhone: orderData.customerPhone || '',
        customerAddress: orderData.customerAddress || 'Phòng bệnh nhân',
        total: orderData.total || 0,
        shippingFee: orderData.shippingFee || 0,
        foodToolFee: orderData.foodToolFee || 0,
        paymentMethod: this._mapPaymentMethod(orderData.paymentMethod) || 3,
        isPaid: orderData.isPaid !== undefined ? orderData.isPaid : true,
        walletAmountUsed: orderData.walletAmountUsed || 0,
        code: orderData.code || this._generateOrderCode(),
        note: orderData.note || '',
        locationId: orderData.locationId || null,
        orderDetails: orderData.cartItems.map(item => ({
          foodId: Number(item.FoodId || item.ID),
          menuId: Number(item.menuId || 0),
          qty: Number(item.quantity),
          price: Number(item.price || 0),
          total: Number(item.price || 0) * Number(item.quantity),
          note: item.note || null,
          foodName: item.dishName || item.foodName || 'Unknown Food',
          menuName: item.menuName || 'Thực đơn ngày',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      };

      if (environment.features.enableLogging) {
        console.log(`🔍 Creating patient order for branch: ${normalizedBranchId}`, JSON.stringify(orderDto, null, 2));
      }

      const response = await api.post('/api/v1/order/AddOrderV2', orderDto, {
        headers: normalizedBranchId ? { 'X-Branch-Id': normalizedBranchId } : {},
        ...options,
      });

      if (environment.features.enableLogging) {
        console.log('✅ Patient order created successfully:', JSON.stringify(response.data, null, 2));
      }

      return response.data;
    } catch (error) {
      console.error('❌ Failed to create patient order:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.errors ||
        error.message ||
        'Failed to create patient order';
      throw new Error(errorMessage);
    }
  },

  async updateOrder(orderId, orderData) {
    try {
      const currentBranchId = String(orderData.branchId || environment.multiTenant.getCurrentBranchId() || '1');
      const payload = {
        ...orderData,
        branchId: currentBranchId,
        status: orderData.status,
        paymentStatus: orderData.paymentStatus ? orderData.paymentStatus.toLowerCase() : 'pending',
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

  async updateOrderStatus(orderId, newStatus) {
    try {
      if (environment.features.enableLogging) {
        console.log('🔍 orderService.updateOrderStatus - ID:', orderId, 'newStatus:', newStatus);
      }

      const response = await api.patch(`/api/v1/order/UpdateOrderStatus`,
        { status: newStatus },
        { params: { id: orderId } }
      );

      if (environment.features.enableLogging) {
        console.log('✅ Updated order status response:', JSON.stringify(response.data, null, 2));
      }
      return response.data;
    } catch (error) {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to update order status:', error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  async getOrdersForChef(branchId, options = {}) {
    try {
      const normalizedBranchId = normalizeBranchId(branchId);
      if (environment.features.enableLogging) {
        console.log(`🔍 Fetching chef orders for branch: ${normalizedBranchId}`);
      }
      const response = await api.get(`/api/v1/order/chef/${normalizedBranchId}`, {
        headers: normalizedBranchId ? { 'X-Branch-Id': normalizedBranchId } : {},
        ...options,
      });
      const orders = response.data.data || [];
      const detailedOrders = await Promise.all(
        orders.map(async (order) => {
          const orderDetails = await this.getOrderDetails(order.id);
          return {
            ...order,
            orderDetails: orderDetails.data.map((item) => ({
              ...item,
              foodName: item.foodName || item.name || `Món ăn ID ${item.foodId || 'Unknown'}`,
              Qty: item.Qty ?? item.quantity ?? 1,
            })),
          };
        })
      );
      if (environment.features.enableLogging) {
        console.log(`✅ Received chef orders for branch ${normalizedBranchId}:`, detailedOrders);
      }
      return detailedOrders;
    } catch (error) {
      console.error('Failed to fetch chef orders:', error);
      throw error;
    }
  },

  async createOrderForVnPay(orderData, branchId, options = {}) {
    try {
      const orderDto = {
        branchId: branchId,
        userId: orderData.userId,
        isPatientOrder: false,
        orderDate: new Date().toISOString(),
        receiveDate: orderData.receiveDate ? new Date(orderData.receiveDate).toISOString() : null,
        receiveTime: orderData.receiveTime,
        receiveType: orderData.receiveMethod || 'Giao tận nơi',
        status: 'PendingPayment',
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerAddress: orderData.customerAddress,
        total: orderData.total,
        shippingFee: orderData.shippingFee || 0,
        foodToolFee: orderData.includeUtensils ? 5000 : 0,
        paymentMethod: 2,
        isPaid: false,
        note: orderData.note,
        locationId: orderData.locationId || null,
        orderDetails: orderData.cartItems.map(item => ({
          foodId: item.FoodId || item.ID,
          qty: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          note: item.note || null,
          foodName: item.dishName
        }))
      };

      console.log('Creating VNPay order with data:', orderDto);

      const response = await api.post('/api/v1/order/AddOrderV2', orderDto, {
        headers: branchId ? { 'X-Branch-Id': branchId } : {},
        ...options
      });

      console.log('VNPay order created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create VNPay order:', error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.errors ||
        error.message ||
        'Failed to create VNPay order';
      throw new Error(errorMessage);
    }
  },

  async updateOrderPaymentStatus(orderId, isPaid, options = {}) {
    try {
      const response = await api.put(`/api/v1/order/${orderId}/payment-status`, {
        isPaid: isPaid,
        status: isPaid ? 'Confirmed' : 'Cancelled'
      }, options);

      console.log('Order payment status updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to update order payment status:', error);
      throw error;
    }
  },

  async getOrderById(orderId, options = {}) {
    try {
      const response = await api.get(`/api/v1/order/${orderId}`, options);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch order by ID:', error);
      throw error;
    }
  },

  async deleteOrder(orderId, branchId, options = {}) {
    try {
      const normalizedBranchId = normalizeBranchId(branchId);
      if (environment.features.enableLogging) {
        console.log(`🗑️ Deleting order ${orderId} for branch: ${normalizedBranchId}`);
      }
      const response = await api.delete(`/api/v1/order/DeleteOrder`, {
        params: { id: orderId },
        headers: normalizedBranchId ? { 'X-Branch-Id': normalizedBranchId } : {},
        ...options,
      });
      if (environment.features.enableLogging) {
        console.log(`✅ Order ${orderId} deleted successfully:`, response.data);
      }
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to delete order ${orderId}:`, error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors ||
        error.message ||
        'Failed to delete order';
      throw new Error(errorMessage);
    }
  },

  async getPatientDetails(patientId, branchId) {
    try {
      if (!patientId || patientId === 'Unknown' || patientId === 'NURSE_DEFAULT') {
        console.warn(`🔍 No valid patientId provided: ${patientId}, returning null`);
        return null;
      }

      if (environment.features.enableLogging) {
        console.log(`🔍 Fetching patient details for patientId: ${patientId}, branchId: ${branchId}`);
      }

      const response = await api.get(`/api/v1/patient`, {
        params: { id: patientId },
        headers: branchId ? { 'X-Branch-Id': branchId } : {},
      });

      if (environment.features.enableLogging) {
        console.log(`✅ Fetched patient details for patientId ${patientId}:`, JSON.stringify(response.data, null, 2));
      }

      return response.data.data;
    } catch (error) {
      console.error(`❌ Failed to fetch patient details for patientId ${patientId}:`, error);
      return null;
    }
  },

  _mapPaymentMethod(paymentMethod) {
    const paymentMap = {
      'Wallet': 1,
      'VNPay': 2
    };
    return paymentMap[paymentMethod] || 1;
  },

  _generateOrderCode() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `ORD${timestamp}${random}`;
  }
};