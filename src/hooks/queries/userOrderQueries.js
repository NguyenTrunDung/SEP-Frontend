// src/hooks/queries/useOrderQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, getOrderById, createOrder, updateOrderStatus } from '../../services/mockOrderService';
import environment from '../../config/environment';

// Query keys with branch context
export const ORDER_KEYS = {
    all: ['orders'],
    lists: () => [...ORDER_KEYS.all, 'list'],
    list: (filters, branchId) => [...ORDER_KEYS.lists(), { ...filters, branchId }],
    details: () => [...ORDER_KEYS.all, 'detail'],
    detail: (id, branchId) => [...ORDER_KEYS.details(), { id, branchId }],
};

/**
 * Hook for fetching orders with optional filters
 */
export const useOrders = (filters = {}, options = {}) => {
    // Get current branch ID for query key isolation
    const currentBranchId = environment.multiTenant.getCurrentBranchId();

    return useQuery({
        queryKey: ORDER_KEYS.list(filters, currentBranchId),
        queryFn: () => getOrders({ ...filters, branchId: currentBranchId }),
        enabled: !!currentBranchId, // Only run if branch ID is available
        ...options,
    });
};

/**
 * Hook for fetching a single order by ID
 */
export const useOrder = (orderId, options = {}) => {
    // Get current branch ID for query key isolation
    const currentBranchId = environment.multiTenant.getCurrentBranchId();

    return useQuery({
        queryKey: ORDER_KEYS.detail(orderId, currentBranchId),
        queryFn: () => getOrderById(orderId, currentBranchId),
        enabled: !!(orderId && currentBranchId), // Only run if both orderId and branchId are available
        ...options,
    });
};

/**
 * Hook for creating a new order
 */
export const useCreateOrder = () => {
    const queryClient = useQueryClient();
    const currentBranchId = environment.multiTenant.getCurrentBranchId();

    return useMutation({
        mutationFn: (orderData) => createOrder({ ...orderData, branchId: currentBranchId }),
        onSuccess: () => {
            // Invalidate order lists for current branch
            queryClient.invalidateQueries({
                queryKey: ['orders', 'list'],
                predicate: (query) => {
                    const queryData = query.queryKey[2];
                    return queryData?.branchId === currentBranchId;
                }
            });
        },
    });
};

/**
 * Hook for updating an order's status
 */
export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();
    const currentBranchId = environment.multiTenant.getCurrentBranchId();

    return useMutation({
        mutationFn: ({ orderId, status }) =>
            updateOrderStatus(orderId, status),

        // Optimistic update
        onMutate: async ({ orderId, status }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ORDER_KEYS.detail(orderId, currentBranchId) });

            // Snapshot the previous value
            const previousOrder = queryClient.getQueryData(ORDER_KEYS.detail(orderId, currentBranchId));

            // Optimistically update to the new value
            queryClient.setQueryData(ORDER_KEYS.detail(orderId, currentBranchId), old => ({
                ...old,
                status,
                updatedAt: new Date().toISOString(),
            }));

            // Return a context object with the snapshot
            return { previousOrder };
        },

        // If mutation fails, rollback to the previous value
        onError: (err, { orderId }, context) => {
            queryClient.setQueryData(ORDER_KEYS.detail(orderId, currentBranchId), context.previousOrder);
        },

        // Always refetch after error or success
        onSettled: (data, error, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: ORDER_KEYS.detail(orderId, currentBranchId) });
            queryClient.invalidateQueries({
                queryKey: ['orders', 'list'],
                predicate: (query) => {
                    const queryData = query.queryKey[2];
                    return queryData?.branchId === currentBranchId;
                }
            });
        },
    });
};