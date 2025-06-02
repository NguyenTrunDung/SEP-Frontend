import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { ROLE_HIERARCHY } from '../constants/roles';
import { Spin } from 'antd';

const ProtectedRoute = ({ children, allowedRoles, redirectPath }) => {
    const { user, token, loading, refreshToken } = useAuth();
    const location = useLocation();

    console.log('Protected Route:', {
        user,
        token: token ? 'Token exists' : 'No token',
        userRole: user?.role,
        allowedRoles,
        loading
    });

    // Check for token expiration and attempt refresh
    useEffect(() => {
        const tokenExpiry = localStorage.getItem('tokenExpiry');
        if (token && tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
            refreshToken().catch(() => {
                // Will be handled by the AuthContext logout
            });
        }
    }, [token, refreshToken]);

    // Show loading state if auth is still being determined
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="Verifying authentication..." />
            </div>
        );
    }

    // Handle function as children for dynamic rendering (like redirects)
    if (typeof children === 'function') {
        return children({ user, token, loading });
    }

    // Check if user is authenticated
    if (!token) {
        // Redirect to login page with return url
        console.log('No token, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If no specific roles are required, just check authentication
    if (!allowedRoles || allowedRoles.length === 0) {
        console.log('No roles required, allowing access');
        return children;
    }

    // If user object is not loaded yet, show loading
    if (!user) {
        console.log('User object not loaded yet, showing loading');
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="Loading user data..." />
            </div>
        );
    }

    // Check if user has any of the allowed roles
    // We need to check if the user role can access any of the required roles
    const userRoleHierarchy = ROLE_HIERARCHY[user.role] || [];
    const hasPermission = allowedRoles.some(role => userRoleHierarchy.includes(role));
    console.log('Role check:', {
        userRole: user.role,
        userRoleHierarchy,
        allowedRoles,
        hasPermission
    });

    if (!hasPermission) {
        // Redirect to custom path if provided or default unauthorized page
        console.log('User does not have permission, redirecting to unauthorized');
        return <Navigate to={redirectPath || "/unauthorized"} replace />;
    }

    console.log('Access granted');
    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.func
    ]).isRequired,
    allowedRoles: PropTypes.array,
    redirectPath: PropTypes.string,
};

export default ProtectedRoute;