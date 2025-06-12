import { useState, useEffect, createContext, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    useCurrentBranch,
    useDefaultBranch,
    useSwitchBranch,
    BRANCH_KEYS
} from './queries/useBranches';
import { message } from 'antd';

const BranchContext = createContext();

export const BranchProvider = ({ children }) => {
    const queryClient = useQueryClient();
    const [currentBranchId, setCurrentBranchId] = useState(
        localStorage.getItem('currentBranchId')
    );

    // React Query hooks
    const {
        data: currentBranch,
        isLoading: currentBranchLoading,
        error: currentBranchError
    } = useCurrentBranch({
        enabled: !!currentBranchId
    });

    const {
        data: defaultBranch,
        isLoading: defaultBranchLoading
    } = useDefaultBranch({
        enabled: !currentBranchId
    });

    const switchBranchMutation = useSwitchBranch();

    // Initialize with default branch if no current branch is selected
    useEffect(() => {
        if (!currentBranchId && defaultBranch && !defaultBranchLoading) {
            console.log('No current branch selected, using default branch:', defaultBranch);
            setCurrentBranchId(defaultBranch.id || defaultBranch.Id);
            localStorage.setItem('currentBranchId', defaultBranch.id || defaultBranch.Id);
        }
    }, [currentBranchId, defaultBranch, defaultBranchLoading]);

    // Switch branch function
    const switchBranch = async (branchId) => {
        try {
            console.log('Switching to branch:', branchId);

            // Use React Query mutation
            const branchData = await switchBranchMutation.mutateAsync(branchId);

            // Update local state
            setCurrentBranchId(branchId);

            console.log('✅ Successfully switched to branch:', branchData?.name || branchData?.Name);

            return branchData;
        } catch (error) {
            console.error('❌ Failed to switch branch:', error);
            message.error('Không thể chuyển chi nhánh. Vui lòng thử lại.');
            throw error;
        }
    };

    // Load current branch info
    const loadCurrentBranch = () => {
        if (currentBranchId) {
            queryClient.invalidateQueries({ queryKey: BRANCH_KEYS.current() });
        }
    };

    // Clear branch context (for logout)
    const clearBranchContext = () => {
        setCurrentBranchId(null);
        localStorage.removeItem('currentBranchId');
        localStorage.removeItem('selectedBranch');

        // Clear branch-related cache
        queryClient.removeQueries({ queryKey: BRANCH_KEYS.current() });
    };

    // Get effective branch (current or default)
    const effectiveBranch = currentBranch || defaultBranch;
    const effectiveBranchId = currentBranchId || (defaultBranch?.id || defaultBranch?.Id);

    // Loading state
    const loading = switchBranchMutation.isPending ||
        currentBranchLoading ||
        (defaultBranchLoading && !currentBranchId);

    // Error state
    const error = currentBranchError || switchBranchMutation.error;

    const contextValue = {
        // Branch data
        currentBranchId: effectiveBranchId,
        currentBranch: effectiveBranch,
        defaultBranch,

        // Loading states
        loading,
        currentBranchLoading,
        defaultBranchLoading,
        switchingBranch: switchBranchMutation.isPending,

        // Error states
        error,
        currentBranchError,
        switchBranchError: switchBranchMutation.error,

        // Actions
        switchBranch,
        loadCurrentBranch,
        clearBranchContext,

        // Utilities
        isBranchSelected: !!effectiveBranchId,
        isDefaultBranch: effectiveBranchId === (defaultBranch?.id || defaultBranch?.Id),
    };

    return (
        <BranchContext.Provider value={contextValue}>
            {children}
        </BranchContext.Provider>
    );
};

export const useBranchContext = () => {
    const context = useContext(BranchContext);
    if (!context) {
        throw new Error('useBranchContext must be used within BranchProvider');
    }
    return context;
};

// Export individual hooks for specific use cases
export const useCurrentBranchId = () => {
    const { currentBranchId } = useBranchContext();
    return currentBranchId;
};

export const useCurrentBranchData = () => {
    const { currentBranch, loading, error } = useBranchContext();
    return { currentBranch, loading, error };
};

export const useBranchSwitcher = () => {
    const { switchBranch, switchingBranch, switchBranchError } = useBranchContext();
    return { switchBranch, loading: switchingBranch, error: switchBranchError };
}; 