import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { diseaseCategoryService } from '../../services/diseaseCategoryService';
import environment from '../../config/environment';

/**
 * Query Keys for Disease Categories
 * Branch-specific keys for proper cache isolation
 * IMPORTANT: Always normalize branchId to string for consistent cache keys
 */
export const DISEASE_CATEGORY_QUERY_KEYS = {
  all: ['diseaseCategories'],
  lists: () => [...DISEASE_CATEGORY_QUERY_KEYS.all, 'list'],
  list: (branchId) => [...DISEASE_CATEGORY_QUERY_KEYS.lists(), { branchId: String(branchId) }],
  details: () => [...DISEASE_CATEGORY_QUERY_KEYS.all, 'detail'],
  detail: (id, branchId) => [...DISEASE_CATEGORY_QUERY_KEYS.details(), id, { branchId: String(branchId) }],
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
 * Hook to fetch all disease categories for a specific branch
 * @param {string|number} branchId - Branch ID (optional, uses current branch if not provided)
 * @param {Object} options - React Query options
 * @returns {Object} Query result with disease categories, loading state, and error
 */
export const useDiseaseCategories = (branchId, options = {}) => {
  const currentBranchId = normalizeBranchId(branchId);

  const query = useQuery({
    queryKey: DISEASE_CATEGORY_QUERY_KEYS.list(currentBranchId),
    queryFn: async () => {
      if (environment.features.enableLogging) {
        console.log(`🔍 Fetching disease categories for branch: ${currentBranchId}`);
      }
      const response = await diseaseCategoryService.getDiseaseCategories(currentBranchId);
      if (environment.features.enableLogging) {
        console.log(`✅ Received disease categories for branch ${currentBranchId}:`, response.data);
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
        console.warn(`🚫 Disease categories request failed with status ${status}, stopping retries`);
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options
  });

  return {
    diseaseCategories: query.data || [],
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
 * Hook to fetch a single disease category by ID
 * @param {string|number} categoryId - Disease Category ID
 * @param {string|number} branchId - Branch ID (optional)
 * @param {Object} options - React Query options
 * @returns {Object} Query result with disease category data
 */
export const useDiseaseCategory = (categoryId, branchId, options = {}) => {
  const currentBranchId = normalizeBranchId(branchId);

  const query = useQuery({
    queryKey: DISEASE_CATEGORY_QUERY_KEYS.detail(categoryId, currentBranchId),
    queryFn: async () => {
      if (environment.features.enableLogging) {
        console.log(`🔍 Fetching disease category ${categoryId} for branch: ${currentBranchId}`);
      }
      const response = await diseaseCategoryService.getDiseaseCategoryById(categoryId, currentBranchId);
      if (environment.features.enableLogging) {
        console.log(`✅ Received disease category ${categoryId} for branch ${currentBranchId}:`, response.data);
      }
      return response.data || null;
    },
    enabled: !!(categoryId && currentBranchId),
    staleTime: environment.performance.queryStaleTime || 300000,
    cacheTime: environment.performance.queryCacheTime || 300000,
    ...options
  });

  return {
    diseaseCategory: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isError: query.isError,
    isSuccess: query.isSuccess,
  };
};

/**
 * Hook to create a new disease category
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useCreateDiseaseCategory = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: ({ categoryData, branchId }) => {
      const targetBranchId = normalizeBranchId(branchId);
      if (environment.features.enableLogging) {
        console.log(`🔍 Creating disease category for branch: ${targetBranchId}`, categoryData);
      }
      return diseaseCategoryService.createDiseaseCategory({ ...categoryData, branchId: targetBranchId });
    },
    onSuccess: (response, variables) => {
      message.success(response.message || 'Tạo danh mục bệnh thành công!');
      const targetBranchId = normalizeBranchId(variables.branchId);
      const newCategory = response.data;
      if (newCategory) {
        queryClient.setQueryData(DISEASE_CATEGORY_QUERY_KEYS.detail(newCategory.id, targetBranchId), newCategory);
        queryClient.setQueryData(DISEASE_CATEGORY_QUERY_KEYS.list(targetBranchId), (oldData) => {
          return oldData ? [...oldData, newCategory] : [newCategory];
        });
      }
      queryClient.invalidateQueries({ queryKey: DISEASE_CATEGORY_QUERY_KEYS.list(targetBranchId), exact: true });
      queryClient.invalidateQueries({ queryKey: DISEASE_CATEGORY_QUERY_KEYS.lists(), exact: true });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Không thể tạo danh mục bệnh!';
      message.error(errorMessage);
      console.error('❌ Failed to create disease category:', error);
    },
    ...options
  });
};

/**
 * Hook to update an existing disease category
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useUpdateDiseaseCategory = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: ({ categoryId, categoryData, branchId }) => {
      const targetBranchId = normalizeBranchId(branchId);
      if (environment.features.enableLogging) {
        console.log(`🔍 Updating disease category ${categoryId} for branch: ${targetBranchId}`, categoryData);
      }
      const { id, ...updateData } = categoryData;
      return diseaseCategoryService.updateDiseaseCategory(categoryId, { ...updateData, branchId: targetBranchId });
    },
    onSuccess: (response, variables) => {
      message.success(response.message || 'Cập nhật danh mục bệnh thành công!');
      const targetBranchId = normalizeBranchId(variables.branchId);
      const updatedCategory = response.data;
      if (updatedCategory) {
        queryClient.setQueryData(DISEASE_CATEGORY_QUERY_KEYS.detail(variables.categoryId, targetBranchId), updatedCategory);
        queryClient.setQueryData(DISEASE_CATEGORY_QUERY_KEYS.list(targetBranchId), (oldData) => {
          return oldData
            ? oldData.map((category) => (category.id === variables.categoryId ? updatedCategory : category))
            : [updatedCategory];
        });
      }
      queryClient.invalidateQueries({ queryKey: DISEASE_CATEGORY_QUERY_KEYS.list(targetBranchId), exact: true });
      queryClient.invalidateQueries({ queryKey: DISEASE_CATEGORY_QUERY_KEYS.lists(), exact: true });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật danh mục bệnh!';
      message.error(errorMessage);
      console.error('❌ Failed to update disease category:', error);
    },
    ...options
  });
};

/**
 * Hook to delete an existing disease category
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useDeleteDiseaseCategory = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: ({ categoryId, branchId }) => {
      const targetBranchId = normalizeBranchId(branchId);
      if (environment.features.enableLogging) {
        console.log(`🔍 Deleting disease category ${categoryId} for branch: ${targetBranchId}`);
      }
      return diseaseCategoryService.deleteDiseaseCategory(categoryId, targetBranchId);
    },
    onSuccess: (response, variables) => {
      message.success(response.message || 'Xóa danh mục bệnh thành công!');
      const targetBranchId = normalizeBranchId(variables.branchId);
      queryClient.removeQueries({ queryKey: DISEASE_CATEGORY_QUERY_KEYS.detail(variables.categoryId, targetBranchId), exact: true });
      queryClient.setQueryData(DISEASE_CATEGORY_QUERY_KEYS.list(targetBranchId), (oldData) => {
        return oldData ? oldData.filter((category) => category.id !== variables.categoryId) : [];
      });
      queryClient.invalidateQueries({ queryKey: DISEASE_CATEGORY_QUERY_KEYS.list(targetBranchId), exact: true });
      queryClient.invalidateQueries({ queryKey: DISEASE_CATEGORY_QUERY_KEYS.lists(), exact: true });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Không thể xóa danh mục bệnh!';
      message.error(errorMessage);
      console.error('❌ Failed to delete disease category:', error);
    },
    ...options
  });
};