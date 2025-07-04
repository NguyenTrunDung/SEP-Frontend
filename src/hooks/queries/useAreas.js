import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { areaService } from '../../services/areaService';
import environment from '../../config/environment';

/**
 * Query Keys for Areas
 * Branch-specific keys for proper cache isolation
 * IMPORTANT: Always normalize branchId to string for consistent cache keys
 */
export const AREA_QUERY_KEYS = {
  all: ['areas'],
  lists: () => [...AREA_QUERY_KEYS.all, 'list'],
  list: (branchId) => [...AREA_QUERY_KEYS.lists(), { branchId: String(branchId) }],
  details: () => [...AREA_QUERY_KEYS.all, 'detail'],
  detail: (id, branchId) => [...AREA_QUERY_KEYS.details(), id, { branchId: String(branchId) }],
};

/**
 * Normalize branch ID to ensure consistent cache keys
 * @param {string|number} branchId - Branch ID to normalize
 * @returns {string} Normalized branch ID as string
 */
const normalizeBranchId = (branchId) => {
  const id = String(branchId || environment.multiTenant.getCurrentBranchId() || '1');
  if (environment.features.enableLogging) {
    console.log(`🔄 Normalized branchId: ${id}`);
  }
  return id;
};

/**
 * Hook to fetch all areas for a specific branch
 * @param {string|number} branchId - Branch ID (optional, uses current branch if not provided)
 * @param {Object} options - React Query options
 * @returns {Object} Query result with areas, loading state, and error
 */
export const useAreas = (branchId, options = {}) => {
  const currentBranchId = normalizeBranchId(branchId);

  const query = useQuery({
    queryKey: AREA_QUERY_KEYS.list(currentBranchId),
    queryFn: async () => {
      if (environment.features.enableLogging) {
        console.log(`🔍 Fetching areas for branch: ${currentBranchId}`);
      }
      const response = await areaService.getAreas(currentBranchId);
      if (environment.features.enableLogging) {
        console.log(`✅ Received areas for branch ${currentBranchId}:`, response.data);
      }
      return response.data || [];
    },
    staleTime: environment.performance.images?.cacheTime || 120000,
    cacheTime: environment.performance.images?.cacheTime || 120000,
    refetchOnWindowFocus: false,
    enabled: !!currentBranchId,
    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if ([404, 403, 401, 302].includes(status)) {
        console.warn(`🚫 Areas request failed with status ${status}, stopping retries`);
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options
  });

  return {
    areas: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    isFetching: query.isFetching,
  };
};

/**
 * Hook to fetch a single area by ID
 * @param {string|number} areaId - Area ID
 * @param {string|number} branchId - Branch ID (optional)
 * @param {Object} options - React Query options
 * @returns {Object} Query result with area data
 */
export const useArea = (areaId, branchId, options = {}) => {
  const currentBranchId = normalizeBranchId(branchId);

  const query = useQuery({
    queryKey: AREA_QUERY_KEYS.detail(areaId, currentBranchId),
    queryFn: async () => {
      if (environment.features.enableLogging) {
        console.log(`🔍 Fetching area ${areaId} for branch: ${currentBranchId}`);
      }
      const response = await areaService.getAreaById(areaId, currentBranchId);
      if (environment.features.enableLogging) {
        console.log(`✅ Received area ${areaId} for branch ${currentBranchId}:`, response.data);
      }
      return response.data || null;
    },
    enabled: !!(areaId && currentBranchId),
    staleTime: environment.performance.queryStaleTime || 300000,
    cacheTime: environment.performance.queryCacheTime || 300000,
    ...options
  });

  return {
    area: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isError: query.isError,
    isSuccess: query.isSuccess,
  };
};

/**
 * Hook to create a new area
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useCreateArea = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: ({ areaData, branchId }) => {
      const targetBranchId = normalizeBranchId(branchId);
      if (environment.features.enableLogging) {
        console.log(`🔍 Creating area for branch: ${targetBranchId}`, areaData);
      }
      return areaService.createArea({ ...areaData, branchId: targetBranchId });
    },
    onSuccess: (response, variables) => {
      message.success(response.message || 'Tạo khu vực thành công!');
      const targetBranchId = normalizeBranchId(variables.branchId);
      const newArea = response.data;
      if (newArea) {
        queryClient.setQueryData(AREA_QUERY_KEYS.detail(newArea.id, targetBranchId), newArea);
        queryClient.setQueryData(AREA_QUERY_KEYS.list(targetBranchId), (oldData) => {
          return oldData ? [...oldData, newArea] : [newArea];
        });
      }
      queryClient.invalidateQueries({ queryKey: AREA_QUERY_KEYS.list(targetBranchId), exact: true });
      queryClient.invalidateQueries({ queryKey: AREA_QUERY_KEYS.lists(), exact: true });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Không thể tạo khu vực!';
      message.error(errorMessage);
      console.error('❌ Failed to create area:', error);
    },
    ...options
  });
};

/**
 * Hook to update an existing area
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useUpdateArea = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: ({ areaId, areaData, branchId }) => {
      const targetBranchId = normalizeBranchId(branchId);
      if (environment.features.enableLogging) {
        console.log(`🔍 Updating area ${areaId} for branch: ${targetBranchId}`, areaData);
      }
      const { id, ...updateData } = areaData;
      return areaService.updateArea(areaId, { ...updateData, branchId: targetBranchId });
    },
    onSuccess: (response, variables) => {
      message.success(response.message || 'Cập nhật khu vực thành công!');
      const targetBranchId = normalizeBranchId(variables.branchId);
      const updatedArea = response.data;
      if (updatedArea) {
        queryClient.setQueryData(AREA_QUERY_KEYS.detail(variables.areaId, targetBranchId), updatedArea);
        queryClient.setQueryData(AREA_QUERY_KEYS.list(targetBranchId), (oldData) => {
          return oldData
            ? oldData.map((area) => (area.id === variables.areaId ? updatedArea : area))
            : [updatedArea];
        });
      }
      queryClient.invalidateQueries({ queryKey: AREA_QUERY_KEYS.list(targetBranchId), exact: true });
      queryClient.invalidateQueries({ queryKey: AREA_QUERY_KEYS.lists(), exact: true });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật khu vực!';
      message.error(errorMessage);
      console.error('❌ Failed to update area:', error);
    },
    ...options
  });
};

/**
 * Hook to delete an existing area
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useDeleteArea = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: ({ areaId, branchId }) => {
      const targetBranchId = normalizeBranchId(branchId);
      if (environment.features.enableLogging) {
        console.log(`🔍 Deleting area ${areaId} for branch: ${targetBranchId}`);
      }
      return areaService.deleteArea(areaId, targetBranchId);
    },
    onSuccess: (response, variables) => {
      message.success(response.message || 'Xóa khu vực thành công!');
      const targetBranchId = normalizeBranchId(variables.branchId);
      queryClient.removeQueries({ queryKey: AREA_QUERY_KEYS.detail(variables.areaId, targetBranchId), exact: true });
      queryClient.setQueryData(AREA_QUERY_KEYS.list(targetBranchId), (oldData) => {
        return oldData ? oldData.filter((area) => area.id !== variables.areaId) : [];
      });
      queryClient.invalidateQueries({ queryKey: AREA_QUERY_KEYS.list(targetBranchId), exact: true });
      queryClient.invalidateQueries({ queryKey: AREA_QUERY_KEYS.lists(), exact: true });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Không thể xóa khu vực!';
      message.error(errorMessage);
      console.error('❌ Failed to delete area:', error);
    },
    ...options
  });
};