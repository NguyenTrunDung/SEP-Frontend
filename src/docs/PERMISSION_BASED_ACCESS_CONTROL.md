# Permission-Based Access Control (PBAC) Implementation

## Overview

This document describes the implementation of Permission-Based Access Control (PBAC) in the HOMMS application. The system has been refactored from role-based access control (RBAC) to permission-based access control for more granular and flexible security management.

## Key Benefits

1. **Granular Control**: Each user can have specific permissions rather than broad role-based access
2. **Dynamic Configuration**: Permissions can be managed through the GroupUser interface
3. **Better Security**: Users only get the exact permissions they need
4. **Flexibility**: Easy to add new permissions and modify existing ones
5. **Maintainability**: Centralized permission management

## Architecture Components

### 1. Permission Constants (`src/constants/permissions.js`)

Defines all available permissions in the system:

```javascript
export const PERMISSIONS = {
  // Food Management
  FOODS_VIEW: "foods:view",
  FOODS_ADD: "foods:add",
  FOODS_EDIT: "foods:edit",
  FOODS_DELETE: "foods:delete",

  // Orders
  ORDERS_VIEW: "orders:view",
  ORDERS_ADD: "orders:add",
  // ... more permissions
};
```

### 2. Route-Permission Mapping

Maps routes to required permissions:

```javascript
export const ROUTE_PERMISSIONS = {
  "/dashboard": [PERMISSIONS.OVERVIEW_VIEW],
  "/orders": [PERMISSIONS.ORDERS_VIEW],
  "/foods": [PERMISSIONS.FOODS_VIEW],
  // ... more mappings
};
```

### 3. Enhanced usePermissions Hook (`src/hooks/usePermissions.js`)

Provides permission checking functions:

```javascript
const { hasPermission, hasAnyPermission, canAccessPage, canPerformAction } =
  usePermissions();
```

### 4. Updated ProtectedRoute (`src/routes/ProtectedRoute.js`)

Automatically checks permissions based on routes:

```javascript
// Auto-detects required permissions for each route
const routeRequiredPermissions = getRoutePermissions(location.pathname);
if (!hasAnyPermission(routeRequiredPermissions)) {
  return <Navigate to="/unauthorized" replace />;
}
```

### 5. Permission-Based Menu System (`src/layouts/AdminLayout.js`)

Shows/hides menu items based on user permissions:

```javascript
// Only show if user has required permissions
canAccess([PERMISSIONS.FOODS_VIEW]) && {
  key: "foods",
  icon: <ShopOutlined />,
  label: <Link to="/foods">Món ăn</Link>,
};
```

## Usage Examples

### 1. Checking Permissions in Components

```javascript
import { usePermissions } from "../hooks/usePermissions";

const FoodManagement = () => {
  const { hasPermission, canPerformAction } = usePermissions();

  return (
    <div>
      {hasPermission("foods:view") && <FoodList />}

      {canPerformAction("add", "foods") && (
        <Button onClick={handleAddFood}>Add Food</Button>
      )}

      {hasPermission("foods:edit") && <EditButton />}
    </div>
  );
};
```

### 2. Protecting Routes

```javascript
// Routes are automatically protected based on ROUTE_PERMISSIONS mapping
{
  path: '/foods',
  element: (
    <ProtectedRoute>
      <AdminLayout>
        <Food />
      </AdminLayout>
    </ProtectedRoute>
  ),
}

// Or explicit permission requirements
{
  path: '/custom-page',
  element: (
    <ProtectedRoute requiredPermissions={['custom:view', 'custom:access']}>
      <AdminLayout>
        <CustomPage />
      </AdminLayout>
    </ProtectedRoute>
  ),
}
```

### 3. Conditional Rendering in Components

```javascript
import { PERMISSIONS } from "../constants/permissions";

const OrderTable = ({ orders }) => {
  const { hasPermission } = usePermissions();

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Customer", dataIndex: "customer" },
    hasPermission(PERMISSIONS.ORDERS_EDIT) && {
      title: "Actions",
      render: (record) => (
        <Space>
          <Button onClick={() => editOrder(record.id)}>Edit</Button>
          {hasPermission(PERMISSIONS.ORDERS_DELETE) && (
            <Button danger onClick={() => deleteOrder(record.id)}>
              Delete
            </Button>
          )}
        </Space>
      ),
    },
  ].filter(Boolean);

  return <Table columns={columns} dataSource={orders} />;
};
```

### 4. Page-Level Permission Checks

```javascript
import { usePermissions } from "../hooks/usePermissions";
import { useLocation } from "react-router-dom";

const SomePage = () => {
  const { canAccessPage } = usePermissions();
  const location = useLocation();

  if (!canAccessPage(location.pathname)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <div>Page content</div>;
};
```

## API Integration

The login API returns user permissions in the response:

```json
{
  "data": {
    "user": { ... },
    "permissions": [
      "overview:view",
      "foods:view",
      "foods:add",
      "foods:edit",
      "orders:view",
      // ... all user permissions
    ],
    "userBranches": [
      {
        "branchPermissions": [
          // Branch-specific permissions
        ]
      }
    ]
  }
}
```

## Permission Management

### 1. GroupUser Interface

The GroupUser module (`src/modules/Admin/GroupUser/`) provides:

- Create user groups with specific permissions
- Assign permissions through a tree interface
- Manage user group memberships

### 2. Permission Tree Structure

```javascript
const permissionTree = [
  {
    title: "Quản lý món ăn",
    key: "foods",
    children: [
      { title: "Xem", key: "foods:view" },
      { title: "Thêm", key: "foods:add" },
      { title: "Sửa", key: "foods:edit" },
      { title: "Xóa", key: "foods:delete" },
    ],
  },
  // ... more permission groups
];
```

## System Admin Override

System Admins automatically have access to all features:

```javascript
const { isSystemAdmin } = useAuth();

// System admins bypass all permission checks
if (isSystemAdmin) return true;
```

## Migration from Role-Based System

### Before (Role-Based)

```javascript
<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
  <FoodManagement />
</ProtectedRoute>
```

### After (Permission-Based)

```javascript
<ProtectedRoute>
  <FoodManagement />
</ProtectedRoute>
```

The system automatically determines required permissions based on the route.

## Best Practices

### 1. Use Descriptive Permission Names

```javascript
// Good
"foods:view", "foods:add", "orders:approve";

// Bad
"food1", "permission2", "access";
```

### 2. Group Related Permissions

```javascript
// Food management permissions
"foods:view", "foods:add", "foods:edit", "foods:delete";

// Order management permissions
"orders:view", "orders:add", "orders:edit", "orders:approve";
```

### 3. Use Permission Constants

```javascript
// Good
import { PERMISSIONS } from "../constants/permissions";
hasPermission(PERMISSIONS.FOODS_VIEW);

// Bad
hasPermission("foods:view");
```

### 4. Handle Missing Permissions Gracefully

```javascript
// Show fallback UI instead of blank space
{
  hasPermission("foods:add") ? (
    <AddButton />
  ) : (
    <DisabledButton tooltip="No permission to add foods" />
  );
}
```

## Testing

### 1. Component Testing

```javascript
import { render } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";

const renderWithPermissions = (component, permissions = []) => {
  const mockAuth = {
    permissions,
    isSystemAdmin: false,
    // ... other auth properties
  };

  return render(<AuthProvider value={mockAuth}>{component}</AuthProvider>);
};

test("shows add button when user has add permission", () => {
  const { getByText } = renderWithPermissions(<FoodManagement />, [
    "foods:view",
    "foods:add",
  ]);

  expect(getByText("Add Food")).toBeInTheDocument();
});
```

### 2. Route Testing

```javascript
test("redirects to unauthorized when user lacks permission", () => {
  const { getByText } = renderWithPermissions(
    <ProtectedRoute>
      <FoodPage />
    </ProtectedRoute>,
    ["orders:view"] // Missing 'foods:view'
  );

  expect(window.location.pathname).toBe("/unauthorized");
});
```

## Troubleshooting

### 1. User Can't Access Page

- Check if user has required permissions in their profile
- Verify permission mapping in `ROUTE_PERMISSIONS`
- Check if route is correctly configured

### 2. Menu Items Not Showing

- Verify permission mapping in `MENU_PERMISSIONS`
- Check if `canAccess()` function has correct permissions
- Ensure user has the required permissions

### 3. System Admin Not Working

- Check `isSystemAdmin` flag in user data
- Verify system admin logic in permission hooks

### 4. Permission Check Not Working

- Ensure permissions are loaded in AuthContext
- Check permission string format (module:action)
- Verify usePermissions hook is imported correctly

## Future Enhancements

1. **Dynamic Permission Loading**: Load permissions from API on demand
2. **Permission Caching**: Cache permissions for better performance
3. **Audit Trail**: Track permission changes and access attempts
4. **Time-Based Permissions**: Permissions that expire after certain time
5. **Resource-Specific Permissions**: Permissions for specific resources (e.g., edit own orders only)

This permission-based system provides a robust foundation for secure and flexible access control in the HOMMS application.
