// src/mocks/ordersData.js
import { mockUsers } from './authData';
import { delay } from './authData';

// Order status enum
export const ORDER_STATUS = {
    PENDING: 'PENDING',
    PREPARING: 'PREPARING',
    READY: 'READY',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED'
};

// Menu items
export const menuItems = [
    { id: '1', name: 'Chicken Salad', price: 8.99, category: 'Salads' },
    { id: '2', name: 'Vegetable Soup', price: 5.99, category: 'Soups' },
    { id: '3', name: 'Grilled Chicken Sandwich', price: 7.99, category: 'Sandwiches' },
    { id: '4', name: 'Beef Stir Fry', price: 10.99, category: 'Main Courses' },
    { id: '5', name: 'Vegetable Pasta', price: 9.99, category: 'Main Courses' },
    { id: '6', name: 'Fresh Fruit Salad', price: 4.99, category: 'Desserts' },
    { id: '7', name: 'Chocolate Cake', price: 3.99, category: 'Desserts' },
    { id: '8', name: 'Coffee', price: 2.50, category: 'Beverages' },
    { id: '9', name: 'Orange Juice', price: 2.99, category: 'Beverages' },
    { id: '10', name: 'Green Tea', price: 1.99, category: 'Beverages' },
];

// Generate mock orders
const generateOrders = () => {
    const orders = [];

    // Create some orders for each user
    mockUsers.forEach(user => {
        // Number of orders for this user (1-5)
        const orderCount = Math.floor(Math.random() * 5) + 1;

        for (let i = 0; i < orderCount; i++) {
            // Create order items (1-4 items per order)
            const itemCount = Math.floor(Math.random() * 4) + 1;
            const items = [];

            for (let j = 0; j < itemCount; j++) {
                const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;

                items.push({
                    menuItemId: menuItem.id,
                    name: menuItem.name,
                    price: menuItem.price,
                    quantity,
                    subtotal: menuItem.price * quantity
                });
            }

            // Calculate total
            const total = items.reduce((sum, item) => sum + item.subtotal, 0);

            // Determine order status based on creation date
            const createdAt = new Date();
            createdAt.setHours(createdAt.getHours() - Math.floor(Math.random() * 72));

            // More recent orders are more likely to be pending
            let status;
            const hoursSinceCreation = (new Date() - createdAt) / (1000 * 60 * 60);

            if (hoursSinceCreation < 1) {
                status = ORDER_STATUS.PENDING;
            } else if (hoursSinceCreation < 2) {
                status = ORDER_STATUS.PREPARING;
            } else if (hoursSinceCreation < 4) {
                status = ORDER_STATUS.READY;
            } else {
                status = ORDER_STATUS.DELIVERED;
            }

            // 10% chance for a random order to be cancelled
            if (Math.random() < 0.1) {
                status = ORDER_STATUS.CANCELLED;
            }

            orders.push({
                id: `order-${user.id}-${i + 1}-${Date.now()}`,
                userId: user.id,
                userName: user.name,
                userRole: user.role,
                department: user.department,
                items,
                total,
                status,
                notes: Math.random() < 0.3 ? 'Please deliver to room 302' : '',
                createdAt: createdAt.toISOString(),
                updatedAt: createdAt.toISOString()
            });
        }
    });

    // Sort orders by creation date (newest first)
    return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const mockOrders = generateOrders();

// Helper function to get orders with optional filtering
export const getFilteredOrders = (filters = {}) => {
    let result = [...mockOrders];

    // Filter by user ID
    if (filters.userId) {
        result = result.filter(order => order.userId === filters.userId);
    }

    // Filter by status
    if (filters.status) {
        result = result.filter(order => order.status === filters.status);
    }

    // Filter by date range
    if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        result = result.filter(order => {
            const date = new Date(order.createdAt);
            return date >= start && date <= end;
        });
    }

    return result;
};

// Helper to get an order by ID
export const getOrderById = (orderId) => {
    return mockOrders.find(order => order.id === orderId);
};