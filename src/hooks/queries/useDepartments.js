import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { departmentService } from '../../services/departmentService';
import environment from '../../config/environment';

export const DEPARTMENT_QUERY_KEYS = {
    all: ['departments'],
    lists: () => [...DEPARTMENT_QUERY_KEYS.all, 'list'],
    list: (branchId) => [...DEPARTMENT_QUERY_KEYS.lists(), { branchId: String(branchId) }],
    details: () => [...DEPARTMENT_QUERY_KEYS.all, 'detail'],
    detail: (id, branchId) => [...DEPARTMENT_QUERY_KEYS.details(), id, { branchId: String(branchId) }],
};

const normalizeBranchId = (branchId) => {
    const id = String(branchId || environment.multiTenant.getCurrentBranchId() || '1');
    if (environment.features.enableLogging) {
        console.log(`🔄 Normalized branchId: ${id}`);
    }
    return id;
};

export const useDepartments = (branchId, options = {}) => {
    const currentBranchId = normalizeBranchId(branchId);

    const query = useQuery({
        queryKey: DEPARTMENT_QUERY_KEYS.list(currentBranchId),
        queryFn: async () => {
            if (environment.features.enableLogging) {
                console.log(`🔍 Fetching departments for branch: ${currentBranchId}`);
            }
            const response = await departmentService.getDepartments(currentBranchId);
            if (environment.features.enableLogging) {
                console.log(`✅ Received departments for branch ${currentBranchId}:`, response.data);
            }
            return response.data || [];
        },
        staleTime: environment.performance.images?.cacheTime || 120000,
        cacheTime: environment.performance.images?.cacheTime || 120000,
        refetchOnWindowFocus: false,
        enabled: !!currentBranchId,
        retry: (failureCount, error) => {
            const status = error?.response?.status;
            if ([404, 403, 401, 302].includes(status)) {
                console.warn(`🚫 Departments request failed with status ${status}, stopping retries`);
                return false;
            }
            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        ...options
    });

    return {
        departments: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        isRefetching: query.isRefetching,
        isError: query.isError,
        isSuccess: query.isSuccess,
        isFetching: query.isFetching,
    };
};

export const useDepartment = (deptId, branchId, options = {}) => {
    const currentBranchId = normalizeBranchId(branchId);

    const query = useQuery({
        queryKey: DEPARTMENT_QUERY_KEYS.detail(deptId, currentBranchId),
        queryFn: async () => {
            if (environment.features.enableLogging) {
                console.log(`🔍 Fetching department ${deptId} for branch: ${currentBranchId}`);
            }
            const response = await departmentService.getDepartmentById(deptId, currentBranchId);
            if (environment.features.enableLogging) {
                console.log(`✅ Received department ${deptId} for branch ${currentBranchId}:`, response.data);
            }
            return response.data || null;
        },
        enabled: !!(deptId && currentBranchId),
        staleTime: environment.performance.queryStaleTime || 300000,
        cacheTime: environment.performance.queryCacheTime || 300000,
        ...options
    });

    return {
        department: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        isError: query.isError,
        isSuccess: query.isSuccess,
    };
};

export const useCreateDepartment = (options = {}) => {
    const queryClient = useQueryClient();
    const currentBranchId = normalizeBranchId();

    return useMutation({
        mutationFn: ({ deptData, branchId }) => {
            const targetBranchId = normalizeBranchId(branchId);
            if (environment.features.enableLogging) {
                console.log(`🔍 Creating department for branch: ${targetBranchId}`, deptData);
            }
            return departmentService.createDepartment({ ...deptData, branchId: targetBranchId });
        },
        onSuccess: (response, variables) => {
            message.success(response.message || 'Tạo phòng ban thành công!');
            const targetBranchId = normalizeBranchId(variables.branchId);
            const newDept = response.data;
            if (newDept) {
                queryClient.setQueryData(DEPARTMENT_QUERY_KEYS.detail(newDept.id, targetBranchId), newDept);
                queryClient.setQueryData(DEPARTMENT_QUERY_KEYS.list(targetBranchId), (oldData) => {
                    return oldData ? [...oldData, newDept] : [newDept];
                });
            }
            queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEYS.list(targetBranchId), exact: true });
            queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEYS.lists(), exact: true });
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || 'Không thể tạo phòng ban!';
            message.error(errorMessage);
            console.error('❌ Failed to create department:', error);
        },
        ...options
    });
};

export const useUpdateDepartment = (options = {}) => {
    const queryClient = useQueryClient();
    const currentBranchId = normalizeBranchId();

    return useMutation({
        mutationFn: ({ deptId, deptData, branchId }) => {
            const targetBranchId = normalizeBranchId(branchId);
            if (environment.features.enableLogging) {
                console.log(`🔍 Updating department ${deptId} for branch: ${targetBranchId}`, deptData);
            }
            const { id, ...updateData } = deptData;
            return departmentService.updateDepartment(deptId, { ...updateData, branchId: targetBranchId });
        },
        onSuccess: (response, variables) => {
            message.success(response.message || 'Cập nhật phòng ban thành công!');
            const targetBranchId = normalizeBranchId(variables.branchId);
            const updatedDept = response.data;
            if (updatedDept) {
                queryClient.setQueryData(DEPARTMENT_QUERY_KEYS.detail(variables.deptId, targetBranchId), updatedDept);
                queryClient.setQueryData(DEPARTMENT_QUERY_KEYS.list(targetBranchId), (oldData) => {
                    return oldData
                        ? oldData.map((dept) => (dept.id === variables.deptId ? updatedDept : dept))
                        : [updatedDept];
                });
            }
            queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEYS.list(targetBranchId), exact: true });
            queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEYS.lists(), exact: true });
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || 'Không thể cập nhật phòng ban!';
            message.error(errorMessage);
            console.error('❌ Failed to update department:', error);
        },
        ...options
    });
};

export const useDeleteDepartment = (options = {}) => {
    const queryClient = useQueryClient();
    const currentBranchId = normalizeBranchId();

    return useMutation({
        mutationFn: ({ deptId, branchId }) => {
            const targetBranchId = normalizeBranchId(branchId);
            if (environment.features.enableLogging) {
                console.log(`🔍 Deleting department ${deptId} for branch: ${targetBranchId}`);
            }
            return departmentService.deleteDepartment(deptId, targetBranchId);
        },
        onSuccess: (response, variables) => {
            message.success(response.message || 'Xóa phòng ban thành công!');
            const targetBranchId = normalizeBranchId(variables.branchId);
            queryClient.removeQueries({ queryKey: DEPARTMENT_QUERY_KEYS.detail(variables.deptId, targetBranchId), exact: true });
            queryClient.setQueryData(DEPARTMENT_QUERY_KEYS.list(targetBranchId), (oldData) => {
                return oldData ? oldData.filter((dept) => dept.id !== variables.deptId) : [];
            });
            queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEYS.list(targetBranchId), exact: true });
            queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEYS.lists(), exact: true });
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || 'Không thể xóa phòng ban!';
            message.error(errorMessage);
            console.error('❌ Failed to delete department:', error);
        },
        ...options
    });
};