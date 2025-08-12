import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import PropTypes from 'prop-types';
import { environment } from '../../../services/api/config';

const ReplyFeedback = ({ open, onCancel, onSubmit, formData, branchId }) => {
  const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm(formData || {});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && formData) {
      if (environment.features?.enableLogging) {
        console.log('🔍 Setting form data for ReplyFeedback:', formData);
      }
      form.setFieldsValue({
        id: formData.id,
        reply: formData.reply || '',
        rating: formData.rating,
        content: formData.content,
        userId: formData.userId,
        customerName: formData.customerName || 'Không xác định',
        orderId: formData.orderId,
        branchId: formData.branchId,
      });
    } else if (!open) {
      resetForm();
    }
  }, [open, formData, form, resetForm]);

  const handleFormSubmit = async () => {
    setIsLoading(true);
    try {
      await handleSubmit(async (formData) => {
        if (environment.features?.enableLogging) {
          console.log('🔍 Submitting reply feedback:', formData);
        }
        if (!formData.reply || formData.reply.trim() === '') {
          throw new Error('Phản hồi không được để trống!');
        }
        const updatedFeedback = {
          id: formData.id,
          replyContent: formData.reply.trim(),
        };
        if (onSubmit) {
          await onSubmit(updatedFeedback);
        }
      });
    } catch (error) {
      if (environment.features?.enableLogging) {
        console.error('❌ Failed to submit reply:', error.message);
      }
      window.alert(error.message || 'Có lỗi xảy ra khi lưu phản hồi!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    if (onCancel) onCancel();
  };

  return (
    <ReusableModal
      title={<span style={{ fontSize: '30px' }}>Phản hồi đánh giá</span>}
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
      closable={false}
    >
      <div style={{ position: 'absolute', top: 16, right: 24, zIndex: 1 }}>
        <Space>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={isLoading}
            style={{
              backgroundColor: '#52c41a',
              border: 'none',
              minWidth: 64,
              height: 32,
              fontSize: 14,
            }}
          >
            Lưu
          </Button>
          <Button
            onClick={handleCancel}
            style={{
              backgroundColor: '#ff4d4f',
              color: '#fff',
              border: 'none',
              minWidth: 64,
              height: 32,
              fontSize: 14,
            }}
          >
            X
          </Button>
        </Space>
      </div>
      <ReusableForm
        form={form}
        onFinish={handleFormSubmit}
        layout="vertical"
        className={formLoading ? 'form-loading' : ''}
      >
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="userId" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="orderId" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="branchId" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="rating" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="content" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="customerName" hidden>
          <Input />
        </Form.Item>
        <div className="custom-floating">
          <label className="floating-label">Phản hồi</label>
          <Form.Item
            name="reply"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung phản hồi!' }]}
            style={{ marginBottom: 0 }}
          >
            <Input.TextArea placeholder="Nhập nội dung phản hồi" rows={4} />
          </Form.Item>
        </div>
      </ReusableForm>
    </ReusableModal>
  );
};

ReplyFeedback.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    userId: PropTypes.string,
    customerName: PropTypes.string,
    orderId: PropTypes.number,
    branchId: PropTypes.number,
    rating: PropTypes.number,
    content: PropTypes.string,
    reply: PropTypes.string,
  }),
  branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ReplyFeedback;