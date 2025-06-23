import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { environment } from '../../services/api/config';
import { menuService } from '../../services/menuService';
import { getFilteredMenus } from '../../mocks/menuData';

// Query keys for menu-related queries
export const MENU_KEYS = {
  all: ['menus'],
  lists: () => [...MENU_KEYS.all, 'list'],
  byDate: (date, branchId) => [...MENU_KEYS.all, 'byDate', date, branchId],
  categories: (date, branchId) => [...MENU_KEYS.all, 'categories', date, branchId],
  details: (id) => [...MENU_KEYS.all, 'details', id],
};

/**
 * Service function to fetch menu by date
 */
const fetchMenuByDate = async (filters = {}) => {
  try {
    const response = await api.get(environment.api.endpoints.publicMenus.menuByDate, {
      params: filters
    });

    // Extract the actual data from the API response structure
    const menuData = response.data?.data || null;

    if (environment.features.enableLogging) {
      console.log('✅ Fetched menu from API:', {
        foods: menuData?.foods?.length || 0,
        categories: menuData?.categories?.length || 0,
        date: filters.date,
        branchId: filters.branchId
      });
    }

    return {
      foods: menuData?.foods || [],
      categories: menuData?.categories || [],
      foodsTotalCount: menuData?.foodsTotalCount || 0,
      categoriesTotalCount: menuData?.categoriesTotalCount || 0,
      isUsingMockData: false
    };
  } catch (error) {
    if (environment.features.enableLogging) {
      console.warn('⚠️ API request failed, falling back to mock data:', error.message);
    }

    // Fallback to mock data on API failure
    try {
      const mockData = getFilteredMenus(filters);

      if (environment.features.enableLogging) {
        console.log('📋 Using mock menu data:', mockData?.length, 'items');
      }

      // Transform mock data to match API structure
      const transformedMockData = mockData.map(item => ({
        id: item.ID,
        name: item.dishName,
        description: item.description,
        categoryId: item.categoryId,
        category: item.category,
        imageUrl: item.image,
        isSetDish: false,
        isAddOn: false,
        priceForGuest: item.price,
        priceForPatient: item.price,
        priceForStaff: item.price,
        sort: item.ID
      }));

      return {
        foods: transformedMockData,
        categories: [], // Mock categories would need to be extracted separately
        foodsTotalCount: transformedMockData.length,
        categoriesTotalCount: 0,
        isUsingMockData: true
      };
    } catch (mockError) {
      if (environment.features.enableLogging) {
        console.error('❌ Both API and mock data failed:', mockError.message);
      }
      throw new Error('Failed to fetch menus and load offline data.');
    }
  }
};

/**
 * Hook for fetching menu data by date with branch context
 */
export const useMenus = (filters = {}, options = {}) => {
  // Get current branch ID from localStorage (set by branch selection)
  const currentBranchId = environment.multiTenant.getCurrentBranchId();

  // Build query filters with branch context
  const queryFilters = {
    ...filters,
    // Add branch ID if not explicitly provided and one is selected
    ...(currentBranchId && !filters.branchId && { branchId: currentBranchId })
  };

  return useQuery({
    queryKey: MENU_KEYS.byDate(queryFilters.date, queryFilters.branchId),
    queryFn: () => fetchMenuByDate(queryFilters),
    enabled: !!queryFilters.date, // Only run if date is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    // Retry once on failure before falling back to mock data
    retry: 1,
    retryDelay: 1000,
    ...options,
  });
};

/**
 * Hook for fetching menu categories by date
 */
export const useMenuCategories = (filters = {}, options = {}) => {
  const currentBranchId = environment.multiTenant.getCurrentBranchId();

  const queryFilters = {
    ...filters,
    ...(currentBranchId && !filters.branchId && { branchId: currentBranchId })
  };

  return useQuery({
    queryKey: MENU_KEYS.categories(queryFilters.date, queryFilters.branchId),
    queryFn: async () => {
      const menuData = await fetchMenuByDate(queryFilters);
      return {
        categories: menuData.categories,
        totalCount: menuData.categoriesTotalCount,
        isUsingMockData: menuData.isUsingMockData
      };
    },
    enabled: !!queryFilters.date,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
};

/**
 * Hook for fetching foods by category and date
 */
export const useMenuFoods = (filters = {}, options = {}) => {
  const currentBranchId = environment.multiTenant.getCurrentBranchId();

  const queryFilters = {
    ...filters,
    ...(currentBranchId && !filters.branchId && { branchId: currentBranchId })
  };

  return useQuery({
    queryKey: [...MENU_KEYS.byDate(queryFilters.date, queryFilters.branchId), 'foods', queryFilters.categoryId],
    queryFn: async () => {
      const menuData = await fetchMenuByDate(queryFilters);

      // Filter foods by category if specified
      let foods = menuData.foods;
      if (queryFilters.categoryId) {
        foods = foods.filter(food => food.categoryId === queryFilters.categoryId);
      }

      return {
        foods,
        totalCount: foods.length,
        isUsingMockData: menuData.isUsingMockData
      };
    },
    enabled: !!queryFilters.date,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
};

/**
 * Hook for fetching a specific menu by ID
 */
export const useMenu = (menuId, options = {}) => {
  return useQuery({
    queryKey: MENU_KEYS.details(menuId),
    queryFn: () => menuService.getMenu(menuId),
    enabled: !!menuId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    ...options,
  });
};

/**
 * Hook for creating a new menu
 * Success only - no automatic cache invalidation since we're not using table data
 */
export const useCreateMenu = () => {
  const queryClient = useQueryClient();
  const currentBranchId = environment.multiTenant.getCurrentBranchId();

  return useMutation({
    mutationFn: (menuData) => {
      // Validate data before submission
      const validation = menuService.validateMenuData(menuData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      if (environment.features.enableLogging) {
        console.log('🚀 Creating menu with data:', menuData);
      }

      return menuService.createMenu(menuData);
    },
    onSuccess: (data, variables) => {
      if (environment.features.enableLogging) {
        console.log('✅ Menu created successfully:', data);
      }

      // No automatic cache invalidation - we're not using table data yet
      // When table functionality is needed, uncomment the invalidation code below:

      /*
      // Invalidate and refetch related menu queries
      const menuDate = variables.date;
      const branchId = variables.branchId || currentBranchId;

      // Invalidate menu lists
      queryClient.invalidateQueries({
        queryKey: MENU_KEYS.lists()
      });

      // Invalidate date-specific menu queries
      if (menuDate) {
        queryClient.invalidateQueries({
          queryKey: MENU_KEYS.byDate(menuDate, branchId)
        });

        queryClient.invalidateQueries({
          queryKey: MENU_KEYS.categories(menuDate, branchId)
        });
      }

      // Invalidate all menu queries for current branch
      queryClient.invalidateQueries({
        queryKey: [...MENU_KEYS.all, 'byDate'],
        predicate: (query) => {
          const [, , , queryBranchId] = query.queryKey;
          return queryBranchId === branchId;
        }
      });
      */
    },
    onError: (error) => {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to create menu:', error);
      }
    }
  });
};

/**
 * Hook for updating an existing menu
 */
export const useUpdateMenu = () => {
  const queryClient = useQueryClient();
  const currentBranchId = environment.multiTenant.getCurrentBranchId();

  return useMutation({
    mutationFn: ({ menuId, menuData }) => {
      // Validate data before submission
      const validation = menuService.validateMenuData(menuData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      if (environment.features.enableLogging) {
        console.log('🔄 Updating menu:', menuId, 'with data:', menuData);
      }

      // For now, we'll need to implement updateMenu in the service
      // This is a placeholder that could be extended when the update endpoint is available
      throw new Error('Update menu functionality not yet implemented in backend');
    },
    onSuccess: (data, { menuId, menuData }) => {
      if (environment.features.enableLogging) {
        console.log('✅ Menu updated successfully:', data);
      }

      // Update the specific menu in cache
      queryClient.setQueryData(MENU_KEYS.details(menuId), data);

      // Invalidate related queries
      const menuDate = menuData.date;
      const branchId = menuData.branchId || currentBranchId;

      queryClient.invalidateQueries({
        queryKey: MENU_KEYS.byDate(menuDate, branchId)
      });
    },
    onError: (error) => {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to update menu:', error);
      }
    }
  });
};

/**
 * Hook for deleting a menu
 */
export const useDeleteMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (menuId) => {
      if (environment.features.enableLogging) {
        console.log('🗑️ Deleting menu:', menuId);
      }

      // For now, we'll need to implement deleteMenu in the service
      // This is a placeholder that could be extended when the delete endpoint is available
      throw new Error('Delete menu functionality not yet implemented in backend');
    },
    onSuccess: (data, menuId) => {
      if (environment.features.enableLogging) {
        console.log('✅ Menu deleted successfully:', menuId);
      }

      // Remove the specific menu from cache
      queryClient.removeQueries({
        queryKey: MENU_KEYS.details(menuId)
      });

      // Invalidate menu lists
      queryClient.invalidateQueries({
        queryKey: MENU_KEYS.lists()
      });

      // Invalidate all menu queries
      queryClient.invalidateQueries({
        queryKey: MENU_KEYS.all
      });
    },
    onError: (error) => {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to delete menu:', error);
      }
    }
  });
};

// Export the service function for direct use if needed
export { fetchMenuByDate, menuService };