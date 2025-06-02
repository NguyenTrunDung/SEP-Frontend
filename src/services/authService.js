import api, { environment } from './api/config';

export const authService = {
    /**
     * Login user with email and password
     * POST /api/auth/login
     */
    async login(credentials) {
        try {
            const response = await api.post('/api/auth/login', {
                email: credentials.email,
                password: credentials.password
            });

            const { token, refreshToken, user } = response.data;

            // Store authentication data
            environment.auth.setToken(token);
            environment.auth.setRefreshToken(refreshToken);

            if (environment.features.enableLogging) {
                console.log('✅ Login successful for user:', user?.email);
            }

            return { token, refreshToken, user };
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Login failed:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    },

    /**
     * Refresh JWT token
     * POST /api/auth/refresh
     */
    async refreshToken() {
        try {
            const refreshToken = environment.auth.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await api.post('/api/auth/refresh', {
                refreshToken
            });

            const { token: newToken } = response.data;
            environment.auth.setToken(newToken);

            if (environment.features.enableLogging) {
                console.log('✅ Token refreshed successfully');
            }

            return response.data;
        } catch (error) {
            // If refresh fails, clear all auth data
            this.logout();
            throw error;
        }
    },

    /**
     * Logout user
     * POST /api/auth/logout
     */
    async logout() {
        try {
            // Call logout endpoint if token exists
            const token = environment.auth.getToken();
            if (token) {
                await api.post('/api/auth/logout');
            }
        } catch (error) {
            // Continue with logout even if API call fails
            console.warn('Logout API call failed, but continuing with local cleanup');
        } finally {
            // Always clear local storage
            environment.auth.removeToken();
            environment.auth.removeRefreshToken();
            environment.multiTenant.removeCurrentBranchId();

            if (environment.features.enableLogging) {
                console.log('✅ Logout completed');
            }
        }
    },

    /**
     * Get current user information
     */
    async getCurrentUser() {
        try {
            const response = await api.get('/api/auth/me');
            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to get current user:', error.message);
            }
            throw error;
        }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = environment.auth.getToken();
        return !!token;
    },

    /**
     * Change user password
     * POST /api/auth/change-password
     */
    async changePassword(passwordData) {
        try {
            const response = await api.post('/api/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (environment.features.enableLogging) {
                console.log('✅ Password changed successfully');
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Password change failed:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    }
}; 