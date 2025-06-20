import { useQuery } from '@tanstack/react-query';
import { getFilteredPatients } from '../../mocks/patientData';

export const PATIENT_KEYS = {
  all: ['patients'],
  lists: () => [...PATIENT_KEYS.all, 'list'],
  byBranch: (branchId) => [...PATIENT_KEYS.all, 'byBranch', branchId],
};

const fetchPatients = async (filters = {}) => {
  console.log('✅ Using mock patient data', { filters });
  return await getFilteredPatients(filters);
};

export const usePatients = (filters = {}, options = {}) => {
  const queryFilters = {
    search: filters.search || '',
    branchId: filters.branchId || 1, // Default branchId = 1 since no backend
  };

  return useQuery({
    queryKey: [...PATIENT_KEYS.byBranch(queryFilters.branchId), queryFilters.search],
    queryFn: () => fetchPatients(queryFilters),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...options,
  });
};