// src/services/orderService.js
import { mockOrders, getFilteredOrders, getOrderById, ORDER_STATUS } from '../mocks/orderData';
import { delay } from '../mocks/authData';
import api, { environment } from '../services/api/config';

export const orderService = {
    /**
     * Get orders with optional filtering
     * GET /api/orders
     */
    async getOrders(filters = {}) {
        try {
            await delay(500);
            const orders = getFilteredOrders(filters);
            if (environment.features.enableLogging) {
                console.log('✅ Fetched orders for user:', filters.userId);
            }
            return orders;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch orders:', error.message);
            }
            throw error;
        }
    },

    /**
     * Get order by ID
     * GET /api/orders/:id
     */
    async getOrderById(orderId) {
        try {
            await delay(300);
            const order = getOrderById(orderId);
            if (!order) {
                throw new Error('Order not found');
            }
            if (environment.features.enableLogging) {
                console.log('✅ Fetched order:', orderId);
            }
            return order;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch order:', error.message);
            }
            throw error;
        }
    },

    /**
     * Create a new order
     * POST /api/orders
     */
    async createOrder(orderData) {
        try {
            await delay(800);
            const newOrder = {
                id: `order-${orderData.userId}-${Date.now()}`,
                userId: orderData.userId,
                userName: orderData.userName,
                userRole: orderData.userRole,
                department: orderData.department,
                items: orderData.items,
                total: orderData.items.reduce((sum, item) => sum + item.subtotal, 0),
                status: ORDER_STATUS.PENDING,
                notes: orderData.notes || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockOrders.unshift(newOrder);
            if (environment.features.enableLogging) {
                console.log('✅ Created new order:', newOrder.id);
            }
            return newOrder;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to create order:', error.message);
            }
            throw error;
        }
    },

    /**
     * Update order status
     * PUT /api/orders/:id/status
     */
    async updateOrderStatus(orderId, status) {
        try {
            await delay(500);
            const order = getOrderById(orderId);
            if (!order) {
                throw new Error('Order not found');
            }
            if (!Object.values(ORDER_STATUS).includes(status)) {
                throw new Error('Invalid order status');
            }
            order.status = status;
            order.updatedAt = new Date().toISOString();
            if (environment.features.enableLogging) {
                console.log('✅ Updated order status:', orderId, status);
            }
            return order;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to update order status:', error.message);
            }
            throw error;
        }
    },
};