import React, { useEffect, useState } from 'react';
import {
  Modal,
  Input,
  Button,
  Select,
  Table,
  Switch,
  Row,
  Col,
  DatePicker,
  TimePicker,
  Popconfirm,
  message,
} from 'antd';
import moment from 'moment';
import './ViewOrderDetail.css';
import { useUpdateOrder } from '../../../hooks/queries/useOrders';

const { Option } = Select;

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

  useEffect(() => {
    if (orderData) {
      setFormData(orderData);
    }
  }, [orderData]);

  const handleConfirmOrder = async () => {
    try {
      await updateOrder({
        orderId: orderData.id,
        orderData: { status: 'Confirmed' }, // Updated to match API format
        branchId,
      });
      setFormData((prev) => ({ ...prev, status: 'Confirmed' }));
      message.success('Đơn hàng đã được xác nhận!');
      onStatusChange?.();
    } catch (error) {
      console.error('Lỗi xác nhận đơn:', error);
      message.error('Chuyển trạng thái đơn hàng thất bại!');
    }
  };

  const handleDeliverOrder = async () => {
    try {
      await updateOrder({
        orderId: orderData.id,
        orderData: { status: 'Delivered' }, // Updated to match API format
        branchId,
      });
      setFormData((prev) => ({ ...prev, status: 'Delivered' }));
      message.success('Đơn hàng đã được chuyển sang trạng thái Đang giao hàng!');
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
        orderData: { status: 'Completed' }, // Updated to match API format
        branchId,
      });
      setFormData((prev) => ({ ...prev, status: 'Completed' }));
      message.success('Đơn hàng đã được hoàn thành!');
      onStatusChange?.();
    } catch (error) {
      console.error('Lỗi hoàn thành đơn:', error);
      message.error('Chuyển trạng thái đơn hàng thất bại!');
    }
  };

  const handleCancelOrder = async () => {
    try {
      await updateOrder({
        orderId: orderData.id,
        orderData: { status: 'Cancelled' }, // Updated to match API format
        branchId,
      });
      setFormData((prev) => ({ ...prev, status: 'Cancelled' }));
      message.success('Đã hủy đơn hàng!');
      onStatusChange?.();
    } catch (error) {
      console.error('Lỗi hủy đơn:', error);
      message.error('Hủy đơn hàng thất bại!');
    }
  };

  const columns = [
    { title: '#', dataIndex: 'index', key: 'index', render: (_, __, idx) => idx + 1 },
    { title: 'TÊN MÓN', dataIndex: 'foodName', key: 'foodName' },
    { title: 'GIÁ TIỀN', dataIndex: 'price', key: 'price', render: (val) => val?.toLocaleString() },
    { title: 'SỐ LƯỢNG', dataIndex: 'qty', key: 'qty' },
    { title: 'GHI CHÚ', dataIndex: 'note', key: 'note' },
    { title: 'TIỀN', dataIndex: 'total', key: 'total', render: (val) => val?.toLocaleString() },
  ];

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
          <Col><h2 style={{ fontWeight: 600 }}>Xem chi tiết</h2></Col>
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
            <label className="floating-label">Tên khách hàng</label>
            <Input value={formData.customerName} disabled />
          </Col>
          <Col span={6}>
            <label className="floating-label">Số điện thoại</label>
            <Input value={formData.customerPhone} disabled />
          </Col>
          <Col span={6}>
            <label className="floating-label">Ngày nhận</label>
            <DatePicker
              value={formData.receiveDate ? moment(formData.receiveDate) : null}
              disabled
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col span={6}>
            <label className="floating-label">Thời gian nhận</label>
            <TimePicker
              value={formData.receiveTime ? moment(formData.receiveTime, 'HH:mm') : null}
              disabled
              style={{ width: '100%' }}
              format="HH:mm"
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <label className="floating-label">Hình thức giao</label>
            <Select value={formData.receiveType} disabled style={{ width: '100%' }}>
              <Option value="take">Tự đến lấy</Option>
              <Option value="delivery">Giao hàng</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Input value={formData.customerAddress} disabled placeholder="Địa chỉ" />
          </Col>
          <Col span={6}>
            <Input value={formData.note} disabled placeholder="Ghi chú" />
          </Col>
          <Col span={2}>
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', marginTop: 1 }}>
              <Switch checked={formData.getTools} disabled style={{ marginRight: 8 }} />
              <span style={{ color: '#6B7280', fontSize: 14, whiteSpace: 'nowrap' }}>
                Lấy dụng cụ
              </span>
            </div>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <label className="floating-label">Trạng thái</label>
            <Select value={formData.status} disabled style={{ width: '100%' }}>
              <Option value="Pending">Đang chờ</Option>
              <Option value="Confirmed">Đã xác nhận</Option>
              <Option value="Preparing">Đang chuẩn bị</Option>
              <Option value="Delivered">Đang giao hàng</Option>
              <Option value="Completed">Hoàn thành</Option>
              <Option value="Cancelled">Hủy</Option>
              <Option value="PendingPayment">Chờ thanh toán</Option>
            </Select>
          </Col>
          <Col span={6}>
            <label className="floating-label">Phí vận chuyển</label>
            <Input value={formData.shippingFee} disabled />
          </Col>
          <Col span={6}>
            <label className="floating-label">Thành tiền</label>
            <Input value={formData.total} disabled />
          </Col>
          <Col span={6}>
            <Input value={formData.location} disabled placeholder="Vị trí" />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
          <Col span={6}>
            <Input value={formData.area} disabled placeholder="Khu vực" />
          </Col>

          <Col span={3}>
            {(formData.status === 'pending' || formData.status === 'Pending') ? (
              <Button
                type="primary"
                style={{ width: '100%', backgroundColor: '#00B8A9', border: 'none' }}
                onClick={handleConfirmOrder}
                loading={isUpdating}
              >
                Xác Nhận
              </Button>
            ) : (formData.status === 'confirmed' || formData.status === 'Confirmed') ? (
              <Button
                type="primary"
                style={{ width: '100%', backgroundColor: '#0d8ce0', border: 'none' }}
                onClick={handleDeliverOrder}
                loading={isUpdating}
              >
                Đang giao hàng
              </Button>
            ) : (formData.status === 'delivered' || formData.status === 'Delivered') ? (
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

          {['pending', 'Pending', 'confirmed', 'Confirmed'].includes(formData.status) && (
            <Col span={3}>
              <Popconfirm
                title="Bạn có chắc muốn hủy đơn hàng này?"
                onConfirm={handleCancelOrder}
                okText="Hủy đơn"
                cancelText="Thoát"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  style={{
                    backgroundColor: '#ff4d4f',
                    color: '#fff',
                    border: 'none',
                    width: '100%',
                  }}
                  loading={isUpdating}
                >
                  Hủy Đơn
                </Button>
              </Popconfirm>
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