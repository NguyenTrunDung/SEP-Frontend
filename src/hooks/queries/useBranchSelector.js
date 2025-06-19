// useBranchSelector.js - Direct exports for different contexts
// Simple re-exports to avoid conditional hook calls

// Import both public and admin hooks
import {
    usePublicBranches,
    usePublicCurrentBranch,
    usePublicSwitchBranch,
    usePublicDefaultBranch
} from './usePublicBranches';

import {
    useBranches as useAdminBranches,
    useCurrentBranch as useAdminCurrentBranch,
    useSwitchBranch as useAdminSwitchBranch,
    useDefaultBranch as useAdminDefaultBranch
} from './userBranchesQueries';

/**
 * Direct exports for specific contexts
 * Avoids conditional hook calls which violate Rules of Hooks
 */

// For components that always need public service (like guest Navbar)
export const usePublicBranchesOnly = usePublicBranches;
export const usePublicCurrentBranchOnly = usePublicCurrentBranch;
export const usePublicSwitchBranchOnly = usePublicSwitchBranch;
export const usePublicDefaultBranchOnly = usePublicDefaultBranch;

// For components that always need admin service (like AdminLayout)
export const useAdminBranchesOnly = useAdminBranches;
export const useAdminCurrentBranchOnly = useAdminCurrentBranch;
export const useAdminSwitchBranchOnly = useAdminSwitchBranch;
export const useAdminDefaultBranchOnly = useAdminDefaultBranch; 