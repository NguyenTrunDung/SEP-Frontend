export const ROLES = {
    // Frontend role constants
    ADMIN: 'ADMIN',
    DOCTOR: 'DOCTOR',
    NURSE: 'NURSE',
    CASHIER: 'CASHIER',
    PATIENT: 'PATIENT',
    STAFF: 'STAFF',
    CUSTOMER: 'CUSTOMER',
    GUEST: 'GUEST',
    // New backend roles
    MANAGER: 'MANAGER',
    BRANCH_MANAGER: 'BRANCH_MANAGER',
    KITCHEN: 'KITCHEN',
    // System admin
    SYSTEM_ADMIN: 'SYSTEM_ADMIN',
};

// Backend Identity roles (from API response user.roles array)
export const BACKEND_IDENTITY_ROLES = {
    SYSTEM_ADMIN: 'SystemAdmin',
    STAFF: 'Staff',
    PATIENT: 'Patient',
    GUEST: 'Guest',
};

// Branch role names (Vietnamese names from branchRoleName field)
export const BRANCH_ROLE_NAMES = {
    ADMIN_SYSTEM: 'Admin System',
    BRANCH_MANAGER: 'Quản lý chi nhánh',
    MANAGER: 'Quản lý',
    CASHIER: 'Thu Ngân',
    STAFF: 'Nhân viên',
    KITCHEN: 'Nhà bếp',
    NURSE: 'Y tá',
    DOCTOR: 'Bác sĩ',
};

// Map backend Identity roles + Branch roles to frontend role constants
export const mapBackendRoleToFrontend = (identityRoles, branchRoleName = null, userBranches = []) => {
    if (!identityRoles || !Array.isArray(identityRoles)) return ROLES.GUEST;

    // Handle SystemAdmin (highest priority)
    if (identityRoles.includes(BACKEND_IDENTITY_ROLES.SYSTEM_ADMIN)) {
        return ROLES.SYSTEM_ADMIN;
    }

    // Handle Patient
    if (identityRoles.includes(BACKEND_IDENTITY_ROLES.PATIENT)) {
        return ROLES.PATIENT;
    }

    // Handle Guest
    if (identityRoles.includes(BACKEND_IDENTITY_ROLES.GUEST)) {
        return ROLES.GUEST;
    }

    // Handle Staff Identity role - need to check branch role
    if (identityRoles.includes(BACKEND_IDENTITY_ROLES.STAFF)) {
        // If no branch data, default to guest
        if (!branchRoleName && (!userBranches || userBranches.length === 0)) {
            return ROLES.GUEST;
        }

        // Get the branch role name (use provided or get from first branch)
        const effectiveBranchRole = branchRoleName ||
            (userBranches && userBranches.length > 0 ? userBranches[0].branchRoleName : null);

        if (!effectiveBranchRole) {
            return ROLES.GUEST;
        }

        // Special case: Staff with Nurse branch role should be treated as Guest/Nurse for non-admin access
        if (effectiveBranchRole === BRANCH_ROLE_NAMES.NURSE) {
            return ROLES.NURSE; // This will be used to redirect to guest layout
        }

        // Map other Staff branch roles to appropriate frontend roles
        switch (effectiveBranchRole) {
            case BRANCH_ROLE_NAMES.ADMIN_SYSTEM:
                return ROLES.ADMIN;
            case BRANCH_ROLE_NAMES.BRANCH_MANAGER:
                return ROLES.BRANCH_MANAGER;
            case BRANCH_ROLE_NAMES.MANAGER:
                return ROLES.MANAGER;
            case BRANCH_ROLE_NAMES.CASHIER:
                return ROLES.CASHIER;
            case BRANCH_ROLE_NAMES.KITCHEN:
                return ROLES.KITCHEN;
            case BRANCH_ROLE_NAMES.STAFF:
                return ROLES.STAFF;
            default:
                return ROLES.STAFF;
        }
    }

    return ROLES.GUEST; // Default fallback
};

// Helper function to check if user should have admin access
export const hasAdminAccess = (userRole) => {
    const adminRoles = [
        ROLES.SYSTEM_ADMIN,
        ROLES.ADMIN,
        ROLES.BRANCH_MANAGER,
        ROLES.MANAGER,
        ROLES.CASHIER,
        ROLES.KITCHEN,
        ROLES.STAFF
    ];
    return adminRoles.includes(userRole);
};

// Helper function to check if route is admin-only
export const isAdminRoute = (allowedRoles) => {
    const adminOnlyRoles = [
        ROLES.SYSTEM_ADMIN,
        ROLES.ADMIN,
        ROLES.BRANCH_MANAGER,
        ROLES.MANAGER,
        ROLES.DOCTOR
    ];
    return allowedRoles && allowedRoles.every(role => adminOnlyRoles.includes(role));
};

// Helper function to check if user can access admin routes
export const canAccessAdminRoutes = (userRole) => {
    const adminRouteRoles = [
        ROLES.SYSTEM_ADMIN,
        ROLES.ADMIN,
        ROLES.BRANCH_MANAGER,
        ROLES.MANAGER,
        ROLES.CASHIER
    ];
    return adminRouteRoles.includes(userRole);
};

// Helper function to check if user should use guest layout
export const shouldUseGuestLayout = (userRole) => {
    const guestLayoutRoles = [
        ROLES.NURSE,    // Nurses should use guest layout even though they're Staff
        ROLES.PATIENT,
        ROLES.GUEST
    ];
    return guestLayoutRoles.includes(userRole);
};

// Legacy role hierarchy (updated for new roles)
export const ROLE_HIERARCHY = {
    [ROLES.SYSTEM_ADMIN]: [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT, ROLES.STAFF, ROLES.CASHIER, ROLES.KITCHEN, ROLES.GUEST],
    [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT, ROLES.STAFF, ROLES.CASHIER, ROLES.KITCHEN],
    [ROLES.BRANCH_MANAGER]: [ROLES.BRANCH_MANAGER, ROLES.MANAGER, ROLES.NURSE, ROLES.STAFF, ROLES.CASHIER, ROLES.KITCHEN, ROLES.PATIENT],
    [ROLES.MANAGER]: [ROLES.MANAGER, ROLES.NURSE, ROLES.STAFF, ROLES.CASHIER, ROLES.KITCHEN, ROLES.PATIENT],
    [ROLES.DOCTOR]: [ROLES.DOCTOR, ROLES.PATIENT],
    [ROLES.NURSE]: [ROLES.NURSE, ROLES.PATIENT],
    [ROLES.CASHIER]: [ROLES.CASHIER, ROLES.PATIENT],
    [ROLES.KITCHEN]: [ROLES.KITCHEN, ROLES.PATIENT],
    [ROLES.STAFF]: [ROLES.STAFF, ROLES.PATIENT],
    [ROLES.PATIENT]: [ROLES.PATIENT],
    [ROLES.GUEST]: [ROLES.GUEST],
};

// Legacy role checker (keeping for compatibility)
export const hasRequiredRole = (userRole, requiredRole) => {
    if (!userRole || !requiredRole) return false;
    return ROLE_HIERARCHY[userRole]?.includes(requiredRole) || false;
};

// New permission-based role checker
export const hasRequiredPermission = (userPermissions, requiredPermission) => {
    if (!userPermissions || !Array.isArray(userPermissions)) return false;
    return userPermissions.includes(requiredPermission);
};

// Map old role-based checks to new permission-based checks
export const ROLE_TO_PERMISSION_MAP = {
    [ROLES.SYSTEM_ADMIN]: [
        'overview:view', 'foods:view', 'foods:add', 'foods:edit', 'foods:delete',
        'orders:view', 'orders:add', 'orders:edit', 'orders:delete', 'orders:approve',
        'users:view', 'users:add', 'users:edit', 'users:delete', 'users:roles',
        'reports:view', 'system:settings', 'branches:view', 'branches:add', 'branches:edit'
    ],
    [ROLES.ADMIN]: [
        'overview:view', 'foods:view', 'foods:add', 'foods:edit', 'foods:delete',
        'orders:view', 'orders:add', 'orders:edit', 'orders:delete', 'orders:approve',
        'users:view', 'users:add', 'users:edit', 'users:delete', 'users:roles',
        'reports:view', 'system:settings', 'branches:view', 'branches:add'
    ],
    [ROLES.BRANCH_MANAGER]: [
        'overview:view', 'foods:view', 'foods:add', 'foods:edit',
        'orders:view', 'orders:add', 'orders:edit', 'orders:approve',
        'users:view', 'users:add', 'users:edit', 'reports:view'
    ],
    [ROLES.MANAGER]: [
        'overview:view', 'foods:view', 'foods:add', 'foods:edit',
        'orders:view', 'orders:add', 'orders:edit', 'reports:view'
    ],
    [ROLES.CASHIER]: [
        'overview:view', 'orders:view', 'orders:add', 'orders:edit',
        'patients:view', 'wallet:view', 'wallet:transactions'
    ],
    [ROLES.KITCHEN]: [
        'kitchen:view', 'kitchen:status', 'kitchen:prepare', 'kitchen:complete',
        'orders:view', 'foods:view'
    ],
    [ROLES.NURSE]: [
        // Nurses have limited permissions and should use guest layout
        'orders:view', 'orders:add',
        'patients:view', 'patients:add', 'patients:edit', 'patients:dietary'
    ],
    [ROLES.STAFF]: [
        'overview:view', 'orders:view', 'orders:add', 'foods:view'
    ],
    [ROLES.DOCTOR]: [
        'overview:view', 'orders:view', 'orders:add',
        'patients:view', 'patients:add', 'patients:edit', 'patients:dietary'
    ],
    [ROLES.PATIENT]: [
        'orders:view', 'orders:add'
    ],
    [ROLES.GUEST]: [
        'orders:view', 'orders:add'
    ]
};

// Test account data for development (updated for new system)
export const TEST_ACCOUNTS = {
    SYSTEM_ADMIN: {
        email: 'admin@homms.com',
        password: 'Admin@123456',
        role: 'System Admin',
        description: 'Full system access across all branches'
    },
    BRANCH_MANAGER: {
        email: 'branch.manager@homms.com',
        password: 'BranchManager@123',
        role: 'Branch Manager',
        description: 'Branch-level management'
    },
    MANAGER: {
        email: 'manager@homms.com',
        password: 'Manager@123',
        role: 'Manager',
        description: 'Department management'
    },
    CASHIER: {
        email: 'cashier@homms.com',
        password: 'Cashier@123',
        role: 'Cashier',
        description: 'Order processing & payments'
    },
    CASHIER2: {
        email: 'cashier2@homms.com',
        password: 'Cashier@123',
        role: 'Cashier',
        description: 'Order processing & payments'
    },
    STAFF: {
        email: 'staff@homms.com',
        password: 'Staff@123',
        role: 'Staff',
        description: 'General operations'
    },
    STAFF2: {
        email: 'staff2@homms.com',
        password: 'Staff@123',
        role: 'Staff',
        description: 'General operations'
    },
    KITCHEN: {
        email: 'kitchen@homms.com',
        password: 'Kitchen@123',
        role: 'Kitchen Staff',
        description: 'Food preparation'
    },
    KITCHEN2: {
        email: 'kitchen2@homms.com',
        password: 'Kitchen@123',
        role: 'Kitchen Staff',
        description: 'Food preparation'
    },
    NURSE: {
        email: 'nurse@homms.com',
        password: 'Nurse@123',
        role: 'Nurse',
        description: 'Patient care & dietary orders (Guest layout access)'
    },
    NURSE2: {
        email: 'nurse2@homms.com',
        password: 'Nurse@123',
        role: 'Nurse',
        description: 'Patient care & dietary orders (Guest layout access)'
    },
    PATIENT: {
        email: 'patient@homms.com',
        password: 'Patient@123',
        role: 'Patient',
        description: 'Food ordering for personal consumption'
    },
    GUEST: {
        email: 'guest@homms.com',
        password: 'Guest@123',
        role: 'Guest',
        description: 'Temporary visitor access'
    }
}; 