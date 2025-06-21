import { useQuery } from '@tanstack/react-query';
import { foodService } from '../../services/foodService';
import environment from '../../config/environment';

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
    queryKey: ['foods', { branchId: currentBranchId }], // Branch-specific cache
    queryFn: () => foodService.getFoods(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!currentBranchId, // Only run if branch ID is available
  });

  return {
    foods: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
};