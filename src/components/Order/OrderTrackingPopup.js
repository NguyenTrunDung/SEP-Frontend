import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Table, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { mockOrders, formatAmount, formatDateTime } from '../../mocks/orderTrackingData';
import './Order.css';

const { Text } = Typography;

const OrderTrackingPopup = ({ visible, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible && phoneNumber) {
      handleSearch();
    }
  }, [visible]);

  const handleSearch = () => {
    if (phoneNumber) {
      setLoading(true);
      setTimeout(() => {
        const foundOrder = mockOrders.find(order => order.phone === phoneNumber);
        if (foundOrder) {
          setOrder(foundOrder);
          setError(null);
        } else {
          setOrder(null);
          setError('Không tìm thấy đơn hàng');
        }
        setLoading(false);
      }, 500);
    }
  };

  // Map order status to Vietnamese text
  const getOrderStatusText = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'Đã giao hàng';
      case 'READY':
        return 'Sẵn sàng';
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // Map payment status to Vietnamese text
  const getPaymentStatusText = (paymentStatus) => {
    switch (paymentStatus) {
      case 'PAID':
        return 'Đã thanh toán';
      case 'NOT_PAID':
        return 'Chưa thanh toán';
      default:
        return paymentStatus;
    }
  };

  const columns = [
    {
      title: <div style={{ textAlign: 'center', width: '100%' }}>Món ăn</div>,
      dataIndex: 'name',
      key: 'name',

    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
    },
    {
      title: <div style={{ textAlign: 'center', width: '100%' }}>Thành tiền</div>,
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'right',
      render: (text) => formatAmount(text),
    },
  ];

  const dataSource = order?.items.map(item => ({
    key: item.id,
    name: item.name,
    quantity: item.quantity,
    subtotal: item.subtotal,
  })) || [];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      closeIcon={<span style={{ color: '#000', fontSize: '26px' }}>×</span>}
      styles={{
        content: {
          padding: 0,
          background: '#fff',
          borderRadius: 0,
          height: '100vh',
        },
        body: {
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100vh',
        },
      }}
    >
      {/* Header */}
      <div style={{ borderRadius: '8px 8px 0 0', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            backgroundColor: '#b4c80f',
            color: '#000',
            padding: '12px 16px',
            fontSize: '23px',
            textAlign: 'left',
          }}
        >
          Tra cứu đơn hàng
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 20, background: '#fff' }}>
        {/* Search */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div className="custom-floating" style={{ flex: 1 }}>
            <Input
              placeholder="Số điện thoại"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="input-label"
              style={{
                height: 36, // giảm chiều cao tại đây
                lineHeight: '36px', // giúp text căn giữa
                fontSize: 14,
              }}
            />
            <label className="floating-label">Số điện thoại</label>
          </div>

          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            style={{
              background: '#17A2B8',
              borderColor: '#17A2B8',
              width: 35,
              height: 35,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          />

        </div>

        {/* Order info */}
        {loading && <div style={{ textAlign: 'center' }}>Đang tải...</div>}
        {error && <Text type="danger">{error}</Text>}

        {order && (
          <>
            <Text style={{ display: 'block', marginBottom: 4 }}>
              Thời gian đặt: <b>{formatDateTime(new Date(order.createdAt))}</b>
            </Text>
            <Text style={{ display: 'block', marginBottom: 4 }}>
              Thời gian hẹn giao: <b>{formatDateTime(new Date(order.updatedAt))}</b>
            </Text>
            <Text style={{ display: 'block', marginBottom: 4 }}>
              Tổng thanh toán: <b>{formatAmount(order.total)}</b>
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4, gap: 8 }}>
              <Text style={{ marginBottom: 0 }}>
                Trạng thái thanh toán: <b>{getPaymentStatusText(order.paymentStatus)}</b>
              </Text>
              {order.paymentStatus === 'NOT_PAID' && (
                <Button
                  style={{
                    background: '#17A2B8',
                    borderColor: '#17A2B8',
                    color: '#fff',
                    padding: '0 12px',
                    height: 32,
                    borderRadius: 6,
                  }}
                >
                  Thanh Toán
                </Button>
              )}
            </div>
            <Text style={{ display: 'block', marginBottom: 12 }}>
              Trạng thái đơn hàng: <b>{getOrderStatusText(order.status)}</b>
            </Text>
            <Text style={{ display: 'block', marginBottom: 12 }}>
              Chi tiết:
            </Text>

            {/* Table */}
            <Table
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              bordered
              size="middle"
              style={{ borderRadius: 8 }}
            />
          </>
        )}
      </div>
    </Modal>
  );
};

export default OrderTrackingPopup;