import React, { useState } from 'react';
import { message } from 'antd';
import { withPageWrapperV2 } from '../../../components/common/PageWrapperV2';
import FeedbacksTable from './FeedbackTable';
import ReplyFeedback from './ReplyFeedback';
import { useFeedbacks, useDeleteFeedback } from '../../../hooks/queries/useFeedback';
import { useAntModal } from '../../../hooks/useAntModal';
import { feedbackService } from '../../../services/feedbackService';
import { mockFeedbacks } from '../../../mocks/mockFeedbacks'; 

const FeedbacksPageContent = ({
    feedbacksData,
    loading,
    onDelete,
    onReply,
    replyModalProps,
    selectedFeedback,
}) => {
    return (
        <>
            <FeedbacksTable
                dataSource={feedbacksData}
                loading={loading}
                onDelete={onDelete}
                onReply={onReply}
            />
            <ReplyFeedback
                open={replyModalProps.open}
                onCancel={replyModalProps.handleCancel}
                onSubmit={replyModalProps.onSubmit}
                formData={selectedFeedback}
            />
        </>
    );
};

const FeedbacksPageWithWrapper = withPageWrapperV2(FeedbacksPageContent);

const Feedbacks = () => {
    const { feedbacks, isLoading: feedbacksLoading, refetch } = useFeedbacks();
    const deleteFeedbackMutation = useDeleteFeedback();
    const { open: replyOpen, showModal: showReplyModal, handleCancel: handleReplyCancel } = useAntModal();
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    const handleDelete = async (record) => {
        try {
            await deleteFeedbackMutation.mutateAsync(record.id);
            message.success('Xóa đánh giá thành công');
        } catch (error) {
            console.error('Failed to delete feedback:', error);
            message.error('Xóa đánh giá thất bại');
        }
    };

    const handleReply = (record) => {
        setSelectedFeedback(record);
        showReplyModal();
    };

    const handleReplySubmit = async (formData) => {
        try {
            await feedbackService.replyFeedback(formData.id, { reply: formData.reply }, mockFeedbacks);
            handleReplyCancel();
            setSelectedFeedback(null);
            refetch();
        } catch (error) {
            console.error('Failed to save reply:', error);
            message.error('Gửi phản hồi thất bại');
        }
    };

    const handleRefresh = () => {
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
        />
    );
};

export default Feedbacks;