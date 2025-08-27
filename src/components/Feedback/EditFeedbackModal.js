import React, { useEffect } from 'react';
import { Modal, Typography, Button, Form, Rate, Input, message } from 'antd';
import { environment } from '../../services/api/config';
import { getImageUrlWithFallback } from '../../utils/imageUtils';

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
      // Responsive width: 90% of viewport width, max 500px
      width="90vw"
      style={{ maxWidth: '500px' }}
      closeIcon={<span style={{ color: '#000', fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 400 }}>×</span>}
      styles={{
        content: { padding: 0, borderRadius: 'clamp(6px, 2vw, 8px)' },
        body: { padding: 0 },
        header: { display: 'none' },
      }}
    >
      {selectedOrder && (
        <div style={{ borderRadius: 'clamp(6px, 2vw, 8px)', overflow: 'hidden' }}>
          <div
            style={{
              backgroundColor: '#b4c80f',
              color: '#000',
              padding: 'clamp(8px, 3vw, 12px) clamp(12px, 4vw, 20px)',
              fontSize: 'clamp(16px, 4vw, 18px)',
              fontWeight: 400,
            }}
          >
            Chỉnh sửa đánh giá
          </div>
          <div style={{ padding: 'clamp(12px, 3vw, 16px)', background: '#fff' }}>
            <div style={{ marginBottom: 'clamp(6px, 2vw, 8px)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(6px, 2vw, 8px)' }}>
                {Array.isArray(selectedOrder.orderDetails) && selectedOrder.orderDetails.length > 0 ? (
                  selectedOrder.orderDetails.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 2vw, 8px)', maxWidth: '100%' }}>
                      <img
                        src={getImageUrlWithFallback(item.imageUrl, '/images/com.jpg', process.env.NODE_ENV === 'production')}
                        alt={item.foodName || 'Món ăn'}
                        style={{
                          width: 'clamp(60px, 20vw, 80px)',
                          height: 'clamp(60px, 20vw, 80px)',
                          objectFit: 'cover',
                          borderRadius: 'clamp(4px, 1.5vw, 6px)',
                        }}
                      />
                      <Text style={{ fontWeight: 500, fontSize: 'clamp(14px, 3.5vw, 16px)' }}>
                        {item.foodName || 'Không xác định'}
                      </Text>
                    </div>
                  ))
                ) : (
                  <Text style={{ fontWeight: 500, fontSize: 'clamp(14px, 3.5vw, 16px)' }}>Không có món ăn</Text>
                )}
              </div>
            </div>

            <Form form={form} onFinish={handleSubmit} layout="vertical">
              <Form.Item
                name="rating"
                label="Đánh giá chất lượng"
                rules={[{ required: true, message: 'Vui lòng chọn số sao đánh giá!' }]}
              >
                <Rate style={{ fontSize: 'clamp(14px, 4vw, 16px)' }} />
              </Form.Item>

              <Form.Item
                name="content"
                label="Nhận xét"
                rules={[{ required: true, message: 'Vui lòng nhập nhận xét!' }]}
              >
                <TextArea rows={4} placeholder="Nhập nhận xét của bạn" style={{ fontSize: 'clamp(14px, 3.5vw, 16px)' }} />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    backgroundColor: '#b4c80f',
                    borderColor: '#b4c80f',
                    color: '#000',
                    fontSize: 'clamp(14px, 3.5vw, 16px)',
                    padding: 'clamp(6px, 2vw, 8px) clamp(12px, 4vw, 16px)',
                  }}
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