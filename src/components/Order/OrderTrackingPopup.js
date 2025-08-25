import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Table, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useOrders } from '../../hooks/queries/useOrders';
import { orderService } from '../../services/orderService';
import { formatAmount, formatDateTime } from '../../mocks/orderTrackingData';
import './Order.css';
import { useTimezone } from '../../hooks/useTimezone';

const { Text } = Typography;

const OrderTrackingPopup = ({ visible, onClose }) => {
  const { format } = useTimezone();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  const { orders, isLoading, isError, error: queryError, refetch } = useOrders(
    null, // branchId (null will use default branch)
    { customerPhone: phoneNumber },
    phoneNumber,
    { enabled: false } // Disable auto-fetch
  );

  useEffect(() => {
    if (visible && phoneNumber) {
      handleSearch();
    }
  }, [visible, phoneNumber]);

  const handleSearch = async () => {
    if (phoneNumber) {
      try {
        setError(null);
        await refetch();

        // Fetch order details for the first matching order
        if (orders && orders.length > 0) {
          const orderWithDetails = await orderService.getOrderDetails(orders[0].id);
          const detailedOrder = {
            ...orders[0],
            total: orders[0].total ?? 0, // Fallback to 0 if total is null
            items: orderWithDetails.data.map(item => ({
              id: item.foodId || item.id,
              name: item.foodName,
              quantity: item.Qty,
              subtotal: item.total ?? 0, // Fallback to 0 if subtotal is null
            })),
          };
          console.log('Detailed Order:', detailedOrder); // Debug log
          setOrder(detailedOrder);
        } else {
          setOrder(null);
          setError('Không tìm thấy đơn hàng');
        }
      } catch (err) {
        setOrder(null);
        setError('Có lỗi xảy ra khi tra cứu đơn hàng');
        console.error('Search error:', err);
      }
    }
  };

  // Map order status to Vietnamese text
  const getOrderStatusText = (status) => {
    switch (status) {
      case 'Pending':
        return 'Chưa xử lý';
      case 'Confirmed':
        return 'Đang xử lý';
      case 'Delivered':
        return 'Đang giao hàng';
      case 'Completed':
        return 'Hoàn thành';
      case 'Cancelled':
        return 'Đã hủy';
      case 'PendingPayment':
        return 'Chờ thanh toán';
      default:
        return status || 'Không xác định';
    }
  };

  // Map payment status to Vietnamese text
  const getPaymentStatusText = (paymentStatus) => {
    switch (paymentStatus) {
      case 'PAID':
      case true:
        return 'Đã thanh toán';
      case 'NOT_PAID':
      case false:
        return 'Chưa thanh toán';
      default:
        return paymentStatus || 'Không xác định';
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
      render: (text) => (text != null ? formatAmount(text) : 'N/A'),
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
                height: 36,
                lineHeight: '36px',
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
            loading={isLoading}
          />
        </div>

        {/* Order info */}
        {isLoading && <div style={{ textAlign: 'center' }}>Đang tải...</div>}
        {(error || isError) && <Text type="danger">{error || queryError?.message || 'Có lỗi xảy ra'}</Text>}

        {order && (
          <>
            <Text style={{ display: 'block', marginBottom: 4 }}>
              Thời gian đặt: <b>{format.dateTime(order.orderDate || order.createdAt, 'DD/MM/YYYY HH:mm')}</b>
            </Text>
            <Text style={{ display: 'block', marginBottom: 4 }}>
              Thời gian hẹn giao: <b>{format.dateTime(order.receiveDate || order.updatedAt, 'DD/MM/YYYY HH:mm')}</b>
            </Text>
            <Text style={{ display: 'block', marginBottom: 4 }}>
              Tổng thanh toán: <b>{order.total != null ? formatAmount(order.total) : 'N/A'}</b>
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4, gap: 8 }}>
              <Text style={{ marginBottom: 0 }}>
                Trạng thái thanh toán: <b>{getPaymentStatusText(order.isPaid)}</b>
              </Text>
              {order.isPaid === false && (
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