
import { useQuery } from '@tanstack/react-query';
import { foodCategoryService } from '../../services/foodCategoryService';

export const useFoodCategories = (branchId = '1') => {
  const query = useQuery({
    queryKey: ['foodCategories', branchId],
    queryFn: () => foodCategoryService.getFoodCategories(branchId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
};