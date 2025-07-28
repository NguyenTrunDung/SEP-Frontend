import React, { useEffect } from 'react';
import { Modal, Typography, Button, Form, Rate, Input, message } from 'antd';
import { environment } from '../../services/api/config';

const { Text } = Typography;
const { TextArea } = Input;

const EditFeedbackModal = ({ visible, onClose, selectedOrder, feedback, onUpdate }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (feedback) {
      form.setFieldsValue({
        rating: feedback.rating || 0,
        content: feedback.content || '',
      });
      if (environment.features?.enableLogging) {
        console.log('🔍 Setting form values:', { rating: feedback.rating || 0, content: feedback.content || '' });
      }
    }
  }, [feedback, form]);

  const handleSubmit = async (values) => {
    if (!feedback?.id) {
      console.error('Missing feedback ID:', feedback);
      message.error('Thiếu ID đánh giá để cập nhật.');
      return;
    }

    if (!values.rating || !values.content) {
      console.error('Missing rating or content:', values);
      message.error('Vui lòng nhập đầy đủ số sao và nhận xét.');
      return;
    }

    const updatedFeedback = {
      id: feedback.id,
      rating: values.rating,
      content: values.content,
      reply: feedback.reply || null,
    };

    if (environment.features?.enableLogging) {
      console.log('🔍 Submitting updated feedback:', updatedFeedback);
    }

    if (typeof onUpdate === 'function') {
      await onUpdate(updatedFeedback);
      form.resetFields();
    } else {
      console.error('onUpdate is not a function:', onUpdate);
      message.error('Lỗi hệ thống khi cập nhật đánh giá.');
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={500}
      closeIcon={<span style={{ color: '#000', fontSize: '26px', fontWeight: 400 }}>×</span>}
      styles={{
        content: { padding: 0, borderRadius: 8 },
        body: { padding: 0 },
        header: { display: 'none' },
      }}
    >
      {selectedOrder && (
        <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
          <div
            style={{
              backgroundColor: '#b4c80f',
              color: '#000',
              padding: '12px 20px',
              fontSize: '18px',
              fontWeight: 400,
            }}
          >
            Chỉnh sửa đánh giá
          </div>
          <div style={{ padding: '16px', background: '#fff' }}>
            <Form form={form} onFinish={handleSubmit} layout="vertical">
              <Form.Item
                name="rating"
                label="Đánh giá chất lượng"
                rules={[{ required: true, message: 'Vui lòng chọn số sao đánh giá!' }]}
              >
                <Rate />
              </Form.Item>

              <Form.Item
                name="content"
                label="Nhận xét"
                rules={[{ required: true, message: 'Vui lòng nhập nhận xét!' }]}
              >
                <TextArea rows={4} placeholder="Nhập nhận xét của bạn" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ backgroundColor: '#b4c80f', borderColor: '#b4c80f', color: '#000' }}
                >
                  Cập nhật đánh giá
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default EditFeedbackModal;