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

const { Option } = Select;

const ViewOrderDetail = ({ open, onCancel, orderData = {}, orderDetails = [] }) => {
  const [formData, setFormData] = useState({});
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (orderData) {
      setFormData(orderData);
      setConfirmed(orderData.status === 'confirmed');
    }
  }, [orderData]);

  const handleConfirmOrder = () => {
    setConfirmed(true);
    message.success('Đơn hàng đã được xác nhận!');
  };

  const handleCancelOrder = () => {
    setFormData({ ...formData, status: 'cancelled' });
    message.success('Đã hủy đơn hàng!');
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
            <Button danger onClick={onCancel} style={{
              backgroundColor: '#ff4d4f',
              color: '#fff',
              border: 'none',
              minWidth: 64,
              height: 32,
              fontSize: 14
            }}>X</Button>
          </Col>
        </Row>

        {/* Thông tin khách hàng */}
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

        {/* Địa chỉ & giao hàng */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <label className="floating-label">Hình thức giao</label>
            <Select value={formData.deliveryMethod} disabled style={{ width: '100%' }}>
              <Option value="take">Tự đến lấy</Option>
              <Option value="delivery">Giao hàng</Option>
            </Select>
          </Col>
          <Col span={6}><Input value={formData.address} disabled placeholder="Địa chỉ" /></Col>
          <Col span={6}><Input value={formData.note} disabled placeholder="Ghi chú" /></Col>
          <Col span={2}>
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', marginTop: 1 }}>
              <Switch checked={formData.getTools} disabled style={{ marginRight: 8 }} />
              <span style={{ color: '#6B7280', fontSize: 14, whiteSpace: 'nowrap' }}>Lấy dụng cụ</span>
            </div>
          </Col>
        </Row>

        {/* Trạng thái */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <label className="floating-label">Trạng thái</label>
            <Select value={formData.status} disabled style={{ width: '100%' }}>
              <Option value="pending">Chưa xử lý</Option>
              <Option value="confirmed">Đã xác nhận</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
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
          <Col span={6}><Input value={formData.location} disabled placeholder="Vị trí" /></Col>
        </Row>

        {/* Khu vực và các nút */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
          <Col span={6}><Input value={formData.area} disabled placeholder="Khu vực" /></Col>

          {/* Nút xác nhận và hủy đơn chỉ hiển thị nếu chưa hoàn thành hoặc bị huỷ */}
          {(formData.status !== 'completed' && formData.status !== 'cancelled') && (
            <>
              <Col span={3}>
                {confirmed ? (
                  <Button disabled style={{ width: '100%' }}>Đang giao hàng</Button>
                ) : (
                  <Button
                    type="primary"
                    style={{ width: '100%', backgroundColor: '#00B8A9', border: 'none' }}
                    onClick={handleConfirmOrder}
                  >
                    Xác Nhận
                  </Button>
                )}
              </Col>

              {!confirmed && (
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
                    >
                      Hủy Đơn
                    </Button>
                  </Popconfirm>
                </Col>
              )}
            </>
          )}
        </Row>

        {/* Bảng món ăn */}
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
