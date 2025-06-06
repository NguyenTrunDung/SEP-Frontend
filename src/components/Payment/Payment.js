import React from 'react';
import { Modal, Input, Button, Typography, Select, Checkbox, message } from 'antd';

const { Text } = Typography;
const { Option } = Select;

const PaymentModal = ({
  isPaymentModalVisible,
  setIsPaymentModalVisible,
  setIsCartModalVisible,
  cartItems,
  setCartItems,
  paymentDetails,
  setPaymentDetails,
  selectedBranch,
  handleCartUpdate,
}) => {
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone);
  };

  const handlePaymentSubmit = () => {
    // Required field validation
    if (!paymentDetails.fullName) {
      message.error('Vui lòng điền họ và tên.');
      return;
    }
    if (!paymentDetails.phoneNumber) {
      message.error('Vui lòng điền số điện thoại.');
      return;
    }
    if (!validatePhoneNumber(paymentDetails.phoneNumber)) {
      message.error('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại 10-11 chữ số.');
      return;
    }
    if (!paymentDetails.paymentMethod) {
      message.error('Vui lòng chọn phương thức thanh toán.');
      return;
    }
    if (!paymentDetails.area) {
      message.error('Vui lòng chọn khu vực.');
      return;
    }
    if (!paymentDetails.room) {
      message.error('Vui lòng chọn phòng.');
      return;
    }
    if (!paymentDetails.deliveryTime) {
      message.error('Vui lòng chọn thời gian giao hàng.');
      return;
    }

    message.success('Đặt món thành công!');
    setIsPaymentModalVisible(false);
    setCartItems([]);
    setPaymentDetails({
      ...paymentDetails,
      fullName: '',
      phoneNumber: '',
      paymentMethod: '',
      area: '',
      room: '',
      deliveryTime: '',
      note: '',
      receiveMethod: 'Giao tận nơi',
      includeUtensils: false,
      showPaymentMethod: false,
      total: 0,
      shippingFee: 5000,
      orderDetails: '',
    });
    handleCartUpdate();
  };

  return (
    <Modal
      open={isPaymentModalVisible}
      onCancel={() => {
        setIsPaymentModalVisible(false);
        setIsCartModalVisible(true);
      }}
      footer={null}
      width={600}
      centered
      closeIcon={<span style={{ color: '#000', fontSize: '26px' }}>×</span>}
      styles={{
        content: {
          padding: 0,
          background: '#fff',
          borderRadius: '8px',
        },
        body: {
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100vh',
        },
      }}
    >
      <div style={{ borderRadius: '8px 8px 0 0', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            backgroundColor: '#b4c80f',
            color: '#000',
            padding: '12px 16px',
            fontSize: '18px',
            textAlign: 'left',
          }}
        >
          Thanh toán
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Text strong style={{ fontSize: '16px' }}>Thông tin đặt hàng</Text>
          <div>
            <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Chi nhánh
            </Text>
            <Select
              value={selectedBranch?.Name}
              disabled
              style={{ width: '100%', borderRadius: '4px' }}
            >
              <Option value={selectedBranch?.Name}>{selectedBranch?.Name}</Option>
            </Select>
          </div>
          <div>
            <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Họ và tên
            </Text>
            <Input
              value={paymentDetails.fullName}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, fullName: e.target.value })}
              placeholder="Nhập họ và tên"
              style={{ borderRadius: '4px' }}
            />
          </div>
          <div>
            <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Số điện thoại
            </Text>
            <Input
              value={paymentDetails.phoneNumber}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, phoneNumber: e.target.value })}
              placeholder="Nhập số điện thoại"
              style={{ borderRadius: '4px' }}
            />
          </div>
          <div>
            <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Hình thức nhận hàng
            </Text>
            <Select
              value={paymentDetails.receiveMethod}
              onChange={(value) => setPaymentDetails({ ...paymentDetails, receiveMethod: value, shippingFee: value === 'Giao tận nơi' ? 5000 : 0 })}
              style={{ width: '100%', borderRadius: '4px' }}
            >
              <Option value="Giao tận nơi">Giao tận nơi</Option>
              <Option value="Nhận tại quầy">Nhận tại quầy</Option>
            </Select>
          </div>
          <div>
            <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Khu</Text>
            <Select
              value={paymentDetails.area}
              onChange={(value) => setPaymentDetails({ ...paymentDetails, area: value })}
              placeholder="Chọn khu"
              style={{ width: '100%', borderRadius: '4px' }}
            >
              <Option value="Khoa Nội">Khoa Nội</Option>
              <Option value="Khu hành chính">Khu hành chính</Option>
            </Select>
          </div>
          <div>
            <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Phòng</Text>
            <Select
              value={paymentDetails.room}
              onChange={(value) => setPaymentDetails({ ...paymentDetails, room: value })}
              placeholder="Chọn phòng"
              style={{ width: '100%', borderRadius: '4px' }}
            >
              <Option value="Phòng hành chính">Phòng hành chính</Option>
              <Option value="Phòng B24">Phòng B24</Option>
            </Select>
          </div>
          <div>
            <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Hẹn thời gian giao hàng
            </Text>
            <Select
              value={paymentDetails.deliveryTime}
              onChange={(value) => setPaymentDetails({ ...paymentDetails, deliveryTime: value })}
              placeholder="Chọn thời gian giao hàng"
              style={{ width: '100%', borderRadius: '4px' }}
            >
              <Option value="30 phút">30 phút</Option>
              <Option value="45 phút">45 phút</Option>
              <Option value="60 phút">60 phút</Option>
              <Option value="Tuỳ chọn thời gian">Tuỳ chọn thời gian</Option>
            </Select>
          </div>
          <div>
            <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Ghi chú</Text>
            <Input.TextArea
              placeholder="Ghi chú thêm"
              value={paymentDetails.note}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, note: e.target.value })}
              style={{ height: '115px', resize: 'none', borderRadius: '4px' }}
            />
          </div>
          <Checkbox
            checked={paymentDetails.includeUtensils}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, includeUtensils: e.target.checked })}
          >
            Lấy dụng cụ ăn
          </Checkbox>
          <div style={{ marginTop: '8px' }}>
            <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Phương thức thanh toán
            </Text>
            <Select
              value={paymentDetails.paymentMethod}
              onChange={(value) => setPaymentDetails({ ...paymentDetails, paymentMethod: value })}
              placeholder="Chọn phương thức thanh toán"
              style={{ width: '100%', borderRadius: '4px' }}
            >
              <Option value="Tiền mặt">Tiền mặt</Option>
              <Option value="Thẻ ngân hàng">Thẻ ngân hàng</Option>
              <Option value="Chuyển khoản">Chuyển khoản</Option>
            </Select>
          </div>
          <div style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>Chi tiết đơn hàng</div>
            {cartItems.map((item) => (
              <div
                key={item.cartId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                  gap: '12px',
                }}
              >
                <img
                  src={item.image || 'https://via.placeholder.com/50x50?text=No+Image'}
                  alt={item.dishName}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #eee',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>{item.dishName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ color: '#000' }}>
                      {(item.price).toLocaleString('vi-VN')}đ
                    </div>
                    <div style={{ color: '#888' }}>
                      x{item.quantity}
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: '500', color: '#ff0000' }}>
                  {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #ddd' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong style={{ fontSize: '16px' }}>Tạm tính</Text>
            <Text style={{ fontSize: '16px', color: '#000' }}>
              {paymentDetails.total.toLocaleString('vi-VN')}đ
            </Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong style={{ fontSize: '16px' }}>Phí vận chuyển</Text>
            <Text style={{ fontSize: '16px', color: '#000' }}>
              {paymentDetails.shippingFee.toLocaleString('vi-VN')}đ
            </Text>
          </div>
          {paymentDetails.includeUtensils && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong style={{ fontSize: '16px' }}>Phí dụng cụ ăn</Text>
              <Text style={{ fontSize: '16px', color: '#000' }}>5.000đ</Text>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong style={{ fontSize: '16px', marginBottom: '16px' }}>Tổng cộng</Text>
            <Text style={{ fontSize: '16px', color: '#ff0000' }}>
              {(paymentDetails.total + paymentDetails.shippingFee + (paymentDetails.includeUtensils ? 5000 : 0)).toLocaleString('vi-VN')}đ
            </Text>
          </div>
          <Button
            style={{
              backgroundColor: '#b4c80f',
              borderColor: '#b4c80f',
              color: '#000',
              padding: '18px',
              fontSize: '16px',
              width: '100%',
              borderRadius: '6px',
            }}
            onClick={handlePaymentSubmit}
          >
            Đặt Món
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;