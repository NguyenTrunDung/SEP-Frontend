// src/components/OrderHistory/OrderHistory.js
import React, { useState, useEffect } from 'react';
import { Modal, Typography, Spin, Alert, Table, message, Input, Button, Rate, Form, Input as AntInput } from 'antd';
import { EyeOutlined, CommentOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { ROLES } from '../../constants/roles';
import { formatDateTime, formatAmount } from '../../mocks/orderHistoryData';

const { Text } = Typography;
const { Search } = Input;
const { TextArea } = AntInput;

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
  const [feedbackForm] = Form.useForm();
  const [filterId, setFilterId] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!visible || !user) return;

      if (user.role !== ROLES.NURSE) {
        message.error('Chỉ điều dưỡng mới có thể xem lịch sử đơn hàng.');
        setError('Chỉ điều dưỡng mới có thể xem lịch sử đơn hàng.');
        return;
      }

      setLoading(true);
      try {
        const userOrders = await orderService.getOrders({ userId: user.id });
        setOrders(userOrders);
        setFilteredOrders(userOrders);
        setError(null);
      } catch (err) {
        setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại.');
        console.error('Error fetching orders:', err);
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
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.items.some(item =>
          item.name.toLowerCase().includes(search.toLowerCase())
        ) ||
        (order.status === 'DELIVERED' ? 'Đã hoàn tất' : 'Đang giao hàng').toLowerCase().includes(search.toLowerCase())
      );
    } else {
      if (idFilter) {
        filtered = filtered.filter(order => order.id.toLowerCase().includes(idFilter.toLowerCase()));
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
    setSelectedOrder(order);
    setFeedbackModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedOrder(null);
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModalVisible(false);
    setSelectedOrder(null);
    feedbackForm.resetFields();
  };

  const handleFeedbackSubmit = (values) => {
    console.log('Feedback submitted for order:', selectedOrder.id, values);
    message.success('Gửi đánh giá thành công!');
    handleCloseFeedbackModal();
  };

  const getSortedOrders = () => {
    return [...filteredOrders].sort((a, b) => {
      try {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.valueOf() - dateA.valueOf();
      } catch (error) {
        console.warn('Date sorting error:', error);
        return 0;
      }
    });
  };

  const overviewColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <AntInput
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
      onFilter: (value, record) => record.id.toLowerCase().includes(value.toLowerCase()),
      filteredValue: filterId ? [filterId] : null,
    },
    {
      title: 'Món ăn',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <span>
          {items.map((item) => item.name).join(', ')}
        </span>
      ),
    },
    {
      title: 'Thời gian đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => {
        try {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateA.valueOf() - dateB.valueOf();
        } catch (error) {
          console.warn('Date sorting error:', error);
          return 0;
        }
      },
      render: (createdAt) => formatDateTime(new Date(createdAt)),
    },
    {
      title: 'Tổng thanh toán',
      dataIndex: 'total',
      key: 'total',
      render: (total) => formatAmount(total),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className="vietnamese-text">
          {status === 'DELIVERED' ? 'Đã hoàn tất' : status === 'PENDING' ? 'Đang giao hàng' : status}
        </span>
      ),
      filters: [
        { text: 'Đã hoàn tất', value: 'DELIVERED' },
        { text: 'Đang giao hàng', value: 'PENDING' },
        { text: 'Đang chuẩn bị', value: 'PREPARING' },
        { text: 'Sẵn sàng', value: 'READY' },
        { text: 'Đã hủy', value: 'CANCELLED' },
      ],
      onFilter: (value, record) => record.status === value,
      filteredValue: filterStatus ? [filterStatus] : null,
    },
    {
      title: 'Hành động',
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
            title="Đánh giá"
            disabled={record.status !== 'DELIVERED'}
          />
        </div>
      ),
    },
  ];

  const detailColumns = [
    {
      title: 'Món ăn',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => formatAmount(price),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (subtotal) => formatAmount(subtotal),
    },
  ];

  return (
    <>
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        centered
        width={800}
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
            Đơn hàng đã đặt
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
                <Table
                  columns={overviewColumns}
                  dataSource={getSortedOrders()}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} đơn hàng`,
                  }}
                  rowKey="id"
                  size="small"
                  bordered
                  style={{ marginTop: '8px' }}
                  headStyle={{ backgroundColor: '#f0f0f0', fontWeight: 500 }}
                  onChange={handleTableChange}
                  className="reusable-table"
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
                <Text style={{ fontWeight: 500 }}>{selectedOrder.id}</Text>
              </div>
              <div style={{ display: 'block', fontSize: '13px', marginBottom: '2px' }}>
                <Text style={{ fontWeight: 400 }}>Thời gian đặt: </Text>
                <Text style={{ fontWeight: 500 }}>
                  {formatDateTime(new Date(selectedOrder.createdAt))}
                </Text>
              </div>
              <div style={{ display: 'block', fontSize: '13px', marginBottom: '2px' }}>
                <Text style={{ fontWeight: 400 }}>Thời gian cập nhật: </Text>
                <Text style={{ fontWeight: 500 }}>
                  {formatDateTime(new Date(selectedOrder.updatedAt))}
                </Text>
              </div>
              <div style={{ display: 'block', fontSize: '13px', marginBottom: '2px' }}>
                <Text style={{ fontWeight: 400 }}>Tổng thanh toán: </Text>
                <Text style={{ fontWeight: 700 }}>
                  {formatAmount(selectedOrder.total)}
                </Text>
              </div>
              <div style={{ display: 'block', fontSize: '13px', marginBottom: '2px' }}>
                <Text style={{ fontWeight: 400 }}>Trạng thái đơn hàng: </Text>
                <Text style={{ fontWeight: 500 }}>
                  {selectedOrder.status === 'DELIVERED' ? 'Đã hoàn tất' : selectedOrder.status === 'PENDING' ? 'Đang giao hàng' : selectedOrder.status}
                </Text>
              </div>
              <Text style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                Chi tiết món ăn:
              </Text>
              <Table
                columns={detailColumns}
                dataSource={selectedOrder.items}
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
      <Modal
        open={feedbackModalVisible}
        onCancel={handleCloseFeedbackModal}
        footer={null}
        centered
        width={500}
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
              Đánh giá đơn hàng
            </div>
            <div style={{ padding: '16px', background: '#fff' }}>
              <div style={{ display: 'block', fontSize: '13px', marginBottom: '8px' }}>
                <Text style={{ fontWeight: 400 }}>Mã đơn hàng: </Text>
                <Text style={{ fontWeight: 500 }}>{selectedOrder.id}</Text>
              </div>
              <Form
                form={feedbackForm}
                onFinish={handleFeedbackSubmit}
                layout="vertical"
              >
                <Form.Item
                  name="rating"
                  label="Đánh giá chất lượng"
                  rules={[{ required: true, message: 'Vui lòng chọn số sao đánh giá!' }]}
                >
                  <Rate />
                </Form.Item>
                <Form.Item
                  name="comment"
                  label="Nhận xét"
                  rules={[{ required: true, message: 'Vui lòng nhập nhận xét!' }]}
                >
                  <TextArea rows={4} placeholder="Nhập nhận xét của bạn" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ backgroundColor: '#b4c80f', borderColor: '#b4c80f', color: '#000' }}
                  >
                    Gửi đánh giá
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default OrderHistoryModal;