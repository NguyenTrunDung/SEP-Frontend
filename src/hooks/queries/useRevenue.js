import { useQuery } from '@tanstack/react-query';
import { revenueService } from '../../services/revenueService';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import environment from '../../config/environment';

export const REVENUE_QUERY_KEYS = {
  all: ['revenues'],
  byDay: (branchId, date) => [...REVENUE_QUERY_KEYS.all, 'day', { branchId: String(branchId), date }],
  byWeek: (branchId, date) => [...REVENUE_QUERY_KEYS.all, 'week', { branchId: String(branchId), date }],
  byMonth: (branchId, date) => [...REVENUE_QUERY_KEYS.all, 'month', { branchId: String(branchId), date }],
  byYear: (branchId, date) => [...REVENUE_QUERY_KEYS.all, 'year', { branchId: String(branchId), date }],
};

export const useRevenue = (branchId, date, type = 'day', options = {}) => {
  const normalizedBranchId = String(branchId || environment.multiTenant.getCurrentBranchId() || '1');
  const formattedDate = useMemo(() => {
    if (!date) return null;
    return dayjs(date).format('YYYY-MM-DD');
  }, [date]);

  const queryKey = useMemo(() => {
    switch (type) {
      case 'week':
        return REVENUE_QUERY_KEYS.byWeek(normalizedBranchId, formattedDate);
      case 'month':
        return REVENUE_QUERY_KEYS.byMonth(normalizedBranchId, formattedDate);
      case 'year':
        return REVENUE_QUERY_KEYS.byYear(normalizedBranchId, formattedDate);
      default:
        return REVENUE_QUERY_KEYS.byDay(normalizedBranchId, formattedDate);
    }
  }, [normalizedBranchId, formattedDate, type]);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!normalizedBranchId || !formattedDate) {
        console.error('🚫 Missing branchId or date');
        throw new Error('Branch ID and date are required');
      }
      console.log(`🚀 Fetching revenue for branch ${normalizedBranchId}, type: ${type}, date: ${formattedDate}`);
      let response;
      switch (type) {
        case 'week':
          response = await revenueService.getRevenueByWeek(normalizedBranchId, formattedDate);
          break;
        case 'month':
          response = await revenueService.getRevenueByMonth(normalizedBranchId, formattedDate);
          break;
        case 'year':
          response = await revenueService.getRevenueByYear(normalizedBranchId, formattedDate);
          break;
        default:
          response = await revenueService.getRevenueByDay(normalizedBranchId, formattedDate);
          break;
      }
      console.log(`✅ Revenue query completed. Count: ${response.length}`, JSON.stringify(response, null, 2));
      return response;
    },
    staleTime: environment.performance.queryStaleTime || 120000,
    cacheTime: environment.performance.queryCacheTime || 120000,
    refetchOnWindowFocus: false,
    enabled: !!normalizedBranchId && !!formattedDate,
    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if ([404, 403, 401, 302].includes(status)) {
        console.warn(`🚫 Revenue request failed with status ${status}, stopping retries`);
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });

  return {
    revenues: query.data || [{ order: 0, total: 0, quantityFood: 0, chartOrders: [] }],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    isFetching: query.isFetching,
  };
};