import { useQuery } from '@tanstack/react-query';
import { foodCategoryService } from '../../services/foodCategoryService';
import environment from '../../config/environment';

/**
 * React Query hook for fetching food categories
 * 
 * Uses current branch context in query key for proper cache isolation
 * API interceptor handles branch context in headers
 * 
 * @returns {Object} Query result with categories, loading state, and error
 */
export const useFoodCategories = () => {
  // Get current branch ID for query key isolation
  const currentBranchId = environment.multiTenant.getCurrentBranchId();

  const query = useQuery({
    queryKey: ['foodCategories', { branchId: currentBranchId }], // Branch-specific cache
    queryFn: () => foodCategoryService.getFoodCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!currentBranchId, // Only run if branch ID is available
  });

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
};