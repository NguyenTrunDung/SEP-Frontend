// src/hooks/queries/useOrderQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockOrderService } from '../../services/mockOrderService';

// Query keys
export const ORDER_KEYS = {
    all: ['orders'],
    lists: () => [...ORDER_KEYS.all, 'list'],
    list: (filters) => [...ORDER_KEYS.lists(), filters],
    details: () => [...ORDER_KEYS.all, 'detail'],
    detail: (id) => [...ORDER_KEYS.details(), id],
};

/**
 * Hook for fetching orders with optional filters
 */
export const useOrders = (filters = {}, options = {}) => {
    return useQuery({
        queryKey: ORDER_KEYS.list(filters),
        queryFn: () => mockOrderService.getOrders(filters),
        ...options,
    });
};

/**
 * Hook for fetching a single order by ID
 */
export const useOrder = (orderId, options = {}) => {
    return useQuery({
        queryKey: ORDER_KEYS.detail(orderId),
        queryFn: () => mockOrderService.getOrderById(orderId),
        enabled: !!orderId, // Only run if orderId is provided
        ...options,
    });
};

/**
 * Hook for creating a new order
 */
export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderData) => mockOrderService.createOrder(orderData),
        onSuccess: () => {
            // Invalidate all order lists after creating a new order
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.lists() });
        },
    });
};

/**
 * Hook for updating an order's status
 */
export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, status }) =>
            mockOrderService.updateOrderStatus(orderId, status),

        // Optimistic update
        onMutate: async ({ orderId, status }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ORDER_KEYS.detail(orderId) });

            // Snapshot the previous value
            const previousOrder = queryClient.getQueryData(ORDER_KEYS.detail(orderId));

            // Optimistically update to the new value
            queryClient.setQueryData(ORDER_KEYS.detail(orderId), old => ({
                ...old,
                status,
                updatedAt: new Date().toISOString(),
            }));

            // Return a context object with the snapshot
            return { previousOrder };
        },

        // If mutation fails, rollback to the previous value
        onError: (err, { orderId }, context) => {
            queryClient.setQueryData(ORDER_KEYS.detail(orderId), context.previousOrder);
        },

        // Always refetch after error or success
        onSettled: (data, error, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.detail(orderId) });
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.lists() });
        },
    });
};