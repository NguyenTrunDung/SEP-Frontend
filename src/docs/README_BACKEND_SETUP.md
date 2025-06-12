# HOMMS Backend API Configuration Guide

## 🔧 Environment Setup

### 1. Environment Variables

Your `.env` file should contain the following configuration:

```bash
# Backend API Configuration
REACT_APP_API_URL=http://localhost:5281
REACT_APP_API_VERSION=v1
REACT_APP_API_TIMEOUT=15000

# Authentication Configuration
REACT_APP_JWT_TOKEN_KEY=jwtToken
REACT_APP_REFRESH_TOKEN_KEY=refreshToken
REACT_APP_BRANCH_ID_KEY=currentBranchId

# Feature Flags
REACT_APP_ENABLE_MOCK_DATA=false
REACT_APP_ENABLE_DEVTOOLS=true
REACT_APP_ENABLE_LOGGING=true

# App Configuration
REACT_APP_APP_NAME=HOMMS - Hospital Canteen Order Management
REACT_APP_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development

# Multi-tenant Configuration
REACT_APP_DEFAULT_BRANCH_ID=1
REACT_APP_ENABLE_BRANCH_SELECTION=true

# Performance Configuration
REACT_APP_QUERY_STALE_TIME=300000
REACT_APP_QUERY_CACHE_TIME=600000
```

### 2. Different Environment Files

Create separate environment files for different stages:

- `.env` - Default configuration
- `.env.local` - Local overrides (gitignored)
- `.env.development` - Development specific
- `.env.production` - Production specific

## 🚀 Quick Start

### 1. Start Backend Server

Ensure your HOMMS backend API is running on `http://localhost:5281`

### 2. Test API Connection

```javascript
// Import the environment config
import environment from "./src/config/environment";

// Check API connection
console.log("API URL:", environment.api.baseURL);
console.log("Features:", environment.features);
```

### 3. Test Authentication

```javascript
import { authService } from "./src/services/authService";

// Test login
const testLogin = async () => {
  try {
    const result = await authService.login({
      email: "admin@homms.com",
      password: "Admin@123456",
    });
    console.log("Login successful:", result);
  } catch (error) {
    console.error("Login failed:", error);
  }
};
```

## 🔍 API Testing

### Authentication Endpoints

```javascript
// Test all auth endpoints
import { authService } from "./src/services/authService";

// 1. Login
await authService.login({
  email: "admin@homms.com",
  password: "Admin@123456",
});

// 2. Get current user
await authService.getCurrentUser();

// 3. Refresh token
await authService.refreshToken();

// 4. Logout
await authService.logout();
```

### Branch Management

```javascript
import { branchService } from "./src/services/branchService";

// 1. Get all branches
const branches = await branchService.getAllBranches();

// 2. Get default branch
const defaultBranch = await branchService.getDefaultBranch();

// 3. Set current branch
await branchService.setCurrentBranch("1");

// 4. Get current branch
const currentBranch = await branchService.getCurrentBranch();
```

### Food Management

```javascript
import { foodService } from "./src/services/foodService";

// 1. Get all foods (with branch context)
const foods = await foodService.getFoods();

// 2. Get food by ID
const food = await foodService.getFoodById("1");

// 3. Create food
const newFood = await foodService.createFood({
  name: "Bánh mì",
  categoryId: 1,
  description: "Bánh mì đặc biệt",
  priceForGuest: 20000,
});

// 4. Update food
await foodService.updateFood("1", {
  name: "Bánh mì thịt",
  priceForGuest: 25000,
});

// 5. Delete food
await foodService.deleteFood("1");
```

## 🐛 Debugging

### Enable Detailed Logging

Set in your `.env`:

```bash
REACT_APP_ENABLE_LOGGING=true
```

This will show detailed API logs in the browser console:

- 🌐 API Requests (with headers, params, data)
- ✅ API Responses (with status, data)
- ❌ API Errors (with detailed error info)
- 🔥 React Query errors

### Check Environment Configuration

```javascript
import environment from "./src/config/environment";

// Log current configuration
environment.dev.logConfig();

// Validate configuration
environment.dev.validateConfig();
```

### Network Tab Inspection

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by XHR/Fetch
4. Look for requests to your API URL
5. Check request headers for:
   - `Authorization: Bearer [token]`
   - `X-Branch-Id: [branchId]`
   - `Content-Type: application/json`

## ⚠️ Troubleshooting

### CORS Issues

If you get CORS errors, ensure your backend allows:

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Headers: Authorization, Content-Type, X-Branch-Id
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### Authentication Issues

1. Check if JWT token is stored: `localStorage.getItem('jwtToken')`
2. Verify token format in Authorization header
3. Check token expiration
4. Test refresh token mechanism

### Branch Context Issues

1. Verify `X-Branch-Id` header is sent
2. Check if branch ID is stored: `localStorage.getItem('currentBranchId')`
3. Test branch switching functionality
4. Verify backend validates branch access

### Network Issues

1. Verify backend is running on correct port
2. Check firewall/proxy settings
3. Test with curl or Postman first
4. Verify SSL/TLS configuration if using HTTPS

## 📊 Monitoring

### API Performance

The environment config includes performance monitoring:

- Request/response timing
- Error rate tracking
- Branch switching performance
- Token refresh frequency

### Health Checks

```javascript
import api from "./src/services/api/config";

// Simple health check
const healthCheck = async () => {
  try {
    await api.get("/api/health");
    console.log("✅ API is healthy");
  } catch (error) {
    console.error("❌ API health check failed:", error);
  }
};
```

## 🔒 Security Considerations

1. **Never commit `.env.local`** - Contains sensitive data
2. **Use HTTPS in production** - Protect JWT tokens
3. **Implement proper token rotation** - Refresh tokens regularly
4. **Validate branch access server-side** - Don't trust client
5. **Use secure localStorage alternatives** - Consider httpOnly cookies

## 🚀 Production Deployment

### Environment Variables

```bash
# Production .env
REACT_APP_API_URL=https://api.homms.yourdomain.com
REACT_APP_ENABLE_LOGGING=false
REACT_APP_ENABLE_DEVTOOLS=false
REACT_APP_ENVIRONMENT=production
```

### Build Configuration

```bash
# Build with production environment
npm run build

# Verify environment variables are properly set
grep -r "REACT_APP_" build/static/js/
```

## 📝 API Documentation

Your backend API follows these patterns:

- **Base URL**: `http://localhost:5281`
- **API Version**: `v1`
- **Authentication**: JWT Bearer tokens
- **Multi-tenancy**: `X-Branch-Id` header
- **Content-Type**: `application/json`

### Endpoint Structure

```
/api/auth/*           - Authentication endpoints
/api/v1/branches/*    - Branch management
/api/v1/foods/*       - Food management (with branch context)
/api/v1/foodcategories/* - Food categories (with branch context)
/api/v1/public/menus/* - Public menu endpoints
```

## 🔄 Next Steps

1. Test all API endpoints with your backend
2. Implement error handling for your specific use cases
3. Add more services for other backend endpoints
4. Configure production environment variables
5. Set up monitoring and logging for production
6. Implement proper error boundaries for network issues
