/**
 * Image serving configuration
 * Controls how images are served from the backend
 */

const imageConfig = {
    // Use API endpoint for serving images (better CORS compliance)
    // Auto-detects based on environment: true in production, configurable in development
    // Set to true if you encounter CORS issues with static files
    // Set to false for better performance with static file serving (when CORS is properly configured)
    useApiEndpoint: process.env.NODE_ENV === 'production' || process.env.REACT_APP_USE_API_FOR_IMAGES === 'true',

    // Skip image accessibility checks in production for API domain to avoid CORS preflight requests
    skipAccessibilityCheck: process.env.NODE_ENV === 'production',

    // Fallback images
    fallbackImages: {
        food: '/images/placeholder-food.png',
        user: '/images/default-avatar.png',
        category: '/images/com.jpg'
    },

    // Image validation settings
    validation: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },

    // CORS handling configuration
    cors: {
        // Domains that require special CORS handling
        apiDomains: ['apihomms.cuahangkinhdoanh.com'],
        // Use Image() instead of fetch() for these domains to avoid preflight
        useImageElementForCheck: true
    }
};

export default imageConfig; 