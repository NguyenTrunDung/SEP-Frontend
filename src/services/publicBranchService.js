// publicBranchService.js - For guest/public branch operations
import api, { environment } from './api/config';

export const publicBranchService = {
    // Simple listeners for branch change events (UI can subscribe to react immediately)
    _listeners: new Set(),
    onBranchChanged(handler) {
        this._listeners.add(handler);
        return () => this._listeners.delete(handler);
    },
    _emitBranchChanged(branchId) {
        try {
            this._listeners.forEach(fn => {
                try { fn(branchId); } catch (_) { }
            });
        } catch (_) { }
    },
    /**
     * Get all branches for public use (no authentication required)
     * GET /api/v1/branches (public endpoint)
     */
    async getAllBranches() {
        try {
            // Use a simplified API call without authentication headers
            const response = await api.get(environment.api.endpoints.branch.list, {
                // Override to not add authentication headers
                headers: {
                    'Content-Type': 'application/json'
                    // No Authorization header for public endpoint
                }
            });

            // Extract the branches array from the API response
            const branches = response.data?.data || [];

            if (environment.features.enableLogging) {
                console.log('✅ Fetched public branches:', branches.length, 'branches');
                console.log('🔍 Public branches array:', branches);
            }

            return branches;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch public branches:', error.message);
            }
            throw error;
        }
    },

    /**
     * Get default branch for public use
     * GET /api/v1/branches/default (public endpoint)
     */
    async getDefaultBranch() {
        try {
            const response = await api.get(environment.api.endpoints.branch.default, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const branch = response.data?.data || null;

            if (environment.features.enableLogging) {
                console.log('✅ Fetched public default branch:', branch?.name);
            }

            return branch;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch public default branch:', error.message);
            }
            throw error;
        }
    },

    /**
     * Set current branch for public context
     * Calls API to set current branch and updates localStorage
     */
    async setCurrentBranch(branchId) {
        try {
            // Call API to set current branch
            const response = await api.post(environment.api.endpoints.branch.setCurrent(branchId), null, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Update localStorage as well
            environment.multiTenant.setCurrentBranchId(branchId);

            if (environment.features.enableLogging) {
                console.log('✅ Set public current branch via API:', branchId);
                console.log('✅ API response:', response.data);
            }

            // Notify listeners for immediate UI reactions
            this._emitBranchChanged(branchId);

            // Return the response data
            return response.data?.data || { id: branchId, success: true };
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to set public current branch via API:', error.message);
            }
            throw error;
        }
    },

    /**
     * Get current branch for public context
     * Uses localStorage and fetches branch details if needed
     */
    async getCurrentBranch() {
        try {
            const currentBranchId = environment.multiTenant.getCurrentBranchId();

            if (!currentBranchId) {
                // No branch selected, try to get default
                return await this.getDefaultBranch();
            }

            // For public context, we might need to fetch branch details
            // This is a simplified implementation - you might want to cache this
            const branches = await this.getAllBranches();
            const currentBranch = branches.find(branch => branch.id?.toString() === currentBranchId);

            if (environment.features.enableLogging) {
                console.log('✅ Got public current branch:', currentBranch?.name || 'Not found');
            }

            return currentBranch || null;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to get public current branch:', error.message);
            }
            throw error;
        }
    },

    /**
     * Switch branch for public context
     * Combines setCurrentBranch and getCurrentBranch
     */
    async switchBranch(branchId) {
        try {
            // Set the branch ID
            await this.setCurrentBranch(branchId);

            // Return the branch data
            return await this.getCurrentBranch();
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to switch public branch:', error.message);
            }
            throw error;
        }
    }
}; 