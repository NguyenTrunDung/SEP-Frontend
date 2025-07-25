import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, message } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import PropTypes from 'prop-types';

const ReplyFeedback = ({ open, onCancel, onSubmit, formData }) => {
  const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm(formData || {});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && formData) {
      form.setFieldsValue({
        id: formData.id,
        reply: formData.reply || '',
      });
    } else if (!open) {
      resetForm();
    }
  }, [open, formData, form, resetForm]);

  const handleFormSubmit = async (values) => {
    setIsLoading(true);
    try {
      await handleSubmit(async (formData) => {
        if (onSubmit) {
          await onSubmit(formData);
          message.success('Phản hồi đã được lưu thành công!'); // Thêm thông báo thành công
        }
      });
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu phản hồi!');
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
      onCancel={onCancel}
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
            onClick={onCancel}
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
        <div className="custom-floating">
          <label className="floating-label">Phản hồi</label>
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
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
  formData: PropTypes.object,
};

export default ReplyFeedback;