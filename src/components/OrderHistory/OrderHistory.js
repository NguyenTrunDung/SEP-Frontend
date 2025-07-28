import React, { useState, useEffect } from 'react';
import { Modal, Typography, Spin, Alert, Button, Input, Table, message } from 'antd';
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
import './OrderHistory.css';

const { Text } = Typography;
const { Search } = Input;

const OrderHistoryModal = ({ visible, onClose }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
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

  const { mutate: createFeedback } = useCreateFeedback();
  const { feedbacks: orderFeedbacks, refetch: refetchFeedbacks } = useFeedbacksByOrder(
    selectedOrder?.id,
    selectedOrder?.branchId,
    { enabled: !!selectedOrder?.id && !!selectedOrder?.branchId }
  );
  const { mutateAsync: deleteFeedback } = useDeleteFeedback();
  const { mutateAsync: updateFeedback } = useUpdateFeedback();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!visible || !user) {
        if (environment.features?.enableLogging) {
          console.log('🔍 Không có user hoặc modal không hiển thị');
        }
        return;
      }

      setLoading(true);
      try {
        if (environment.features?.enableLogging) {
          console.log('🔍 Fetching orders for userId:', user.id);
        }
        const userOrders = await orderService.filterOrders({ userId: user.id });
        if (environment.features?.enableLogging) {
          console.log('🔍 API Response (filterOrders):', JSON.stringify(userOrders, null, 2));
        }

        const detailedOrders = await Promise.all(
          (userOrders.data || []).map(async (order) => {
            if (order.userId === user.id || order.userId === String(user.id)) {
              try {
                const orderDetails = await orderService.getOrderDetails(order.id);
                const items = Array.isArray(orderDetails.data) ? orderDetails.data : [];
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
                      if (environment.features?.enableLogging) {
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
                  items: items.map((item) => ({
                    menuItemId: item.id || `item-${Math.random()}`,
                    name: item.foodName || `Món ăn ID ${item.foodId ?? 'Unknown'}`,
                    price: item.price ?? 0,
                    quantity: item.qty ?? 0,
                    subtotal: item.total ?? (item.price ?? 0) * (item.qty ?? 0),
                  })),
                  feedbacks: normalizedFeedbacks,
                };
              } catch (error) {
                if (environment.features?.enableLogging) {
                  console.error(`❌ Failed to fetch details for order ${order.id}:`, error);
                }
                return {
                  ...order,
                  orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
                  items: [],
                  feedbacks: [],
                };
              }
            }
            return { ...order, feedbacks: [] };
          })
        );

        const normalizedOrders = detailedOrders
          .filter(
            (order) => order.userId === user.id || order.userId === String(user.id)
          )
          .map((order) => ({
            ...order,
            status: order.status?.toLowerCase() || 'unknown',
          }));

        if (normalizedOrders.length === 0) {
          if (environment.features?.enableLogging) {
            console.warn('⚠️ No orders found for userId:', user.id);
          }
        } else {
          if (environment.features?.enableLogging) {
            console.log('🔍 Filtered orders for userId:', user.id, 'Count:', normalizedOrders.length);
            console.log('🔍 Order details:', JSON.stringify(normalizedOrders.map((o) => ({ id: o.id, orderDate: o.orderDate, items: o.items, feedbacks: o.feedbacks })), null, 2));
          }
        }

        setOrders(normalizedOrders);
        setFilteredOrders(normalizedOrders);
        setError(null);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Không thể tải lịch sử đơn hàng. Vui lòng thử lại.';
        setError(errorMessage);
        if (environment.features?.enableLogging) {
          console.error('❌ Error fetching orders:', err.response?.data || err.message);
        }
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
        (order.status === 'completed' ? 'Hoàn thành' : order.status === 'pending' ? 'Đang chờ' : order.status || '').toLowerCase().includes(search.toLowerCase())
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
    const filtered = applyFilters(orders, value, null, null);
    setFilteredOrders(filtered);
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
    setFilteredOrders(orders);
    message.info('Đã làm mới danh sách đơn hàng');
  };

  const handleTableChange = (pagination, filters) => {
    setSearchText('');
    const idFilter = filters.id && filters.id[0] ? filters.id[0] : null;
    const statusFilter = filters.status && filters.status.length > 0 ? filters.status[0] : null;
    setFilterId(idFilter);
    setFilterStatus(statusFilter);
    const filtered = applyFilters(orders, '', idFilter, statusFilter);
    setFilteredOrders(filtered);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const handleFeedback = (order) => {
    if (order.status !== 'completed') {
      message.error('Chỉ có thể đánh giá các đơn hàng đã hoàn thành.');
      return;
    }
    setSelectedOrder(order);
    const hasFeedback = Array.isArray(order.feedbacks) && order.feedbacks.length > 0;

    if (hasFeedback) {
      setCurrentFeedbacks(order.feedbacks);
      setViewFeedbackVisible(true);
    } else {
      setFeedbackModalVisible(true);
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

    if (environment.features?.enableLogging) {
      console.log('🔍 Submitting feedback:', jsonData);
    }

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
          setFilteredOrders(applyFilters(updatedOrders, searchText, filterId, filterStatus));
          setCurrentFeedbacks([newFeedback]);
          message.success('Gửi đánh giá thành công!');
          setFeedbackModalVisible(false);
          setViewFeedbackVisible(true);
        },
        onError: (error) => {
          if (environment.features?.enableLogging) {
            console.error('❌ Failed to submit feedback:', error);
          }
          message.error(error.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
        },
      }
    );
  };

  const handleDeleteFeedback = async (feedbackId) => {
    try {
      if (environment.features?.enableLogging) {
        console.log('🔍 Deleting feedback:', feedbackId);
      }
      await deleteFeedback(feedbackId);
      
      const updatedOrders = orders.map((order) => {
        if (order.id === selectedOrder.id) {
          const updatedFeedbacks = order.feedbacks?.filter(fb => fb.id !== feedbackId) || [];
          return { ...order, feedbacks: updatedFeedbacks };
        }
        return order;
      });

      setOrders(updatedOrders);
      setFilteredOrders(applyFilters(updatedOrders, searchText, filterId, filterStatus));
      setCurrentFeedbacks(currentFeedbacks.filter(fb => fb.id !== feedbackId));
      message.success('Xóa đánh giá thành công!');
      if (currentFeedbacks.length === 1) {
        setViewFeedbackVisible(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      if (environment.features?.enableLogging) {
        console.error('❌ Failed to delete feedback:', error);
      }
      message.error(error.response?.data?.message || 'Xóa đánh giá thất bại');
    }
  };

  const getSortedOrders = () => {
    return [...filteredOrders].sort((a, b) => {
      try {
        return new Date(b.orderDate) - new Date(a.orderDate);
      } catch {
        return 0;
      }
    });
  };

  const handleEditFeedback = (feedback) => {
    if (environment.features?.enableLogging) {
      console.log('🔍 Opening edit modal for feedback:', feedback);
    }
    setEditFeedback(feedback);
    setEditModalVisible(true);
    setViewFeedbackVisible(false);
  };

  const handleUpdateFeedback = async (updatedFeedback) => {
    try {
      if (environment.features?.enableLogging) {
        console.log('🔍 Updating feedback:', updatedFeedback);
      }
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

      if (environment.features?.enableLogging) {
        console.log('🔍 Feedback data to send:', feedbackData);
      }

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
      setFilteredOrders(applyFilters(updatedOrders, searchText, filterId, filterStatus));
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
      if (environment.features?.enableLogging) {
        console.error('❌ Failed to update feedback:', error);
      }
      message.error(error.message || error.response?.data?.message || 'Cập nhật đánh giá thất bại');
    }
  };

  const overviewColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
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
    },
    {
      title: 'Món ăn',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <span>
          {Array.isArray(items) && items.length > 0
            ? items.map((item) => item.foodName || item.name || 'Không xác định').join(', ')
            : 'Không có món ăn'}
        </span>
      ),
    },
    {
      title: 'Thời gian đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
      sorter: (a, b) => {
        try {
          const dateA = new Date(a.orderDate);
          const dateB = new Date(b.orderDate);
          return dateA.valueOf() - dateB.valueOf();
        } catch (error) {
          if (environment.features?.enableLogging) {
            console.warn('⚠️ Date sorting error:', error);
          }
          return 0;
        }
      },
      render: (orderDate) =>
        orderDate ? new Date(orderDate).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A',
    },
    {
      title: 'Tổng thanh toán',
      dataIndex: 'total',
      key: 'total',
      render: (total) => formatAmount(total || 0),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
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
    },
    {
      title: '',
      key: 'action',
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
    },
  ];

  const detailColumns = [
    {
      title: 'Món ăn',
      dataIndex: 'foodName',
      key: 'foodName',
      align: 'left',
      render: (foodName, record) => foodName || record.name || 'Không xác định',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'left',
      render: (quantity, record) => record.qty ?? quantity ?? 0,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      align: 'left',
      render: (price) => formatAmount(price ?? 0),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'left',
      render: (subtotal, record) => formatAmount(record.total ?? subtotal ?? 0),
    },
  ];

  return (
    <>
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        centered
        width={860}
        closeIcon={<span style={{ color: '#000', fontSize: '26px', fontWeight: 400 }}>×</span>}
        styles={{
          content: { padding: 0, borderRadius: 8 },
          body: { padding: 0 },
          header: { display: 'none' },
        }}
      >
        <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
          <div
            style={{
              backgroundColor: '#b4c80f',
              color: '#000',
              padding: '12px 20px',
              fontSize: '18px',
              fontWeight: 400,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            Lịch sử đơn hàng
          </div>
          <div style={{ padding: '16px', background: '#fff' }}>
            <div className="reusable-table-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Search
                placeholder="Tìm kiếm theo mã đơn, tên món ăn hoặc trạng thái"
                onSearch={handleSearch}
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 300 }}
                allowClear
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                size="middle"
                style={{ display: 'flex', alignItems: 'center' }}
              >
                Làm mới
              </Button>
              {searchText && (
                <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                  {filteredOrders.length} kết quả
                </span>
              )}
            </div>
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {loading ? (
                <Spin style={{ display: 'block', textAlign: 'center', padding: '20px' }} />
              ) : error ? (
                <Alert message={error} type="error" showIcon style={{ marginBottom: '16px' }} />
              ) : filteredOrders.length === 0 ? (
                <Text>{searchText ? 'Không tìm thấy đơn hàng phù hợp.' : 'Chưa có đơn hàng nào.'}</Text>
              ) : (
                <ReusableTableV2
                  dataSource={getSortedOrders().map(order => ({ ...order, key: order.id }))}
                  columns={overviewColumns}
                  loading={loading}
                  listHeader="LỊCH SỬ ĐƠN HÀNG"
                  emptyMessage={searchText ? 'Không tìm thấy đơn hàng phù hợp.' : 'Chưa có đơn hàng nào.'}
                  pagination={{
                    show: true,
                    pageSizeOptions: [5, 10, 20],
                    showTotal: true,
                    showSizeChanger: true,
                    total: filteredOrders.length,
                    showTotal: (total, range) =>
                      `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} đơn hàng`,
                  }}
                  rowKey="id"
                  className="order-history-table"
                />
              )}
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        open={detailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={null}
        centered
        width={600}
        closeIcon={<span style={{ color: '#000', fontSize: '26px', fontWeight: 400 }}>×</span>}
        styles={{
          content: { padding: 0, borderRadius: 8 },
          body: { padding: 0 },
          header: { display: 'none' },
        }}
      >
        {selectedOrder && (
          <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
            <div
              style={{
                backgroundColor: '#b4c80f',
                color: '#000',
                padding: '12px 20px',
                fontSize: '18px',
                fontWeight: 400,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              Chi tiết đơn hàng
            </div>
            <div style={{ padding: '16px', background: '#fff' }}>
              <div style={{ display: 'block', fontSize: '13px', marginBottom: '2px' }}>
                <Text style={{ fontWeight: 400 }}>Mã đơn hàng: </Text>
                <Text style={{ fontWeight: 500 }}>{selectedOrder.id || 'Không xác định'}</Text>
              </div>
              <div style={{ display: 'block', fontSize: '13px', marginBottom: '2px' }}>
                <Text style={{ fontWeight: 400 }}>Người đặt: </Text>
                <Text style={{ fontWeight: 500 }}>{selectedOrder.customerName || 'Không xác định'}</Text>
              </div>
              <div style={{ display: 'block', fontSize: '13px', marginBottom: '2px' }}>
                <Text style={{ fontWeight: 400 }}>Thời gian đặt: </Text>
                <Text style={{ fontWeight: 500 }}>
                  {selectedOrder.orderDate
                    ? new Date(selectedOrder.orderDate).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
                    : 'N/A'}
                </Text>
              </div>
              <div style={{ display: 'block', fontSize: '13px', marginBottom: '2px' }}>
                <Text style={{ fontWeight: 400 }}>Thời gian cập nhật: </Text>
                <Text style={{ fontWeight: 500 }}>
                  {selectedOrder.updatedAt
                    ? new Date(selectedOrder.updatedAt).toLocaleString('vi-VN', { timeStyle: 'short' })
                    : 'N/A'}
                </Text>
              </div>
              <div style={{ display: 'block', fontSize: '13px', marginBottom: '2px' }}>
                <Text style={{ fontWeight: 400 }}>Tổng thanh toán: </Text>
                <Text style={{ fontWeight: 700 }}>
                  {formatAmount(selectedOrder.total || 0)}
                </Text>
              </div>
              <div style={{ display: 'block', fontSize: '13px', marginBottom: '2px' }}>
                <Text style={{ fontWeight: 400 }}>Trạng thái đơn hàng: </Text>
                <Text style={{ fontWeight: 500 }}>
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
              <Text style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                Chi tiết món ăn:
              </Text>
              <Table
                columns={detailColumns}
                dataSource={Array.isArray(selectedOrder.items) ? selectedOrder.items : []}
                pagination={false}
                rowKey="menuItemId"
                size="small"
                bordered
                style={{ marginTop: '8px' }}
                headStyle={{ backgroundColor: '#f0f0f0', fontWeight: 500 }}
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