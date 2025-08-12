# 🐛 Permission Debug Analysis: Menu Not Showing

## 🎯 **Issue Description**

User has `branches:view` permission but the "Chi nhánh" menu item doesn't appear in AdminLayout, though the `/branches` URL works when accessed directly.

## 🔍 **User Permission Data**

```json
{
  "permissions": [
    "overview:view",
    "foods:view",
    "foods:add",
    "foods:edit",
    "foods:delete",
    "branches:view" // ✅ HAS THIS PERMISSION
  ],
  "isSystemAdmin": false
}
```

## 🧩 **Menu Logic Analysis**

### **Current AdminLayout Logic (Lines 214-229)**

```javascript
// Categories Group Check
canAccess([
  PERMISSIONS.BRANCHES_VIEW, // ✅ "branches:view" - User HAS this
  PERMISSIONS.AREAS_VIEW, // ❌ "areas:view" - User DOESN'T have this
  PERMISSIONS.LOCATIONS_VIEW, // ❌ "locations:view" - User DOESN'T have this
  PERMISSIONS.DEPARTMENTS_VIEW, // ❌ "departments:view" - User DOESN'T have this
  PERMISSIONS.DISEASECATEGORIES_VIEW, // ❌ "diseasecategories:view" - User DOESN'T have this
]) && {
  key: "categories",
  label: "Danh mục",
  children: [
    canAccess([PERMISSIONS.BRANCHES_VIEW]) && {
      // ✅ This should work
      key: "branches",
      label: <Link to="/branches">Chi nhánh</Link>,
    },
    // ... other children
  ],
};
```

### **canAccess Function Logic**

```javascript
const canAccess = (requiredPermissions = []) => {
  if (isSystemAdmin) return true;
  if (requiredPermissions.length === 0) return true;

  // Uses Array.some() - should return TRUE if user has ANY permission
  return requiredPermissions.some((permission) => hasPermission(permission));
};
```

## 🔍 **Debugging Steps**

### **Step 1: Verify Permission Constants**

```javascript
// Check if PERMISSIONS.BRANCHES_VIEW equals "branches:view"
console.log("PERMISSIONS.BRANCHES_VIEW:", PERMISSIONS.BRANCHES_VIEW);
// Expected: "branches:view"
```

### **Step 2: Verify hasPermission Function**

```javascript
// Check if hasPermission works correctly
console.log("User permissions:", user.permissions);
console.log("Has branches:view:", hasPermission("branches:view"));
console.log(
  "Has branches:view via constant:",
  hasPermission(PERMISSIONS.BRANCHES_VIEW)
);
```

### **Step 3: Debug canAccess Function**

```javascript
// Test the exact same logic as the menu
const testResult = canAccess([
  PERMISSIONS.BRANCHES_VIEW,
  PERMISSIONS.AREAS_VIEW,
  PERMISSIONS.LOCATIONS_VIEW,
  PERMISSIONS.DEPARTMENTS_VIEW,
  PERMISSIONS.DISEASECATEGORIES_VIEW,
]);
console.log("canAccess result for categories group:", testResult);
```

### **Step 4: Debug Individual Branch Access**

```javascript
const branchAccess = canAccess([PERMISSIONS.BRANCHES_VIEW]);
console.log("canAccess result for branches only:", branchAccess);
```

## 🎯 **Possible Root Causes**

### **1. Permission Constant Mismatch**

```javascript
// Check if the constant matches the actual permission string
PERMISSIONS.BRANCHES_VIEW !== "branches:view";
```

### **2. hasPermission Function Issue**

```javascript
// Check if hasPermission is working correctly
hasPermission("branches:view"); // Should return true
```

### **3. Component Re-render Issue**

```javascript
// Check if permissions are loaded when component renders
console.log("Permissions loaded:", permissions?.length > 0);
```

### **4. Context/Hook Issue**

```javascript
// Check if usePermissions hook is working
const { hasPermission, permissions } = usePermissions();
console.log("Hook permissions:", permissions);
console.log("Hook hasPermission:", typeof hasPermission);
```

## 🔧 **Testing Solutions**

### **Solution 1: Add Debug Logging**

```javascript
// In AdminLayout.js, add temporary logging
const canAccess = (requiredPermissions = []) => {
  const result =
    isSystemAdmin ||
    requiredPermissions.length === 0 ||
    requiredPermissions.some((permission) => hasPermission(permission));

  console.log("canAccess debug:", {
    requiredPermissions,
    userPermissions: permissions,
    result,
    isSystemAdmin,
  });

  return result;
};
```

### **Solution 2: Simplify Menu Structure (Temporary Fix)**

```javascript
// Remove the complex group check, test individual items
const menuItems = [
  // Test direct branch menu item (bypass categories group)
  canAccess([PERMISSIONS.BRANCHES_VIEW]) && {
    key: "branches",
    icon: <ShopOutlined style={{ fontSize: "18px" }} />,
    label: <Link to="/branches">Chi nhánh</Link>,
  },
  // ... other items
].filter(Boolean);
```

### **Solution 3: Check Route vs Menu Permissions**

```javascript
// Compare route permissions vs menu permissions
const routePermissions = getRoutePermissions("/branches");
const menuPermissions = [PERMISSIONS.BRANCHES_VIEW];

console.log("Route permissions:", routePermissions);
console.log("Menu permissions:", menuPermissions);
console.log("Match:", routePermissions[0] === menuPermissions[0]);
```

## 🎯 **Expected Behavior**

1. ✅ User should see "Danh mục" group in menu
2. ✅ User should see "Chi nhánh" item under "Danh mục"
3. ✅ User should be able to click and access `/branches`
4. ✅ Route protection should allow access to `/branches`

## 📋 **Action Items**

1. Add debug logging to AdminLayout
2. Verify permission constants match API response
3. Test hasPermission function with exact strings
4. Check component render timing vs permission loading
5. Compare working routes vs non-working menu items
