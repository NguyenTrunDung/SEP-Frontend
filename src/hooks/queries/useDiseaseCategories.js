import { useQuery } from '@tanstack/react-query';
import { message } from 'antd';
import api from '../../services/api/config';
import { environment } from '../../services/api/config';

export const DISEASE_CATEGORY_QUERY_KEYS = {
  all: ['diseaseCategories'],
  lists: () => [...DISEASE_CATEGORY_QUERY_KEYS.all, 'list'],
  list: (branchId) => [...DISEASE_CATEGORY_QUERY_KEYS.lists(), { branchId: String(branchId) }],
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
      const response = await api.get(`/api/v1/Patient/with-disease-categories-by-branch`, {
        params: { branchId: currentBranchId },
      });

      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      if (environment.features.enableLogging) {
        console.log('✅ Patient data:', rawData);
      }

      const diseaseCategories = [];
      const categorySet = new Set();

      rawData.forEach((patient) => {
        if (patient.diseaseCategories) {
          patient.diseaseCategories.forEach((category) => {
            if (!categorySet.has(category.id)) {
              categorySet.add(category.id);
              diseaseCategories.push({
                id: category.id,
                diseaseCategoryName: category.diseaseCategoryName,
                branchId: patient.branchId,
              });
            }
          });
        }
      });

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

export const useCreateDiseaseCategory = () => ({
  mutateAsync: () => {
    message.error('Tạo danh mục bệnh không được hỗ trợ bởi backend!');
    throw new Error('Create disease category endpoint not available');
  },
});

export const useUpdateDiseaseCategory = () => ({
  mutateAsync: () => {
    message.error('Cập nhật danh mục bệnh không được hỗ trợ bởi backend!');
    throw new Error('Update disease category endpoint not available');
  },
});

export const useDeleteDiseaseCategory = () => ({
  mutateAsync: () => {
    message.error('Xóa danh mục bệnh không được hỗ trợ bởi backend!');
    throw new Error('Delete disease category endpoint not available');
  },
});

