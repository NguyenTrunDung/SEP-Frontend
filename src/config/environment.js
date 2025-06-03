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

        // API endpoints
        endpoints: {
            auth: '/api/auth',
            branches: '/api/v1/branches',
            foods: '/api/v1/foods',
            foodCategories: '/api/v1/foodcategories',
            publicMenus: '/api/v1/public/menus',
            orders: '/api/v1/orders',
            users: '/api/v1/users'
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
        enableLogging: process.env.REACT_APP_ENABLE_LOGGING === 'true',
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
        queryStaleTime: parseInt(process.env.REACT_APP_QUERY_STALE_TIME) || 300000, // 5 minutes
        queryCacheTime: parseInt(process.env.REACT_APP_QUERY_CACHE_TIME) || 600000, // 10 minutes

        // React Query configuration
        getQueryConfig() {
            return {
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        retry: this.isDevelopment ? 1 : 3,
                        staleTime: this.queryStaleTime,
                        cacheTime: this.queryCacheTime,
                    },
                    mutations: {
                        retry: 1,
                    }
                }
            };
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