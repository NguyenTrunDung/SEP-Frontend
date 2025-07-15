import React from 'react';
import { Modal, Typography, Rate, Avatar, Popconfirm } from 'antd';
import { getImageUrlWithFallback } from '../../utils/imageUtils';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ViewFeedbackModal = ({ visible, onClose, feedbacks, selectedOrder, onDelete, onEdit }) => {
    const hasItems =
        selectedOrder && Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0;


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
                    Đánh giá đã lưu
                </div>

                <div style={{ padding: '16px', background: '#fff' }}>
                    {/* Danh sách món ăn */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: 16 }}>
                        {hasItems ? (
                            selectedOrder.items.map((item, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <img
                                        src={getImageUrlWithFallback(
                                            item.imageUrl || item.image,
                                            '/images/placeholder-food.png'
                                        )}
                                        alt={item.name || item.foodName || 'Món ăn'}
                                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                                    />
                                    <Text style={{ fontWeight: 500 }}>
                                        {item.name || item.foodName || 'Không xác định'}
                                    </Text>
                                </div>
                            ))
                        ) : (
                            <Text style={{ fontWeight: 500 }}>Không có món ăn</Text>
                        )}
                    </div>

                    {/* Danh sách đánh giá */}
                    {feedbacks.map((feedback) => (
                        <div
                            key={feedback.id}
                            style={{
                                borderBottom: '1px solid #f0f0f0',
                                padding: '16px 0',
                                position: 'relative',
                            }}
                        >
                            {/* Icon Edit/Delete */}
                            <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 12 }}>
                                <EditOutlined
                                    onClick={() => onEdit(feedback)}
                                    style={{ fontSize: 18, color: '#1677ff', cursor: 'pointer' }}
                                />

                                <Popconfirm
                                    title="Bạn có chắc chắn muốn xoá đánh giá này?"
                                    onConfirm={() => onDelete(feedback.id)}
                                    okText="Xoá"
                                    cancelText="Hủy"
                                >
                                    <DeleteOutlined
                                        style={{ fontSize: 18, color: '#ff4d4f', cursor: 'pointer' }}
                                    />
                                </Popconfirm>
                            </div>

                            {/* Avatar + Customer Name */}
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                <Avatar
                                    size={48}
                                    src={feedback.user?.avatar}
                                    icon={!feedback.user?.avatar && <UserOutlined />}
                                    style={{ marginRight: 12 }}
                                />
                                <Text strong>{feedback.user?.customerName || 'Ẩn danh'}</Text>
                            </div>

                            {/* Nội dung đánh giá */}
                            <div style={{ paddingLeft: 60 }}>
                                <div style={{ marginBottom: 8 }}>
                                    <Rate
                                        value={feedback.rating}
                                        disabled
                                        style={{ fontSize: 16, color: '#fadb14' }}
                                    />
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    <Text>{feedback.comment}</Text>
                                </div>
                                {Array.isArray(feedback.images) && feedback.images.length > 0 && (
                                    <div style={{ marginBottom: 8 }}>
                                        <img
                                            src={feedback.images[0].url}
                                            alt="Feedback"
                                            style={{
                                                width: 160,
                                                height: 160,
                                                objectFit: 'cover',
                                                border: '1px solid #ddd',
                                                borderRadius: 4,
                                            }}
                                        />
                                    </div>
                                )}
                                <Text type="secondary" style={{ fontSize: 13 }}>
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
