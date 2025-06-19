# Multi-Tenant Branch Architecture Guide

## ⚠️ Problem Analysis

You're absolutely correct to be concerned! Using the same React Query hooks across Home page (guest/public) and Admin site **can cause significant side effects** in a multi-tenant application.

### Current Issues:

1. **Cache Pollution** - Same query keys for different user contexts
2. **Data Leakage** - Admin data bleeding into guest interface
3. **Security Risks** - Public users accessing admin-only information
4. **Permission Conflicts** - Wrong endpoints for different user levels

## ✅ Solution: Context-Separated Architecture

### New Structure:

```
📦 Branch Query System
├── 🏠 Public Context (Guest/Home)
│   ├── usePublicBranches()
│   ├── publicBranchService
│   └── Query Keys: ['public', 'branches']
├── 🔐 Admin Context (Authenticated)
│   ├── useAdminBranches()
│   ├── branchService
│   └── Query Keys: ['branches', 'list']
└── 🎯 Smart Selector (Auto-routing)
    └── useBranchSelector()
```

## Implementation Details

### 1. Separate Services Created:

- `usePublicBranches.js` - For guest interfaces
- `publicBranchService.js` - No authentication required
- `useBranchSelector.js` - Smart routing hook

### 2. Updated Components:

- **Navbar.js** → Now uses `usePublicBranchesOnly()`
- **BranchSwitcher.js** → Now uses `useAdminBranchesOnly()`

### 3. Cache Isolation:

- Public: `['public', 'branches', 'list']`
- Admin: `['branches', 'list']`
- **No cache conflicts!**

## Usage Examples

### For Public/Guest Components:

```javascript
import { usePublicBranchesOnly } from "../hooks/queries/useBranchSelector";

const PublicNavbar = () => {
  // Always uses public endpoints, no auth
  const { data: branches } = usePublicBranchesOnly();
};
```

### For Admin Components:

```javascript
import { useAdminBranchesOnly } from "../hooks/queries/useBranchSelector";

const AdminDashboard = () => {
  // Always uses authenticated endpoints
  const { data: branches } = useAdminBranchesOnly();
};
```

### For Smart Auto-Selection:

```javascript
import { useBranches } from "../hooks/queries/useBranchSelector";

const SmartComponent = () => {
  // Automatically selects public or admin based on user role
  const { data: branches } = useBranches();
};
```

## Security Benefits

| Context    | Endpoints          | Auth        | Data Access     | Cache Keys               |
| ---------- | ------------------ | ----------- | --------------- | ------------------------ |
| **Public** | `/api/v1/branches` | ❌ None     | Basic info      | `['public', 'branches']` |
| **Admin**  | `/api/v1/branches` | ✅ Required | Full management | `['branches', 'list']`   |

## Next Steps

1. **Test the fixes** - Refresh browser and check console logs
2. **Verify separation** - Public and admin should use different caches
3. **Monitor performance** - Separate caching should improve performance
4. **Add monitoring** - Track which service is being used where

This architecture eliminates the side effects you were concerned about!
