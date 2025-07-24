import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { environment } from '../../services/api/config';
import { menuService } from '../../services/menuService';
import { getFilteredMenus, mockMenus, mockFoodCategories } from '../../mocks/menuData';

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

    // Check if API returned empty or no data
    if (!menuData || !menuData.foods?.length || !menuData.categories?.length) {
      if (environment.features.enableLogging) {
        console.warn('⚠️ API returned empty or no data, falling back to mock data');
      }
      throw new Error('Empty API response');
    }

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
      console.warn('⚠️ API request failed or returned empty, using mock data:', error.message);
    }

    // Fallback to mock data
    try {
      const mockData = await getFilteredMenus(filters);

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

      if (environment.features.enableLogging) {
        console.log('📋 Using mock menu data:', {
          foods: mockData.length,
          categories: mockFoodCategories.length, // Sửa từ mockMenus thành mockFoodCategories
          date: filters.date
        });
      }

      return {
        foods: transformedMockData,
        categories: mockFoodCategories.map(category => ({
          id: category.ID,
          name: category.Name,
          imageUrl: category.Image
        })),
        foodsTotalCount: transformedMockData.length,
        categoriesTotalCount: mockFoodCategories.length,
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
 * Now automatically refetches menu list data on success with optimistic updates
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
    // Optimistic update - show menu immediately while API call is in progress
    onMutate: async (newMenuData) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: MENU_KEYS.lists() });

      // Snapshot the previous menu list
      const previousMenus = queryClient.getQueryData(MENU_KEYS.lists());

      // Optimistically add the new menu to the list
      if (previousMenus) {
        const optimisticMenu = {
          id: Date.now(), // Temporary ID
          name: newMenuData.name || `Menu ${new Date().toLocaleDateString('vi-VN')}`,
          date: newMenuData.date,
          isTime: newMenuData.isTime || false,
          timeFrom: newMenuData.timeFrom,
          timeTo: newMenuData.timeTo,
          timeOfDay: newMenuData.timeOfDay,
          branchId: newMenuData.branchId || currentBranchId,
          details: newMenuData.details || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Mark as optimistic for potential rollback
          _isOptimistic: true
        };

        queryClient.setQueryData(MENU_KEYS.lists(), [optimisticMenu, ...previousMenus]);

        if (environment.features.enableLogging) {
          console.log('⚡ Optimistic update: Added menu to list immediately');
        }
      }

      // Return context object with the snapshot
      return { previousMenus };
    },
    onSuccess: (data, variables, context) => {
      if (environment.features.enableLogging) {
        console.log('✅ Menu created successfully:', data);
        console.log('🔄 Invalidating menu queries for automatic refetch...');
      }

      // Immediately invalidate and refetch menu list data to get real server data
      queryClient.invalidateQueries({
        queryKey: MENU_KEYS.lists()
      });

      // Invalidate date-specific menu queries if date is provided
      const menuDate = variables.date;
      const branchId = variables.branchId || currentBranchId;

      if (menuDate) {
        // Invalidate public menu queries for the specific date
        queryClient.invalidateQueries({
          queryKey: MENU_KEYS.byDate(menuDate, branchId)
        });

        // Invalidate menu categories for the specific date
        queryClient.invalidateQueries({
          queryKey: MENU_KEYS.categories(menuDate, branchId)
        });

        if (environment.features.enableLogging) {
          console.log(`🔄 Invalidated date-specific queries for ${menuDate}`);
        }
      }

      // Invalidate all menu queries for current branch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: [...MENU_KEYS.all, 'byDate'],
        predicate: (query) => {
          const [, , , queryBranchId] = query.queryKey;
          return queryBranchId === branchId;
        }
      });

      // Optional: Prefetch the updated menu list for better UX
      queryClient.prefetchQuery({
        queryKey: MENU_KEYS.lists(),
        queryFn: () => menuService.getMenuList(),
        staleTime: 30 * 1000, // 30 seconds
      });

      if (environment.features.enableLogging) {
        console.log('✅ Menu list queries invalidated and prefetched successfully');
      }
    },
    // If the mutation fails, rollback the optimistic update
    onError: (error, variables, context) => {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to create menu:', error);
        console.log('🔄 Rolling back optimistic update...');
      }

      // Rollback to the previous menu list
      if (context?.previousMenus) {
        queryClient.setQueryData(MENU_KEYS.lists(), context.previousMenus);

        if (environment.features.enableLogging) {
          console.log('✅ Optimistic update rolled back');
        }
      }
    },
    // Always refetch after error or success to ensure data consistency
    onSettled: () => {
      // Ensure we have the latest data regardless of success or failure
      queryClient.invalidateQueries({ queryKey: MENU_KEYS.lists() });
    }
  });
};

/**
 * Hook for updating an existing menu
 * Now fully functional with real API integration
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

      // Call the real updateMenu service method
      return menuService.updateMenu(menuId, menuData);
    },
    onSuccess: (data, { menuId, menuData }) => {
      if (environment.features.enableLogging) {
        console.log('✅ Menu updated successfully:', data);
        console.log('🔄 Invalidating menu queries for automatic refetch...');
      }

      // Instead of directly updating cache, invalidate to force fresh fetch
      // This prevents data structure mismatches between update response and getMenu response
      queryClient.invalidateQueries({
        queryKey: MENU_KEYS.details(menuId)
      });

      // Immediately invalidate and refetch menu list data
      queryClient.invalidateQueries({
        queryKey: MENU_KEYS.lists()
      });

      // Invalidate related date-specific queries
      const menuDate = menuData.date;
      const branchId = menuData.branchId || currentBranchId;

      if (menuDate) {
        queryClient.invalidateQueries({
          queryKey: MENU_KEYS.byDate(menuDate, branchId)
        });

        queryClient.invalidateQueries({
          queryKey: MENU_KEYS.categories(menuDate, branchId)
        });
      }

      // Prefetch updated menu list and specific menu for immediate availability
      queryClient.prefetchQuery({
        queryKey: MENU_KEYS.lists(),
        queryFn: () => menuService.getMenuList(),
        staleTime: 30 * 1000,
      });

      // Prefetch the updated menu details for smooth ViewModal experience
      queryClient.prefetchQuery({
        queryKey: MENU_KEYS.details(menuId),
        queryFn: () => menuService.getMenu(menuId),
        staleTime: 30 * 1000,
      });

      if (environment.features.enableLogging) {
        console.log('✅ Menu queries invalidated and prefetched after update');
      }
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
 * Now fully functional with real API integration
 */
export const useDeleteMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (menuId) => {
      if (environment.features.enableLogging) {
        console.log('🗑️ Deleting menu:', menuId);
      }

      // Call the real deleteMenu service method
      return menuService.deleteMenu(menuId);
    },
    onSuccess: (data, menuId) => {
      if (environment.features.enableLogging) {
        console.log('✅ Menu deleted successfully:', menuId);
        console.log('🔄 Invalidating menu queries for automatic refetch...');
      }

      // Remove the specific menu from cache
      queryClient.removeQueries({
        queryKey: MENU_KEYS.details(menuId)
      });

      // Immediately invalidate and refetch menu list data
      queryClient.invalidateQueries({
        queryKey: MENU_KEYS.lists()
      });

      // Invalidate all menu-related queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: MENU_KEYS.all
      });

      // Prefetch updated menu list
      queryClient.prefetchQuery({
        queryKey: MENU_KEYS.lists(),
        queryFn: () => menuService.getMenuList(),
        staleTime: 30 * 1000,
      });

      if (environment.features.enableLogging) {
        console.log('✅ Menu list queries invalidated and prefetched after deletion');
      }
    },
    onError: (error) => {
      if (environment.features.enableLogging) {
        console.error('❌ Failed to delete menu:', error);
      }
    }
  });
};

/**
 * Hook for fetching all menus with details for the current branch
 * Uses automatic branch context resolution (no manual branchId required)
 */
export const useMenuList = (options = {}) => {
  return useQuery({
    queryKey: MENU_KEYS.lists(),
    queryFn: () => menuService.getMenuList(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    ...options,
  });
};



/**
 * Hook for fetching menu dates from the past 2 weeks for template selection
 * @param {Object} options - React Query options
 * @returns {Object} Query result with available menu dates
 */
export function useAvailableMenuDatesForTemplate(options = {}) {
  return useQuery({
    queryKey: [...MENU_KEYS.all, 'availableDatesForTemplate'],
    queryFn: () => menuService.getAvailableMenuDatesForTemplate(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    ...options,
  });
}

export function useMenuDates(options = {}) {
  return useQuery({
    queryKey: ['menuDates'],
    queryFn: () => menuService.getMenuDates(),
    ...options,
  });
}

// Export the service function for direct use if needed
export { fetchMenuByDate, menuService };