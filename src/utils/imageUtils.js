/**
 * Image utility functions for handling server-uploaded images
 */

/**
 * Get the full URL for an uploaded image
 * @param {string} imagePath - The image path/filename from the server
 * @param {boolean} useApiEndpoint - Whether to use API endpoint for CORS compliance (default: auto-detect based on environment)
 * @returns {string} - The full URL to access the image
 */
export const getImageUrl = (imagePath, useApiEndpoint = null) => {
    if (!imagePath) {
        return null;
    }

    // If it's already a full URL (e.g., from Cloudinary), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // If it starts with /uploads/, remove it since we'll add it
    const cleanPath = imagePath.startsWith('/uploads/')
        ? imagePath.substring(9) // Remove '/uploads/' prefix
        : imagePath;

    // Construct the full URL
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5281';

    // Auto-detect whether to use API endpoint based on environment
    const shouldUseApiEndpoint = useApiEndpoint !== null
        ? useApiEndpoint
        : (process.env.NODE_ENV === 'production' || process.env.REACT_APP_USE_API_FOR_IMAGES === 'true');

    if (shouldUseApiEndpoint) {
        // Use API endpoint for CORS compliance
        return `${baseUrl}/uploads/${cleanPath}`;
    } else {
        // Use direct static file serving (with CORS headers configured)
        return `${baseUrl}/uploads/${cleanPath}`;
    }
};

/**
 * Get image URL with fallback to default image
 * @param {string} imagePath - The image path from server
 * @param {string} fallbackImage - Default image path (optional)
 * @param {boolean} useApiEndpoint - Whether to use API endpoint for CORS compliance (default: false)
 * @returns {string} - Image URL or fallback
 */
export const getImageUrlWithFallback = (imagePath, fallbackImage = '/images/com.jpg', useApiEndpoint = false) => {
    const imageUrl = getImageUrl(imagePath, useApiEndpoint);
    return imageUrl || fallbackImage;
};

/**
 * Check if an image URL is valid/accessible
 * Updated to handle CORS issues and caching problems
 * @param {string} imageUrl - The image URL to check
 * @param {Object} options - Options for accessibility check
 * @param {boolean} options.skipCorsCheck - Skip CORS check for cached data (default: false)
 * @param {number} options.timeout - Timeout in milliseconds (default: 3000)
 * @returns {Promise<boolean>} - Whether the image is accessible
 */
export const isImageAccessible = async (imageUrl, options = {}) => {
    if (!imageUrl) return false;

    const { skipCorsCheck = false, timeout = 3000 } = options;

    try {
        const isProd = process.env.NODE_ENV === 'production';
        const isApiDomain = imageUrl.includes('apihomms.cuahangkinhdoanh.com');

        // For production API domain or when skipping CORS check, use Image() approach
        if ((isProd && isApiDomain) || skipCorsCheck) {
            return new Promise((resolve) => {
                const img = new Image();
                let resolved = false;

                const cleanup = () => {
                    if (!resolved) {
                        resolved = true;
                        img.onload = null;
                        img.onerror = null;
                    }
                };

                img.onload = () => {
                    cleanup();
                    resolve(true);
                };

                img.onerror = () => {
                    cleanup();
                    resolve(false);
                };

                // Set a timeout to avoid hanging
                setTimeout(() => {
                    cleanup();
                    resolve(true); // Assume accessible if timeout (trust the URL for cached data)
                }, timeout);

                // Use cache-busting for better reliability with cached images
                const cacheBustingUrl = imageUrl.includes('?')
                    ? `${imageUrl}&_cb=${Date.now()}`
                    : `${imageUrl}?_cb=${Date.now()}`;

                img.src = cacheBustingUrl;
            });
        } else {
            // For development or same-origin requests, use fetch with HEAD
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            try {
                const response = await fetch(imageUrl, {
                    method: 'HEAD',
                    mode: 'cors',
                    credentials: 'omit',
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                return response.ok;
            } catch (fetchError) {
                clearTimeout(timeoutId);
                // If fetch fails, fall back to Image() approach
                return isImageAccessible(imageUrl, { skipCorsCheck: true, timeout: 2000 });
            }
        }
    } catch (error) {
        console.warn('Image accessibility check failed:', imageUrl, error);
        // For cached data, assume accessible rather than failing
        return skipCorsCheck;
    }
};

/**
 * Check if image URL is from cached data (to apply different validation strategy)
 * @param {string} imageUrl - The image URL to check
 * @returns {boolean} - Whether this appears to be from cached data
 */
export const isFromCachedData = (imageUrl) => {
    // Simple heuristic: if URL is from our API domain, it's likely cached
    return imageUrl && (
        imageUrl.includes(process.env.REACT_APP_API_URL) ||
        imageUrl.includes('apihomms.cuahangkinhdoanh.com')
    );
};

/**
 * Get optimized image URL (for future use with image processing)
 * @param {string} imagePath - The image path from server
 * @param {Object} options - Optimization options
 * @param {number} options.width - Desired width
 * @param {number} options.height - Desired height
 * @param {string} options.quality - Image quality (low, medium, high)
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (imagePath, options = {}) => {
    const baseUrl = getImageUrl(imagePath);
    if (!baseUrl) return null;

    // For now, just return the base URL
    // In the future, this could add query parameters for image processing
    // e.g., ?width=300&height=200&quality=medium
    return baseUrl;
};

/**
 * Extract filename from image path
 * @param {string} imagePath - The full image path
 * @returns {string} - Just the filename
 */
export const getImageFilename = (imagePath) => {
    if (!imagePath) return '';

    // Handle full URLs
    if (imagePath.includes('/')) {
        return imagePath.split('/').pop();
    }

    return imagePath;
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if file is an image
 * @param {File} file - The file to check
 * @returns {boolean} - Whether the file is an image
 */
export const isImageFile = (file) => {
    if (!file || !file.type) return false;
    return file.type.startsWith('image/');
};

/**
 * Get allowed image file extensions
 * @returns {Array<string>} - Array of allowed extensions
 */
export const getAllowedImageExtensions = () => {
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Maximum file size in bytes (default: 5MB)
 * @param {Array<string>} options.allowedTypes - Allowed MIME types
 * @returns {Object} - Validation result { isValid, error }
 */
export const validateImageFile = (file, options = {}) => {
    const {
        maxSize = 5 * 1024 * 1024, // 5MB default
        allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    } = options;

    if (!file) {
        return { isValid: false, error: 'No file provided' };
    }

    if (!isImageFile(file)) {
        return { isValid: false, error: 'File must be an image' };
    }

    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`
        };
    }

    if (file.size > maxSize) {
        return {
            isValid: false,
            error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`
        };
    }

    return { isValid: true, error: null };
};

/**
 * Create a preview URL for an image file
 * @param {File} file - The image file
 * @returns {string} - Preview URL
 */
export const createImagePreview = (file) => {
    if (!file || !isImageFile(file)) return null;
    return URL.createObjectURL(file);
};

/**
 * Clean up a preview URL to prevent memory leaks
 * @param {string} previewUrl - The preview URL to clean up
 */
export const cleanupImagePreview = (previewUrl) => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
    }
};

/**
 * Add cache busting parameter to image URL
 * @param {string} imageUrl - The original image URL
 * @param {boolean} force - Force cache busting even if URL already has parameters
 * @returns {string} - URL with cache busting parameter
 */
export const addCacheBusting = (imageUrl, force = false) => {
    if (!imageUrl) return imageUrl;

    // Don't add cache busting to external URLs or data URLs
    if (imageUrl.startsWith('data:') ||
        (!imageUrl.includes(process.env.REACT_APP_API_URL) && imageUrl.startsWith('http'))) {
        return imageUrl;
    }

    // Check if URL already has cache busting parameter
    if (!force && imageUrl.includes('_cb=')) {
        return imageUrl;
    }

    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}_cb=${Date.now()}`;
};

export default {
    getImageUrl,
    getImageUrlWithFallback,
    isImageAccessible,
    isFromCachedData,
    getOptimizedImageUrl,
    getImageFilename,
    formatFileSize,
    isImageFile,
    getAllowedImageExtensions,
    validateImageFile,
    createImagePreview,
    cleanupImagePreview,
    addCacheBusting
}; 