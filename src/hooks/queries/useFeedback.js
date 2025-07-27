import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { feedbackService } from '../../services/feedbackService';
import environment from '../../config/environment';
import api from '../../services/api/config';

export const FEEDBACK_QUERY_KEYS = {
  all: ['feedbacks'],
  lists: () => [...FEEDBACK_QUERY_KEYS.all, 'list'],
  list: (branchId) => [...FEEDBACK_QUERY_KEYS.lists(), { branchId: String(branchId) }],
  details: () => [...FEEDBACK_QUERY_KEYS.all, 'detail'],
  detail: (id, branchId) => [...FEEDBACK_QUERY_KEYS.details(), id, { branchId: String(branchId) }],
  byOrder: (orderId, branchId) => [...FEEDBACK_QUERY_KEYS.lists(), 'byOrder', { orderId, branchId: String(branchId) }],
};

const normalizeBranchId = (branchId) => {
  const id = String(branchId || environment.multiTenant.getCurrentBranchId() || '1');
  if (environment.features?.enableLogging) {
    console.log('🔍 Normalized branchId:', id);
  }
  return id;
};

export const useFeedbacks = (options = {}) => {
  const currentBranchId = normalizeBranchId();

  const query = useQuery({
    queryKey: FEEDBACK_QUERY_KEYS.list(currentBranchId),
    queryFn: async () => {
      if (!currentBranchId) {
        console.warn('⚠️ branchId is missing, skipping fetch');
        return [];
      }

      try {
        const data = await feedbackService.getFeedbacks(currentBranchId);
        return data || [];
      } catch (error) {
        console.error('❌ Error fetching feedbacks:', error.response?.data || error.message);
        throw error;
      }
    },
    staleTime: environment.performance?.queryStaleTime || 5 * 60 * 1000,
    cacheTime: environment.performance?.queryCacheTime || 5 * 60 * 1000,
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
    feedbacks: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    isFetching: query.isFetching,
  };
};

export const useFeedback = (feedbackId, options = {}) => {
  const currentBranchId = normalizeBranchId();

  const query = useQuery({
    queryKey: FEEDBACK_QUERY_KEYS.detail(feedbackId, currentBranchId),
    queryFn: async () => {
      try {
        const response = await feedbackService.getFeedback(feedbackId);
        return response || null;
      } catch (error) {
        console.error('❌ Error fetching feedback by ID:', error.response?.data || error.message);
        throw error;
      }
    },
    enabled: !!feedbackId,
    staleTime: environment.performance?.queryStaleTime || 5 * 60 * 1000,
    cacheTime: environment.performance?.queryCacheTime || 5 * 60 * 1000,
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
    feedback: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isError: query.isError,
    isSuccess: query.isSuccess,
  };
};

export const useCreateFeedback = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: ({ feedbackData, branchId }) => {
      const targetBranchId = normalizeBranchId(branchId);
      return feedbackService.createFeedback(feedbackData);
    },
    onSuccess: (response, variables) => {
      message.success(response.message || 'Tạo đánh giá thành công!');
      const targetBranchId = normalizeBranchId(variables.branchId);
      const newFeedback = response;
      if (newFeedback) {
        queryClient.setQueryData(FEEDBACK_QUERY_KEYS.list(targetBranchId), (oldData) => {
          const updatedData = oldData ? [...oldData, newFeedback] : [newFeedback];
          return updatedData;
        });
        queryClient.setQueryData(FEEDBACK_QUERY_KEYS.detail(newFeedback.id, targetBranchId), newFeedback);
      }
      queryClient.invalidateQueries({ queryKey: FEEDBACK_QUERY_KEYS.list(targetBranchId) });
      queryClient.invalidateQueries({ queryKey: FEEDBACK_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.status === 415
          ? 'Server không hỗ trợ định dạng dữ liệu. Vui lòng kiểm tra cấu hình API.'
          : error.response?.status === 400 && error.response?.data?.message === 'User already rated this order'
          ? 'Bạn đã đánh giá đơn hàng này rồi!'
          : error.response?.data?.message || 'Không thể tạo đánh giá!';
      message.error(errorMessage);
      console.error('❌ Failed to create feedback:', error.response?.data || error);
    },
    ...options,
  });
};

export const useUpdateFeedback = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: ({ id, formData, branchId }) => {
      const targetBranchId = normalizeBranchId(branchId);
      return feedbackService.updateFeedback(id, formData);
    },
    onSuccess: (response, variables) => {
      message.success(response.message || 'Cập nhật đánh giá thành công!');
      const targetBranchId = normalizeBranchId(variables.branchId);
      const updatedFeedback = response;
      if (updatedFeedback) {
        queryClient.setQueryData(FEEDBACK_QUERY_KEYS.detail(variables.id, targetBranchId), updatedFeedback);
        queryClient.setQueryData(FEEDBACK_QUERY_KEYS.list(targetBranchId), (oldData) => {
          return oldData
            ? oldData.map((feedback) => (feedback.id === variables.id ? updatedFeedback : feedback))
            : [updatedFeedback];
        });
      }
      queryClient.invalidateQueries({ queryKey: FEEDBACK_QUERY_KEYS.list(targetBranchId) });
      queryClient.invalidateQueries({ queryKey: FEEDBACK_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật đánh giá!';
      message.error(errorMessage);
      console.error('❌ Failed to update feedback:', error);
    },
    ...options,
  });
};

export const useDeleteFeedback = (options = {}) => {
  const queryClient = useQueryClient();
  const currentBranchId = normalizeBranchId();

  return useMutation({
    mutationFn: (feedbackId) => feedbackService.deleteFeedback(feedbackId),
    onMutate: async (feedbackId) => {
      await queryClient.cancelQueries({ queryKey: FEEDBACK_QUERY_KEYS.list(currentBranchId) });
      const previousFeedbacks = queryClient.getQueryData(FEEDBACK_QUERY_KEYS.list(currentBranchId));
      if (previousFeedbacks) {
        queryClient.setQueryData(
          FEEDBACK_QUERY_KEYS.list(currentBranchId),
          previousFeedbacks.filter((feedback) => feedback.id !== feedbackId)
        );
      }
      return { previousFeedbacks };
    },
    onSuccess: (data, feedbackId) => {
      queryClient.removeQueries({ queryKey: FEEDBACK_QUERY_KEYS.detail(feedbackId, currentBranchId) });
      queryClient.invalidateQueries({ queryKey: FEEDBACK_QUERY_KEYS.list(currentBranchId) });
      message.success('Đã xóa đánh giá thành công!');
    },
    onError: (error, feedbackId, context) => {
      if (context?.previousFeedbacks) {
        queryClient.setQueryData(FEEDBACK_QUERY_KEYS.list(currentBranchId), context.previousFeedbacks);
      }
      console.error('❌ Failed to delete feedback:', error);
      message.error(error.response?.data?.message || 'Không thể xóa đánh giá!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FEEDBACK_QUERY_KEYS.list(currentBranchId) });
    },
    ...options,
  });
};

export const useFeedbacksByOrder = (orderId, branchId, options = {}) => {
  const targetBranchId = normalizeBranchId(branchId);

  const query = useQuery({
    queryKey: FEEDBACK_QUERY_KEYS.byOrder(orderId, targetBranchId),
    queryFn: async () => {
      try {
        const response = await api.get('/api/v1/Comment/By-Order', {
          params: { OrderId: orderId, branchId: targetBranchId },
        });
        if (response.data.status !== 'success') {
          console.warn('⚠️ Response status not success:', response.data.message);
          return [];
        }
        const normalizedData = await Promise.all(
          response.data.data.map(async (feedback) => {
            let customerName = feedback.userId;
            let avatar = null;
            try {
              const userResponse = await api.get(`/api/v1/BranchUserManagement/${feedback.userId}/branch/${feedback.branchId}`);
              customerName = userResponse.data?.firstName && userResponse.data?.lastName 
                ? `${userResponse.data.firstName} ${userResponse.data.lastName}` 
                : feedback.userId;
              avatar = userResponse.data?.avatar || null;
            } catch (error) {
              console.warn(`⚠️ Failed to fetch customerName for userId ${feedback.userId}:`, error);
            }
            return {
              id: feedback.id,
              orderId: feedback.orderId,
              userId: feedback.userId,
              branchId: feedback.branchId,
              rating: feedback.star,
              content: feedback.commentLines,
              images: feedback.images || [],
              reply: feedback.reply || null,
              customerName,
              avatar,
              timestamp: feedback.createdAt || new Date().toISOString(),
            };
          })
        );
        return normalizedData;
      } catch (error) {
        console.error('❌ Error fetching feedbacks by order:', error.response?.data || error.message);
        throw error;
      }
    },
    enabled: !!orderId && !!targetBranchId,
    staleTime: environment.performance?.queryStaleTime || 5 * 60 * 1000,
    cacheTime: environment.performance?.queryCacheTime || 5 * 60 * 1000,
    ...options,
  });

  return {
    feedbacks: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isError: query.isError,
    isSuccess: query.isSuccess,
  };
};