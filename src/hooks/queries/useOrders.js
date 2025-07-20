import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { orderService } from '../../services/orderService';
import environment from '../../config/environment';
import { useMemo } from 'react';

export const ORDER_QUERY_KEYS = {
  all: ['orders'],
  lists: () => [...ORDER_QUERY_KEYS.all, 'list'],
  list: (branchId) => [...ORDER_QUERY_KEYS.lists(), { branchId: String(branchId) }],
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

  // Create stable query key by serializing filter values instead of using object reference
  const stableQueryKey = useMemo(() => {
    const filterKey = {
      startOrderDate: filters.startOrderDate,
      endOrderDate: filters.endOrderDate,
      status: filters.status,
      isPaid: filters.isPaid
    };
    return [
      ...ORDER_QUERY_KEYS.list(currentBranchId),
      JSON.stringify(filterKey),
      searchText
    ];
  }, [
    currentBranchId,
    filters.startOrderDate,
    filters.endOrderDate,
    filters.status,
    filters.isPaid,
    searchText
  ]);

  const query = useQuery({
    queryKey: stableQueryKey,
    queryFn: async () => {
      if (!currentBranchId) {
        throw new Error('Branch ID is required');
      }

      console.log('🚀 useOrders queryFn executing with:', { filters, searchText });

      try {
        // Combine filters and searchText into a single filter object for the API
        const apiFilters = {
          // Map frontend filter names to backend parameter names
          startOrderDate: filters.startOrderDate,
          endOrderDate: filters.endOrderDate,
          status: filters.status,
          // Now include isPaid since it's supported by the API
          isPaid: filters.isPaid,
          // Add searchText as keyword if provided
          ...(searchText && { keyword: searchText })
        };

        // Remove undefined/null values to keep the API call clean
        const cleanFilters = Object.fromEntries(
          Object.entries(apiFilters).filter(([key, value]) =>
            value !== undefined &&
            value !== null &&
            value !== ''
          )
        );

        console.log('🔍 Clean filters for API:', cleanFilters);

        const response = await orderService.getOrdersByBranchWithFilters(currentBranchId, cleanFilters);

        // Handle the new API response structure
        const orderData = response?.data || [];

        console.log(`✅ Query completed successfully. Orders count: ${orderData.length}`);

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

export const useCreateOrder = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: ({ orderData, branchId }) => {
      const targetBranchId = normalizeBranchId(branchId);
      if (environment.features.enableLogging) {
        console.log(`🔍 Creating order for branch: ${targetBranchId}`, JSON.stringify(orderData, null, 2));
      }
      return orderService.createOrder({ ...orderData, branchId: targetBranchId });
    },
    onSuccess: (response, variables) => {
      message.success(response.message || 'Tạo đơn hàng thành công!');
      const targetBranchId = normalizeBranchId(variables.branchId);
      const newOrder = response.data?.data || response.data;
      if (newOrder) {
        queryClient.setQueryData(ORDER_QUERY_KEYS.detail(newOrder.id, targetBranchId), newOrder);
        queryClient.setQueryData(ORDER_QUERY_KEYS.list(targetBranchId), (oldData) => {
          return oldData ? [...oldData, newOrder] : [newOrder];
        });
      }
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.list(targetBranchId), exact: true });
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.lists(), exact: true });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Không thể tạo đơn hàng!';
      message.error(errorMessage);
      console.error('❌ Failed to create order:', error);
    },
    ...options,
  });
};

export const useUpdateOrder = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: ({ orderId, orderData, branchId }) => {
      const targetBranchId = normalizeBranchId(branchId);
      if (environment.features.enableLogging) {
        console.log(`🔍 Updating order ${orderId} for branch: ${targetBranchId}`, JSON.stringify(orderData, null, 2));
      }
      return orderService.updateOrder(orderId, { ...orderData, branchId: targetBranchId });
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
      }
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.list(targetBranchId) });
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật đơn hàng!';
      message.error(errorMessage);
      console.error('❌ Failed to update order:', error);
    },
    ...options,
  });
};