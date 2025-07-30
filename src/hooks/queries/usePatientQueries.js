import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { nurseOrderService } from '../../services/patientService';
import environment from '../../config/environment';
import { ORDER_QUERY_KEYS } from './useOrders';
import { getFilteredPatients } from '../../mocks/patientData';
import { patientService } from '../../services/patientService';

const normalizeBranchId = (branchId) => {
  const resolvedBranchId =
    branchId !== undefined && branchId !== null
      ? branchId
      : environment.multiTenant.getCurrentBranchId();

  const id =
    resolvedBranchId !== undefined && resolvedBranchId !== null
      ? String(resolvedBranchId)
      : '1';

  if (environment.features.enableLogging) {
    console.log(`🔄 Normalized branchId: ${id}`);
  }

  return id;
};

export const PATIENT_KEYS = {
  all: ['patients'],
  lists: () => [...PATIENT_KEYS.all, 'list'],
  byBranch: (branchId) => [...PATIENT_KEYS.all, 'byBranch', branchId],
  search: (branchId, searchTerm) => [...PATIENT_KEYS.all, 'search', branchId, searchTerm],
  byRoom: (branchId, roomNumber) => [...PATIENT_KEYS.all, 'byRoom', branchId, roomNumber],
  withDiseaseCategories: (branchId) => [...PATIENT_KEYS.all, 'withDiseaseCategories', branchId],
  detail: (patientId) => [...PATIENT_KEYS.all, 'detail', patientId],
};

const fetchPatients = async (filters = {}) => {
  const USE_REAL_API = !environment.features.enableMockData;

  if (USE_REAL_API) {
    console.log('🌐 Using real API for patient data', { filters });

    if (filters.search) {
      return await patientService.searchPatients(filters.search, filters.branchId);
    } else {
      return await patientService.getPatientsByBranch(filters.branchId);
    }
  } else {
    console.log('🔧 Using mock patient data', { filters });
    return await getFilteredPatients(filters);
  }
};

export const usePatients = (filters = {}, options = {}) => {
  const queryFilters = {
    search: filters.search || '',
    branchId: filters.branchId || 1,
  };

  return useQuery({
    queryKey: queryFilters.search
      ? PATIENT_KEYS.search(queryFilters.branchId, queryFilters.search)
      : PATIENT_KEYS.byBranch(queryFilters.branchId),
    queryFn: () => fetchPatients(queryFilters),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...options,
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientData, branchId }) =>
      patientService.createPatient(patientData, branchId),
    onSuccess: (data, { branchId }) => {
      queryClient.invalidateQueries({
        queryKey: PATIENT_KEYS.byBranch(branchId),
      });
      message.success('Patient created successfully');
    },
    onError: (error) => {
      message.error('Failed to create patient: ' + error.message);
    },
  });
};

export const usePatientsWithDiseaseCategories = (branchId, options = {}) => {
  return useQuery({
    queryKey: PATIENT_KEYS.withDiseaseCategories(branchId),
    queryFn: () => patientService.getPatientsByBranch(branchId),
    enabled: !!branchId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePatientsByRoom = (roomNumber, branchId, options = {}) => {
  return useQuery({
    queryKey: PATIENT_KEYS.byRoom(branchId, roomNumber),
    queryFn: () => patientService.getPatientsByRoom(roomNumber, branchId),
    enabled: !!(roomNumber && branchId),
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    ...options,
  });
};

export const usePatientDetail = (patientId, options = {}) => {
  return useQuery({
    queryKey: PATIENT_KEYS.detail(patientId),
    queryFn: () => patientService.getPatientWithDiseaseCategories(patientId),
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    ...options,
  });
};

export const useCreatePatientOrder = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: ({ orderData, branchId }) => {
      const targetBranchId = normalizeBranchId(branchId);
      console.log(`🔍 Creating patient order for branch: ${targetBranchId}`, JSON.stringify(orderData, null, 2));
      return nurseOrderService.createOrderForPatient(orderData, targetBranchId);
    },
    onSuccess: (response, variables) => {
      message.success(response.message || 'Tạo đơn hàng bệnh nhân thành công!');
      const targetBranchId = normalizeBranchId(variables.branchId);
      const newOrder = response.data || response;
      console.log('✅ Order created:', JSON.stringify(newOrder, null, 2));
      if (newOrder?.id) {
        queryClient.setQueryData(ORDER_QUERY_KEYS.detail(newOrder.id, targetBranchId), newOrder);
        queryClient.setQueryData(ORDER_QUERY_KEYS.list(targetBranchId), (oldData) => {
          return oldData ? [...oldData, newOrder] : [newOrder];
        });
        const patientId = variables.orderData.patientId;
        const orderDetails = newOrder.orderDetails.map(detail => ({
          foodId: detail.foodId,
          quantity: detail.qty,
          notes: detail.note,
          orderId: detail.orderId,
          menuId: detail.menuId,
        }));
        queryClient.setQueryData(['patientOrders', patientId], orderDetails);
      }
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.list(targetBranchId), exact: true });
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.lists(), exact: true });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo đơn hàng bệnh nhân!';
      message.error(errorMessage);
      console.error('❌ Failed to create patient order:', {
        status: error.response?.status,
        data: error.response?.data,
        errorMessage,
      });
    },
    ...options,
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, patientData, branchId }) =>
      patientService.updatePatient(patientId, patientData, branchId),
    onSuccess: (data, { patientId, branchId }) => {
      queryClient.setQueryData(PATIENT_KEYS.detail(patientId), { data });
      queryClient.invalidateQueries({
        queryKey: PATIENT_KEYS.byBranch(branchId),
      });
      message.success('Patient updated successfully');
    },
    onError: (error) => {
      message.error('Failed to update patient: ' + error.message);
    },
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, branchId }) => {
      console.log('🔍 useDeletePatient.mutationFn - Calling deletePatient:', { patientId, branchId });
      return patientService.deletePatient(patientId, branchId);
    },
    onSuccess: (data, { patientId, branchId }) => {
      console.log('✅ useDeletePatient.onSuccess - Patient deleted successfully:', { patientId, branchId, data });
      queryClient.removeQueries({
        queryKey: PATIENT_KEYS.detail(patientId),
      });
      queryClient.invalidateQueries({
        queryKey: PATIENT_KEYS.byBranch(branchId),
      });
      queryClient.invalidateQueries({
        queryKey: PATIENT_KEYS.all,
        predicate: (query) => {
          const queryKey = query.queryKey;
          return queryKey.includes('patients') && queryKey.includes(branchId);
        },
      });
      message.success('Xóa bệnh nhân thành công');
    },
    onError: (error, { patientId, branchId }) => {
      console.error('❌ useDeletePatient.onError - Failed to delete patient:', {
        patientId,
        branchId,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
      });
      message.error('Lỗi khi xóa bệnh nhân: ' + (error.response?.data?.message || error.message));
    },
  });
};