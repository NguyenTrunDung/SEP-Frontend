# Frontend Role System Guide

## Overview

The frontend role system has been updated to work with the new backend Identity roles while handling special cases like Nurses who should not have admin access despite being in the `Staff` identity role.

## Role Architecture

### Backend Identity Roles

- **SystemAdmin**: Full system access across all branches
- **Staff**: Hospital/canteen staff (includes various branch roles)
- **Patient**: Hospital patients with limited ordering access
- **Guest**: Temporary visitors with minimal access

### Branch Roles (within Staff Identity)

- **Admin System**: Complete branch control
- **Quản lý chi nhánh**: Branch management
- **Quản lý**: Management operations
- **Thu Ngân**: Cashier operations
- **Nhân viên**: Staff operations
- **Nhà bếp**: Kitchen operations
- **Y tá**: Nursing operations ⚠️ _Special Case_

## Key Components

### 1. Role Mapping (`roles.js`)

```javascript
// Maps backend Identity + Branch roles to frontend roles
mapBackendRoleToFrontend(identityRoles, branchRoleName, userBranches);

// Helper functions
hasAdminAccess(userRole); // Check if user can access admin layout
shouldUseGuestLayout(userRole); // Check if user should use guest layout
```

### 2. Authentication Context (`AuthContext.js`)

Updated to:

- Pass `branchRoleName` from API response to role mapping
- Include helper functions in context
- Handle nurse detection during login

### 3. Role-Based Route Protection (`RoleBasedRoute.js`)

Automatically redirects users based on their role:

- **Nurses**: Redirected to `/guest` layout for patient dietary ordering
- **Other Staff**: Access admin layout based on permissions
- **Patients/Guests**: Access only guest layout

## Special Case: Nurse Access Control

### Problem

Nurses have `Staff` identity role but should NOT access admin layout. They need guest layout for ordering dietary meals for patients.

### Solution

The system detects nurses using the `branchRoleName` field:

```json
{
  "user": {
    "roles": ["Staff"] // Identity role
  },
  "userBranches": [
    {
      "branchRoleName": "Y tá" // Vietnamese for "Nurse"
    }
  ]
}
```

### Implementation Flow

1. **Login Response Processing**:

   ```javascript
   // AuthContext.js - LOGIN_SUCCESS
   const branchRoleName = action.payload.userBranches[0].branchRoleName;
   const mappedUser = {
     ...action.payload.user,
     role: mapBackendRoleToFrontend(
       action.payload.user.roles, // ["Staff"]
       branchRoleName, // "Y tá"
       action.payload.userBranches
     ),
   };
   ```

2. **Role Mapping Logic**:

   ```javascript
   // roles.js - mapBackendRoleToFrontend
   if (identityRoles.includes("Staff")) {
     if (effectiveBranchRole === "Y tá") {
       return ROLES.NURSE; // Frontend role for nurses
     }
     // ... other Staff branch roles
   }
   ```

3. **Access Control**:

   ```javascript
   // roles.js - Helper functions
   shouldUseGuestLayout(userRole) {
     return [ROLES.NURSE, ROLES.PATIENT, ROLES.GUEST].includes(userRole);
   }

   hasAdminAccess(userRole) {
     return ![ROLES.NURSE, ROLES.PATIENT, ROLES.GUEST].includes(userRole);
   }
   ```

4. **Route Protection**:
   ```javascript
   // RoleBasedRoute.js
   if (shouldUseGuestLayout()) {
     if (location.pathname.startsWith("/dashboard")) {
       return <Navigate to="/guest" replace />;
     }
   }
   ```

## Usage Examples

### 1. Component Access Control

```javascript
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";

const MyComponent = () => {
  const { user, hasAdminAccess, shouldUseGuestLayout } = useAuth();

  if (shouldUseGuestLayout()) {
    return <GuestView />;
  }

  if (hasAdminAccess()) {
    return <AdminView />;
  }

  return <UnauthorizedView />;
};
```

### 2. Menu Item Visibility

```javascript
// AdminLayout.js
const canAccess = (allowedRoles = [], requiredPermissions = []) => {
  // Check roles first
  if (allowedRoles.length > 0 && hasRequiredRole(allowedRoles)) {
    return true;
  }

  // Check permissions if available
  if (requiredPermissions.length > 0) {
    return requiredPermissions.some(
      (permission) => hasPermission && hasPermission(permission)
    );
  }

  return false;
};

// Menu items only show for appropriate roles
canAccess([ROLES.ADMIN, ROLES.CASHIER], ["wallet:view"]) && {
  key: "cashier",
  // ... menu item
};
```

### 3. Route Protection

```javascript
// App.js or Router configuration
<Route
  path="/dashboard"
  element={
    <RoleBasedRoute>
      <AdminLayout>
        <Dashboard />
      </AdminLayout>
    </RoleBasedRoute>
  }
/>

<Route
  path="/guest"
  element={
    <RoleBasedRoute>
      <GuestLayout>
        <GuestDashboard />
      </GuestLayout>
    </RoleBasedRoute>
  }
/>
```

## Role Permissions Mapping

| Frontend Role  | Admin Access | Guest Layout | Permissions                                   |
| -------------- | ------------ | ------------ | --------------------------------------------- |
| SYSTEM_ADMIN   | ✅           | ❌           | All permissions across all branches           |
| ADMIN          | ✅           | ❌           | Branch admin permissions                      |
| BRANCH_MANAGER | ✅           | ❌           | Branch management permissions                 |
| MANAGER        | ✅           | ❌           | Department management permissions             |
| CASHIER        | ✅           | ❌           | Order processing, wallet operations           |
| KITCHEN        | ✅           | ❌           | Kitchen operations, order preparation         |
| STAFF          | ✅           | ❌           | General staff operations                      |
| NURSE          | ❌           | ✅           | Patient care, dietary ordering (Guest layout) |
| PATIENT        | ❌           | ✅           | Personal food ordering                        |
| GUEST          | ❌           | ✅           | Temporary visitor access                      |

## Testing Scenarios

### Test Account: Nurse

```javascript
// Login with nurse account
{
  email: "nurse@homms.com",
  password: "Nurse@123"
}

// Expected behavior:
// 1. Login successful with Identity role "Staff"
// 2. Frontend role mapped to "NURSE" due to branchRoleName "Y tá"
// 3. shouldUseGuestLayout() returns true
// 4. hasAdminAccess() returns false
// 5. Attempting to access /dashboard redirects to /guest
```

### Test Account: Regular Staff

```javascript
// Login with staff account
{
  email: "staff@homms.com",
  password: "Staff@123"
}

// Expected behavior:
// 1. Login successful with Identity role "Staff"
// 2. Frontend role mapped to "STAFF" due to branchRoleName "Nhân viên"
// 3. shouldUseGuestLayout() returns false
// 4. hasAdminAccess() returns true
// 5. Can access /dashboard and other admin routes
```

## Benefits

1. **Security**: Nurses cannot access sensitive admin functions
2. **User Experience**: Nurses get appropriate interface for patient care
3. **Flexibility**: Easy to add new roles and permissions
4. **Maintainability**: Clear separation between identity and permissions
5. **Compliance**: Supports hospital role-based access requirements

## Migration Notes

- Existing admin routes remain unchanged for authorized roles
- Guest layout routes need to be implemented for nurse/patient access
- Frontend role constants are backwards compatible
- Permission system works alongside role system for fine-grained control

## Future Enhancements

1. **Dynamic Guest Layout**: Implement nurse-specific ordering interface
2. **Patient Management**: Add patient dietary tracking for nurses
3. **Role Switching**: Allow users with multiple branch roles to switch contexts
4. **Audit Logging**: Track role-based access attempts
5. **Real-time Updates**: Handle role changes without requiring re-login
