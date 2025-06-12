import { ROLE_TO_PERMISSION_MAP, ROLES, hasRequiredRole } from '../constants/roles';

/**
 * Migration utility for transitioning from role-based to permission-based access control
 */

/**
 * Check if a user has permission using either the new permission system or legacy role system
 * @param {Object} user - User object with role property
 * @param {string[]} permissions - User's permissions array
 * @param {boolean} isSystemAdmin - Whether user is system admin
 * @param {string|string[]} requiredPermission - Permission(s) to check
 * @param {string} fallbackRole - Fallback role to check if permission check fails
 * @returns {boolean} - Whether user has access
 */
export const hasAccess = (user, permissions, isSystemAdmin, requiredPermission, fallbackRole = null) => {
    // System admins have all access
    if (isSystemAdmin) return true;

    // Check permissions first (new system)
    if (permissions && Array.isArray(permissions)) {
        if (Array.isArray(requiredPermission)) {
            return requiredPermission.some(perm => permissions.includes(perm));
        }
        return permissions.includes(requiredPermission);
    }

    // Fallback to role-based check (legacy system)
    if (fallbackRole && user?.role) {
        return hasRequiredRole(user.role, fallbackRole);
    }

    return false;
};

/**
 * Get permissions for a role (used for migration)
 * @param {string} role - Role constant
 * @returns {string[]} - Array of permissions for the role
 */
export const getPermissionsForRole = (role) => {
    return ROLE_TO_PERMISSION_MAP[role] || [];
};

/**
 * Check if user can access admin features
 * @param {Object} authContext - Auth context object
 * @returns {boolean}
 */
export const canAccessAdmin = ({ user, permissions, isSystemAdmin }) => {
    return hasAccess(
        user,
        permissions,
        isSystemAdmin,
        ['users:view', 'system:settings', 'branches:view'],
        ROLES.ADMIN
    );
};

/**
 * Check if user can manage foods
 * @param {Object} authContext - Auth context object
 * @returns {boolean}
 */
export const canManageFoods = ({ user, permissions, isSystemAdmin }) => {
    return hasAccess(
        user,
        permissions,
        isSystemAdmin,
        ['foods:add', 'foods:edit', 'foods:delete'],
        ROLES.ADMIN
    );
};

/**
 * Check if user can view foods
 * @param {Object} authContext - Auth context object
 * @returns {boolean}
 */
export const canViewFoods = ({ user, permissions, isSystemAdmin }) => {
    return hasAccess(
        user,
        permissions,
        isSystemAdmin,
        'foods:view',
        ROLES.STAFF
    );
};

/**
 * Check if user can manage orders
 * @param {Object} authContext - Auth context object
 * @returns {boolean}
 */
export const canManageOrders = ({ user, permissions, isSystemAdmin }) => {
    return hasAccess(
        user,
        permissions,
        isSystemAdmin,
        ['orders:add', 'orders:edit', 'orders:approve'],
        ROLES.STAFF
    );
};

/**
 * Check if user can view orders
 * @param {Object} authContext - Auth context object
 * @returns {boolean}
 */
export const canViewOrders = ({ user, permissions, isSystemAdmin }) => {
    return hasAccess(
        user,
        permissions,
        isSystemAdmin,
        'orders:view',
        ROLES.STAFF
    );
};

/**
 * Check if user can access kitchen features
 * @param {Object} authContext - Auth context object
 * @returns {boolean}
 */
export const canAccessKitchen = ({ user, permissions, isSystemAdmin }) => {
    return hasAccess(
        user,
        permissions,
        isSystemAdmin,
        ['kitchen:view', 'kitchen:status'],
        ROLES.KITCHEN
    );
};

/**
 * Check if user can access patient features
 * @param {Object} authContext - Auth context object
 * @returns {boolean}
 */
export const canAccessPatients = ({ user, permissions, isSystemAdmin }) => {
    return hasAccess(
        user,
        permissions,
        isSystemAdmin,
        ['patients:view', 'patients:add'],
        ROLES.NURSE
    );
};

/**
 * Check if user can view reports
 * @param {Object} authContext - Auth context object
 * @returns {boolean}
 */
export const canViewReports = ({ user, permissions, isSystemAdmin }) => {
    return hasAccess(
        user,
        permissions,
        isSystemAdmin,
        'reports:view',
        ROLES.MANAGER
    );
};

/**
 * Get user's effective role for display purposes
 * @param {Object} user - User object
 * @param {boolean} isSystemAdmin - Whether user is system admin
 * @returns {string} - Display role
 */
export const getDisplayRole = (user, isSystemAdmin) => {
    if (isSystemAdmin) return 'System Administrator';

    // Map frontend roles to display names
    const roleDisplayMap = {
        [ROLES.ADMIN]: 'Administrator',
        [ROLES.BRANCH_MANAGER]: 'Branch Manager',
        [ROLES.MANAGER]: 'Manager',
        [ROLES.DOCTOR]: 'Doctor',
        [ROLES.NURSE]: 'Nurse',
        [ROLES.CASHIER]: 'Cashier',
        [ROLES.KITCHEN]: 'Kitchen Staff',
        [ROLES.STAFF]: 'Staff',
        [ROLES.PATIENT]: 'Patient',
    };

    return roleDisplayMap[user?.role] || user?.role || 'User';
};

/**
 * Get appropriate redirect path based on user role and permissions
 * @param {Object} authContext - Auth context object
 * @returns {string} - Redirect path
 */
export const getDefaultRedirectPath = ({ user, permissions, isSystemAdmin }) => {
    if (isSystemAdmin || canAccessAdmin({ user, permissions, isSystemAdmin })) {
        return '/dashboard';
    }

    if (canAccessKitchen({ user, permissions, isSystemAdmin })) {
        return '/kitchen';
    }

    if (canAccessPatients({ user, permissions, isSystemAdmin })) {
        return '/nurse/home';
    }

    if (canViewOrders({ user, permissions, isSystemAdmin })) {
        return '/orders';
    }

    return '/dashboard';
};

/**
 * Helper to create permission-aware menu items
 * @param {Object} authContext - Auth context object
 * @returns {Object} - Menu configuration
 */
export const getMenuConfig = (authContext) => {
    const { user, permissions, isSystemAdmin } = authContext;

    return {
        dashboard: hasAccess(user, permissions, isSystemAdmin, 'overview:view', ROLES.STAFF),
        foods: canViewFoods(authContext),
        orders: canViewOrders(authContext),
        kitchen: canAccessKitchen(authContext),
        patients: canAccessPatients(authContext),
        users: canAccessAdmin(authContext),
        reports: canViewReports(authContext),
        settings: hasAccess(user, permissions, isSystemAdmin, 'system:settings', ROLES.ADMIN),
    };
}; 