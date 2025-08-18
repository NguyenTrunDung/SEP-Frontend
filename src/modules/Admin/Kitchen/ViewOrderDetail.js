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
  Spin,
} from 'antd';
import moment from 'moment';
import { useUpdateOrder, useDeleteOrder } from '../../../hooks/queries/useOrders';
import { orderService } from '../../../services/orderService';

const ViewPatientOrderDetail = ({
  open,
  onCancel,
  orderData = {},
  orderDetails = [],
  branchId,
  onStatusChange,
  isPatientView = true,
}) => {
  const [formData, setFormData] = useState({});
  const [isLoadingPatientName, setIsLoadingPatientName] = useState(false);
  const { mutate: updateOrder, isLoading: isUpdating } = useUpdateOrder();
  const { mutate: deleteOrder, isLoading: isDeleting } = useDeleteOrder();

  // Fetch patient name from patientId
  const fetchPatientName = async (patientId, branchId) => {
    try {
      if (!patientId || patientId === 'Unknown' || patientId === 'NURSE_DEFAULT') {
        console.warn(`🔍 No valid patientId provided: ${patientId}, falling back to 'Không có'`);
        return 'Không có';
      }
      setIsLoadingPatientName(true);
      console.log(`🔍 Fetching patient details for patientId: ${patientId}, branchId: ${branchId}`);
      const patientData = await orderService.getPatientDetails(patientId, branchId);
      console.log('🔍 API orderService.getPatientDetails response:', JSON.stringify(patientData, null, 2));
      if (!patientData) {
        console.error('🔍 No patientData returned for patientId:', patientId);
        return 'Không có';
      }
      // Handle various possible field names for patient name
      const patientName =
        patientData.patientName ||
        patientData.name ||
        (patientData.firstName && patientData.lastName
          ? `${patientData.firstName} ${patientData.lastName}`
          : patientData.firstName || patientData.lastName) ||
        patientData.fullName ||
        'Không có';
      console.log(`🔍 Fetched patient name for patientId ${patientId}: ${patientName}`);
      return patientName.trim() || 'Không có';
    } catch (error) {
      console.error(`❌ Failed to fetch patient name for patientId ${patientId}:`, error);
      return 'Không có';
    } finally {
      setIsLoadingPatientName(false);
    }
  };

  // Normalize paymentMethod to string
  const normalizePaymentMethod = (paymentMethod) => {
    const numberToStringMap = {
      '1': 'Wallet',
      '2': 'VNPay',
      '3': 'Miễn phí',
    };
    if (typeof paymentMethod === 'number' || (typeof paymentMethod === 'string' && numberToStringMap[paymentMethod])) {
      return numberToStringMap[paymentMethod.toString()] || 'Miễn phí';
    }
    if (typeof paymentMethod === 'string') {
      if (paymentMethod.toLowerCase() === 'vnpay') return 'VNPay';
      if (paymentMethod.toLowerCase() === 'wallet') return 'Wallet';
      if (paymentMethod.toLowerCase() === 'free') return 'Miễn phí';
    }
    return 'Miễn phí';
  };

  // Normalize receiveType to display string
  const normalizeReceiveType = (receiveType) => {
    const receiveTypeMap = {
      'take': 'Tự đến lấy',
      'delivery': 'Giao hàng',
      'Giao tận nơi': 'Giao tận nơi',
    };
    return receiveTypeMap[receiveType] || receiveType || 'Giao tận nơi';
  };

  // Normalize status to display string
  const normalizeStatus = (status) => {
    const statusMap = {
      'Pending': 'Đang chờ',
      'Confirmed': 'Đã xác nhận',
      'Delivered': 'Đang giao hàng',
      'Completed': 'Hoàn thành',
      'Cancelled': 'Hủy',
      'PendingPayment': 'Chờ thanh toán',
    };
    return statusMap[status] || status || 'Đang chờ';
  };

  // Normalize mealSession to display string
  const normalizeMealSession = (mealSession) => {
    const mealSessionMap = {
      'breakfast': 'Bữa sáng',
      'lunch': 'Bữa trưa',
      'dinner': 'Bữa tối',
      'snack': 'Bữa phụ',
    };
    if (typeof mealSession === 'string') {
      return mealSessionMap[mealSession.toLowerCase()] || mealSession || 'Không xác định';
    }
    return 'Không xác định';
  };

  // Helper function to safely parse Vietnamese time strings
  const safeParseVietnameseTime = (timeString) => {
    if (!timeString) return null;

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(timeString)) {
      return moment(timeString, 'HH:mm');
    }

    if (typeof timeString === 'string') {
      const numberMatch = timeString.match(/(\d+)/);
      if (numberMatch) {
        const number = parseInt(numberMatch[1]);
        if (timeString.includes('phút')) {
          const hours = Math.floor(number / 60);
          const minutes = number % 60;
          return moment(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`, 'HH:mm');
        }
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
    const loadPatientName = async () => {
      console.log('🔍 Order data received in ViewPatientOrderDetail:', JSON.stringify(orderData, null, 2));
      console.log('🔍 isPatientView:', isPatientView);
      console.log('🔍 Order details received:', JSON.stringify(orderDetails, null, 2));

      // Check if orderData is null or undefined
      if (!orderData || orderData === null) {
        console.warn('🔍 orderData is null or undefined, setting default formData');
        setFormData({
          patientName: 'Không có',
          customerPhone: 'Không có',
          receiveDate: null,
          receiveTime: null,
          receiveType: 'Giao tận nơi',
          customerAddress: 'Phòng bệnh nhân',
          note: '',
          getTools: false,
          status: 'Đang chờ',
          shippingFee: 0,
          total: 0,
          paymentMethod: 'Miễn phí',
          mealSession: 'Không xác định',
        });
        return;
      }

      console.log('🔍 Checking total, receiveDate, and patientId:', {
        total: orderData.total,
        receiveDate: orderData.receiveDate,
        patientId: orderData.patientId,
      });

      const patientName = await fetchPatientName(orderData.patientId, branchId);

      // Ensure total is a number and formatted correctly
      const total = typeof orderData.total === 'number' ? orderData.total : 0;
      // Parse receiveDate with moment, similar to ViewOrderDetail
      const receiveDate = orderData.receiveDate ? moment(orderData.receiveDate) : null;

      setFormData({
        ...orderData,
        patientName: patientName,
        customerPhone: orderData.customerPhone || 'Không có',
        paymentMethod: normalizePaymentMethod(orderData.paymentMethod),
        receiveType: normalizeReceiveType(orderData.receiveType),
        status: normalizeStatus(orderData.status),
        customerAddress: orderData.customerAddress || orderData.shippingAddress || 'Phòng bệnh nhân',
        note: orderData.note || '',
        getTools: orderData.getTools || false,
        shippingFee: orderData.shippingFee || 0,
        total: total,
        receiveDate: receiveDate,
        mealSession: normalizeMealSession(orderData.mealSession),
      });

      console.log('🔍 Form data set:', JSON.stringify({
        patientName: patientName,
        status: normalizeStatus(orderData.status),
        mealSession: normalizeMealSession(orderData.mealSession),
        total: total,
        receiveDate: receiveDate ? receiveDate.format('DD/MM/YYYY') : 'null',
        orderDetails,
      }, null, 2));
    };

    loadPatientName();
  }, [orderData, orderDetails, branchId]);

  const handleDeliverOrder = async () => {
    if (!orderData?.id || !branchId) {
      message.error('Không thể cập nhật trạng thái do thiếu thông tin đơn hàng!');
      return;
    }
    console.log('🔍 Form data in handleDeliverOrder:', JSON.stringify(formData, null, 2));
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
    if (!orderData?.id || !branchId) {
      message.error('Không thể hoàn thành do thiếu thông tin đơn hàng!');
      return;
    }
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
    if (!orderData?.id || !branchId) {
      message.error('Không thể xác nhận do thiếu thông tin đơn hàng!');
      return;
    }
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
      message.error('Xác nhận đơn hàng thất bại!');
    }
  };

  const handleCancelOrder = async () => {
    if (!orderData?.id || !branchId) {
      message.error('Không thể hủy do thiếu thông tin đơn hàng!');
      return;
    }
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
    { title: '#', dataIndex: 'index', key: 'index', align: 'center', render: (_, __, idx) => idx + 1 },
    {
      title: 'TÊN MÓN',
      dataIndex: 'foodName',
      key: 'foodName',
      align: 'center',
      render: (foodName, record) => foodName || record.name || `Món ăn ID ${record.foodId || 'Unknown'}`,
    },
    {
      title: 'GIÁ TIỀN',
      dataIndex: 'price',
      align: 'center',
      key: 'price',
      render: (val) => val?.toLocaleString() || '0',
    },
    {
      title: 'SỐ LƯỢNG',
      dataIndex: 'qty',
      align: 'center',
      key: 'qty',
      render: (qty) => qty ?? 1,
    },
    { title: 'GHI CHÚ', dataIndex: 'note', key: 'note', render: (note) => note || '' },
    {
      title: 'TIỀN',
      dataIndex: 'total',
      align: 'center',
      key: 'total',
      render: (val) => val?.toLocaleString() || '0',
    },
  ];

  if (!orderData || isLoadingPatientName) {
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
          <Col><h2 style={{ fontWeight: 600 }}>Xem chi tiết đơn hàng bệnh nhân</h2></Col>
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
            <label className="floating-label">Tên bệnh nhân</label>
            <Input value={formData.patientName || 'Không có'} disabled />
          </Col>
          <Col span={6}>
            <label className="floating-label">Buổi ăn</label>
            <Input value={formData.mealSession || 'Không xác định'} disabled />
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
            <label className="floating-label">Ghi chú</label>
            <Input value={formData.note || ''} disabled placeholder="Ghi chú" />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <label className="floating-label">Trạng thái</label>
            <Input value={formData.status} disabled placeholder="Trạng thái" />
          </Col>
          <Col span={6}>
            <label className="floating-label">Thành tiền</label>
            <Input value={formData.total?.toLocaleString() || '0'} disabled />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
          <Col span={3}>
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
                Giao hàng
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

export default ViewPatientOrderDetail;