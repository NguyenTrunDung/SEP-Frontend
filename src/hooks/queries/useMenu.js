import { useQuery } from '@tanstack/react-query';
import api, { environment } from '../../services/api/config';
import { getFilteredMenus } from '../../mocks/menuData';

// Query keys for menu-related queries
export const MENU_KEYS = {
  all: ['menus'],
  lists: () => [...MENU_KEYS.all, 'list'],
  byDate: (date, branchId) => [...MENU_KEYS.all, 'byDate', date, branchId],
  categories: (date, branchId) => [...MENU_KEYS.all, 'categories', date, branchId],
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

// Export the service function for direct use if needed
export { fetchMenuByDate };