# Image CORS Solution for Production

## Problem Description

The application experiences CORS (Cross-Origin Resource Sharing) issues when loading images in production:

- **Frontend domain**: `https://homms.cuahangkinhdoanh.com`
- **API domain**: `https://apihomms.cuahangkinhdoanh.com`
- **Issue**: Images load on first visit but fail on page refresh due to CORS policy

### Error Message

```
Access to fetch at 'https://apihomms.cuahangkinhdoanh.com/uploads/60aaaaa2_4a1ec22f.jpg'
from origin 'https://homms.cuahangkinhdoanh.com' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause Analysis

1. **Cross-Origin Requests**: Frontend and API are on different subdomains
2. **CORS Preflight**: The `isImageAccessible()` function uses `fetch()` with `HEAD` method, triggering CORS preflight requests
3. **Missing CORS Headers**: The backend `/uploads/` static file serving doesn't include proper CORS headers
4. **Inconsistent Behavior**: Works on first load due to browser caching, fails on refresh due to fresh CORS checks

## Implemented Solutions

### 1. Smart Image Accessibility Checking

**File**: `src/utils/imageUtils.js`

```javascript
// Production CORS-safe image accessibility check
if (isProd && isApiDomain) {
  // Use Image() instead of fetch() to avoid CORS preflight
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imageUrl;
  });
}
```

**Benefits**:

- ✅ Avoids CORS preflight requests in production
- ✅ Uses browser's native image loading mechanism
- ✅ Maintains accessibility checking in development

### 2. Environment-Based URL Strategy

**File**: `src/utils/imageUtils.js`

```javascript
// Auto-detect API endpoint usage based on environment
const shouldUseApiEndpoint =
  useApiEndpoint !== null
    ? useApiEndpoint
    : process.env.NODE_ENV === "production" ||
      process.env.REACT_APP_USE_API_FOR_IMAGES === "true";
```

**Benefits**:

- ✅ Automatically uses API endpoint in production
- ✅ Configurable via environment variables
- ✅ Maintains flexibility for different deployment scenarios

### 3. Production-Safe Image Loading

**File**: `src/components/common/ImageDisplay.js`

```javascript
// Skip accessibility checks in production for API domains
if (isProd && isApiDomain) {
  // Trust the URL and let browser handle CORS
  setImageUrl(fullImageUrl);
  setIsLoading(false);
  return;
}
```

**Benefits**:

- ✅ Eliminates CORS preflight requests in production
- ✅ Faster image loading (no extra HTTP requests)
- ✅ Maintains error handling for development

## Quick Fix for Immediate Deployment

The changes made will resolve the CORS issue immediately:

1. ✅ **Modified `imageUtils.js`**: Uses `Image()` instead of `fetch()` in production
2. ✅ **Updated `ImageDisplay.js`**: Skips CORS-problematic checks in production
3. ✅ **Smart URL detection**: Auto-detects production environment

## Testing Instructions

1. **Deploy the updated code**
2. **Navigate to `/foods` page**
3. **Refresh the page multiple times**
4. **Verify no CORS errors in browser console**

## Backend Recommendation (Future)

For a permanent solution, add CORS headers to static file serving:

```csharp
// In Program.cs
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
        ctx.Context.Response.Headers.Add("Access-Control-Allow-Methods", "GET");
    }
});
```

This solution provides immediate relief while maintaining all functionality.

## Configuration Options

### Environment Variables

Add to your `.env.production` file:

```bash
# Force API endpoint usage for images (optional, auto-detected)
REACT_APP_USE_API_FOR_IMAGES=true

# Enable detailed logging (for debugging)
REACT_APP_ENABLE_LOGGING=false
```

### Image Configuration

**File**: `src/config/imageConfig.js`

The configuration now automatically detects production environment and adjusts accordingly.

## Testing the Solution

### 1. Development Testing

```bash
npm start
# Images should load normally with accessibility checks
```

### 2. Production Testing

```bash
npm run build
npm install -g serve
serve -s build
# Images should load without CORS errors on refresh
```

### 3. Manual Testing Steps

1. Open the application in production
2. Navigate to `/foods` page
3. Verify images load correctly
4. Refresh the page (Ctrl+F5)
5. Verify images still load without CORS errors
6. Check browser console for any CORS-related errors

## Monitoring and Debugging

### Enable Debug Logging

Set `REACT_APP_ENABLE_LOGGING=true` to see detailed image loading logs:

```javascript
console.log("👁️ ViewMenuModal - Opening with menuId:", menuId);
console.log("🖼️ Image URL strategy:", {
  isProd,
  isApiDomain,
  shouldUseApiEndpoint,
});
console.log("🔍 Image accessibility check:", {
  method: "Image()",
  url: imageUrl,
});
```

### Browser Developer Tools

1. **Network Tab**: Check for failed image requests
2. **Console Tab**: Look for CORS error messages
3. **Application Tab**: Check if images are being cached properly

## Performance Considerations

### Advantages of the Solution

1. **Reduced HTTP Requests**: Skips unnecessary accessibility checks in production
2. **Faster Loading**: Direct image loading without preflight requests
3. **Better Caching**: Browser handles image caching more efficiently
4. **Fallback Graceful**: Still works if images fail to load

### Potential Trade-offs

1. **Less Error Detection**: Reduced ability to detect broken images in production
2. **Trust-Based**: Assumes image URLs are valid in production

## Future Improvements

1. **CDN Integration**: Move images to a CDN with proper CORS configuration
2. **Image Optimization**: Implement responsive images and lazy loading
3. **Error Tracking**: Add error reporting for failed image loads
4. **Cache Management**: Implement intelligent cache invalidation

## Rollback Plan

If issues occur, you can quickly rollback by:

1. **Disable Production Optimizations**:

   ```bash
   REACT_APP_USE_API_FOR_IMAGES=false
   ```

2. **Re-enable Accessibility Checks**:

   ```javascript
   // In ImageDisplay.js, comment out the production skip logic
   // if (isProd && isApiDomain) { ... }
   ```

3. **Use Original Configuration**:
   ```javascript
   // In imageConfig.js
   useApiEndpoint: true, // Force API endpoint usage
   ```

## Summary

This solution provides a robust, production-ready approach to handling image CORS issues while maintaining development functionality and providing multiple fallback strategies. The implementation is backward-compatible and can be easily configured for different deployment scenarios.
