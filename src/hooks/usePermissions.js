import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for permission management
 * Provides easy access to permission checking functions
 */
export const usePermissions = () => {
    const {
        permissions,
        hasPermission,
        hasAnyPermission,
        isSystemAdmin,
        user
    } = useAuth();

    /**
     * Check if user has specific permission
     * @param {string} permission - Permission to check
     * @returns {boolean} - True if user has permission
     */
    const checkPermission = (permission) => {
        // System admins have all permissions
        if (isSystemAdmin) return true;

        return hasPermission(permission);
    };

    /**
     * Check if user has any of the provided permissions
     * @param {string[]} permissionList - Array of permissions to check
     * @returns {boolean} - True if user has any of the permissions
     */
    const checkAnyPermission = (permissionList) => {
        // System admins have all permissions
        if (isSystemAdmin) return true;

        return hasAnyPermission(permissionList);
    };

    /**
     * Check if user has all of the provided permissions
     * @param {string[]} permissionList - Array of permissions to check
     * @returns {boolean} - True if user has all permissions
     */
    const checkAllPermissions = (permissionList) => {
        // System admins have all permissions
        if (isSystemAdmin) return true;

        return permissionList.every(permission => hasPermission(permission));
    };

    /**
     * Get permissions for a specific module
     * @param {string} module - Module name (e.g., 'foods', 'orders', 'users')
     * @returns {string[]} - Array of permissions for the module
     */
    const getModulePermissions = (module) => {
        return permissions.filter(permission => permission.startsWith(`${module}:`));
    };

    /**
     * Check if user can perform CRUD operations on a module
     * @param {string} module - Module name
     * @returns {object} - Object with view, add, edit, delete permissions
     */
    const getModuleCRUDPermissions = (module) => {
        return {
            view: checkPermission(`${module}:view`),
            add: checkPermission(`${module}:add`),
            edit: checkPermission(`${module}:edit`),
            delete: checkPermission(`${module}:delete`),
        };
    };

    /**
     * Permission constants for common checks
     */
    const PERMISSIONS = {
        // Overview
        OVERVIEW_VIEW: 'overview:view',

        // Foods management
        FOODS_VIEW: 'foods:view',
        FOODS_ADD: 'foods:add',
        FOODS_EDIT: 'foods:edit',
        FOODS_DELETE: 'foods:delete',

        // Food categories
        FOOD_CATEGORIES_VIEW: 'foodcategories:view',
        FOOD_CATEGORIES_ADD: 'foodcategories:add',
        FOOD_CATEGORIES_EDIT: 'foodcategories:edit',
        FOOD_CATEGORIES_DELETE: 'foodcategories:delete',

        // Orders
        ORDERS_VIEW: 'orders:view',
        ORDERS_ADD: 'orders:add',
        ORDERS_EDIT: 'orders:edit',
        ORDERS_DELETE: 'orders:delete',
        ORDERS_APPROVE: 'orders:approve',
        ORDERS_CANCEL: 'orders:cancel',

        // Menus
        MENUS_VIEW: 'menus:view',
        MENUS_ADD: 'menus:add',
        MENUS_EDIT: 'menus:edit',
        MENUS_DELETE: 'menus:delete',
        MENUS_PUBLISH: 'menus:publish',

        // Kitchen
        KITCHEN_VIEW: 'kitchen:view',
        KITCHEN_STATUS: 'kitchen:status',
        KITCHEN_PREPARE: 'kitchen:prepare',
        KITCHEN_COMPLETE: 'kitchen:complete',

        // Delivery
        DELIVERY_VIEW: 'delivery:view',
        DELIVERY_ASSIGN: 'delivery:assign',
        DELIVERY_STATUS: 'delivery:status',
        DELIVERY_COMPLETE: 'delivery:complete',

        // Users
        USERS_VIEW: 'users:view',
        USERS_ADD: 'users:add',
        USERS_EDIT: 'users:edit',
        USERS_DELETE: 'users:delete',
        USERS_ROLES: 'users:roles',

        // Patients
        PATIENTS_VIEW: 'patients:view',
        PATIENTS_ADD: 'patients:add',
        PATIENTS_EDIT: 'patients:edit',
        PATIENTS_DELETE: 'patients:delete',
        PATIENTS_DIETARY: 'patients:dietary',

        // Branches
        BRANCHES_VIEW: 'branches:view',
        BRANCHES_ADD: 'branches:add',
        BRANCHES_EDIT: 'branches:edit',
        BRANCHES_DELETE: 'branches:delete',
        BRANCHES_SETTINGS: 'branches:settings',

        // Reports
        REPORTS_VIEW: 'reports:view',
        REPORTS_REVENUE: 'reports:revenue',
        REPORTS_ORDERS: 'reports:orders',
        REPORTS_PATIENTS: 'reports:patients',
        REPORTS_EXPORT: 'reports:export',

        // Wallet
        WALLET_VIEW: 'wallet:view',
        WALLET_TRANSACTIONS: 'wallet:transactions',
        WALLET_TOPUP: 'wallet:topup',
        WALLET_REFUND: 'wallet:refund',

        // System
        SYSTEM_SETTINGS: 'system:settings',
        SYSTEM_BACKUP: 'system:backup',
        SYSTEM_LOGS: 'system:logs',
        SYSTEM_MAINTENANCE: 'system:maintenance',

        // Areas
        AREAS_VIEW: 'areas:view',
        AREAS_ADD: 'areas:add',
        AREAS_EDIT: 'areas:edit',
        AREAS_DELETE: 'areas:delete',

        // Locations
        LOCATIONS_VIEW: 'locations:view',
        LOCATIONS_ADD: 'locations:add',
        LOCATIONS_EDIT: 'locations:edit',
        LOCATIONS_DELETE: 'locations:delete',
    };

    return {
        // Current permissions
        permissions,
        isSystemAdmin,

        // Permission checking functions
        hasPermission: checkPermission,
        hasAnyPermission: checkAnyPermission,
        hasAllPermissions: checkAllPermissions,

        // Module-specific helpers
        getModulePermissions,
        getModuleCRUDPermissions,

        // Permission constants
        PERMISSIONS,

        // Common permission checks
        canViewOverview: checkPermission(PERMISSIONS.OVERVIEW_VIEW),
        canManageFoods: checkAnyPermission([
            PERMISSIONS.FOODS_ADD,
            PERMISSIONS.FOODS_EDIT,
            PERMISSIONS.FOODS_DELETE
        ]),
        canManageOrders: checkAnyPermission([
            PERMISSIONS.ORDERS_ADD,
            PERMISSIONS.ORDERS_EDIT,
            PERMISSIONS.ORDERS_DELETE,
            PERMISSIONS.ORDERS_APPROVE
        ]),
        canManageUsers: checkAnyPermission([
            PERMISSIONS.USERS_ADD,
            PERMISSIONS.USERS_EDIT,
            PERMISSIONS.USERS_DELETE,
            PERMISSIONS.USERS_ROLES
        ]),
        canViewReports: checkPermission(PERMISSIONS.REPORTS_VIEW),
        canManageSystem: checkAnyPermission([
            PERMISSIONS.SYSTEM_SETTINGS,
            PERMISSIONS.SYSTEM_BACKUP,
            PERMISSIONS.SYSTEM_LOGS
        ]),
    };
};

export default usePermissions; 