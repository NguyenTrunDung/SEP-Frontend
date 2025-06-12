import api, { environment } from '../api/config';

/**
 * Template for creating services with centralized endpoint management
 * 
 * Benefits of this approach:
 * 1. Dynamic API versioning
 * 2. Centralized endpoint management
 * 3. Environment-specific configurations
 * 4. Consistent error handling
 * 5. Centralized logging
 */

export const exampleService = {
    /**
     * Example of using static endpoints
     */
    async getItems() {
        try {
            // ✅ Good: Uses centralized endpoint
            const response = await api.get(environment.api.endpoints.foods);

            // ❌ Bad: Hard-coded endpoint
            // const response = await api.get('/api/v1/foods');

            if (environment.features.enableLogging) {
                console.log('✅ Fetched items:', response.data?.length);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch items:', error.message);
            }
            throw error;
        }
    },

    /**
     * Example of using dynamic endpoints with parameters
     */
    async getItemById(itemId) {
        try {
            // ✅ Good: Build endpoint dynamically
            const endpoint = `${environment.api.endpoints.foods}/${itemId}`;
            const response = await api.get(endpoint);

            // Alternative: You could add this to environment.js endpoints
            // const response = await api.get(environment.api.endpoints.food.detail(itemId));

            return response.data;
        } catch (error) {
            console.error('❌ Failed to fetch item:', error.message);
            throw error;
        }
    },

    /**
     * Example of POST request with centralized endpoint
     */
    async createItem(itemData) {
        try {
            const response = await api.post(environment.api.endpoints.foods, itemData);

            if (environment.features.enableLogging) {
                console.log('✅ Created item:', response.data?.id);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to create item:', error.message);
            }
            throw error;
        }
    }
};

/**
 * BEST PRACTICES FOR SERVICE CREATION:
 * 
 * 1. Always import environment from api/config
 * 2. Use environment.api.endpoints instead of hard-coded URLs
 * 3. Add logging using environment.features.enableLogging
 * 4. Handle errors consistently
 * 5. Document each method with JSDoc
 * 6. Use try-catch for all async operations
 * 
 * ENDPOINT MANAGEMENT:
 * 
 * Static endpoints:
 * - environment.api.endpoints.foods
 * - environment.api.endpoints.users
 * 
 * Dynamic endpoints (add to environment.js):
 * - environment.api.endpoints.food.detail(id)
 * - environment.api.endpoints.user.profile(userId)
 * 
 * Version changes:
 * - Change REACT_APP_API_VERSION=v2 in .env
 * - All endpoints automatically update to /api/v2/*
 */ 