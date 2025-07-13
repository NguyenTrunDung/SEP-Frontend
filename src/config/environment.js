/**
 * Environment Configuration for HOMMS
 * Centralized management of all environment variables
 */

const environment = {
    // API Configuration
    api: {
        baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5281',
        version: process.env.REACT_APP_API_VERSION || 'v1',
        timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 15000,

        // Full API URL with version
        get url() {
            return this.baseURL;
        },

        // Dynamic endpoint builder
        buildEndpoint(path) {
            return path.startsWith('/api/') ? path : `/api/${this.version}${path}`;
        },

        // Get versioned API path
        getVersionedPath(path) {
            return `/api/${this.version}${path}`;
        },

        // API endpoints - using dynamic version
        get endpoints() {
            return {


                // Versioned endpoints using dynamic version
                branches: this.getVersionedPath('/branches'),
                foods: this.getVersionedPath('/foods'),
                foodCategories: this.getVersionedPath('/foodcategories'),
                orders: this.getVersionedPath('/orders'),
                users: this.getVersionedPath('/users'),

                // Authentication endpoints
                authentication: {
                    login: this.getVersionedPath('/auth/login'),
                    logout: this.getVersionedPath('/auth/logout'),
                    refreshToken: this.getVersionedPath('/auth/refresh-token'),
                    changePassword: this.getVersionedPath('/auth/change-password'),
                },

                // Branch-specific endpoints
                branch: {
                    list: this.getVersionedPath('/branches'),
                    default: this.getVersionedPath('/branches/default'),
                    current: this.getVersionedPath('/branches/current'),
                    setCurrent: (branchId) => this.getVersionedPath(`/branches/set-current/${branchId}`),
                    secureAction: this.getVersionedPath('/branches/secure-action'),
                    adminSystemUser: this.getVersionedPath('/branches/admin-system-user'),
                    assignAdminSystem: (userId) => this.getVersionedPath(`/branches/assign-admin-system/${userId}`),
                    adminSystemUsers: this.getVersionedPath('/branches/admin-system-users')
                },



                // Menu management endpoints
                menuDetails: {
                    create: this.getVersionedPath('/menudetail'),
                    getById: (id) => this.getVersionedPath(`/menudetail/${id}`),
                    update: (id) => this.getVersionedPath(`/menudetail/${id}`),
                    delete: (id) => this.getVersionedPath(`/menudetail/${id}`)
                },

                // Public menu endpoints
                publicMenus: {
                    menuByDate: this.getVersionedPath('/public/menus/menu-by-date'),
                    categoriesByDate: this.getVersionedPath('/public/menus/categories/by-date'),
                    foodsByCategory: (categoryId) => this.getVersionedPath(`/public/menus/categories/${categoryId}/foods`)
                },

                // wallet user endpoints
                wallet: {
                    userList: () => this.getVersionedPath('/UserWallet/users'),
                    userListByBranch: () => this.getVersionedPath('/UserWallet/users-by-branch'),
                    getByUserId: (userId) => this.getVersionedPath(`/UserWallet/${userId}`),
                    deposit: () => this.getVersionedPath('/UserWallet/deposit'),
                    depositHistory: (userId) => this.getVersionedPath(`/UserWallet/${userId}/deposit-history`),
                    purchaseHistory: (userId) => this.getVersionedPath(`/UserWallet/${userId}/purchase-history`),
                },
            };
        },

        // Get versioned endpoint
        getEndpoint(key) {
            const endpoint = this.endpoints[key];
            if (!endpoint) {
                throw new Error(`API endpoint '${key}' not found`);
            }
            return endpoint;
        }
    },

    // Authentication Configuration
    auth: {
        jwtTokenKey: process.env.REACT_APP_JWT_TOKEN_KEY || 'jwtToken',
        refreshTokenKey: process.env.REACT_APP_REFRESH_TOKEN_KEY || 'refreshToken',
        branchIdKey: process.env.REACT_APP_BRANCH_ID_KEY || 'currentBranchId',

        // Token helper methods
        getToken() {
            return localStorage.getItem(this.jwtTokenKey);
        },

        setToken(token) {
            localStorage.setItem(this.jwtTokenKey, token);
        },

        removeToken() {
            localStorage.removeItem(this.jwtTokenKey);
        },

        getRefreshToken() {
            return localStorage.getItem(this.refreshTokenKey);
        },

        setRefreshToken(token) {
            localStorage.setItem(this.refreshTokenKey, token);
        },

        removeRefreshToken() {
            localStorage.removeItem(this.refreshTokenKey);
        }
    },

    // Multi-tenant Configuration
    multiTenant: {
        branchIdKey: process.env.REACT_APP_BRANCH_ID_KEY || 'currentBranchId',
        defaultBranchId: process.env.REACT_APP_DEFAULT_BRANCH_ID || '1',
        enableBranchSelection: process.env.REACT_APP_ENABLE_BRANCH_SELECTION === 'true',

        // Branch helper methods
        getCurrentBranchId() {
            return localStorage.getItem(this.branchIdKey);
        },

        setCurrentBranchId(branchId) {
            localStorage.setItem(this.branchIdKey, branchId);
        },

        removeCurrentBranchId() {
            localStorage.removeItem(this.branchIdKey);
        }
    },

    // Feature Flags
    features: {
        enableMockData: process.env.REACT_APP_ENABLE_MOCK_DATA === 'true',
        enableDevtools: process.env.REACT_APP_ENABLE_DEVTOOLS === 'true',
        enableLogging: process.env.REACT_APP_ENABLE_LOGGING === 'true' || true, // Force enable for debugging
        debugMode: process.env.REACT_APP_DEBUG_MODE === 'true',
        showApiLogs: process.env.REACT_APP_SHOW_API_LOGS === 'true'
    },

    // App Configuration
    app: {
        name: process.env.REACT_APP_APP_NAME || 'HOMMS - Hospital Canteen Order Management',
        version: process.env.REACT_APP_APP_VERSION || '1.0.0',
        environment: process.env.REACT_APP_ENVIRONMENT || 'development',

        // Environment checks
        isDevelopment: process.env.NODE_ENV === 'development',
        isProduction: process.env.NODE_ENV === 'production',
        isTesting: process.env.NODE_ENV === 'test'
    },

    // Performance Configuration
    performance: {
        queryStaleTime: parseInt(process.env.REACT_APP_QUERY_STALE_TIME) || 180000, // 3 minutes (reduced from 5)
        queryCacheTime: parseInt(process.env.REACT_APP_QUERY_CACHE_TIME) || 300000, // 5 minutes (reduced from 10)

        // React Query configuration
        getQueryConfig() {
            return {
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        retry: this.isDevelopment ? 1 : 3,
                        staleTime: this.queryStaleTime,
                        cacheTime: this.queryCacheTime,
                        // Reduce refetch on mount for better image cache behavior
                        refetchOnMount: 'always', // This helps with cache consistency
                        // Add retry delay to avoid rapid CORS failures
                        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
                    },
                    mutations: {
                        retry: 1,
                    }
                }
            };
        },

        // Image-specific performance settings
        images: {
            // Shorter cache time for images to avoid CORS issues with cached URLs
            cacheTime: parseInt(process.env.REACT_APP_IMAGE_CACHE_TIME) || 120000, // 2 minutes
            // Timeout for image accessibility checks
            accessibilityTimeout: parseInt(process.env.REACT_APP_IMAGE_ACCESSIBILITY_TIMEOUT) || 2000,
            // Whether to skip accessibility checks in production
            skipAccessibilityInProd: process.env.REACT_APP_SKIP_IMAGE_ACCESSIBILITY_PROD !== 'false',
        }
    },

    // Development helpers
    dev: {
        // Log environment configuration in development
        logConfig() {
            if (environment.app.isDevelopment && environment.features.enableLogging) {
                console.group('🔧 HOMMS Environment Configuration');
                console.log('API URL:', environment.api.baseURL);
                console.log('Environment:', environment.app.environment);
                console.log('Version:', environment.app.version);
                console.log('Features:', environment.features);
                console.log('Multi-tenant:', {
                    enabled: environment.multiTenant.enableBranchSelection,
                    currentBranch: environment.multiTenant.getCurrentBranchId()
                });
                console.groupEnd();
            }
        },

        // Validate required environment variables
        validateConfig() {
            const required = [
                { key: 'REACT_APP_API_URL', value: environment.api.baseURL }
            ];

            const missing = required.filter(({ value }) => !value);

            if (missing.length > 0) {
                console.error('❌ Missing required environment variables:', missing);
                return false;
            }

            if (environment.features.enableLogging) {
                console.log('✅ All required environment variables are configured');
            }

            return true;
        }
    },

    // Initialize environment
    init() {
        this.dev.validateConfig();
        this.dev.logConfig();

        return this;
    }
};

// Initialize environment on import
environment.init();

export default environment;

// Named exports for convenience
export const { api, auth, multiTenant, features, app, performance } = environment; 