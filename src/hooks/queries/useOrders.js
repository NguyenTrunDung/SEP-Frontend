import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api/config';
// Sample when not use react query. just use axios
export const useOrders = (userId) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/orders${userId ? `?userId=${userId}` : ''}`);
            setOrders(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message); //|| 'Failed to fetch orders'
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const createOrder = async (orderData) => {
        try {
            const response = await api.post('/orders', orderData);
            setOrders((prev) => [...prev, response.data]);
            return response.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Failed to create order');
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            const response = await api.patch(`/orders/${orderId}/status`, { status });
            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId ? { ...order, status: response.data.status } : order
                )
            );
            return response.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Failed to update order status');
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return {
        orders,
        loading,
        error,
        createOrder,
        updateOrderStatus,
        refreshOrders: fetchOrders,
    };
}; 