import api, { environment } from './api/config';

export const branchService = {
    /**
     * Get all branches (public endpoint)
     * GET /api/v1/branches
     */
    async getAllBranches() {
        try {
            const response = await api.get('/api/v1/branches');

            if (environment.features.enableLogging) {
                console.log('✅ Fetched all branches:', response.data?.length, 'branches');
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch branches:', error.message);
            }
            throw error;
        }
    },

    /**
     * Get default branch (public endpoint)
     * GET /api/v1/branches/default
     */
    async getDefaultBranch() {
        try {
            const response = await api.get('/api/v1/branches/default');

            if (environment.features.enableLogging) {
                console.log('✅ Fetched default branch:', response.data?.name);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch default branch:', error.message);
            }
            throw error;
        }
    },

    /**
     * Set current branch
     * POST /api/v1/branches/set-current/{branchId}
     */
    async setCurrentBranch(branchId) {
        try {
            const response = await api.post(`/api/v1/branches/set-current/${branchId}`);

            // Store branch ID locally
            environment.multiTenant.setCurrentBranchId(branchId);

            if (environment.features.enableLogging) {
                console.log('✅ Set current branch:', branchId);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to set current branch:', error.message);
            }
            throw error;
        }
    },

    /**
     * Get current branch
     * GET /api/v1/branches/current
     */
    async getCurrentBranch() {
        try {
            const response = await api.get('/api/v1/branches/current');

            if (environment.features.enableLogging) {
                console.log('✅ Fetched current branch:', response.data?.name);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch current branch:', error.message);
            }
            throw error;
        }
    },

    /**
     * Secure action (requires orders:add permission)
     * GET /api/v1/branches/secure-action
     */
    async secureAction() {
        try {
            const response = await api.get('/api/v1/branches/secure-action');

            if (environment.features.enableLogging) {
                console.log('✅ Secure action completed');
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Secure action failed:', error.message);
            }
            throw error;
        }
    },

    /**
     * Get admin system user (requires users:views permission)
     * GET /api/v1/branches/admin-system-user?branchCode={branchCode}
     */
    async getAdminSystemUser(branchCode) {
        try {
            const response = await api.get('/api/v1/branches/admin-system-user', {
                params: { branchCode }
            });

            if (environment.features.enableLogging) {
                console.log('✅ Fetched admin system user for branch:', branchCode);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch admin system user:', error.message);
            }
            throw error;
        }
    },

    /**
     * Assign admin system (requires users:edit permission)
     * POST /api/v1/branches/assign-admin-system/{userId}?branchCode={branchCode}
     */
    async assignAdminSystem(userId, branchCode) {
        try {
            const response = await api.post(
                `/api/v1/branches/assign-admin-system/${userId}`,
                null,
                {
                    params: { branchCode }
                }
            );

            if (environment.features.enableLogging) {
                console.log('✅ Assigned admin system user:', userId, 'to branch:', branchCode);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to assign admin system user:', error.message);
            }
            throw error;
        }
    },

    /**
     * List admin system users (requires users:views permission)
     * GET /api/v1/branches/admin-system-users?branchCode={branchCode}
     */
    async listAdminSystemUsers(branchCode) {
        try {
            const response = await api.get('/api/v1/branches/admin-system-users', {
                params: { branchCode }
            });

            if (environment.features.enableLogging) {
                console.log('✅ Fetched admin system users for branch:', branchCode);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch admin system users:', error.message);
            }
            throw error;
        }
    },

    /**
     * Switch to a different branch and update local storage
     */
    async switchBranch(branchId) {
        try {
            // Set current branch on server
            await this.setCurrentBranch(branchId);

            // Get updated branch info
            const branchInfo = await this.getCurrentBranch();

            if (environment.features.enableLogging) {
                console.log('✅ Successfully switched to branch:', branchInfo?.name);
            }

            return branchInfo;
        } catch (error) {
            // Remove branch ID from local storage if switch fails
            environment.multiTenant.removeCurrentBranchId();

            if (environment.features.enableLogging) {
                console.error('❌ Failed to switch branch:', error.message);
            }
            throw error;
        }
    }
}; 