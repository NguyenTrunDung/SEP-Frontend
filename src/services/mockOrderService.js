// src/services/mockOrderService.js
import { mockOrders, getFilteredOrders, getOrderById as getOrderFromMock, ORDER_STATUS } from '../mocks/orderData';
import { delay } from '../mocks/authData';

export const getOrders = async (filters = {}) => {
  // Simulate API delay
  await delay(500);
  return getFilteredOrders(filters);
};

export const getOrderById = async (id) => {
  // Simulate API delay
  await delay(300);

  const order = getOrderFromMock(id);
  if (!order) {
    throw new Error('Order not found');
  }

  return order;
};

export const createOrder = async (orderData) => {
  // Simulate API delay
  await delay(800);

  // Create new order
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
    updatedAt: new Date().toISOString()
  };

  // Add to mock orders
  mockOrders.unshift(newOrder);

  return newOrder;
};

export const updateOrderStatus = async (orderId, status) => {
  // Simulate API delay
  await delay(500);

  const order = getOrderFromMock(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  // Validate status
  if (!Object.values(ORDER_STATUS).includes(status)) {
    throw new Error('Invalid order status');
  }

  // Update order
  order.status = status;
  order.updatedAt = new Date().toISOString();

  return order;
};