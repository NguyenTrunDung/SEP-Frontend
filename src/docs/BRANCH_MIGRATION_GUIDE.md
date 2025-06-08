# Branch Management Migration Guide

## Overview

This guide explains the migration from the old manual state management `useBranches` hook to the new React Query-based implementation that integrates with the `branchService.js` API.

## What Changed

### ✅ Before (Old Implementation)

```javascript
// src/hooks/queries/useBranches.js - OLD
import { useState, useEffect } from "react";
import { getFilteredBranches } from "../../mocks/branchData";

export const useBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Manual state management with mock data
  const fetchBranches = async () => {
    // ... manual implementation
  };

  return { branches, loading, error };
};
```

### ✅ After (New Implementation)

```javascript
// src/hooks/queries/useBranches.js - NEW
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { branchService } from "../../services/branchService";

export const useBranches = (options = {}) => {
  return useQuery({
    queryKey: BRANCH_KEYS.lists(),
    queryFn: () => branchService.getAllBranches(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
};
```

## Migration Steps

### 1. Update Import Statements

**Before:**

```javascript
import { useBranches } from "../hooks/queries/useBranches";

const Component = () => {
  const { branches, loading, error } = useBranches();
  // ...
};
```

**After:**

```javascript
import { useBranches } from "../hooks/queries/useBranches";

const Component = () => {
  const { data: branches, isLoading: loading, isError, error } = useBranches();
  // ...
};
```

### 2. Update Property Names

| Old Property | New Property | Type    | Description               |
| ------------ | ------------ | ------- | ------------------------- |
| `branches`   | `data`       | Array   | The fetched branches data |
| `loading`    | `isLoading`  | Boolean | Loading state             |
| `error`      | `isError`    | Boolean | Error occurred flag       |
| `error`      | `error`      | Object  | Error details             |

### 3. Handle Error States

**Before:**

```javascript
{error ? (
  <Alert message={error} type="error" />
) : (
  // render content
)}
```

**After:**

```javascript
{isError ? (
  <Alert message={error?.message || 'Failed to load branches'} type="error" />
) : (
  // render content
)}
```

## New Features

### 1. Multiple Branch Hooks

```javascript
import {
  useBranches, // Get all branches
  useCurrentBranch, // Get current branch
  useDefaultBranch, // Get default branch
  useSwitchBranch, // Switch branch mutation
  useSetCurrentBranch, // Set current branch mutation
} from "../hooks/queries/useBranches";
```

### 2. Branch Context Integration

```javascript
// New branch context for centralized branch management
import { useBranchContext, BranchProvider } from "../hooks/useBranchContext";

const App = () => (
  <BranchProvider>
    <YourApp />
  </BranchProvider>
);

const Component = () => {
  const { currentBranchId, currentBranch, switchBranch, loading, error } =
    useBranchContext();

  return (
    <div>
      Current: {currentBranch?.Name}
      <button onClick={() => switchBranch(newBranchId)}>Switch Branch</button>
    </div>
  );
};
```

### 3. Advanced Branch Operations

```javascript
// Switch branch with proper API integration
const switchBranchMutation = useSwitchBranch();

const handleBranchSwitch = async (branchId) => {
  try {
    await switchBranchMutation.mutateAsync(branchId);
    message.success("Branch switched successfully");
  } catch (error) {
    message.error("Failed to switch branch");
  }
};

// Get admin system users for a branch
const { data: adminUsers } = useAdminSystemUsers(branchCode);
```

## Updated Components

### Navbar.js Changes

**Key Changes in Navbar:**

1. **Import Updates:**

```javascript
// Added useSwitchBranch for proper API integration
import { useBranches, useSwitchBranch } from "../hooks/queries/useBranches";
```

2. **Hook Usage:**

```javascript
// Updated destructuring for React Query
const { data: branches, isLoading: loading, isError, error } = useBranches();
const switchBranchMutation = useSwitchBranch();
```

3. **Branch Selection:**

```javascript
// Enhanced handleBranchSelect with API integration
const handleBranchSelect = async (branch) => {
  try {
    await switchBranchMutation.mutateAsync(branch.Id || branch.id);
    setSelectedBranch(branch);
    localStorage.setItem("selectedBranch", JSON.stringify(branch));
    setIsModalVisible(false);
    message.success(`Switched to: ${branch.Name || branch.name}`);
  } catch (error) {
    message.error("Failed to switch branch");
  }
};
```

4. **Loading States:**

```javascript
// Added loading states for branch switching
<List.Item
  style={{
    cursor: switchBranchMutation.isPending ? 'not-allowed' : 'pointer',
    opacity: switchBranchMutation.isPending ? 0.6 : 1,
  }}
  onClick={() => !switchBranchMutation.isPending && handleBranchSelect(branch)}
>
```

## Benefits of New Implementation

### 1. **Automatic Caching**

- Branches are cached for 10 minutes
- Reduces unnecessary API calls
- Improves performance

### 2. **Better Error Handling**

- Structured error responses
- Automatic retries
- Error boundaries support

### 3. **Loading States**

- Fine-grained loading states
- Optimistic updates
- Better UX

### 4. **Multi-tenant Support**

- Proper branch context management
- Query invalidation on branch switch
- Branch-specific data isolation

### 5. **Developer Experience**

- React Query DevTools integration
- Better debugging
- Type safety with TypeScript

## Testing

### Running Tests

```bash
# Run the new branch hooks tests
npm test -- --testPathPattern=useBranches.test.js
```

### Example Test Usage

```javascript
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBranches } from "../useBranches";

// Test with React Query provider
const { result } = renderHook(() => useBranches(), {
  wrapper: ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  ),
});
```

## Best Practices

### 1. **Use Branch Context**

```javascript
// ✅ Recommended - Use branch context for branch management
const { currentBranchId, switchBranch } = useBranchContext();

// ❌ Avoid - Direct localStorage manipulation
localStorage.setItem("currentBranchId", branchId);
```

### 2. **Handle Loading States**

```javascript
// ✅ Show appropriate loading states
if (isLoading) return <Spin />;
if (isError) return <Alert message={error.message} type="error" />;
```

### 3. **Use Query Options**

```javascript
// ✅ Configure queries appropriately
const { data: branches } = useBranches({
  enabled: shouldFetchBranches,
  staleTime: 5 * 60 * 1000,
});
```

## Troubleshooting

### Common Issues

1. **"Cannot read property 'data' of undefined"**

   - Make sure React Query is properly set up
   - Check if QueryClient is provided

2. **Branches not updating after switch**

   - Check if mutation is properly invalidating queries
   - Verify branch ID is correctly stored

3. **API calls failing**
   - Check `branchService.js` configuration
   - Verify API endpoints are correct
   - Check environment variables

### Debug Tips

1. **Use React Query DevTools:**

```javascript
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Add in development
{
  process.env.NODE_ENV === "development" && <ReactQueryDevtools />;
}
```

2. **Enable Logging:**

```javascript
// Check environment.features.enableLogging
console.log("Branch data:", branches);
console.log("Loading state:", isLoading);
```

## Migration Checklist

- [ ] Update imports to use new React Query hooks
- [ ] Change property destructuring (`branches` → `data`)
- [ ] Update error handling (`error` → `isError` + `error`)
- [ ] Add branch context provider if using context features
- [ ] Update components to handle new loading states
- [ ] Test branch switching functionality
- [ ] Verify API integration works correctly
- [ ] Update tests to use React Query patterns

## Support

If you encounter issues during migration:

1. Check the React Query documentation
2. Review the `branchService.js` implementation
3. Use React Query DevTools for debugging
4. Check browser console for error messages
