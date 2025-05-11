import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { mockAuthService } from '../services/mockAuthService';

const AuthContext = createContext();

const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
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
                loading: false,
                error: null,
            };
        case 'LOGIN_FAILURE':
            return { ...state, loading: false, error: action.payload };
        case 'LOGOUT':
            return { ...initialState, token: null };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const loadUser = async () => {
            if (state.token) {
                try {
                    const user = await mockAuthService.getCurrentUser(state.token);
                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: { user, token: state.token },
                    });
                } catch (error) {
                    dispatch({ type: 'LOGOUT' });
                }
            }
        };

        loadUser();
    }, [state.token]);

    const login = async (credentials) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            const { user, token } = await mockAuthService.login(
                credentials.email,
                credentials.password
            );
            localStorage.setItem('token', token);
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        } catch (error) {
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: error.message || 'Login failed',
            });
        }
    };

    const logout = async () => {
        try {
            await mockAuthService.logout();
        } finally {
            localStorage.removeItem('token');
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