import React, { useState, useEffect } from 'react';
import { Modal, Typography, Spin, Alert, Button, Input, Table, message, Tabs } from 'antd';
import { EyeOutlined, CommentOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { formatAmount } from '../../mocks/orderHistoryData';
import ReusableTableV2 from '../../components/common/ReusableTableV2';
import FeedbackModal from '../Feedback/Feedback';
import ViewFeedbackModal from '../Feedback/ViewFeedbackModal';
import EditFeedbackModal from '../Feedback/EditFeedbackModal';
import { useCreateFeedback, useFeedbacksByOrder, useDeleteFeedback, useUpdateFeedback } from '../../hooks/queries/useFeedback';
import api from '../../services/api/config';
import { environment } from '../../services/api/config';
import { getImageUrlWithFallback } from '../../utils/imageUtils';
import { ROLES } from '../../constants/roles';
import './OrderHistory.css';
import { useTimezone } from '../../hooks/useTimezone';

const { Text } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

const OrderHistoryModal = ({ visible, onClose }) => {
  const { user } = useAuth();
  const { format } = useTimezone();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState({ patient: [], nurse: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [filterId, setFilterId] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [viewFeedbackVisible, setViewFeedbackVisible] = useState(false);
  const [currentFeedbacks, setCurrentFeedbacks] = useState([]);
  const [editFeedback, setEditFeedback] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('nurseOrders');

  const { mutate: createFeedback } = useCreateFeedback();
  const { feedbacks: orderFeedbacks, refetch: refetchFeedbacks } = useFeedbacksByOrder(
    selectedOrder?.id,
    selectedOrder?.branchId,
    { enabled: !!selectedOrder?.id && !!selectedOrder?.branchId }
  );
  const { mutateAsync: deleteFeedback } = useDeleteFeedback();
  const { mutateAsync: updateFeedback } = useUpdateFeedback();

  // Helper function to derive mealTime from orderDate if not provided
  const deriveMealTime = (orderDate) => {
    if (!orderDate) return 'Không xác định';
    const date = new Date(orderDate);
    const hour = date.getHours();
    if (hour >= 5 && hour < 11) return 'Sáng';
    if (hour >= 11 && hour < 17) return 'Trưa';
    return 'Chiều';
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!visible || !user) return;

      setLoading(true);
      try {
        const userOrders = await orderService.filterOrders({ userId: user.id });
        const detailedOrders = await Promise.all(
          (userOrders.data || []).map(async (order) => {
            if (order.userId === user.id || order.userId === String(user.id)) {
              try {
                const orderDetails = await orderService.getOrderDetails(order.id);
                const items = Array.isArray(orderDetails.data)
                  ? orderDetails.data.map((item) => ({
                    menuItemId: item.id || `item-${Math.random()}`,
                    name: item.foodName || item.name || `Món ăn ID ${item.foodId ?? 'Unknown'}`,
                    price: item.price ?? 0,
                    quantity: item.Qty ?? item.quantity ?? 1,
                    subtotal: item.total ?? (item.price ?? 0) * (item.Qty ?? item.quantity ?? 1),
                    imageUrl: item.imageUrl || item.food?.imageUrl || null,
                  }))
                  : [];
                const feedbackResponse = await api.get('/api/v1/Comment/By-Order', {
                  params: { OrderId: order.id, branchId: order.branchId },
                });
                const feedbacks = feedbackResponse.data.status === 'success' ? feedbackResponse.data.data : [];
                const normalizedFeedbacks = await Promise.all(
                  feedbacks.map(async (feedback) => {
                    let customerName = feedback.userId;
                    let avatar = null;
                    try {
                      const userResponse = await api.get(`/api/v1/BranchUserManagement/${feedback.userId}/branch/${feedback.branchId}`);
                      customerName = userResponse.data?.firstName && userResponse.data?.lastName
                        ? `${userResponse.data.firstName} ${userResponse.data.lastName}`
                        : feedback.userId;
                      avatar = userResponse.data?.avatar || null;
                    } catch (error) {
                      if (environment.features.enableLogging) {
                        console.warn(`⚠️ Failed to fetch customerName for userId ${feedback.userId}:`, error);
                      }
                    }
                    return {
                      id: feedback.id,
                      orderId: feedback.orderId,
                      userId: feedback.userId,
                      branchId: feedback.branchId,
                      rating: feedback.star,
                      content: feedback.commentLines,
                      reply: feedback.reply || null,
                      customerName,
                      avatar,
                      timestamp: feedback.createdAt || new Date().toISOString(),
                    };
                  })
                );

                return {
                  ...order,
                  orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
                  orderTypeDisplay: order.orderTypeDisplay || (order.isPatientOrder ? 'Đơn hàng bệnh nhân' : order.type || 'Y tá'),
                  items,
                  feedbacks: normalizedFeedbacks,
                  mealTime: order.mealTime || deriveMealTime(order.orderDate),
                };
              } catch (error) {
                return {
                  ...order,
                  orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
                  orderTypeDisplay: order.orderTypeDisplay || (order.isPatientOrder ? 'Đơn hàng bệnh nhân' : order.type || 'Y tá'),
                  items: [],
                  feedbacks: [],
                  mealTime: deriveMealTime(order.orderDate),
                };
              }
            }
            return {
              ...order,
              orderTypeDisplay: order.orderTypeDisplay || (order.isPatientOrder ? 'Đơn hàng bệnh nhân' : order.type || 'Y tá'),
              feedbacks: [],
              mealTime: deriveMealTime(order.orderDate),
            };
          })
        );

        const normalizedOrders = detailedOrders
          .filter(
            (order) => order.userId === user.id || order.userId === String(user.id)
          )
          .map((order) => ({
            ...order,
            status: order.status?.toLowerCase() || 'unknown',
            role: order.isPatientOrder ? 'patient' : (order.role || (user.role === 'NURSE' ? 'nurse' : 'patient')),
            mealTime: order.mealTime || deriveMealTime(order.orderDate),
          }));

        const patientOrders = normalizedOrders.filter(order => order.role === 'patient');
        const nurseOrders = normalizedOrders.filter(order => order.role === 'nurse');

        setOrders(normalizedOrders);
        setFilteredOrders({
          patient: patientOrders,
          nurse: nurseOrders,
        });
        setError(null);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Không thể tải lịch sử đơn hàng. Vui lòng thử lại.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, visible]);

  const applyFilters = (orders, search, idFilter, statusFilter) => {
    let filtered = [...orders];

    if (search) {
      filtered = filtered.filter(order =>
        String(order.id || '').toLowerCase().includes(search.toLowerCase()) ||
        (Array.isArray(order.items) && order.items.some(item =>
          (item.foodName || item.name || '').toLowerCase().includes(search.toLowerCase())
        )) ||
        (order.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
        (order.status === 'completed' ? 'Hoàn thành' : order.status === 'pending' ? 'Đang chờ' : order.status || '').toLowerCase().includes(search.toLowerCase()) ||
        (order.mealTime || '').toLowerCase().includes(search.toLowerCase())
      );
    } else {
      if (idFilter) {
        filtered = filtered.filter(order => String(order.id || '').toLowerCase().includes(idFilter.toLowerCase()));
      }
      if (statusFilter) {
        filtered = filtered.filter(order => order.status === statusFilter);
      }
    }

    return filtered;
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setFilterId(null);
    setFilterStatus(null);
    const filteredPatient = applyFilters(orders.filter(o => o.role === 'patient'), value, null, null);
    const filteredNurse = applyFilters(orders.filter(o => o.role === 'nurse'), value, null, null);
    setFilteredOrders({
      patient: filteredPatient,
      nurse: filteredNurse,
    });
    if (value) {
      message.info(`Tìm kiếm: ${value}`);
    } else {
      message.info('Đã xóa bộ lọc tìm kiếm');
    }
  };

  const handleReset = () => {
    setSearchText('');
    setFilterId(null);
    setFilterStatus(null);
    setFilteredOrders({
      patient: orders.filter(o => o.role === 'patient'),
      nurse: orders.filter(o => o.role === 'nurse'),
    });
    message.info('Đã làm mới danh sách đơn hàng');
  };

  const handleTableChange = (pagination, filters, tabKey) => {
    setSearchText('');
    const idFilter = filters.id && filters.id[0] ? filters.id[0] : null;
    const statusFilter = filters.status && filters.status.length > 0 ? filters.status[0] : null;
    setFilterId(idFilter);
    setFilterStatus(statusFilter);
    const filteredPatient = applyFilters(orders.filter(o => o.role === 'patient'), '', idFilter, statusFilter);
    const filteredNurse = applyFilters(orders.filter(o => o.role === 'nurse'), '', idFilter, statusFilter);
    setFilteredOrders({
      patient: tabKey === 'patientOrders' ? filteredPatient : filteredOrders.patient,
      nurse: tabKey === 'nurseOrders' ? filteredNurse : filteredOrders.nurse,
    });
  };

  const handleViewDetails = async (order) => {
    try {
      const orderDetails = await orderService.getOrderDetails(order.id);
      const detailedOrder = {
        ...order,
        orderDetails: Array.isArray(orderDetails.data)
          ? orderDetails.data.map((item) => ({
            ...item,
            menuItemId: item.id || `item-${Math.random()}`,
            foodName: item.foodName || item.name || `Món ăn ID ${item.foodId ?? 'Unknown'}`,
            price: item.price ?? 0,
            quantity: item.Qty ?? item.quantity ?? 1,
            subtotal: item.total ?? (item.price ?? 0) * (item.Qty ?? item.quantity ?? 1),
            imageUrl: item.imageUrl || item.food?.imageUrl || null,
          }))
          : [],
      };
      setSelectedOrder(detailedOrder);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('Không thể tải chi tiết đơn hàng.');
    }
  };

  const handleFeedback = async (order) => {
    if (order.status !== 'completed') {
      message.error('Chỉ có thể đánh giá các đơn hàng đã hoàn thành.');
      return;
    }
    try {
      const orderDetails = await orderService.getOrderDetails(order.id);
      const detailedOrder = {
        ...order,
        orderDetails: Array.isArray(orderDetails.data)
          ? orderDetails.data.map((item) => ({
            ...item,
            menuItemId: item.id || `item-${Math.random()}`,
            foodName: item.foodName || item.name || `Món ăn ID ${item.foodId ?? 'Unknown'}`,
            price: item.price ?? 0,
            quantity: item.Qty ?? item.quantity ?? 1,
            subtotal: item.total ?? (item.price ?? 0) * (item.Qty ?? item.quantity ?? 1),
            imageUrl: item.imageUrl || item.food?.imageUrl || null,
          }))
          : [],
      };
      setSelectedOrder(detailedOrder);
      const hasFeedback = Array.isArray(order.feedbacks) && order.feedbacks.length > 0;
      if (hasFeedback) {
        setCurrentFeedbacks(order.feedbacks);
        setViewFeedbackVisible(true);
      } else {
        setFeedbackModalVisible(true);
      }
    } catch (error) {
      message.error('Không thể tải chi tiết đơn hàng.');
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedOrder(null);
  };

  const handleFeedbackSubmit = (values) => {
    if (selectedOrder.status !== 'completed') {
      message.error('Không thể gửi đánh giá cho đơn hàng chưa hoàn thành.');
      return;
    }

    if (!values.rating || !values.content) {
      message.error('Vui lòng nhập đầy đủ số sao và nhận xét.');
      return;
    }

    const jsonData = {
      Star: values.rating,
      CommentLines: values.content,
      OrderId: selectedOrder.id,
      BranchId: selectedOrder.branchId,
      UserId: user.id || 'current-user-id',
    };

    createFeedback(
      { feedbackData: jsonData, branchId: selectedOrder.branchId },
      {
        onSuccess: async (newFeedback) => {
          const updatedOrders = orders.map((order) => {
            if (order.id === selectedOrder.id) {
              const updatedFeedbacks = Array.isArray(order.feedbacks)
                ? [...order.feedbacks, newFeedback]
                : [newFeedback];
              return { ...order, feedbacks: updatedFeedbacks };
            }
            return order;
          });
          setOrders(updatedOrders);
          setFilteredOrders({
            patient: applyFilters(updatedOrders.filter(o => o.role === 'patient'), searchText, filterId, filterStatus),
            nurse: applyFilters(updatedOrders.filter(o => o.role === 'nurse'), searchText, filterId, filterStatus),
          });
          setCurrentFeedbacks([newFeedback]);
          message.success('Gửi đánh giá thành công!');
          setFeedbackModalVisible(false);
          setViewFeedbackVisible(true);
        },
        onError: (error) => {
          message.error('Gửi đánh giá thất bại.');
        }
      }
    );
  };

  const handleDeleteFeedback = async (feedbackId) => {
    try {
      await deleteFeedback(feedbackId);
      const updatedOrders = orders.map((order) => {
        if (order.id === selectedOrder.id) {
          const updatedFeedbacks = order.feedbacks?.filter(fb => fb.id !== feedbackId) || [];
          return { ...order, feedbacks: updatedFeedbacks };
        }
        return order;
      });

      setOrders(updatedOrders);
      setFilteredOrders({
        patient: applyFilters(updatedOrders.filter(o => o.role === 'patient'), searchText, filterId, filterStatus),
        nurse: applyFilters(updatedOrders.filter(o => o.role === 'nurse'), searchText, filterId, filterStatus),
      });
      setCurrentFeedbacks(currentFeedbacks.filter(fb => fb.id !== feedbackId));
      message.success('Xóa đánh giá thành công!');
      if (currentFeedbacks.length === 1) {
        setViewFeedbackVisible(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Xóa đánh giá thất bại');
    }
  };

  const getSortedOrders = (orders) => {
    return [...orders].sort((a, b) => {
      try {
        return new Date(b.orderDate) - new Date(a.orderDate);
      } catch {
        return 0;
      }
    });
  };

  const handleEditFeedback = (feedback) => {
    setEditFeedback(feedback);
    setEditModalVisible(true);
    setViewFeedbackVisible(false);
  };

  const handleUpdateFeedback = async (updatedFeedback) => {
    try {
      if (!updatedFeedback.rating || !updatedFeedback.content) {
        throw new Error('Vui lòng nhập đầy đủ số sao và nhận xét.');
      }
      if (!updatedFeedback.id) {
        throw new Error('Thiếu ID đánh giá để cập nhật.');
      }

      const feedbackData = {
        Star: updatedFeedback.rating,
        CommentLines: updatedFeedback.content,
        Reply: updatedFeedback.reply || null,
      };

      await updateFeedback({ id: updatedFeedback.id, feedbackData, branchId: selectedOrder.branchId });

      const updatedOrders = orders.map((order) => {
        if (order.id === selectedOrder.id) {
          const updatedFeedbacks = order.feedbacks.map((fb) =>
            fb.id === updatedFeedback.id
              ? { ...fb, rating: updatedFeedback.rating, content: updatedFeedback.content, reply: updatedFeedback.reply }
              : fb
          );
          return { ...order, feedbacks: updatedFeedbacks };
        }
        return order;
      });

      setOrders(updatedOrders);
      setFilteredOrders({
        patient: applyFilters(updatedOrders.filter(o => o.role === 'patient'), searchText, filterId, filterStatus),
        nurse: applyFilters(updatedOrders.filter(o => o.role === 'nurse'), searchText, filterId, filterStatus),
      });
      setCurrentFeedbacks(
        currentFeedbacks.map((fb) =>
          fb.id === updatedFeedback.id
            ? { ...fb, rating: updatedFeedback.rating, content: updatedFeedback.content, reply: updatedFeedback.reply }
            : fb
        )
      );
      message.success('Cập nhật đánh giá thành công!');
      setEditModalVisible(false);
      setEditFeedback(null);
      setViewFeedbackVisible(true);
    } catch (error) {
      message.error(error.message || error.response?.data?.message || 'Cập nhật đánh giá thất bại');
    }
  };

  const overviewColumns = (tabKey) => [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      width: '15%',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm mã đơn hàng"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Tìm
          </Button>
          <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
            Xóa
          </Button>
        </div>
      ),
      onFilter: (value, record) => String(record.id || '').toLowerCase().includes(value.toLowerCase()),
      filteredValue: filterId ? [filterId] : null,
      responsive: ['xs', 'sm', 'md', 'lg'],
    },
    ...(tabKey === 'patientOrders'
      ? [
        {
          title: 'Tên bệnh nhân',
          dataIndex: 'customerName',
          key: 'customerName',
          width: '20%',
          render: (customerName) => customerName || 'Không xác định',
          responsive: ['sm', 'md', 'lg'],
        },
      ]
      : []),
    {
      title: 'Thời gian đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: '20%',
      sorter: (a, b) => {
        try {
          const dateA = new Date(a.orderDate);
          const dateB = new Date(b.orderDate);
          return dateA.valueOf() - dateB.valueOf();
        } catch (error) {
          return 0;
        }
      },
      render: (orderDate) =>
        orderDate
          ? new Date(orderDate).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
          : 'N/A',
      responsive: ['xs', 'sm', 'md', 'lg'],
    },
    {
      title: 'Tổng thanh toán',
      dataIndex: 'total',
      key: 'total',
      width: '15%',
      render: (total) => formatAmount(total || 0),
      responsive: ['xs', 'sm', 'md', 'lg'],
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status) => (
        {
          pending: 'Đang chờ',
          confirmed: 'Đã xác nhận',
          delivered: 'Đang giao hàng',
          completed: 'Hoàn thành',
          cancelled: 'Hủy',
          unknown: 'Không xác định',
        }[status?.toLowerCase() || 'unknown']
      ),
      filters: [
        { text: 'Đang chờ', value: 'pending' },
        { text: 'Đã xác nhận', value: 'confirmed' },
        { text: 'Đang giao hàng', value: 'delivered' },
        { text: 'Hoàn thành', value: 'completed' },
        { text: 'Hủy', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status?.toLowerCase() === value,
      filteredValue: filterStatus ? [filterStatus] : null,
      responsive: ['xs', 'sm', 'md', 'lg'],
    },
    {
      title: '',
      key: 'action',
      width: '15%',
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            type="text"
            icon={<EyeOutlined style={{ fontSize: '18px' }} />}
            onClick={() => handleViewDetails(record)}
            className="action-btn view-btn"
            size="small"
            title="Xem chi tiết"
          />
          <Button
            type="text"
            icon={<CommentOutlined style={{ fontSize: '18px' }} />}
            onClick={() => handleFeedback(record)}
            className="action-btn"
            size="small"
            title={record.feedbacks?.length > 0 ? 'Xem đánh giá' : 'Đánh giá'}
            disabled={record.status !== 'completed'}
          />
        </div>
      ),
      responsive: ['xs', 'sm', 'md', 'lg'],
    },
  ];

  const detailColumns = [
    {
      title: 'Món ăn',
      dataIndex: 'foodName',
      key: 'foodName',
      align: 'left',
      width: '35%',
      render: (foodName, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src={getImageUrlWithFallback(record.imageUrl, '/images/com.jpg', process.env.NODE_ENV === 'production')}
            alt={foodName || 'Món ăn'}
            className="food-image"
            onError={(e) => {
              e.target.src = '/images/com.jpg';
            }}
          />
          <Text>{foodName || record.name || 'Không xác định'}</Text>
        </div>
      ),
      responsive: ['xs', 'sm', 'md', 'lg'],
    },
    {
      title: 'Buổi ăn',
      dataIndex: 'mealTime',
      key: 'mealTime',
      align: 'left',
      width: '15%',
      render: (_, record) => selectedOrder?.mealTime || 'Không xác định',
      responsive: ['xs', 'sm', 'md', 'lg'],
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'left',
      width: '15%',
      render: (quantity) => quantity ?? 1,
      responsive: ['xs', 'sm', 'md', 'lg'],
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      align: 'left',
      width: '15%',
      render: (price) => formatAmount(price ?? 0),
      responsive: ['sm', 'md', 'lg'],
    },
    {
      title: 'Thành tiền',
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'left',
      width: '20%',
      render: (subtotal, record) => formatAmount(record.total ?? subtotal ?? 0),
      responsive: ['xs', 'sm', 'md', 'lg'],
    },
  ];

  return (
    <>
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        centered
        width="70vw"
        closeIcon={<span style={{ color: '#000', fontSize: '24px' }}>×</span>}
        styles={{
          content: { padding: 0, borderRadius: '8px' },
          body: { padding: 0 },
        }}
      >
        <div className="modal-content">
          <div className="modal-header">
            Lịch sử đơn hàng
          </div>
          <div className="modal-body">
            <div className="reusable-table-header">
              <Search
                placeholder="Tìm kiếm theo mã đơn, tên món ăn, tên bệnh nhân, trạng thái hoặc buổi ăn"
                onSearch={handleSearch}
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
                className="search-input"
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                size="middle"
                className="reset-button"
              >
                Làm mới
              </Button>
              {searchText && (
                <span className="search-results">
                  {activeTab === 'patientOrders' ? filteredOrders.patient.length : filteredOrders.nurse.length} kết quả
                </span>
              )}
            </div>
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key)}
              className="order-tabs"
            >
              <TabPane tab="Đơn hàng của tôi" key="nurseOrders">
                <div className="table-container">
                  {loading ? (
                    <Spin className="loading-spinner" />
                  ) : error ? (
                    <Alert message={error} type="error" showIcon className="error-alert" />
                  ) : filteredOrders.nurse.length === 0 ? (
                    <Text className="empty-text">{searchText ? 'Không tìm thấy đơn hàng phù hợp.' : 'Chưa có đơn hàng nào.'}</Text>
                  ) : (
                    <ReusableTableV2
                      dataSource={getSortedOrders(filteredOrders.nurse).map(order => ({ ...order, key: order.id }))}
                      columns={overviewColumns('nurseOrders')}
                      loading={loading}
                      listHeader="LỊCH SỬ ĐƠN HÀNG Y TÁ"
                      emptyMessage={searchText ? 'Không tìm thấy đơn hàng phù hợp.' : 'Chưa có đơn hàng nào.'}
                      pagination={{
                        show: true,
                        pageSizeOptions: [5, 10, 20],
                        showSizeChanger: true,
                        total: filteredOrders.nurse.length,
                        showTotal: (total, range) =>
                          `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} đơn hàng`,
                      }}
                      rowKey="id"
                      className="order-history-table"
                      onChange={(pagination, filters) => handleTableChange(pagination, filters, 'nurseOrders')}
                    />
                  )}
                </div>
              </TabPane>
              {user?.role === ROLES.NURSE && (
                <TabPane tab="Đơn hàng bệnh nhân" key="patientOrders">
                  <div className="table-container">
                    {loading ? (
                      <Spin className="loading-spinner" />
                    ) : error ? (
                      <Alert message={error} type="error" showIcon className="error-alert" />
                    ) : filteredOrders.patient.length === 0 ? (
                      <Text className="empty-text">{searchText ? 'Không tìm thấy đơn hàng phù hợp.' : 'Chưa có đơn hàng nào.'}</Text>
                    ) : (
                      <ReusableTableV2
                        dataSource={getSortedOrders(filteredOrders.patient).map(order => ({ ...order, key: order.id }))}
                        columns={overviewColumns('patientOrders')}
                        loading={loading}
                        listHeader="LỊCH SỬ ĐƠN HÀNG BỆNH NHÂN"
                        emptyMessage={searchText ? 'Không tìm thấy đơn hàng phù hợp.' : 'Chưa có đơn hàng nào.'}
                        pagination={{
                          show: true,
                          pageSizeOptions: [5, 10, 20],
                          showSizeChanger: true,
                          total: filteredOrders.patient.length,
                          showTotal: (total, range) =>
                            `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} đơn hàng`,
                        }}
                        rowKey="id"
                        className="order-history-table"
                        onChange={(pagination, filters) => handleTableChange(pagination, filters, 'patientOrders')}
                      />
                    )}
                  </div>
                </TabPane>
              )}
            </Tabs>
          </div>
        </div>
      </Modal>
      <Modal
        open={detailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={null}
        centered
        width="40vw"
        closeIcon={<span style={{ color: '#000', fontSize: '24px' }}>×</span>}
        styles={{
          content: { padding: 0, borderRadius: '4px' },
          body: { padding: 0 },
        }}
      >
        {selectedOrder && (
          <div className="modal-content">
            <div className="modal-header">
              Chi tiết đơn hàng
            </div>
            <div className="modal-body">
              <div className="order-detail-item">
                <Text className="detail-label">Mã đơn hàng: </Text>
                <Text className="detail-value">{selectedOrder.id || 'Không xác định'}</Text>
              </div>
              <div className="order-detail-item">
                <Text className="detail-label">Người đặt: </Text>
                <Text className="detail-value">{selectedOrder.customerName || 'Không xác định'}</Text>
              </div>
              <div className="order-detail-item">
                <Text className="detail-label">Loại đơn hàng: </Text>
                <Text className="detail-value">
                  {selectedOrder.orderTypeDisplay || (selectedOrder.isPatientOrder ? 'Đơn hàng bệnh nhân' : selectedOrder.type || 'Y tá')}
                </Text>
              </div>
              <div className="order-detail-item">
                <Text className="detail-label">Thời gian đặt: </Text>
                <Text className="detail-value">
                  {selectedOrder.orderDate
                    ? new Date(selectedOrder.orderDate).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
                    : 'N/A'}
                </Text>
              </div>
              <div className="order-detail-item">
                <Text className="detail-label">Thời gian cập nhật: </Text>
                <Text className="detail-value">
                  {selectedOrder.updatedAt
                    ? new Date(selectedOrder.updatedAt).toLocaleString('vi-VN', { timeStyle: 'short' })
                    : 'N/A'}
                </Text>
              </div>
              <div className="order-detail-item">
                <Text className="detail-label">Tổng thanh toán: </Text>
                <Text className="detail-value total">{formatAmount(selectedOrder.total || 0)}</Text>
              </div>
              <div className="order-detail-item">
                <Text className="detail-label">Trạng thái đơn hàng: </Text>
                <Text className="detail-value">
                  {
                    {
                      pending: 'Đang chờ',
                      confirmed: 'Đã xác nhận',
                      delivered: 'Đang giao hàng',
                      completed: 'Hoàn thành',
                      cancelled: 'Hủy',
                      unknown: 'Không xác định',
                    }[selectedOrder.status?.toLowerCase() || 'unknown']
                  }
                </Text>
              </div>
              <Text className="detail-section-title">Chi tiết món ăn:</Text>
              <Table
                columns={detailColumns}
                dataSource={Array.isArray(selectedOrder.orderDetails) ? selectedOrder.orderDetails : []}
                pagination={false}
                rowKey="menuItemId"
                size="small"
                bordered
                className="detail-table"
              />
            </div>
          </div>
        )}
      </Modal>
      <FeedbackModal
        visible={feedbackModalVisible}
        onClose={() => {
          setFeedbackModalVisible(false);
          setSelectedOrder(null);
        }}
        selectedOrder={selectedOrder}
        onSubmit={handleFeedbackSubmit}
      />
      <ViewFeedbackModal
        visible={viewFeedbackVisible}
        onClose={() => {
          setViewFeedbackVisible(false);
          setSelectedOrder(null);
        }}
        selectedOrder={selectedOrder}
        feedbacks={currentFeedbacks}
        onDelete={handleDeleteFeedback}
        onEdit={handleEditFeedback}
      />
      <EditFeedbackModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setEditFeedback(null);
          setSelectedOrder(null);
        }}
        selectedOrder={selectedOrder}
        feedback={editFeedback}
        onUpdate={handleUpdateFeedback}
      />
    </>
  );
};

export default OrderHistoryModal;