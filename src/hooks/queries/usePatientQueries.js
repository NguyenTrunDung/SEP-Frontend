import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '../../services/patientService';
import { getFilteredPatients } from '../../mocks/patientData';
import { message } from 'antd';
import environment from '../../config/environment';

export const PATIENT_KEYS = {
  all: ['patients'],
  lists: () => [...PATIENT_KEYS.all, 'list'],
  byBranch: (branchId) => [...PATIENT_KEYS.all, 'byBranch', branchId],
  search: (branchId, searchTerm) => [...PATIENT_KEYS.all, 'search', branchId, searchTerm],
  byRoom: (branchId, roomNumber) => [...PATIENT_KEYS.all, 'byRoom', branchId, roomNumber],
  withDiseaseCategories: (branchId) => [...PATIENT_KEYS.all, 'withDiseaseCategories', branchId],
  detail: (patientId) => [...PATIENT_KEYS.all, 'detail', patientId],
};

// Environment-based fetch function
const fetchPatients = async (filters = {}) => {
  // Use the existing environment configuration pattern
  // enableMockData = false means use real API
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

// Main patients query hook
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

// Get patients with disease categories
export const usePatientsWithDiseaseCategories = (branchId, options = {}) => {
  return useQuery({
    queryKey: PATIENT_KEYS.withDiseaseCategories(branchId),
    queryFn: () => patientService.getPatientsByBranch(branchId), // API returns patients with disease categories
    enabled: !!branchId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Get patients by room
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

// Get single patient with disease categories
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

// Create patient mutation
export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientData, branchId }) =>
      patientService.createPatient(patientData, branchId),
    onSuccess: (data, { branchId }) => {
      // Invalidate all patient queries for this branch
      queryClient.invalidateQueries({
        queryKey: PATIENT_KEYS.byBranch(branchId)
      });
      message.success('Patient created successfully');
    },
    onError: (error) => {
      message.error('Failed to create patient: ' + error.message);
    },
  });
};

// Update patient mutation
export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, patientData, branchId }) =>
      patientService.updatePatient(patientId, patientData, branchId),
    onSuccess: (data, { patientId, branchId }) => {
      // Update patient detail cache
      queryClient.setQueryData(
        PATIENT_KEYS.detail(patientId),
        { data }
      );

      // Invalidate list queries
      queryClient.invalidateQueries({
        queryKey: PATIENT_KEYS.byBranch(branchId)
      });

      message.success('Patient updated successfully');
    },
    onError: (error) => {
      message.error('Failed to update patient: ' + error.message);
    },
  });
};

// Delete patient mutation
export const useDeletePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, branchId }) =>
      patientService.deletePatient(patientId, branchId),
    onSuccess: (data, { patientId, branchId }) => {
      // Remove from detail cache
      queryClient.removeQueries({
        queryKey: PATIENT_KEYS.detail(patientId)
      });

      // Invalidate list queries
      queryClient.invalidateQueries({
        queryKey: PATIENT_KEYS.byBranch(branchId)
      });

      message.success('Patient deleted successfully');
    },
    onError: (error) => {
      message.error('Failed to delete patient: ' + error.message);
    },
  });
};