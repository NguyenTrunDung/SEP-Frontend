import React, { useState } from 'react';
import { withPageWrapperV2 } from '../../../components/common/PageWrapperV2';
import FeedbacksTable from './FeedbackTable';
import ReplyFeedback from './ReplyFeedback';
import { useFeedbacks, useDeleteFeedback } from '../../../hooks/queries/useFeedback';
import { useAntModal } from '../../../hooks/useAntModal';
import { environment } from '../../../services/api/config';
import { feedbackService } from '../../../services/feedbackService';
import { message } from 'antd';

const FeedbacksPageContent = ({
  feedbacksData,
  loading,
  onDelete,
  onReply,
  replyModalProps,
  selectedFeedback,
  branchId,
}) => {
  if (environment.features?.enableLogging) {
    console.log('🔍 FeedbacksPageContent props:', { feedbacksData, loading, branchId });
  }

  return (
    <>
      <FeedbacksTable
        dataSource={feedbacksData}
        loading={loading}
        onDelete={onDelete}
        onReply={onReply}
        branchId={branchId}
      />
      <ReplyFeedback
        open={replyModalProps.open}
        onCancel={replyModalProps.handleCancel}
        onSubmit={replyModalProps.onSubmit}
        formData={selectedFeedback}
        branchId={branchId}
      />
    </>
  );
};

const FeedbacksPageWithWrapper = withPageWrapperV2(FeedbacksPageContent);

const Feedbacks = () => {
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';
  const { feedbacks, isLoading: feedbacksLoading, refetch } = useFeedbacks();
  const deleteFeedbackMutation = useDeleteFeedback();
  const { open: replyOpen, showModal: showReplyModal, handleCancel: handleReplyCancel } = useAntModal();
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  if (environment.features?.enableLogging) {
    console.log('🔍 Feedbacks component state:', { feedbacks, isLoading: feedbacksLoading, branchId });
  }

  const handleDelete = async (record) => {
    try {
      if (environment.features?.enableLogging) {
        console.log('🔍 Deleting feedback:', record.id);
      }
      await deleteFeedbackMutation.mutateAsync(record.id);
      message.success('Xóa đánh giá thành công');
    } catch (error) {
      if (environment.features?.enableLogging) {
        console.error('❌ Failed to delete feedback:', error);
      }
      message.error(error.response?.data?.message || 'Xóa đánh giá thất bại');
    }
  };

  const handleReply = (record) => {
    if (environment.features?.enableLogging) {
      console.log('🔍 Opening reply modal for feedback:', record);
    }
    setSelectedFeedback(record);
    showReplyModal();
  };

  const handleReplySubmit = async (formData) => {
    try {
      if (environment.features?.enableLogging) {
        console.log('🔍 Submitting reply:', formData);
      }
      await feedbackService.addReply(formData.id, { replyContent: formData.reply });
      handleReplyCancel();
      refetch();
      message.success('Phản hồi đã được lưu thành công!');
    } catch (error) {
      if (environment.features?.enableLogging) {
        console.error('❌ Failed to save reply:', error.message);
      }
      message.error(error.message || 'Gửi phản hồi thất bại');
      handleReplyCancel();
    }
  };

  const handleRefresh = () => {
    if (environment.features?.enableLogging) {
      console.log('🔍 Refreshing feedbacks');
    }
    refetch();
    message.success('Đã làm mới danh sách đánh giá');
  };

  const isLoading = feedbacksLoading || deleteFeedbackMutation.isPending;

  return (
    <FeedbacksPageWithWrapper
      title="Đánh Giá"
      onRefresh={handleRefresh}
      loading={isLoading}
      refreshButtonText="Làm mới"
      showAddButton={false}
      showRefreshButton={false}
      showSearch={false}
      feedbacksData={feedbacks}
      onDelete={handleDelete}
      onReply={handleReply}
      replyModalProps={{ open: replyOpen, handleCancel: handleReplyCancel, onSubmit: handleReplySubmit }}
      selectedFeedback={selectedFeedback}
      branchId={branchId}
    />
  );
};

export default Feedbacks;