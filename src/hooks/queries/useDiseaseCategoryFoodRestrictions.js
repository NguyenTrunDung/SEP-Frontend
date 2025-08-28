import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { diseaseCategoryFoodRestrictionService } from '../../services/diseaseCategoryFoodRestrictionService';
import { environment } from '../../services/api/config';

export const DISEASE_CATEGORY_FOOD_RESTRICTION_QUERY_KEYS = {
    all: ['diseaseCategoryFoodRestrictions'],
    lists: () => [...DISEASE_CATEGORY_FOOD_RESTRICTION_QUERY_KEYS.all, 'list'],
    list: (branchId) => [...DISEASE_CATEGORY_FOOD_RESTRICTION_QUERY_KEYS.lists(), { branchId: String(branchId) }],
    detail: (id) => [...DISEASE_CATEGORY_FOOD_RESTRICTION_QUERY_KEYS.all, 'detail', id],
};

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

// Query hook for getting disease category food restrictions
export const useDiseaseCategoryFoodRestrictions = (branchId, options = {}) => {
    const currentBranchId = normalizeBranchId(branchId);

    const query = useQuery({
        queryKey: DISEASE_CATEGORY_FOOD_RESTRICTION_QUERY_KEYS.list(currentBranchId),
        queryFn: async () => {
            const response = await diseaseCategoryFoodRestrictionService.getDiseaseCategoryFoodRestrictions(currentBranchId);
            return response.data || [];
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
        restrictions: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        isRefetching: query.isRefetching,
        isError: query.isError,
        isSuccess: query.isSuccess,
        isFetching: query.isFetching,
    };
};

// Query hook for getting disease categories
export const useDiseaseCategories = (branchId, options = {}) => {
    const currentBranchId = normalizeBranchId(branchId);

    const query = useQuery({
        queryKey: DISEASE_CATEGORY_QUERY_KEYS.list(currentBranchId),
        queryFn: async () => {
            const response = await diseaseCategoryFoodRestrictionService.getDiseaseCategories(currentBranchId);
            return response.data || [];
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

// Mutation hook for deleting disease category food restriction
export const useDeleteDiseaseCategoryFoodRestriction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => diseaseCategoryFoodRestrictionService.deleteDiseaseCategoryFoodRestriction(id),
        onSuccess: (data, variables) => {
            message.success('Xóa hạn chế thực phẩm thành công!');

            // Invalidate and refetch restrictions list
            queryClient.invalidateQueries({
                queryKey: DISEASE_CATEGORY_FOOD_RESTRICTION_QUERY_KEYS.lists()
            });

            // Remove specific restriction from cache
            queryClient.removeQueries({
                queryKey: DISEASE_CATEGORY_FOOD_RESTRICTION_QUERY_KEYS.detail(variables)
            });
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa hạn chế thực phẩm!';
            message.error(errorMessage);
            console.error('Failed to delete disease category food restriction:', error);
        },
    });
};

// Query hook for getting a specific disease category food restriction
export const useDiseaseCategoryFoodRestriction = (id, options = {}) => {
    const query = useQuery({
        queryKey: DISEASE_CATEGORY_FOOD_RESTRICTION_QUERY_KEYS.detail(id),
        queryFn: async () => {
            const response = await diseaseCategoryFoodRestrictionService.getDiseaseCategoryFoodRestriction(id);
            return response.data;
        },
        enabled: !!id,
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
        restriction: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        isRefetching: query.isRefetching,
        isError: query.isError,
        isSuccess: query.isSuccess,
        isFetching: query.isFetching,
    };
};