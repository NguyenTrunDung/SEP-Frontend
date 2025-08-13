# 🔧 Menu Visibility Debug & Fixes

## 🎯 **Issue**: User has `branches:view` permission but menu doesn't show

## 🔍 **Step-by-Step Debugging**

### **1. Login & Check Console**

After logging in with the problematic user, check browser console for:

```
🔍 Branch permission debug: { ... }
```

### **2. Analyze Debug Output**

#### **Scenario A: hasPermission = true, result = true**

✅ **Permission logic works correctly**  
❌ **Menu rendering issue**

**Solution**: Check menu structure filtering

```javascript
// Look for this in AdminLayout
].filter(Boolean)  // This might be filtering out the menu item
```

#### **Scenario B: hasPermission = false**

❌ **Permission check failing**

**Possible causes:**

- LocalStorage permissions don't match API response
- Permission constant mismatch
- Context not updated

#### **Scenario C: result = false despite hasPermission = true**

❌ **Array.some() logic issue**

**Solution**: Check if other permissions in the array are causing issues

## 🔧 **Quick Fixes**

### **Fix 1: Temporary Menu Bypass (Test Only)**

```javascript
// In AdminLayout.js - temporarily bypass the categories group
const menuItems = [
  // Add direct branch menu item for testing
  canAccess([PERMISSIONS.BRANCHES_VIEW]) && {
    key: "branches-direct",
    icon: <ShopOutlined style={{ fontSize: "18px" }} />,
    label: <Link to="/branches">Chi nhánh (Test)</Link>,
  },

  // ... rest of menu items
].filter(Boolean);
```

### **Fix 2: Simplify Categories Group Logic**

```javascript
// Replace complex group check with individual checks
canAccess([PERMISSIONS.BRANCHES_VIEW]) ||
  canAccess([PERMISSIONS.AREAS_VIEW]) ||
  canAccess([PERMISSIONS.LOCATIONS_VIEW]) ||
  canAccess([PERMISSIONS.DEPARTMENTS_VIEW]) ||
  canAccess([PERMISSIONS.DISEASECATEGORIES_VIEW]);
```

### **Fix 3: Fix Permission Sync Issue**

```javascript
// In AuthContext.js, ensure permissions are synced
useEffect(() => {
  if (user && user.permissions) {
    authService.setPermissions(user.permissions);
  }
}, [user]);
```

### **Fix 4: Force Permission Refresh**

```javascript
// Add this to AdminLayout for testing
useEffect(() => {
  console.log("🔄 AdminLayout permissions refresh:", {
    contextPermissions: permissions,
    localStoragePermissions: authService.getPermissions(),
    hasPermissionFunction: hasPermission("branches:view"),
  });
}, [permissions]);
```

## 🎯 **Most Likely Causes**

### **1. Permission Loading Race Condition**

```javascript
// The menu might render before permissions are loaded
if (!permissions || permissions.length === 0) {
  return <div>Loading permissions...</div>;
}
```

### **2. LocalStorage Sync Issue**

```javascript
// Permissions might not be saved to localStorage correctly
// Check if authService.setPermissions() is called during login
```

### **3. Component Re-render Issue**

```javascript
// The menu might not re-render when permissions change
// Add permissions to dependency arrays where needed
```

## 🛠️ **Production Fix**

Based on the debug output, apply the appropriate fix:

### **If permissions are correctly loaded:**

```javascript
// The issue is likely in menu structure - simplify the group logic
canAccess(
  [
    PERMISSIONS.BRANCHES_VIEW,
    PERMISSIONS.AREAS_VIEW,
    PERMISSIONS.LOCATIONS_VIEW,
    PERMISSIONS.DEPARTMENTS_VIEW,
    PERMISSIONS.DISEASECATEGORIES_VIEW,
  ].filter((permission) => permission)
); // Remove any undefined permissions
```

### **If permissions are not loaded:**

```javascript
// Add permission loading check in AdminLayout
const AdminLayout = ({ children }) => {
  const { permissions, loading } = useAuth();

  if (loading || !permissions) {
    return <Spin size="large" />;
  }

  // ... rest of component
};
```

### **If hasPermission function fails:**

```javascript
// Add fallback permission check
const hasPermissionFallback = (permission) => {
  const localPerms = JSON.parse(
    localStorage.getItem("userPermissions") || "[]"
  );
  return localPerms.includes(permission);
};

const canAccess = (requiredPermissions = []) => {
  // ... existing logic ...
  return requiredPermissions.some(
    (permission) =>
      hasPermission(permission) || hasPermissionFallback(permission)
  );
};
```

## 🧪 **Testing Steps**

1. **Login with the problematic user**
2. **Check browser console** for debug output
3. **Try accessing `/branches` directly** (should work)
4. **Check localStorage** in browser DevTools:
   ```javascript
   localStorage.getItem("userPermissions");
   ```
5. **Check React DevTools** for AuthContext state
6. **Test with System Admin** (should always work)

## 🔄 **Remove Debug Code**

After fixing, remove the debug logging:

```javascript
// Remove this debug block from AdminLayout.js
if (requiredPermissions.includes(PERMISSIONS.BRANCHES_VIEW)) {
  console.log('🔍 Branch permission debug:', { ... });
}
```

## 📋 **Expected Results After Fix**

- ✅ User sees "Danh mục" menu group
- ✅ User sees "Chi nhánh" under "Danh mục"
- ✅ Menu item is clickable and works
- ✅ Route protection continues to work
- ✅ System admin still has full access

## ✅ **ISSUE RESOLVED - Root Cause & Fix**

### **Root Cause Found**

The issue was NOT with the permission checking logic, but with the **menu structure hierarchy**:

1. ✅ User had `branches:view` permission
2. ✅ Categories Group permission logic worked correctly
3. ❌ **System Settings Group** blocked access because user lacked `users:view`, `wallet:view`, or `system:settings`
4. ❌ Categories Group was nested inside System Settings, so it never rendered

### **Fix Applied**

Modified the System Settings group permission check in `AdminLayout.js` to include **all category permissions**:

```javascript
// Before (BROKEN) - Line 207
canAccess([
  PERMISSIONS.SYSTEM_SETTINGS,
  PERMISSIONS.USERS_VIEW,
  PERMISSIONS.WALLET_VIEW,
]);

// After (FIXED) - Lines 207-216
canAccess([
  PERMISSIONS.SYSTEM_SETTINGS,
  PERMISSIONS.USERS_VIEW,
  PERMISSIONS.WALLET_VIEW,
  PERMISSIONS.BRANCHES_VIEW, // ← Now includes this!
  PERMISSIONS.AREAS_VIEW,
  PERMISSIONS.LOCATIONS_VIEW,
  PERMISSIONS.DEPARTMENTS_VIEW,
  PERMISSIONS.DISEASECATEGORIES_VIEW,
]);
```

### **Key Lesson**

When troubleshooting permission-based menu visibility:

1. Check individual permission logic ✅
2. Check menu item permission requirements ✅
3. **Check parent/ancestor menu group permissions** ← **This was the issue!**

The Categories Group was "hidden" inside System Settings, which had its own access restrictions.
