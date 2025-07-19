import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService, nurseOrderService } from '../../services/patientService';
import { message } from 'antd';

// Query Keys
export const PATIENT_FOOD_KEYS = {
    all: ['patient-food'],
    allowedFoods: (patientId) => [...PATIENT_FOOD_KEYS.all, 'allowed', patientId],
    restrictedFoods: (patientId, branchId) => [...PATIENT_FOOD_KEYS.all, 'restricted', patientId, branchId],
    validation: (patientId, foodId, branchId) => [...PATIENT_FOOD_KEYS.all, 'validation', patientId, foodId, branchId],
    bulkValidation: (patientId, branchId) => [...PATIENT_FOOD_KEYS.all, 'bulk-validation', patientId, branchId],
    orderHistory: (patientId, branchId) => [...PATIENT_FOOD_KEYS.all, 'order-history', patientId, branchId],
};

// Get allowed foods for a patient based on their disease categories
export const useAllowedFoodsForPatient = (patientId, diseaseCategoryId = null, options = {}) => {
    return useQuery({
        queryKey: [...PATIENT_FOOD_KEYS.allowedFoods(patientId), diseaseCategoryId],
        queryFn: () => patientService.getAllowedFoodsForPatient(patientId, diseaseCategoryId),
        enabled: !!patientId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        ...options,
    });
};

// Get restricted foods for a patient
export const useRestrictedFoodsForPatient = (patientId, branchId, options = {}) => {
    return useQuery({
        queryKey: PATIENT_FOOD_KEYS.restrictedFoods(patientId, branchId),
        queryFn: () => patientService.getRestrictedFoodsForPatient(patientId, branchId),
        enabled: !!(patientId && branchId),
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        ...options,
    });
};

// Validate a single food for a patient
export const useFoodValidation = (patientId, foodId, branchId, options = {}) => {
    return useQuery({
        queryKey: PATIENT_FOOD_KEYS.validation(patientId, foodId, branchId),
        queryFn: () => patientService.validateFoodForPatient(patientId, foodId, branchId),
        enabled: !!(patientId && foodId && branchId),
        staleTime: 2 * 60 * 1000, // 2 minutes
        cacheTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        ...options,
    });
};

// Validate multiple foods for a patient (bulk validation)
export const useBulkFoodValidation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ patientId, foodIds, branchId }) =>
            patientService.validateFoodsForPatient(patientId, foodIds, branchId),
        onSuccess: (data, { patientId, branchId }) => {
            // Cache the validation results
            queryClient.setQueryData(
                PATIENT_FOOD_KEYS.bulkValidation(patientId, branchId),
                data
            );

            // Also cache individual validation results
            data.data?.forEach(result => {
                queryClient.setQueryData(
                    PATIENT_FOOD_KEYS.validation(patientId, result.foodId, branchId),
                    { data: result }
                );
            });
        },
        onError: (error) => {
            message.error('Food validation failed: ' + error.message);
        },
    });
};

// Get order history for a patient
export const usePatientOrderHistory = (patientId, branchId, options = {}) => {
    return useQuery({
        queryKey: PATIENT_FOOD_KEYS.orderHistory(patientId, branchId),
        queryFn: () => nurseOrderService.getOrderHistoryForPatient(patientId, branchId),
        enabled: !!(patientId && branchId),
        staleTime: 1 * 60 * 1000, // 1 minute
        cacheTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        ...options,
    });
};

// Create an order for a patient (with automatic food validation)
export const useCreatePatientOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderData, branchId }) =>
            nurseOrderService.createOrderForPatient(orderData, branchId),
        onSuccess: (data, { orderData, branchId }) => {
            // Invalidate patient order history
            queryClient.invalidateQueries({
                queryKey: PATIENT_FOOD_KEYS.orderHistory(orderData.patientId, branchId)
            });

            // Show success message
            message.success(`Order created successfully for patient ${orderData.patientName || orderData.patientId}`);
        },
        onError: (error) => {
            // Show error message with restriction details
            if (error.message.includes('restricted')) {
                message.error({
                    content: error.message,
                    duration: 6,
                });
            } else {
                message.error('Failed to create order: ' + error.message);
            }
        },
    });
};

// Hook for real-time food validation during order creation
export const useOrderFoodValidation = (patientId, branchId) => {
    const bulkValidation = useBulkFoodValidation();
    const queryClient = useQueryClient();

    const validateFoods = async (foodIds) => {
        if (!patientId || !branchId || !foodIds.length) {
            return { validFoods: [], restrictedFoods: [] };
        }

        try {
            const result = await bulkValidation.mutateAsync({
                patientId,
                foodIds,
                branchId
            });

            const validFoods = result.data?.filter(r => r.isAllowed) || [];
            const restrictedFoods = result.data?.filter(r => !r.isAllowed) || [];

            return { validFoods, restrictedFoods, allResults: result.data };
        } catch (error) {
            console.error('Food validation error:', error);
            throw error;
        }
    };

    const clearValidationCache = () => {
        queryClient.removeQueries({
            queryKey: PATIENT_FOOD_KEYS.bulkValidation(patientId, branchId)
        });
    };

    return {
        validateFoods,
        clearValidationCache,
        isValidating: bulkValidation.isPending,
        error: bulkValidation.error,
    };
};

// Hook for getting patient disease categories
export const usePatientDiseaseCategories = (patientId, options = {}) => {
    return useQuery({
        queryKey: ['patients', patientId, 'disease-categories'],
        queryFn: () => patientService.getPatientWithDiseaseCategories(patientId),
        enabled: !!patientId,
        staleTime: 10 * 60 * 1000, // 10 minutes
        cacheTime: 15 * 60 * 1000, // 15 minutes
        ...options,
    });
};

// Utility hook for patient food management
export const usePatientFoodManagement = (patientId, branchId) => {
    const allowedFoods = useAllowedFoodsForPatient(patientId);
    const restrictedFoods = useRestrictedFoodsForPatient(patientId, branchId);
    const patientInfo = usePatientDiseaseCategories(patientId);
    const orderHistory = usePatientOrderHistory(patientId, branchId);
    const createOrder = useCreatePatientOrder();
    const foodValidation = useOrderFoodValidation(patientId, branchId);

    return {
        // Data
        allowedFoods: allowedFoods.data?.data || [],
        restrictedFoods: restrictedFoods.data?.data || [],
        patientInfo: patientInfo.data?.data,
        orderHistory: orderHistory.data?.data || [],

        // Loading states
        isLoadingAllowedFoods: allowedFoods.isLoading,
        isLoadingRestrictedFoods: restrictedFoods.isLoading,
        isLoadingPatientInfo: patientInfo.isLoading,
        isLoadingOrderHistory: orderHistory.isLoading,
        isCreatingOrder: createOrder.isPending,

        // Error states
        allowedFoodsError: allowedFoods.error,
        restrictedFoodsError: restrictedFoods.error,
        patientInfoError: patientInfo.error,
        orderHistoryError: orderHistory.error,
        createOrderError: createOrder.error,

        // Actions
        createOrder: createOrder.mutate,
        validateFoods: foodValidation.validateFoods,
        clearValidationCache: foodValidation.clearValidationCache,

        // Refetch functions
        refetchAllowedFoods: allowedFoods.refetch,
        refetchRestrictedFoods: restrictedFoods.refetch,
        refetchPatientInfo: patientInfo.refetch,
        refetchOrderHistory: orderHistory.refetch,

        // Computed properties
        hasRestrictions: (restrictedFoods.data?.data || []).length > 0,
        diseaseCategories: patientInfo.data?.data?.diseaseCategories || [],
        isValidating: foodValidation.isValidating,
    };
};

export default {
    useAllowedFoodsForPatient,
    useRestrictedFoodsForPatient,
    useFoodValidation,
    useBulkFoodValidation,
    usePatientOrderHistory,
    useCreatePatientOrder,
    useOrderFoodValidation,
    usePatientDiseaseCategories,
    usePatientFoodManagement,
}; 