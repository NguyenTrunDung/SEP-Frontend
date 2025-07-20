// src/services/orderService.js
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
  /**
   * Get orders by branch ID with optional filters, search, and date ranges
   * This replaces the previous separate methods: getOrdersByBranch, searchOrders, filterOrders
   * GET /api/v1/order/branch/{branchId}
   */
  async getOrdersByBranchWithFilters(branchId, filters = {}, options = {}) {
    try {
      const normalizedBranchId = normalizeBranchId(branchId);

      if (environment.features.enableLogging) {
        console.log(`🔍 Fetching orders for branch: ${normalizedBranchId}`, { filters });
      }

      // Build query parameters from filters
      const queryParams = {};

      // Date filters
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

      // Other filters
      if (filters.receiveTime) {
        queryParams.receiveTime = filters.receiveTime;
      }
      if (filters.status) {
        queryParams.status = filters.status;
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
      // Payment status filter - Added for isPaid support
      if (filters.isPaid !== undefined && filters.isPaid !== null) {
        queryParams.isPaid = filters.isPaid;
      }

      if (environment.features.enableLogging) {
        console.log(`🔍 Query parameters sent to API:`, queryParams);
      }

      const response = await api.get(`/api/v1/order/branch/${normalizedBranchId}`, {
        params: queryParams,
        headers: normalizedBranchId ? { 'X-Branch-Id': normalizedBranchId } : {},
        ...options
      });

      if (environment.features.enableLogging) {
        console.log(`✅ Received orders for branch ${normalizedBranchId}:`, response.data);
      }

      return response.data;
    } catch (error) {
      console.error('Failed to fetch orders by branch with filters:', error);
      throw error;
    }
  },

  /**
   * Legacy method for backward compatibility - now uses the unified endpoint
   * @deprecated Use getOrdersByBranchWithFilters instead
   */
  async getOrdersByBranch(branchId, options = {}) {
    return this.getOrdersByBranchWithFilters(branchId, {}, options);
  },

  /**
   * Legacy method for backward compatibility - now uses the unified endpoint
   * @deprecated Use getOrdersByBranchWithFilters instead
   */
  async searchOrders(keyword, branchId, options = {}) {
    return this.getOrdersByBranchWithFilters(branchId, { keyword }, options);
  },

  /**
   * Legacy method for backward compatibility - now uses the unified endpoint
   * @deprecated Use getOrdersByBranchWithFilters instead
   */
  async filterOrders(filters = {}, options = {}) {
    const { branchId, ...otherFilters } = filters;
    return this.getOrdersByBranchWithFilters(branchId, otherFilters, options);
  },

  /**
   * Get order details by order ID
   * GET /api/v1/orderdetails/order/{orderId}
   */
  async getOrderDetails(orderId, options = {}) {
    try {
      const response = await api.get(`/api/v1/orderdetails/order/${orderId}`, options);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      throw error;
    }
  },

  /**
   * Create a new order with customer details and cart items
   * POST /api/v1/order/AddOrderV2
   */
  async createOrder(orderData, branchId, options = {}) {
    try {
      // Map frontend cart data to backend DTO structure
      const orderDto = {
        branchId: branchId,
        userId: orderData.userId,
        isPatientOrder: false, // Regular customer order
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
        paymentMethod: this._mapPaymentMethod(orderData.paymentMethod),
        isPaid: false,
        note: orderData.note,
        locationId: orderData.locationId || null,
        orderDetails: orderData.cartItems.map(item => ({
          foodId: item.FoodId || item.ID,
          quantity: item.quantity,
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
      // Extract meaningful error message
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.errors ||
        error.message ||
        'Failed to create order';
      throw new Error(errorMessage);
    }
  },

  /**
   * Create patient order (for nurse/medical staff)
   * POST /api/v1/order/AddDishesforPatient
   */
  async createPatientOrder(orderData, branchId, options = {}) {
    try {
      const patientOrderDto = {
        patientId: orderData.patientId,
        receiveDate: orderData.receiveDate ? new Date(orderData.receiveDate).toISOString() : null,
        receiveTime: orderData.receiveTime,
        receiveType: orderData.receiveMethod || 'Giao tận nơi',
        paymentMethod: this._mapPaymentMethod(orderData.paymentMethod),
        walletAmountUsed: orderData.walletAmountUsed || null,
        note: orderData.note,
        orderDetails: orderData.cartItems.map(item => ({
          foodId: item.FoodId || item.ID,
          quantity: item.quantity,
          note: item.note || null
        }))
      };

      const response = await api.post('/api/v1/order/AddDishesforPatient', patientOrderDto, {
        headers: branchId ? { 'X-Branch-Id': branchId } : {},
        ...options
      });

      return response.data;
    } catch (error) {
      console.error('Failed to create patient order:', error);
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
  /**
   * Update order status (for chef/kitchen staff)
   * PUT /api/v1/order/chef/status/{orderId}
   */
  async updateOrderStatus(orderId, options = {}) {
    try {
      const response = await api.put(`/api/v1/order/chef/status/${orderId}`, {}, options);
      return response.data;
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  },

  /**
   * Get orders for chef (kitchen view)
   * GET /api/v1/order/chef/{branchId}
   */
  async getOrdersForChef(branchId, options = {}) {
    try {
      const response = await api.get(`/api/v1/order/chef/${branchId}`, {
        headers: branchId ? { 'X-Branch-Id': branchId } : {},
        ...options
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch chef orders:', error);
      throw error;
    }
  },

  /**
   * Create order for VNPay payment (with pending payment status)
   * POST /api/v1/order/AddOrderV2
   */
  async createOrderForVnPay(orderData, branchId, options = {}) {
    try {
      // Map frontend cart data to backend DTO structure for VNPay
      const orderDto = {
        branchId: branchId,
        userId: orderData.userId,
        isPatientOrder: false,
        orderDate: new Date().toISOString(),
        receiveDate: orderData.receiveDate ? new Date(orderData.receiveDate).toISOString() : null,
        receiveTime: orderData.receiveTime,
        receiveType: orderData.receiveMethod || 'Giao tận nơi',
        status: 'PendingPayment', // Special status for VNPay orders
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerAddress: orderData.customerAddress,
        total: orderData.total,
        shippingFee: orderData.shippingFee || 0,
        foodToolFee: orderData.includeUtensils ? 5000 : 0,
        paymentMethod: 2, // VNPay enum value
        isPaid: false, // Will be updated after successful payment
        note: orderData.note,
        locationId: orderData.locationId || null,
        orderDetails: orderData.cartItems.map(item => ({
          foodId: item.FoodId || item.ID,
          quantity: item.quantity,
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

  /**
   * Update order payment status after successful VNPay payment
   * PUT /api/v1/order/{orderId}/payment-status
   */
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

  /**
   * Get order by ID
   * GET /api/v1/order/{orderId}
   */
  async getOrderById(orderId, options = {}) {
    try {
      const response = await api.get(`/api/v1/order/${orderId}`, options);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch order by ID:', error);
      throw error;
    }
  },

  /**
   * Map frontend payment method to backend enum
   * @private
   */
  _mapPaymentMethod(paymentMethod) {
    const paymentMap = {
      'Tiền mặt': 1,    // Cash
      'Wallet': 2,      // Wallet
      'Miễn phí': 3,    // Free
      'VNPay': 4        // Vnpay
    };
    return paymentMap[paymentMethod] || 1; // Default to Cash
  },

  /**
   * Generate unique order code
   * @private
   */
  _generateOrderCode() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `ORD${timestamp}${random}`;
  }
};