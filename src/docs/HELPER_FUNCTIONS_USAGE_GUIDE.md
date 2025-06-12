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

#### Update `src/routes/routes.js`

**BEFORE**:

```javascript
{
  path: '/orders',
  element: (
    <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ...]}>
      <AdminLayout>  {/* Hard-coded layout */}
        <Order />
      </AdminLayout>
    </ProtectedRoute>
  ),
}
```

**AFTER**:

```javascript
{
  path: '/orders',
  element: (
    <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ...]}>
      {({ user }) => {
        const Layout = hasAdminAccess(user?.role) ? AdminLayout : DefaultLayout;
        return (
          <Layout>
            <Order />
          </Layout>
        );
      }}
    </ProtectedRoute>
  ),
}
```

**Benefits**:

- ✅ Automatic layout selection based on role
- ✅ No more manual layout assignment
- ✅ Consistent behavior across all routes

---

### 2. **Simplified Route Redirects** (HIGH PRIORITY)

**Current Issue**: Complex `roleHomeRedirects` object with manual mappings
**Solution**: Use helper functions for smart redirects

#### Update `src/routes/routes.js`

**BEFORE**:

```javascript
const roleHomeRedirects = {
  [ROLES.SYSTEM_ADMIN]: "/dashboard",
  [ROLES.ADMIN]: "/dashboard",
  // ... many manual mappings
};
```

**AFTER**:

```javascript
const getHomeRoute = (userRole) => {
  if (hasAdminAccess(userRole)) {
    return '/dashboard'; // All admin roles go to dashboard
  }
  if (shouldUseGuestLayout(userRole)) {
    return '/nurse/home'; // All guest roles go to nurse/guest interface
  }
  return '/login'; // Fallback
};

// In redirect route:
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

---

### 3. **AdminLayout Menu Visibility** (MEDIUM PRIORITY)

**Current Issue**: Complex `canAccess()` function with many role arrays
**Solution**: Simplify with helper functions

#### Update `src/layouts/AdminLayout.js`

**BEFORE**:

```javascript
const canAccess = (allowedRoles = [], requiredPermissions = []) => {
  // Check roles first
  if (allowedRoles.length > 0 && hasRequiredRole(allowedRoles)) {
    return true;
  }
  // ... complex logic
};

// Usage:
canAccess(
  [ROLES.ADMIN, ROLES.BRANCH_MANAGER, ROLES.MANAGER],
  ["overview:view"]
);
```

**AFTER**:

```javascript
const { user, hasPermission, hasAdminAccess } = useAuth();

// Simplified access check
const canAccessAdmin = () => hasAdminAccess(user?.role);
const canAccessDashboard = () =>
  canAccessAdmin() && hasPermission("overview:view");
const canAccessSettings = () =>
  user?.role === ROLES.SYSTEM_ADMIN || user?.role === ROLES.ADMIN;

// Usage:
canAccessDashboard() && {
  key: "dashboard",
  // ... menu item
};
```

---

### 4. **Component-Level Access Control** (MEDIUM PRIORITY)

**Current Issue**: Components manually check roles
**Solution**: Use helper functions for cleaner code

#### Update Components (e.g., `src/components/common/UserHeader.js`)

**BEFORE**:

```javascript
const hasManagementRole = () => {
  return (
    user?.role && [ROLES.ADMIN, ROLES.DOCTOR, ROLES.STAFF].includes(user.role)
  );
};

const getProfileRoute = () => {
  switch (user?.role) {
    case ROLES.ADMIN:
      return "/admin/profile";
    case ROLES.DOCTOR:
      return "/doctor/profile";
    // ... many cases
  }
};
```

**AFTER**:

```javascript
const { user, hasAdminAccess, shouldUseGuestLayout } = useAuth();

const getProfileRoute = () => {
  if (hasAdminAccess(user?.role)) {
    return "/admin/profile";
  }
  if (shouldUseGuestLayout(user?.role)) {
    return "/guest/profile";
  }
  return "/profile";
};

const showDashboardLink = () => hasAdminAccess(user?.role);
```

---

### 5. **ProtectedRoute Enhancement** (LOW PRIORITY)

**Current Issue**: ProtectedRoute doesn't use helper functions
**Solution**: Add helper-based shortcuts

#### Update `src/routes/ProtectedRoute.js`

**Add new props for convenience**:

```javascript
import { hasAdminAccess, shouldUseGuestLayout } from "../constants/roles";

const ProtectedRoute = ({
  children,
  allowedRoles,
  requiredPermissions,
  redirectPath,
  adminOnly = false, // NEW: Shortcut for admin access
  guestOnly = false, // NEW: Shortcut for guest access
}) => {
  // ... existing logic

  // New shortcut checks
  if (adminOnly && !hasAdminAccess(user?.role)) {
    console.log("🚫 Admin access required, redirecting");
    return <Navigate to="/unauthorized" replace />;
  }

  if (guestOnly && !shouldUseGuestLayout(user?.role)) {
    console.log("🚫 Guest access only, redirecting");
    return <Navigate to="/unauthorized" replace />;
  }

  // ... rest of existing logic
};
```

**Usage**:

```javascript
// Instead of:
<ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER]}>

// Use:
<ProtectedRoute adminOnly>
```

---

### 6. **Dynamic Component Rendering** (LOW PRIORITY)

**Use Case**: Components that need different UI for admin vs guest users

#### Example: Enhanced Home Component

```javascript
// src/modules/Home/Home.js
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const { user, hasAdminAccess, shouldUseGuestLayout } = useAuth();

  // Different content based on user type
  const renderContent = () => {
    if (hasAdminAccess(user?.role)) {
      return <AdminHomeContent />;
    }

    if (shouldUseGuestLayout(user?.role)) {
      return <GuestHomeContent />;
    }

    return <PublicHomeContent />;
  };

  return <Layout style={{ minHeight: "100vh" }}>{renderContent()}</Layout>;
};
```

---

## 🔧 Implementation Priority

### Phase 1: HIGH PRIORITY (Immediate Implementation)

1. **Route Layout Selection** - Automatic layout assignment
2. **Simplified Redirects** - Smart home route detection

### Phase 2: MEDIUM PRIORITY (Next Sprint)

3. **AdminLayout Simplification** - Cleaner menu logic
4. **Component Access Control** - Standardized role checks

### Phase 3: LOW PRIORITY (Future Enhancement)

5. **ProtectedRoute Shortcuts** - Convenience props
6. **Dynamic Rendering** - Role-based component content

---

## 🎯 Specific Code Changes Needed

### 1. Update `src/routes/routes.js` - Smart Layout Selection

```javascript
// Create a wrapper component for automatic layout selection
const SmartLayoutRoute = ({ children, allowedRoles, requiredPermissions }) => (
  <ProtectedRoute allowedRoles={allowedRoles} requiredPermissions={requiredPermissions}>
    {({ user }) => {
      const Layout = hasAdminAccess(user?.role) ? AdminLayout : DefaultLayout;
      return <Layout>{children}</Layout>;
    }}
  </ProtectedRoute>
);

// Use in routes:
{
  path: '/orders',
  element: (
    <SmartLayoutRoute allowedRoles={[ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ...]}>
      <Order />
    </SmartLayoutRoute>
  ),
}
```

### 2. Update `src/layouts/AdminLayout.js` - Simplified Access

```javascript
const AdminLayout = ({ children }) => {
  const { user, hasPermission, hasAdminAccess } = useAuth();

  // Simplified role-based checks
  const canViewDashboard = () =>
    hasAdminAccess(user?.role) && hasPermission("overview:view");
  const canViewOrders = () =>
    hasAdminAccess(user?.role) && hasPermission("orders:view");
  const canManageUsers = () =>
    [ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.BRANCH_MANAGER].includes(
      user?.role
    );
  const canManageSettings = () =>
    [ROLES.SYSTEM_ADMIN, ROLES.ADMIN].includes(user?.role);

  // Menu items with simplified logic
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
    // ... rest of items
  ].filter(Boolean);

  return <Layout>{/* ... layout structure with simplified menu */}</Layout>;
};
```

### 3. Update `src/components/common/UserHeader.js` - Role-Based Logic

```javascript
const UserHeader = (
  {
    /* props */
  }
) => {
  const { user, hasAdminAccess, shouldUseGuestLayout } = useAuth();

  const getProfileRoute = () => {
    if (hasAdminAccess(user?.role)) return "/admin/profile";
    if (shouldUseGuestLayout(user?.role)) return "/guest/profile";
    return "/profile";
  };

  const showDashboardLink = () => hasAdminAccess(user?.role);
  const showGuestFeatures = () => shouldUseGuestLayout(user?.role);

  // ... rest of component with simplified logic
};
```

---

## 🧪 Testing Guide

### Test Cases for Helper Functions

```javascript
// Test hasAdminAccess
describe("hasAdminAccess", () => {
  test("returns true for admin roles", () => {
    expect(hasAdminAccess(ROLES.SYSTEM_ADMIN)).toBe(true);
    expect(hasAdminAccess(ROLES.ADMIN)).toBe(true);
    expect(hasAdminAccess(ROLES.BRANCH_MANAGER)).toBe(true);
    expect(hasAdminAccess(ROLES.CASHIER)).toBe(true);
  });

  test("returns false for guest roles", () => {
    expect(hasAdminAccess(ROLES.NURSE)).toBe(false);
    expect(hasAdminAccess(ROLES.PATIENT)).toBe(false);
    expect(hasAdminAccess(ROLES.GUEST)).toBe(false);
  });
});

// Test shouldUseGuestLayout
describe("shouldUseGuestLayout", () => {
  test("returns true for guest roles", () => {
    expect(shouldUseGuestLayout(ROLES.NURSE)).toBe(true);
    expect(shouldUseGuestLayout(ROLES.PATIENT)).toBe(true);
    expect(shouldUseGuestLayout(ROLES.GUEST)).toBe(true);
  });

  test("returns false for admin roles", () => {
    expect(shouldUseGuestLayout(ROLES.ADMIN)).toBe(false);
    expect(shouldUseGuestLayout(ROLES.STAFF)).toBe(false);
  });
});
```

---

## 🎉 Benefits After Implementation

1. **🔧 Maintainability**: Single source of truth for role logic
2. **🎯 Consistency**: Uniform behavior across components
3. **📊 Readability**: Cleaner, more semantic code
4. **🚀 Scalability**: Easy to add new roles
5. **🐛 Reliability**: Fewer role-checking bugs
6. **⚡ Performance**: Consistent caching of role checks

## 🔄 Migration Strategy

1. **Start with Route Layout Selection** (biggest impact)
2. **Update AdminLayout** (visible improvement)
3. **Enhance Components** (code cleanup)
4. **Add ProtectedRoute shortcuts** (developer experience)

The helper functions will significantly simplify your role-based logic and make the codebase much more maintainable! 🎯
