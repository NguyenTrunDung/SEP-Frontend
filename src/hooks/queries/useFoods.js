import { useQuery } from '@tanstack/react-query';
import { foodService } from '../../services/foodService';

export const useFoods = (branchId = '1') => {
  const query = useQuery({
    queryKey: ['foods', branchId],
    queryFn: () => foodService.getFoods(branchId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    foods: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
};