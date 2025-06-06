import React, { useState, useEffect } from 'react';
import { Modal, Typography, Spin, Alert, Table, message } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { getOrders } from '../../services/mockOrderService';
import { ROLES } from '../../constants/roles';

const { Text } = Typography;

const OrderHistoryModal = ({ visible, onClose }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!visible || !user) return;

      if (user.role !== ROLES.NURSE) {
        message.error('Chỉ điều dưỡng mới có thể xem lịch sử đơn hàng.');
        setError('Chỉ điều dưỡng mới có thể xem lịch sử đơn hàng.');
        return;
      }

      setLoading(true);
      try {
        const userOrders = await getOrders({ userId: user.id });
        setOrders(userOrders);
        setError(null);
      } catch (err) {
        setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại.');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, visible]);

  const columns = [
    {
      title: 'Món ăn',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Thành tiền',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (subtotal) => `${subtotal.toLocaleString('vi-VN')}đ`,
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Đơn hàng đã đặt
        </div>
        <div style={{ padding: '16px', background: '#fff', maxHeight: '70vh', overflowY: 'auto' }}>
          {loading ? (
            <Spin style={{ display: 'block', textAlign: 'center', padding: '20px' }} />
          ) : error ? (
            <Alert message={error} type="error" showIcon style={{ marginBottom: '16px' }} />
          ) : orders.length === 0 ? (
            <Text>Chưa có đơn hàng nào.</Text>
          ) : (
            orders.map((order, index) => (
              <div
                key={order.id}
                style={{
                  border: '1px solid #e8e8e8',
                  borderRadius: '4px',
                  padding: '12px',
                  marginBottom: index < orders.length - 1 ? '16px' : 0,
                  backgroundColor: '#fff',
                }}
              >
                <div style={{ display: 'block', fontSize: '13px', marginBottom: '2px' }}>
                  <Text style={{ fontWeight: 400 }}>Thời gian đặt: </Text>
                  <Text style={{ fontWeight: 500 }}>
                    {new Date(order.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </div>
                <div style={{ display: 'block', fontSize: '13px', marginBottom: '2px' }}>
                  <Text style={{ fontWeight: 400 }}>Thời gian hẹn giao: </Text>
                  <Text style={{ fontWeight: 500 }}>
                    {new Date(order.updatedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </div>
                <div style={{ display: 'block', fontSize: '13px', marginBottom: '2px' }}>
                  <Text style={{ fontWeight: 400 }}>Tổng thanh toán: </Text>
                  <Text style={{ fontWeight: 700 }}>
                    {order.total.toLocaleString('vi-VN')}đ
                  </Text>
                </div>
                <div style={{ display: 'block', fontSize: '13px', marginBottom: '2px' }}>
                  <Text style={{ fontWeight: 400 }}>Trạng thái đơn hàng: </Text>
                  <Text style={{ fontWeight: 500 }}>
                    {order.status === 'DELIVERED' ? 'Đã hoàn tất' : 'Đang giao hàng'}
                  </Text>
                </div>
                <Text style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                  Chi tiết:
                </Text>
                <Table
                  columns={columns}
                  dataSource={order.items}
                  pagination={false}
                  rowKey="menuItemId"
                  size="small"
                  bordered
                  style={{ marginTop: '8px' }}
                  headStyle={{ backgroundColor: '#f0f0f0', fontWeight: 500 }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default OrderHistoryModal;