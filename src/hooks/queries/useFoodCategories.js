import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { foodCategoryService } from '../../services/foodCategoryService';
import environment from '../../config/environment';

/**
 * Query Keys for Food Categories
 * Branch-specific keys for proper cache isolation
 * IMPORTANT: Always normalize branchId to string for consistent cache keys
 */
export const FOOD_CATEGORY_QUERY_KEYS = {
  all: ['foodCategories'],
  lists: () => [...FOOD_CATEGORY_QUERY_KEYS.all, 'list'],
  list: (branchId) => [...FOOD_CATEGORY_QUERY_KEYS.lists(), { branchId: String(branchId) }],
  details: () => [...FOOD_CATEGORY_QUERY_KEYS.all, 'detail'],
  detail: (id, branchId) => [...FOOD_CATEGORY_QUERY_KEYS.details(), id, { branchId: String(branchId) }],
};

/**
 * Normalize branch ID to ensure consistent cache keys
 * @param {string|number} branchId - Branch ID to normalize
 * @returns {string} Normalized branch ID as string
 */
const normalizeBranchId = (branchId) => {
  return String(branchId || environment.multiTenant.getCurrentBranchId() || '1');
};

/**
 * Hook to fetch all food categories for a specific branch
 * Uses environment configuration for branch context and logging
 * @param {string|number} branchId - Branch ID (optional, uses current branch if not provided)
 * @param {Object} options - React Query options
 * @returns {Object} Query result with categories, loading state, and error
 */
export const useFoodCategories = (branchId, options = {}) => {
  // Normalize branch ID for consistent cache keys
  const currentBranchId = normalizeBranchId(branchId);

  const query = useQuery({
    queryKey: FOOD_CATEGORY_QUERY_KEYS.list(currentBranchId),
    queryFn: async () => {
      if (environment.features.enableLogging) {
        console.log(`🔍 Fetching food categories for branch: ${currentBranchId}`);
      }
      return await foodCategoryService.getFoodCategories(currentBranchId);
    },
    staleTime: environment.performance.queryStaleTime,
    cacheTime: environment.performance.queryCacheTime,
    refetchOnWindowFocus: false,
    enabled: !!currentBranchId,
    retry: (failureCount, error) => {
      // Don't retry on authorization/access errors to prevent infinite loops
      const status = error?.response?.status;
      if (status === 404) {
        console.warn('🚫 Food categories endpoint not found (404), stopping retries');
        return false;
      }
      if (status === 403) {
        console.warn('🚫 Access denied to food categories for current branch, stopping retries');
        return false;
      }
      if (status === 302) {
        console.warn('🚫 Food categories redirected (likely authorization issue), stopping retries');
        return false;
      }
      if (status === 401) {
        console.warn('🚫 Unauthorized access to food categories, stopping retries');
        return false;
      }
      // Limit retries for other errors
      return failureCount < 2;
    },
    ...options
  });

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
  };
};

/**
 * Hook to fetch a single food category by ID
 * Uses environment configuration for branch context and caching
 * @param {string|number} categoryId - Category ID
 * @param {string|number} branchId - Branch ID (optional)
 * @param {Object} options - React Query options
 * @returns {Object} Query result with category data
 */
export const useFoodCategory = (categoryId, branchId, options = {}) => {
  const currentBranchId = normalizeBranchId(branchId);

  const query = useQuery({
    queryKey: FOOD_CATEGORY_QUERY_KEYS.detail(categoryId, currentBranchId),
    queryFn: () => foodCategoryService.getFoodCategoryById(categoryId),
    enabled: !!(categoryId && currentBranchId),
    staleTime: environment.performance.queryStaleTime,
    cacheTime: environment.performance.queryCacheTime,
    ...options
  });

  return {
    category: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isError: query.isError,
    isSuccess: query.isSuccess,
  };
};

/**
 * Hook to create a new food category with server upload endpoint
 * Always uses /api/v1/foodcategories/create endpoint with multipart/form-data
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useCreateFoodCategory = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: ({ categoryData, imageFile, branchId }) => {
      const targetBranchId = normalizeBranchId(branchId);

      // Always use the server upload endpoint
      return foodCategoryService.createFoodCategoryWithImage(categoryData, imageFile, targetBranchId);
    },
    onSuccess: (response, variables) => {
      message.success(response.message || 'Tạo danh mục thành công!');

      const targetBranchId = normalizeBranchId(variables.branchId);

      if (environment.features.enableLogging) {
        console.log('🔄 Cache invalidation for create - targetBranchId:', targetBranchId);
        console.log('🔄 Invalidating query key:', FOOD_CATEGORY_QUERY_KEYS.list(targetBranchId));
      }

      // Invalidate and refetch categories list for the target branch
      queryClient.invalidateQueries({
        queryKey: FOOD_CATEGORY_QUERY_KEYS.list(targetBranchId)
      });

      // Also invalidate the general lists to ensure all related queries are updated
      queryClient.invalidateQueries({
        queryKey: FOOD_CATEGORY_QUERY_KEYS.lists()
      });

      // Add to cache optimistically
      const newCategory = response.data;
      if (newCategory) {
        queryClient.setQueryData(
          FOOD_CATEGORY_QUERY_KEYS.detail(newCategory.id, targetBranchId),
          newCategory
        );
      }

      console.log('✅ Created food category successfully:', response);
    },
    onError: (error, variables) => {
      const errorMessage = error.response?.data?.message || 'Không thể tạo danh mục!';
      message.error(errorMessage);
      console.error('❌ Failed to create food category:', error);
    },
    ...options
  });
};

/**
 * Hook to update an existing food category with server upload endpoint
 * Always uses /api/v1/foodcategories/update/{id} endpoint with multipart/form-data
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useUpdateFoodCategory = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: ({ categoryId, categoryData, imageFile, branchId }) => {
      const targetBranchId = normalizeBranchId(branchId);

      // Always use the server upload endpoint
      return foodCategoryService.updateFoodCategoryWithImage(categoryId, categoryData, imageFile, targetBranchId);
    },
    onSuccess: (response, variables) => {
      message.success(response.message || 'Cập nhật danh mục thành công!');

      const targetBranchId = normalizeBranchId(variables.branchId);

      if (environment.features.enableLogging) {
        console.log('🔄 Cache invalidation for update - targetBranchId:', targetBranchId);
        console.log('🔄 Invalidating query key:', FOOD_CATEGORY_QUERY_KEYS.list(targetBranchId));
      }

      // Update the specific category in cache first
      const updatedCategory = response.data;
      if (updatedCategory) {
        queryClient.setQueryData(
          FOOD_CATEGORY_QUERY_KEYS.detail(variables.categoryId, targetBranchId),
          updatedCategory
        );
      }

      // Invalidate and refetch categories list for the target branch
      queryClient.invalidateQueries({
        queryKey: FOOD_CATEGORY_QUERY_KEYS.list(targetBranchId)
      });

      // Also invalidate the general lists to ensure all related queries are updated
      queryClient.invalidateQueries({
        queryKey: FOOD_CATEGORY_QUERY_KEYS.lists()
      });

      console.log('✅ Updated food category successfully:', response);
    },
    onError: (error, variables) => {
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật danh mục!';
      message.error(errorMessage);
      console.error('❌ Failed to update food category:', error);
    },
    ...options
  });
};

/**
 * Hook to delete a food category
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useDeleteFoodCategory = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: (categoryId) => foodCategoryService.deleteFoodCategory(categoryId),
    onSuccess: (response, categoryId) => {
      message.success(response.message || 'Xóa danh mục thành công!');

      if (environment.features.enableLogging) {
        console.log('🔄 Cache invalidation for delete - currentBranchId:', currentBranchId);
      }

      // Remove from cache
      queryClient.removeQueries({
        queryKey: FOOD_CATEGORY_QUERY_KEYS.detail(categoryId, currentBranchId)
      });

      // Invalidate list to refetch
      queryClient.invalidateQueries({
        queryKey: FOOD_CATEGORY_QUERY_KEYS.list(currentBranchId)
      });

      // Also invalidate the general lists to ensure all related queries are updated
      queryClient.invalidateQueries({
        queryKey: FOOD_CATEGORY_QUERY_KEYS.lists()
      });

      console.log('✅ Deleted food category successfully:', response);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Không thể xóa danh mục!';
      message.error(errorMessage);
      console.error('❌ Failed to delete food category:', error);
    },
    ...options
  });
};

/**
 * Convenience hook for form-based category creation
 * @param {string|number} branchId - Branch ID
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object with form-friendly interface
 */
export const useCreateFoodCategoryFromForm = (branchId, options = {}) => {
  const createMutation = useCreateFoodCategory(options);

  return {
    ...createMutation,
    submitForm: (formValues, imageFile = null) => {
      const normalizedBranchId = normalizeBranchId(branchId);
      const categoryData = foodCategoryService.createCategoryFromForm(formValues, normalizedBranchId);
      return createMutation.mutateAsync({ categoryData, imageFile, branchId: normalizedBranchId });
    }
  };
};

/**
 * Convenience hook for form-based category updates
 * @param {string|number} branchId - Branch ID
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object with form-friendly interface
 */
export const useUpdateFoodCategoryFromForm = (branchId, options = {}) => {
  const updateMutation = useUpdateFoodCategory(options);

  return {
    ...updateMutation,
    submitForm: (categoryId, formValues, imageFile = null) => {
      const normalizedBranchId = normalizeBranchId(branchId);
      const categoryData = foodCategoryService.updateCategoryFromForm(categoryId, formValues, normalizedBranchId);
      return updateMutation.mutateAsync({ categoryId, categoryData, imageFile, branchId: normalizedBranchId });
    }
  };
};

/**
 * Hook for bulk operations on food categories
 * @param {Object} options - Mutation options
 * @returns {Object} Object with bulk operation methods
 */
export const useBulkFoodCategoryOperations = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  const bulkDeleteMutation = useMutation({
    mutationFn: async (categoryIds) => {
      const deletePromises = categoryIds.map(id => foodCategoryService.deleteFoodCategory(id));
      return Promise.all(deletePromises);
    },
    onSuccess: (responses, categoryIds) => {
      message.success(`Đã xóa ${categoryIds.length} danh mục thành công!`);

      // Remove all deleted categories from cache
      categoryIds.forEach(categoryId => {
        queryClient.removeQueries({
          queryKey: FOOD_CATEGORY_QUERY_KEYS.detail(categoryId, currentBranchId)
        });
      });

      // Invalidate list to refetch
      queryClient.invalidateQueries({
        queryKey: FOOD_CATEGORY_QUERY_KEYS.list(currentBranchId)
      });

      // Also invalidate the general lists to ensure all related queries are updated
      queryClient.invalidateQueries({
        queryKey: FOOD_CATEGORY_QUERY_KEYS.lists()
      });

      console.log('✅ Bulk deleted food categories successfully:', responses);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Không thể xóa các danh mục đã chọn!';
      message.error(errorMessage);
      console.error('❌ Failed to bulk delete food categories:', error);
    },
    ...options
  });

  return {
    bulkDelete: bulkDeleteMutation.mutateAsync,
    isBulkDeleting: bulkDeleteMutation.isLoading,
    bulkDeleteError: bulkDeleteMutation.error,
  };
};

/**
 * Hook to get food categories for the current branch (convenience wrapper)
 * @param {Object} options - React Query options
 * @returns {Object} Query result
 */
export const useCurrentBranchFoodCategories = (options = {}) => {
  const currentBranchId = normalizeBranchId();

  return useFoodCategories(currentBranchId, {
    enabled: !!currentBranchId,
    ...options
  });
};

// Export legacy hook for backward compatibility
export { useFoodCategories as useFoodCategoriesLegacy };