# 🔐 Permission Enhancement Priority Analysis

## 🎯 **Critical Priority (Implement First)**

### **1. User Account Management**

**File**: `src/modules/Admin/UserAccount/index.js`
**Security Risk**: ⚠️ **CRITICAL**

```javascript
// Current: No permission controls
<PageWrapperV2 title="Quản lý tài khoản người dùng">
  <ReusableTableV2 onEdit={handleEdit} onDelete={handleDelete} />
</PageWrapperV2>

// Enhanced: Add permission controls
<PageWrapperV2
  title="Quản lý tài khoản người dùng"
  resourceName="users"
>
  <ReusableTableV2
    resourceName="users"
    onEdit={handleEdit}
    onDelete={handleDelete}
  />
</PageWrapperV2>
```

**Why Critical**: Manages user accounts, passwords, status changes, role assignments

### **2. Group User Management (Permission Control)**

**File**: `src/modules/Admin/GroupUser/index.js`
**Security Risk**: ⚠️ **CRITICAL**

```javascript
// Enhanced: Highest security level
<PageWrapperV2
  title="Quản lý nhóm quyền"
  addPermission="users:roles"
  viewPermission="users:roles"
>
  <ReusableTableV2
    editPermission="users:roles"
    deletePermission="users:roles"
    onEdit={handleEdit}
    onDelete={handleDelete}
  />
</PageWrapperV2>
```

**Why Critical**: Controls who gets what permissions - the "keys to the kingdom"

### **3. Branch Management**

**File**: `src/modules/Admin/Branch/BranchesTable.js`
**Security Risk**: ⚠️ **HIGH**
**Status**: ✅ **Already Enhanced** - Good job!

## 🔥 **High Priority (Implement Second)**

### **4. Order Management**

**File**: `src/modules/Admin/Order/Order.js`
**Security Risk**: ⚠️ **HIGH**

```javascript
// Current: No permission controls
<PageWrapperV2 title="Quản lý đơn hàng">
  <ReusableTableV2 onEdit={handleEdit} onDelete={handleDelete} />
</PageWrapperV2>

// Enhanced: Add order permissions
<PageWrapperV2
  title="Quản lý đơn hàng"
  resourceName="orders"
  showAddButton={false}  // Orders typically created by customers
>
  <ReusableTableV2
    resourceName="orders"
    onEdit={handleEdit}
    onDelete={handleDelete}
    customPermissionCheck={(action, record) => {
      // Business rule: Can't delete completed orders
      if (action === 'delete' && record.status === 'completed') {
        return hasPermission('orders:delete:completed');
      }
      return hasPermission(`orders:${action}`);
    }}
  />
</PageWrapperV2>
```

**Why High**: Financial data, customer information, business operations

### **5. Food Management**

**File**: `src/modules/Admin/Food/index.js` + `FoodsTable.js`
**Security Risk**: ⚠️ **HIGH**

```javascript
// Enhanced: Add food management permissions
<PageWrapperV2 title="Quản lý món ăn" resourceName="foods">
  <ReusableTableV2
    resourceName="foods"
    onEdit={handleEdit}
    onDelete={handleDelete}
  />
</PageWrapperV2>
```

**Why High**: Menu control, pricing, customer-facing content

## 📊 **Medium Priority (Implement Third)**

### **6. Food Categories Management**

**File**: `src/modules/Admin/FoodCategories/index.js`
**Security Risk**: 🔶 **MEDIUM**

```javascript
<PageWrapperV2 resourceName="foodcategories">
  <ReusableTableV2 resourceName="foodcategories" />
</PageWrapperV2>
```

### **7. Department Management**

**File**: `src/modules/Admin/Department/DepartmentsTable.js`
**Security Risk**: 🔶 **MEDIUM**

```javascript
<PageWrapperV2 resourceName="departments">
  <ReusableTableV2 resourceName="departments" />
</PageWrapperV2>
```

### **8. Area Management**

**File**: `src/modules/Admin/Area/AreasTableV2.js`
**Security Risk**: 🔶 **MEDIUM**

```javascript
<PageWrapperV2 resourceName="areas">
  <ReusableTableV2 resourceName="areas" />
</PageWrapperV2>
```

## 🟢 **Low Priority (Optional)**

### **9. Feedback Management**

**File**: `src/modules/Admin/Feedback/Feedbacks.js`
**Security Risk**: 🟢 **LOW**

```javascript
<PageWrapperV2 resourceName="feedbacks">
  <ReusableTableV2
    resourceName="feedbacks"
    editPermission="feedbacks:reply" // Only reply, not edit
    deletePermission="feedbacks:delete"
  />
</PageWrapperV2>
```

### **10. Kitchen Management**

**File**: `src/modules/Admin/Kitchen/KitchenPage.js`
**Security Risk**: 🟢 **LOW**

```javascript
<PageWrapperV2 resourceName="kitchen" showAddButton={false}>
  <ReusableTableV2 resourceName="kitchen" />
</PageWrapperV2>
```

### **11. Shipper Management**

**File**: `src/modules/Admin/Shipper/DeliveryStaff.js`
**Security Risk**: 🟢 **LOW**

```javascript
<PageWrapperV2 resourceName="delivery">
  <ReusableTableV2 resourceName="delivery" />
</PageWrapperV2>
```

## 📋 **Implementation Roadmap**

### **Week 1: Critical Security (Must Do)**

```javascript
// Day 1-2: User Account Management
resourceName = "users";

// Day 3-4: Group User Management
addPermission = "users:roles";
viewPermission = "users:roles";

// Day 5: Testing critical security features
```

### **Week 2: Core Business Operations**

```javascript
// Day 1-2: Order Management
resourceName="orders" + custom permission logic

// Day 3-4: Food Management
resourceName="foods"

// Day 5: Testing business operations
```

### **Week 3: Supporting Systems**

```javascript
// Day 1: Food Categories
resourceName = "foodcategories";

// Day 2: Departments
resourceName = "departments";

// Day 3: Areas
resourceName = "areas";

// Day 4-5: Testing and integration
```

### **Week 4: Optional Enhancements**

```javascript
// Low priority pages
// User acceptance testing
// Documentation updates
```

## 🎯 **Quick Win Strategy**

Start with **just 2 files** to get immediate security benefits:

### **Phase 1: Maximum Security Impact (30 minutes)**

1. `UserAccount/index.js` - Add `resourceName="users"`
2. `GroupUser/index.js` - Add `addPermission="users:roles"`

### **Phase 2: Business Protection (1 hour)**

3. `Order/Order.js` - Add `resourceName="orders"`
4. `Food/index.js` - Add `resourceName="foods"`

### **Phase 3: Complete System (2 hours)**

5. All remaining management pages

## 🔍 **Risk Assessment**

### **🚨 Highest Risk (No Permissions)**

- **User Management**: Anyone can create/delete users
- **Permission Management**: Anyone can assign roles
- **Order Management**: Anyone can modify financial data

### **✅ Lowest Risk (Already Protected)**

- **Branch Management**: Already has permission controls
- **Route-level Protection**: Already implemented via ProtectedRoute

### **🎯 Business Impact**

1. **User/Permission Management**: Could compromise entire system
2. **Order Management**: Could affect revenue and customer data
3. **Food Management**: Could disrupt business operations
4. **Supporting Systems**: Minor operational impact

## 💡 **Implementation Tips**

### **Start Simple**

```javascript
// Phase 1: Just add resourceName
<PageWrapperV2 resourceName="users" />

// Phase 2: Add custom logic later if needed
customPermissionCheck={(action, record) => {
  // Custom business rules
}}
```

### **Test Incrementally**

```javascript
// Test with different users:
// 1. System Admin (should see everything)
// 2. Manager (should see based on permissions)
// 3. Regular User (should have limited access)
```

### **Monitor Results**

```javascript
// Check console for permission logs:
console.log("User permissions:", user.permissions);
console.log("Can edit users:", hasPermission("users:edit"));
```

This roadmap prioritizes **security-critical systems first**, then **business-critical operations**, and finally **supporting systems**. The **2-file quick win** gives you 80% of the security benefit with minimal effort!
