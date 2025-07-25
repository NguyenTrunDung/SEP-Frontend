import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbackService } from '../../services/feedbackService';
import environment from '../../config/environment';
import { message } from 'antd';
import { mockFeedbacks } from '../../mocks/mockFeedbacks'; // Import mock data

// Query Keys with branch context
export const FEEDBACK_QUERY_KEYS = {
  all: ['feedbacks'],
  lists: () => [...FEEDBACK_QUERY_KEYS.all, 'list'],
  list: (branchId) => [...FEEDBACK_QUERY_KEYS.lists(), { branchId }],
  details: () => [...FEEDBACK_QUERY_KEYS.all, 'detail'],
  detail: (id, branchId) => [...FEEDBACK_QUERY_KEYS.details(), { id, branchId }],
};

/**
 * React Query hook for fetching feedbacks
 */
export const useFeedbacks = () => {
  const currentBranchId = environment.multiTenant.getCurrentBranchId();

  const query = useQuery({
    queryKey: FEEDBACK_QUERY_KEYS.list(currentBranchId),
    queryFn: () => feedbackService.getFeedbacks(mockFeedbacks), // Sử dụng mock data
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!currentBranchId,
  });

  return {
    feedbacks: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * React Query hook for fetching a specific feedback by ID
 */
export const useFeedback = (feedbackId, options = {}) => {
  const currentBranchId = environment.multiTenant.getCurrentBranchId();

  const query = useQuery({
    queryKey: FEEDBACK_QUERY_KEYS.detail(feedbackId, currentBranchId),
    queryFn: () => feedbackService.getFeedback(feedbackId, mockFeedbacks),
    enabled: !!(feedbackId && currentBranchId),
    staleTime: 5 * 60 * 1000,
    ...options,
  });

  return {
    feedback: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * React Query mutation hook for creating a new feedback
 */
export const useCreateFeedback = () => {
  const queryClient = useQueryClient();
  const currentBranchId = environment.multiTenant.getCurrentBranchId();

  return useMutation({
    mutationFn: (feedbackData) => feedbackService.createFeedback(feedbackData, mockFeedbacks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEEDBACK_QUERY_KEYS.list(currentBranchId) });
      message.success('Tạo đánh giá thành công!');
    },
    onError: (error) => {
      console.error('❌ Failed to create feedback:', error);
      message.error(error.message || 'Có lỗi xảy ra khi tạo đánh giá!');
    },
  });
};

/**
 * React Query mutation hook for updating an existing feedback
 */
export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();
  const currentBranchId = environment.multiTenant.getCurrentBranchId();

  return useMutation({
    mutationFn: ({ id, feedbackData }) => feedbackService.updateFeedback(id, feedbackData, mockFeedbacks),
    onSuccess: (data, variables) => {
      if (data && variables.id) {
        queryClient.setQueryData(FEEDBACK_QUERY_KEYS.detail(variables.id, currentBranchId), data);
      }
      queryClient.invalidateQueries({ queryKey: FEEDBACK_QUERY_KEYS.list(currentBranchId) });
      message.success('Cập nhật đánh giá thành công!');
    },
    onError: (error) => {
      console.error('❌ Failed to update feedback:', error);
      message.error(error.message || 'Có lỗi xảy ra khi cập nhật đánh giá!');
    },
  });
};

/**
 * React Query mutation hook for deleting a feedback
 */
export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();
  const currentBranchId = environment.multiTenant.getCurrentBranchId();

  return useMutation({
    mutationFn: (feedbackId) => feedbackService.deleteFeedback(feedbackId, mockFeedbacks),
    onMutate: async (feedbackId) => {
      await queryClient.cancelQueries({ queryKey: FEEDBACK_QUERY_KEYS.list(currentBranchId) });
      const previousFeedbacks = queryClient.getQueryData(FEEDBACK_QUERY_KEYS.list(currentBranchId));
      if (previousFeedbacks) {
        queryClient.setQueryData(
          FEEDBACK_QUERY_KEYS.list(currentBranchId),
          previousFeedbacks.filter(feedback => feedback.id !== feedbackId)
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
      message.error(error.message || 'Không thể xóa đánh giá!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FEEDBACK_QUERY_KEYS.list(currentBranchId) });
    },
  });
};