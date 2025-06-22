# UploadHandler Enhanced Implementation

## Overview

The `UploadHandler.cs` has been significantly enhanced with robust features while maintaining backward compatibility with existing code. The enhancements focus on preventing duplicate file uploads, optimizing file operations, and providing better file management capabilities.

## Key Enhancements

### 1. **Duplicate File Detection (SHA256 Hash-Based)**

- **Problem**: Original implementation always created new files with random GUIDs, causing duplicate uploads
- **Solution**: Implemented SHA256 hash calculation to detect identical files
- **Benefits**:
  - Prevents storage waste from duplicate images
  - Returns existing file path if duplicate detected
  - Maintains data integrity

```csharp
// Calculate file hash for duplicate detection
string fileHash = await CalculateFileHashAsync(file);
string existingFile = await FindExistingFileByHashAsync(folderPath, fileHash, extension);

if (!string.IsNullOrEmpty(existingFile))
{
    // Return existing file path instead of creating duplicate
    return $"/{folderName}/{Path.GetFileName(existingFile)}";
}
```

### 2. **Smart File Naming System**

- **Original**: `{Guid}.{extension}`
- **Enhanced**: `{hash_prefix}_{short_guid}.{extension}`
- **Benefits**:
  - Files with same hash prefix are grouped together
  - Easy identification of potentially related files
  - Better file organization in uploads folder

```csharp
// Generate filename with hash prefix for better organization
string fileName = $"{fileHash.Substring(0, 8)}_{Guid.NewGuid().ToString("N")[..8]}{extension}";
```

### 3. **Old File Cleanup on Replace**

- **New Parameter**: `existingImagePath` for tracking old files
- **Functionality**: Automatically deletes old image when replacing with new one
- **Benefits**:
  - Prevents orphaned files accumulating
  - Maintains clean storage
  - Handles both absolute and relative paths

```csharp
// Clean up old image if replacing
if (!string.IsNullOrEmpty(existingImagePath))
{
    await DeleteOldImageAsync(webRootPath, existingImagePath, newRelativePath);
}
```

### 4. **Enhanced File Format Support**

- **Added**: `.webp` format support
- **Original**: `.jpg`, `.jpeg`, `.png`, `.gif`
- **Enhanced**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`

### 5. **Optimized File I/O Operations**

- **Buffer Size**: 4KB buffer for better performance
- **Async Operations**: Proper async/await pattern with `useAsync: true`
- **Error Handling**: Comprehensive exception handling with meaningful messages

```csharp
using (var stream = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None, BufferSize, useAsync: true))
{
    await file.CopyToAsync(stream);
    await stream.FlushAsync();
}
```

### 6. **Additional Utility Methods**

#### File Validation

```csharp
public static bool IsValidImageFormat(IFormFile file)
```

- Validates file format before processing
- Prevents invalid files from being processed

#### File Size Formatting

```csharp
public static string GetFormattedFileSize(long bytes)
```

- Converts bytes to human-readable format (B, KB, MB, GB)
- Useful for UI display and logging

#### Orphaned File Cleanup

```csharp
public static async Task<int> CleanupOrphanedFilesAsync(string webRootPath, string folderName, IEnumerable<string> referencedImagePaths)
```

- Removes files no longer referenced in database
- Helps maintain storage efficiency
- Returns count of cleaned files

## Implementation Details

### Hash Calculation Process

1. **File Upload** → Calculate SHA256 hash
2. **Hash Lookup** → Search for existing files with same hash
3. **Duplicate Check** → Compare full hash if prefix matches
4. **Decision** → Return existing path or create new file

### File Organization Structure

```
/wwwroot/uploads/
├── a1b2c3d4_f9e8d7c6.jpg  ← Hash prefix: a1b2c3d4
├── a1b2c3d4_a9b8c7d6.jpg  ← Same content, different upload
├── f7e6d5c4_b1a2c3d4.png  ← Different content
└── ...
```

### Backward Compatibility

- **Original Method Signature**: `SaveImageAsync(file, webRootPath, folderName)`
- **Enhanced Method Signature**: `SaveImageAsync(file, webRootPath, folderName, existingImagePath)`
- **Compatibility**: Original signature calls enhanced version with `null` for `existingImagePath`

## Usage Examples

### Basic Usage (Backward Compatible)

```csharp
// Existing code continues to work
string imagePath = await UploadHandler.SaveImageAsync(file, webRootPath, "uploads");
```

### Enhanced Usage with Old File Cleanup

```csharp
// New usage with old file replacement
string imagePath = await UploadHandler.SaveImageAsync(file, webRootPath, "uploads", existingCategory.Image);
```

### File Validation

```csharp
if (UploadHandler.IsValidImageFormat(file))
{
    string imagePath = await UploadHandler.SaveImageAsync(file, webRootPath);
}
```

### Cleanup Orphaned Files

```csharp
// Get all referenced image paths from database
var referencedPaths = await dbContext.FoodCategories.Select(f => f.Image).ToListAsync();

// Clean up orphaned files
int cleanedCount = await UploadHandler.CleanupOrphanedFilesAsync(webRootPath, "uploads", referencedPaths);
```

## Performance Benefits

1. **Reduced Storage Usage**: Duplicate detection prevents redundant files
2. **Faster File Operations**: Optimized buffer size and async operations
3. **Improved Organization**: Hash-based naming for better file management
4. **Automatic Cleanup**: Prevents storage bloat from old files

## Error Handling Improvements

1. **Input Validation**: Comprehensive parameter validation
2. **File System Errors**: Graceful handling of I/O exceptions
3. **Hash Calculation Errors**: Fallback to normal operation if hashing fails
4. **Cleanup Errors**: Non-blocking error handling for file deletion

## Integration with Services

### Food Category Service Integration

```csharp
// In FoodCategoryService.cs
public async Task<FoodCategoryDto> UpdateCategoryAsync(int id, FoodCategoryDto dto, IFormFile? image, string webRootPath)
{
    var existingCategory = await _repository.FindByIdAsync(id);

    if (image != null)
    {
        // Pass existing image path for cleanup
        var newImagePath = await UploadHandler.SaveImageAsync(image, webRootPath, "uploads", existingCategory.Image);
        existingCategory.Image = newImagePath;
    }

    // ... rest of update logic
}
```

### Food Service Integration

Similar pattern can be applied to `FoodService.cs` for consistent behavior across all image uploads.

## Maintenance Recommendations

1. **Periodic Cleanup**: Run `CleanupOrphanedFilesAsync` periodically (e.g., daily/weekly)
2. **Storage Monitoring**: Monitor `/wwwroot/uploads/` folder size
3. **Hash Collision Handling**: Current implementation handles hash collisions gracefully
4. **Logging**: Consider adding logging for file operations (optional enhancement)

## Future Enhancements (Optional)

1. **Image Compression**: Automatic image optimization during upload
2. **Multiple Formats**: Convert images to optimized formats (e.g., WebP)
3. **Cloud Storage**: Extend to support cloud storage providers
4. **Metadata Extraction**: Extract and store image metadata
5. **Thumbnail Generation**: Automatic thumbnail creation

## Security Considerations

1. **File Type Validation**: Strict extension checking
2. **File Size Limits**: Configurable size restrictions
3. **Path Traversal Protection**: Safe path handling
4. **Hash-based Organization**: Prevents predictable file naming attacks

The enhanced `UploadHandler` provides a robust, efficient, and maintainable solution for file uploads while maintaining full backward compatibility with existing code.
