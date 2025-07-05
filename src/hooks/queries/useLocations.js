import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { locationService } from '../../services/locationService';
import environment from '../../config/environment';

export const LOCATION_QUERY_KEYS = {
  all: ['locations'],
  lists: () => [...LOCATION_QUERY_KEYS.all, 'list'],
  list: (areaId, branchId) => [...LOCATION_QUERY_KEYS.lists(), { areaId: String(areaId), branchId: String(branchId) }],
  details: () => [...LOCATION_QUERY_KEYS.all, 'detail'],
  detail: (id, areaId, branchId) => [...LOCATION_QUERY_KEYS.details(), id, { areaId: String(areaId), branchId: String(branchId) }],
};

const normalizeBranchId = (branchId) => {
  return String(branchId || environment.multiTenant.getCurrentBranchId() || '1');
};

export const useLocations = (areaId, branchId, options = {}) => {
  const currentBranchId = normalizeBranchId(branchId);

  const query = useQuery({
    queryKey: areaId
      ? LOCATION_QUERY_KEYS.list(areaId, currentBranchId)
      : LOCATION_QUERY_KEYS.lists(), // Sử dụng key chung nếu không có areaId
    queryFn: async () => {
      if (!currentBranchId) {
        console.warn('⚠️ branchId is missing, skipping fetch');
        return [];
      }

      if (environment.features.enableLogging) {
        console.log(`🔍 Fetching locations for ${areaId ? `area: ${areaId}, ` : ''}branch: ${currentBranchId}`);
      }

      try {
        let data;
        if (areaId) {
          // Lấy locations cho areaId cụ thể
          data = await locationService.getLocationsByArea(areaId);
        } else {
          // Lấy tất cả areas và locations tương ứng
          const areas = await locationService.getAreas(currentBranchId);
          const locationPromises = areas.data.map((area) =>
            locationService.getLocationsByArea(area.id).catch((error) => {
              console.warn(`⚠️ Failed to fetch locations for area ${area.id}:`, error.message);
              return []; // Trả về mảng rỗng nếu lỗi
            })
          );
          const locationsByArea = await Promise.all(locationPromises);
          // Gộp tất cả locations từ các khu vực
          data = locationsByArea.flat();
        }

        if (environment.features.enableLogging) {
          console.log('✅ Final fetched locations:', data);
        }
        return data || [];
      } catch (error) {
        console.error('❌ Error fetching locations:', error.response?.data || error.message);
        throw error;
      }
    },
    staleTime: environment.performance.images?.cacheTime || 120000,
    cacheTime: environment.performance.images?.cacheTime || 120000,
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
    isRefetching: query.isRefetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    isFetching: query.isFetching,
  };
};

export const useLocation = (locationId, areaId, branchId, options = {}) => {
  const currentBranchId = normalizeBranchId(branchId);

  const query = useQuery({
    queryKey: LOCATION_QUERY_KEYS.detail(locationId, areaId, currentBranchId),
    queryFn: async () => {
      try {
        const response = await locationService.getLocationById(locationId);
        if (environment.features.enableLogging) {
          console.log('✅ Fetched location by ID:', response.data);
        }
        return response.data || null;
      } catch (error) {
        console.error('❌ Error fetching location by ID:', error.response?.data || error.message);
        throw error;
      }
    },
    enabled: !!(locationId && areaId && currentBranchId),
    staleTime: environment.performance.queryStaleTime || 300000,
    cacheTime: environment.performance.queryCacheTime || 300000,
    ...options,
  });

  return {
    location: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isError: query.isError,
    isSuccess: query.isSuccess,
  };
};

export const useCreateLocation = (options = {}) => {
  const queryClient = useQueryClient();
  const currentbranchId = normalizeBranchId();

  return useMutation({
    mutationFn: ({ locationData, branchId, areaId }) => {
      const targetBranchId = normalizeBranchId(branchId);
      return locationService.createLocation({ ...locationData, branchId: targetBranchId, areaId });
    },
    onSuccess: (response, variables) => {
      message.success(response.message || 'Tạo vị trí thành công!');
      const targetBranchId = normalizeBranchId(variables.branchId);
      const newLocation = response.data?.data || response.data;
      console.log('✅ New location:', newLocation);
      if (newLocation) {
        queryClient.setQueryData(LOCATION_QUERY_KEYS.list(variables.areaId, targetBranchId), (oldData) => {
          const updatedData = oldData ? [...oldData, newLocation] : [newLocation];
          console.log('✅ Updated cache for list:', updatedData);
          return updatedData;
        });
        queryClient.setQueryData(
          LOCATION_QUERY_KEYS.detail(newLocation.id, variables.areaId, targetBranchId),
          newLocation
        );
      }
      console.log('✅ Invalidating cache for areaId:', variables.areaId, 'branchId:', targetBranchId);
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.list(variables.areaId, targetBranchId) });
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Không thể tạo vị trí!';
      message.error(errorMessage);
      console.error('❌ Failed to create location:', error);
    },
    ...options,
  });
};

export const useUpdateLocation = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: ({ locationId, locationData, branchId, areaId }) => {
      const targetBranchId = normalizeBranchId(branchId);
      const { id, ...updateData } = locationData;
      return locationService.updateLocation(locationId, { ...updateData, branchId: targetBranchId, areaId });
    },
    onSuccess: (response, variables) => {
      message.success(response.message || 'Cập nhật vị trí thành công!');
      const targetBranchId = normalizeBranchId(variables.branchId);
      const updatedLocation = response.data;
      if (updatedLocation) {
        queryClient.setQueryData(LOCATION_QUERY_KEYS.detail(variables.locationId, variables.areaId, targetBranchId), updatedLocation);
        queryClient.setQueryData(LOCATION_QUERY_KEYS.list(variables.areaId, targetBranchId), (oldData) => {
          return oldData
            ? oldData.map((location) => (location.id === variables.locationId ? updatedLocation : location))
            : [updatedLocation];
        });
      }
      console.log('✅ Invalidating cache for areaId:', variables.areaId, 'branchId:', targetBranchId);
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.list(variables.areaId, targetBranchId) });
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật vị trí!';
      message.error(errorMessage);
      console.error('❌ Failed to update location:', error);
    },
    ...options,
  });
};

export const useDeleteLocation = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: (locationId) => locationService.deleteLocation(locationId),
    onSuccess: (response, locationId) => {
      message.success(response.message || 'Xóa vị trí thành công!');
      queryClient.removeQueries({ queryKey: LOCATION_QUERY_KEYS.detail(locationId, currentBranchId) });
      queryClient.setQueryData(LOCATION_QUERY_KEYS.list(currentBranchId), (oldData) => {
        return oldData ? oldData.filter((location) => location.id !== locationId) : [];
      });
      console.log('✅ Invalidating cache for delete location');
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.list(currentBranchId) });
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Không thể xóa vị trí!';
      message.error(errorMessage);
      console.error('❌ Failed to delete location:', error);
    },
    ...options,
  });
};