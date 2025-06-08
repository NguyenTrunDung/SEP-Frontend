// src/mocks/orderData.js

// Order status enum
export const ORDER_STATUS = {
    PENDING: 'PENDING',
    PREPARING: 'PREPARING',
    READY: 'READY',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
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
    for (let i = 1; i <= 5; i++) { // Assuming 5 users from mockUsers
        const orderCount = Math.floor(Math.random() * 5) + 1;

        for (let j = 0; j < orderCount; j++) {
            const itemCount = Math.floor(Math.random() * 4) + 1;
            const items = [];

            for (let k = 0; k < itemCount; k++) {
                const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;

                items.push({
                    menuItemId: menuItem.id,
                    name: menuItem.name,
                    price: menuItem.price,
                    quantity,
                    subtotal: menuItem.price * quantity,
                });
            }

            const total = items.reduce((sum, item) => sum + item.subtotal, 0);
            const createdAt = new Date();
            createdAt.setHours(createdAt.getHours() - Math.floor(Math.random() * 72));
            let status;
            const hoursSinceCreation = (new Date() - createdAt) / (1000 * 60 * 60);

            if (hoursSinceCreation < 1) status = ORDER_STATUS.PENDING;
            else if (hoursSinceCreation < 2) status = ORDER_STATUS.PREPARING;
            else if (hoursSinceCreation < 4) status = ORDER_STATUS.READY;
            else status = ORDER_STATUS.DELIVERED;

            if (Math.random() < 0.1) status = ORDER_STATUS.CANCELLED;

            orders.push({
                id: `order-${i}-${j + 1}-${Date.now()}`,
                userId: i.toString(),
                userName: `User ${i}`,
                userRole: i === 5 ? 'NURSE' : 'PATIENT', // Example role assignment
                department: i === 5 ? 'Nursing' : 'Outpatient',
                items,
                total,
                status,
                notes: Math.random() < 0.3 ? 'Please deliver to room 302' : '',
                createdAt: createdAt.toISOString(),
                updatedAt: createdAt.toISOString(),
            });
        }
    }

    return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const mockOrders = generateOrders();

// Helper function to get orders with optional filtering
export const getFilteredOrders = (filters = {}) => {
    let result = [...mockOrders];

    if (filters.userId) {
        result = result.filter(order => order.userId === filters.userId);
    }

    if (filters.status) {
        result = result.filter(order => order.status === filters.status);
    }

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

// Utility functions
export const formatDateTime = (date) => {
    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).replace(/\//g, '/').replace(',', '');
};

export const formatAmount = (amount) => {
    return `${amount.toLocaleString('vi-VN')}đ`;
};