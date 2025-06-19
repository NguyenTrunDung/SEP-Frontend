// usePublicBranches.js - For guest/public interfaces
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicBranchService } from '../../services/publicBranchService';

// Separate query keys for public context
export const PUBLIC_BRANCH_KEYS = {
    all: ['public', 'branches'],
    list: () => [...PUBLIC_BRANCH_KEYS.all, 'list'],
    current: () => [...PUBLIC_BRANCH_KEYS.all, 'current'],
    default: () => [...PUBLIC_BRANCH_KEYS.all, 'default']
};

/**
 * Hook for fetching all branches in public/guest context
 * Uses public endpoints without authentication
 */
export const usePublicBranches = (options = {}) => {
    const query = useQuery({
        queryKey: PUBLIC_BRANCH_KEYS.list(),
        queryFn: async () => {
            console.log('🔄 usePublicBranches queryFn called');
            const result = await publicBranchService.getAllBranches();
            console.log('🔄 usePublicBranches queryFn result:', result);
            return result;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes (longer for public data)
        cacheTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        ...options,
    });

    console.log('🔄 usePublicBranches hook state:', {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error?.message,
        status: query.status
    });

    return query;
};

/**
 * Hook for getting current branch in public context
 * Uses localStorage or default branch
 */
export const usePublicCurrentBranch = (options = {}) => {
    return useQuery({
        queryKey: PUBLIC_BRANCH_KEYS.current(),
        queryFn: () => publicBranchService.getCurrentBranch(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
        ...options,
    });
};

/**
 * Hook for switching branch in public context
 * Only updates local storage, no authentication required
 */
export const usePublicSwitchBranch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (branchId) => publicBranchService.setCurrentBranch(branchId),
        onSuccess: (data, branchId) => {
            // Invalidate public current branch query
            queryClient.invalidateQueries({
                queryKey: PUBLIC_BRANCH_KEYS.current()
            });

            // Invalidate public menu queries that depend on branch
            queryClient.invalidateQueries({
                queryKey: ['public', 'menus']
            });

            console.log('✅ Public branch switched successfully:', branchId);
        },
        onError: (error) => {
            console.error('❌ Failed to switch public branch:', error);
        }
    });
};

/**
 * Hook for fetching default branch in public context
 */
export const usePublicDefaultBranch = (options = {}) => {
    return useQuery({
        queryKey: PUBLIC_BRANCH_KEYS.default(),
        queryFn: () => publicBranchService.getDefaultBranch(),
        staleTime: 60 * 60 * 1000, // 1 hour (rarely changes)
        cacheTime: 2 * 60 * 60 * 1000, // 2 hours
        refetchOnWindowFocus: false,
        ...options,
    });
}; 