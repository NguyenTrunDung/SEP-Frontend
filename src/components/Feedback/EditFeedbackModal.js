import React, { useEffect } from 'react';
import { Modal, Typography, Button, Form, Rate, Input, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

const EditFeedbackModal = ({ visible, onClose, selectedOrder, feedback, onUpdate }) => {
  const [form] = Form.useForm();

  const uploadProps = {
    beforeUpload: () => false,
    multiple: true,
    accept: 'image/*',
    maxCount: 5,
    listType: 'picture',
  };

  useEffect(() => {
    if (feedback) {
      form.setFieldsValue({
        rating: feedback.rating,
        comment: feedback.comment,
        images: (feedback.images || []).map((img, idx) => ({
          uid: `${idx}`,
          name: `image-${idx}`,
          status: 'done',
          url: img.url,
        })),
      });
    }
  }, [feedback, form]);

  const handleSubmit = (values) => {
    const updated = {
      ...feedback,
      rating: values.rating,
      comment: values.comment,
      images: values.images.map(file => ({
        url: file.url || URL.createObjectURL(file.originFileObj),
      })),
      timestamp: feedback.timestamp,
    };

    onUpdate(updated);
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
                name="comment"
                label="Nhận xét"
                rules={[{ required: true, message: 'Vui lòng nhập nhận xét!' }]}
              >
                <TextArea rows={4} placeholder="Nhập nhận xét của bạn" />
              </Form.Item>

              <Form.Item
                name="images"
                label="Tải lên hình ảnh (tối đa 5)"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
              >
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
                </Upload>
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
