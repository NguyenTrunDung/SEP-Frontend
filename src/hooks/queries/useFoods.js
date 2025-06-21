import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { foodService } from '../../services/foodService';
import environment from '../../config/environment';
import { message } from 'antd';

// Query Keys with branch context
export const FOOD_QUERY_KEYS = {
  all: ['foods'],
  lists: () => [...FOOD_QUERY_KEYS.all, 'list'],
  list: (branchId) => [...FOOD_QUERY_KEYS.lists(), { branchId }],
  details: () => [...FOOD_QUERY_KEYS.all, 'detail'],
  detail: (id, branchId) => [...FOOD_QUERY_KEYS.details(), { id, branchId }],
};

/**
 * React Query hook for fetching foods
 * 
 * Uses current branch context in query key for proper cache isolation
 * API interceptor handles branch context in headers
 * 
 * @returns {Object} Query result with foods, loading state, and error
 */
export const useFoods = () => {
  // Get current branch ID for query key isolation
  const currentBranchId = environment.multiTenant.getCurrentBranchId();

  const query = useQuery({
    queryKey: FOOD_QUERY_KEYS.list(currentBranchId), // Branch-specific cache
    queryFn: () => foodService.getFoods(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!currentBranchId, // Only run if branch ID is available
  });

  return {
    foods: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * React Query hook for fetching a specific food by ID
 * 
 * @param {string|number} foodId - The food ID to fetch
 * @param {Object} options - Additional query options
 * @returns {Object} Query result with food data, loading state, and error
 */
export const useFood = (foodId, options = {}) => {
  const currentBranchId = environment.multiTenant.getCurrentBranchId();

  const query = useQuery({
    queryKey: FOOD_QUERY_KEYS.detail(foodId, currentBranchId),
    queryFn: () => foodService.getFood(foodId),
    enabled: !!(foodId && currentBranchId),
    staleTime: 5 * 60 * 1000,
    ...options,
  });

  return {
    food: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * React Query mutation hook for creating a new food (basic DTO)
 * 
 * @returns {Object} Mutation object with mutate function and states
 */
export const useCreateFood = () => {
  const queryClient = useQueryClient();
  const currentBranchId = environment.multiTenant.getCurrentBranchId();

  return useMutation({
    mutationFn: (foodData) => foodService.createFood(foodData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch foods list for current branch
      queryClient.invalidateQueries({
        queryKey: FOOD_QUERY_KEYS.list(currentBranchId)
      });

      message.success('Tạo món ăn thành công!');
    },
    onError: (error) => {
      console.error('❌ Failed to create food:', error);
      message.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo món ăn!');
    },
  });
};

/**
 * React Query mutation hook for creating a new food with image upload
 * 
 * @returns {Object} Mutation object with mutate function and states
 */
export const useCreateFoodWithImage = () => {
  const queryClient = useQueryClient();
  const currentBranchId = environment.multiTenant.getCurrentBranchId();

  return useMutation({
    mutationFn: ({ foodData, imageFile }) => foodService.createFoodWithImage(foodData, imageFile),
    onSuccess: (data, variables) => {
      // Invalidate and refetch foods list for current branch
      queryClient.invalidateQueries({
        queryKey: FOOD_QUERY_KEYS.list(currentBranchId)
      });

      message.success('Tạo món ăn thành công!');
    },
    onError: (error) => {
      console.error('❌ Failed to create food with image:', error);
      message.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo món ăn!');
    },
  });
};

/**
 * React Query mutation hook for updating an existing food (basic DTO)
 * 
 * @returns {Object} Mutation object with mutate function and states
 */
export const useUpdateFood = () => {
  const queryClient = useQueryClient();
  const currentBranchId = environment.multiTenant.getCurrentBranchId();

  return useMutation({
    mutationFn: ({ id, foodData }) => foodService.updateFood(id, foodData),
    onSuccess: (data, variables) => {
      // Update specific food in cache if it exists
      if (data && variables.id) {
        queryClient.setQueryData(
          FOOD_QUERY_KEYS.detail(variables.id, currentBranchId),
          data
        );
      }

      // Invalidate and refetch foods list for current branch
      queryClient.invalidateQueries({
        queryKey: FOOD_QUERY_KEYS.list(currentBranchId)
      });

      message.success('Cập nhật món ăn thành công!');
    },
    onError: (error) => {
      console.error('❌ Failed to update food:', error);
      message.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật món ăn!');
    },
  });
};

/**
 * React Query mutation hook for updating an existing food with image upload
 * 
 * @returns {Object} Mutation object with mutate function and states
 */
export const useUpdateFoodWithImage = () => {
  const queryClient = useQueryClient();
  const currentBranchId = environment.multiTenant.getCurrentBranchId();

  return useMutation({
    mutationFn: ({ id, foodData, imageFile }) => foodService.updateFoodWithImage(id, foodData, imageFile),
    onSuccess: (data, variables) => {
      // Update specific food in cache if it exists
      if (data && variables.id) {
        queryClient.setQueryData(
          FOOD_QUERY_KEYS.detail(variables.id, currentBranchId),
          data
        );
      }

      // Invalidate and refetch foods list for current branch
      queryClient.invalidateQueries({
        queryKey: FOOD_QUERY_KEYS.list(currentBranchId)
      });

      message.success('Cập nhật món ăn thành công!');
    },
    onError: (error) => {
      console.error('❌ Failed to update food with image:', error);
      message.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật món ăn!');
    },
  });
};

/**
 * React Query mutation hook for deleting a food
 * 
 * @returns {Object} Mutation object with mutate function and states
 */
export const useDeleteFood = () => {
  const queryClient = useQueryClient();
  const currentBranchId = environment.multiTenant.getCurrentBranchId();

  return useMutation({
    mutationFn: (foodId) => foodService.deleteFood(foodId),
    onMutate: async (foodId) => {
      // Cancel any outgoing refetches for foods list
      await queryClient.cancelQueries({
        queryKey: FOOD_QUERY_KEYS.list(currentBranchId)
      });

      // Snapshot the previous value
      const previousFoods = queryClient.getQueryData(FOOD_QUERY_KEYS.list(currentBranchId));

      // Optimistically remove the food from cache
      if (previousFoods) {
        queryClient.setQueryData(
          FOOD_QUERY_KEYS.list(currentBranchId),
          previousFoods.filter(food => food.id !== foodId)
        );
      }

      // Return a context object with the snapshot
      return { previousFoods };
    },
    onSuccess: (data, foodId) => {
      // Remove specific food from detail cache
      queryClient.removeQueries({
        queryKey: FOOD_QUERY_KEYS.detail(foodId, currentBranchId)
      });

      // Invalidate foods list to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: FOOD_QUERY_KEYS.list(currentBranchId)
      });

      message.success('Đã xóa món ăn thành công!');
    },
    onError: (error, foodId, context) => {
      // If mutation fails, rollback to the previous value
      if (context?.previousFoods) {
        queryClient.setQueryData(
          FOOD_QUERY_KEYS.list(currentBranchId),
          context.previousFoods
        );
      }

      console.error('❌ Failed to delete food:', error);
      message.error(error.response?.data?.message || error.message || 'Không thể xóa món ăn!');
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is correct
      queryClient.invalidateQueries({
        queryKey: FOOD_QUERY_KEYS.list(currentBranchId)
      });
    },
  });
};

/**
 * React Query hook for fetching foods by specific branch ID
 * 
 * @param {string|number} branchId - The branch ID to fetch foods for
 * @param {Object} options - Additional query options
 * @returns {Object} Query result with foods, loading state, and error
 */
export const useFoodsByBranch = (branchId, options = {}) => {
  const query = useQuery({
    queryKey: FOOD_QUERY_KEYS.list(branchId),
    queryFn: () => foodService.getFoodsByBranch(branchId),
    enabled: !!branchId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });

  return {
    foods: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};