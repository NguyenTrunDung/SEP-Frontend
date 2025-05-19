import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { login as authLogin, getCurrentUser, refreshToken as authRefreshToken, logout as authLogout } from '../services/mockAuthService';

const AuthContext = createContext();

const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    loading: true, // Start with loading true
    error: null,
    tokenExpiry: localStorage.getItem('tokenExpiry') ? parseInt(localStorage.getItem('tokenExpiry')) : null,
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return { ...state, loading: true, error: null };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                refreshToken: action.payload.refreshToken,
                tokenExpiry: action.payload.tokenExpiry,
                loading: false,
                error: null,
            };
        case 'REFRESH_TOKEN':
            return {
                ...state,
                token: action.payload.token,
                refreshToken: action.payload.refreshToken,
                tokenExpiry: action.payload.tokenExpiry,
            };
        case 'LOGIN_FAILURE':
            return { ...state, loading: false, error: action.payload };
        case 'LOGOUT':
            return { ...initialState, token: null, refreshToken: null, tokenExpiry: null, loading: false };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check token expiration periodically
    useEffect(() => {
        const checkTokenExpiration = () => {
            if (state.tokenExpiry && Date.now() > state.tokenExpiry) {
                // Token has expired
                console.log('Token expired, attempting refresh');
                if (state.refreshToken) {
                    refreshToken();
                } else {
                    logout();
                }
            }
        };

        const tokenCheckInterval = setInterval(checkTokenExpiration, 30000); // Check every 30 seconds

        // Check immediately on mount
        if (state.token) {
            checkTokenExpiration();
        }

        return () => clearInterval(tokenCheckInterval);
    }, [state.token, state.tokenExpiry, state.refreshToken]);

    useEffect(() => {
        const loadUser = async () => {
            if (state.token) {
                console.log('Loading user with token:', state.token ? state.token.substring(0, 15) + '...' : null);
                dispatch({ type: 'SET_LOADING', payload: true });

                try {
                    const user = await getCurrentUser(state.token);
                    console.log('User loaded successfully:', user);
                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: {
                            user,
                            token: state.token,
                            refreshToken: state.refreshToken,
                            tokenExpiry: state.tokenExpiry
                        },
                    });
                } catch (error) {
                    console.error('Error loading user:', error);
                    // If getting user fails, try to refresh token
                    if (state.refreshToken) {
                        try {
                            await refreshToken();
                        } catch (refreshError) {
                            console.error('Error refreshing token:', refreshError);
                            logout();
                        }
                    } else {
                        logout();
                    }
                } finally {
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            } else {
                console.log('No token found, skipping user load');
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        loadUser();
    }, [state.token]);

    const login = async (credentials) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            console.log('Attempting login with:', credentials.email);
            const { user, token, refreshToken, expiresIn = 3600 } = await authLogin(
                credentials.email,
                credentials.password
            );

            // Calculate token expiry (current time + expiresIn seconds)
            const tokenExpiry = Date.now() + (expiresIn * 1000);

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('tokenExpiry', tokenExpiry.toString());

            console.log('Login successful:', { user, tokenExists: !!token });
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, token, refreshToken, tokenExpiry }
            });
        } catch (error) {
            console.error('Login failed:', error);
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: error.message || 'Login failed',
            });
        }
    };

    const refreshToken = async () => {
        try {
            console.log('Attempting to refresh token with:', state.refreshToken ? 'refresh token exists' : 'no refresh token');
            const { token, refreshToken: newRefreshToken, expiresIn = 3600 } =
                await authRefreshToken(state.refreshToken);

            // Calculate new token expiry
            const tokenExpiry = Date.now() + (expiresIn * 1000);

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', newRefreshToken);
            localStorage.setItem('tokenExpiry', tokenExpiry.toString());

            console.log('Token refreshed successfully');
            dispatch({
                type: 'REFRESH_TOKEN',
                payload: { token, refreshToken: newRefreshToken, tokenExpiry }
            });

            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            logout();
            return false;
        }
    };

    const logout = async () => {
        try {
            console.log('Logging out');
            await authLogout();
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('tokenExpiry');
            dispatch({ type: 'LOGOUT' });
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user: state.user,
                token: state.token,
                loading: state.loading,
                error: state.error,
                login,
                logout,
                refreshToken,
            }}
        >
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