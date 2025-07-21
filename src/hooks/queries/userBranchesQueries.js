// useBranches.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchService } from '../../services/branchService';
import environment from '../../config/environment';

// Query keys for branch-related queries
export const BRANCH_KEYS = {
    all: ['branches'],
    lists: () => [...BRANCH_KEYS.all, 'list'],
    details: () => [...BRANCH_KEYS.all, 'detail'],
    current: () => [...BRANCH_KEYS.all, 'current'],
    default: () => [...BRANCH_KEYS.all, 'default'],
    adminSystem: (branchCode) => [...BRANCH_KEYS.all, 'adminSystem', branchCode],
    adminUsers: (branchCode) => [...BRANCH_KEYS.all, 'adminUsers', branchCode],
};

// Export for backward compatibility
export const BRANCH_QUERY_KEYS = BRANCH_KEYS;

/**
 * Hook for fetching all branches
 */
export const useBranches = (options = {}) => {
    const query = useQuery({
        queryKey: BRANCH_KEYS.lists(),
        queryFn: async () => {
            console.log('🔄 useBranches queryFn called');
            const result = await branchService.getAllBranches();
            console.log('🔄 useBranches queryFn result:', result);
            return result;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        ...options,
    });

    console.log('🔄 useBranches hook state:', {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error?.message,
        status: query.status
    });

    return query;
};

/**
 * Hook for fetching the current branch
 */
export const useCurrentBranch = (options = {}) => {
    return useQuery({
        queryKey: BRANCH_KEYS.current(),
        queryFn: () => branchService.getCurrentBranch(),
        staleTime: 30 * 1000, // 30 seconds
        cacheTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: false,
        ...options,
    });
};

/**
 * Hook for fetching the default branch
 */
export const useDefaultBranch = (options = {}) => {
    return useQuery({
        queryKey: BRANCH_KEYS.default(),
        queryFn: () => branchService.getDefaultBranch(),
        staleTime: 30 * 60 * 1000, // 30 minutes
        cacheTime: 60 * 60 * 1000, // 1 hour
        refetchOnWindowFocus: false,
        ...options,
    });
};

/**
 * Hook for fetching admin system user for a branch
 */
export const useAdminSystemUser = (branchCode, options = {}) => {
    return useQuery({
        queryKey: BRANCH_KEYS.adminSystem(branchCode),
        queryFn: () => branchService.getAdminSystemUser(branchCode),
        enabled: !!branchCode, // Only run if branchCode is provided
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
};

/**
 * Hook for fetching admin system users for a branch
 */
export const useAdminSystemUsers = (branchCode, options = {}) => {
    return useQuery({
        queryKey: BRANCH_KEYS.adminUsers(branchCode),
        queryFn: () => branchService.listAdminSystemUsers(branchCode),
        enabled: !!branchCode, // Only run if branchCode is provided
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
};

/**
 * Hook for setting current branch
 */
export const useSetCurrentBranch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (branchId) => branchService.setCurrentBranch(branchId),
        onSuccess: (data, branchId) => {
            // Update current branch cache
            queryClient.setQueryData(BRANCH_KEYS.current(), data);

            // Invalidate queries that depend on branch context
            queryClient.invalidateQueries({ queryKey: ['foods'] });
            queryClient.invalidateQueries({ queryKey: ['foodCategories'] });
            queryClient.invalidateQueries({ queryKey: ['menus'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
        onError: () => {
            // Remove current branch from cache on error
            queryClient.removeQueries({ queryKey: BRANCH_KEYS.current() });
        },
    });
};

/**
 * Hook for switching branch (combines set current branch and get current branch)
 */
export const useSwitchBranch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (branchId) => branchService.switchBranch(branchId),
        onMutate: async (branchId) => {
            // Optimistically update current branch ID in localStorage
            const previousBranchId = localStorage.getItem('currentBranchId');
            return { previousBranchId };
        },
        onSuccess: (branchData, newBranchId) => {
            // Update current branch cache with full branch data
            queryClient.setQueryData(BRANCH_KEYS.current(), branchData);

            // Invalidate all branch-dependent queries with predicate functions
            // This ensures we only invalidate queries for the current context

            // Invalidate foods queries for any branch (since branch is in query key now)
            queryClient.invalidateQueries({
                queryKey: ['foods'],
                predicate: (query) => query.queryKey[0] === 'foods'
            });

            // Invalidate food categories queries
            queryClient.invalidateQueries({
                queryKey: ['foodCategories'],
                predicate: (query) => query.queryKey[0] === 'foodCategories'
            });

            // Invalidate menu queries (these already include branch context)
            queryClient.invalidateQueries({
                queryKey: ['menus'],
                predicate: (query) => query.queryKey[0] === 'menus'
            });

            // Invalidate order queries with branch context
            queryClient.invalidateQueries({
                queryKey: ['orders'],
                predicate: (query) => query.queryKey[0] === 'orders'
            });

            // Also refetch current branch data to ensure UI is updated
            queryClient.invalidateQueries({ queryKey: BRANCH_KEYS.current() });

            if (environment.features.enableLogging) {
                console.log('✅ Branch switched successfully. Invalidated all branch-dependent queries.', {
                    newBranchId,
                    branchName: branchData?.name
                });
            }
        },
        onError: (error, branchId, context) => {
            // Restore previous branch ID on error
            if (context?.previousBranchId) {
                localStorage.setItem('currentBranchId', context.previousBranchId);
            } else {
                localStorage.removeItem('currentBranchId');
            }

            // Remove current branch from cache
            queryClient.removeQueries({ queryKey: BRANCH_KEYS.current() });

            if (environment.features.enableLogging) {
                console.error('❌ Branch switch failed, restored previous branch:', context?.previousBranchId);
            }
        },
    });
};

/**
 * Hook for assigning admin system user
 */
export const useAssignAdminSystem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, branchCode }) =>
            branchService.assignAdminSystem(userId, branchCode),
        onSuccess: (data, { branchCode }) => {
            // Invalidate admin system queries for this branch
            queryClient.invalidateQueries({
                queryKey: BRANCH_KEYS.adminSystem(branchCode)
            });
            queryClient.invalidateQueries({
                queryKey: BRANCH_KEYS.adminUsers(branchCode)
            });
        },
    });
};

/**
 * Hook for secure action (requires orders:add permission)
 */
export const useSecureAction = () => {
    return useMutation({
        mutationFn: () => branchService.secureAction(),
    });
};

/**
 * Hook tạo chi nhánh
 */
export const useCreateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ branchData }) => branchService.createBranch(branchData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANCH_KEYS.lists() });
    },
  });
};

/**
 * Hook cập nhật chi nhánh
 */
export const useUpdateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ branchId, branchData }) =>
      branchService.updateBranch(branchId, branchData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANCH_KEYS.lists() });
    },
  });
};

/**
 * Hook xoá chi nhánh
 */
export const useDeleteBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ branchId }) => branchService.deleteBranch(branchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANCH_KEYS.lists() });
    },
  });
};

// Re-export for backward compatibility with existing components
export { useBranches as default };