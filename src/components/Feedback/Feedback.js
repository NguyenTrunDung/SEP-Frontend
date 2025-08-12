import React from 'react';
import { Modal, Typography, Button, Form, Rate, Input, message } from 'antd';
import { getImageUrlWithFallback } from '../../utils/imageUtils';
import { environment } from '../../services/api/config';

const { Text } = Typography;
const { TextArea } = Input;

const FeedbackModal = ({ visible, onClose, selectedOrder, onSubmit }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    if (!values.rating || !values.content) {
      console.error('Missing rating or content:', values);
      message.error('Vui lòng nhập đầy đủ số sao và nhận xét.');
      return;
    }

    if (!selectedOrder?.id || !selectedOrder?.branchId) {
      console.error('Missing orderId or branchId:', { orderId: selectedOrder?.id, branchId: selectedOrder?.branchId });
      message.error('Thiếu thông tin đơn hàng để gửi đánh giá.');
      return;
    }

    if (environment.features?.enableLogging) {
      console.log('🔍 Submitting feedback from FeedbackModal:', values);
    }

    if (typeof onSubmit === 'function') {
      onSubmit(values);
    } else {
      console.error('onSubmit is not a function:', onSubmit);
      message.error('Lỗi hệ thống khi gửi đánh giá.');
    }
    form.resetFields();
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
            Đánh giá đơn hàng
          </div>
          <div style={{ padding: '16px', background: '#fff' }}>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Array.isArray(selectedOrder.orderDetails) && selectedOrder.orderDetails.length > 0 ? (
                  selectedOrder.orderDetails.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img
                        src={getImageUrlWithFallback(item.imageUrl, '/images/com.jpg', process.env.NODE_ENV === 'production')}
                        alt={item.foodName || 'Món ăn'}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                      <Text style={{ fontWeight: 500 }}>{item.foodName || 'Không xác định'}</Text>
                    </div>
                  ))
                ) : (
                  <Text style={{ fontWeight: 500 }}>Không có món ăn</Text>
                )}
              </div>
            </div>

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
                  Gửi đánh giá
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default FeedbackModal;