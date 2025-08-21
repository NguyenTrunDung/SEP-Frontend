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
  Collapse,
} from 'antd';
import moment from 'moment';
import { useUpdateOrder, useDeleteOrder } from '../../../hooks/queries/useOrders';
import { orderService } from '../../../services/orderService';

const { Panel } = Collapse;

const ViewPatientOrderDetail = ({
  open,
  onCancel,
  orderData = {},
  orderDetails = [],
  branchId,
  onStatusChange,
  isPatientView = true,
}) => {
  const [groupedOrders, setGroupedOrders] = useState({});
  const [isLoadingPatientNames, setIsLoadingPatientNames] = useState(false);
  const { mutate: updateOrder, isLoading: isUpdating } = useUpdateOrder();
  const { mutate: deleteOrder, isLoading: isDeleting } = useDeleteOrder();

  // Fetch patient name from patientId
  const fetchPatientName = async (patientId, branchId) => {
    try {
      if (!patientId || patientId === 'Unknown' || patientId === 'NURSE_DEFAULT') {
        console.warn(`🔍 No valid patientId provided: ${patientId}, falling back to 'Không có'`);
        return 'Không có';
      }
      setIsLoadingPatientNames(true);
      console.log(`🔍 Fetching patient details for patientId: ${patientId}, branchId: ${branchId}`);
      const patientData = await orderService.getPatientDetails(patientId, branchId);
      console.log('🔍 API orderService.getPatientDetails response:', JSON.stringify(patientData, null, 2));
      if (!patientData) {
        console.error('🔍 No patientData returned for patientId:', patientId);
        return 'Không có';
      }
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
      setIsLoadingPatientNames(false);
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

  useEffect(() => {
    const loadPatientNames = async () => {
      if (!orderDetails || orderDetails.length === 0) {
        console.warn('🔍 No orderDetails provided, setting empty groupedOrders');
        setGroupedOrders({});
        return;
      }

      console.log('🔍 Order details received:', JSON.stringify(orderDetails, null, 2));
      const ordersWithPatientNames = await Promise.all(
        orderDetails.map(async (order) => {
          const patientName = await fetchPatientName(order.patientId, branchId);
          return {
            ...order,
            patientName,
            paymentMethod: normalizePaymentMethod(order.paymentMethod),
            receiveType: normalizeReceiveType(order.receiveType),
            status: normalizeStatus(order.status),
            customerAddress: order.customerAddress || order.shippingAddress || 'Phòng bệnh nhân',
            note: order.note || '',
            getTools: order.getTools || false,
            shippingFee: order.shippingFee || 0,
            total: typeof order.total === 'number' ? order.total : 0,
            receiveDate: order.receiveDate ? moment(order.receiveDate) : null,
            mealSession: normalizeMealSession(order.mealSession),
          };
        })
      );

      // Nhóm đơn hàng theo patientId
      const groupedByPatient = ordersWithPatientNames.reduce((acc, order) => {
        const patientId = order.patientId || 'Unknown';
        if (!acc[patientId]) {
          acc[patientId] = {
            patientName: order.patientName,
            orders: [],
          };
        }
        acc[patientId].orders.push(order);
        return acc;
      }, {});

      setGroupedOrders(groupedByPatient);
      console.log('🔍 Grouped orders by patient:', JSON.stringify(groupedByPatient, null, 2));
    };

    loadPatientNames();
  }, [orderDetails, branchId]);

  const handleDeliverOrder = async (orderId) => {
    if (!orderId || !branchId) {
      message.error('Không thể cập nhật trạng thái do thiếu thông tin đơn hàng!');
      return;
    }
    try {
      await updateOrder({
        orderId,
        branchId,
        newStatus: 'Delivered',
      });
      setGroupedOrders((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((patientId) => {
          updated[patientId].orders = updated[patientId].orders.map((order) =>
            order.id === orderId ? { ...order, status: 'Đang giao hàng' } : order
          );
        });
        return updated;
      });
      message.success('Đơn hàng đã được chuyển sang trạng thái Shipper nhận đơn và đi giao!');
      onStatusChange?.();
    } catch (error) {
      console.error('Lỗi giao hàng:', error);
      message.error('Chuyển trạng thái đơn hàng thất bại!');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    if (!orderId || !branchId) {
      message.error('Không thể hoàn thành do thiếu thông tin đơn hàng!');
      return;
    }
    try {
      await updateOrder({
        orderId,
        branchId,
        newStatus: 'Completed',
      });
      setGroupedOrders((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((patientId) => {
          updated[patientId].orders = updated[patientId].orders.map((order) =>
            order.id === orderId ? { ...order, status: 'Hoàn thành' } : order
          );
        });
        return updated;
      });
      message.success('Đơn hàng đã được hoàn thành!');
      onStatusChange?.();
    } catch (error) {
      console.error('Lỗi hoàn thành đơn:', error);
      message.error('Chuyển trạng thái đơn hàng thất bại!');
    }
  };

  const handleConfirmOrder = async (orderId) => {
    if (!orderId || !branchId) {
      message.error('Không thể xác nhận do thiếu thông tin đơn hàng!');
      return;
    }
    try {
      await updateOrder({
        orderId,
        branchId,
        newStatus: 'Confirmed',
      });
      setGroupedOrders((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((patientId) => {
          updated[patientId].orders = updated[patientId].orders.map((order) =>
            order.id === orderId ? { ...order, status: 'Đã xác nhận' } : order
          );
        });
        return updated;
      });
      message.success('Đơn hàng đã được xác nhận!');
      onStatusChange?.();
    } catch (error) {
      console.error('Lỗi xác nhận đơn:', error);
      message.error('Xác nhận đơn hàng thất bại!');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!orderId || !branchId) {
      message.error('Không thể hủy do thiếu thông tin đơn hàng!');
      return;
    }
    try {
      await deleteOrder({
        orderId,
        branchId,
      });
      setGroupedOrders((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((patientId) => {
          updated[patientId].orders = updated[patientId].orders.map((order) =>
            order.id === orderId ? { ...order, status: 'Hủy' } : order
          );
        });
        return updated;
      });
      message.success('Đã xóa đơn hàng!');
      onStatusChange?.();
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
      dataIndex: 'Qty',
      align: 'center',
      key: 'Qty',
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

  if (!orderData || isLoadingPatientNames) {
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
          <Col><h2 style={{ fontWeight: 600 }}>Chi tiết đơn hàng của y tá {orderData.userName || 'Không xác định'}</h2></Col>
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

        <Collapse accordion>
          {Object.entries(groupedOrders).map(([patientId, { patientName, orders }]) => (
            <Panel header={`Bệnh nhân: ${patientName}`} key={patientId}>
              {orders.map((order) => (
                <div key={order.id} style={{ marginBottom: 24 }}>
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                      <label className="floating-label">Mã đơn hàng</label>
                      <Input value={order.id} disabled />
                    </Col>
                    <Col span={6}>
                      <label className="floating-label">Buổi ăn</label>
                      <Input value={order.mealSession || 'Không xác định'} disabled />
                    </Col>
                    <Col span={6}>
                      <label className="floating-label">Ngày nhận</label>
                      <DatePicker
                        value={order.receiveDate ? moment(order.receiveDate) : null}
                        disabled
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                      />
                    </Col>
                    <Col span={6}>
                      <label className="floating-label">Ghi chú</label>
                      <Input value={order.note || ''} disabled placeholder="Ghi chú" />
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                      <label className="floating-label">Trạng thái</label>
                      <Input value={order.status} disabled placeholder="Trạng thái" />
                    </Col>
                    <Col span={6}>
                      <label className="floating-label">Thành tiền</label>
                      <Input value={order.total?.toLocaleString() || '0'} disabled />
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
                    <Col span={3}>
                      {order.status === 'Đang chờ' ? (
                        <Button
                          type="primary"
                          style={{ width: '100%', backgroundColor: '#00B8A9', border: 'none' }}
                          onClick={() => handleConfirmOrder(order.id)}
                          loading={isUpdating}
                        >
                          Xác Nhận
                        </Button>
                      ) : order.status === 'Đã xác nhận' ? (
                        <Button
                          type="primary"
                          style={{ width: '100%', backgroundColor: '#0d8ce0', border: 'none' }}
                          onClick={() => handleDeliverOrder(order.id)}
                          loading={isUpdating}
                        >
                          Giao hàng
                        </Button>
                      ) : order.status === 'Đang giao hàng' ? (
                        <Button
                          type="primary"
                          style={{ width: '100%', backgroundColor: '#52c41a', border: 'none' }}
                          onClick={() => handleCompleteOrder(order.id)}
                          loading={isUpdating}
                        >
                          Hoàn thành
                        </Button>
                      ) : null}
                    </Col>
                    {/* <Col span={3}>
                      <Button
                        type="default"
                        style={{ width: '100%', borderColor: '#ff4d4f', color: '#ff4d4f' }}
                        onClick={() => handleCancelOrder(order.id)}
                        loading={isDeleting}
                      >
                        Hủy
                      </Button>
                    </Col> */}
                  </Row>

                  <Table
                    style={{ marginTop: 16 }}
                    columns={columns}
                    dataSource={order.orderDetails.map((item, index) => ({ ...item, key: index }))}
                    pagination={false}
                    bordered
                    title={() => <h3>Chi tiết món ăn</h3>}
                  />
                </div>
              ))}
            </Panel>
          ))}
        </Collapse>
      </div>
    </Modal>
  );
};

export default ViewPatientOrderDetail;