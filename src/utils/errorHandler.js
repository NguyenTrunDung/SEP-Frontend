import { message } from 'antd';
import { formatDateForDisplay } from './timezoneUtils';

/**
 * Enhanced API Error Handler Utility
 * Provides user-friendly error messages for different HTTP status codes and error scenarios
 */

/**
 * Handle menu-specific API errors with user-friendly messages
 * @param {Error} error - The error object from API call
 * @param {Object} options - Options for error handling
 * @param {string} options.action - The action being performed ('tạo', 'cập nhật', 'xóa', etc.)
 * @param {string} options.date - The date related to the error (for 409 conflicts)
 * @param {string} options.entityType - Type of entity ('menu', 'food', 'category', etc.)
 * @returns {string} User-friendly error message
 */
export const handleMenuApiError = (error, options = {}) => {
    const {
        action = 'thực hiện thao tác',
        date = null,
        entityType = 'menu'
    } = options;

    console.error(`${entityType} ${action} error:`, error);

    // Handle specific HTTP status codes
    if (error.response?.status === 409) {
        // Conflict error - typically duplicate dates for menus
        if (entityType === 'menu' && date) {
            const formattedDate = formatMenuDateError(date);
            return formattedDate;
        }
        return `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} đã tồn tại! Vui lòng thử với thông tin khác.`;
    }

    if (error.response?.status === 400) {
        // Bad request - validation errors
        const backendMessage = error.response?.data?.message || error.response?.data?.title;
        if (backendMessage) {
            return `Dữ liệu không hợp lệ: ${backendMessage}`;
        }
        return `${action.charAt(0).toUpperCase() + action.slice(1)} ${entityType} thất bại: Dữ liệu không hợp lệ.`;
    }

    if (error.response?.status === 401) {
        return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }

    if (error.response?.status === 403) {
        return 'Bạn không có quyền thực hiện thao tác này.';
    }

    if (error.response?.status === 404) {
        return `Không tìm thấy ${entityType}. Có thể đã bị xóa hoặc không tồn tại.`;
    }

    if (error.response?.status === 422) {
        // Unprocessable entity - validation errors
        const backendMessage = error.response?.data?.message || error.response?.data?.title;
        if (backendMessage) {
            return `Dữ liệu không hợp lệ: ${backendMessage}`;
        }
        return `${action.charAt(0).toUpperCase() + action.slice(1)} ${entityType} thất bại: Dữ liệu không đáp ứng yêu cầu.`;
    }

    if (error.response?.status === 500) {
        return 'Lỗi hệ thống. Vui lòng thử lại sau hoặc liên hệ quản trị viên.';
    }

    if (error.response?.status >= 400) {
        // Other HTTP errors
        const backendMessage = error.response?.data?.message || error.response?.data?.title;
        if (backendMessage) {
            return `${action.charAt(0).toUpperCase() + action.slice(1)} ${entityType} thất bại: ${backendMessage}`;
        }
        return `${action.charAt(0).toUpperCase() + action.slice(1)} ${entityType} thất bại. Vui lòng thử lại.`;
    }

    if (!error.response) {
        // Network or other errors
        return 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.';
    }

    // Fallback for other errors
    const backendMessage = error.response?.data?.message || error.message;
    if (backendMessage && !backendMessage.toLowerCase().includes('status code')) {
        return `${action.charAt(0).toUpperCase() + action.slice(1)} ${entityType} thất bại: ${backendMessage}`;
    }

    return `${action.charAt(0).toUpperCase() + action.slice(1)} ${entityType} thất bại. Vui lòng thử lại.`;
};

/**
 * Generic API Error Handler for non-menu specific errors
 * @param {Error} error - The error object from API call
 * @param {Object} options - Options for error handling
 * @param {string} options.action - The action being performed
 * @param {string} options.entityType - Type of entity
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error, options = {}) => {
    const { action = 'thực hiện thao tác', entityType = 'dữ liệu' } = options;

    console.error(`API ${action} error:`, error);

    if (error.response?.status === 409) {
        return `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} đã tồn tại! Vui lòng thử với thông tin khác.`;
    }

    if (error.response?.status === 400) {
        const backendMessage = error.response?.data?.message || error.response?.data?.title;
        return backendMessage ? `Dữ liệu không hợp lệ: ${backendMessage}` : 'Dữ liệu không hợp lệ.';
    }

    if (error.response?.status === 401) {
        return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }

    if (error.response?.status === 403) {
        return 'Bạn không có quyền thực hiện thao tác này.';
    }

    if (error.response?.status === 404) {
        return `Không tìm thấy ${entityType}.`;
    }

    if (error.response?.status === 500) {
        return 'Lỗi hệ thống. Vui lòng thử lại sau.';
    }

    if (!error.response) {
        return 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng.';
    }

    const backendMessage = error.response?.data?.message || error.message;
    if (backendMessage && !backendMessage.toLowerCase().includes('status code')) {
        return `${action.charAt(0).toUpperCase() + action.slice(1)} thất bại: ${backendMessage}`;
    }

    return `${action.charAt(0).toUpperCase() + action.slice(1)} thất bại. Vui lòng thử lại.`;
};

/**
 * Extract meaningful error message from backend response
 * @param {Error} error - The error object
 * @returns {string} Extracted error message
 */
export const extractErrorMessage = (error) => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    if (error.response?.data?.title) {
        return error.response.data.title;
    }

    if (error.response?.data?.error) {
        return error.response.data.error;
    }

    if (error.message) {
        return error.message;
    }

    return 'Đã xảy ra lỗi không xác định.';
};

/**
 * Check if error is a network error
 * @param {Error} error - The error object
 * @returns {boolean} True if network error
 */
export const isNetworkError = (error) => {
    return !error.response || error.code === 'NETWORK_ERROR';
};

/**
 * Check if error is a server error (5xx)
 * @param {Error} error - The error object
 * @returns {boolean} True if server error
 */
export const isServerError = (error) => {
    return error.response?.status >= 500;
};

/**
 * Check if error is a client error (4xx)
 * @param {Error} error - The error object
 * @returns {boolean} True if client error
 */
export const isClientError = (error) => {
    return error.response?.status >= 400 && error.response?.status < 500;
};

/**
 * Error handler specifically for form submissions
 * @param {Error} error - The error object
 * @param {Object} formData - The form data that was being submitted
 * @param {string} action - The action being performed
 * @returns {string} User-friendly error message
 */
export const handleFormSubmissionError = (error, formData = {}, action = 'lưu dữ liệu') => {
    if (error.response?.status === 409) {
        // For menu forms, extract date information if available
        if (formData.date) {
            const formattedDate = formatDataDateError(formData);
            return formattedDate;
        }
        return 'Dữ liệu đã tồn tại! Vui lòng kiểm tra lại thông tin.';
    }

    return handleApiError(error, { action, entityType: 'form' });
};

export const formatMenuDateError = (date) => {
    const formattedDate = formatDateForDisplay(date, 'DD/MM/YYYY');
    return `Đã có menu cho ${formattedDate}! Vui lòng chọn ngày khác hoặc chỉnh sửa menu hiện có.`;
};

export const formatDataDateError = (formData) => {
    const formattedDate = formatDateForDisplay(formData.date, 'DD/MM/YYYY');
    return `Đã có dữ liệu cho ${formattedDate}! Vui lòng chọn ngày khác.`;
};

export default {
    handleMenuApiError,
    handleApiError,
    extractErrorMessage,
    isNetworkError,
    isServerError,
    isClientError,
    handleFormSubmissionError
}; 