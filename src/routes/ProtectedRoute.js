import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { ROLE_HIERARCHY, ROLE_TO_PERMISSION_MAP } from '../constants/roles';
import { Spin } from 'antd';

const ProtectedRoute = ({ children, allowedRoles, requiredPermissions, redirectPath }) => {
    const { user, token, loading, refreshToken, permissions, isSystemAdmin } = useAuth();
    const { hasPermission, hasAnyPermission } = usePermissions();
    const location = useLocation();

    console.log('🛡️ Protected Route Check:', {
        user: user?.email,
        userRole: user?.role,
        token: token ? 'Token exists' : 'No token',
        allowedRoles,
        requiredPermissions,
        userPermissions: permissions?.length || 0,
        isSystemAdmin,
        loading
    });

    // Check for token expiration and attempt refresh
    useEffect(() => {
        const tokenExpiry = localStorage.getItem('tokenExpiryTime');
        if (token && tokenExpiry && new Date(tokenExpiry) <= new Date()) {
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
        return children({ user, token, loading, permissions, hasPermission });
    }

    // Check if user is authenticated
    if (!token) {
        // Redirect to login page with return url
        console.log('🚫 No token, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If user object is not loaded yet, show loading
    if (!user) {
        console.log('⏳ User object not loaded yet, showing loading');
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="Loading user data..." />
            </div>
        );
    }

    // System admins have access to everything
    if (isSystemAdmin) {
        console.log('👑 System admin access granted');
        return children;
    }

    // If specific permissions are required, check them first (new system)
    if (requiredPermissions && requiredPermissions.length > 0) {
        const hasRequiredPermission = hasAnyPermission(requiredPermissions);

        console.log('🔐 Permission-based check:', {
            requiredPermissions,
            userPermissions: permissions,
            hasRequiredPermission
        });

        if (!hasRequiredPermission) {
            console.log('🚫 Permission denied, redirecting to unauthorized');
            return <Navigate to={redirectPath || "/unauthorized"} replace />;
        }

        console.log('✅ Permission-based access granted');
        return children;
    }

    // If no specific permissions but roles are required, use legacy role system
    if (allowedRoles && allowedRoles.length > 0) {
        // First, try the legacy role hierarchy check
        const userRoleHierarchy = ROLE_HIERARCHY[user.role] || [];
        const hasRoleAccess = allowedRoles.some(role => userRoleHierarchy.includes(role));

        // If role-based access is granted, check if we can also verify with permissions
        if (hasRoleAccess) {
            console.log('✅ Legacy role-based access granted:', {
                userRole: user.role,
                userRoleHierarchy,
                allowedRoles,
                hasRoleAccess
            });
            return children;
        }

        // If role-based check fails, try to map roles to permissions
        const requiredPermissionsFromRoles = allowedRoles.flatMap(role =>
            ROLE_TO_PERMISSION_MAP[role] || []
        );

        if (requiredPermissionsFromRoles.length > 0) {
            const hasPermissionAccess = hasAnyPermission(requiredPermissionsFromRoles);

            console.log('🔄 Fallback permission check:', {
                allowedRoles,
                mappedPermissions: requiredPermissionsFromRoles,
                hasPermissionAccess
            });

            if (hasPermissionAccess) {
                console.log('✅ Permission-mapped role access granted');
                return children;
            }
        }

        console.log('🚫 Role and permission checks failed, redirecting to unauthorized');
        return <Navigate to={redirectPath || "/unauthorized"} replace />;
    }

    // If no specific roles or permissions are required, just check authentication
    console.log('✅ No specific requirements, authenticated access granted');
    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.func
    ]).isRequired,
    allowedRoles: PropTypes.array, // Legacy role-based access
    requiredPermissions: PropTypes.array, // New permission-based access
    redirectPath: PropTypes.string,
};

export default ProtectedRoute;