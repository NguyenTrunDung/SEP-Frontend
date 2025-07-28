import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { ROLE_HIERARCHY, ROLE_TO_PERMISSION_MAP, isAdminRoute, canAccessAdminRoutes } from '../constants/roles';
import { Spin } from 'antd';
import environment from '../config/environment';

const ProtectedRoute = ({ children, allowedRoles, requiredPermissions, redirectPath }) => {
    const { user, token, loading, refreshToken, permissions, isSystemAdmin, loginType } = useAuth();
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
        loading,
        loginType
    });

    // Check for token expiration and attempt refresh
    useEffect(() => {
        const handleTokenExpiration = async () => {
            if (token && !loading) {
                const tokenExpiry = localStorage.getItem('tokenExpiryTime');
                if (tokenExpiry && new Date(tokenExpiry) <= new Date()) {
                    console.log('🔄 ProtectedRoute: Token expired, attempting refresh...');

                    // Only attempt refresh if not already in progress
                    if (!window.isRefreshingToken) {
                        try {
                            await refreshToken();
                        } catch (error) {
                            console.error('❌ ProtectedRoute: Token refresh failed:', error);
                            // Let AuthContext handle the logout
                        }
                    }
                }
            }
        };

        handleTokenExpiration();
    }, [token, refreshToken, loading]);

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
        // Redirect to appropriate login page based on current route
        const isInternalRoute = location.pathname.startsWith('/admin') ||
            location.pathname.startsWith('/dashboard') ||
            location.pathname.startsWith('/orders') ||
            location.pathname.startsWith('/menus') ||
            location.pathname.startsWith('/foods') ||
            location.pathname.startsWith('/branches') ||
            location.pathname.startsWith('/departments') ||
            location.pathname.startsWith('/areas') ||
            location.pathname.startsWith('/locations') ||
            location.pathname.startsWith('/disease-categories') ||
            location.pathname.startsWith('/food-for-patients') ||
            location.pathname.startsWith('/feedbacks') ||
            location.pathname.startsWith('/kitchens') ||
            location.pathname.startsWith('/test');

        const loginPath = isInternalRoute ? '/login' : '/';
        console.log('🚫 No token, redirecting to:', loginPath);
        return <Navigate to={loginPath} state={{ from: location }} replace />;
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

    // Kiểm tra nếu user đăng nhập qua public login và cố gắng truy cập admin routes
    if (loginType === 'public' && allowedRoles && isAdminRoute(allowedRoles)) {
        console.log('🚫 Public login user cannot access admin routes, redirecting to unauthorized');
        return <Navigate to={redirectPath || "/unauthorized"} replace />;
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
        console.log('🔐 Role-based access check:', {
            userRole: user.role,
            allowedRoles,
            isAdminRoute: isAdminRoute(allowedRoles),
            canAccessAdmin: canAccessAdminRoutes(user.role)
        });

        // Kiểm tra trực tiếp role có trong danh sách allowedRoles không
        const hasDirectRoleAccess = allowedRoles.includes(user.role);

        if (hasDirectRoleAccess) {
            console.log('✅ Direct role-based access granted:', {
                userRole: user.role,
                allowedRoles,
                hasDirectRoleAccess
            });
            return children;
        }

        // Kiểm tra nếu đây là admin route và user không có quyền truy cập admin
        if (isAdminRoute(allowedRoles) && !canAccessAdminRoutes(user.role)) {
            console.log('🚫 User cannot access admin routes, redirecting to unauthorized');
            return <Navigate to={redirectPath || "/unauthorized"} replace />;
        }

        // Fallback: thử kiểm tra hierarchy cho các role khác (không phải admin routes)
        const userRoleHierarchy = ROLE_HIERARCHY[user.role] || [];
        const hasRoleAccess = allowedRoles.some(role => userRoleHierarchy.includes(role));

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

// Component to redirect authenticated users away from login/register pages
export const AuthRedirect = ({ children, roleHomeRedirects }) => {
    const { user, token, loading, loginType } = useAuth();
    const location = useLocation();

    // if (environment.features.enableLogging) {
    //     console.log('🔄 AuthRedirect Check:', {
    //         user: user?.email,
    //         userRole: user?.role,
    //         token: token ? 'Token exists' : 'No token',
    //         loading,
    //         currentPath: location.pathname,
    //         loginType
    //     });
    // }

    // Show loading state if auth is still being determined
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="Checking authentication..." />
            </div>
        );
    }

    // If user is authenticated, redirect to their role-specific home
    if (token && user?.role) {
        let redirectPath = roleHomeRedirects[user.role] || '/dashboard';

        // Nếu user đăng nhập qua public login và là NURSE, redirect về /nurse/home
        if (loginType === 'public' && user.role === 'NURSE') {
            redirectPath = '/nurse/home';
        } else if (loginType === 'public') {
            redirectPath = '/';
        }

        // Tránh vòng lặp redirect - nếu đã ở trang đích thì không redirect nữa
        if (location.pathname === redirectPath) {
            return children;
        }

        // console.log(`✅ User is authenticated, redirecting from ${location.pathname} to ${redirectPath}`);

        // Preserve any state from the previous navigation (like "from" location)
        const state = location.state?.from ? { from: location.state.from } : undefined;
        return <Navigate to={redirectPath} replace state={state} />;
    }

    // If user is not authenticated, show the children (login/register page)
    // console.log('ℹ️ User not authenticated, showing auth page');
    return children;
};

AuthRedirect.propTypes = {
    children: PropTypes.node.isRequired,
    roleHomeRedirects: PropTypes.object.isRequired,
};

export default ProtectedRoute;