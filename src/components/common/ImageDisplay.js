import React, { useState, useEffect } from 'react';
import { Spin, Image as AntImage } from 'antd';
import { getImageUrl, getImageUrlWithFallback, isImageAccessible, isFromCachedData } from '../../utils/imageUtils';
import imageConfig from '../../config/imageConfig';
import './ImageDisplay.css';

/**
 * Reusable image component with loading states and fallbacks
 */
const ImageDisplay = ({
    src,
    alt = 'Image',
    fallback = '/images/placeholder-food.png',
    width = 'auto',
    height = 'auto',
    className = '',
    preview = true,
    loading = 'lazy',
    onError,
    onLoad,
    style = {},
    placeholder = true,
    useApiEndpoint = true, // Force API endpoint for CORS compliance
    skipAccessibilityCheck = false, // Skip check for cached data
    ...props
}) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const loadImage = async () => {
            setIsLoading(true);
            setHasError(false);

            if (!src) {
                setImageUrl(fallback);
                setIsLoading(false);
                return;
            }

            // Get the full image URL with optional API endpoint usage
            const fullImageUrl = getImageUrl(src, useApiEndpoint);

            if (!fullImageUrl) {
                setImageUrl(fallback);
                setIsLoading(false);
                return;
            }

            // Check if this is cached data to apply different validation strategy
            const isCachedData = isFromCachedData(fullImageUrl);

            // In production, skip accessibility check for API domain to avoid CORS issues
            const isProd = process.env.NODE_ENV === 'production';
            const isApiDomain = fullImageUrl.includes('apihomms.cuahangkinhdoanh.com');

            if (skipAccessibilityCheck || (isProd && isApiDomain) || isCachedData) {
                // For cached data or production API domain, trust the URL and let the browser handle it
                // This prevents CORS issues during page refreshes when data comes from React Query cache
                setImageUrl(fullImageUrl);
                setIsLoading(false);
                return;
            }

            // For development or non-API domains, check accessibility with timeout
            try {
                const isAccessible = await isImageAccessible(fullImageUrl, {
                    skipCorsCheck: isCachedData,
                    timeout: 2000 // Shorter timeout for better UX
                });

                if (isAccessible) {
                    setImageUrl(fullImageUrl);
                } else {
                    setImageUrl(fallback);
                    setHasError(true);
                }
            } catch (error) {
                console.warn('Error checking image accessibility:', error);
                // In case of error, still try to load the image (trust cached URLs)
                setImageUrl(fullImageUrl);
            }

            setIsLoading(false);
        };

        loadImage();
    }, [src, fallback, useApiEndpoint, skipAccessibilityCheck]);

    const handleImageLoad = (event) => {
        setIsLoading(false);
        setHasError(false); // Clear any previous errors if image loads successfully
        if (onLoad) onLoad(event);
    };

    const handleImageError = (event) => {
        setHasError(true);
        setImageUrl(fallback);
        setIsLoading(false);
        if (onError) onError(event);
    };

    const imageStyle = {
        width,
        height,
        objectFit: 'cover',
        ...style
    };

    if (isLoading && placeholder) {
        return (
            <div
                className={`image-display-placeholder ${className}`}
                style={{ width, height, ...style }}
            >
                <Spin size="small" />
            </div>
        );
    }

    return (
        <div className={`image-display-container ${className}`}>
            <AntImage
                src={imageUrl}
                alt={alt}
                style={imageStyle}
                preview={preview}
                loading={loading}
                onLoad={handleImageLoad}
                onError={handleImageError}
                placeholder={placeholder && (
                    <div className="image-display-placeholder">
                        <Spin size="small" />
                    </div>
                )}
                {...props}
            />
            {hasError && (
                <div className="image-display-error-indicator">
                    <span>⚠️</span>
                </div>
            )}
        </div>
    );
};

/**
 * Food image component with specific styling
 */
export const FoodImage = ({
    src,
    alt = 'Food Image',
    size = 'medium',
    ...props
}) => {
    const sizeMap = {
        small: { width: 60, height: 60 },
        medium: { width: 120, height: 120 },
        large: { width: 200, height: 200 },
        card: { width: '100%', height: 180 }
    };

    const dimensions = typeof size === 'string' ? sizeMap[size] : size;

    return (
        <ImageDisplay
            src={src}
            alt={alt}
            className={`food-image food-image-${typeof size === 'string' ? size : 'custom'}`}
            fallback="/images/placeholder-food.png"
            skipAccessibilityCheck={true} // Skip check for food images to avoid CORS issues
            {...dimensions}
            {...props}
        />
    );
};

/**
 * Avatar image component for users
 */
export const AvatarImage = ({
    src,
    alt = 'Avatar',
    size = 40,
    ...props
}) => {
    return (
        <ImageDisplay
            src={src}
            alt={alt}
            className="avatar-image"
            fallback="/images/default-avatar.png"
            width={size}
            height={size}
            style={{ borderRadius: '50%' }}
            {...props}
        />
    );
};

export default ImageDisplay; 