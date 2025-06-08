export const ROLES = {
    ADMIN: 'ADMIN',
    DOCTOR: 'DOCTOR',
    NURSE: 'NURSE',
    CASHIER: 'CASHIER',
    PATIENT: 'PATIENT',
    STAFF: 'STAFF',
    CUSTOMER: 'CUSTOMER',
};

// src/constants/roles.js
export const ROLE_HIERARCHY = {
    [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT, ROLES.STAFF],
    [ROLES.DOCTOR]: [ROLES.DOCTOR, ROLES.PATIENT],
    [ROLES.NURSE]: [ROLES.NURSE, ROLES.PATIENT],
    [ROLES.PATIENT]: [ROLES.PATIENT],
    [ROLES.STAFF]: [ROLES.STAFF, ROLES.PATIENT],
};

export const hasRequiredRole = (userRole, requiredRole) => {
    if (!userRole || !requiredRole) return false;
    return ROLE_HIERARCHY[userRole]?.includes(requiredRole) || false;
}; 