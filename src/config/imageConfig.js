/**
 * Image serving configuration
 * Controls how images are served from the backend
 */

const imageConfig = {
    // Use API endpoint for serving images (better CORS compliance)
    // Set to true if you encounter CORS issues with static files
    // Set to false for better performance with static file serving
    useApiEndpoint: true,

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
    }
};

export default imageConfig; 