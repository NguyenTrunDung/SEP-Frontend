import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import { mapBackendRoleToFrontend, hasAdminAccess, shouldUseGuestLayout, ROLES, BRANCH_ROLE_NAMES } from '../constants/roles';
import environment from '../config/environment';

const AuthContext = createContext();

const initialState = {
    user: null,
    token: localStorage.getItem('jwtToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    loading: true,
    error: null,
    tokenExpiry: localStorage.getItem('tokenExpiryTime'),
    refreshTokenExpiry: localStorage.getItem('refreshTokenExpiryTime'),
    permissions: authService.getPermissions(),
    userBranches: authService.getUserBranches(),
    defaultBranch: authService.getDefaultBranch(),
    selectedBranch: authService.getSelectedBranch(),
    branchRole: authService.getBranchRole(),
    isSystemAdmin: authService.getIsSystemAdmin(),
    // Thêm trạng thái để theo dõi loại đăng nhập
    loginType: localStorage.getItem('loginType'), // 'internal' hoặc 'public'
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return { ...state, loading: true, error: null };
        case 'LOGIN_SUCCESS':
            // Map backend roles to frontend role for compatibility
            // Use the default branch or first available branch to get branchRoleName
            const defaultBranch = action.payload.defaultBranch ||
                (action.payload.userBranches && action.payload.userBranches.length > 0 ? action.payload.userBranches[0] : null);
            const branchRoleName = defaultBranch?.branchRoleName ||
                (action.payload.userBranches && action.payload.userBranches.length > 0 ? action.payload.userBranches[0].branchRoleName : null);

            const mappedUser = {
                ...action.payload.user,
                role: mapBackendRoleToFrontend(
                    action.payload.user.roles,
                    branchRoleName,
                    action.payload.userBranches
                )
            };

            // Xác định loại đăng nhập dựa trên role
            const loginType = determineLoginType(mappedUser.role, branchRoleName);

            return {
                ...state,
                user: mappedUser,
                token: action.payload.accessToken,
                refreshToken: action.payload.refreshToken,
                tokenExpiry: action.payload.tokenExpiryTime,
                refreshTokenExpiry: action.payload.refreshTokenExpiryTime,
                permissions: action.payload.permissions || [],
                userBranches: action.payload.userBranches || [],
                defaultBranch: action.payload.defaultBranch,
                isSystemAdmin: action.payload.isSystemAdmin || false,
                loading: false,
                error: null,
                loginType: loginType,
            };
        case 'UPDATE_USER':
            // Map backend roles if they exist in the update
            const updatedUser = action.payload.roles
                ? {
                    ...state.user,
                    ...action.payload,
                    role: mapBackendRoleToFrontend(
                        action.payload.roles,
                        state.userBranches && state.userBranches.length > 0 ? state.userBranches[0].branchRoleName : null,
                        state.userBranches
                    )
                }
                : { ...state.user, ...action.payload };

            return {
                ...state,
                user: updatedUser,
            };
        case 'REFRESH_TOKEN':
            return {
                ...state,
                token: action.payload.accessToken,
                refreshToken: action.payload.refreshToken,
                tokenExpiry: action.payload.tokenExpiryTime,
                refreshTokenExpiry: action.payload.refreshTokenExpiryTime,
            };
        case 'SELECT_BRANCH':
            return {
                ...state,
                token: action.payload.accessToken,
                selectedBranch: action.payload.selectedBranch,
                branchRole: action.payload.branchRole,
                permissions: action.payload.availablePermissions || [],
            };
        case 'UPDATE_PERMISSIONS':
            return {
                ...state,
                permissions: action.payload,
            };
        case 'LOGIN_FAILURE':
            return { ...state, loading: false, error: action.payload };
        case 'LOGOUT':
            return {
                ...initialState,
                token: null,
                refreshToken: null,
                tokenExpiry: null,
                refreshTokenExpiry: null,
                permissions: [],
                userBranches: [],
                defaultBranch: null,
                selectedBranch: null,
                branchRole: null,
                isSystemAdmin: false,
                loading: false,
                loginType: null,
            };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        default:
            return state;
    }
};

// Hàm xác định loại đăng nhập
const determineLoginType = (userRole, branchRoleName) => {
    // Nếu là NURSE hoặc có branchRoleName là "Y tá" thì là public login
    if (userRole === ROLES.NURSE || branchRoleName === BRANCH_ROLE_NAMES.NURSE || branchRoleName === BRANCH_ROLE_NAMES.DOCTOR) {
        return 'public';
    }

    // Các role khác là internal login
    return 'internal';
};

// Hàm kiểm tra xem user có thể đăng nhập qua internal login không
const canUseInternalLogin = (userRole, branchRoleName) => {
    // NURSE không thể đăng nhập qua internal login
    if (userRole === ROLES.NURSE || branchRoleName === BRANCH_ROLE_NAMES.NURSE || branchRoleName === BRANCH_ROLE_NAMES.DOCTOR) {
        return false;
    }

    // Các role khác có thể đăng nhập qua internal login
    return true;
};

// Hàm kiểm tra xem user có thể đăng nhập qua public login không
const canUsePublicLogin = (userRole, branchRoleName) => {
    // Chỉ NURSE mới có thể đăng nhập qua public login
    return userRole === ROLES.NURSE || branchRoleName === BRANCH_ROLE_NAMES.NURSE || branchRoleName === BRANCH_ROLE_NAMES.DOCTOR;
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Token expiration check with proper timing
    useEffect(() => {
        const checkTokenExpiration = () => {
            // Only check if we have tokens and not currently loading
            if (state.token && !state.loading) {
                try {
                    // Prevent immediate refresh after login/token refresh (5-minute cooldown)
                    const lastRefreshTime = localStorage.getItem('lastTokenRefresh');
                    const now = Date.now();
                    if (lastRefreshTime && (now - parseInt(lastRefreshTime)) < 5 * 60 * 1000) {
                        if (environment.features.enableLogging) {
                            console.log('⏱️ Token refresh cooldown active, skipping check');
                        }
                        return;
                    }

                    // Check if token will expire in the next 30 seconds (30 seconds buffer)
                    // This is very conservative - only refresh when token is actually about to expire
                    const REFRESH_BUFFER_SECONDS = 30; // 30 seconds instead of 2 minutes
                    const token = authService.getJWTPayload();

                    if (token && token.exp) {
                        const currentTime = Math.floor(Date.now() / 1000);
                        const timeUntilExpiry = token.exp - currentTime;

                        // Add detailed logging to understand refresh behavior
                        if (environment.features.enableLogging) {
                            console.log('🔍 Token check details:', {
                                currentTime: new Date(currentTime * 1000).toISOString(),
                                tokenExpiry: new Date(token.exp * 1000).toISOString(),
                                timeUntilExpirySeconds: Math.round(timeUntilExpiry),
                                bufferSeconds: Math.round(REFRESH_BUFFER_SECONDS),
                                shouldRefresh: timeUntilExpiry <= REFRESH_BUFFER_SECONDS && timeUntilExpiry > 0,
                                isExpired: timeUntilExpiry <= 0
                            });
                        }

                        // Only refresh if token expires within the buffer period (30 seconds)
                        if (timeUntilExpiry <= REFRESH_BUFFER_SECONDS && timeUntilExpiry > 0) {
                            console.log(`🔄 Token expires in ${Math.round(timeUntilExpiry)} seconds (within ${Math.round(REFRESH_BUFFER_SECONDS)}-second buffer), refreshing...`);

                            if (state.refreshToken && !authService.isRefreshTokenExpired()) {
                                // Use a flag to prevent multiple simultaneous refresh attempts
                                if (!window.isRefreshingToken) {
                                    window.isRefreshingToken = true;
                                    refreshToken().finally(() => {
                                        window.isRefreshingToken = false;
                                    });
                                }
                            } else {
                                console.log('❌ Refresh token expired or missing, logging out...');
                                logout();
                            }
                        } else if (timeUntilExpiry <= 0) {
                            // Token is already expired
                            console.log('❌ Token already expired, logging out...');
                            logout();
                        } else {
                            // Token is still valid and not within refresh buffer
                            if (environment.features.enableLogging) {
                                console.log(`✅ Token is valid for ${Math.round(timeUntilExpiry)} more seconds, no refresh needed`);
                            }
                        }
                    } else {
                        console.warn('⚠️ Could not decode token for expiry check');
                    }
                } catch (error) {
                    console.error('❌ Error in token expiration check:', error);
                }
            }
        };

        // Check immediately when component mounts/token changes - but disable periodic checking
        if (state.token) {
            checkTokenExpiration();
        }

        // Disable periodic checking to prevent unnecessary refresh calls
        // Token refresh will only happen when:
        // 1. App loads and token is expired
        // 2. API calls fail due to expired token (handled by axios interceptor)
        // 3. Manual refresh triggers (if implemented)
        console.log('ℹ️ Periodic token checking disabled - only refresh when actually expired');

        // Return empty cleanup function since no interval is set
        return () => { };
    }, [state.token, state.refreshToken, state.loading]);

    // Load user on app start if token exists
    useEffect(() => {
        const loadUser = async () => {
            if (state.token && !authService.isTokenExpired()) {
                console.log('🔄 Token exists, restoring user from localStorage...');

                // Debug JWT token details
                if (environment.features.enableLogging) {
                    authService.debugJWTToken();
                }

                dispatch({ type: 'SET_LOADING', payload: true });

                try {
                    // Since /api/auth/me is not implemented yet, use localStorage data
                    const storedPermissions = authService.getPermissions();
                    const storedUserBranches = authService.getUserBranches();
                    const storedDefaultBranch = authService.getDefaultBranch();
                    const storedIsSystemAdmin = authService.getIsSystemAdmin();

                    // Check if we have sufficient user data in localStorage
                    if (storedPermissions.length > 0 || storedUserBranches.length > 0) {
                        console.log('✅ User data restored from localStorage');

                        // Create a basic user object from localStorage if not present
                        if (!state.user) {
                            // Try to extract user info from JWT token claims if available
                            const token = authService.getToken();
                            if (token) {
                                try {
                                    // Decode JWT payload (without verification for display purposes only)
                                    const base64Url = token.split('.')[1];
                                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                                    }).join(''));

                                    const payload = JSON.parse(jsonPayload);
                                    console.log('🔍 JWT Payload:', payload);

                                    // Create user object from JWT claims
                                    const userFromToken = {
                                        id: payload.UserId || payload.sub,
                                        email: payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
                                        firstName: payload.FirstName || 'User',
                                        lastName: payload.LastName || '',
                                        fullName: `${payload.FirstName || 'User'} ${payload.LastName || ''}`.trim(),
                                        roles: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
                                            ? [payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']]
                                            : ['User']
                                    };

                                    dispatch({
                                        type: 'UPDATE_USER',
                                        payload: userFromToken,
                                    });
                                } catch (tokenError) {
                                    console.warn('⚠️ Could not decode JWT token:', tokenError);
                                }
                            }
                        }

                        dispatch({ type: 'SET_LOADING', payload: false });
                    } else {
                        // No stored data but token is still valid - extract user from JWT token directly
                        console.log('⚠️ No stored user data found, extracting from JWT token...');
                        try {
                            // Extract user info from current JWT token (don't refresh unless expired)
                            const payload = authService.getJWTPayload();
                            if (payload) {
                                const userFromToken = {
                                    id: payload.UserId || payload.sub,
                                    email: payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
                                    firstName: payload.FirstName || 'User',
                                    lastName: payload.LastName || '',
                                    fullName: `${payload.FirstName || 'User'} ${payload.LastName || ''}`.trim(),
                                    roles: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
                                        ? [payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']]
                                        : ['User']
                                };

                                // Map backend roles to frontend role
                                const storedUserBranches = authService.getUserBranches();
                                const branchRoleName = storedUserBranches.length > 0 ? storedUserBranches[0].branchRoleName : null;

                                const mappedUser = {
                                    ...userFromToken,
                                    role: mapBackendRoleToFrontend(
                                        userFromToken.roles,
                                        branchRoleName,
                                        storedUserBranches
                                    )
                                };

                                dispatch({
                                    type: 'UPDATE_USER',
                                    payload: mappedUser,
                                });

                                console.log('✅ User data extracted from valid JWT token');
                            } else {
                                console.warn('⚠️ Could not extract user data from JWT token');
                            }
                        } catch (extractError) {
                            console.error('❌ Error extracting user from JWT:', extractError);
                        }

                        // Clear loading state - don't refresh token unless it's actually expired
                        dispatch({ type: 'SET_LOADING', payload: false });
                    }
                } catch (error) {
                    console.error('❌ Error loading user data:', error);

                    // Only refresh token if it's actually expired, not just because loading failed
                    if (authService.isTokenExpired()) {
                        console.log('🔄 Token is expired after loading error, attempting refresh...');
                        if (state.refreshToken && !authService.isRefreshTokenExpired()) {
                            try {
                                await refreshToken();
                            } catch (refreshError) {
                                console.error('❌ Error refreshing expired token:', refreshError);
                                logout();
                            }
                        } else {
                            console.log('🚫 No valid refresh token, logging out...');
                            logout();
                        }
                    } else {
                        console.log('⚠️ Loading failed but token is still valid, skipping refresh');
                        // Try to extract user from JWT as fallback
                        try {
                            const payload = authService.getJWTPayload();
                            if (payload) {
                                const userFromToken = {
                                    id: payload.UserId || payload.sub,
                                    email: payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
                                    firstName: payload.FirstName || 'User',
                                    lastName: payload.LastName || '',
                                    fullName: `${payload.FirstName || 'User'} ${payload.LastName || ''}`.trim(),
                                    roles: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
                                        ? [payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']]
                                        : ['User']
                                };

                                const storedUserBranches = authService.getUserBranches();
                                const branchRoleName = storedUserBranches.length > 0 ? storedUserBranches[0].branchRoleName : null;

                                const mappedUser = {
                                    ...userFromToken,
                                    role: mapBackendRoleToFrontend(
                                        userFromToken.roles,
                                        branchRoleName,
                                        storedUserBranches
                                    )
                                };

                                dispatch({
                                    type: 'UPDATE_USER',
                                    payload: mappedUser,
                                });

                                console.log('✅ User data extracted from JWT as fallback');
                            }
                        } catch (fallbackError) {
                            console.warn('⚠️ Could not extract user data as fallback:', fallbackError);
                        }
                    }
                } finally {
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            } else if (state.token && authService.isTokenExpired()) {
                // Token is expired, try to refresh it
                console.log('🔄 Token is expired, attempting refresh...');
                if (state.refreshToken && !authService.isRefreshTokenExpired()) {
                    try {
                        await refreshToken();
                        // Loading state is cleared by refreshToken function
                    } catch (refreshError) {
                        console.error('❌ Error refreshing expired token:', refreshError);
                        logout();
                    }
                } else {
                    console.log('🚫 Refresh token expired, logging out...');
                    logout();
                }
                // Ensure loading is cleared if logout is called
                dispatch({ type: 'SET_LOADING', payload: false });
            } else {
                console.log('ℹ️ No valid token found, skipping user load');
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        loadUser();
    }, []);

    const login = async (credentials, loginType = 'internal') => {
        dispatch({ type: 'LOGIN_START' });
        try {
            console.log('🔐 Attempting login with:', credentials.email, 'Type:', loginType);

            const authData = await authService.login(credentials);

            const branchRoleName = authData.defaultBranch?.branchRoleName ||
                (authData.userBranches && authData.userBranches.length > 0 ? authData.userBranches[0].branchRoleName : null);

            // Map user role
            const mappedRole = mapBackendRoleToFrontend(authData.user?.roles, branchRoleName, authData.userBranches);

            // Kiểm tra xem user có thể đăng nhập qua loại login này không
            const canUseThisLoginType = loginType === 'internal'
                ? canUseInternalLogin(mappedRole, branchRoleName)
                : canUsePublicLogin(mappedRole, branchRoleName);

            if (!canUseThisLoginType) {
                const errorMessage = loginType === 'internal'
                    ? 'Tài khoản này không thể đăng nhập qua trang nội bộ. Vui lòng sử dụng trang chủ.'
                    : 'Tài khoản này chỉ có thể đăng nhập qua trang nội bộ.';

                throw new Error(errorMessage);
            }

            console.log('✅ Login successful:', {
                user: authData.user?.email,
                frontendRole: mappedRole,
                backendRoles: authData.user?.roles,
                branchRoleName: branchRoleName,
                permissions: authData.permissions?.length || 0,
                branches: authData.userBranches?.length || 0,
                isSystemAdmin: authData.isSystemAdmin,
                loginType: loginType
            });

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: authData,
            });

            // Set initial timestamp to prevent immediate refresh after login
            localStorage.setItem('lastTokenRefresh', Date.now().toString());
            localStorage.setItem('loginType', loginType);
        } catch (error) {
            console.error('❌ Login failed:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: errorMessage,
            });
            throw error;
        }
    };

    const refreshToken = async () => {
        try {
            console.log('🔄 Attempting to refresh token...');

            // Track refresh time to prevent too frequent refreshes
            localStorage.setItem('lastTokenRefresh', Date.now().toString());

            const tokenData = await authService.refreshToken();

            console.log('✅ Token refreshed successfully');
            dispatch({
                type: 'REFRESH_TOKEN',
                payload: tokenData,
            });

            // After token refresh, restore user data if it's missing
            if (!state.user) {
                console.log('🔄 Restoring user data after token refresh...');
                try {
                    // Extract user info from new JWT token
                    const payload = authService.getJWTPayload();
                    if (payload) {
                        const userFromToken = {
                            id: payload.UserId || payload.sub,
                            email: payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
                            firstName: payload.FirstName || 'User',
                            lastName: payload.LastName || '',
                            fullName: `${payload.FirstName || 'User'} ${payload.LastName || ''}`.trim(),
                            roles: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
                                ? [payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']]
                                : ['User']
                        };

                        // Map backend roles to frontend role
                        const storedUserBranches = authService.getUserBranches();
                        const branchRoleName = storedUserBranches.length > 0 ? storedUserBranches[0].branchRoleName : null;

                        const mappedUser = {
                            ...userFromToken,
                            role: mapBackendRoleToFrontend(
                                userFromToken.roles,
                                branchRoleName,
                                storedUserBranches
                            )
                        };

                        dispatch({
                            type: 'UPDATE_USER',
                            payload: mappedUser,
                        });

                        console.log('✅ User data restored from JWT token');
                    }
                } catch (userError) {
                    console.warn('⚠️ Could not restore user data from JWT token:', userError);
                }
            }

            // Ensure loading state is cleared after successful refresh
            dispatch({ type: 'SET_LOADING', payload: false });

            console.log('ℹ️ Token refreshed, user data available, loading cleared');
            return true;
        } catch (error) {
            console.error('❌ Token refresh failed:', error);
            // Don't call logout here to avoid circular dependency
            // Instead, dispatch logout action directly
            dispatch({ type: 'LOGOUT' });
            return false;
        }
    };

    const logout = async () => {
        try {
            console.log('🚪 Logging out...');
            await authService.logout();
        } catch (error) {
            console.warn('⚠️ Logout API call failed:', error);
        } finally {
            // Clear refresh timestamp on logout
            // localStorage.removeItem('lastTokenRefresh');
            // localStorage.removeItem('loginType');
            localStorage.clear()

            dispatch({ type: 'LOGOUT' });
            console.log('✅ Logout completed');
        }
    };

    const selectBranch = async (branchId) => {
        try {
            console.log('🏢 Selecting branch:', branchId);
            const branchData = await authService.selectBranch(branchId);

            console.log('✅ Branch selected successfully:', branchData.selectedBranch?.name);
            dispatch({
                type: 'SELECT_BRANCH',
                payload: branchData,
            });

            return branchData;
        } catch (error) {
            console.error('❌ Branch selection failed:', error);
            throw error;
        }
    };

    const updateUser = (updatedUser) => {
        console.log('👤 Updating user:', updatedUser);
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    };

    const changePassword = async (currentPassword, newPassword) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            console.log('🔒 Attempting to change password for user:', state.user?.email);
            await authService.changePassword({
                currentPassword,
                newPassword
            });
            console.log('✅ Password changed successfully');
        } catch (error) {
            console.error('❌ Password change failed:', error);
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };
    const register = async (credentials) => {
        dispatch({ type: 'set_loading', payload: true });
        try {
            console.log('Registering user with:', credentials.email);
            await authService.register(credentials);
            console.log('✅ Registration successful');
            // Don't log in automatically, let the Register component handle registration navigation
            dispatch({ type: 'SET_LOADING', payload: false });
            return true;
        } catch (error) {
            console.error('❌ Registration failed:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
            dispatch({
                type: 'LOGIN_FAILURE', // Reusing LOGIN_FAILURE for error handling
                payload: errorMessage,
            });
            throw error;
        }
    };

    // Permission helper functions
    const hasPermission = (permission) => {
        return authService.hasPermission(permission);
    };

    const hasAnyPermission = (permissionList) => {
        return authService.hasAnyPermission(permissionList);
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    // Enhanced authentication context value
    const contextValue = {
        // User data
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        loading: state.loading,
        error: state.error,

        // Permission data
        permissions: state.permissions,
        hasPermission,
        hasAnyPermission,

        // Branch data
        userBranches: state.userBranches,
        defaultBranch: state.defaultBranch,
        selectedBranch: state.selectedBranch,
        branchRole: state.branchRole,
        isSystemAdmin: state.isSystemAdmin,

        // Login type
        loginType: state.loginType,

        // Role helper functions
        hasAdminAccess: () => hasAdminAccess(state.user?.role),
        shouldUseGuestLayout: () => shouldUseGuestLayout(state.user?.role),

        // Authentication actions
        login,
        logout,
        refreshToken,
        selectBranch,
        updateUser,
        changePassword,
        clearError,
        register,

        // Auth state checks
        isAuthenticated: authService.isAuthenticated(),
        isTokenExpired: authService.isTokenExpired(),
        isRefreshTokenExpired: authService.isRefreshTokenExpired(),
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};