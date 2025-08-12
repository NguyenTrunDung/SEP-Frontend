# Permission Enhancement Migration Guide

## 🎯 **No Breaking Changes - Gradual Enhancement**

The enhanced `PageWrapperV2` and `ReusableTableV2` components are **100% backward compatible**. Your existing pages will continue working without any changes.

## 📋 **Migration Checklist**

### **✅ Immediate (No Action Required)**

- All existing pages continue working
- No functionality changes
- No UI changes
- No permission enforcement

### **🎛️ Optional Enhancement (Add When Needed)**

#### **High Priority Pages** (Add `resourceName` only)

```javascript
// Before (works fine)
<PageWrapperV2 title="Quản lý người dùng">
  <ReusableTableV2 onEdit={handleEdit} onDelete={handleDelete} />
</PageWrapperV2>

// After (with permissions)
<PageWrapperV2 title="Quản lý người dùng" resourceName="users">
  <ReusableTableV2 resourceName="users" onEdit={handleEdit} onDelete={handleDelete} />
</PageWrapperV2>
```

#### **Pages That Need Permission Control**

- ✅ User Management (`resourceName="users"`)
- ✅ Branch Management (`resourceName="branches"`) - Already updated
- ✅ Food Management (`resourceName="foods"`)
- ✅ Order Management (`resourceName="orders"`)
- ✅ Kitchen Management (`resourceName="kitchen"`)

#### **Pages That Don't Need Changes**

- ✅ Dashboard/Statistics (no CRUD operations)
- ✅ Reports (read-only)
- ✅ Public pages
- ✅ Simple display pages

## 🔧 **Step-by-Step Migration**

### **Step 1: Identify Page Type**

```javascript
// Type A: CRUD Management Pages (need permissions)
// Examples: Users, Foods, Orders, Branches
<PageWrapperV2 resourceName="[resource]" />

// Type B: Dashboard/Reports (no changes needed)
// Examples: Statistics, Analytics
<PageWrapperV2 showAddButton={false} />

// Type C: Custom Logic (use specific permissions)
// Examples: Special workflows
<PageWrapperV2 addPermission="custom:action" />
```

### **Step 2: Add Resource Name (1 Line Change)**

```javascript
// BEFORE
<PageWrapperV2 title="Quản lý món ăn">

// AFTER (add 1 line)
<PageWrapperV2 title="Quản lý món ăn" resourceName="foods">
```

### **Step 3: Test Permission Behavior**

```javascript
// Test with different user permissions:
// 1. System Admin - should see everything
// 2. Manager - should see based on permissions
// 3. User - should see based on permissions
```

## 📊 **Current Pages Analysis**

### **Pages Already Enhanced**

- ✅ `BranchesTable.js` - Full permission integration

### **High Priority for Enhancement**

- 🔶 `FoodsTable.js` - Food management
- 🔶 `UserAccount/index.js` - User management
- 🔶 `Order/Order.js` - Order management
- 🔶 `GroupUser/index.js` - Permission management

### **Medium Priority**

- 🔶 `Department/DepartmentsTable.js`
- 🔶 `Area/AreasTableV2.js`
- 🔶 `FoodCategories/index.js`

### **Low Priority (Optional)**

- 🟢 `Feedback/Feedbacks.js` - Usually read-only
- 🟢 `Kitchen/KitchenPage.js` - Workflow-specific
- 🟢 `Menu/MenuTable.js` - Display-focused

## 🎨 **Migration Examples**

### **Example 1: Simple CRUD Page**

```javascript
// File: FoodsTable.js
// BEFORE (working fine)
<PageWrapperV2
  title="Quản lý món ăn"
  onAdd={handleAdd}
  onRefresh={handleRefresh}
>
  <ReusableTableV2
    columns={columns}
    dataSource={foods}
    onEdit={handleEdit}
    onDelete={handleDelete}
  />
</PageWrapperV2>

// AFTER (with permissions - just add resourceName)
<PageWrapperV2
  title="Quản lý món ăn"
  onAdd={handleAdd}
  onRefresh={handleRefresh}
  resourceName="foods"  // ← Add this line
>
  <ReusableTableV2
    columns={columns}
    dataSource={foods}
    onEdit={handleEdit}
    onDelete={handleDelete}
    resourceName="foods"  // ← Add this line
  />
</PageWrapperV2>
```

### **Example 2: Dashboard Page (No Changes Needed)**

```javascript
// File: Dashboard.js
// ✅ Leave unchanged - works perfectly
<PageWrapperV2
  title="Thống kê tổng quan"
  showAddButton={false}
  showRefreshButton={true}
>
  <StatisticsCharts />
</PageWrapperV2>
```

### **Example 3: Custom Permission Logic**

```javascript
// File: SpecialOrdersTable.js
// For complex business rules
<PageWrapperV2
  title="Đơn hàng đặc biệt"
  addPermission="orders:special:add"
  viewPermission="orders:special:view"
>
  <ReusableTableV2
    customPermissionCheck={(action, record) => {
      // Custom logic: only edit own orders
      if (action === "edit") {
        return record.createdBy === user.id || hasPermission("orders:edit:all");
      }
      return hasPermission(`orders:${action}`);
    }}
  />
</PageWrapperV2>
```

## 🚀 **Rollout Strategy**

### **Week 1: Core Security Pages**

```
✅ User Management
✅ Group/Role Management
✅ Branch Management (already done)
```

### **Week 2: Main CRUD Pages**

```
🔶 Food Management
🔶 Order Management
🔶 Department Management
```

### **Week 3: Optional Pages**

```
🔶 Remaining management pages
🔶 Advanced features
```

### **Week 4: Testing & Polish**

```
🧪 User acceptance testing
🔧 Permission fine-tuning
📚 Team training
```

## 💡 **Pro Tips**

### **1. Start Small**

```javascript
// Start with just resourceName
resourceName = "foods";

// Later add specific overrides if needed
addPermission = "foods:special:add";
```

### **2. Use Browser DevTools**

```javascript
// Check permission in console
console.log("User permissions:", user.permissions);
console.log("Can edit foods:", hasPermission("foods:edit"));
```

### **3. Test with Different Users**

```javascript
// Test scenarios:
// 1. System Admin (all permissions)
// 2. Manager (limited permissions)
// 3. User (minimal permissions)
```

## 🔍 **Quick Migration Check**

Run this check for each page:

```javascript
// 1. Does this page have CRUD operations?
//    Yes → Add resourceName="[resource]"
//    No → Leave unchanged

// 2. Does this page need custom permission logic?
//    Yes → Use specific permission props
//    No → Use resourceName only

// 3. Is this a dashboard/report page?
//    Yes → Leave unchanged
//    No → Consider adding permissions
```

## 🎯 **Success Metrics**

- ✅ All existing functionality continues working
- ✅ New permission controls work as expected
- ✅ Users see appropriate UI based on permissions
- ✅ No broken pages or missing buttons
- ✅ Consistent permission behavior across app

Remember: **No rush required!** Add permissions gradually as needed. The system is designed for progressive enhancement, not forced migration.
