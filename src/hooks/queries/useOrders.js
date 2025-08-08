import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { orderService } from '../../services/orderService';
import environment from '../../config/environment';
import { useMemo } from 'react';

export const ORDER_QUERY_KEYS = {
  all: ['orders'],
  lists: () => [...ORDER_QUERY_KEYS.all, 'list'],
  list: (branchId) => [...ORDER_QUERY_KEYS.lists(), { branchId: String(branchId) }],
  chefList: (branchId) => [...ORDER_QUERY_KEYS.lists(), 'chef', { branchId: String(branchId) }],
  details: () => [...ORDER_QUERY_KEYS.all, 'detail'],
  detail: (id, branchId) => [...ORDER_QUERY_KEYS.details(), id, { branchId: String(branchId) }],
};

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

export const useOrders = (branchId, filters = {}, searchText = '', options = {}) => {
  const currentBranchId = normalizeBranchId(branchId);

  const stableQueryKey = useMemo(() => {
    const filterKey = {
      startOrderDate: filters.startOrderDate,
      endOrderDate: filters.endOrderDate,
      status: filters.status,
      isPaid: filters.isPaid,
    };
    return [...ORDER_QUERY_KEYS.list(currentBranchId), JSON.stringify(filterKey), searchText];
  }, [currentBranchId, filters.startOrderDate, filters.endOrderDate, filters.status, filters.isPaid, searchText]);

  const query = useQuery({
    queryKey: stableQueryKey,
    queryFn: async () => {
      if (!currentBranchId) throw new Error('Cần Branch ID');
      console.log('🚀 useOrders queryFn executing with:', { filters, searchText });
      try {
        const apiFilters = {
          startOrderDate: filters.startOrderDate,
          endOrderDate: filters.endOrderDate,
          status: filters.status,
          isPaid: filters.isPaid,
          ...(searchText && { keyword: searchText }),
        };
        const cleanFilters = Object.fromEntries(
          Object.entries(apiFilters).filter(([key, value]) => value !== undefined && value !== null && value !== '')
        );
        console.log('🔍 Clean filters for API:', cleanFilters);
        const response = await orderService.getOrdersByBranchWithFilters(currentBranchId, cleanFilters);
        const orderData = response?.data || [];
        console.log(`✅ Query completed successfully. Orders count: ${orderData.length}`, JSON.stringify(orderData, null, 2));
        return orderData;
      } catch (error) {
        console.error(`❌ Query failed for branch ${currentBranchId}:`, error);
        throw error;
      }
    },
    staleTime: environment.performance.queryStaleTime || 120000,
    cacheTime: environment.performance.queryCacheTime || 120000,
    refetchOnWindowFocus: false,
    enabled: !!currentBranchId,
    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if ([404, 403, 401, 302].includes(status)) {
        console.warn(`🚫 Orders request failed with status ${status}, stopping retries`);
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });

  return {
    orders: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    isFetching: query.isFetching,
  };
};

export const useChefOrders = (branchId, options = {}) => {
  const currentBranchId = normalizeBranchId(branchId);

  const query = useQuery({
    queryKey: ORDER_QUERY_KEYS.chefList(currentBranchId),
    queryFn: async () => {
      if (!currentBranchId) throw new Error('Cần Branch ID');
      console.log('🍳 useChefOrders queryFn executing for branch:', currentBranchId);
      try {
        const response = await orderService.getOrdersByBranchWithFilters(currentBranchId, { status: 'Confirmed' });
        const orders = response?.data || [];
        const detailedOrders = await Promise.all(
          orders.map(async (order) => {
            const orderDetails = await orderService.getOrderDetails(order.id);
            return {
              ...order,
              orderDetails: orderDetails.data.map((item) => ({
                ...item,
                foodName: item.foodName || item.name || `Món ăn ID ${item.foodId || 'Unknown'}`,
                Qty: item.Qty ?? item.quantity ?? 1,
              })),
            };
          })
        );
        console.log(`✅ Chef orders fetched successfully. Orders count: ${detailedOrders.length}`);
        return detailedOrders;
      } catch (error) {
        console.error(`❌ Failed to fetch chef orders for branch ${currentBranchId}:`, error);
        throw error;
      }
    },
    staleTime: environment.performance.queryStaleTime || 120000,
    cacheTime: environment.performance.queryCacheTime || 120000,
    refetchOnWindowFocus: false,
    enabled: !!currentBranchId,
    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if ([404, 403, 401, 302].includes(status)) {
        console.warn(`🚫 Chef orders request failed with status ${status}, stopping retries`);
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });

  return {
    orders: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    isFetching: query.isFetching,
  };
};

export const useUpdateOrder = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: async ({ orderId, orderData, branchId, newStatus, updateFn }) => {
      const targetBranchId = normalizeBranchId(branchId);
      if (environment.features.enableLogging) {
        console.log(`🔍 Updating order ${orderId} for branch: ${targetBranchId}`, JSON.stringify({ ...orderData, status: newStatus }, null, 2));
      }
      return await orderService.updateOrder(orderId, { ...orderData, branchId: targetBranchId, status: newStatus });
    },
    onSuccess: (response, variables) => {
      message.success(response.message || 'Cập nhật đơn hàng thành công!');
      const targetBranchId = normalizeBranchId(variables.branchId);
      const updatedOrder = response.data?.data || response.data;
      console.log('🔍 Updated order in cache:', JSON.stringify(updatedOrder, null, 2));
      if (updatedOrder) {
        queryClient.setQueryData(ORDER_QUERY_KEYS.detail(variables.orderId, targetBranchId), updatedOrder);
        queryClient.setQueryData(ORDER_QUERY_KEYS.list(targetBranchId), (oldData) => {
          return oldData
            ? oldData.map((order) => (order.id === variables.orderId ? { ...order, ...updatedOrder } : order))
            : [updatedOrder];
        });
        queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.list(targetBranchId) });
        queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.lists() });
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật đơn hàng!';
      message.error(errorMessage);
      console.error('❌ Failed to update order:', error);
    },
    ...options,
  });
};

export const useDeliveryOrders = (branchId, filters = {}, searchText = '', options = {}) => {
  const currentBranchId = normalizeBranchId(branchId);

  const stableQueryKey = useMemo(() => {
    const filterKey = {
      status: filters.status || 'Delivered',
      isPaid: filters.isPaid,
    };
    return [...ORDER_QUERY_KEYS.list(currentBranchId), JSON.stringify(filterKey), searchText];
  }, [currentBranchId, filters.status, filters.isPaid, searchText]);

  const query = useQuery({
    queryKey: stableQueryKey,
    queryFn: async () => {
      if (!currentBranchId) throw new Error('Cần Branch ID');
      console.log('🚚 useDeliveryOrders queryFn executing with:', { branchId: currentBranchId, filters, searchText });
      try {
        const apiFilters = {
          status: filters.status || 'Delivered',
          isPaid: filters.isPaid,
          ...(searchText && { keyword: searchText }),
        };
        const cleanFilters = Object.fromEntries(
          Object.entries(apiFilters).filter(([key, value]) => value !== undefined && value !== null && value !== '')
        );
        console.log('🔍 Clean filters for delivery API:', cleanFilters);
        const response = await orderService.getOrdersByBranchWithFilters(currentBranchId, cleanFilters);
        const orderData = response?.data || [];
        console.log(`✅ Delivery query completed successfully. Orders count: ${orderData.length}`, JSON.stringify(orderData, null, 2));
        return orderData;
      } catch (error) {
        console.error(`❌ Delivery query failed for branch ${currentBranchId}:`, error);
        throw error;
      }
    },
    staleTime: environment.performance.queryStaleTime || 120000,
    cacheTime: environment.performance.queryCacheTime || 120000,
    refetchOnWindowFocus: false,
    enabled: !!currentBranchId,
    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if ([404, 403, 401, 302].includes(status)) {
        console.warn(`🚫 Delivery orders request failed with status ${status}, stopping retries`);
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });

  return {
    orders: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    isFetching: query.isFetching,
  };
};