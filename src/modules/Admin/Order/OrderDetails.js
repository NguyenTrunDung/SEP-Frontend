import React, { useEffect, useState } from 'react';
import {
  Modal,
  Input,
  Button,
  Table,
  Switch,
  Row,
  Col,
  DatePicker,
  TimePicker,
  message,
} from 'antd';
import moment from 'moment';
import './ViewOrderDetail.css';
import { useUpdateOrder, useDeleteOrder } from '../../../hooks/queries/useOrders';
import { useTimezone } from '../../../hooks/useTimezone';

const ViewOrderDetail = ({
  open,
  onCancel,
  orderData = {},
  orderDetails = [],
  branchId,
  onStatusChange,
}) => {
  const [formData, setFormData] = useState({});
  const { mutate: updateOrder, isLoading: isUpdating } = useUpdateOrder();
  const { mutate: deleteOrder, isLoading: isDeleting } = useDeleteOrder();
  const { format, convert } = useTimezone();

  // Normalize paymentMethod to string
  const normalizePaymentMethod = (paymentMethod) => {
    const map = {
      0: "Cash",
      1: "Wallet",
      2: "VNPay",
      cash: "Cash",
      wallet: "Wallet",
      vnpay: "VNPay",
    };

    if (paymentMethod == null) return "Wallet";

    const key =
      typeof paymentMethod === "number"
        ? paymentMethod
        : String(paymentMethod).toLowerCase();

    return map[key] || "Wallet";
  };


  // Normalize receiveType to display string
  const normalizeReceiveType = (receiveType) => {
    const receiveTypeMap = {
      take: 'Tự đến lấy',
      delivery: 'Giao hàng',
    };
    return receiveTypeMap[receiveType] || receiveType || 'Giao hàng';
  };

  // Normalize status to display string
  const normalizeStatus = (status) => {
    const statusMap = {
      Pending: 'Đang chờ',
      Confirmed: 'Đã xác nhận',
      Delivered: 'Đang giao hàng',
      Completed: 'Hoàn thành',
      Cancelled: 'Hủy',
      PendingPayment: 'Chờ thanh toán',
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

        if (timeString.includes('phút')) {
          const hours = Math.floor(number / 60);
          const minutes = number % 60;
          return moment(
            `${hours.toString().padStart(2, '0')}:${minutes
              .toString()
              .padStart(2, '0')}`,
            'HH:mm'
          );
        }

        if (timeString.includes('giờ')) {
          return moment(`${number.toString().padStart(2, '0')}:00`, 'HH:mm');
        }
      }
    }

    try {
      const parsed = moment(timeString, [
        'HH:mm',
        'H:mm',
        'HH:mm:ss',
        'H:mm:ss',
      ]);
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
    if (orderData) {
      setFormData({
        ...orderData,
        paymentMethod: normalizePaymentMethod(orderData.paymentMethod),
        receiveType: normalizeReceiveType(orderData.receiveType),
        status: normalizeStatus(orderData.status),
      });
    }
    console.log('🔍 Order details received:', orderDetails);
  }, [orderData, orderDetails]);

  const handleDeliverOrder = async () => {
    console.log('🔍 Form data in handleDeliverOrder:', formData);
    try {
      await updateOrder({
        orderId: orderData.id,
        branchId,
        newStatus: 'Delivered',
      });
      setFormData((prev) => ({ ...prev, status: 'Đang giao hàng' }));
      message.success('Đơn hàng đã được chuyển sang trạng thái Shipper nhận đơn và đi giao!');
      onStatusChange?.();
    } catch (error) {
      console.error('Lỗi giao hàng:', error);
      message.error('Chuyển trạng thái đơn hàng thất bại!');
    }
  };

  const handleCompleteOrder = async () => {
    try {
      await updateOrder({
        orderId: orderData.id,
        branchId,
        newStatus: 'Completed',
      });
      setFormData((prev) => ({ ...prev, status: 'Hoàn thành' }));
      message.success('Đơn hàng đã được hoàn thành!');
      onStatusChange?.();
    } catch (error) {
      console.error('Lỗi hoàn thành đơn:', error);
      message.error('Chuyển trạng thái đơn hàng thất bại!');
    }
  };

  const handleConfirmOrder = async () => {
    try {
      await updateOrder({
        orderId: orderData.id,
        branchId,
        newStatus: 'Confirmed',
      });
      setFormData((prev) => ({ ...prev, status: 'Đã xác nhận' }));
      message.success('Đơn hàng đã được xác nhận!');
      onStatusChange?.();
    } catch (error) {
      console.error('Lỗi xác nhận đơn:', error);
      message.error('Chuyển trạng thái đơn hàng thất bại!');
    }
  };

  const handleCancelOrder = async () => {
    try {
      await deleteOrder({
        orderId: orderData.id,
        branchId,
      });
      setFormData((prev) => ({ ...prev, status: 'Hủy' }));
      message.success('Đã xóa đơn hàng!');
      onStatusChange?.();
      onCancel?.();
    } catch (error) {
      console.error('Lỗi xóa đơn:', error);
      message.error('Xóa đơn hàng thất bại!');
    }
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      render: (_, __, idx) => idx + 1,
      width: 50,
    },
    {
      title: 'TÊN MÓN',
      dataIndex: 'foodName',
      key: 'foodName',
      align: 'center',
      render: (foodName, record) =>
        foodName || record.name || `Món ăn ID ${record.foodId || 'Unknown'}`,
    },
    {
      title: 'GIÁ',
      dataIndex: 'price',
      align: 'center',
      key: 'price',
      render: (val) => val?.toLocaleString() || '0',
      width: 100,
    },
    {
      title: 'SL',
      dataIndex: 'Qty',
      align: 'center',
      key: 'qty',
      render: (Qty) => Qty ?? 1,
      width: 60,
    },
    {
      title: 'GHI CHÚ',
      dataIndex: 'note',
      key: 'note',
      render: (note) => note || '',
    },
    {
      title: 'TỔNG',
      dataIndex: 'total',
      align: 'center',
      key: 'total',
      render: (val) => val?.toLocaleString() || '0',
      width: 100,
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      closable={false}
      width="100%"
      style={{ top: 0, padding: 0 }}
      bodyStyle={{ height: '100vh', overflowY: 'auto', padding: '16px' }}
      className="custom-view-modal"
    >
      <div className="order-detail-wrapper">
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col><h2 style={{ fontWeight: 600, fontSize: '1.5rem' }}>Xem chi tiết</h2></Col>
          <Col>
            <Button
              danger
              onClick={onCancel}
              style={{
                backgroundColor: '#ff4d4f',
                color: '#fff',
                border: 'none',
                minWidth: 48,
                height: 32,
                fontSize: 14,
              }}
            >
              X
            </Button>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <label className="floating-label">Tên khách hàng</label>
            <Input value={formData.customerName} disabled />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <label className="floating-label">Số điện thoại</label>
            <Input value={formData.customerPhone} disabled />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <label className="floating-label">Ngày nhận</label>
            <DatePicker
              value={formData.receiveDate ? convert.toDatePicker(formData.receiveDate) : null}
              disabled
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <label className="floating-label">Thời gian nhận</label>
            <TimePicker
              value={safeParseVietnameseTime(formData.receiveTime)}
              disabled
              style={{ width: '100%' }}
              format="HH:mm"
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <label className="floating-label">Hình thức giao</label>
            <Input value={formData.receiveType} disabled placeholder="Hình thức giao" />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <label className="floating-label">Địa chỉ</label>
            <Input value={formData.customerAddress} disabled placeholder="Địa chỉ" />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <label className="floating-label">Ghi chú</label>
            <Input value={formData.note} disabled placeholder="Ghi chú" />
          </Col>
          <Col xs={6} sm={6} md={2}>
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', marginTop: 1 }}>
              <Switch checked={formData.getTools} disabled style={{ marginRight: 8 }} />
              <span style={{ color: '#6B7280', fontSize: 14, whiteSpace: 'nowrap' }}>
                Lấy dụng cụ
              </span>
            </div>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <label className="floating-label">Trạng thái</label>
            <Input value={formData.status} disabled placeholder="Trạng thái" />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <label className="floating-label">Phí vận chuyển</label>
            <Input value={formData.shippingFee} disabled />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <label className="floating-label">Thành tiền</label>
            <Input value={formData.total} disabled />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <label className="floating-label">Phương thức thanh toán</label>
            <Input value={formData.paymentMethod} disabled placeholder="Phương thức thanh toán" />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
          <Col xs={9} sm={6} md={3}>
            {formData.status === 'Đang chờ' ? (
              <Button
                type="primary"
                style={{ width: '100%', backgroundColor: '#00B8A9', border: 'none' }}
                onClick={handleConfirmOrder}
                loading={isUpdating}
              >
                Xác Nhận
              </Button>
            ) : formData.status === 'Đã xác nhận' ? (
              <Button
                type="primary"
                style={{ width: '100%', backgroundColor: '#0d8ce0', border: 'none' }}
                onClick={handleDeliverOrder}
                loading={isUpdating}
              >
                Đang giao hàng
              </Button>
            ) : formData.status === 'Đang giao hàng' ? (
              <Button
                type="primary"
                style={{ width: '100%', backgroundColor: '#52c41a', border: 'none' }}
                onClick={handleCompleteOrder}
                loading={isUpdating}
              >
                Hoàn thành
              </Button>
            ) : null}
          </Col>

          {['Đang chờ', 'Đã xác nhận'].includes(formData.status) && (
            <Col xs={9} sm={6} md={3}>
              <Button
                danger
                style={{
                  backgroundColor: '#ff4d4f',
                  color: '#fff',
                  border: 'none',
                  width: '100%',
                }}
                onClick={handleCancelOrder}
                loading={isUpdating || isDeleting}
              >
                Hủy Đơn
              </Button>
            </Col>
          )}
        </Row>

        <Table
          style={{ marginTop: 24 }}
          columns={columns}
          dataSource={orderDetails.map((item, index) => ({ ...item, key: index }))}
          pagination={false}
          bordered
          scroll={{ x: 'max-content' }} // Enable horizontal scrolling for table on small screens
        />
      </div>
    </Modal>
  );
};

export default ViewOrderDetail;