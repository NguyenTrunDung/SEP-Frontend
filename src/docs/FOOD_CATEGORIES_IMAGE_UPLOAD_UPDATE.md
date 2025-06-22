# Food Categories Server Upload Implementation

## Overview

This update removes all Cloudinary functionality and implements exclusive server upload capabilities for food categories, ensuring all create and update operations use the server endpoints with multipart/form-data. Additionally, fixes critical backend issues that were preventing image uploads from working correctly.

## Backend Fixes Applied

### 1. **AutoMapper Configuration Fixed** (`DomainToDtoProfile.cs`)

**Problem**: Missing bidirectional mapping for `FoodCategoryDto` ↔ `FoodCategory`
**Solution**: Added reverse mapping to handle DTO → Entity conversion

```csharp
// Added missing reverse mapping
CreateMap<FoodCategoryDto, FoodCategory>()
    .ForMember(dest => dest.Image, opt => opt.MapFrom(src => src.ImageUrl))
    .ForMember(dest => dest.Sort, opt => opt.MapFrom(src => src.Sort));
```

### 2. **Repository Methods Added** (`IFoodCategoryRepository.cs` & `FoodCategoryRepository.cs`)

**Problem**: Missing `AddAndSaveAsync`, `FindByIdAsync`, and `UpdateAndSaveAsync` methods
**Solution**: Added methods to match `IFoodRepository` pattern

```csharp
Task AddAndSaveAsync(FoodCategory category);
Task<FoodCategory?> FindByIdAsync(int id);
Task UpdateAndSaveAsync(FoodCategory category);
```

### 3. **Service Implementation Updated** (`FoodCategoryService.cs`)

**Problem**: Using base repository methods without immediate save
**Solution**: Updated to use new repository methods that save immediately

- `AddAsync` → `AddAndSaveAsync`
- `GetByIdAsync` → `FindByIdAsync`
- `UpdateAsync` → `UpdateAndSaveAsync`

### 4. **Controller Response Format Consistency** (`FoodCategoriesController.cs`)

**Requirement**: Food categories should maintain consistent `ApiResponseBase` wrapper format
**Solution**: Updated image upload endpoints to use `ApiResponseBase` wrapper for consistency

```csharp
// Image upload endpoints maintain ApiResponseBase consistency
return Ok(new ApiResponseBase<FoodCategoryDto>(result, "Category created successfully"));
return BadRequest(new ApiResponseBase<FoodCategoryDto>(null, ex.Message, "error"));
```

### 5. **Frontend Response Handling Maintained** (`useFoodCategories.js`)

**Result**: Hooks continue to handle `ApiResponseBase` wrapper format
**Implementation**: Success handlers properly extract data and messages

- `response.data` - Contains the actual category DTO
- `response.message` - Contains success/error messages

## Changes Made

### 1. Hook Updates (`useFoodCategories.js`)

#### Removed Cloudinary Hooks:

- ❌ `useCreateFoodCategoryWithCloudinary`
- ❌ `useUpdateFoodCategoryWithCloudinary`
- ❌ `useCreateFoodCategoryWithImage` (separate hook)
- ❌ `useUpdateFoodCategoryWithImage` (separate hook)

#### Updated Main Hooks:

- ✅ `useCreateFoodCategory` - Now exclusively uses server upload endpoint
- ✅ `useUpdateFoodCategory` - Now exclusively uses server upload endpoint

#### Server Endpoints Used:

- **Create**: `POST /api/v1/foodcategories/create` (multipart/form-data)
- **Update**: `PUT /api/v1/foodcategories/update/{id}` (multipart/form-data)

### 2. Service Updates (`foodCategoryService.js`)

#### Removed Methods:

- ❌ `createFoodCategoryWithCloudinary`
- ❌ `updateFoodCategoryWithCloudinary`

#### Retained Methods:

- ✅ `createFoodCategoryWithImage` - Server upload only
- ✅ `updateFoodCategoryWithImage` - Server upload only

### 3. Component Updates

#### CreateFoodCategory.js:

- ❌ Removed Cloudinary upload widget integration
- ❌ Removed upload mode toggle (Cloudinary/Server)
- ❌ Removed Cloudinary-specific UI elements
- ✅ Simplified to server upload only
- ✅ Enhanced drag-and-drop interface
- ✅ Real-time image preview
- ✅ File validation using `imageUtils.js`

#### EditFoodCategory.js:

- ❌ Removed Cloudinary upload widget integration
- ❌ Removed upload mode toggle
- ❌ Removed Cloudinary-specific state management
- ✅ Simplified to server upload only
- ✅ Proper existing image display using `getImageUrlWithFallback()`
- ✅ Support for replacing existing images
- ✅ Enhanced preview system

### 4. Main Component (`index.js`)

- ✅ `handleCreateOrUpdate` function properly passes `imageFile` parameter
- ✅ Hooks automatically route to server upload endpoints
- ✅ No changes needed - backward compatible

## API Integration

### Backend Controller Mapping:

```csharp
[HttpPost("create")]
[Consumes("multipart/form-data")]
[Authorize(Policy = "Permission:foodcategories:add")]
public async Task<IActionResult> CreateCategoryWithImage([FromForm] FoodCategoryCreateRequest request)

[HttpPut("update/{id}")]
[Consumes("multipart/form-data")]
[Authorize(Policy = "Permission:foodcategories:edit")]
public async Task<IActionResult> UpdateCategoryWithImage(int id, [FromForm] FoodCategoryCreateRequest request)
```

### FormData Structure:

```javascript
formData.append("Name", categoryData.name || "");
formData.append("ImageUrl", categoryData.imageUrl || "");
formData.append("Sort", (categoryData.sort || 0).toString());
formData.append("BranchId", currentBranchId.toString());
if (imageFile) {
  formData.append("Image", imageFile);
}
```

## Key Features

### Server Upload Only:

- ✅ All operations use server upload endpoints
- ✅ Automatic FormData creation for multipart requests
- ✅ File validation with size and type checking
- ✅ Real-time image preview
- ✅ Proper error handling and user feedback

### Image Management:

- ✅ Support for PNG, JPG, JPEG formats
- ✅ 5MB file size limit validation
- ✅ Image preview with cleanup on component unmount
- ✅ Existing image preservation when editing
- ✅ Server image URL processing with fallbacks

### User Experience:

- ✅ Simplified interface without mode switching
- ✅ Drag-and-drop upload area
- ✅ Visual feedback for file selection
- ✅ Clear error messages in Vietnamese
- ✅ Consistent button styling and behavior

## Migration Benefits

1. **Simplified Architecture**: Single upload method reduces complexity
2. **Server Control**: All images managed by server infrastructure
3. **Consistent Processing**: Uniform image handling across all components
4. **Better Security**: Server-side validation and processing
5. **Reduced Dependencies**: No external service dependencies
6. **Cost Efficiency**: No Cloudinary subscription costs
7. **Fixed Backend Issues**: Proper data persistence and response handling

## Testing Scenarios

### Create Category:

1. ✅ Create category without image
2. ✅ Create category with valid image file
3. ✅ File validation (size, type)
4. ✅ Preview functionality
5. ✅ Success/error message handling

### Edit Category:

1. ✅ Edit category without changing image
2. ✅ Edit category and replace image
3. ✅ Edit category and remove image
4. ✅ Existing image display with fallback
5. ✅ New image preview vs existing image

### Error Handling:

1. ✅ Network errors
2. ✅ Server validation errors
3. ✅ File validation errors
4. ✅ Permission errors
5. ✅ Branch context errors

## Developer Notes

- All hooks now use `foodCategoryService.createFoodCategoryWithImage()` and `foodCategoryService.updateFoodCategoryWithImage()`
- Components automatically handle `imageFile` parameter
- No manual endpoint switching - always uses server upload
- Backward compatible with existing code
- Proper cleanup of preview URLs to prevent memory leaks
- Enhanced error handling with Vietnamese localization
- **Backend fixes ensure proper data persistence and response handling**

## Configuration

No additional configuration required. The system uses existing environment variables:

- `REACT_APP_API_URL` - API base URL
- Branch context from `environment.multiTenant.getCurrentBranchId()`
- Image validation rules from `imageUtils.js`

## Summary of Critical Fixes

The main issues were in the backend:

1. **Missing AutoMapper bidirectional mapping** - DTOs weren't converting to entities properly
2. **Missing repository save methods** - Data wasn't being persisted to database
3. **Inconsistent response formats** - Frontend expected different response structure
4. **Repository method mismatches** - Service was using wrong repository methods

These fixes ensure that:

- ✅ Images are properly uploaded to server `/wwwroot/uploads/` folder
- ✅ Image paths are correctly saved to database `Image` field
- ✅ Frontend receives consistent `ApiResponseBase` response format
- ✅ All CRUD operations work seamlessly with image uploads
- ✅ API responses maintain consistency across all food category endpoints
