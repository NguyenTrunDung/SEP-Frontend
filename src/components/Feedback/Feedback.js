import React from 'react';
import { Modal, Typography, Button, Form, Rate, Input, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getImageUrlWithFallback } from '../../utils/imageUtils';

const { Text } = Typography;
const { TextArea } = Input;

const FeedbackModal = ({ visible, onClose, selectedOrder, onSubmit }) => {
  const [form] = Form.useForm();

  const uploadProps = {
    beforeUpload: () => false,
    multiple: true,
    accept: 'image/*',
    maxCount: 5,
  };

  const handleSubmit = (values) => {
    const feedback = {
      rating: values.rating,
      comment: values.comment,
      images: values.images ? values.images.fileList.map(file => ({
        url: URL.createObjectURL(file.originFileObj),
      })) : [],
      timestamp: new Date().toISOString(),
    };

    onSubmit(feedback);
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
                {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img
                        src={getImageUrlWithFallback(item.imageUrl || item.image, '/images/placeholder-food.png')}
                        alt={item.name || item.foodName || 'Món ăn'}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                      <Text style={{ fontWeight: 500 }}>{item.name || item.foodName || 'Không xác định'}</Text>
                    </div>
                  ))
                ) : (
                  <Text style={{ fontWeight: 500 }}>Không có món ăn</Text>
                )}
              </div>
            </div>

            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
            >
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
                <Upload {...uploadProps} listType="picture">
                  <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
                </Upload>
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
