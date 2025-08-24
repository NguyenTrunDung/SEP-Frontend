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
import moment from 'moment-timezone';
import { useUpdateOrder, useDeleteOrder } from '../../../hooks/queries/useOrders';
import { orderService } from '../../../services/orderService';
import { useTimezone } from '../../../hooks/useTimezone';

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
  const { format, convert } = useTimezone();
  const [groupedOrders, setGroupedOrders] = useState({});
  const { mutate: updateOrder, isLoading: isUpdating } = useUpdateOrder();
  const { mutate: deleteOrder, isLoading: isDeleting } = useDeleteOrder();

  // Extract patient information from order details instead of making separate API calls
  const extractPatientInfo = (order, allOrders = []) => {
    console.log('🔍 Extracting patient info from order:', order.id);

    // First, try to get patient info from the current order's orderDetails
    if (order.orderDetails && order.orderDetails.length > 0) {
      const firstOrderDetail = order.orderDetails[0];
      console.log('🔍 First order detail:', firstOrderDetail);

      if (firstOrderDetail.patientInfo) {
        console.log('🔍 Found patientInfo in current order:', firstOrderDetail.patientInfo);
        return {
          patientName: firstOrderDetail.patientInfo.fullName || 'Không có',
          roomNumber: firstOrderDetail.patientInfo.roomNumber || 'Không có',
          bedNumber: firstOrderDetail.patientInfo.bedNumber || 'Không có',
          departmentName: firstOrderDetail.patientInfo.departmentName || 'Không có',
          medicalRecordNumber: firstOrderDetail.patientInfo.medicalRecordNumber || 'Không có'
        };
      } else {
        console.log('🔍 No patientInfo in current order, checking other orders for same patient');
      }
    }

    // If current order doesn't have patient info, try to find it from other orders of the same patient
    if (allOrders.length > 0 && order.patientId) {
      const otherOrders = allOrders.filter(o =>
        o.id !== order.id &&
        o.patientId === order.patientId &&
        o.orderDetails &&
        o.orderDetails.length > 0
      );

      for (const otherOrder of otherOrders) {
        const firstDetail = otherOrder.orderDetails[0];
        if (firstDetail && firstDetail.patientInfo) {
          console.log('🔍 Found patientInfo in other order:', firstDetail.patientInfo);
          return {
            patientName: firstDetail.patientInfo.fullName || 'Không có',
            roomNumber: firstDetail.patientInfo.roomNumber || 'Không có',
            bedNumber: firstDetail.patientInfo.bedNumber || 'Không có',
            departmentName: firstDetail.patientInfo.departmentName || 'Không có',
            medicalRecordNumber: firstDetail.patientInfo.medicalRecordNumber || 'Không có'
          };
        }
      }
    }

    // Fallback to the old method if patient info is not available
    console.log('🔍 Using fallback values - no patient info found');
    return {
      patientName: 'Không có',
      roomNumber: 'Không có',
      bedNumber: 'Không có',
      departmentName: 'Không có',
      medicalRecordNumber: 'Không có'
    };
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
      const ordersWithPatientNames = orderDetails.map((order) => {
        const patientInfo = extractPatientInfo(order, orderDetails); // Pass all orders to extractPatientInfo
        return {
          ...order,
          patientName: patientInfo.patientName,
          roomNumber: patientInfo.roomNumber,
          bedNumber: patientInfo.bedNumber,
          departmentName: patientInfo.departmentName,
          medicalRecordNumber: patientInfo.medicalRecordNumber,
          paymentMethod: normalizePaymentMethod(order.paymentMethod),
          receiveType: normalizeReceiveType(order.receiveType),
          status: normalizeStatus(order.status),
          customerAddress: order.customerAddress || order.shippingAddress || 'Phòng bệnh nhân',
          note: order.note || '',
          getTools: order.getTools || false,
          shippingFee: order.shippingFee || 0,
          total: typeof order.total === 'number' ? order.total : 0,
          receiveDate: order.receiveDate ? convert.toDatePicker(order.receiveDate) : null,
          mealSession: normalizeMealSession(order.mealSession),
        };
      });

      // Nhóm đơn hàng theo patientId
      const groupedByPatient = ordersWithPatientNames.reduce((acc, order) => {
        const patientId = order.patientId || 'Unknown';
        if (!acc[patientId]) {
          acc[patientId] = {
            patientName: order.patientName,
            roomNumber: order.roomNumber,
            bedNumber: order.bedNumber,
            departmentName: order.departmentName,
            medicalRecordNumber: order.medicalRecordNumber,
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
  }, [orderDetails, branchId, convert]);

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
      render: (val) => format.currency(val) || '0',
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
      render: (val) => format.currency(val) || '0',
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
          {Object.entries(groupedOrders).map(([patientId, { patientName, roomNumber, bedNumber, departmentName, medicalRecordNumber, orders }]) => (
            <Panel header={`Bệnh nhân: ${patientName} - Phòng: ${roomNumber} - Giường: ${bedNumber} - Khoa: ${departmentName}`} key={patientId}>
              <div style={{ marginBottom: 16, padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                <Row gutter={[16, 8]}>
                  <Col span={6}>
                    <strong>Mã bệnh nhân:</strong> {medicalRecordNumber}
                  </Col>
                  <Col span={6}>
                    <strong>Phòng:</strong> {roomNumber}
                  </Col>
                  <Col span={6}>
                    <strong>Giường:</strong> {bedNumber}
                  </Col>
                  <Col span={6}>
                    <strong>Khoa:</strong> {departmentName}
                  </Col>
                </Row>
              </div>
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
                        value={order.receiveDate ? convert.toDatePicker(order.receiveDate) : null}
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
                      <Input value={format.currency(order.total) || '0'} disabled />
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