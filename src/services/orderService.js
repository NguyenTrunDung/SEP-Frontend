import api, { environment } from './api/config';
import dayjs from 'dayjs';
import { diseaseCategoryFoodRestrictionService } from '../services/diseaseCategoryFoodRestrictionService'

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
      if (filters.userId) queryParams.userId = filters.userId;
      if (filters.patientId) queryParams.patientId = filters.patientId;
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
        let mealTime = item.mealSession || 'Không xác định';
        // Lấy mealTime từ diseaseCategoryFoodRestrictionService nếu cần
        if (item.foodId) {
          try {
            const nutritionalMealResponse = diseaseCategoryFoodRestrictionService.getDiseaseCategoryFoodRestriction(item.foodId);
            if (nutritionalMealResponse.data && nutritionalMealResponse.data.mealTime) {
              mealTime = nutritionalMealResponse.data.mealTime;
            }
          } catch (error) {
            console.warn(`⚠️ Failed to fetch mealTime for foodId ${item.foodId}:`, error);
          }
        }
        return {
          ...item,
          id: item.id || `item-${Math.random()}`,
          Qty: qty,
          foodName: item.foodName || item.FoodName || food.name || `Món ăn ID ${item.foodId || 'Unknown'}`,
          imageUrl: food.imageUrl || item.image || null,
          price: item.price ?? 0,
          total: item.total ?? (item.price ?? 0) * qty,
          patientInfo: item.patientInfo || null,
          mealTime, // Thêm mealTime vào dữ liệu trả về
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
    try {
      const normalizedBranchId = normalizeBranchId(branchId);
      if (!normalizedBranchId) throw new Error('Branch ID is required');

      // Validate order data
      if (!orderData.customerName) throw new Error('Customer name is required');
      if (!orderData.cartItems || !orderData.cartItems.length) throw new Error('Cart items cannot be empty');
      if (!orderData.total || orderData.total <= 0) throw new Error('Total must be greater than 0');

      // Xác định paymentMethod và walletAmountUsed
      const paymentMethod = this._mapPaymentMethod(orderData.paymentMethod);
      const isWalletPayment = paymentMethod === 1; // Wallet
      const walletAmountUsed = isWalletPayment ? (orderData.walletAmountUsed || orderData.total) : 0;

      const orderDto = {
        branchId: normalizedBranchId,
        userId: orderData.userId || null,
        isPatientOrder: false,
        orderDate: new Date().toISOString(),
        receiveDate: orderData.receiveDate ? new Date(orderData.receiveDate).toISOString() : null,
        receiveTime: orderData.receiveTime || '12:00',
        receiveType: orderData.receiveMethod || 'Giao tận nơi',
        status: orderData.paymentMethod === 'VNPay' ? 'PendingPayment' : 'Pending',
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone || '0000000000',
        customerAddress: orderData.customerAddress || 'Không xác định',
        total: orderData.total,
        shippingFee: orderData.shippingFee || 0,
        foodToolFee: orderData.includeUtensils ? 5000 : 0,
        paymentMethod: paymentMethod,
        isPaid: isWalletPayment ? true : (orderData.isPaid || false), // Mặc định isPaid: true cho Wallet, giống code cũ
        walletAmountUsed: walletAmountUsed, // Thêm trường walletAmountUsed
        note: orderData.note || '',
        locationId: orderData.locationId || null,
        orderDetails: orderData.cartItems.map(item => ({
          foodId: item.FoodId || item.ID,
          qty: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          note: item.note || null,
          foodName: item.dishName || 'Unknown Food'
        }))
      };

      if (environment.features.enableLogging) {
        console.log('Creating order with data:', JSON.stringify(orderDto, null, 2));
      }

      const response = await api.post('/api/v1/order/AddOrderV2', orderDto, {
        headers: normalizedBranchId ? { 'X-Branch-Id': normalizedBranchId } : {},
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

      // Validate input data
      if (!orderData.patientId) {
        console.warn('⚠️ patientId is missing, proceeding without patient validation');
      }
      if (!Array.isArray(orderData.cartItems) || orderData.cartItems.length === 0) {
        throw new Error('cartItems cannot be empty');
      }
      if (!orderData.receiveDate || !dayjs(orderData.receiveDate).isValid()) {
        throw new Error('Invalid receiveDate');
      }
      if (!orderData.total || orderData.total <= 0) {
        throw new Error('Total must be greater than 0');
      }
      if (!orderData.customerName) {
        throw new Error('customerName is required');
      }
      if (!orderData.customerPhone) {
        throw new Error('customerPhone is required');
      }

      // Validate cartItems
      orderData.cartItems.forEach((item, index) => {
        if (!item.FoodId && !item.ID) {
          throw new Error(`Invalid foodId for cart item at index ${index}`);
        }
        if (!item.quantity || item.quantity <= 0) {
          throw new Error(`Invalid quantity for cart item at index ${index}`);
        }
        if (item.price == null || item.price < 0) {
          throw new Error(`Invalid price for cart item at index ${index}`);
        }
      });

      // Validate patient existence (optional)
      let patient = null;
      if (orderData.patientId) {
        try {
          patient = await this.getPatientDetails(orderData.patientId, normalizedBranchId);
          if (!patient) {
            console.warn(`⚠️ Patient with ID ${orderData.patientId} not found, proceeding with default values`);
          }
        } catch (error) {
          console.error(`❌ Failed to fetch patient details for patientId ${orderData.patientId}:`, {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });
          console.warn(`⚠️ Proceeding without patient validation due to error`);
        }
      }

      // Construct orderDto
      const orderDto = {
        branchId: Number(normalizedBranchId),
        userId: orderData.userId || 'NURSE_DEFAULT',
        patientId: orderData.patientId || null, // Allow null if patientId is not validated
        isPatientOrder: true,
        orderDate: orderData.orderDate || new Date().toISOString(),
        receiveDate: new Date(orderData.receiveDate).toISOString(),
        receiveTime: orderData.receiveTime || '08:00',
        receiveType: orderData.receiveMethod || 'Giao tận nơi',
        type: orderData.type || 'Patient',
        status: orderData.status || 'Confirmed',
        customerName: orderData.customerName || (patient?.fullName ?? 'Unknown Patient'),
        customerPhone: orderData.customerPhone || (patient?.phone ?? '0000000000'),
        customerAddress: orderData.customerAddress || (patient?.roomNumber ?? 'Phòng bệnh nhân'),
        total: Number(orderData.total),
        shippingFee: Number(orderData.shippingFee) || 0,
        foodToolFee: Number(orderData.foodToolFee) || 0,
        paymentMethod: 0, // Free, as per previous fix
        isPaid: true,
        walletAmountUsed: 0,
        code: orderData.code || this._generateOrderCode(),
        note: orderData.note || '',
        locationId: orderData.locationId || null,
        orderDetails: orderData.cartItems.map(item => ({
          foodId: Number(item.FoodId || item.ID),
          menuId: null,
          qty: Number(item.quantity),
          price: Number(item.price),
          total: Number(item.price) * Number(item.quantity),
          note: item.note || null,
          foodName: item.dishName || item.foodName || 'Unknown Food',
          menuName: item.menuName || 'Thực đơn ngày',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      };

      // Additional validation for DTO
      if (!orderDto.orderDetails.length) {
        throw new Error('OrderDetails cannot be empty');
      }
      if (orderDto.branchId <= 0) {
        throw new Error('Invalid branchId');
      }

      if (environment.features.enableLogging) {
        console.log(`🚀 Creating patient order for branch: ${normalizedBranchId}`, JSON.stringify(orderDto, null, 2));
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
        patientId: orderData.patientId,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      let errorMessage = 'Failed to create patient order';
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          if (Array.isArray(error.response.data.errors)) {
            errorMessage = error.response.data.errors.join(', ');
          } else if (typeof error.response.data.errors === 'object') {
            errorMessage = Object.values(error.response.data.errors)
              .flat()
              .join(', ');
          }
        }
      } else {
        errorMessage = error.message || errorMessage;
      }

      throw new Error(errorMessage);
    }
  },

  async getPatientDetails(patientId, branchId) {
    try {
      if (!patientId || patientId === 'Unknown' || patientId === 'NURSE_DEFAULT') {
        console.warn(`🔍 No valid patientId provided: ${patientId}, returning null`);
        return null;
      }

      const normalizedBranchId = normalizeBranchId(branchId);
      if (environment.features.enableLogging) {
        console.log(`🔍 Fetching patient details for patientId: ${patientId}, branchId: ${normalizedBranchId}`);
      }

      const response = await api.get(`/api/v1/patient`, {
        params: { id: patientId },
        headers: normalizedBranchId ? { 'X-Branch-Id': normalizedBranchId } : {},
      });

      if (environment.features.enableLogging) {
        console.log(`✅ Fetched patient details for patientId ${patientId}:`, JSON.stringify(response.data, null, 2));
      }

      return response.data.data;
    } catch (error) {
      console.error(`❌ Failed to fetch patient details for patientId ${patientId}:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return null;
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
          // Lấy thêm mealTime từ diseaseCategoryFoodRestrictionService nếu cần
          const enhancedOrderDetails = await Promise.all(
            orderDetails.data.map(async (item) => {
              let mealTime = item.mealSession || 'Không xác định';
              if (item.foodId) {
                try {
                  const nutritionalMealResponse = await diseaseCategoryFoodRestrictionService.getDiseaseCategoryFoodRestriction(item.foodId);
                  if (nutritionalMealResponse.data && nutritionalMealResponse.data.mealTime) {
                    mealTime = nutritionalMealResponse.data.mealTime;
                  }
                } catch (error) {
                  console.warn(`⚠️ Failed to fetch mealTime for foodId ${item.foodId}:`, error);
                }
              }
              return {
                ...item,
                foodName: item.foodName || item.name || `Món ăn ID ${item.foodId || 'Unknown'}`,
                Qty: item.Qty ?? item.quantity ?? 1,
                mealTime, // Thêm mealTime vào orderDetails
              };
            })
          );
          return {
            ...order,
            orderDetails: enhancedOrderDetails,
            mealSession: order.mealSession || enhancedOrderDetails[0]?.mealTime || 'Không xác định',
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
  async createOrderForCashier(orderData, branchId, options = {}) {
    try {
      const normalizedBranchId = normalizeBranchId(branchId);
      if (!normalizedBranchId) throw new Error('Branch ID is required');

      // Validate order data
      if (!orderData.customerName) throw new Error('Customer name is required');
      if (!orderData.cartItems || !orderData.cartItems.length) throw new Error('Cart items cannot be empty');
      if (!orderData.total || orderData.total <= 0) throw new Error('Total must be greater than 0');

      // Construct order DTO with Cash payment method
      const orderDto = {
        branchId: normalizedBranchId,
        userId: orderData.userId || null,
        isPatientOrder: false,
        orderDate: new Date().toISOString(),
        receiveDate: orderData.receiveDate ? new Date(orderData.receiveDate).toISOString() : null,
        receiveTime: orderData.receiveTime || '12:00',
        receiveType: orderData.receiveMethod || 'Giao tận nơi',
        status: 'Pending', // Default status for Cash payment
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone || '0000000000',
        customerAddress: orderData.customerAddress || 'Tại căn teen',
        total: orderData.total,
        shippingFee: orderData.shippingFee || 0,
        foodToolFee: orderData.includeUtensils ? 5000 : 0,
        paymentMethod: 0, // Hard-coded to Cash
        isPaid: true, // Cash orders are considered paid immediately
        walletAmountUsed: 0, // No wallet usage
        note: orderData.note || '',
        locationId: orderData.locationId || null,
        orderDetails: orderData.cartItems.map(item => ({
          foodId: item.FoodId || item.ID,
          qty: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          note: item.note || null,
          foodName: item.dishName || 'Unknown Food'
        }))
      };

      if (environment.features.enableLogging) {
        console.log('Creating cashier order with data:', JSON.stringify(orderDto, null, 2));
      }

      const response = await api.post('/api/v1/order/AddOrderV2', orderDto, {
        headers: normalizedBranchId ? { 'X-Branch-Id': normalizedBranchId } : {},
        ...options
      });

      console.log('Cashier order created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create cashier order:', error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.errors ||
        error.message ||
        'Failed to create cashier order';
      throw new Error(errorMessage);
    }
  },
  _mapPaymentMethod(paymentMethod) {
    const paymentMap = {
      'Cash': 0,
      'Wallet': 1,
      'VNPay': 2
    };
    return paymentMap[paymentMethod] ?? 1; // Mặc định là Wallet, giống code cũ
  },
  _generateOrderCode() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `ORD${timestamp}${random}`;
  }
};