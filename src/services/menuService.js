import api, { environment } from "./api/config";

/**
 * Menu Service
 * Handles all menu-related API operations with multi-tenant support
 * 
 * Backend API Endpoints:
 * - POST /api/v1/MenuDetails (Create menu with details)
 * - GET /api/v1/MenuDetails/{id} (Get menu by ID) 
 * - GET /api/v1/public/menus/menu-by-date (Get public menu by date)
 * 
 * Branch Context Strategy:
 * - API interceptor automatically adds X-Branch-Id header from current branch context
 * - BranchId is included in request body for create operations
 * - Multi-tenant isolation handled automatically
 */
export const menuService = {
    /**
     * Create a new menu with details
     * Uses the POST /api/v1/MenuDetails endpoint
     * @param {Object} menuData - The menu data to create
     * @param {string} menuData.date - Menu date (ISO string)
     * @param {string} menuData.timeOfDay - Time of day description
     * @param {boolean} menuData.isTime - Whether time serving is enabled
     * @param {string|null} menuData.timeFrom - Start time (if isTime is true)
     * @param {string|null} menuData.timeTo - End time (if isTime is true)
     * @param {string} menuData.name - Menu name
     * @param {number|null} menuData.branchId - Branch ID (optional, will use current branch if not provided)
     * @param {Array} menuData.details - Array of menu detail items
     * @returns {Promise<Object>} Created menu response
     */
    async createMenu(menuData) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 menuService.createMenu - data:', {
                    ...menuData,
                    details: `${menuData.details?.length || 0} items`
                });
            }

            // Get current branch ID if not provided
            const currentBranchId = menuData.branchId || environment.multiTenant.getCurrentBranchId();

            if (!currentBranchId) {
                throw new Error('Branch ID is required for menu creation');
            }

            // Prepare the request body according to backend API structure
            const requestBody = {
                date: menuData.date,
                timeOfDay: menuData.timeOfDay || null,
                isTime: menuData.isTime || false,
                timeFrom: menuData.isTime ? (menuData.timeFrom || null) : null,
                timeTo: menuData.isTime ? (menuData.timeTo || null) : null,
                name: menuData.name,
                branchId: parseInt(currentBranchId, 10),
                details: (menuData.details || []).map(detail => ({
                    // id: detail.id || 0,
                    foodId: detail.foodId,
                    foodName: detail.foodName || 'string', // Backend expects string
                    qty: detail.qty || detail.quantity || 1,
                    priceForGuest: detail.priceForGuest || detail.guestPrice || 0,
                    priceForPatient: detail.priceForPatient || detail.patientPrice || 0,
                    priceForStaff: detail.priceForStaff || detail.staffPrice || 0,
                    discountPrice: detail.discountPrice || detail.discount || 0,
                    status: detail.status !== undefined ? detail.status : true,
                    discountFrom: detail.discountFrom ? (detail.discountFrom || null) : null, // Backend expects string
                    discountTo: detail.discountTo ? (detail.discountTo || null) : null, // Backend expects string  
                    isQty: detail.isQty !== undefined ? detail.isQty : true
                }))
            };

            if (environment.features.enableLogging) {
                console.log('📤 menuService.createMenu - request body:', requestBody);
            }

            const response = await api.post(`${environment.api.endpoints.menuDetails.create}`, requestBody);

            if (environment.features.enableLogging) {
                console.log('✅ Created menu:', response.data);
            }

            // Backend returns 201 Created with the menu data
            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to create menu:', {
                    message: error.response?.data?.message || error.message,
                    status: error.response?.status,
                    data: error.response?.data
                });
            }
            throw error;
        }
    },

    /**
     * Get menu by ID  
     * Uses the GET /api/v1/MenuDetails/{id} endpoint
     * @param {string|number} id - The menu ID
     * @returns {Promise<Object|null>} Menu object or null if not found
     */
    async getMenu(id) {
        try {
            console.log('🔍 menuService.getMenu - ID:', id);
            console.log('🔍 API URL will be:', `${environment.api.getVersionedPath('/MenuDetail')}/${id}`);

            const response = await api.get(`${environment.api.getVersionedPath('/MenuDetail')}/${id}`);

            console.log('📥 Raw API response:', response);
            console.log('📥 Response data:', response.data);
            console.log('📥 Response status:', response.status);

            const menuData = response.data?.data || response.data || null;
            console.log('✅ Extracted menu data:', menuData);

            return menuData;
        } catch (error) {
            console.error('❌ Failed to fetch menu:', error);
            console.error('❌ Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: error.config?.url
            });
            throw error;
        }
    },

    /**
 * Get public menu by date (for customer-facing displays)
 * Uses the GET /api/v1/public/menus/menu-by-date endpoint
 * @param {Object} filters - Filter parameters
 * @param {string} filters.date - Date to filter by (ISO string format)
 * @param {string|number} filters.branchId - Branch ID (optional, uses current branch if not provided)
 * @returns {Promise<Object>} Public menu data with foods, categories, and menuId
 */
    async getPublicMenuByDate(filters = {}) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 menuService.getPublicMenuByDate - filters:', filters);
            }

            // Get current branch ID if not provided in filters
            const currentBranchId = filters.branchId || environment.multiTenant.getCurrentBranchId();

            if (!currentBranchId) {
                throw new Error('Branch ID is required for fetching public menu');
            }

            const queryParams = {
                ...(filters.date && { date: filters.date }),
                branchId: currentBranchId,
            };

            const response = await api.get(environment.api.endpoints.publicMenus.menuByDate, {
                params: queryParams,
            });

            if (environment.features.enableLogging) {
                console.log('✅ Fetched public menu by date:', {
                    menuId: response.data?.data?.menuId || 'N/A',
                    foods: response.data?.data?.foods?.length || 0,
                    categories: response.data?.data?.categories?.length || 0,
                    date: filters.date,
                    branchId: currentBranchId,
                });
            }

            // Extract data from API response structure
            const menuData = response.data?.data || response.data || null;

            return {
                menuId: menuData?.menuId || null, // Include menuId
                foods: menuData?.foods || [],
                categories: menuData?.categories || [],
                foodsTotalCount: menuData?.foodsTotalCount || 0,
                categoriesTotalCount: menuData?.categoriesTotalCount || 0,
                date: filters.date,
                branchId: currentBranchId,
                isUsingMockData: false,
            };
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch public menu by date:', {
                    message: error.response?.data?.message || error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                });
            }
            throw error;
        }
    },
    /**
     * Validate menu data before submission
     * @param {Object} menuData - Menu data to validate
     * @returns {Object} Validation result with isValid and errors
     */
    validateMenuData(menuData) {
        const errors = [];

        // Required fields validation
        if (!menuData.date) {
            errors.push('Date is required');
        }

        if (!menuData.name || menuData.name.trim() === '') {
            errors.push('Menu name is required');
        }

        // Time validation when isTime is true
        if (menuData.isTime) {
            if (!menuData.timeFrom) {
                errors.push('Start time is required when time serving is enabled');
            }
            if (!menuData.timeTo) {
                errors.push('End time is required when time serving is enabled');
            }
            if (menuData.timeFrom && menuData.timeTo && menuData.timeFrom >= menuData.timeTo) {
                errors.push('End time must be after start time');
            }
        }

        // Details validation
        if (!menuData.details || menuData.details.length === 0) {
            errors.push('At least one menu item is required');
        }

        if (menuData.details) {
            menuData.details.forEach((detail, index) => {
                if (!detail.foodId) {
                    errors.push(`Menu item ${index + 1}: Food selection is required`);
                }
                if (!detail.qty || detail.qty <= 0) {
                    errors.push(`Menu item ${index + 1}: Quantity must be greater than 0`);
                }
                if (detail.priceForGuest < 0 || detail.priceForPatient < 0 || detail.priceForStaff < 0) {
                    errors.push(`Menu item ${index + 1}: Prices cannot be negative`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Fetch all menus with details for the current branch
     * Uses the GET /api/v1/MenuDetail endpoint
     * @returns {Promise<Array>} Array of menu objects
     */
    async getMenuList() {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 menuService.getMenuList - fetching all menus');
            }

            const response = await api.get(`${environment.api.getVersionedPath('/MenuDetail')}`);

            if (environment.features.enableLogging) {
                console.log('✅ Fetched menu list:', response.data);
            }

            // Extract array from API response
            return response.data?.data || response.data || [];
        } catch (error) {
            // Handle 404 as a valid response (no menus found)
            if (error.response?.status === 404) {
                if (environment.features.enableLogging) {
                    console.log('ℹ️ No menus found for current branch (404) - returning empty array');
                }
                return []; // Return empty array instead of throwing error
            }

            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch menu list:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    },

    /**
     * Update an existing menu with details
     * Uses the PUT /api/v1/MenuDetails/{id} endpoint
     * @param {string|number} menuId - The menu ID to update
     * @param {Object} menuData - The menu data to update
     * @returns {Promise<Object>} Updated menu response
     */
    async updateMenu(menuId, menuData) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔄 menuService.updateMenu - ID:', menuId, 'data:', {
                    ...menuData,
                    details: `${menuData.details?.length || 0} items`
                });
            }

            // Get current branch ID if not provided
            const currentBranchId = menuData.branchId || environment.multiTenant.getCurrentBranchId();

            if (!currentBranchId) {
                throw new Error('Branch ID is required for menu update');
            }

            // Prepare the request body according to backend API structure
            const requestBody = {
                id: parseInt(menuId, 10),
                date: menuData.date,
                timeOfDay: menuData.timeOfDay || null,
                isTime: menuData.isTime || false,
                timeFrom: menuData.isTime ? (menuData.timeFrom || null) : null,
                timeTo: menuData.isTime ? (menuData.timeTo || null) : null,
                name: menuData.name,
                branchId: parseInt(currentBranchId, 10),
                details: (menuData.details || []).map(detail => ({
                    id: detail.id || null,
                    foodId: detail.foodId,
                    foodName: detail.foodName || 'string',
                    qty: detail.qty || detail.quantity || 1,
                    priceForGuest: detail.priceForGuest || detail.guestPrice || 0,
                    priceForPatient: detail.priceForPatient || detail.patientPrice || 0,
                    priceForStaff: detail.priceForStaff || detail.staffPrice || 0,
                    discountPrice: detail.discountPrice || detail.discount || 0,
                    status: detail.status !== undefined ? detail.status : true,
                    discountFrom: detail.discountFrom || null,
                    discountTo: detail.discountTo || null,
                    isQty: detail.isQty !== undefined ? detail.isQty : true
                }))
            };

            if (environment.features.enableLogging) {
                console.log('📤 menuService.updateMenu - request body:', requestBody);
            }

            const response = await api.put(`${environment.api.getVersionedPath('/MenuDetail')}/${menuId}`, requestBody);

            if (environment.features.enableLogging) {
                console.log('✅ Updated menu:', response.data);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to update menu:', {
                    message: error.response?.data?.message || error.message,
                    status: error.response?.status,
                    data: error.response?.data
                });
            }
            throw error;
        }
    },

    /**
     * Delete an existing menu
     * Uses the DELETE /api/v1/MenuDetail/{id} endpoint
     * @param {string|number} menuId - The menu ID to delete
     * @returns {Promise<Object>} Delete response
     */
    async deleteMenu(menuId) {
        try {
            if (environment.features.enableLogging) {
                console.log('🗑️ menuService.deleteMenu - ID:', menuId);
            }

            const response = await api.delete(`${environment.api.getVersionedPath('/MenuDetail')}/${menuId}`);

            if (environment.features.enableLogging) {
                console.log('✅ Deleted menu:', response.data);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to delete menu:', {
                    message: error.response?.data?.message || error.message,
                    status: error.response?.status,
                    data: error.response?.data
                });
            }
            throw error;
        }
    },

    /**
     * Get all menu dates for the current branch
     * Uses the GET /api/v1/menudetail/dates endpoint
     * @returns {Promise<Array>} List of menu dates
     */
    // async getMenuDates() {
    //     const response = await api.get('/api/v1/menudetail/dates');
    //     return response.data?.data || [];
    // },
    async getMenuDates() {
        try {
            const branchId = environment.multiTenant.getCurrentBranchId();
            if (environment.features.enableLogging) {
                console.log('🔍 Fetching menu dates with branchId:', branchId);
            }
            const response = await api.get('/api/v1/public/menus/dates');
            if (environment.features.enableLogging) {
                console.log('✅ Fetched menu dates:', response.data);
            }
            return response.data?.data || [];
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch menu dates:', {
                    message: error.response?.data?.message || error.message,
                    status: error.response?.status,
                    data: error.response?.data
                });
            }
            throw error;
        }
    },

    /**
     * Get available menu dates for template selection (past 2 weeks)
     * Uses the optimized GET /api/v1/MenuDetail/recent-for-template endpoint
     * @param {number} days - Number of days to look back (default: 14, max: 30)
     * @returns {Promise<Array>} List of menu objects with basic info from past N days
     */
    async getAvailableMenuDatesForTemplate(days = 14) {
        try {
            if (environment.features.enableLogging) {
                console.log(`🔍 menuService.getAvailableMenuDatesForTemplate - fetching past ${days} days menus`);
            }

            const response = await api.get(`${environment.api.getVersionedPath('/MenuDetail')}/recent-for-template`, {
                params: { days }
            });

            const availableMenus = response.data?.data || response.data || [];

            if (environment.features.enableLogging) {
                console.log(`✅ Found ${availableMenus.length} menus from past ${days} days:`, availableMenus);
            }

            return availableMenus;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.warn('⚠️ Optimized endpoint failed, falling back to manual filtering:', error.message);
            }

            // Fallback to the old method if the new endpoint is not available
            try {
                const today = new Date();
                const cutoffDate = new Date(today);
                cutoffDate.setDate(today.getDate() - days);

                const response = await api.get(`${environment.api.getVersionedPath('/MenuDetail')}`);
                const allMenus = response.data?.data || response.data || [];

                const availableMenus = allMenus
                    .filter(menu => {
                        const menuDate = new Date(menu.date);
                        return menuDate >= cutoffDate && menuDate < today;
                    })
                    .map(menu => ({
                        id: menu.id,
                        date: menu.date,
                        name: menu.name,
                        timeOfDay: menu.timeOfDay,
                        totalDishes: menu.details?.length || 0,
                        isTime: menu.isTime,
                        timeFrom: menu.timeFrom,
                        timeTo: menu.timeTo,
                        branchId: menu.branchId
                    }))
                    .sort((a, b) => new Date(b.date) - new Date(a.date));

                if (environment.features.enableLogging) {
                    console.log(`✅ Fallback: Found ${availableMenus.length} menus from past ${days} days:`, availableMenus);
                }

                return availableMenus;
            } catch (fallbackError) {
                if (environment.features.enableLogging) {
                    console.error('❌ Both optimized and fallback methods failed:', fallbackError.response?.data?.message || fallbackError.message);
                }
                throw fallbackError;
            }
        }
    }
};

export default menuService;
