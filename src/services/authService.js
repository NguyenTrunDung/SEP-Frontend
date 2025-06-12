import api, { environment } from './api/config';

export const authService = {
    /**
     * Login user with email and password
     * POST /api/auth/login
     */
    async login(credentials) {
        try {
            const response = await api.post(environment.api.endpoints.authentication.login, {
                email: credentials.email,
                password: credentials.password
            });

            // Extract data from the new API response structure
            const { data } = response.data;
            const {
                accessToken,
                refreshToken,
                tokenExpiryTime,
                refreshTokenExpiryTime,
                user,
                permissions,
                userBranches,
                defaultBranch,
                isSystemAdmin
            } = data;

            // Store authentication data using the new structure
            environment.auth.setToken(accessToken);
            environment.auth.setRefreshToken(refreshToken);

            // Store additional auth data
            this.setTokenExpiryTime(tokenExpiryTime);
            this.setRefreshTokenExpiryTime(refreshTokenExpiryTime);
            this.setPermissions(permissions);
            this.setUserBranches(userBranches);
            this.setIsSystemAdmin(isSystemAdmin);

            // Set default branch if available
            if (defaultBranch) {
                environment.multiTenant.setCurrentBranchId(defaultBranch.id.toString());
                this.setDefaultBranch(defaultBranch);
            }

            if (environment.features.enableLogging) {
                console.log('✅ Login successful for user:', user?.email);
                console.log('📋 Permissions loaded:', permissions?.length || 0);
                console.log('🏢 User branches:', userBranches?.length || 0);
                console.log('👑 System Admin:', isSystemAdmin);
            }

            return {
                accessToken,
                refreshToken,
                tokenExpiryTime,
                refreshTokenExpiryTime,
                user,
                permissions,
                userBranches,
                defaultBranch,
                isSystemAdmin
            };
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Login failed:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    },

    /**
     * Refresh JWT token
     * POST /api/auth/refresh-token
     */
    async refreshToken() {
        try {
            const refreshToken = environment.auth.getRefreshToken();
            const accessToken = environment.auth.getToken();

            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await api.post(environment.api.endpoints.authentication.refreshToken, {
                accessToken,
                refreshToken
            });

            // Extract data from response
            const { data } = response.data;
            const {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                tokenExpiryTime,
                refreshTokenExpiryTime
            } = data;

            // Update stored tokens
            environment.auth.setToken(newAccessToken);
            environment.auth.setRefreshToken(newRefreshToken);
            this.setTokenExpiryTime(tokenExpiryTime);
            this.setRefreshTokenExpiryTime(refreshTokenExpiryTime);

            if (environment.features.enableLogging) {
                console.log('✅ Token refreshed successfully');
            }

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                tokenExpiryTime,
                refreshTokenExpiryTime
            };
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
                await api.post(environment.api.endpoints.authentication.logout);
            }
        } catch (error) {
            // Continue with logout even if API call fails
            console.warn('Logout API call failed, but continuing with local cleanup');
        } finally {
            // Clear all authentication data
            environment.auth.removeToken();
            environment.auth.removeRefreshToken();
            environment.multiTenant.removeCurrentBranchId();

            // Clear additional auth data
            this.removeTokenExpiryTime();
            this.removeRefreshTokenExpiryTime();
            this.removePermissions();
            this.removeUserBranches();
            this.removeDefaultBranch();
            this.removeIsSystemAdmin();

            if (environment.features.enableLogging) {
                console.log('✅ Logout completed');
            }
        }
    },

    /**
     * Get current user information
     * GET /api/auth/me
     * TODO: Implement this in Backend later
     */
    async getCurrentUser() {
        try {
            const response = await api.get('/api/auth/me');

            // Handle response structure
            const userData = response.data?.data || response.data;
            return userData;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to get current user:', error.message);
            }
            throw error;
        }
    },

    /**
     * Select branch for multi-tenant context
     * POST /api/auth/select-branch
     */
    async selectBranch(branchId) {
        try {
            const response = await api.post('/api/auth/select-branch', {
                branchId: parseInt(branchId)
            });

            const { data } = response.data;
            const {
                accessToken,
                selectedBranch,
                branchRole,
                availablePermissions
            } = data;

            // Update token with new branch context
            environment.auth.setToken(accessToken);
            environment.multiTenant.setCurrentBranchId(branchId.toString());

            // Update branch-specific data
            this.setSelectedBranch(selectedBranch);
            this.setBranchRole(branchRole);
            this.setPermissions(availablePermissions);

            if (environment.features.enableLogging) {
                console.log('✅ Branch selected:', selectedBranch?.name);
                console.log('📋 Branch permissions:', availablePermissions?.length || 0);
            }

            return {
                accessToken,
                selectedBranch,
                branchRole,
                availablePermissions
            };
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Branch selection failed:', error.response?.data?.message || error.message);
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
     * TODO: Implement this in Backend later
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
    },

    // Permission management helpers
    getPermissions() {
        const permissions = localStorage.getItem('userPermissions');
        return permissions ? JSON.parse(permissions) : [];
    },

    setPermissions(permissions) {
        localStorage.setItem('userPermissions', JSON.stringify(permissions));
    },

    removePermissions() {
        localStorage.removeItem('userPermissions');
    },

    hasPermission(permission) {
        const permissions = this.getPermissions();
        return permissions.includes(permission);
    },

    hasAnyPermission(permissionList) {
        const permissions = this.getPermissions();
        return permissionList.some(permission => permissions.includes(permission));
    },

    // Token expiry time helpers
    getTokenExpiryTime() {
        return localStorage.getItem('tokenExpiryTime');
    },

    setTokenExpiryTime(expiryTime) {
        localStorage.setItem('tokenExpiryTime', expiryTime);
    },

    removeTokenExpiryTime() {
        localStorage.removeItem('tokenExpiryTime');
    },

    getRefreshTokenExpiryTime() {
        return localStorage.getItem('refreshTokenExpiryTime');
    },

    setRefreshTokenExpiryTime(expiryTime) {
        localStorage.setItem('refreshTokenExpiryTime', expiryTime);
    },

    removeRefreshTokenExpiryTime() {
        localStorage.removeItem('refreshTokenExpiryTime');
    },

    // Branch management helpers
    getUserBranches() {
        const branches = localStorage.getItem('userBranches');
        return branches ? JSON.parse(branches) : [];
    },

    setUserBranches(branches) {
        localStorage.setItem('userBranches', JSON.stringify(branches));
    },

    removeUserBranches() {
        localStorage.removeItem('userBranches');
    },

    getDefaultBranch() {
        const branch = localStorage.getItem('defaultBranch');
        return branch ? JSON.parse(branch) : null;
    },

    setDefaultBranch(branch) {
        localStorage.setItem('defaultBranch', JSON.stringify(branch));
    },

    removeDefaultBranch() {
        localStorage.removeItem('defaultBranch');
    },

    getSelectedBranch() {
        const branch = localStorage.getItem('selectedBranch');
        return branch ? JSON.parse(branch) : null;
    },

    setSelectedBranch(branch) {
        localStorage.setItem('selectedBranch', JSON.stringify(branch));
    },

    removeSelectedBranch() {
        localStorage.removeItem('selectedBranch');
    },

    getBranchRole() {
        const role = localStorage.getItem('branchRole');
        return role ? JSON.parse(role) : null;
    },

    setBranchRole(role) {
        localStorage.setItem('branchRole', JSON.stringify(role));
    },

    removeBranchRole() {
        localStorage.removeItem('branchRole');
    },

    // System admin helpers
    getIsSystemAdmin() {
        return localStorage.getItem('isSystemAdmin') === 'true';
    },

    setIsSystemAdmin(isAdmin) {
        localStorage.setItem('isSystemAdmin', isAdmin.toString());
    },

    removeIsSystemAdmin() {
        localStorage.removeItem('isSystemAdmin');
    },

    // Token expiry check
    isTokenExpired() {
        const expiryTime = this.getTokenExpiryTime();
        if (!expiryTime) return false;

        return new Date(expiryTime) <= new Date();
    },

    isRefreshTokenExpired() {
        const expiryTime = this.getRefreshTokenExpiryTime();
        if (!expiryTime) return false;

        return new Date(expiryTime) <= new Date();
    }
}; 