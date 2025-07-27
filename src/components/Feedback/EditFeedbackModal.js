import React, { useEffect } from 'react';
import { Modal, Typography, Button, Form, Rate, Input } from 'antd';

const { Text } = Typography;
const { TextArea } = Input;

const EditFeedbackModal = ({ visible, onClose, selectedOrder, feedback, onUpdate }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (feedback) {
      form.setFieldsValue({
        rating: feedback.rating,
        content: feedback.content,
        reply: feedback.reply || '',
      });
    }
  }, [feedback, form]);

  const handleSubmit = async (values) => {
    if (!feedback?.id || !selectedOrder?.branchId) {
      console.error('Missing feedback id or branchId:', { feedback, selectedOrder });
      return;
    }

    const updatedFeedback = {
      id: feedback.id,
      star: values.rating,
      commentLines: values.content,
      orderId: feedback.orderId,
      branchId: feedback.branchId,
      userId: feedback.userId,
      images: feedback.images || [],
      reply: values.reply || null,
    };

    if (typeof onUpdate === 'function') {
      await onUpdate(updatedFeedback);
      form.resetFields();
    } else {
      console.error('onUpdate is not a function:', onUpdate);
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