# Helper Functions Usage Guide

## Overview

The `hasAdminAccess(userRole)` and `shouldUseGuestLayout(userRole)` helper functions from `src/constants/roles.js` should be used strategically throughout your codebase to simplify role-based logic and improve maintainability.

## Available Helper Functions

```javascript
// From src/constants/roles.js
hasAdminAccess(userRole); // Returns true for admin roles
shouldUseGuestLayout(userRole); // Returns true for guest layout roles

// Available via useAuth() context
const { hasAdminAccess, shouldUseGuestLayout } = useAuth();
```

## 🎯 Key Usage Locations

### 1. **Route-Level Layout Selection** (HIGH PRIORITY)

**Current Issue**: Routes manually specify `AdminLayout` vs `DefaultLayout`
**Solution**: Use helper functions to automatically choose layout

#### Create Smart Layout Component

```javascript
// src/components/common/SmartLayoutRoute.js
import React from "react";
import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "../../routes/ProtectedRoute";
import AdminLayout from "../../layouts/AdminLayout";
import DefaultLayout from "../../layouts/DefaultLayout";

const SmartLayoutRoute = ({
  children,
  allowedRoles,
  requiredPermissions,
  ...props
}) => (
  <ProtectedRoute
    allowedRoles={allowedRoles}
    requiredPermissions={requiredPermissions}
    {...props}
  >
    {({ user }) => {
      const { hasAdminAccess } = useAuth();
      const Layout = hasAdminAccess(user?.role) ? AdminLayout : DefaultLayout;
      return <Layout>{children}</Layout>;
    }}
  </ProtectedRoute>
);

export default SmartLayoutRoute;
```

#### Usage in routes.js

```javascript
// Instead of manually choosing layout:
{
  path: '/orders',
  element: (
    <ProtectedRoute allowedRoles={[...]}>
      <AdminLayout>  {/* Hard-coded */}
        <Order />
      </AdminLayout>
    </ProtectedRoute>
  ),
}

// Use SmartLayoutRoute:
{
  path: '/orders',
  element: (
    <SmartLayoutRoute allowedRoles={[...]}>
      <Order />  {/* Layout chosen automatically */}
    </SmartLayoutRoute>
  ),
}
```

### 2. **Simplified Route Redirects** (HIGH PRIORITY)

Update the redirect logic in `src/routes/routes.js`:

```javascript
// Replace roleHomeRedirects object with helper function
const getHomeRoute = (userRole) => {
  if (hasAdminAccess(userRole)) {
    return '/dashboard'; // All admin roles go to dashboard
  }
  if (shouldUseGuestLayout(userRole)) {
    return '/nurse/home'; // All guest roles go to nurse/guest interface
  }
  return '/login'; // Fallback
};

// Update redirect route:
{
  path: '/redirect',
  element: (
    <ProtectedRoute>
      {({ user }) => {
        const redirectPath = getHomeRoute(user?.role);
        return <Navigate to={redirectPath} replace />;
      }}
    </ProtectedRoute>
  ),
}
```

### 3. **AdminLayout Menu Simplification** (MEDIUM PRIORITY)

Update `src/layouts/AdminLayout.js`:

```javascript
const AdminLayout = ({ children }) => {
  const { user, hasPermission, hasAdminAccess } = useAuth();

  // Simplified access checks using helper functions
  const canViewDashboard = () =>
    hasAdminAccess(user?.role) && hasPermission("overview:view");
  const canViewOrders = () =>
    hasAdminAccess(user?.role) && hasPermission("orders:view");
  const canManageUsers = () =>
    hasAdminAccess(user?.role) &&
    [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER].includes(
      user?.role
    );

  // Menu items with cleaner logic
  const menuItems = [
    canViewDashboard() && {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Thống kê</Link>,
    },
    canViewOrders() && {
      key: "orders",
      icon: <ShoppingCartOutlined />,
      label: <Link to="/orders">Quản lý đơn hàng</Link>,
    },
    // ... other items
  ].filter(Boolean);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Use simplified menu items */}
    </Layout>
  );
};
```

### 4. **UserHeader Component Enhancement** (MEDIUM PRIORITY)

Update `src/components/common/UserHeader.js`:

```javascript
const UserHeader = (
  {
    /* props */
  }
) => {
  const { user, hasAdminAccess, shouldUseGuestLayout } = useAuth();

  // Simplified route logic using helper functions
  const getProfileRoute = () => {
    if (hasAdminAccess(user?.role)) return "/admin/profile";
    if (shouldUseGuestLayout(user?.role)) return "/guest/profile";
    return "/profile";
  };

  // Simplified role checks
  const showDashboardLink = () => hasAdminAccess(user?.role);
  const showGuestFeatures = () => shouldUseGuestLayout(user?.role);

  const buildUserMenuItems = () => {
    const items = [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: <Link to={getProfileRoute()}>Thông tin cá nhân</Link>,
      },
    ];

    // Add dashboard link for admin users
    if (showDashboardLink()) {
      items.push({
        key: "dashboard",
        icon: <DashboardOutlined />,
        label: <Link to="/dashboard">Bảng điều khiển</Link>,
      });
    }

    return items;
  };

  // ... rest of component
};
```

### 5. **Component-Level Access Control** (LOW PRIORITY)

Use in any component that needs role-based logic:

```javascript
// Example: Food ordering component
const FoodOrderComponent = () => {
  const { user, hasAdminAccess, shouldUseGuestLayout } = useAuth();

  const canEditOrder = () => hasAdminAccess(user?.role);
  const isNurseOrdering = () => shouldUseGuestLayout(user?.role);

  return (
    <div>
      <FoodList />

      {canEditOrder() && <OrderManagementPanel />}

      {isNurseOrdering() && <PatientSelectionPanel />}

      <OrderSummary />
    </div>
  );
};
```

### 6. **Custom Hooks** (LOW PRIORITY)

Create custom hooks using helper functions:

```javascript
// src/hooks/useRolePermissions.js
import { useAuth } from "../context/AuthContext";

export const useRolePermissions = () => {
  const { user, hasAdminAccess, shouldUseGuestLayout } = useAuth();

  return {
    canAccessAdmin: hasAdminAccess(user?.role),
    shouldUseGuestLayout: shouldUseGuestLayout(user?.role),
    isNurse: user?.role === ROLES.NURSE,
    canManageOrders: hasAdminAccess(user?.role),
    canViewDashboard: hasAdminAccess(user?.role),
  };
};

// Usage in components:
const MyComponent = () => {
  const { canAccessAdmin, isNurse } = useRolePermissions();

  if (isNurse) {
    return <NurseInterface />;
  }

  if (canAccessAdmin) {
    return <AdminInterface />;
  }

  return <GuestInterface />;
};
```

## 🔧 Implementation Priority

### Phase 1: HIGH PRIORITY (Immediate)

1. ✅ **Route Layout Selection** - Automatic layout assignment
2. ✅ **Simplified Redirects** - Smart home route detection

### Phase 2: MEDIUM PRIORITY (Next Sprint)

3. **AdminLayout Simplification** - Cleaner menu logic
4. **UserHeader Enhancement** - Role-based profile routing

### Phase 3: LOW PRIORITY (Future)

5. **Component Access Control** - Standardized role checks
6. **Custom Hooks** - Reusable role logic

## 🎯 Where NOT to Use Helper Functions

❌ **Don't use in**:

- `ProtectedRoute.js` - Already has complex logic, keep as is
- API calls - Role checking should be server-side
- Database queries - Backend responsibility
- Route definitions where specific roles are needed

✅ **DO use in**:

- Layout selection logic
- Menu visibility
- Component rendering decisions
- Redirect logic
- UI feature toggles

## 🧪 Testing Strategy

```javascript
// Test role-based component behavior
describe("Component with role helpers", () => {
  test("shows admin features for admin users", () => {
    const mockUser = { role: ROLES.ADMIN };
    render(<ComponentWithRoleHelpers />, {
      authContext: { user: mockUser },
    });

    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    expect(screen.queryByText("Guest Panel")).not.toBeInTheDocument();
  });

  test("shows guest features for nurse users", () => {
    const mockUser = { role: ROLES.NURSE };
    render(<ComponentWithRoleHelpers />, {
      authContext: { user: mockUser },
    });

    expect(screen.getByText("Guest Panel")).toBeInTheDocument();
    expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();
  });
});
```

## 🎉 Benefits After Implementation

1. **🔧 Maintainability**: Single source of truth for role logic
2. **🎯 Consistency**: Uniform behavior across components
3. **📊 Readability**: Cleaner, more semantic code
4. **🚀 Scalability**: Easy to add new roles
5. **🐛 Reliability**: Fewer role-checking bugs

## 📝 Summary

The helper functions `hasAdminAccess()` and `shouldUseGuestLayout()` should be used primarily for:

1. **Layout selection** (routes automatically choose AdminLayout vs DefaultLayout)
2. **Menu visibility** (simplified access control in AdminLayout)
3. **Component rendering** (show/hide features based on role)
4. **Redirect logic** (smart home page routing)
5. **UI state management** (role-based interface decisions)

This will significantly clean up your role-based logic and make the nurse access restriction work seamlessly with your existing architecture! 🎯
