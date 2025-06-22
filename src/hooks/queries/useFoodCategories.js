import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { foodCategoryService } from '../../services/foodCategoryService';
import environment from '../../config/environment';

/**
 * Query Keys for Food Categories
 * Branch-specific keys for proper cache isolation
 */
export const FOOD_CATEGORY_QUERY_KEYS = {
  all: ['foodCategories'],
  lists: () => [...FOOD_CATEGORY_QUERY_KEYS.all, 'list'],
  list: (branchId) => [...FOOD_CATEGORY_QUERY_KEYS.lists(), { branchId }],
  details: () => [...FOOD_CATEGORY_QUERY_KEYS.all, 'detail'],
  detail: (id, branchId) => [...FOOD_CATEGORY_QUERY_KEYS.details(), id, { branchId }],
};

/**
 * Hook to fetch all food categories for a specific branch
 * Uses environment configuration for branch context and logging
 * @param {string|number} branchId - Branch ID (optional, uses current branch if not provided)
 * @param {Object} options - React Query options
 * @returns {Object} Query result with categories, loading state, and error
 */
export const useFoodCategories = (branchId, options = {}) => {
  // Get current branch ID if not provided
  const currentBranchId = branchId || environment.multiTenant.getCurrentBranchId() || '1';

  const query = useQuery({
    queryKey: FOOD_CATEGORY_QUERY_KEYS.list(currentBranchId),
    queryFn: async () => {
      if (environment.features.enableLogging) {
        console.log(`🔍 Fetching food categories for branch: ${currentBranchId}`);
      }
      return await foodCategoryService.getFoodCategories(currentBranchId);
    },
    staleTime: environment.performance.queryStaleTime, // Use environment config
    cacheTime: environment.performance.queryCacheTime, // Use environment config
    refetchOnWindowFocus: false,
    enabled: !!currentBranchId, // Only run if branch ID is available
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
    // Global error handling is now handled in reactQuery.js
    // Individual hooks no longer need to handle branch permission errors
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
  const currentBranchId = branchId || environment.multiTenant.getCurrentBranchId() || '1';

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
 * Hook to create a new food category
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useCreateFoodCategory = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = environment.multiTenant.getCurrentBranchId() || '1';

  return useMutation({
    mutationFn: (categoryData) => foodCategoryService.createFoodCategory(categoryData),
    onSuccess: (response, variables) => {
      // Show success message
      message.success(response.message || 'Tạo danh mục thành công!');

      // Invalidate and refetch categories list
      queryClient.invalidateQueries({
        queryKey: FOOD_CATEGORY_QUERY_KEYS.list(currentBranchId)
      });

      // Optionally add to cache optimistically
      const newCategory = response.data;
      if (newCategory) {
        queryClient.setQueryData(
          FOOD_CATEGORY_QUERY_KEYS.detail(newCategory.id, currentBranchId),
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
 * Hook to update an existing food category
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useUpdateFoodCategory = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = environment.multiTenant.getCurrentBranchId() || '1';

  return useMutation({
    mutationFn: ({ categoryId, categoryData }) =>
      foodCategoryService.updateFoodCategory(categoryId, categoryData),
    onSuccess: (response, variables) => {
      // Show success message
      message.success(response.message || 'Cập nhật danh mục thành công!');

      // Update the specific category in cache
      const updatedCategory = response.data;
      if (updatedCategory) {
        queryClient.setQueryData(
          FOOD_CATEGORY_QUERY_KEYS.detail(variables.categoryId, currentBranchId),
          updatedCategory
        );
      }

      // Invalidate categories list to reflect changes
      queryClient.invalidateQueries({
        queryKey: FOOD_CATEGORY_QUERY_KEYS.list(currentBranchId)
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
  const currentBranchId = environment.multiTenant.getCurrentBranchId() || '1';

  return useMutation({
    mutationFn: (categoryId) => foodCategoryService.deleteFoodCategory(categoryId),
    onSuccess: (response, categoryId) => {
      // Show success message
      message.success(response.message || 'Xóa danh mục thành công!');

      // Remove from cache
      queryClient.removeQueries({
        queryKey: FOOD_CATEGORY_QUERY_KEYS.detail(categoryId, currentBranchId)
      });

      // Invalidate categories list
      queryClient.invalidateQueries({
        queryKey: FOOD_CATEGORY_QUERY_KEYS.list(currentBranchId)
      });

      console.log('✅ Deleted food category successfully:', response);
    },
    onError: (error, variables) => {
      const errorMessage = error.response?.data?.message || 'Không thể xóa danh mục!';
      message.error(errorMessage);
      console.error('❌ Failed to delete food category:', error);
    },
    ...options
  });
};

/**
 * Hook to create food category from form data (convenience hook)
 * @param {string|number} branchId - Branch ID
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useCreateFoodCategoryFromForm = (branchId, options = {}) => {
  const createMutation = useCreateFoodCategory(options);

  return {
    ...createMutation,
    mutateAsync: async (formData) => {
      const categoryData = foodCategoryService.createCategoryFromForm(formData, branchId);
      return createMutation.mutateAsync(categoryData);
    }
  };
};

/**
 * Hook to update food category from form data (convenience hook)
 * @param {string|number} branchId - Branch ID
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useUpdateFoodCategoryFromForm = (branchId, options = {}) => {
  const updateMutation = useUpdateFoodCategory(options);

  return {
    ...updateMutation,
    mutateAsync: async ({ categoryId, formData }) => {
      const categoryData = foodCategoryService.updateCategoryFromForm(categoryId, formData, branchId);
      return updateMutation.mutateAsync({
        categoryId,
        categoryData
      });
    }
  };
};

/**
 * Hook for bulk operations on food categories
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object for bulk operations
 */
export const useBulkFoodCategoryOperations = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = environment.multiTenant.getCurrentBranchId() || '1';

  return useMutation({
    mutationFn: async ({ operation, categoryIds }) => {
      if (operation === 'delete') {
        const results = await Promise.allSettled(
          categoryIds.map(id => foodCategoryService.deleteFoodCategory(id))
        );
        return { operation, results, categoryIds };
      }
      throw new Error(`Unsupported bulk operation: ${operation}`);
    },
    onSuccess: (data, variables) => {
      const { operation, results, categoryIds } = data;

      if (operation === 'delete') {
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failCount = results.filter(r => r.status === 'rejected').length;

        if (successCount > 0) {
          message.success(`Đã xóa thành công ${successCount} danh mục`);

          // Remove from cache and invalidate
          categoryIds.forEach(id => {
            queryClient.removeQueries({
              queryKey: FOOD_CATEGORY_QUERY_KEYS.detail(id, currentBranchId)
            });
          });

          queryClient.invalidateQueries({
            queryKey: FOOD_CATEGORY_QUERY_KEYS.list(currentBranchId)
          });
        }

        if (failCount > 0) {
          message.warning(`${failCount} danh mục không thể xóa`);
        }
      }
    },
    onError: (error, variables) => {
      message.error('Có lỗi xảy ra khi thực hiện thao tác hàng loạt');
      console.error('❌ Bulk operation failed:', error);
    },
    ...options
  });
};

/**
 * Hook to fetch food categories for current branch (convenience hook)
 * Uses current branch from environment automatically
 * @param {Object} options - React Query options
 * @returns {Object} Query result with categories for current branch
 */
export const useCurrentBranchFoodCategories = (options = {}) => {
  const currentBranchId = environment.multiTenant.getCurrentBranchId();

  return useFoodCategories(currentBranchId, {
    enabled: !!currentBranchId,
    ...options
  });
};

// ==================== IMAGE UPLOAD MUTATIONS ====================

/**
 * Hook to create food category with image upload
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useCreateFoodCategoryWithImage = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = environment.multiTenant.getCurrentBranchId() || '1';

  return useMutation({
    mutationFn: ({ categoryData, imageFile, branchId }) =>
      foodCategoryService.createFoodCategoryWithImage(categoryData, imageFile, branchId),

    onSuccess: (response, variables) => {
      // Show success message
      message.success(response.message || 'Tạo danh mục với hình ảnh thành công!');

      // Extract the created category from ApiResponseBase
      const createdCategory = response?.data;
      const branchId = variables.branchId || currentBranchId;

      if (createdCategory) {
        // Add to cache optimistically
        queryClient.setQueryData(
          FOOD_CATEGORY_QUERY_KEYS.detail(createdCategory.id, branchId),
          createdCategory
        );
      }

      // Invalidate list queries
      queryClient.invalidateQueries({
        queryKey: FOOD_CATEGORY_QUERY_KEYS.list(branchId)
      });

      console.log('✅ Food category created with image successfully:', createdCategory);
    },

    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Không thể tạo danh mục với hình ảnh!';
      message.error(errorMessage);
      console.error('❌ Failed to create food category with image:', error);
    },
    ...options
  });
};

/**
 * Hook to update food category with image upload
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useUpdateFoodCategoryWithImage = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = environment.multiTenant.getCurrentBranchId() || '1';

  return useMutation({
    mutationFn: ({ categoryId, categoryData, imageFile, branchId }) =>
      foodCategoryService.updateFoodCategoryWithImage(categoryId, categoryData, imageFile, branchId),

    onSuccess: (response, variables) => {
      // Show success message
      message.success(response.message || 'Cập nhật danh mục với hình ảnh thành công!');

      // Extract the updated category from ApiResponseBase
      const updatedCategory = response?.data;
      const { categoryId, branchId } = variables;
      const targetBranchId = branchId || currentBranchId;

      if (updatedCategory) {
        // Update specific category in cache
        queryClient.setQueryData(
          FOOD_CATEGORY_QUERY_KEYS.detail(categoryId, targetBranchId),
          updatedCategory
        );
      }

      // Invalidate list queries
      queryClient.invalidateQueries({
        queryKey: FOOD_CATEGORY_QUERY_KEYS.list(targetBranchId)
      });

      console.log('✅ Food category updated with image successfully:', updatedCategory);
    },

    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật danh mục với hình ảnh!';
      message.error(errorMessage);
      console.error('❌ Failed to update food category with image:', error);
    },
    ...options
  });
};

/**
 * Hook to create food category with Cloudinary URL (no file upload)
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useCreateFoodCategoryWithCloudinary = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = environment.multiTenant.getCurrentBranchId() || '1';

  return useMutation({
    mutationFn: ({ categoryData, branchId }) =>
      foodCategoryService.createFoodCategoryWithCloudinary(categoryData, branchId),

    onSuccess: (response, variables) => {
      // Show success message
      message.success(response.message || 'Tạo danh mục với Cloudinary thành công!');

      // Extract the created category from ApiResponseBase
      const createdCategory = response?.data;
      const branchId = variables.branchId || currentBranchId;

      if (createdCategory) {
        // Add to cache optimistically
        queryClient.setQueryData(
          FOOD_CATEGORY_QUERY_KEYS.detail(createdCategory.id, branchId),
          createdCategory
        );
      }

      // Invalidate list queries
      queryClient.invalidateQueries({
        queryKey: FOOD_CATEGORY_QUERY_KEYS.list(branchId)
      });

      console.log('✅ Food category created with Cloudinary URL successfully:', createdCategory);
    },

    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Không thể tạo danh mục với Cloudinary!';
      message.error(errorMessage);
      console.error('❌ Failed to create food category with Cloudinary URL:', error);
    },
    ...options
  });
};

/**
 * Hook to update food category with Cloudinary URL (no file upload)
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation object
 */
export const useUpdateFoodCategoryWithCloudinary = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = environment.multiTenant.getCurrentBranchId() || '1';

  return useMutation({
    mutationFn: ({ categoryId, categoryData, branchId }) =>
      foodCategoryService.updateFoodCategoryWithCloudinary(categoryId, categoryData, branchId),

    onSuccess: (response, variables) => {
      // Show success message
      message.success(response.message || 'Cập nhật danh mục với Cloudinary thành công!');

      // Extract the updated category from ApiResponseBase
      const updatedCategory = response?.data;
      const { categoryId, branchId } = variables;
      const targetBranchId = branchId || currentBranchId;

      if (updatedCategory) {
        // Update specific category in cache
        queryClient.setQueryData(
          FOOD_CATEGORY_QUERY_KEYS.detail(categoryId, targetBranchId),
          updatedCategory
        );
      }

      // Invalidate list queries
      queryClient.invalidateQueries({
        queryKey: FOOD_CATEGORY_QUERY_KEYS.list(targetBranchId)
      });

      console.log('✅ Food category updated with Cloudinary URL successfully:', updatedCategory);
    },

    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật danh mục với Cloudinary!';
      message.error(errorMessage);
      console.error('❌ Failed to update food category with Cloudinary URL:', error);
    },
    ...options
  });
};

// Export legacy hook for backward compatibility
export { useFoodCategories as useFoodCategoriesLegacy };