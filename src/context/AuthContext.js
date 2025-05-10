import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api/config';

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
                    const response = await api.get('/auth/me');
                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: { user: response.data, token: state.token },
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
            const response = await api.post('/auth/login', credentials);
            const { user, token } = response.data;
            localStorage.setItem('token', token);
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        } catch (error) {
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: error.response?.data?.message || 'Login failed',
            });
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
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