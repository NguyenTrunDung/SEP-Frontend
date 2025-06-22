/**
 * Branch Permissions Utility
 * Handles branch access validation and fallback logic
 */
import { message } from 'antd';
import environment from '../config/environment';

/**
 * Check if an error indicates a branch permission issue
 */
export const isBranchPermissionError = (error) => {
    const status = error?.response?.status;
    return status === 302 || status === 403 || status === 401;
};

/**
 * Get user-friendly error message for branch permission issues
 */
export const getBranchPermissionErrorMessage = (error, branchId) => {
    const status = error?.response?.status;

    switch (status) {
        case 302:
            return `Bạn không có quyền truy cập chi nhánh này (ID: ${branchId}). Hệ thống sẽ chuyển về chi nhánh mặc định.`;
        case 403:
            return `Truy cập bị từ chối cho chi nhánh này (ID: ${branchId}). Vui lòng liên hệ quản trị viên.`;
        case 401:
            return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        default:
            return `Không thể truy cập chi nhánh này (ID: ${branchId}).`;
    }
};

/**
 * Handle branch permission error with fallback logic
 */
export const handleBranchPermissionError = async (error, currentBranchId) => {
    if (!isBranchPermissionError(error)) {
        return false; // Not a permission error, let normal error handling proceed
    }

    const errorMessage = getBranchPermissionErrorMessage(error, currentBranchId);

    if (error?.response?.status === 401) {
        // Authentication expired - redirect to login
        message.error(errorMessage);
        environment.auth.removeToken();
        environment.auth.removeRefreshToken();
        environment.multiTenant.removeCurrentBranchId();

        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
        return true;
    }

    // For 302/403 errors, try to fall back to default branch
    try {
        message.warning(errorMessage);

        // Try to get default branch
        const defaultBranchId = environment.multiTenant.defaultBranchId;

        if (defaultBranchId && defaultBranchId !== currentBranchId) {
            console.log(`🔄 Falling back to default branch: ${defaultBranchId}`);
            environment.multiTenant.setCurrentBranchId(defaultBranchId);

            // Clear any cached data for the failed branch
            if (window.queryClient) {
                window.queryClient.clear();
            }

            // Reload the page to refresh all data with new branch context
            window.location.reload();
            return true;
        } else {
            // No default branch available, show error
            message.error('Không có chi nhánh nào khả dụng. Vui lòng liên hệ quản trị viên.');
            return true;
        }
    } catch (fallbackError) {
        console.error('❌ Failed to handle branch permission error:', fallbackError);
        message.error('Có lỗi xảy ra khi xử lý quyền truy cập chi nhánh.');
        return true;
    }
};

/**
 * Validate branch access before making API calls
 */
export const validateBranchAccess = async (branchId) => {
    // This could be enhanced to make a lightweight API call to check permissions
    // For now, we'll rely on the actual API calls to reveal permission issues
    return true;
};

/**
 * Get available branches for current user (placeholder for future enhancement)
 */
export const getAvailableBranches = async () => {
    // This would ideally call an API to get only branches the user has access to
    // For now, we'll rely on the existing branch service
    return [];
}; 