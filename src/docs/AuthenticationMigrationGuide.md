# Authentication System Migration Guide

## Overview

This guide documents the migration from the mock authentication system to the real backend API authentication system in HOMMS.

## Key Changes Summary

### 1. **Service Layer Changes**

#### Before (Mock System):

```javascript
// Using mockAuthService.js
import { login as authLogin } from "../services/mockAuthService";

const response = await authLogin(email, password);
// Response: { user, token, refreshToken, expiresIn }
```

#### After (Real API):

```javascript
// Using authService.js
import { authService } from "../services/authService";

const response = await authService.login({ email, password });
// Response: { accessToken, refreshToken, tokenExpiryTime, user, permissions, userBranches, isSystemAdmin }
```

### 2. **Token Storage Changes**

#### Before:

```javascript
localStorage.setItem("token", token);
localStorage.setItem("refreshToken", refreshToken);
localStorage.setItem("tokenExpiry", timestamp);
```

#### After:

```javascript
localStorage.setItem("jwtToken", accessToken);
localStorage.setItem("refreshToken", refreshToken);
localStorage.setItem("tokenExpiryTime", isoDateString);
localStorage.setItem("userPermissions", JSON.stringify(permissions));
localStorage.setItem("userBranches", JSON.stringify(userBranches));
localStorage.setItem("isSystemAdmin", boolean);
```

### 3. **AuthContext Changes**

#### New Features Added:

- **Permissions Management**: Store and check user permissions
- **Branch Management**: Handle multi-tenant branch selection
- **Enhanced Token Handling**: Proper expiry checking with ISO dates
- **System Admin Support**: Special handling for system administrators

#### New Context Properties:

```javascript
const {
  // Existing
  user,
  token,
  loading,
  error,
  login,
  logout,
  updateUser,
  changePassword,

  // New additions
  permissions,
  hasPermission,
  hasAnyPermission,
  userBranches,
  defaultBranch,
  selectedBranch,
  branchRole,
  isSystemAdmin,
  selectBranch,
  isAuthenticated,
  isTokenExpired,
} = useAuth();
```

## Migration Steps

### Step 1: Update Component Imports

#### Before:

```javascript
import { useAuth } from "../context/AuthContext";

const { user, login, logout } = useAuth();
```

#### After:

```javascript
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";

const { user, login, logout, permissions, isSystemAdmin } = useAuth();
const { hasPermission, PERMISSIONS } = usePermissions();
```

### Step 2: Update Permission Checking

#### Before (Manual/Role-based):

```javascript
// Manual role checking
if (user?.role === "admin") {
  // Show admin features
}
```

#### After (Permission-based):

```javascript
// Permission-based checking
if (hasPermission(PERMISSIONS.USERS_VIEW)) {
  // Show user management
}

// Or using the context directly
if (hasPermission("foods:edit")) {
  // Show edit food button
}
```

### Step 3: Update Component Access Control

#### Example: Protected Component

```javascript
import React from "react";
import { usePermissions } from "../hooks/usePermissions";
import { Result } from "antd";

const FoodManagement = () => {
  const { hasPermission, PERMISSIONS } = usePermissions();

  if (!hasPermission(PERMISSIONS.FOODS_VIEW)) {
    return (
      <Result
        status="403"
        title="Access Denied"
        subTitle="You don't have permission to view food management."
      />
    );
  }

  return (
    <div>
      <h2>Food Management</h2>
      {hasPermission(PERMISSIONS.FOODS_ADD) && (
        <Button type="primary">Add Food</Button>
      )}
      {/* Food list */}
    </div>
  );
};
```

### Step 4: Update Menu/Navigation Components

#### Example: Navbar with Permission-based Menu

```javascript
import React from "react";
import { Menu } from "antd";
import { usePermissions } from "../hooks/usePermissions";

const NavigationMenu = () => {
  const { hasPermission, PERMISSIONS } = usePermissions();

  const menuItems = [
    {
      key: "overview",
      label: "Overview",
      show: hasPermission(PERMISSIONS.OVERVIEW_VIEW),
    },
    {
      key: "foods",
      label: "Food Management",
      show: hasPermission(PERMISSIONS.FOODS_VIEW),
    },
    {
      key: "orders",
      label: "Orders",
      show: hasPermission(PERMISSIONS.ORDERS_VIEW),
    },
    {
      key: "users",
      label: "User Management",
      show: hasPermission(PERMISSIONS.USERS_VIEW),
    },
    {
      key: "reports",
      label: "Reports",
      show: hasPermission(PERMISSIONS.REPORTS_VIEW),
    },
  ].filter((item) => item.show);

  return <Menu items={menuItems} />;
};
```

## New Authentication Features

### 1. **Permission System**

```javascript
// Check single permission
const canEditFoods = hasPermission("foods:edit");

// Check multiple permissions (any)
const canManageOrders = hasAnyPermission(["orders:add", "orders:edit"]);

// Check all permissions
const canFullUserManagement = hasAllPermissions([
  "users:view",
  "users:add",
  "users:edit",
]);

// Get module permissions
const foodPermissions = getModulePermissions("foods");
// Returns: ['foods:view', 'foods:add', 'foods:edit']

// Get CRUD permissions for a module
const {
  view,
  add,
  edit,
  delete: canDelete,
} = getModuleCRUDPermissions("foods");
```

### 2. **Branch Management**

```javascript
const { selectBranch, userBranches, selectedBranch } = useAuth();

// Switch branch
await selectBranch(branchId);

// Check current branch
if (selectedBranch?.id === targetBranchId) {
  // Branch-specific logic
}

// List available branches
userBranches.map((branch) => ({
  label: branch.branchName,
  value: branch.branchId,
}));
```

### 3. **Enhanced Token Management**

```javascript
const { isTokenExpired, isRefreshTokenExpired } = useAuth();

// Check token status
if (isTokenExpired()) {
  // Token needs refresh
}

// The context automatically handles token refresh
// No manual intervention needed in most cases
```

## Testing the Migration

### 1. **Login Test**

```javascript
// Test credentials from your documentation
const credentials = {
  email: "admin@homms.com",
  password: "Admin@123456",
};

// Should receive full permission set for system admin
```

### 2. **Permission Test**

```javascript
// After login, check permissions
console.log("User permissions:", permissions);
console.log("Is system admin:", isSystemAdmin);
console.log("Can view users:", hasPermission("users:view"));
```

### 3. **Branch Test** (when branches are available)

```javascript
// Check user branches
console.log("Available branches:", userBranches);
console.log("Default branch:", defaultBranch);

// Test branch selection
if (userBranches.length > 0) {
  await selectBranch(userBranches[0].branchId);
}
```

## Troubleshooting

### Common Issues:

1. **Token Storage Key Mismatch**

   - Ensure you're using 'jwtToken' instead of 'token'
   - Clear localStorage if migration issues persist

2. **Permission Checking Fails**

   - Verify permissions are loaded: `console.log(permissions)`
   - Check if user is system admin: `console.log(isSystemAdmin)`

3. **API Response Structure**

   - Ensure API returns `{ status, message, data }` structure
   - Verify `data` contains all expected fields

4. **Token Refresh Issues**
   - Check refresh token expiry format (ISO string vs timestamp)
   - Verify refresh endpoint URL (`/api/auth/refresh-token`)

## Environment Variables

Add these to your `.env` file:

```bash
REACT_APP_API_URL=http://localhost:5281
REACT_APP_API_VERSION=v1
REACT_APP_JWT_TOKEN_KEY=jwtToken
REACT_APP_REFRESH_TOKEN_KEY=refreshToken
REACT_APP_ENABLE_LOGGING=true
```

## Next Steps

After migration:

1. Remove `mockAuthService.js` and related mock files
2. Update all components to use permission-based access control
3. Implement branch selection UI for multi-tenant features
4. Add error handling for permission-denied scenarios
5. Test with different user roles and permissions

## Permission Constants Reference

Use the `PERMISSIONS` constant from `usePermissions` hook:

```javascript
const { PERMISSIONS } = usePermissions();

// Examples:
PERMISSIONS.FOODS_VIEW; // 'foods:view'
PERMISSIONS.ORDERS_ADD; // 'orders:add'
PERMISSIONS.USERS_EDIT; // 'users:edit'
PERMISSIONS.REPORTS_VIEW; // 'reports:view'
PERMISSIONS.SYSTEM_SETTINGS; // 'system:settings'
```

This ensures consistent permission names across your application.
