# Permission-Enhanced Reusable Components

## Overview

This document describes the permission-enhanced versions of `PageWrapperV2` and `ReusableTableV2` components that provide automatic conditional rendering based on user permissions. These components integrate seamlessly with our Permission-Based Access Control (PBAC) system.

## Key Features

1. **Automatic Permission Checking**: Components automatically check user permissions
2. **Conditional Rendering**: Show/hide elements based on permissions
3. **Graceful Fallbacks**: Display disabled states or custom fallback content
4. **Flexible Configuration**: Multiple ways to specify permissions
5. **Backward Compatibility**: Existing props work unchanged

## Enhanced PageWrapperV2

### New Permission Props

```javascript
<PageWrapperV2
  title="Quản lý món ăn"
  onAdd={handleAdd}
  onRefresh={handleRefresh}
  // Permission-based props
  resourceName="foods" // Auto-generates permissions: foods:view, foods:add
  addPermission="foods:add" // Specific add permission (overrides resourceName:add)
  viewPermission="foods:view" // Permission to view the page
  requiredPermissions={["custom:permission"]} // Custom permissions array
  hideOnNoPermission={true} // Hide completely or show disabled (default: true)
  permissionFallback={<div>No access</div>} // Custom fallback content
>
  {/* Page content */}
</PageWrapperV2>
```

### Permission Checking Logic

1. **System Admin Override**: System admins bypass all permission checks
2. **Specific Permissions**: Check `addPermission`, `viewPermission` if provided
3. **Resource-Based**: Use `resourceName` to generate `resource:action` permissions
4. **Custom Permissions**: Check `requiredPermissions` array
5. **Default Behavior**: Allow access if no permissions specified

### Usage Examples

#### Basic Resource-Based Permissions

```javascript
<PageWrapperV2
  title="Quản lý món ăn"
  onAdd={handleAddFood}
  onRefresh={handleRefresh}
  resourceName="foods" // Checks foods:view, foods:add
>
  <FoodTable />
</PageWrapperV2>
```

#### Specific Permission Override

```javascript
<PageWrapperV2
  title="Quản lý đơn hàng đặc biệt"
  onAdd={handleAdd}
  addPermission="orders:special:add" // Custom permission
  viewPermission="orders:special:view" // Custom permission
>
  <SpecialOrderTable />
</PageWrapperV2>
```

#### Custom Permissions Array

```javascript
<PageWrapperV2
  title="Báo cáo tổng hợp"
  requiredPermissions={["reports:view", "analytics:access"]}
  showAddButton={false}
>
  <ReportsComponent />
</PageWrapperV2>
```

#### Disabled State Instead of Hidden

```javascript
<PageWrapperV2
  title="Quản lý chi nhánh"
  resourceName="branches"
  hideOnNoPermission={false} // Show disabled button instead of hiding
>
  <BranchTable />
</PageWrapperV2>
```

#### Custom Fallback for No Access

```javascript
<PageWrapperV2
  title="Admin Only Page"
  viewPermission="system:admin"
  permissionFallback={
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h3>Restricted Access</h3>
      <p>Contact your administrator for access.</p>
    </div>
  }
>
  <AdminPanel />
</PageWrapperV2>
```

## Enhanced ReusableTableV2

### New Permission Props

```javascript
<ReusableTableV2
  columns={columns}
  dataSource={data}
  onEdit={handleEdit}
  onDelete={handleDelete}
  // Permission-based props
  resourceName="foods" // Auto-generates permissions: foods:edit, foods:delete
  editPermission="foods:edit" // Specific edit permission
  deletePermission="foods:delete" // Specific delete permission
  customPermissionCheck={checkCustomPermission} // Function for row-level permissions
  hideActionsOnNoPermission={true} // Hide buttons or show disabled (default: true)
  showPermissionTooltips={true} // Show tooltips for disabled buttons (default: true)
/>
```

### Permission Checking Logic

1. **Per-Row Checking**: Permissions checked for each table row
2. **Custom Permission Function**: Allow complex row-level permission logic
3. **Action-Specific**: Separate permissions for edit and delete actions
4. **Graceful Degradation**: Show disabled buttons with tooltips when no permission

### Usage Examples

#### Basic Resource-Based Table

```javascript
<ReusableTableV2
  columns={foodColumns}
  dataSource={foods}
  onEdit={handleEditFood}
  onDelete={handleDeleteFood}
  resourceName="foods" // Checks foods:edit, foods:delete
/>
```

#### Specific Permission Override

```javascript
<ReusableTableV2
  columns={orderColumns}
  dataSource={orders}
  onEdit={handleEdit}
  onDelete={handleDelete}
  editPermission="orders:modify" // Custom edit permission
  deletePermission="orders:cancel" // Custom delete permission
/>
```

#### Custom Permission Function

```javascript
const checkOrderPermission = (action, record) => {
  // Custom logic: Users can only edit their own orders
  if (action === "edit") {
    return record.createdBy === user.id || hasPermission("orders:edit:all");
  }

  // Only admins can delete completed orders
  if (action === "delete" && record.status === "completed") {
    return hasPermission("orders:delete:completed");
  }

  return hasPermission(`orders:${action}`);
};

<ReusableTableV2
  columns={orderColumns}
  dataSource={orders}
  onEdit={handleEdit}
  onDelete={handleDelete}
  customPermissionCheck={checkOrderPermission}
/>;
```

#### Show Disabled Buttons with Tooltips

```javascript
<ReusableTableV2
  columns={branchColumns}
  dataSource={branches}
  onEdit={handleEdit}
  onDelete={handleDelete}
  resourceName="branches"
  hideActionsOnNoPermission={false} // Show disabled buttons
  showPermissionTooltips={true} // Show helpful tooltips
/>
```

#### Custom Actions with Permission Context

```javascript
const renderCustomActions = (record, { canEdit, canDelete }) => (
  <Space>
    <Button icon={<EyeOutlined />} onClick={() => viewDetails(record)}>
      Xem
    </Button>

    {canEdit && (
      <Button icon={<CopyOutlined />} onClick={() => duplicateRecord(record)}>
        Sao chép
      </Button>
    )}

    {hasPermission("records:export") && (
      <Button icon={<DownloadOutlined />} onClick={() => exportRecord(record)}>
        Xuất
      </Button>
    )}
  </Space>
);

<ReusableTableV2
  columns={columns}
  dataSource={data}
  onEdit={handleEdit}
  onDelete={handleDelete}
  actions={renderCustomActions} // Custom actions get permission context
  resourceName="records"
/>;
```

## Complete Integration Example

Here's a complete example showing both components working together:

```javascript
import React, { useState } from "react";
import { usePermissions } from "../hooks/usePermissions";
import PageWrapperV2 from "../components/common/PageWrapperV2";
import ReusableTableV2 from "../components/common/ReusableTableV2";

const FoodManagementPage = () => {
  const [searchText, setSearchText] = useState("");
  const { hasPermission } = usePermissions();

  const columns = [
    { title: "Tên món ăn", dataIndex: "name", key: "name" },
    { title: "Giá", dataIndex: "price", key: "price" },
    { title: "Danh mục", dataIndex: "category", key: "category" },
  ];

  const customPermissionCheck = (action, record) => {
    // Special logic: Only food creators can delete their items
    if (action === "delete") {
      return record.createdBy === user.id || hasPermission("foods:delete:all");
    }
    return hasPermission(`foods:${action}`);
  };

  return (
    <PageWrapperV2
      title="Quản lý món ăn"
      onAdd={handleAddFood}
      onRefresh={handleRefresh}
      searchProps={{
        value: searchText,
        onChange: (e) => setSearchText(e.target.value),
        placeholder: "Tìm kiếm món ăn...",
      }}
      // Permission configuration
      resourceName="foods"
      addPermission="foods:add"
      viewPermission="foods:view"
      hideOnNoPermission={false} // Show disabled add button
    >
      <ReusableTableV2
        columns={columns}
        dataSource={filteredFoods}
        onEdit={handleEditFood}
        onDelete={handleDeleteFood}
        loading={loading}
        // Permission configuration
        resourceName="foods"
        customPermissionCheck={customPermissionCheck}
        hideActionsOnNoPermission={true}
        showPermissionTooltips={true}
        // Custom actions
        actions={(record, { canEdit, canDelete }) => (
          <Button
            icon={<EyeOutlined />}
            onClick={() => viewFoodDetails(record)}
          >
            Chi tiết
          </Button>
        )}
        pagination={{
          show: true,
          pageSize: 10,
          showSizeChanger: true,
        }}
      />
    </PageWrapperV2>
  );
};
```

## Best Practices

### 1. Use Resource-Based Permissions

```javascript
// Good: Simple and consistent
<PageWrapperV2 resourceName="foods" />
<ReusableTableV2 resourceName="foods" />

// Avoid: Unless you need specific overrides
<PageWrapperV2
  addPermission="foods:add"
  viewPermission="foods:view"
/>
```

### 2. Consistent Permission Naming

```javascript
// Good: Follows module:action pattern
resourceName = "foods"; // → foods:view, foods:add, foods:edit, foods:delete
resourceName = "orders"; // → orders:view, orders:add, orders:edit, orders:delete
resourceName = "users"; // → users:view, users:add, users:edit, users:delete

// Good: Custom permissions follow same pattern
editPermission = "orders:approve";
deletePermission = "orders:cancel";
```

### 3. Graceful Permission Handling

```javascript
// Good: Provide helpful feedback
<PageWrapperV2
  hideOnNoPermission={false}
  permissionFallback={
    <div>
      <h3>Quyền truy cập bị hạn chế</h3>
      <p>Liên hệ quản trị viên để được cấp quyền.</p>
    </div>
  }
/>

<ReusableTableV2
  hideActionsOnNoPermission={false}
  showPermissionTooltips={true}
/>
```

### 4. Custom Permission Logic

```javascript
// Good: Complex business logic
const checkPermission = (action, record) => {
  // Users can edit their own records
  if (action === "edit" && record.ownerId === user.id) {
    return true;
  }

  // Managers can edit records in their department
  if (
    action === "edit" &&
    record.department === user.department &&
    hasRole("MANAGER")
  ) {
    return true;
  }

  // Fall back to standard permissions
  return hasPermission(`records:${action}`);
};
```

### 5. Testing Permission Components

```javascript
import { render } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";

const renderWithPermissions = (component, permissions = []) => {
  const mockAuth = {
    permissions,
    isSystemAdmin: false,
    hasPermission: (permission) => permissions.includes(permission),
    canPerformAction: (action, resource) =>
      permissions.includes(`${resource}:${action}`),
  };

  return render(<AuthProvider value={mockAuth}>{component}</AuthProvider>);
};

test("shows add button when user has add permission", () => {
  const { getByRole } = renderWithPermissions(
    <PageWrapperV2 resourceName="foods" onAdd={jest.fn()} />,
    ["foods:view", "foods:add"]
  );

  expect(getByRole("button", { name: /thêm/i })).toBeInTheDocument();
});

test("hides edit button when user lacks edit permission", () => {
  const { queryByRole } = renderWithPermissions(
    <ReusableTableV2
      columns={[]}
      dataSource={[{ id: 1 }]}
      onEdit={jest.fn()}
      resourceName="foods"
    />,
    ["foods:view"] // Missing 'foods:edit'
  );

  expect(queryByRole("button", { name: /chỉnh sửa/i })).not.toBeInTheDocument();
});
```

## Migration Guide

### From Basic to Permission-Enhanced

#### Before

```javascript
<PageWrapperV2
  title="Quản lý món ăn"
  onAdd={handleAdd}
  onRefresh={handleRefresh}
>
  <ReusableTableV2
    columns={columns}
    dataSource={data}
    onEdit={handleEdit}
    onDelete={handleDelete}
  />
</PageWrapperV2>
```

#### After

```javascript
<PageWrapperV2
  title="Quản lý món ăn"
  onAdd={handleAdd}
  onRefresh={handleRefresh}
  resourceName="foods" // Add this line
>
  <ReusableTableV2
    columns={columns}
    dataSource={data}
    onEdit={handleEdit}
    onDelete={handleDelete}
    resourceName="foods" // Add this line
  />
</PageWrapperV2>
```

That's it! The components will now automatically handle permissions based on the user's access level.

## Troubleshooting

### Add Button Not Showing

- Check if user has the required add permission
- Verify `resourceName` or `addPermission` is correctly set
- Check if `showAddButton={false}` is set

### Edit/Delete Buttons Not Working

- Verify user has edit/delete permissions
- Check `resourceName` matches your permission structure
- Use browser dev tools to inspect permission checks

### Page Access Denied

- Check if user has view permission for the page
- Verify `viewPermission` or `resourceName:view` permission
- Check if `hideOnNoPermission={true}` is causing the issue

This permission-enhanced component system provides a robust, flexible, and maintainable way to handle access control in your React application while maintaining clean and readable code.
