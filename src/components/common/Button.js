import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    fullWidth = false,
    onClick,
    type = 'button',
    className = '',
}) => {
    const baseClass = 'button';
    const variantClass = `button--${variant}`;
    const sizeClass = `button--${size}`;
    const widthClass = fullWidth ? 'button--full-width' : '';
    const loadingClass = loading ? 'button--loading' : '';

    return (
        <button
            type={type}
            className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${loadingClass} ${className}`}
            disabled={disabled || loading}
            onClick={onClick}
        >
            {loading ? (
                <span className="button__loader">
                    <span className="button__loader-dot" />
                    <span className="button__loader-dot" />
                    <span className="button__loader-dot" />
                </span>
            ) : (
                children
            )}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'text']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    fullWidth: PropTypes.bool,
    onClick: PropTypes.func,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    className: PropTypes.string,
};

export default Button; 