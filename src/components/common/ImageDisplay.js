import React, { useState, useEffect } from 'react';
import { Spin, Image as AntImage } from 'antd';
import { getImageUrl, getImageUrlWithFallback, isImageAccessible } from '../../utils/imageUtils';
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

            // Check if image is accessible
            try {
                const isAccessible = await isImageAccessible(fullImageUrl);
                if (isAccessible) {
                    setImageUrl(fullImageUrl);
                } else {
                    setImageUrl(fallback);
                    setHasError(true);
                }
            } catch (error) {
                console.warn('Error checking image accessibility:', error);
                setImageUrl(fallback);
                setHasError(true);
            }

            setIsLoading(false);
        };

        loadImage();
    }, [src, fallback, useApiEndpoint]);

    const handleImageLoad = (event) => {
        setIsLoading(false);
        if (onLoad) onLoad(event);
    };

    const handleImageError = (event) => {
        setHasError(true);
        setImageUrl(fallback);
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