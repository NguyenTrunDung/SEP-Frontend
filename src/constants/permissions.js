/**
 * Permission-based Access Control Configuration
 * This file defines all permissions and their mappings to routes and UI elements
 */

// All available permissions in the system
export const PERMISSIONS = {
    // Overview/Dashboard
    OVERVIEW_VIEW: 'overview:view',

    // Food Management
    FOODS_VIEW: 'foods:view',
    FOODS_ADD: 'foods:add',
    FOODS_EDIT: 'foods:edit',
    FOODS_DELETE: 'foods:delete',

    // Food Categories
    FOODCATEGORIES_VIEW: 'foodcategories:view',
    FOODCATEGORIES_ADD: 'foodcategories:add',
    FOODCATEGORIES_EDIT: 'foodcategories:edit',
    FOODCATEGORIES_DELETE: 'foodcategories:delete',

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

    // Departments
    DEPARTMENTS_VIEW: 'departments:view',
    DEPARTMENTS_ADD: 'departments:add',
    DEPARTMENTS_EDIT: 'departments:edit',
    DEPARTMENTS_DELETE: 'departments:delete',

    // Disease Categories
    DISEASECATEGORIES_VIEW: 'diseasecategories:view',
    DISEASECATEGORIES_ADD: 'diseasecategories:add',
    DISEASECATEGORIES_EDIT: 'diseasecategories:edit',
    DISEASECATEGORIES_DELETE: 'diseasecategories:delete',

    // Feedbacks
    FEEDBACKS_VIEW: 'feedbacks:view',
    FEEDBACKS_REPLY: 'feedbacks:reply',
    FEEDBACKS_DELETE: 'feedbacks:delete',

    // Order Patients
    ORDERPATIENTS_VIEW: 'orderpatients:view',
    ORDERPATIENTS_ADD: 'orderpatients:add',
    ORDERPATIENTS_EDIT: 'orderpatients:edit',
    ORDERPATIENTS_DELETE: 'orderpatients:delete',
    ORDERPATIENTS_APPROVE: 'orderpatients:approve',
    ORDERPATIENTS_CANCEL: 'orderpatients:cancel',
    ORDERPATIENTS_STATUS: 'orderpatients:status',

    // Food for Patients
    FOODFORPATIENTS_VIEW: 'foodforpatients:view',
    FOODFORPATIENTS_ADD: 'foodforpatients:add',
    FOODFORPATIENTS_EDIT: 'foodforpatients:edit',
    FOODFORPATIENTS_DELETE: 'foodforpatients:delete',
    // FOODFORPATIENTS_RESTRICTIONS: 'foodforpatients:restrictions',

    // Group Users
    GROUPUSERS_VIEW: 'groupusers:view',
    GROUPUSERS_ADD: 'groupusers:add',
    GROUPUSERS_EDIT: 'groupusers:edit',
    GROUPUSERS_DELETE: 'groupusers:delete',
    GROUPUSERS_PERMISSIONS: 'groupusers:permissions',

    // User Accounts
    USERACCOUNTS_VIEW: 'useraccounts:view',
    USERACCOUNTS_ADD: 'useraccounts:add',
    USERACCOUNTS_EDIT: 'useraccounts:edit',
    USERACCOUNTS_DELETE: 'useraccounts:delete',
    USERACCOUNTS_STATUS: 'useraccounts:status',

    // Wallet
    WALLET_VIEW: 'wallet:view',
    WALLET_TRANSACTIONS: 'wallet:transactions',
    WALLET_TOPUP: 'wallet:topup',
    WALLET_REFUND: 'wallet:refund',

    // Reports
    REPORTS_VIEW: 'reports:view',
    REPORTS_REVENUE: 'reports:revenue',
    REPORTS_ORDERS: 'reports:orders',
    REPORTS_PATIENTS: 'reports:patients',
    REPORTS_EXPORT: 'reports:export',

    // System Settings
    SYSTEM_SETTINGS: 'system:settings',
    SYSTEM_BACKUP: 'system:backup',
    SYSTEM_LOGS: 'system:logs',
    SYSTEM_MAINTENANCE: 'system:maintenance',

    // Shippers
    SHIPPERS_VIEW: 'shippers:view',
    SHIPPERS_ASSIGN: 'shippers:assign',
    SHIPPERS_STATUS: 'shippers:status',
};

// Route to permission mapping
export const ROUTE_PERMISSIONS = {
    '/dashboard': [PERMISSIONS.OVERVIEW_VIEW],
    '/orders': [PERMISSIONS.ORDERS_VIEW],
    '/orders/:id': [PERMISSIONS.ORDERS_VIEW],
    '/order-patients': [PERMISSIONS.ORDERPATIENTS_VIEW],
    '/kitchens': [PERMISSIONS.KITCHEN_VIEW],
    '/feedbacks': [PERMISSIONS.FEEDBACKS_VIEW],
    '/shippers': [PERMISSIONS.SHIPPERS_VIEW],
    '/branches': [PERMISSIONS.BRANCHES_VIEW],
    '/departments': [PERMISSIONS.DEPARTMENTS_VIEW],
    '/menus': [PERMISSIONS.MENUS_VIEW],
    '/food-categories': [PERMISSIONS.FOODCATEGORIES_VIEW],
    '/foods': [PERMISSIONS.FOODS_VIEW],
    '/areas': [PERMISSIONS.AREAS_VIEW],
    '/locations': [PERMISSIONS.LOCATIONS_VIEW],
    '/disease-categories': [PERMISSIONS.DISEASECATEGORIES_VIEW],
    '/food-for-patients': [PERMISSIONS.FOODFORPATIENTS_VIEW],
    '/admin/user-management': [PERMISSIONS.WALLET_VIEW, PERMISSIONS.USERS_VIEW],
    '/admin/group-user': [PERMISSIONS.GROUPUSERS_VIEW],
    '/admin/user-account': [PERMISSIONS.USERACCOUNTS_VIEW],
    '/admin/settings': [PERMISSIONS.SYSTEM_SETTINGS],
    '/admin/profile': [], // No specific permission required for profile
    '/admin/edit-profile/:id': [], // No specific permission required for own profile
    '/admin/change-password/:id': [], // No specific permission required for own password
    '/test/images': [PERMISSIONS.SYSTEM_SETTINGS],
    '/test/vnpay': [PERMISSIONS.SYSTEM_SETTINGS],
};

// Menu item to permission mapping for AdminLayout
export const MENU_PERMISSIONS = {
    dashboard: [PERMISSIONS.OVERVIEW_VIEW],
    orders: [PERMISSIONS.ORDERS_VIEW],
    shippers: [PERMISSIONS.SHIPPERS_VIEW],
    menus: [PERMISSIONS.MENUS_VIEW],
    feedbacks: [PERMISSIONS.FEEDBACKS_VIEW],
    'food-categories': [PERMISSIONS.FOODCATEGORIES_VIEW],
    foods: [PERMISSIONS.FOODS_VIEW],
    'food-for-patients': [PERMISSIONS.FOODS_VIEW, PERMISSIONS.PATIENTS_DIETARY],
    'user-management': [PERMISSIONS.WALLET_VIEW, PERMISSIONS.USERS_VIEW],
    'group-user': [PERMISSIONS.USERS_ROLES, PERMISSIONS.SYSTEM_SETTINGS],
    'user-account': [PERMISSIONS.USERS_VIEW],
    branches: [PERMISSIONS.BRANCHES_VIEW],
    areas: [PERMISSIONS.AREAS_VIEW],
    locations: [PERMISSIONS.LOCATIONS_VIEW],
    departments: [PERMISSIONS.DEPARTMENTS_VIEW],
    'disease-categories': [PERMISSIONS.DISEASECATEGORIES_VIEW],
    settings: [PERMISSIONS.SYSTEM_SETTINGS],
    kitchen: [PERMISSIONS.KITCHEN_VIEW],
};

// Permission groups for easier management
export const PERMISSION_GROUPS = {
    FOOD_MANAGEMENT: [
        PERMISSIONS.FOODS_VIEW,
        PERMISSIONS.FOODS_ADD,
        PERMISSIONS.FOODS_EDIT,
        PERMISSIONS.FOODS_DELETE,
        PERMISSIONS.FOODCATEGORIES_VIEW,
        PERMISSIONS.FOODCATEGORIES_ADD,
        PERMISSIONS.FOODCATEGORIES_EDIT,
        PERMISSIONS.FOODCATEGORIES_DELETE,
    ],
    ORDER_MANAGEMENT: [
        PERMISSIONS.ORDERS_VIEW,
        PERMISSIONS.ORDERS_ADD,
        PERMISSIONS.ORDERS_EDIT,
        PERMISSIONS.ORDERS_DELETE,
        PERMISSIONS.ORDERS_APPROVE,
        PERMISSIONS.ORDERS_CANCEL,
    ],
    USER_MANAGEMENT: [
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.USERS_ADD,
        PERMISSIONS.USERS_EDIT,
        PERMISSIONS.USERS_DELETE,
        PERMISSIONS.USERS_ROLES,
    ],
    SYSTEM_ADMIN: [
        PERMISSIONS.SYSTEM_SETTINGS,
        PERMISSIONS.SYSTEM_BACKUP,
        PERMISSIONS.SYSTEM_LOGS,
        PERMISSIONS.SYSTEM_MAINTENANCE,
        PERMISSIONS.BRANCHES_SETTINGS,
    ],
};

// Helper function to check if user has any of the required permissions
export const hasAnyPermission = (userPermissions, requiredPermissions) => {
    if (!userPermissions || !requiredPermissions) return false;
    if (requiredPermissions.length === 0) return true; // No permissions required
    return requiredPermissions.some(permission => userPermissions.includes(permission));
};

// Helper function to check if user has all required permissions
export const hasAllPermissions = (userPermissions, requiredPermissions) => {
    if (!userPermissions || !requiredPermissions) return false;
    if (requiredPermissions.length === 0) return true; // No permissions required
    return requiredPermissions.every(permission => userPermissions.includes(permission));
};

// Helper function to get required permissions for a route
export const getRoutePermissions = (pathname) => {
    // Handle dynamic routes (e.g., /orders/123 should match /orders/:id)
    for (const route in ROUTE_PERMISSIONS) {
        if (route.includes(':')) {
            // Convert route pattern to regex
            const pattern = route.replace(/:[^\s/]+/g, '[^/]+');
            const regex = new RegExp(`^${pattern}$`);
            if (regex.test(pathname)) {
                return ROUTE_PERMISSIONS[route];
            }
        }
    }

    // Direct match
    return ROUTE_PERMISSIONS[pathname] || [];
};

// Helper function to check if a user can access a specific route
export const canAccessRoute = (userPermissions, pathname) => {
    const requiredPermissions = getRoutePermissions(pathname);
    return hasAnyPermission(userPermissions, requiredPermissions);
};

export default PERMISSIONS;
