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
            if (environment.features.enableLogging) {
                console.log('🔍 menuService.getMenu - ID:', id);
            }

            const response = await api.get(`${environment.api.getVersionedPath('/MenuDetail')}/${id}`);

            if (environment.features.enableLogging) {
                console.log('✅ Fetched menu by ID:', response.data);
            }

            return response.data?.data || response.data || null;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch menu:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    },

    /**
     * Get public menu by date (for customer-facing displays)
     * Uses the GET /api/v1/public/menus/menu-by-date endpoint
     * @param {Object} filters - Filter parameters
     * @param {string} filters.date - Date to filter by (ISO string format)
     * @param {string|number} filters.branchId - Branch ID (optional, uses current branch if not provided)
     * @returns {Promise<Object>} Public menu data with foods and categories
     */
    async getPublicMenuByDate(filters = {}) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 menuService.getPublicMenuByDate - filters:', filters);
            }

            // Get current branch ID if not provided in filters
            const currentBranchId = filters.branchId || environment.multiTenant.getCurrentBranchId();

            const queryParams = {
                ...(filters.date && { date: filters.date }),
                ...(currentBranchId && { branchId: currentBranchId })
            };

            const response = await api.get(environment.api.endpoints.publicMenus.menuByDate, {
                params: queryParams
            });

            if (environment.features.enableLogging) {
                console.log('✅ Fetched public menu by date:', response.data);
            }

            // Extract data from API response structure
            const menuData = response.data?.data || response.data || null;

            return {
                foods: menuData?.foods || [],
                categories: menuData?.categories || [],
                foodsTotalCount: menuData?.foodsTotalCount || 0,
                categoriesTotalCount: menuData?.categoriesTotalCount || 0,
                date: filters.date,
                branchId: currentBranchId,
                isUsingMockData: false
            };
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch public menu by date:', error.response?.data?.message || error.message);
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
     * Get all menus with details for the current branch
     * Uses the GET /api/v1/MenuDetail endpoint (automatic branch context resolution)
     * @returns {Promise<Array>} List of menus with details
     */
    async getMenuList() {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 menuService.getMenuList - calling backend...');
            }

            const response = await api.get(`${environment.api.getVersionedPath('/MenuDetail')}`);

            if (environment.features.enableLogging) {
                console.log('✅ Fetched menu list:', response.data);
            }

            // Extract data from API response structure
            return response.data?.data || response.data || [];
        } catch (error) {
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
                    id: detail.id || 0, // Include existing ID or 0 for new items
                    foodId: detail.foodId,
                    foodName: detail.foodName || 'string', // Backend expects string
                    qty: detail.qty || detail.quantity || 1,
                    priceForGuest: detail.priceForGuest || detail.guestPrice || 0,
                    priceForPatient: detail.priceForPatient || detail.patientPrice || 0,
                    priceForStaff: detail.priceForStaff || detail.staffPrice || 0,
                    discountPrice: detail.discountPrice || detail.discount || 0,
                    status: detail.status !== undefined ? detail.status : true,
                    discountFrom: detail.discountFrom ? (detail.discountFrom || null) : null,
                    discountTo: detail.discountTo ? (detail.discountTo || null) : null,
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

            // Backend returns updated menu data
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
    }
};

export default menuService;
