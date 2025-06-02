// src/lib/reactQuery.js
import { QueryClient } from '@tanstack/react-query';
import environment from '../config/environment';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: environment.app.isDevelopment ? 1 : 3,
            staleTime: environment.performance.queryStaleTime,
            cacheTime: environment.performance.queryCacheTime,

            // Enable more detailed error logging in development
            onError: (error) => {
                if (environment.features.enableLogging) {
                    console.error('🔥 React Query Error:', error);
                }
            },
        },
        mutations: {
            retry: 1,

            // Log mutation errors
            onError: (error) => {
                if (environment.features.enableLogging) {
                    console.error('🔥 React Query Mutation Error:', error);
                }
            },
        }
    },
});

// Add global error handler for React Query
if (environment.features.enableLogging && environment.app.isDevelopment) {
    queryClient.setQueryDefaults(['*'], {
        onError: (error) => {
            console.error('🔥 Global Query Error:', error);
        }
    });
}