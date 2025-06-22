// src/lib/reactQuery.js
import { QueryClient } from '@tanstack/react-query';
import { handleBranchPermissionError, isBranchPermissionError } from '../utils/branchPermissions';
import environment from '../config/environment';

// Global error handler for all React Query operations
const handleGlobalQueryError = async (error, query) => {
    // Log error for debugging
    if (environment.features.enableLogging) {
        console.error('🔥 React Query Error:', error);
    }

    // Handle branch permission errors globally
    if (isBranchPermissionError(error)) {
        // Extract branch ID from query key if available
        const branchId = extractBranchIdFromQuery(query);
        const handled = await handleBranchPermissionError(error, branchId);

        if (handled) {
            console.log('✅ Branch permission error handled globally');
            return;
        }
    }

    // Handle other global errors here if needed
    // For example: network errors, server errors, etc.
};

// Helper function to extract branch ID from query key
const extractBranchIdFromQuery = (query) => {
    try {
        if (query?.queryKey) {
            // Look for branch ID in query key structure
            const branchParam = query.queryKey.find(key =>
                key && typeof key === 'object' && key.branchId
            );
            return branchParam?.branchId || environment.multiTenant.getCurrentBranchId();
        }
    } catch (error) {
        console.warn('Could not extract branch ID from query:', error);
    }
    return environment.multiTenant.getCurrentBranchId();
};

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
                // Don't retry branch permission errors
                if (isBranchPermissionError(error)) {
                    return false;
                }
                // Limit retries for other errors
                return failureCount < (environment.app.isDevelopment ? 1 : 3);
            },
            staleTime: environment.performance.queryStaleTime,
            cacheTime: environment.performance.queryCacheTime,

            // Global error handler for all queries
            onError: handleGlobalQueryError,
        },
        mutations: {
            retry: (failureCount, error) => {
                // Don't retry branch permission errors
                if (isBranchPermissionError(error)) {
                    return false;
                }
                return failureCount < 1;
            },

            // Global error handler for all mutations
            onError: handleGlobalQueryError,
        }
    },
});

// Set global defaults for all queries
queryClient.setQueryDefaults(['*'], {
    onError: handleGlobalQueryError,
});

// Set global defaults for all mutations
queryClient.setMutationDefaults({
    onError: handleGlobalQueryError,
});