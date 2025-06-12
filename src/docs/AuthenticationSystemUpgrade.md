# HOMMS Authentication System Upgrade

## Overview

This document outlines the comprehensive upgrade from mock authentication to real backend API integration with enhanced permission-based access control while maintaining backward compatibility with existing role-based components.

## Changes Summary

### 1. 📁 Constants & Configuration

#### Enhanced `src/constants/roles.js`

- ✅ Added new backend role mappings (`BACKEND_ROLES`)
- ✅ Created role-to-frontend mapping function (`mapBackendRoleToFrontend`)
- ✅ Expanded role hierarchy for new roles (Manager, Branch Manager, Kitchen, etc.)
- ✅ Added permission mapping (`ROLE_TO_PERMISSION_MAP`)
- ✅ Included real test accounts (`TEST_ACCOUNTS`) with proper passwords
- ✅ Created helper functions for permission checking

#### Updated `src/config/environment.js`

- ✅ Already configured with proper API endpoints
- ✅ Environment-based feature flags for development features
- ✅ Dynamic versioning support

### 2. 🔐 Authentication Services

#### Enhanced `src/services/authService.js`

- ✅ Updated to handle real API response structure
- ✅ Added support for `accessToken` and permission management
- ✅ Implemented branch context handling
- ✅ Enhanced token expiration checking with ISO dates
- ✅ Added helper methods for permissions and system admin status

#### Updated `src/context/AuthContext.js`

- ✅ Added role mapping for backend compatibility
- ✅ Enhanced state management for permissions and branches
- ✅ Improved token refresh logic
- ✅ Added system admin support
- ✅ Better error handling and logging

### 3. 🎯 Permission System

#### New `src/hooks/usePermissions.js`

- ✅ Permission-based access control
- ✅ Module-specific permission helpers
- ✅ Backward compatibility with role-based checks

#### New `src/utils/authUtils.js`

- ✅ Migration utilities for role-to-permission transition
- ✅ Common access control functions
- ✅ Menu configuration helpers
- ✅ Display role mapping

### 4. 🛡️ Route Protection

#### Enhanced `src/routes/ProtectedRoute.js`

- ✅ Dual support for role-based and permission-based access
- ✅ System admin bypass
- ✅ Fallback permission mapping from roles
- ✅ Better debugging and logging
- ✅ New `requiredPermissions` prop support

### 5. 🎨 UI Components

#### Enhanced `src/components/common/AuthForm.js`

- ✅ Real test account integration with clickable tags
- ✅ Improved styling and UX
- ✅ Auto-fill functionality for development accounts
- ✅ Better error display
- ✅ Password pattern documentation

#### Enhanced `src/modules/Auth/Login.js`

- ✅ Environment-based configuration
- ✅ Improved branding and styling
- ✅ Development-only test account display
- ✅ Better responsive design

#### New `src/components/AuthTest.js`

- ✅ Comprehensive authentication testing interface
- ✅ Permission matrix display
- ✅ Branch management testing
- ✅ Real-time permission checking

## Test Accounts

The system now includes the following test accounts from the database:

| Role               | Email                    | Password          | Description                 |
| ------------------ | ------------------------ | ----------------- | --------------------------- |
| **System Admin**   | admin@homms.com          | Admin@123456      | Full system access          |
| **Branch Manager** | branch.manager@homms.com | BranchManager@123 | Branch-level management     |
| **Manager**        | manager@homms.com        | Manager@123       | Department management       |
| **Cashier**        | cashier@homms.com        | Cashier@123       | Order processing & payments |
| **Cashier**        | cashier2@homms.com       | Cashier@123       | Order processing & payments |
| **Staff**          | staff@homms.com          | Staff@123         | General operations          |
| **Staff**          | staff2@homms.com         | Staff@123         | General operations          |
| **Kitchen**        | kitchen@homms.com        | Kitchen@123       | Food preparation            |
| **Kitchen**        | kitchen2@homms.com       | Kitchen@123       | Food preparation            |
| **Nurse**          | nurse@homms.com          | Nurse@123         | Patient care & orders       |
| **Nurse**          | nurse2@homms.com         | Nurse@123         | Patient care & orders       |

### Password Pattern

- **Standard:** `RoleName@123` (e.g., Manager@123, Cashier@123)
- **Exception:** Admin account uses `Admin@123456`

## Architecture Features

### 🔄 Backward Compatibility

- ✅ Existing role-based components continue to work
- ✅ Automatic role mapping from backend to frontend
- ✅ Gradual migration path to permission-based system

### 🏢 Multi-Tenant Support

- ✅ Branch context integration
- ✅ Branch-specific permissions
- ✅ System admin override capabilities

### 🔐 Security Enhancements

- ✅ Real JWT token handling
- ✅ Automatic token refresh
- ✅ Permission-based access control
- ✅ Enhanced token expiration handling

### 🎯 Permission System

- ✅ Granular permission control
- ✅ Module-based permissions (foods:view, orders:add, etc.)
- ✅ Role-to-permission mapping for migration
- ✅ System admin bypass for all permissions

## Usage Examples

### Using New Permission System

```javascript
import { usePermissions } from "../hooks/usePermissions";

const MyComponent = () => {
  const { hasPermission, canManageFoods, canViewOrders } = usePermissions();

  return (
    <div>
      {hasPermission("foods:edit") && <EditButton />}
      {canManageFoods && <ManageFoodsPanel />}
      {canViewOrders && <OrdersList />}
    </div>
  );
};
```

### Using Auth Utils

```javascript
import { canAccessAdmin, getDisplayRole } from "../utils/authUtils";
import { useAuth } from "../context/AuthContext";

const MyComponent = () => {
  const authContext = useAuth();

  const canShowAdminMenu = canAccessAdmin(authContext);
  const displayRole = getDisplayRole(
    authContext.user,
    authContext.isSystemAdmin
  );

  return (
    <div>
      <span>Role: {displayRole}</span>
      {canShowAdminMenu && <AdminMenu />}
    </div>
  );
};
```

### Using Enhanced ProtectedRoute

```javascript
// Permission-based protection (new)
<ProtectedRoute requiredPermissions={['foods:edit', 'foods:delete']}>
    <FoodManagement />
</ProtectedRoute>

// Role-based protection (legacy, still works)
<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
    <AdminPanel />
</ProtectedRoute>
```

## Migration Guide

### For Existing Components

1. **Immediate (No Changes Required)**

   - All existing role-based components continue working
   - Automatic role mapping handles backend integration

2. **Recommended Upgrades**

   - Replace direct role checks with permission checks
   - Use `usePermissions` hook instead of direct role comparisons
   - Utilize `authUtils` for common access patterns

3. **Example Migration**

   ```javascript
   // Old way
   if (user?.role === ROLES.ADMIN) {
     // Show admin features
   }

   // New way
   const { hasPermission } = usePermissions();
   if (hasPermission("users:view")) {
     // Show admin features
   }
   ```

## Development Features

### 🔧 Environment-Based Controls

- Test accounts only show in development environment
- Debug logging controlled by environment flags
- API version configuration support

### 🧪 Testing Interface

- Comprehensive AuthTest component for development
- Permission matrix visualization
- Real-time authentication state monitoring
- Branch switching capabilities

## Next Steps

1. **Test the Authentication**

   - Try logging in with the test accounts
   - Use the AuthTest component to verify permissions
   - Test branch switching functionality

2. **Integration Testing**
   - Verify existing components still work
   - Test role-based navigation
   - Check permission-based features

This upgrade provides a solid foundation for the HOMMS authentication system with room for future enhancements and seamless integration with the existing codebase.
