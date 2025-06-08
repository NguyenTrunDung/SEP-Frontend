# API Architecture Documentation

## Overview

The HOMMS application uses a layered API architecture with centralized configuration management to ensure consistency, maintainability, and flexibility across different environments.

## Architecture Layers

### 1. Configuration Layer (`environment.js`)

- **Purpose**: Centralized environment and configuration management
- **Responsibilities**:
  - Environment variable management
  - Dynamic API versioning
  - Endpoint definitions
  - Feature flags
  - Multi-tenant configuration

### 2. HTTP Client Layer (`api/config.js`)

- **Purpose**: Axios configuration with interceptors
- **Responsibilities**:
  - HTTP client setup
  - Authentication headers
  - Multi-tenant headers (`X-Branch-Id`)
  - Request/response logging
  - Error handling

### 3. Service Layer (`*Service.js`)

- **Purpose**: Business logic and API integration
- **Responsibilities**:
  - API method implementations
  - Data transformation
  - Error handling
  - Business logic

## Key Features

### Dynamic API Versioning

```javascript
// Environment Configuration
api: {
    version: process.env.REACT_APP_API_VERSION || 'v1',

    get endpoints() {
        return {
            branches: this.getVersionedPath('/branches'),
            foods: this.getVersionedPath('/foods')
        };
    }
}

// Usage in Services
const response = await api.get(environment.api.endpoints.branches);
// Automatically resolves to: /api/v1/branches or /api/v2/branches
```

### Benefits:

- **Version Flexibility**: Change API version via environment variable
- **No Code Changes**: Services automatically use new version
- **Environment Specific**: Different versions for dev/staging/production

### Centralized Endpoint Management

**Before (❌ Hard-coded)**:

```javascript
// branchService.js
const response = await api.get("/api/v1/branches");
const response = await api.get("/api/v1/branches/default");
const response = await api.post(`/api/v1/branches/set-current/${branchId}`);
```

**After (✅ Centralized)**:

```javascript
// branchService.js
const response = await api.get(environment.api.endpoints.branch.list);
const response = await api.get(environment.api.endpoints.branch.default);
const response = await api.post(
  environment.api.endpoints.branch.setCurrent(branchId)
);
```

### Benefits:

- **Single Source of Truth**: All endpoints defined in one place
- **Easy Updates**: Change endpoint once, affects all services
- **Type Safety**: Better IDE support and error checking
- **Documentation**: Clear endpoint structure

## File Structure

```
src/
├── config/
│   └── environment.js          # Centralized configuration
├── services/
│   ├── api/
│   │   └── config.js          # HTTP client configuration
│   ├── branchService.js       # Branch-related API calls
│   ├── foodService.js         # Food-related API calls
│   └── example/
│       └── serviceTemplate.js # Service creation template
└── docs/
    └── API_ARCHITECTURE.md    # This documentation
```

## Configuration Examples

### Environment Variables (.env)

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5281
REACT_APP_API_VERSION=v1
REACT_APP_API_TIMEOUT=15000

# Feature Flags
REACT_APP_ENABLE_LOGGING=true
REACT_APP_ENABLE_MOCK_DATA=false

# Multi-tenant Configuration
REACT_APP_ENABLE_BRANCH_SELECTION=true
REACT_APP_DEFAULT_BRANCH_ID=1
```

### Dynamic Endpoint Resolution

```javascript
// Different environments automatically use different versions
// Development: /api/v1/branches
// Staging: /api/v2/branches
// Production: /api/v1/branches

// Set via environment variable
REACT_APP_API_VERSION = v2;
```

## Best Practices

### ✅ Do's:

1. **Use Centralized Endpoints**: Always use `environment.api.endpoints.*`
2. **Environment Variables**: Use environment variables for configuration
3. **Consistent Error Handling**: Use the same error handling pattern
4. **Logging**: Use `environment.features.enableLogging` for debug logs
5. **Documentation**: Document all service methods with JSDoc

### ❌ Don'ts:

1. **Hard-code URLs**: Never use `/api/v1/...` directly in services
2. **Duplicate Configuration**: Don't repeat API URLs across files
3. **Skip Error Handling**: Always handle and log errors
4. **Ignore Environment**: Don't bypass environment configuration

## Service Creation Template

```javascript
import api, { environment } from "../api/config";

export const newService = {
  async getItems() {
    try {
      // Use centralized endpoint
      const response = await api.get(environment.api.endpoints.items);

      // Optional logging
      if (environment.features.enableLogging) {
        console.log("✅ Fetched items:", response.data?.length);
      }

      return response.data;
    } catch (error) {
      // Consistent error handling
      if (environment.features.enableLogging) {
        console.error("❌ Failed to fetch items:", error.message);
      }
      throw error;
    }
  },
};
```

## Migration Guide

### From Hard-coded to Centralized

1. **Identify Hard-coded URLs**:

   ```bash
   grep -r "/api/v" src/services/
   ```

2. **Add Endpoints to environment.js**:

   ```javascript
   endpoints: {
     newEndpoint: this.getVersionedPath("/new-endpoint");
   }
   ```

3. **Update Service**:

   ```javascript
   // Before
   api.get("/api/v1/new-endpoint");

   // After
   api.get(environment.api.endpoints.newEndpoint);
   ```

## Testing

### Mock Environment Configuration

```javascript
// In tests
const mockEnvironment = {
  api: {
    endpoints: {
      branches: "/api/v1/branches",
    },
  },
};
```

## Future Enhancements

1. **GraphQL Support**: Add GraphQL endpoint configuration
2. **Rate Limiting**: Add rate limiting configuration
3. **Caching**: Add response caching configuration
4. **Retry Logic**: Add configurable retry policies
5. **Request Validation**: Add request/response schema validation

## Troubleshooting

### Common Issues:

1. **Endpoint Not Found Error**:

   ```
   Error: API endpoint 'unknown' not found
   ```

   - **Solution**: Add endpoint to `environment.js`

2. **Version Mismatch**:

   ```
   404 - /api/v2/branches not found
   ```

   - **Solution**: Check `REACT_APP_API_VERSION` environment variable

3. **Hard-coded URLs**:
   ```
   Request to /api/v1/... instead of configured version
   ```
   - **Solution**: Replace with centralized endpoint

## Summary

This architecture provides:

- **Flexibility**: Easy version and environment management
- **Maintainability**: Centralized configuration
- **Consistency**: Uniform patterns across services
- **Scalability**: Easy to add new endpoints and features
- **Developer Experience**: Clear patterns and documentation

By following these patterns, we ensure a robust, maintainable, and scalable API layer for the HOMMS application.
