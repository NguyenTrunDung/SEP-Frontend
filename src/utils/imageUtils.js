/**
 * Image utility functions for handling server-uploaded images
 */

import { environment } from '../config/environment';

/**
 * Get the full URL for an uploaded image
 * @param {string} imagePath - The image path/filename from the server
 * @returns {string} - The full URL to access the image
 */
export const getImageUrl = (imagePath) => {
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
    return `${baseUrl}/uploads/${cleanPath}`;
};

/**
 * Get image URL with fallback to default image
 * @param {string} imagePath - The image path from server
 * @param {string} fallbackImage - Default image path (optional)
 * @returns {string} - Image URL or fallback
 */
export const getImageUrlWithFallback = (imagePath, fallbackImage = '/images/com.jpg') => {
    const imageUrl = getImageUrl(imagePath);
    return imageUrl || fallbackImage;
};

/**
 * Check if an image URL is valid/accessible
 * @param {string} imageUrl - The image URL to check
 * @returns {Promise<boolean>} - Whether the image is accessible
 */
export const isImageAccessible = async (imageUrl) => {
    if (!imageUrl) return false;

    try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.warn('Image not accessible:', imageUrl, error);
        return false;
    }
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
 * @returns {string} - Object URL for preview
 */
export const createImagePreview = (file) => {
    if (!isImageFile(file)) return null;
    return URL.createObjectURL(file);
};

/**
 * Cleanup image preview URL
 * @param {string} previewUrl - The preview URL to cleanup
 */
export const cleanupImagePreview = (previewUrl) => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
    }
};

export default {
    getImageUrl,
    getImageUrlWithFallback,
    isImageAccessible,
    getOptimizedImageUrl,
    getImageFilename,
    formatFileSize,
    isImageFile,
    getAllowedImageExtensions,
    validateImageFile,
    createImagePreview,
    cleanupImagePreview
}; 