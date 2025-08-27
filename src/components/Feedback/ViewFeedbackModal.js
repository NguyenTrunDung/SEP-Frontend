import React from 'react';
import { Modal, Typography, Avatar, Rate, Popconfirm, Button } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { getImageUrlWithFallback } from '../../utils/imageUtils';
import { useTimezone } from '../../hooks/useTimezone';

const { Text } = Typography;

const ViewFeedbackModal = ({ visible, onClose, feedbacks, selectedOrder, onDelete, onEdit }) => {
  const { format } = useTimezone();
  const hasItems = selectedOrder && Array.isArray(selectedOrder.orderDetails) && selectedOrder.orderDetails.length > 0;

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
          Đánh giá đã lưu
        </div>

        <div style={{ padding: 'clamp(12px, 3vw, 16px)', background: '#fff' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(6px, 2vw, 8px)', marginBottom: 'clamp(12px, 3vw, 16px)' }}>
            {hasItems ? (
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

          {feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              style={{
                borderBottom: '1px solid #f0f0f0',
                padding: 'clamp(12px, 3vw, 16px) 0',
                position: 'relative',
              }}
            >
              <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 'clamp(8px, 2vw, 12px)' }}>
                <EditOutlined
                  onClick={() => onEdit(feedback)}
                  style={{ fontSize: 'clamp(16px, 4vw, 18px)', color: '#1677ff', cursor: 'pointer' }}
                />
                <Popconfirm
                  title="Bạn có chắc chắn muốn xoá đánh giá này?"
                  onConfirm={() => onDelete(feedback.id)}
                  okText="Xoá"
                  cancelText="Hủy"
                >
                  <DeleteOutlined style={{ fontSize: 'clamp(16px, 4vw, 18px)', color: '#ff4d4f', cursor: 'pointer' }} />
                </Popconfirm>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'clamp(6px, 2vw, 8px)' }}>
                <Avatar
                  size={Math.min(48, window.innerWidth * 0.12)} // Responsive avatar size
                  src={feedback.avatar}
                  icon={!feedback.avatar && <UserOutlined />}
                  style={{ marginRight: 'clamp(8px, 2vw, 12px)' }}
                />
                <Text strong style={{ fontSize: 'clamp(14px, 3.5vw, 16px)' }}>
                  {feedback.customerName || 'Ẩn danh'}
                </Text>
              </div>

              <div style={{ paddingLeft: 'clamp(40px, 12vw, 60px)' }}>
                <div style={{ marginBottom: 'clamp(6px, 2vw, 8px)' }}>
                  <Rate value={feedback.rating} disabled style={{ fontSize: 'clamp(12px, 3.5vw, 16px)', color: '#fadb14' }} />
                </div>
                <div style={{ marginBottom: 'clamp(6px, 2vw, 8px)' }}>
                  <Text style={{ fontSize: 'clamp(14px, 3.5vw, 16px)' }}>{feedback.content}</Text>
                </div>
                {feedback.reply && (
                  <div
                    style={{
                      marginBottom: 'clamp(6px, 2vw, 8px)',
                      background: '#f5f5f5',
                      padding: 'clamp(6px, 2vw, 8px)',
                      borderRadius: 'clamp(3px, 1vw, 4px)',
                    }}
                  >
                    <Text strong style={{ fontSize: 'clamp(14px, 3.5vw, 16px)' }}>Phản hồi: </Text>
                    <Text style={{ fontSize: 'clamp(14px, 3.5vw, 16px)' }}>{feedback.reply}</Text>
                  </div>
                )}
                <Text type="secondary" style={{ fontSize: 'clamp(12px, 3vw, 13px)' }}>
                  {new Date(feedback.timestamp).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default ViewFeedbackModal;