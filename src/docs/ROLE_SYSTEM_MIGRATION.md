# Role System Migration Guide

## Overview

The system has been updated to use a simplified Identity role structure while maintaining the comprehensive Branch role system for permissions.

## Role System Architecture

### 1. ASP.NET Core Identity Roles (ApplicationRole)

**Purpose**: High-level user categorization for authentication

| New Role      | Old Role(s)                                          | Description                             | Use Case                                    |
| ------------- | ---------------------------------------------------- | --------------------------------------- | ------------------------------------------- |
| `SystemAdmin` | `Admin`                                              | System administrator with global access | Can access all branches and system settings |
| `Staff`       | `Manager`, `User`, `Doctor`, `Nurse`, `Nutritionist` | Hospital/canteen staff member           | Access determined by branch roles           |
| `Patient`     | _(new)_                                              | Hospital patient                        | Limited access for ordering food            |
| `Guest`       | _(new)_                                              | Guest user                              | Temporary access for visitors               |

### 2. Branch Role System (BranchRole)

**Purpose**: Fine-grained permissions and branch-specific operations

Unchanged - continues to use Vietnamese role names with detailed permissions:

- `Admin System` - Complete branch control
- `Quản lý chi nhánh` - Branch management
- `Quản lý` - Management operations
- `Thu Ngân` - Cashier operations
- `Nhân viên` - Staff operations
- `Nhà bếp` - Kitchen operations
- `Y tá` - Nursing operations

## Migration Changes Made

### Code Updates

1. **IdentitySeedData.cs**

   - Updated Identity roles to 4 simplified categories
   - Changed admin user assignment to `SystemAdmin`
   - Updated test user assignments to appropriate roles

2. **IdentityServiceExtensions.cs**

   - Updated authorization policies:
     - `RequireSystemAdminRole` (was `RequireAdminRole`)
     - `RequireStaffRole` (was `RequireManagerRole`/`RequireUserRole`)
     - Added `RequirePatientRole` and `RequireGuestRole`
     - Added combined policies: `RequireStaffOrAdmin`, `RequireAnyUser`

3. **AuthService.cs**

   - Updated `IsSystemAdmin` check to use `SystemAdmin` role
   - Updated admin permission logic

4. **AuthController.cs**

   - Changed default registration role to `Staff`
   - Updated admin system checks to use `SystemAdmin`

5. **BranchContextMiddleware.cs**

   - Updated admin system check to use `SystemAdmin`

6. **BranchesController.cs**
   - Updated admin role check to use `SystemAdmin`

### Database Impact

- **No database schema changes required**
- Existing Identity role data will be updated by seed data
- Branch role system remains completely unchanged

## Usage Guidelines

### For Authentication (Identity Roles)

```csharp
// Check user category
if (User.IsInRole("SystemAdmin"))
{
    // Global system access
}

if (User.IsInRole("Staff"))
{
    // Hospital/canteen staff
}

// Use policies
[Authorize(Policy = "RequireStaffOrAdmin")]
public async Task<IActionResult> StaffAction() { }
```

### For Authorization (Branch Roles)

```csharp
// Check specific permissions
if (userPermissions.Contains("orders:approve"))
{
    // Can approve orders in current branch
}

// Get user's branch roles
var branchRoles = await _authService.GetUserBranchRolesAsync(userId);
```

## Migration Checklist

- [x] Update Identity role seeding
- [x] Update authorization policies
- [x] Update AuthService logic
- [x] Update middleware checks
- [x] Update controller role checks
- [x] Verify no controller attributes use old role names
- [ ] Test authentication with new roles
- [ ] Test authorization with existing branch permissions
- [ ] Update any frontend role checks (if applicable)

## Benefits of New System

1. **Simplified Identity Layer**: Only 4 high-level categories instead of 6 mixed roles
2. **Clear Separation**: Identity for "who they are", Branch roles for "what they can do"
3. **Scalability**: Easy to add new branches with independent role structures
4. **Maintainability**: Less confusion between authentication and authorization
5. **Flexibility**: Users can have different permissions across branches

## Backward Compatibility

- Branch role system is completely unchanged
- Existing permissions continue to work
- Only Identity roles are simplified
- No breaking changes to API endpoints

## Testing Notes

When testing, remember:

- New users get `Staff` role by default (was `User`)
- Admin users now have `SystemAdmin` role (was `Admin`)
- All branch-specific permissions work exactly as before
- Authorization policies have new names but same functionality
