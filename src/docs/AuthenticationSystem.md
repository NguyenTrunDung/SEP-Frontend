# HOMMS Authentication System Implementation

## Overview

This document outlines the comprehensive implementation of the Hospital Canteen Order Management System (HOMMS) authentication system with refresh tokens, database-driven permissions, and branch role management.

## Key Changes Implemented

### 1. **Refresh Token Support**

- JWT access tokens now have shorter lifespans (60 minutes by default)
- Refresh tokens with longer lifespans (7 days by default) for token renewal
- Secure refresh token storage in database with expiry tracking
- Automatic token cleanup on logout

### 2. **Permissions Moved from JWT to Response**

- JWT tokens no longer contain embedded permissions (reduced token size)
- Permissions are loaded from database and returned in login response
- Frontend can cache permissions separately from authentication token
- More secure and flexible permission management

### 3. **Database-Driven Permission System**

- Permissions stored in `BranchRole.Permissions` field (comma-separated)
- Dynamic permission loading based on user's branch roles
- Support for both global admin permissions and branch-specific permissions
- Real-time permission updates without requiring re-login

## New API Endpoints

### Authentication Endpoints

#### 1. **Enhanced Login** - `POST /api/v1/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "base64-encoded-refresh-token",
    "tokenExpiryTime": "2024-01-01T12:00:00Z",
    "refreshTokenExpiryTime": "2024-01-08T11:00:00Z",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "phoneNumber": "+1234567890",
      "address": "123 Main St",
      "profilePictureUrl": "https://example.com/avatar.jpg",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "roles": ["User"]
    },
    "permissions": [
      "overview:view",
      "orders:view",
      "orders:add",
      "foods:view",
      "patients:view"
    ],
    "userBranches": [
      {
        "branchId": 1,
        "branchName": "Can Tho Hospital",
        "branchCode": "CT01",
        "branchRoleId": 2,
        "branchRoleName": "Nhân viên",
        "branchPermissions": ["orders:view", "orders:add"],
        "isDefault": true,
        "assignedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "defaultBranch": {
      "id": 1,
      "name": "Can Tho Hospital",
      "code": "CT01",
      "address": "123 Hospital St",
      "phone": "+84123456789",
      "email": "contact@cantho-hospital.com",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "isSystemAdmin": false
  }
}
```

#### 2. **Refresh Token** - `POST /api/v1/auth/refresh-token`

```json
{
  "accessToken": "expired-or-valid-jwt-token",
  "refreshToken": "valid-refresh-token"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new-jwt-token",
    "refreshToken": "new-refresh-token",
    "tokenExpiryTime": "2024-01-01T13:00:00Z",
    "refreshTokenExpiryTime": "2024-01-08T12:00:00Z"
  }
}
```

#### 3. **Logout** - `POST /api/v1/auth/logout`

**Headers:** `Authorization: Bearer {jwt-token}`

**Response:**

```json
{
  "status": "success",
  "message": "Logout successful",
  "data": null
}
```

#### 4. **Enhanced Branch Selection** - `POST /api/v1/auth/select-branch`

**Headers:** `Authorization: Bearer {jwt-token}`

```json
{
  "branchId": 2
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Branch selected successfully",
  "data": {
    "accessToken": "new-jwt-with-branch-context",
    "selectedBranch": {
      "id": 2,
      "name": "Ho Chi Minh Hospital",
      "code": "HCM01",
      "address": "456 Hospital Ave",
      "isActive": true
    },
    "branchRole": {
      "branchId": 2,
      "branchName": "Ho Chi Minh Hospital",
      "branchCode": "HCM01",
      "branchRoleId": 3,
      "branchRoleName": "Quản lý",
      "branchPermissions": [
        "overview:view",
        "orders:view",
        "orders:add",
        "orders:edit"
      ],
      "assignedAt": "2024-01-01T00:00:00Z"
    },
    "availablePermissions": [
      "overview:view",
      "orders:view",
      "orders:add",
      "orders:edit"
    ]
  }
}
```

## Permission System Architecture

### Branch Role System

#### **BranchRole Entity**

```csharp
public class BranchRole : BaseAuditableEntity<int>
{
    public string Name { get; set; } = string.Empty;
    public int BranchId { get; set; }
    public bool IsDefault { get; set; }
    public string Permissions { get; set; } = string.Empty; // Comma-separated

    public virtual Branch? Branch { get; set; }
    public virtual ICollection<BranchUserRole> BranchUserRoles { get; set; }
}
```

#### **BranchUserRole Entity**

```csharp
public class BranchUserRole : BaseAuditableEntity<int>
{
    public string UserId { get; set; } = string.Empty;
    public int? BranchId { get; set; }
    public int BranchRoleId { get; set; }

    public virtual ApplicationUser? User { get; set; }
    public virtual BranchRole? BranchRole { get; set; }
    public virtual Branch? Branch { get; set; }
}
```

#### **BranchUser Entity** (Junction for branch access)

```csharp
public class BranchUser : BaseEntity<int>
{
    public int BranchId { get; set; }
    public string? UserId { get; set; }
    public bool IsDefault { get; set; }

    public virtual Branch? Branch { get; set; }
    public virtual ApplicationUser? User { get; set; }
}
```

### Permission Categories

#### **Foods Management**

- `foods:view` - View food items
- `foods:add` - Add new food items
- `foods:edit` - Edit existing food items
- `foods:delete` - Delete food items

#### **Food Categories Management**

- `foodcategories:view` - View food categories
- `foodcategories:add` - Add new categories
- `foodcategories:edit` - Edit existing categories
- `foodcategories:delete` - Delete categories

#### **Orders Management**

- `orders:view` - View orders
- `orders:add` - Create new orders
- `orders:edit` - Edit existing orders
- `orders:delete` - Delete orders
- `orders:approve` - Approve orders
- `orders:cancel` - Cancel orders

#### **Menu Management**

- `menus:view` - View menus
- `menus:add` - Add new menus
- `menus:edit` - Edit existing menus
- `menus:delete` - Delete menus
- `menus:publish` - Publish menus

#### **Kitchen Operations**

- `kitchen:view` - View kitchen dashboard
- `kitchen:status` - Update order status
- `kitchen:prepare` - Mark orders as preparing
- `kitchen:complete` - Mark orders as completed

#### **User & Patient Management**

- `users:view`, `users:add`, `users:edit`, `users:delete`, `users:roles`
- `patients:view`, `patients:add`, `patients:edit`, `patients:delete`, `patients:dietary`

#### **Reports & Analytics**

- `reports:view`, `reports:revenue`, `reports:orders`, `reports:patients`, `reports:export`

#### **Wallet & Financial**

- `wallet:view`, `wallet:transactions`, `wallet:topup`, `wallet:refund`

## Predefined Branch Roles

### 1. **Admin System** (Global)

- **All permissions** in the system
- Access to all branches
- System configuration access

### 2. **Quản lý** (Manager)

- Comprehensive permissions for branch management
- User management within branch
- Financial reports access
- Default role for new managers

### 3. **Nhân viên** (Staff)

- Basic food and order management
- Patient interaction capabilities
- Limited reporting access

### 4. **Nhà bếp** (Kitchen Staff)

- Kitchen operations focus
- Order status management
- Food preparation tracking

### 5. **Giao hàng** (Delivery Staff)

- Delivery management
- Order tracking
- Patient location access

### 6. **Y tá** (Nurse)

- Patient-focused permissions
- Dietary management
- Order placement for patients

### 7. **Kế toán** (Accountant)

- Financial reporting
- Wallet management
- Revenue analytics

## Implementation Logic

### User Authentication Flow

1. **Login Request** → Validate credentials
2. **Generate Tokens** → Access token (short-lived) + Refresh token (long-lived)
3. **Load Permissions** → Query user's branch roles and aggregate permissions
4. **Return Response** → Complete user context with permissions and branch info

### Permission Resolution Logic

1. **Check System Admin** → If user has "Admin" role, grant all permissions
2. **Load Branch Roles** → Get all BranchUserRole entries for user
3. **Aggregate Permissions** → Combine permissions from all branch roles
4. **Return Unique Set** → Deduplicated list of permissions

### Branch Context Management

1. **Default Branch** → First branch assigned to user or system default
2. **Branch Selection** → Update JWT context with selected branch
3. **Permission Filtering** → Return only permissions for selected branch
4. **Context Persistence** → Maintain branch context across requests

### Token Refresh Flow

1. **Validate Refresh Token** → Check expiry and existence in database
2. **Generate New Tokens** → Create new access token with existing context
3. **Update Database** → Store new refresh token, invalidate old one
4. **Return New Tokens** → Client updates stored tokens

## Security Considerations

### JWT Token Security

- **No Sensitive Data** → Permissions not embedded in token
- **Short Lifespan** → Access tokens expire quickly
- **Proper Validation** → Signature and expiry validation
- **Branch Context** → Optional branch ID in token claims

### Refresh Token Security

- **Database Storage** → Tokens stored securely in database
- **Expiry Tracking** → Automatic cleanup of expired tokens
- **One-Time Use** → Tokens invalidated after refresh
- **Logout Cleanup** → Tokens revoked on explicit logout

### Permission Security

- **Database-Driven** → Permissions loaded from database, not constants
- **Real-Time Updates** → Permission changes take effect immediately
- **Branch Isolation** → Users can only access assigned branches
- **Role-Based Access** → Granular permission control per role

## Frontend Integration Guidelines

### Token Management

```typescript
// Store tokens securely
localStorage.setItem("accessToken", response.data.accessToken);
localStorage.setItem("refreshToken", response.data.refreshToken);

// Automatic token refresh
if (isTokenExpired(accessToken)) {
  const newTokens = await refreshTokens(refreshToken);
  updateStoredTokens(newTokens);
}
```

### Permission Checking

```typescript
// Cache permissions from login response
const userPermissions = response.data.permissions;

// Check permissions before showing UI elements
const canAddOrders = userPermissions.includes("orders:add");
const canEditFoods = userPermissions.includes("foods:edit");
```

### Branch Management

```typescript
// Handle branch selection
const selectBranch = async (branchId: number) => {
  const response = await api.post("/auth/select-branch", { branchId });
  updateAccessToken(response.data.accessToken);
  updateUserPermissions(response.data.availablePermissions);
};
```

## Configuration Settings

### JWT Settings (appsettings.json)

```json
{
  "JwtSettings": {
    "SecretKey": "your-super-secret-key-here",
    "Issuer": "homms-api",
    "Audience": "homms-client",
    "ExpiryInMinutes": 60,
    "RefreshExpiryInDays": 7
  }
}
```

## Database Migration Requirements

### New Refresh Token Fields

- `ApplicationUser.RefreshToken` (nullable string)
- `ApplicationUser.RefreshTokenExpiryTime` (nullable DateTime)

### Enhanced Branch Role System

- Comprehensive `BranchRole.Permissions` seeding
- Proper `BranchUserRole` relationships
- Default branch assignments

## Testing Strategy

### Unit Tests

- AuthService method testing
- Permission aggregation logic
- Token generation and validation

### Integration Tests

- Full authentication flow
- Permission resolution
- Branch context switching

### Security Tests

- Token expiry handling
- Permission boundary testing
- Branch access validation

## Deployment Considerations

### Database Updates

1. Run migrations for refresh token fields
2. Seed comprehensive branch roles
3. Assign users to appropriate branch roles
4. Test permission resolution

### Configuration Updates

1. Update JWT settings in production
2. Configure secure token storage
3. Set appropriate token lifespans
4. Enable HTTPS for token security

### Monitoring & Logging

1. Track token refresh rates
2. Monitor permission queries
3. Log authentication failures
4. Alert on suspicious activities

This implementation provides a robust, secure, and scalable authentication system that supports the complex multi-branch, multi-role requirements of the hospital canteen management system.
