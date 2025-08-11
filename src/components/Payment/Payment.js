import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Typography, Select, Checkbox, message } from 'antd';
import { useCreateOrder, useCreateVnPayOrder } from '../../hooks/queries/userOrderQueries';
import { useCreateVnPayPayment } from '../../hooks/queries/paymentQueries';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import { useAreas } from '../../hooks/queries/useAreas';
import { useDepartments } from '../../hooks/queries/useDepartments';

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
  const { user } = useAuth();
  const createOrderMutation = useCreateOrder();
  const createVnPayOrderMutation = useCreateVnPayOrder();
  const createVnPayPaymentMutation = useCreateVnPayPayment();
  const [isProcessingVnPay, setIsProcessingVnPay] = useState(false);

  // Fetch areas and departments for the selected branch
  const { areas, isLoading: isAreasLoading, error: areasError } = useAreas(selectedBranch?.id);
  const { departments, isLoading: isDepartmentsLoading, error: departmentsError } = useDepartments(selectedBranch?.id);

  // Set fullName for NURSE or DOCTOR when modal opens or user changes
  useEffect(() => {
    if (isPaymentModalVisible && user && (user.role === ROLES.NURSE || user.role === ROLES.DOCTOR)) {
      setPaymentDetails((prev) => ({
        ...prev,
        fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '',
      }));
    }
  }, [isPaymentModalVisible, user, setPaymentDetails]);

  // Debug user data
  useEffect(() => {
    console.log('User data:', { user, role: user?.role, firstName: user?.firstName, lastName: user?.lastName, isUserNull: !user });
    console.log('Areas data:', { areas, isAreasLoading, areasError });
    console.log('Departments data:', { departments, isDepartmentsLoading, departmentsError });
  }, [user, areas, isAreasLoading, areasError, departments, isDepartmentsLoading, departmentsError]);

  // Handle API errors
  useEffect(() => {
    if (areasError) {
      message.error('Không thể tải danh sách khu vực. Vui lòng thử lại.');
    }
    if (departmentsError) {
      message.error('Không thể tải danh sách phòng ban. Vui lòng thử lại.');
    }
  }, [areasError, departmentsError]);

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone);
  };

  const handlePaymentSubmit = async () => {
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
    if (paymentDetails.deliveryTime === 'Tuỳ chọn thời gian' && !paymentDetails.customTime) {
      message.error('Vui lòng chọn thời gian cụ thể khi chọn "Tuỳ chọn thời gian".');
      return;
    }
    if (!selectedBranch?.id) {
      message.error('Vui lòng chọn chi nhánh trước khi đặt món.');
      return;
    }
    if (!cartItems || cartItems.length === 0) {
      message.error('Giỏ hàng trống. Vui lòng thêm món ăn trước khi đặt hàng.');
      return;
    }

    try {
      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shippingFee = paymentDetails.receiveMethod === 'Giao tận nơi' ? 5000 : 0;
      const foodToolFee = paymentDetails.includeUtensils ? 5000 : 0;
      const totalAmount = subtotal + shippingFee + foodToolFee;

      // Prepare order data
      const orderData = {
        userId: user?.id || null,
        customerName: paymentDetails.fullName,
        customerPhone: paymentDetails.phoneNumber,
        customerAddress: `${paymentDetails.area} - ${paymentDetails.room}`,
        receiveMethod: paymentDetails.receiveMethod,
        receiveTime: paymentDetails.deliveryTime,
        receiveDate: calculateReceiveDate(paymentDetails.deliveryTime),
        paymentMethod: paymentDetails.paymentMethod,
        note: paymentDetails.note,
        includeUtensils: paymentDetails.includeUtensils,
        total: totalAmount,
        shippingFee: shippingFee,
        cartItems: cartItems.map(item => ({
          ...item,
          FoodId: item.FoodId || item.ID,
          dishName: item.dishName || item.name,
          price: item.price,
          qty: item.quantity,
          note: item.note || null
        }))
      };

      console.log('Submitting order:', { orderData, branchId: selectedBranch.id });
      console.log('paymentDetails.paymentMethod:', paymentDetails.paymentMethod);
      console.log('Calculated receiveDate:', orderData.receiveDate);
      console.log('Delivery time:', paymentDetails.deliveryTime);
      // Check if payment method is VNPay
      if (paymentDetails.paymentMethod === 'VNPay') {
        await handleVnPayPayment(orderData, totalAmount);
      } else {
        // Handle other payment methods (existing flow)
        await createOrderMutation.mutateAsync({
          orderData,
          branchId: selectedBranch.id
        });

        // Success - clear cart and close modal
        clearCartAndResetForm();
        handleCartUpdate();
      }

    } catch (error) {
      console.error('Order creation failed:', error);
      // Error message is handled by the mutation's onError callback
    }
  };

  const handleVnPayPayment = async (orderData, totalAmount) => {
    try {
      setIsProcessingVnPay(true);

      // Step 1: Create VNPay order with pending payment status
      const orderResponse = await createVnPayOrderMutation.mutateAsync({
        orderData,
        branchId: selectedBranch.id
      });

      console.log('VNPay order created:', orderResponse);

      // Extract order ID from response
      const orderId = orderResponse.data?.id || orderResponse.id;
      if (!orderId) {
        throw new Error('Không thể lấy ID đơn hàng');
      }

      // Store order ID for return URL processing
      localStorage.setItem('pendingVnPayOrderId', orderId);
      localStorage.setItem('pendingVnPayBranchId', selectedBranch.id);

      // Step 2: Create VNPay payment URL
      const paymentResponse = await createVnPayPaymentMutation.mutateAsync({
        orderId: orderId,
        amount: totalAmount
      });

      console.log('VNPay payment URL created:', paymentResponse);

      // Extract payment URL from response
      const paymentUrl = paymentResponse.data || paymentResponse;
      if (!paymentUrl) {
        throw new Error('Không thể tạo liên kết thanh toán VNPay');
      }

      // Clear cart before redirecting (user will return after payment)
      clearCartAndResetForm();

      // Step 3: Redirect to VNPay
      message.success('Đang chuyển hướng đến VNPay...');
      window.location.href = paymentUrl;

    } catch (error) {
      console.error('VNPay payment failed:', error);
      setIsProcessingVnPay(false);

      // Clean up stored order ID on failure
      localStorage.removeItem('pendingVnPayOrderId');
      localStorage.removeItem('pendingVnPayBranchId');

      message.error(error.message || 'Không thể khởi tạo thanh toán VNPay. Vui lòng thử lại.');
    }
  };

  const clearCartAndResetForm = () => {
    // Clear cart and close modal
    setCartItems([]);
    localStorage.removeItem('cartItems');
    setIsPaymentModalVisible(false);

    // Reset payment details, preserving fullName for NURSE or DOCTOR
    const preservedFullName = (user?.role === ROLES.NURSE || user?.role === ROLES.DOCTOR) ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '' : '';
    setPaymentDetails({
      deliveryAddress: '',
      fullName: preservedFullName,
      phoneNumber: '',
      paymentMethod: '',
      area: '',
      room: '',
      deliveryTime: '',
      customTime: '',
      note: '',
      receiveMethod: 'Giao tận nơi',
      includeUtensils: false,
      showPaymentMethod: false,
      total: 0,
      shippingFee: 5000,
      orderDetails: '',
    });
  };

  // Define payment options based on user role
  const paymentOptions = user?.role === ROLES.GUEST
    ? [{ value: 'VNPay', label: 'VNPay (Thanh toán trực tuyến)' }]
    : user?.role === ROLES.NURSE || user?.role === ROLES.DOCTOR
      ? [
        { value: 'VNPay', label: 'VNPay (Thanh toán trực tuyến)' },
        { value: 'Ví', label: 'Thanh toán ví' }
      ]
      : [{ value: 'VNPay', label: 'VNPay (Thanh toán trực tuyến)' }]; // Fallback for undefined role

  // Log payment options for debugging
  console.log('Payment options:', paymentOptions);

  console.log('Payment role:', user?.role);

  // Function to calculate receive date based on delivery time
  const calculateReceiveDate = (deliveryTime) => {
    if (!deliveryTime) return null;

    const now = new Date();
    let receiveDate = new Date(now);

    switch (deliveryTime) {
      case '30 phút':
        receiveDate.setMinutes(now.getMinutes() + 30);
        break;
      case '45 phút':
        receiveDate.setMinutes(now.getMinutes() + 45);
        break;
      case '60 phút':
        receiveDate.setHours(now.getHours() + 1);
        break;
      case 'Tuỳ chọn thời gian':
        // Use custom time if available, otherwise default to 1 hour from now
        if (paymentDetails.customTime) {
          const [hours, minutes] = paymentDetails.customTime.split(':').map(Number);
          receiveDate.setHours(hours, minutes, 0, 0);

          // If the time has already passed today, set it for tomorrow
          if (receiveDate <= now) {
            receiveDate.setDate(receiveDate.getDate() + 1);
          }
        } else {
          // Default to 1 hour from now
          receiveDate.setHours(now.getHours() + 1);
        }
        break;
      default:
        // If it's a custom time string (e.g., "14:30"), parse it
        if (deliveryTime.includes(':')) {
          const [hours, minutes] = deliveryTime.split(':').map(Number);
          receiveDate.setHours(hours, minutes, 0, 0);

          // If the time has already passed today, set it for tomorrow
          if (receiveDate <= now) {
            receiveDate.setDate(receiveDate.getDate() + 1);
          }
        } else {
          // Default to 1 hour from now
          receiveDate.setHours(now.getHours() + 1);
        }
        break;
    }

    return receiveDate;
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

          <div>
            <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Chi nhánh
            </Text>
            <Select
              value={selectedBranch?.name}
              disabled
              style={{ width: '100%', borderRadius: '4px' }}
            >
              <Option value={selectedBranch?.name}>{selectedBranch?.name}</Option>
            </Select>
          </div>
          <div>
            <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Họ và tên <span style={{ color: 'red' }}>*</span>
            </Text>
            <Input
              value={paymentDetails.fullName}
              onChange={(e) => {
                if (user?.role !== ROLES.NURSE && user?.role !== ROLES.DOCTOR) {
                  setPaymentDetails({ ...paymentDetails, fullName: e.target.value });
                }
              }}
              placeholder="Nhập họ và tên"
              style={{ borderRadius: '4px' }}
              disabled={user?.role === ROLES.NURSE || user?.role === ROLES.DOCTOR}
            />
          </div>
          <div>
            <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Số điện thoại <span style={{ color: 'red' }}>*</span>
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
            <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Khu <span style={{ color: 'red' }}>*</span>
            </Text>
            <Select
              value={paymentDetails.area}
              onChange={(value) => setPaymentDetails({ ...paymentDetails, area: value, room: '' })} // Reset room when area changes
              placeholder="Chọn khu"
              style={{ width: '100%', borderRadius: '4px' }}
              loading={isAreasLoading}
              disabled={isAreasLoading || !selectedBranch?.id}
            >
              {areas.map((area) => (
                <Option key={area.id} value={area.name}>
                  {area.name}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Phòng <span style={{ color: 'red' }}>*</span>
            </Text>
            <Select
              value={paymentDetails.room}
              onChange={(value) => setPaymentDetails({ ...paymentDetails, room: value })}
              placeholder="Chọn phòng"
              style={{ width: '100%', borderRadius: '4px' }}
              loading={isDepartmentsLoading}
              disabled={isDepartmentsLoading || !selectedBranch?.id}
            >
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.name}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Hẹn thời gian giao hàng <span style={{ color: 'red' }}>*</span>
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
            {paymentDetails.deliveryTime === 'Tuỳ chọn thời gian' && (
              <Input
                type="time"
                value={paymentDetails.customTime || ''}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, customTime: e.target.value })}
                placeholder="Chọn thời gian cụ thể"
                style={{ marginTop: '8px', borderRadius: '4px' }}
              />
            )}
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
            Lấy dụng cụ ăn (+5.000đ)
          </Checkbox>
          <div style={{ marginTop: '8px' }}>
            <Text style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Phương thức thanh toán <span style={{ color: 'red' }}>*</span>
            </Text>
            <Select
              value={paymentDetails.paymentMethod}
              onChange={(value) => setPaymentDetails({ ...paymentDetails, paymentMethod: value })}
              placeholder="Chọn phương thức thanh toán"
              style={{ width: '100%', borderRadius: '4px' }}
            >
              {paymentOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
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
                      {typeof item.price === 'number' ? item.price.toLocaleString('vi-VN') + 'đ' : '0đ'}
                    </div>
                    <div style={{ color: '#888' }}>
                      x{item.quantity}
                    </div>
                  </div>
                  {item.note && (
                    <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', marginTop: '2px' }}>
                      Ghi chú: {item.note}
                    </div>
                  )}
                </div>
                <div style={{ fontWeight: '500', color: '#ff0000' }}>
                  {(typeof item.price === 'number' && typeof item.quantity === 'number')
                    ? (item.price * item.quantity).toLocaleString('vi-VN') + 'đ'
                    : '0đ'}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #ddd' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong style={{ fontSize: '16px' }}>Tạm tính</Text>
            <Text style={{ fontSize: '16px', color: '#000' }}>
              {cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString('vi-VN')}đ
            </Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong style={{ fontSize: '16px' }}>Phí vận chuyển</Text>
            <Text style={{ fontSize: '16px', color: '#000' }}>
              {(paymentDetails.receiveMethod === 'Giao tận nơi' ? 5000 : 0).toLocaleString('vi-VN')}đ
            </Text>
          </div>
          {paymentDetails.includeUtensils && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong style={{ fontSize: '16px' }}>Phí dụng cụ ăn</Text>
              <Text style={{ fontSize: '16px', color: '#000' }}>5.000đ</Text>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <Text strong style={{ fontSize: '18px' }}>Tổng cộng</Text>
            <Text style={{ fontSize: '18px', color: '#ff0000', fontWeight: 'bold' }}>
              {(
                cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) +
                (paymentDetails.receiveMethod === 'Giao tận nơi' ? 5000 : 0) +
                (paymentDetails.includeUtensils ? 5000 : 0)
              ).toLocaleString('vi-VN')}đ
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
              marginTop: '16px',
            }}
            onClick={handlePaymentSubmit}
            loading={createOrderMutation.isPending || createVnPayOrderMutation.isPending || createVnPayPaymentMutation.isPending || isProcessingVnPay}
            disabled={createOrderMutation.isPending || createVnPayOrderMutation.isPending || createVnPayPaymentMutation.isPending || isProcessingVnPay}
          >
            {(createOrderMutation.isPending || createVnPayOrderMutation.isPending || createVnPayPaymentMutation.isPending || isProcessingVnPay)
              ? (paymentDetails.paymentMethod === 'VNPay' ? 'Đang xử lý VNPay...' : 'Đang xử lý...')
              : (paymentDetails.paymentMethod === 'VNPay' ? 'Thanh Toán VNPay' : 'Đặt Món')
            }
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;