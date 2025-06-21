# Image Loading System

## Overview

This system provides a complete solution for loading and displaying images from the server's uploads folder, with fallback support and various utility functions.

## Backend Configuration

### Static Files Setup

The backend is configured to serve static files from the `wwwroot/uploads` folder:

```csharp
// In Program.cs - Configure static files
app.UseStaticFiles();

// Configure static files for uploads folder specifically
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.WebRootPath, "uploads")),
    RequestPath = "/uploads"
});
```

This makes uploaded images accessible at: `http://localhost:5281/uploads/{filename}`

## Frontend Components

### 1. Image Utility Functions (`src/utils/imageUtils.js`)

#### `getImageUrl(imagePath)`

Converts various image path formats to full URLs:

- Filename only: `"image.jpg"` → `"http://localhost:5281/uploads/image.jpg"`
- With prefix: `"/uploads/image.jpg"` → `"http://localhost:5281/uploads/image.jpg"`
- Full URL: `"https://example.com/image.jpg"` → unchanged
- Empty/null: returns `null`

#### `getImageUrlWithFallback(imagePath, fallbackImage)`

Same as `getImageUrl` but returns fallback image if URL is invalid.

#### `validateImageFile(file, options)`

Validates uploaded image files with configurable options:

```javascript
const validation = validateImageFile(file, {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ["image/jpeg", "image/png", "image/gif"],
});
```

#### `createImagePreview(file)` and `cleanupImagePreview(previewUrl)`

Create and cleanup preview URLs for file uploads.

### 2. Image Display Components (`src/components/common/ImageDisplay.js`)

#### `ImageDisplay` - Base Component

```jsx
<ImageDisplay
  src="image.jpg"
  alt="Description"
  width={200}
  height={200}
  fallback="/images/default.jpg"
  preview={true}
  loading="lazy"
/>
```

#### `FoodImage` - Specialized for Food Images

```jsx
<FoodImage
  src={food.imageUrl}
  alt={food.name}
  size="medium" // small, medium, large, card
  preview={true}
/>
```

Size options:

- `small`: 60x60
- `medium`: 120x120
- `large`: 200x200
- `card`: 100% width, 180px height

#### `AvatarImage` - For User Avatars

```jsx
<AvatarImage src={user.avatar} alt={user.name} size={50} />
```

### 3. Features

- **Automatic URL conversion**: Handles various URL formats
- **Loading states**: Shows spinner while loading
- **Error handling**: Graceful fallback to placeholder images
- **Image accessibility checking**: Validates if images are accessible
- **Preview functionality**: Built-in image preview modal
- **Responsive design**: Adapts to different screen sizes
- **Performance optimized**: Lazy loading support

## Usage Examples

### In Food Table Component

```jsx
import { FoodImage } from "../../../components/common/ImageDisplay";

const columns = [
  {
    title: "IMAGE",
    dataIndex: "imageUrl",
    render: (url, record) => (
      <FoodImage src={url} alt={record.name} size="small" preview={true} />
    ),
  },
  // ... other columns
];
```

### In Food Form Component

```jsx
import { validateImageFile, createImagePreview } from "../../utils/imageUtils";

const handleFileChange = (event) => {
  const file = event.target.files[0];

  const validation = validateImageFile(file);
  if (!validation.isValid) {
    message.error(validation.error);
    return;
  }

  const previewUrl = createImagePreview(file);
  setPreview(previewUrl);
};
```

### In Food Cards/Lists

```jsx
<Card cover={<FoodImage src={food.imageUrl} alt={food.name} size="card" />}>
  <Meta title={food.name} description={food.description} />
</Card>
```

## Server Upload Structure

Images are stored in: `ProjectSEP490/HOMMS.API/wwwRoot/uploads/`

Example files:

- `25e414b9-35b1-4ae5-a314-f6a6468b7324.jpg`
- `469e2b61-ebba-450c-8586-7aaea397f774.png`
- `98765544-63ac-474a-bafa-946dcffb6486.jpg`

## API Integration

The food service handles image uploads through multipart form data:

```javascript
// In foodService.js
const createFoodWithImage = async (foodData, imageFile, branchId) => {
  const formData = new FormData();
  formData.append("Name", foodData.name);
  formData.append("Description", foodData.description);
  formData.append("Image", imageFile);
  formData.append("BranchId", branchId);

  const response = await api.post("/api/v1/foods/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "X-Branch-Id": branchId,
    },
  });

  return response.data;
};
```

## Testing

Visit `/test/images` route (requires admin access) to test the image loading system with:

- Server upload images
- Different image sizes
- URL generation
- File upload preview
- Error handling

## Best Practices

1. **Always use the image components** instead of raw `<img>` tags
2. **Validate files before upload** using `validateImageFile`
3. **Clean up preview URLs** to prevent memory leaks
4. **Provide meaningful alt text** for accessibility
5. **Use appropriate image sizes** for different contexts
6. **Handle loading and error states** gracefully

## Environment Configuration

Make sure your `.env` file has the correct API URL:

```
REACT_APP_API_URL=http://localhost:5281
```

## Troubleshooting

### Images not loading

1. Check if backend static files are configured
2. Verify API URL in environment configuration
3. Check browser console for 404 errors
4. Ensure images exist in uploads folder

### Slow loading

1. Use lazy loading (`loading="lazy"`)
2. Optimize image sizes before upload
3. Consider implementing image resizing on server

### Memory issues

1. Clean up preview URLs after use
2. Use appropriate image sizes
3. Implement image caching if needed
