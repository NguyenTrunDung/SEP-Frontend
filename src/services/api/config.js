import axios from 'axios';
import environment from '../../config/environment';

const api = axios.create({
    baseURL: environment.api.baseURL,
    timeout: environment.api.timeout,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor with multi-tenant support
api.interceptors.request.use(
    (requestConfig) => {
        // Add JWT token
        const token = environment.auth.getToken();
        if (token) {
            requestConfig.headers.Authorization = `Bearer ${token}`;
        }

        // Add branch context for multi-tenancy
        const currentBranchId = environment.multiTenant.getCurrentBranchId();
        console.log('currentBranchId', currentBranchId);
        if (currentBranchId && !requestConfig.headers['X-Branch-Id']) {
            requestConfig.headers['X-Branch-Id'] = currentBranchId;
        }

        // Add branch query parameter for branch-specific endpoints
        if (requestConfig.addBranchParam && currentBranchId) {
            requestConfig.params = { ...requestConfig.params, branchId: currentBranchId };
        }

        // Log request in development
        if (environment.features.enableLogging && environment.app.isDevelopment) {
            console.log('🌐 API Request:', {
                method: requestConfig.method?.toUpperCase(),
                url: requestConfig.url,
                headers: {
                    ...requestConfig.headers,
                    Authorization: requestConfig.headers.Authorization ? '[HIDDEN]' : undefined
                },
                data: requestConfig.data,
                params: requestConfig.params
            });
        }

        return requestConfig;
    },
    (error) => {
        if (environment.features.enableLogging) {
            console.error('❌ API Request Error:', error);
        }
        return Promise.reject(error);
    }
);

// Response interceptor with enhanced error handling
api.interceptors.response.use(
    (response) => {
        // Log response in development
        if (environment.features.enableLogging && environment.app.isDevelopment) {
            console.log('✅ API Response:', {
                status: response.status,
                url: response.config.url,
                data: response.data
            });
        }

        return response;
    },
    (error) => {
        // Log error in development
        if (environment.features.enableLogging) {
            console.error('❌ API Response Error:', {
                status: error.response?.status,
                url: error.config?.url,
                message: error.response?.data?.message || error.message,
                data: error.response?.data
            });
        }

        if (error.response?.status === 401) {
            // Clear all authentication data
            environment.auth.removeToken();
            environment.auth.removeRefreshToken();
            environment.multiTenant.removeCurrentBranchId();

            // Only redirect if not already on login page
            if (window.location.pathname !== '/login') {
                console.log('🔐 Authentication failed, redirecting to login...');
                window.location.href = '/login';
            }
        }

        if (error.response?.status === 403) {
            // Handle branch access denied
            console.error('🚫 Branch access denied:', error.response.data);
            // Could trigger a branch selection modal here
        }

        return Promise.reject(error);
    }
);

// Export both the api instance and environment for use in services
export default api;
export { environment }; 