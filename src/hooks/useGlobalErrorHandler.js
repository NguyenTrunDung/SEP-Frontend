import { useCallback } from 'react';
import { message } from 'antd';
import { isBranchPermissionError } from '../utils/branchPermissions';

/**
 * Global error handler hook
 * Provides consistent error handling patterns across components
 */
export const useGlobalErrorHandler = () => {

    /**
     * Handle errors that are not branch permission related
     * Branch permission errors are handled globally in React Query
     */
    const handleNonPermissionError = useCallback((error, defaultMessage = 'An error occurred') => {
        // Skip branch permission errors - they're handled globally
        if (isBranchPermissionError(error)) {
            return false; // Indicates error was not handled here
        }

        const status = error?.response?.status;
        let errorMessage = defaultMessage;

        // Customize messages based on error type
        switch (status) {
            case 404:
                errorMessage = 'Dịch vụ không tìm thấy.';
                break;
            case 500:
            case 502:
            case 503:
                errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
                break;
            case 400:
                errorMessage = error?.response?.data?.message || 'Dữ liệu không hợp lệ.';
                break;
            case 422:
                errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
                break;
            default:
                if (status >= 500) {
                    errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
                } else if (status >= 400) {
                    errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra.';
                }
        }

        message.error(errorMessage);
        return true; // Indicates error was handled
    }, []);

    /**
     * Handle success messages consistently
     */
    const handleSuccess = useCallback((successMessage) => {
        message.success(successMessage);
    }, []);

    /**
     * Handle warning messages consistently
     */
    const handleWarning = useCallback((warningMessage) => {
        message.warning(warningMessage);
    }, []);

    /**
     * Handle info messages consistently
     */
    const handleInfo = useCallback((infoMessage) => {
        message.info(infoMessage);
    }, []);

    return {
        handleNonPermissionError,
        handleSuccess,
        handleWarning,
        handleInfo,
        isBranchPermissionError,
    };
}; 