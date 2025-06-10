import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import { mapBackendRoleToFrontend, hasAdminAccess, shouldUseGuestLayout } from '../constants/roles';

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
                loading: false
            };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Token expiration check
    useEffect(() => {
        const checkTokenExpiration = () => {
            if (authService.isTokenExpired()) {
                console.log('🔄 Token expired, attempting refresh...');
                if (state.refreshToken && !authService.isRefreshTokenExpired()) {
                    refreshToken();
                } else {
                    console.log('🚫 Refresh token expired, logging out...');
                    logout();
                }
            }
        };

        // Check immediately and then every 30 seconds
        const tokenCheckInterval = setInterval(checkTokenExpiration, 30000);

        if (state.token) {
            checkTokenExpiration();
        }

        return () => clearInterval(tokenCheckInterval);
    }, [state.token, state.refreshToken]);

    // Load user on app start if token exists
    useEffect(() => {
        const loadUser = async () => {
            if (state.token && !authService.isTokenExpired()) {
                console.log('🔄 Loading user with existing token...');
                dispatch({ type: 'SET_LOADING', payload: true });

                try {
                    const user = await authService.getCurrentUser();
                    console.log('✅ User loaded successfully:', user);

                    // Update user data while preserving other auth state
                    dispatch({
                        type: 'UPDATE_USER',
                        payload: user,
                    });
                } catch (error) {
                    console.error('❌ Error loading user:', error);

                    // Try to refresh token if user fetch fails
                    if (state.refreshToken && !authService.isRefreshTokenExpired()) {
                        try {
                            await refreshToken();
                        } catch (refreshError) {
                            console.error('❌ Error refreshing token:', refreshError);
                            logout();
                        }
                    } else {
                        logout();
                    }
                } finally {
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            } else {
                console.log('ℹ️ No valid token found, skipping user load');
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        loadUser();
    }, []);

    const login = async (credentials) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            console.log('🔐 Attempting login with:', credentials.email);

            const authData = await authService.login(credentials);

            const branchRoleName = authData.defaultBranch?.branchRoleName ||
                (authData.userBranches && authData.userBranches.length > 0 ? authData.userBranches[0].branchRoleName : null);

            console.log('✅ Login successful:', {
                user: authData.user?.email,
                frontendRole: mapBackendRoleToFrontend(authData.user?.roles, branchRoleName, authData.userBranches),
                backendRoles: authData.user?.roles,
                branchRoleName: branchRoleName,
                permissions: authData.permissions?.length || 0,
                branches: authData.userBranches?.length || 0,
                isSystemAdmin: authData.isSystemAdmin
            });

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: authData,
            });
        } catch (error) {
            console.error('❌ Login failed:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: errorMessage,
            });
        }
    };

    const refreshToken = async () => {
        try {
            console.log('🔄 Attempting to refresh token...');
            const tokenData = await authService.refreshToken();

            console.log('✅ Token refreshed successfully');
            dispatch({
                type: 'REFRESH_TOKEN',
                payload: tokenData,
            });

            // Reload user data with new token
            try {
                const user = await authService.getCurrentUser();
                dispatch({
                    type: 'UPDATE_USER',
                    payload: user,
                });
            } catch (userError) {
                console.warn('⚠️ Failed to reload user after token refresh:', userError);
            }

            return true;
        } catch (error) {
            console.error('❌ Token refresh failed:', error);
            logout();
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