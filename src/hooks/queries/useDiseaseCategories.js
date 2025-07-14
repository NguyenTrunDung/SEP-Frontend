import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { environment } from '../../services/api/config';
import { diseaseCategoryService } from '../../services/diseaseCategoryService';

export const DISEASE_CATEGORY_QUERY_KEYS = {
  all: ['diseaseCategories'],
  lists: () => [...DISEASE_CATEGORY_QUERY_KEYS.all, 'list'],
  list: (branchId) => [...DISEASE_CATEGORY_QUERY_KEYS.lists(), { branchId: String(branchId) }],
  detail: (id, branchId) => [...DISEASE_CATEGORY_QUERY_KEYS.all, 'detail', id, { branchId: String(branchId) }],
};

const normalizeBranchId = (branchId) => {
  const id = String(branchId || environment.multiTenant.getCurrentBranchId() || '1');
  if (environment.features.enableLogging) {
    console.log(`🔄 Normalized branchId: ${id}`);
  }
  return id;
};

export const useDiseaseCategories = (branchId, options = {}) => {
  const currentBranchId = normalizeBranchId(branchId);

  const query = useQuery({
    queryKey: DISEASE_CATEGORY_QUERY_KEYS.list(currentBranchId),
    queryFn: async () => {
      const response = await diseaseCategoryService.getDiseaseCategories(currentBranchId);

      // Extract data from the API response
      const diseaseCategories = response.data || [];

      if (environment.features.enableLogging) {
        console.log('✅ Disease categories data:', diseaseCategories);
      }

      return diseaseCategories;
    },
    staleTime: environment.performance.queryStaleTime || 300000,
    cacheTime: environment.performance.queryCacheTime || 300000,
    refetchOnWindowFocus: false,
    enabled: !!currentBranchId,
    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if ([404, 403, 401].includes(status)) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
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

export const useCreateDiseaseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, branchId }) => {
      return await diseaseCategoryService.createDiseaseCategory({ name }, branchId);
    },
    onSuccess: (data, variables) => {
      message.success('Tạo danh mục bệnh thành công!');

      // Invalidate and refetch disease categories
      const currentBranchId = normalizeBranchId(variables.branchId);
      queryClient.invalidateQueries({
        queryKey: DISEASE_CATEGORY_QUERY_KEYS.list(currentBranchId)
      });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo danh mục bệnh!';
      message.error(errorMessage);
    },
  });
};

export const useUpdateDiseaseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, branchId }) => {
      return await diseaseCategoryService.updateDiseaseCategory({ id, name }, branchId);
    },
    onSuccess: (data, variables) => {
      message.success('Cập nhật danh mục bệnh thành công!');

      // Invalidate and refetch disease categories
      const currentBranchId = normalizeBranchId(variables.branchId);
      queryClient.invalidateQueries({
        queryKey: DISEASE_CATEGORY_QUERY_KEYS.list(currentBranchId)
      });

      // Update specific disease category in cache
      queryClient.setQueryData(
        DISEASE_CATEGORY_QUERY_KEYS.detail(variables.id, currentBranchId),
        data.data
      );
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật danh mục bệnh!';
      message.error(errorMessage);
    },
  });
};

export const useDeleteDiseaseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, branchId }) => {
      return await diseaseCategoryService.deleteDiseaseCategory(id, branchId);
    },
    onSuccess: (data, variables) => {
      message.success('Xóa danh mục bệnh thành công!');

      // Invalidate and refetch disease categories
      const currentBranchId = normalizeBranchId(variables.branchId);
      queryClient.invalidateQueries({
        queryKey: DISEASE_CATEGORY_QUERY_KEYS.list(currentBranchId)
      });

      // Remove specific disease category from cache
      queryClient.removeQueries({
        queryKey: DISEASE_CATEGORY_QUERY_KEYS.detail(variables.id, currentBranchId)
      });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa danh mục bệnh!';
      message.error(errorMessage);
    },
  });
};

export const useDiseaseCategory = (id, branchId, options = {}) => {
  const currentBranchId = normalizeBranchId(branchId);

  const query = useQuery({
    queryKey: DISEASE_CATEGORY_QUERY_KEYS.detail(id, currentBranchId),
    queryFn: async () => {
      const response = await diseaseCategoryService.getDiseaseCategoryById(id, currentBranchId);
      return response.data;
    },
    enabled: !!(id && currentBranchId),
    staleTime: environment.performance.queryStaleTime || 300000,
    cacheTime: environment.performance.queryCacheTime || 300000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if ([404, 403, 401].includes(status)) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });

  return {
    diseaseCategory: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    isFetching: query.isFetching,
  };
};

