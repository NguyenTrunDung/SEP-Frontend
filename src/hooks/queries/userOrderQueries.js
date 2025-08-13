// src/hooks/queries/userOrderQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import { message } from 'antd';

// Query keys for order operations
export const ORDER_KEYS = {
    all: ['orders'],
    lists: () => [...ORDER_KEYS.all, 'list'],
    listByBranch: (branchId) => [...ORDER_KEYS.lists(), 'branch', branchId],
    chefOrders: (branchId) => [...ORDER_KEYS.all, 'chef', branchId],
    details: () => [...ORDER_KEYS.all, 'detail'],
    detail: (orderId) => [...ORDER_KEYS.details(), orderId],
    orderDetails: (orderId) => [...ORDER_KEYS.all, 'orderDetails', orderId],
    search: (keyword) => [...ORDER_KEYS.all, 'search', keyword],
    filter: (filters) => [...ORDER_KEYS.all, 'filter', filters],
};

/**
 * Hook for fetching orders by branch (for admin/management)
 */
export const useOrdersByBranch = (branchId, options = {}) => {
    return useQuery({
        queryKey: ORDER_KEYS.listByBranch(branchId),
        queryFn: () => orderService.getOrdersByBranch(branchId),
        enabled: !!branchId,
        staleTime: 30 * 1000, // 30 seconds
        cacheTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        ...options,
    });
};

/**
 * Hook for searching orders by keyword
 */
export const useSearchOrders = (keyword, options = {}) => {
    return useQuery({
        queryKey: ORDER_KEYS.search(keyword),
        queryFn: () => orderService.searchOrders(keyword),
        enabled: !!keyword && keyword.length >= 2,
        staleTime: 60 * 1000, // 1 minute
        ...options,
    });
};

/**
 * Hook for filtering orders with criteria
 */
export const useFilterOrders = (filters, options = {}) => {
    return useQuery({
        queryKey: ORDER_KEYS.filter(filters),
        queryFn: () => orderService.filterOrders(filters),
        enabled: !!filters && Object.keys(filters).length > 0,
        staleTime: 30 * 1000,
        ...options,
    });
};

/**
 * Hook for fetching order details
 */
export const useOrderDetails = (orderId, options = {}) => {
    return useQuery({
        queryKey: ORDER_KEYS.orderDetails(orderId),
        queryFn: () => orderService.getOrderDetails(orderId),
        enabled: !!orderId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    });
};

/**
 * Hook for fetching chef orders (kitchen view)
 */
export const useChefOrders = (branchId, options = {}) => {
    return useQuery({
        queryKey: ORDER_KEYS.chefOrders(branchId),
        queryFn: () => orderService.getOrdersForChef(branchId),
        enabled: !!branchId,
        refetchInterval: 30 * 1000, // Refresh every 30 seconds for kitchen
        staleTime: 10 * 1000, // 10 seconds
        ...options,
    });
};

/**
 * Hook for creating a new customer order
 */
export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderData, branchId }) =>
            orderService.createOrder(orderData, branchId),

        onMutate: async ({ orderData, branchId }) => {
            // Show loading message
            message.loading('Đang xử lý đơn hàng...', 0);
        },

        onSuccess: (data, { branchId }) => {

            message.destroy(); // Clear loading message
            message.success('Đặt món thành công! Mã đơn hàng: ' + (data?.data?.id || data?.status || 'N/A'));

            // Invalidate and refetch order lists for this branch
            queryClient.invalidateQueries({
                queryKey: ORDER_KEYS.listByBranch(branchId)
            });

            // Invalidate chef orders for real-time kitchen updates
            queryClient.invalidateQueries({
                queryKey: ORDER_KEYS.chefOrders(branchId)
            });
        },

        onError: (error, { branchId }) => {
            message.destroy(); // Clear loading message
            const errorMessage = error.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.';
            message.error(errorMessage);
            console.error('Order creation failed:', error);
        },
    });
};

/**
 * Hook for creating a patient order (nurse interface)
 */
export const useCreatePatientOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderData, branchId }) =>
            orderService.createPatientOrder(orderData, branchId),

        onMutate: async () => {
            message.loading('Đang tạo đơn hàng cho bệnh nhân...', 0);
        },

        onSuccess: (data, { branchId }) => {
            message.destroy();
            message.success('Đặt món cho bệnh nhân thành công!');

            // Invalidate order lists
            queryClient.invalidateQueries({
                queryKey: ORDER_KEYS.listByBranch(branchId)
            });

            queryClient.invalidateQueries({
                queryKey: ORDER_KEYS.chefOrders(branchId)
            });
        },

        onError: (error) => {
            message.destroy();
            const errorMessage = error.message || 'Không thể tạo đơn hàng cho bệnh nhân.';
            message.error(errorMessage);
            console.error('Patient order creation failed:', error);
        },
    });
};

/**
 * Hook for updating order status (chef interface)
 */
export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId }) => orderService.updateOrderStatus(orderId),

        onMutate: async ({ orderId, branchId }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({
                queryKey: ORDER_KEYS.chefOrders(branchId)
            });

            // Snapshot the previous value
            const previousOrders = queryClient.getQueryData(
                ORDER_KEYS.chefOrders(branchId)
            );

            // Optimistically update the order status
            queryClient.setQueryData(
                ORDER_KEYS.chefOrders(branchId),
                (old) => {
                    if (!old?.data) return old;
                    return {
                        ...old,
                        data: old.data.map(order =>
                            order.id === orderId
                                ? { ...order, status: 'Completed' }
                                : order
                        )
                    };
                }
            );

            return { previousOrders };
        },

        onError: (err, { branchId }, context) => {
            // Rollback optimistic update
            queryClient.setQueryData(
                ORDER_KEYS.chefOrders(branchId),
                context.previousOrders
            );
            message.error('Không thể cập nhật trạng thái đơn hàng');
        },

        onSuccess: (data, { branchId }) => {
            message.success('Đã cập nhật trạng thái đơn hàng');

            // Refetch to ensure data consistency
            queryClient.invalidateQueries({
                queryKey: ORDER_KEYS.chefOrders(branchId)
            });

            queryClient.invalidateQueries({
                queryKey: ORDER_KEYS.listByBranch(branchId)
            });
        },
    });
};

/**
 * Hook for creating VNPay order (with pending payment status)
 */
export const useCreateVnPayOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderData, branchId }) =>
            orderService.createOrderForVnPay(orderData, branchId),

        onMutate: async ({ orderData, branchId }) => {
            message.loading('Đang tạo đơn hàng VNPay...', 0);
        },

        onSuccess: (data, { branchId }) => {
            message.destroy();
            console.log('VNPay order created successfully:', data);

            // Invalidate order lists
            queryClient.invalidateQueries({
                queryKey: ORDER_KEYS.listByBranch(branchId)
            });

            return data; // Return order data for payment URL creation
        },

        onError: (error, { branchId }) => {
            message.destroy();
            const errorMessage = error.message || 'Không thể tạo đơn hàng VNPay. Vui lòng thử lại.';
            message.error(errorMessage);
            console.error('VNPay order creation failed:', error);
        },
    });
};

/**
 * Hook for updating order payment status after VNPay payment
 */
export const useUpdateOrderPaymentStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, isPaid }) =>
            orderService.updateOrderPaymentStatus(orderId, isPaid),

        onSuccess: (data, { orderId, isPaid, branchId }) => {
            if (isPaid) {
                message.success('Thanh toán thành công! Đơn hàng đã được xác nhận.');
            } else {
                message.warning('Thanh toán thất bại. Đơn hàng đã bị hủy.');
            }

            // Invalidate relevant queries
            if (branchId) {
                queryClient.invalidateQueries({
                    queryKey: ORDER_KEYS.listByBranch(branchId)
                });
                queryClient.invalidateQueries({
                    queryKey: ORDER_KEYS.chefOrders(branchId)
                });
            }

            // Invalidate order details
            queryClient.invalidateQueries({
                queryKey: ORDER_KEYS.orderDetails(orderId)
            });
        },

        onError: (error) => {
            const errorMessage = error.message || 'Không thể cập nhật trạng thái thanh toán.';
            message.error(errorMessage);
            console.error('Payment status update failed:', error);
        },
    });
};

/**
 * Hook for fetching order by ID
 */
export const useOrderById = (orderId, options = {}) => {
    return useQuery({
        queryKey: ORDER_KEYS.orderDetails(orderId), // Reuse existing key structure
        queryFn: () => orderService.getOrderById(orderId),
        enabled: !!orderId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    });
};

/**
 * Hook for bulk order operations (future enhancement)
 */
export const useBulkOrderOperations = () => {
    const queryClient = useQueryClient();

    return {
        invalidateAllOrders: (branchId) => {
            queryClient.invalidateQueries({
                queryKey: ORDER_KEYS.listByBranch(branchId)
            });
            queryClient.invalidateQueries({
                queryKey: ORDER_KEYS.chefOrders(branchId)
            });
        },

        prefetchOrderDetails: (orderId) => {
            queryClient.prefetchQuery({
                queryKey: ORDER_KEYS.orderDetails(orderId),
                queryFn: () => orderService.getOrderDetails(orderId),
                staleTime: 5 * 60 * 1000, // 5 minutes
            });
        }
    };
};