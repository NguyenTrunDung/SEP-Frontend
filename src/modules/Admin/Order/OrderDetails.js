import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Table, Spin, Button } from 'antd';
import { orderService } from '../../../services/orderService';
import { environment } from '../../../services/api/config';

const ViewOrderDetail = ({ open, onCancel, orderData, branchId }) => {
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderData?.id) {
      setLoading(true);
      orderService.getOrderDetails(orderData.id)
        .then(response => {
          setOrderDetails(response.data || []);
          if (environment.features.enableLogging) {
            console.log(`✅ Fetched order details for order ${orderData.id}:`, response.data);
          }
        })
        .catch(error => {
          console.error('❌ Failed to fetch order details:', error);
          setOrderDetails([]);
        })
        .finally(() => setLoading(false));
    }
  }, [orderData]);

  const columns = [
    { title: 'Mã món', dataIndex: 'foodId', key: 'foodId', render: (text) => text || 'N/A' },
    { title: 'Số lượng', dataIndex: 'qty', key: 'qty', render: (text) => text || 'N/A' },
    { title: 'Giá', dataIndex: 'price', key: 'price', render: (price) => (price != null ? price.toLocaleString() + ' VNĐ' : 'N/A') },
    { title: 'Tổng', dataIndex: 'total', key: 'total', render: (total) => (total != null ? total.toLocaleString() + ' VNĐ' : 'N/A') },
    { title: 'Ghi chú', dataIndex: 'note', key: 'note', render: (text) => text || 'N/A' },
  ];

  return (
    <Modal
      title={`Chi tiết đơn hàng #${orderData?.id || 'N/A'}`}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
      width={800}
    >
      {orderData ? (
        <Spin spinning={loading}>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Mã đơn">{orderData.id || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Tên khách hàng">{orderData.customerName || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{orderData.customerPhone || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Ngày đặt">
              {orderData.orderDate ? new Date(orderData.orderDate).toLocaleDateString('vi-VN') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {{
                pending: 'Đang chờ',
                confirmed: 'Đã xác nhận',
                completed: 'Hoàn thành',
                cancelled: 'Hủy',
              }[orderData.status] || orderData.status || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              {orderData.total != null ? orderData.total.toLocaleString() + ' VNĐ' : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức thanh toán">
              {orderData.paymentMethod || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">{orderData.note || 'N/A'}</Descriptions.Item>
          </Descriptions>
          <h4 style={{ marginTop: 16 }}>Chi tiết món</h4>
          <Table
            columns={columns}
            dataSource={orderDetails.map(item => ({ ...item, key: item.id || item.foodId }))}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: 'Không có chi tiết món' }}
          />
        </Spin>
      ) : (
        <p>Không có dữ liệu đơn hàng để hiển thị.</p>
      )}
    </Modal>
  );
};

export default ViewOrderDetail;