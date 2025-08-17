import React, { useEffect, useState } from 'react';
import { Modal, Input, Button, Table, Switch, Row, Col, DatePicker, TimePicker, message, Spin } from 'antd';
import moment from 'moment';
import { useUpdateOrder } from '../../../hooks/queries/useOrders';

const ViewOrderDetail = ({ open, onCancel, orderData = {}, orderDetails = [], branchId, onStatusChange }) => {
  const [formData, setFormData] = useState({});
  const { mutate: updateOrder, isLoading: isUpdating } = useUpdateOrder();

  // Normalize paymentMethod to string
  const normalizePaymentMethod = (paymentMethod) => {
    const numberToStringMap = {
      '1': 'Wallet',
      '2': 'VNPay',
      '3': 'Miễn phí',
    };
    return numberToStringMap[paymentMethod?.toString()] || paymentMethod || 'Wallet';
  };

  // Normalize receiveType to display string
  const normalizeReceiveType = (receiveType) => {
    const receiveTypeMap = {
      'take': 'Tự đến lấy',
      'delivery': 'Giao hàng',
    };
    return receiveTypeMap[receiveType] || receiveType || 'Giao hàng';
  };

  // Normalize status to display string
  const normalizeStatus = (status) => {
    const statusMap = {
      'pending': 'Đang chờ',
      'Pending': 'Đang chờ',
      'confirmed': 'Đã xác nhận',
      'Confirmed': 'Đã xác nhận',
      'delivered': 'Đang giao hàng',
      'Delivered': 'Đang giao hàng',
      'completed': 'Hoàn thành',
      'Completed': 'Hoàn thành',
      'cancelled': 'Hủy',
      'Cancelled': 'Hủy',
      'PendingPayment': 'Chờ thanh toán',
    };
    return statusMap[status] || status || 'Đang chờ';
  };

  // Helper function to safely parse Vietnamese time strings
  const safeParseVietnameseTime = (timeString) => {
    if (!timeString) return null;

    // If it's already a valid time format (HH:mm), use it directly
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(timeString)) {
      return moment(timeString, 'HH:mm');
    }

    // Handle Vietnamese time strings like "30 phút", "1 giờ", etc.
    if (typeof timeString === 'string') {
      const numberMatch = timeString.match(/(\d+)/);
      if (numberMatch) {
        const number = parseInt(numberMatch[1]);

        // Handle "phút" (minutes)
        if (timeString.includes('phút')) {
          const hours = Math.floor(number / 60);
          const minutes = number % 60;
          return moment(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`, 'HH:mm');
        }

        // Handle "giờ" (hours)
        if (timeString.includes('giờ')) {
          return moment(`${number.toString().padStart(2, '0')}:00`, 'HH:mm');
        }
      }
    }

    try {
      const parsed = moment(timeString, ['HH:mm', 'H:mm', 'HH:mm:ss', 'H:mm:ss']);
      if (parsed.isValid()) {
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to parse time:', timeString, error);
    }

    return null;
  };

  useEffect(() => {
    console.log('🔍 Order data received in OrderDetails:', orderData);
    console.log('🔍 Order status (raw):', orderData?.status);
    if (orderData) {
      setFormData({
        ...orderData,
        paymentMethod: normalizePaymentMethod(orderData.paymentMethod),
        receiveType: normalizeReceiveType(orderData.receiveType),
        status: normalizeStatus(orderData.status),
      });
    }
    console.log('🔍 Form data status (normalized):', formData.status);
  }, [orderData, orderDetails]);

  const handleDeliverOrder = async () => {
    if (!orderData?.id || !branchId) {
      message.error('Không thể cập nhật trạng thái do thiếu thông tin đơn hàng!');
      return;
    }
    try {
      await updateOrder({
        orderId: orderData.id,
        branchId,
        newStatus: 'Delivered',
      });
      setFormData((prev) => ({ ...prev, status: 'Đang giao hàng' }));
      message.success('Đơn hàng đã được chuyển sang trạng thái Đang giao hàng!');
      onStatusChange?.();
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái giao hàng:', error);
      message.error('Chuyển trạng thái đơn hàng thất bại!');
    }
  };

  const columns = [
    { title: '#', dataIndex: 'index', key: 'index', align: 'center', render: (_, __, idx) => idx + 1 },
    {
      title: 'TÊN MÓN',
      dataIndex: 'foodName',
      key: 'foodName',
      align: 'center',
      render: (foodName, record) => foodName || record.name || `Món ăn ID ${record.foodId || 'Unknown'}`,
    },
    {
      title: 'SỐ LƯỢNG',
      dataIndex: 'Qty',
      align: 'center',
      key: 'qty',
      render: (Qty) => Qty ?? 1,
    },
    {
      title: 'GHI CHÚ',
      dataIndex: 'note',
      key: 'note',
      align: 'center',
      render: (note) => note || '',
    },
  ];

  if (!orderData) {
    return (
      <Modal
        open={open}
        onCancel={onCancel}
        footer={null}
        closable={false}
        width="100%"
        style={{ top: 0, padding: 0, height: '100vh' }}
        bodyStyle={{ height: '100vh', overflowY: 'auto', padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        className="custom-view-modal"
      >
        <Spin tip="Đang tải chi tiết đơn hàng..." />
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      closable={false}
      width="100%"
      style={{ top: 0, padding: 0, height: '100vh' }}
      bodyStyle={{ height: '100vh', overflowY: 'auto', padding: 24 }}
      className="custom-view-modal"
    >
      <div className="order-detail-wrapper">
        <Row justify="space-between" align="middle">
          <Col><h2 style={{ fontWeight: 600 }}>Chi Tiết Đơn Hàng</h2></Col>
          <Col>
            <Button
              danger
              onClick={onCancel}
              style={{
                backgroundColor: '#ff4d4f',
                color: '#fff',
                border: 'none',
                minWidth: 64,
                height: 32,
                fontSize: 14,
              }}
            >
              X
            </Button>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <label className="floating-label">Tên Khách Hàng</label>
            <Input value={formData.customerName || 'Không có'} disabled />
          </Col>
          <Col span={6}>
            <label className="floating-label">Số Điện Thoại</label>
            <Input value={formData.customerPhone || 'Không có'} disabled />
          </Col>
          <Col span={6}>
            <label className="floating-label">Ngày Nhận</label>
            <DatePicker
              value={formData.receiveDate ? moment(formData.receiveDate) : null}
              disabled
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col span={6}>
            <label className="floating-label">Thời Gian Nhận</label>
            <TimePicker
              value={safeParseVietnameseTime(formData.receiveTime)}
              disabled
              style={{ width: '100%' }}
              format="HH:mm"
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <label className="floating-label">Hình Thức Giao</label>
            <Input value={formData.receiveType} disabled placeholder="Hình thức giao" />
          </Col>
          <Col span={6}>
            <label className="floating-label">Địa Chỉ</label>
            <Input value={formData.customerAddress || 'Phòng bệnh nhân'} disabled placeholder="Địa chỉ" />
          </Col>
          <Col span={6}>
            <label className="floating-label">Ghi Chú</label>
            <Input value={formData.note || ''} disabled placeholder="Ghi chú" />
          </Col>
          <Col span={6}>
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', marginTop: 1 }}>
              <Switch checked={formData.getTools} disabled style={{ marginRight: 8 }} />
              <span style={{ color: '#6B7280', fontSize: 14, whiteSpace: 'nowrap' }}>
                Lấy Dụng Cụ
              </span>
            </div>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <label className="floating-label">Trạng Thái</label>
            <Input value={formData.status} disabled placeholder="Trạng thái" />
          </Col>
          <Col span={6}>
            <label className="floating-label">Phí Vận Chuyển</label>
            <Input value={formData.shippingFee?.toLocaleString() || '0'} disabled />
          </Col>
          <Col span={6}>
            <label className="floating-label">Thành Tiền</label>
            <Input value={formData.total?.toLocaleString() || '0'} disabled />
          </Col>
          <Col span={6}>
            <label className="floating-label">Phương Thức Thanh Toán</label>
            <Input value={formData.paymentMethod} disabled placeholder="Phương thức thanh toán" />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
          {orderData.status === 'Confirmed' && (
            <Col span={3}>
              <Button
                type="primary"
                style={{ width: '100%', backgroundColor: '#0d8ce0', border: 'none' }}
                onClick={handleDeliverOrder}
                loading={isUpdating}
              >
                Đang Giao Hàng
              </Button>
            </Col>
          )}
        </Row>

        <Table
          style={{ marginTop: 32 }}
          columns={columns}
          dataSource={orderDetails.map((item, index) => ({ ...item, key: index }))}
          pagination={false}
          bordered
        />
      </div>
    </Modal>
  );
};

export default ViewOrderDetail;