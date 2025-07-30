import api, { environment } from './api/config';
import { jwtDecode } from 'jwt-decode';

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
            if (environment.features.enableLogging) {
                console.error('❌ Token refresh failed:', error.response?.data?.message || error.message);
            }

            // Don't automatically logout here - let the calling code handle it
            // This prevents circular dependency issues
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
/**
     * Get current user profile
     * GET /api/v1/profile
     */
    async getProfile() {
        try {
            const response = await api.get('/api/v1/auth/profile');
            const userData = response.data?.data || response.data;

            if (environment.features.enableLogging) {
                console.log('✅ Fetched user profile:', userData);
            }

            return userData;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch user profile:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    },

    /**
     * Edit user profile
     * POST /api/v1/edit-profile
     */
    async editProfile(profileData) {
        try {
            const response = await api.post('/api/v1/auth/edit-profile', {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                address: profileData.address,
                phoneNumber: profileData.phoneNumber,
                profilePictureUrl: profileData.profilePictureUrl
            });

            if (environment.features.enableLogging) {
                console.log('✅ Profile updated successfully:', response.data);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to update profile:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    },
    async register(userData) {
        try {
            const response = await api.post(environment.api.getVersionedPath('/auth/register'), {
                email: userData.email,
                password: userData.password,
                firstName: userData.firstName,
                lastName: userData.lastName,
                address: userData.address
            });

            if (environment.features.enableLogging) {
                console.log('✅ Registration successful for user:', userData.email);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Registration failed:', error.response?.data?.message || error.message);
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

    // Token expiry check using JWT decode
    isTokenExpired() {
        const token = environment.auth.getToken();
        if (!token) {
            console.log('⚠️ No JWT token found');
            return true; // If no token, consider it expired
        }

        try {
            const decoded = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
            const tokenExp = decoded.exp; // JWT exp claim is in seconds

            if (!tokenExp) {
                console.log('⚠️ No exp claim found in JWT token');
                return false; // If no exp claim, assume token is valid
            }

            const isExpired = currentTime >= tokenExp;
            const timeUntilExpiry = tokenExp - currentTime;

            if (environment.features.enableLogging) {
                console.log('🔄 JWT Token expiry check:', {
                    currentTime: new Date(currentTime * 1000).toISOString(),
                    tokenExpiry: new Date(tokenExp * 1000).toISOString(),
                    isExpired,
                    timeUntilExpiry: isExpired ? 'Already expired' : `${Math.round(timeUntilExpiry / 60)} minutes`
                });
            }

            return isExpired;
        } catch (error) {
            console.error('❌ Error decoding JWT token:', error);
            return true; // If token is malformed, consider it expired
        }
    },

    isRefreshTokenExpired() {
        // For refresh token, we still use the stored expiry time from backend
        // since refresh tokens are typically opaque tokens, not JWTs
        const expiryTime = this.getRefreshTokenExpiryTime();
        if (!expiryTime) {
            console.log('⚠️ No refresh token expiry time found');
            return false; // If no expiry time, assume token is valid
        }

        const now = new Date();
        const expiry = new Date(expiryTime);
        const isExpired = expiry <= now;

        if (environment.features.enableLogging) {
            console.log('🔄 Refresh token expiry check:', {
                now: now.toISOString(),
                expiry: expiry.toISOString(),
                isExpired,
                timeUntilExpiry: isExpired ? 'Already expired' : `${Math.round((expiry - now) / 1000 / 60 / 60)} hours`
            });
        }

        return isExpired;
    },

    // Helper method to get JWT payload without verification (for debugging)
    getJWTPayload() {
        const token = environment.auth.getToken();
        if (!token) return null;

        try {
            return jwtDecode(token);
        } catch (error) {
            console.error('❌ Error decoding JWT token:', error);
            return null;
        }
    },

    // Debug helper to log JWT token details
    debugJWTToken() {
        const token = environment.auth.getToken();
        if (!token) {
            console.log('🔍 JWT Debug: No token found');
            return null;
        }

        try {
            const decoded = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = decoded.exp - currentTime;

            const debugInfo = {
                header: decoded,
                issuer: decoded.iss,
                audience: decoded.aud,
                subject: decoded.sub,
                userId: decoded.UserId,
                email: decoded.email,
                role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
                firstName: decoded.FirstName,
                lastName: decoded.LastName,
                issuedAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : 'N/A',
                expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A',
                currentTime: new Date(currentTime * 1000).toISOString(),
                timeUntilExpiry: timeUntilExpiry > 0 ? `${Math.round(timeUntilExpiry / 60)} minutes` : 'Already expired',
                isExpired: currentTime >= decoded.exp
            };

            console.log('🔍 JWT Token Debug Info:', debugInfo);
            return debugInfo;
        } catch (error) {
            console.error('❌ Error debugging JWT token:', error);
            return null;
        }
    },

    // Add missing getToken method for backward compatibility with AuthContext
    getToken() {
        return environment.auth.getToken();
    }
}; 