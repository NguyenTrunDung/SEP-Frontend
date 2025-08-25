# 🏥 Department Selection Implementation for UserAccount Module

## Overview

This implementation adds conditional department selection functionality to the UserAccount module. When a user selects the "Điều dưỡng trưởng" (Nursing Manager) group, a department selection field appears, allowing them to choose a specific department. For other groups, the current workflow remains unchanged.

## Features Implemented

### 1. **Conditional Department Selection**

- Department field only appears when "Điều dưỡng trưởng" group is selected
- Hidden for all other user groups
- Maintains existing form layout and styling

### 2. **Dynamic Data Loading**

- Uses `useDepartments` hook to fetch department list
- Automatically loads departments for the current branch
- Includes search functionality for large department lists

### 3. **Enhanced Payload Handling**

- Automatically includes `departmentId` in API payloads when available
- Works for both create and update operations
- Maintains backward compatibility for existing users

## Technical Implementation

### **Files Modified:**

1. **`src/modules/Admin/UserAccount/UserAccountModal.js`**

   - Added department selection field
   - Integrated `useDepartments` hook
   - Added conditional rendering logic
   - Enhanced form state management

2. **`src/modules/Admin/UserAccount/index.js`**
   - Updated payload handling to include `departmentId`
   - Enhanced user mapping to include department data
   - Modified modal initialization

### **Key Components:**

#### **1. Department Field (Conditional)**

```javascript
{
  /* Department selection - only show for "Điều dưỡng trưởng" group */
}
{
  isNursingManagerGroup && (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <Form.Item
        name="departmentId"
        style={{ flex: 1 }}
        rules={[{ required: true, message: "Chọn phòng ban!" }]}
        className="floating-form-item"
      >
        <Select
          className="floating-input"
          placeholder="Chọn phòng ban"
          options={departments.map((dept) => ({
            value: dept.id,
            label: dept.name,
          }))}
          loading={departmentsLoading}
          showSearch
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>
      <div style={{ flex: 1 }}></div> {/* Spacer to maintain layout */}
    </div>
  );
}
```

#### **2. Group Change Handler**

```javascript
const handleGroupChange = (groupId) => {
  setSelectedGroupId(groupId);
  // Clear department field when group changes
  form.setFieldsValue({ departmentId: undefined });
};
```

#### **3. Conditional Department Logic**

```javascript
// Check if selected group is "Điều dưỡng trưởng"
const isNursingManagerGroup =
  selectedGroupId &&
  groupOptions.find((g) => g.value === selectedGroupId)?.label ===
    "Điều dưỡng trưởng";
```

#### **4. Enhanced Payload Handling**

```javascript
const userAccountPayload = {
  firstName: values.firstName,
  lastName: values.lastName,
  email: values.email,
  userName: values.username,
  password: values.password,
  branchId: branchId,
  branchRoleId: values.groupId,
  phoneNumber: values.phone,
  createdBy: localStorage.getItem("userEmail"),
  // Add departmentId if it exists (for "Điều dưỡng trưởng" group)
  ...(values.departmentId && { departmentId: values.departmentId }),
};
```

## User Experience Flow

### **1. Adding New User**

1. User fills in basic information (name, username, password, etc.)
2. User selects "Điều dưỡng trưởng" from group dropdown
3. Department selection field appears below
4. User selects appropriate department
5. Form submission includes `departmentId` in payload

### **2. Adding User with Other Groups**

1. User fills in basic information
2. User selects any group other than "Điều dưỡng trưởng"
3. No department field appears
4. Form submission proceeds without `departmentId`

### **3. Editing Existing User**

1. Modal opens with current user data
2. If user has "Điều dưỡng trưởng" group, department field shows
3. If user has other group, department field remains hidden
4. Changes are saved with appropriate payload structure

## Data Flow

### **Frontend → Backend:**

```
User Form Data → Enhanced Payload → API Call
     ↓
{
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  userName: "johndoe",
  password: "SecurePass123!",
  branchId: 1,
  branchRoleId: 7, // "Điều dưỡng trưởng" group
  phoneNumber: "0123456789",
  createdBy: "admin@example.com",
  departmentId: 15 // Only included for nursing managers
}
```

### **Backend → Frontend:**

```
API Response → Enhanced User Mapping → UI Display
     ↓
{
  userId: 123,
  branchRoleName: "Điều dưỡng trưởng",
  fullName: "John Doe",
  email: "john@example.com",
  branchRoleId: 7,
  isActive: true,
  branchId: 1,
  firstName: "John",
  lastName: "Doe",
  phoneNumber: "0123456789",
  userName: "johndoe",
  departmentId: 15 // Now included in user data
}
```

## Configuration

### **Environment Variables:**

- Uses `environment.multiTenant.getCurrentBranchId()` for branch context
- Automatically fetches departments for current branch

### **Dependencies:**

- `useDepartments` hook for department data
- `useAntForm` for form management
- Ant Design components for UI

## Benefits

### **1. Enhanced User Management**

- Better organization of nursing managers by department
- Improved accountability and reporting
- Clearer role assignment within departments

### **2. Maintained Compatibility**

- Existing users unaffected by changes
- Backward compatible API calls
- No breaking changes to current workflows

### **3. Improved User Experience**

- Conditional field display reduces form complexity
- Searchable department selection for large lists
- Consistent form layout and styling

## Testing Scenarios

### **1. Nursing Manager Group Selection**

- [ ] Department field appears when "Điều dưỡng trưởng" selected
- [ ] Department field is required
- [ ] Department field clears when group changes
- [ ] Payload includes departmentId

### **2. Other Group Selection**

- [ ] Department field remains hidden
- [ ] Form submission works without departmentId
- [ ] No validation errors for missing department

### **3. Edit Mode**

- [ ] Department field shows for existing nursing managers
- [ ] Department field hidden for other users
- [ ] Changes save correctly with/without departmentId

### **4. Data Persistence**

- [ ] New users with departmentId save correctly
- [ ] Existing users can be updated with departmentId
- [ ] DepartmentId included in API responses

## Future Enhancements

### **1. Department Validation**

- Validate department exists in current branch
- Show department name in user list
- Add department filter to user search

### **2. Enhanced Reporting**

- Department-based user statistics
- Department assignment reports
- User distribution by department

### **3. Bulk Operations**

- Bulk department assignment
- Department-based user import/export
- Department change workflows

## Conclusion

This implementation successfully adds conditional department selection for nursing managers while maintaining the existing functionality for other user groups. The solution is:

- **User-friendly**: Only shows relevant fields when needed
- **Maintainable**: Clean separation of concerns
- **Scalable**: Easy to extend for other groups
- **Compatible**: No breaking changes to existing functionality

The department selection enhances user management capabilities and provides better organizational structure for nursing managers within the hospital system.
