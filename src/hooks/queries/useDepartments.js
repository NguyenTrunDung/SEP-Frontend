import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { departmentService } from '../../services/departmentService';
import { locationService } from '../../services/locationService';
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
        console.log(`✅ Received departments for branch ${currentBranchId}:`, response);
      }
      const departments = Array.isArray(response) ? response : response.data || [];
      return departments;
    },
    staleTime: environment.performance.queryStaleTime || 120000,
    cacheTime: environment.performance.queryCacheTime || 120000,
    refetchOnWindowFocus: false,
    enabled: !!currentBranchId,
    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if ([400, 404, 403, 401].includes(status)) {
        console.warn(`🚫 Departments request failed with status ${status}, stopping retries`);
        message.error(error.response?.data?.message || 'Không thể tải danh sách phòng ban!');
        return false;
      }
      return failureCount < 1;
    },
    retryDelay: 1000,
    ...options,
  });

  return {
    departments: Array.isArray(query.data) ? query.data : [],
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
      if (!deptId) {
        throw new Error('Department ID is required');
      }
      if (environment.features.enableLogging) {
        console.log(`🔍 Fetching department ${deptId} for branch: ${currentBranchId}`);
      }
      const response = await departmentService.getDepartmentById(deptId);
      if (environment.features.enableLogging) {
        console.log(`✅ Received department ${deptId} for branch ${currentBranchId}:`, response);
      }
      return response || null;
    },
    enabled: !!(deptId && currentBranchId),
    staleTime: environment.performance.queryStaleTime || 300000,
    cacheTime: environment.performance.queryCacheTime || 300000,
    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if ([400, 404, 403, 401].includes(status)) {
        console.warn(`🚫 Department request failed with status ${status}, stopping retries`);
        message.error(error.response?.data?.message || 'Không thể tải thông tin phòng ban!');
        return false;
      }
      return failureCount < 1;
    },
    retryDelay: 1000,
    ...options,
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

export const useLocationsForBranch = (branchId, options = {}) => {
  const currentBranchId = normalizeBranchId(branchId);

  const query = useQuery({
    queryKey: ['locations', currentBranchId],
    queryFn: async () => {
      if (!currentBranchId) {
        console.warn('⚠️ branchId is missing, skipping fetch');
        return [];
      }
      if (environment.features.enableLogging) {
        console.log(`🔍 Fetching locations for branch: ${currentBranchId}`);
      }
      try {
        const areas = await locationService.getAreas(currentBranchId);
        const locationPromises = areas.data.map((area) =>
          locationService.getLocationsByArea(area.id).catch((error) => {
            console.warn(`⚠️ Failed to fetch locations for area ${area.id}:`, error.message);
            return [];
          })
        );
        const locationsByArea = await Promise.all(locationPromises);
        const data = locationsByArea.flat();
        if (environment.features.enableLogging) {
          console.log('✅ Final fetched locations:', data);
        }
        return data || [];
      } catch (error) {
        console.error('❌ Error fetching locations:', error.response?.data || error.message);
        throw error;
      }
    },
    staleTime: environment.performance.queryStaleTime || 120000,
    cacheTime: environment.performance.queryCacheTime || 120000,
    refetchOnWindowFocus: false,
    enabled: !!currentBranchId,
    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if ([404, 403, 401, 302].includes(status)) {
        console.warn(`🚫 Request failed with status ${status}, stopping retries`);
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });

  return {
    locations: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useCreateDepartment = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: ({ deptData, branchId }) => {
      const targetBranchId = normalizeBranchId(branchId);
      if (!deptData?.name) {
        throw new Error('Department name is required');
      }
      if (!deptData?.locationId) {
        throw new Error('Location ID is required');
      }
      if (!targetBranchId) {
        throw new Error('Branch ID is required');
      }
      const payload = {
        name: deptData.name,
        branchId: Number(targetBranchId),
        locationId: Number(deptData.locationId),
      };
      if (environment.features.enableLogging) {
        console.log(`🔍 Creating department for branch: ${targetBranchId}`, payload);
      }
      return departmentService.createDepartment(payload, targetBranchId);
    },
    onSuccess: (response, variables) => {
      message.success(response.message || 'Tạo phòng ban thành công!');
      const targetBranchId = normalizeBranchId(variables.branchId);
      // Fetch locations to get locationName
      const locations = queryClient.getQueryData(['locations', targetBranchId]) || [];
      const location = locations.find(loc => String(loc.id) === String(variables.deptData.locationId));
      const newDept = {
        ...response,
        locationName: location ? location.name : 'N/A',
      };
      if (newDept) {
        queryClient.setQueryData(DEPARTMENT_QUERY_KEYS.detail(newDept.id, targetBranchId), newDept);
        queryClient.setQueryData(DEPARTMENT_QUERY_KEYS.list(targetBranchId), (oldData) => {
          const departments = Array.isArray(oldData) ? oldData : [];
          return [...departments, newDept];
        });
      }
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEYS.list(targetBranchId), exact: true });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo phòng ban!';
      message.error(errorMessage);
      console.error('❌ Failed to create department:', error.response?.data || error);
    },
    ...options,
  });
};

export const useUpdateDepartment = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: ({ deptId, deptData, branchId }) => {
      const targetBranchId = normalizeBranchId(branchId);
      if (!deptId) {
        throw new Error('Department ID is required');
      }
      if (!deptData?.name) {
        throw new Error('Department name is required');
      }
      if (!deptData?.locationId) {
        throw new Error('Location ID is required');
      }
      const payload = {
        name: deptData.name,
        locationId: Number(deptData.locationId),
        branchId: Number(targetBranchId), // Added branchId to match BE DTO
      };
      if (environment.features.enableLogging) {
        console.log(`🔍 Updating department ${deptId} for branch: ${targetBranchId}`, payload);
      }
      return departmentService.updateDepartment(deptId, payload);
    },
    onSuccess: (response, variables) => {
      message.success(response.message || 'Cập nhật phòng ban thành công!');
      const targetBranchId = normalizeBranchId(variables.branchId);
      // Fetch locations to get locationName
      const locations = queryClient.getQueryData(['locations', targetBranchId]) || [];
      const location = locations.find(loc => String(loc.id) === String(variables.deptData.locationId));
      const updatedDept = {
        ...response,
        locationName: location ? location.name : 'N/A',
      };
      if (updatedDept) {
        queryClient.setQueryData(DEPARTMENT_QUERY_KEYS.detail(variables.deptId, targetBranchId), updatedDept);
        queryClient.setQueryData(DEPARTMENT_QUERY_KEYS.list(targetBranchId), (oldData) => {
          const departments = Array.isArray(oldData) ? oldData : [];
          return departments.map((dept) => (dept.id === variables.deptId ? updatedDept : dept));
        });
      }
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEYS.list(targetBranchId), exact: true });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.name?.[0] ||
        error.message ||
        'Không thể cập nhật phòng ban!';
      message.error(errorMessage);
      console.error('❌ Failed to update department:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
    },
    ...options,
  });
};

export const useDeleteDepartment = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: ({ deptId, branchId }) => {
      const targetBranchId = normalizeBranchId(branchId);
      if (!deptId) {
        throw new Error('Department ID is required');
      }
      if (environment.features.enableLogging) {
        console.log(`🔍 Deleting department ${deptId} for branch: ${targetBranchId}`);
      }
      return departmentService.deleteDepartment(deptId);
    },
    onSuccess: (response, variables) => {
      message.success(response.message || 'Xóa phòng ban thành công!');
      const targetBranchId = normalizeBranchId(variables.branchId);
      queryClient.removeQueries({ queryKey: DEPARTMENT_QUERY_KEYS.detail(variables.deptId, targetBranchId), exact: true });
      queryClient.setQueryData(DEPARTMENT_QUERY_KEYS.list(targetBranchId), (oldData) => {
        const departments = Array.isArray(oldData) ? oldData : [];
        return departments.filter((dept) => dept.id !== variables.deptId);
      });
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEYS.list(targetBranchId), exact: true });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Không thể xóa phòng ban!';
      message.error(errorMessage);
      console.error('❌ Failed to delete department:', error.response?.data || error);
    },
    ...options,
  });
};