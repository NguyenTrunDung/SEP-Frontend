import React, { useEffect, useState } from 'react';
import {
  Modal,
  Input,
  Button,
  Table,
  Row,
  Col,
  DatePicker,
  message,
  Spin,
  Collapse,
} from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import './ViewPatientOrderDetail.css';
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

  // Normalize functions
  const normalizePaymentMethod = (paymentMethod) => {
    const numberToStringMap = { '1': 'Wallet', '2': 'VNPay', '3': 'Miễn phí' };
    if (typeof paymentMethod === 'number' || numberToStringMap[paymentMethod]) {
      return numberToStringMap[paymentMethod.toString()] || 'Miễn phí';
    }
    return paymentMethod?.toLowerCase() === 'vnpay' ? 'VNPay' :
           paymentMethod?.toLowerCase() === 'wallet' ? 'Wallet' :
           paymentMethod?.toLowerCase() === 'free' ? 'Miễn phí' : 'Miễn phí';
  };

  const normalizeReceiveType = (receiveType) =>
    ({ 'take': 'Tự đến lấy', 'delivery': 'Giao hàng', 'Giao tận nơi': 'Giao tận nơi' }[receiveType] || 'Giao tận nơi');

  const normalizeStatus = (status) =>
    ({
      'Pending': 'Đang chờ',
      'Confirmed': 'Đã xác nhận',
      'Delivered': 'Đang giao hàng',
      'Completed': 'Hoàn thành',
      'Cancelled': 'Hủy',
      'PendingPayment': 'Chờ thanh toán',
    }[status] || 'Đang chờ');

  const normalizeMealSession = (mealSession) =>
    ({
      'breakfast': 'Bữa sáng',
      'lunch': 'Bữa trưa',
      'dinner': 'Bữa tối',
      'snack': 'Bữa phụ',
    }[mealSession?.toLowerCase()] || 'Không xác định');

  // Fetch patient name
  const fetchPatientName = async (patientId, branchId) => {
    if (!patientId || patientId === 'Unknown' || patientId === 'NURSE_DEFAULT') {
      console.warn(`🔍 No valid patientId provided: ${patientId}, falling back to 'Không có'`);
      return 'Không có';
    }
    try {
      setIsLoadingPatientNames(true);
      console.log(`🔍 Fetching patient details for patientId: ${patientId}, branchId: ${branchId}`);
      const patientData = await orderService.getPatientDetails(patientId, branchId);
      console.log('🔍 API orderService.getPatientDetails response:', JSON.stringify(patientData, null, 2));
      if (!patientData) {
        console.error('🔍 No patientData returned for patientId:', patientId);
        message.error('Không thể tải thông tin bệnh nhân!');
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
      message.error('Không thể tải thông tin bệnh nhân!');
      return 'Không có';
    } finally {
      setIsLoadingPatientNames(false);
    }
  };

  useEffect(() => {
    const loadPatientNames = async () => {
      if (!orderDetails?.length) {
        console.warn('🔍 No orderDetails provided, setting empty groupedOrders');
        setGroupedOrders({});
        return;
      }

      console.log('🔍 Order details received:', JSON.stringify(orderDetails, null, 2));
      const ordersWithPatientNames = await Promise.all(
        orderDetails.map(async (order) => ({
          ...order,
          patientName: await fetchPatientName(order.patientId, branchId),
          paymentMethod: normalizePaymentMethod(order.paymentMethod),
          receiveType: normalizeReceiveType(order.receiveType),
          status: normalizeStatus(order.status),
          customerAddress: order.customerAddress || order.shippingAddress || 'Phòng bệnh nhân',
          note: order.note || '',
          shippingFee: order.shippingFee || 0,
          total: typeof order.total === 'number' ? order.total : 0,
          receiveDate: order.receiveDate ? moment(order.receiveDate) : null,
          mealSession: normalizeMealSession(order.mealSession),
        }))
      );

      const groupedByPatient = ordersWithPatientNames.reduce((acc, order) => {
        const patientId = order.patientId || 'Unknown';
        acc[patientId] = acc[patientId] || { patientName: order.patientName, orders: [] };
        acc[patientId].orders.push(order);
        return acc;
      }, {});

      setGroupedOrders(groupedByPatient);
      console.log('🔍 Grouped orders by patient:', JSON.stringify(groupedByPatient, null, 2));
    };

    loadPatientNames();
  }, [orderDetails, branchId]);

  const handleAction = async (orderId, action, newStatus) => {
    if (!orderId || !branchId) {
      message.error('Không thể thực hiện do thiếu thông tin đơn hàng!');
      return;
    }
    try {
      if (action === 'delete') {
        await deleteOrder({ orderId, branchId });
        message.success('Đã xóa đơn hàng!');
      } else {
        await updateOrder({ orderId, branchId, newStatus });
        message.success(`Đơn hàng đã được ${newStatus === 'Confirmed' ? 'xác nhận' : newStatus === 'Delivered' ? 'chuyển sang giao hàng' : 'hoàn thành'}!`);
      }
      setGroupedOrders((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((patientId) => {
          if (action === 'delete') {
            updated[patientId].orders = updated[patientId].orders.filter((order) => order.id !== orderId);
            if (!updated[patientId].orders.length) delete updated[patientId];
          } else {
            updated[patientId].orders = updated[patientId].orders.map((order) =>
              order.id === orderId ? { ...order, status: normalizeStatus(newStatus) } : order
            );
          }
        });
        return updated;
      });
      onStatusChange?.();
      if (action === 'delete') onCancel?.();
    } catch (error) {
      console.error(`Lỗi ${action === 'delete' ? 'xóa' : 'cập nhật'} đơn hàng:`, error);
      message.error(`${action === 'delete' ? 'Xóa' : 'Cập nhật'} đơn hàng thất bại!`);
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
      align: 'left',
      render: (foodName, record) => foodName || record.name || `Món ăn ID ${record.foodId || 'Unknown'}`,
    },
    {
      title: 'GIÁ TIỀN',
      dataIndex: 'price',
      align: 'center',
      key: 'price',
      render: (val) => val?.toLocaleString() || '0',
      width: 100,
    },
    {
      title: 'SỐ LƯỢNG',
      dataIndex: 'Qty',
      align: 'center',
      key: 'Qty',
      render: (qty) => qty ?? 1,
      width: 60,
    },
    {
      title: 'GHI CHÚ',
      dataIndex: 'note',
      key: 'note',
      render: (note) => note || '',
    },
    {
      title: 'TIỀN',
      dataIndex: 'total',
      align: 'center',
      key: 'total',
      render: (val) => val?.toLocaleString() || '0',
      width: 100,
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
        style={{ top: 0, padding: 0 }}
        bodyStyle={{ height: '100vh', overflowY: 'auto', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        className="custom-view-modal"
        aria-label="Chi tiết đơn hàng"
        aria-describedby="order-detail-description"
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
      style={{ top: 0, padding: 0 }}
      bodyStyle={{ height: '100vh', overflowY: 'auto', padding: '16px' }}
      className="custom-view-modal"
      aria-label="Chi tiết đơn hàng"
      aria-describedby="order-detail-description"
    >
      <div id="order-detail-description" className="order-detail-wrapper">
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <h2 style={{ fontWeight: 600, fontSize: '1.5rem' }}>
              Chi tiết đơn hàng của y tá {orderData.userName || 'Không xác định'}
            </h2>
          </Col>
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

        {Object.keys(groupedOrders).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Không có đơn hàng nào để hiển thị.</p>
          </div>
        ) : (
          <Collapse accordion>
            {Object.entries(groupedOrders).map(([patientId, { patientName, orders }]) => (
              <Panel header={`Bệnh nhân: ${patientName}`} key={patientId}>
                {orders.map((order) => (
                  <div key={order.id} style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                      <Col xs={24} sm={12} md={6}>
                        <label className="floating-label">Mã đơn hàng</label>
                        <Input value={order.id} disabled />
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <label className="floating-label">Buổi ăn</label>
                        <Input value={order.mealSession || 'Không xác định'} disabled />
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <label className="floating-label">Ngày nhận</label>
                        <DatePicker
                          value={order.receiveDate}
                          disabled
                          style={{ width: '100%' }}
                          format="DD/MM/YYYY"
                        />
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <label className="floating-label">Ghi chú</label>
                        <Input value={order.note || ''} disabled placeholder="Ghi chú" />
                      </Col>
                    </Row>

                    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                      <Col xs={24} sm={12} md={6}>
                        <label className="floating-label">Trạng thái</label>
                        <Input value={order.status} disabled placeholder="Trạng thái" />
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <label className="floating-label">Thành tiền</label>
                        <Input value={order.total?.toLocaleString() || '0'} disabled />
                      </Col>
                    </Row>

                    <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
                      {order.status === 'Đang chờ' && (
                        <Col xs={9} sm={6} md={3}>
                          <Button
                            type="primary"
                            style={{ width: '100%', backgroundColor: '#00B8A9', border: 'none' }}
                            onClick={() => handleAction(order.id, 'update', 'Confirmed')}
                            loading={isUpdating}
                          >
                            Xác Nhận
                          </Button>
                        </Col>
                      )}
                      {order.status === 'Đã xác nhận' && (
                        <Col xs={9} sm={6} md={3}>
                          <Button
                            type="primary"
                            style={{ width: '100%', backgroundColor: '#0d8ce0', border: 'none' }}
                            onClick={() => handleAction(order.id, 'update', 'Delivered')}
                            loading={isUpdating}
                          >
                            Đang giao hàng
                          </Button>
                        </Col>
                      )}
                      {order.status === 'Đang giao hàng' && (
                        <Col xs={9} sm={6} md={3}>
                          <Button
                            type="primary"
                            style={{ width: '100%', backgroundColor: '#52c41a', border: 'none' }}
                            onClick={() => handleAction(order.id, 'update', 'Completed')}
                            loading={isUpdating}
                          >
                            Hoàn thành
                          </Button>
                        </Col>
                      )}
                      {/* {['Đang chờ', 'Đã xác nhận'].includes(order.status) && (
                        <Col xs={9} sm={6} md={3}>
                          <Button
                            danger
                            style={{
                              width: '100%',
                              backgroundColor: '#ff4d4f',
                              color: '#fff',
                              border: 'none',
                            }}
                            onClick={() => handleAction(order.id, 'delete')}
                            loading={isDeleting}
                          >
                            Hủy Đơn
                          </Button>
                        </Col>
                      )} */}
                    </Row>

                    <Table
                      style={{ marginTop: 16 }}
                      columns={columns}
                      dataSource={order.orderDetails.map((item, index) => ({ ...item, key: index }))}
                      pagination={false}
                      bordered
                      scroll={{ x: 'max-content' }}
                      title={() => <h3>Chi tiết món ăn</h3>}
                    />
                  </div>
                ))}
              </Panel>
            ))}
          </Collapse>
        )}
      </div>
    </Modal>
  );
};

ViewPatientOrderDetail.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  orderData: PropTypes.shape({
    userName: PropTypes.string,
  }),
  orderDetails: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      patientId: PropTypes.string,
      paymentMethod: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      receiveType: PropTypes.string,
      status: PropTypes.string,
      customerAddress: PropTypes.string,
      note: PropTypes.string,
      shippingFee: PropTypes.number,
      total: PropTypes.number,
      receiveDate: PropTypes.string,
      mealSession: PropTypes.string,
      orderDetails: PropTypes.arrayOf(
        PropTypes.shape({
          foodName: PropTypes.string,
          price: PropTypes.number,
          Qty: PropTypes.number,
          note: PropTypes.string,
          total: PropTypes.number,
        })
      ),
    })
  ),
  branchId: PropTypes.string,
  onStatusChange: PropTypes.func,
  isPatientView: PropTypes.bool,
};

export default ViewPatientOrderDetail;