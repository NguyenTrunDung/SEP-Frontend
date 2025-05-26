import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { login as authLogin, getCurrentUser, refreshToken as authRefreshToken, logout as authLogout, changePassword as authChangePassword } from '../services/mockAuthService';
import { mockUsers } from '../mocks/authData';

const AuthContext = createContext();

const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    loading: true,
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
        case 'UPDATE_USER':
            return {
                ...state,
                user: action.payload,
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

    useEffect(() => {
        const checkTokenExpiration = () => {
            if (state.tokenExpiry && Date.now() > state.tokenExpiry) {
                console.log('Token expired, attempting refresh');
                if (state.refreshToken) {
                    refreshToken();
                } else {
                    logout();
                }
            }
        };

        const tokenCheckInterval = setInterval(checkTokenExpiration, 30000);

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
                            tokenExpiry: state.tokenExpiry,
                        },
                    });
                } catch (error) {
                    console.error('Error loading user:', error);
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

            const tokenExpiry = Date.now() + (expiresIn * 1000);

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('tokenExpiry', tokenExpiry.toString());

            console.log('Login successful:', { user, tokenExists: !!token });
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, token, refreshToken, tokenExpiry },
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
            console.log('Attempting to refresh token');
            const { token, refreshToken: newRefreshToken, expiresIn = 3600 } = await authRefreshToken(state.refreshToken);

            const tokenExpiry = Date.now() + (expiresIn * 1000);

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', newRefreshToken);
            localStorage.setItem('tokenExpiry', tokenExpiry.toString());

            console.log('Token refreshed successfully');
            dispatch({
                type: 'REFRESH_TOKEN',
                payload: { token, refreshToken: newRefreshToken, tokenExpiry },
            });

            const user = await getCurrentUser(token);
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    user,
                    token,
                    refreshToken: newRefreshToken,
                    tokenExpiry,
                },
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

    const updateUser = (updatedUser) => {
        console.log('Updating user:', updatedUser);
        const updatedUserData = { ...state.user, ...updatedUser };
        dispatch({ type: 'UPDATE_USER', payload: updatedUserData });
        const userIndex = mockUsers.findIndex((u) => u.id === updatedUser.id);
        if (userIndex !== -1) {
            mockUsers[userIndex] = { ...mockUsers[userIndex], ...updatedUser };
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            console.log('Attempting to change password for user:', state.user.email);
            const updatedUser = await authChangePassword(state.user.id, currentPassword, newPassword);
            dispatch({ type: 'UPDATE_USER', payload: updatedUser });
            console.log('Password changed successfully');
        } catch (error) {
            console.error('Password change failed:', error);
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
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
                updateUser,
                changePassword,
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