import React, { useState, useEffect, useMemo } from 'react';
import { message, Button, Tooltip, Popconfirm } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import CreateOrder from './CreateOrder';
import EditOrder from './EditOrder';
import ViewOrderDetail from './OrderDetails';
import { useAntModal } from '../../../hooks/useAntModal';
import {
  useOrders,
  useCreateOrder,
  useUpdateOrder,
  useDeleteOrder,
} from '../../../hooks/queries/useOrders';
import { useGlobalErrorHandler } from '../../../hooks/useGlobalErrorHandler';
import { environment } from '../../../services/api/config';
import './Order.css';

const OrdersTableV2 = () => {
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    startOrderDate: null,
    endOrderDate: null,
    status: null,
    paymentStatus: null,
  });
  const [ordersData, setOrdersData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';

  const { open: addOpen, showModal: showAddModal, handleCancel: handleAddCancel } = useAntModal();
  const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();
  const { open: viewOpen, showModal: showViewModal, handleCancel: handleViewCancel } = useAntModal();
  const { orders, isLoading, error, refetch } = useOrders(branchId, filters, searchText);
  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();
  const deleteOrderMutation = useDeleteOrder();
  const { handleNonPermissionError } = useGlobalErrorHandler();

  useEffect(() => {
    if (error) {
      console.error('❌ Error fetching orders:', error);
      handleNonPermissionError(error, 'Không thể tải dữ liệu đơn hàng.');
      setOrdersData([]);
    } else if (orders) {
      const orderList = Array.isArray(orders) ? orders : (orders.data || []);
      console.log('🔍 OrdersTableV2: Raw orders from useOrders:', orderList);
      const filtered = orderList.filter(order => String(order.branchId) === String(branchId));
      console.log(`🔍 OrdersTableV2: Filtered orders for branch ${branchId}:`, filtered);
      setOrdersData(filtered);
    }
  }, [orders, error, handleNonPermissionError, branchId]);

  const filteredData = useMemo(() => {
    console.log('🔍 OrdersTableV2: Computing filteredData with ordersData:', ordersData);
    const result = searchText || Object.values(filters).some(val => val)
      ? ordersData.filter(order => {
          const matchesSearch = searchText
            ? (order.customerName?.toLowerCase().includes(searchText.toLowerCase()) ||
               order.id?.toString().includes(searchText))
            : true;
          const matchesFilters =
            (!filters.startOrderDate || new Date(order.orderDate) >= new Date(filters.startOrderDate)) &&
            (!filters.endOrderDate || new Date(order.orderDate) <= new Date(filters.endOrderDate)) &&
            (!filters.status || order.status === filters.status) &&
            (!filters.paymentStatus || order.paymentStatus === filters.paymentStatus);
          return matchesSearch && matchesFilters;
        })
      : ordersData;
    console.log('🔍 OrdersTableV2: Filtered data result:', result);
    return result;
  }, [ordersData, searchText, filters]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      const payload = {
        branchId,
        customerName: formData.customerName,
        orderDate: formData.orderDate || new Date().toISOString(),
        receiveDate: formData.receiveDate || null,
        receiveTime: formData.receiveTime || null,
        shippingAddress: formData.shippingAddress || '',
        status: formData.status || 'pending',
        paymentStatus: formData.paymentStatus || 'pending',
        orderDetails: formData.orderDetails || [],
      };
      console.log('🔍 Payload sent to updateOrder:', payload);
      if (formData.id) {
        await updateOrderMutation.mutateAsync({ orderId: formData.id, orderData: payload, branchId });
        message.success('Cập nhật đơn hàng thành công');
        handleEditCancel();
      } else {
        await createOrderMutation.mutateAsync({ orderData: payload, branchId });
        message.success('Tạo đơn hàng thành công');
        handleAddCancel();
      }
      refetch();
    } catch (error) {
      console.error('❌ Failed to save order:', error);
      message.error(error?.response?.data?.message || 'Lỗi khi lưu đơn hàng!');
    }
  };

  const handleEdit = (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể chỉnh sửa đơn hàng từ chi nhánh khác!');
      return;
    }
    setSelectedOrder(record);
    showEditModal();
  };

  const handleDelete = async (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể xóa đơn hàng từ chi nhánh khác!');
      return;
    }
    try {
      await deleteOrderMutation.mutateAsync({ orderId: record.id, branchId });
      message.success('Xóa đơn hàng thành công');
      refetch();
    } catch (error) {
      console.error('❌ Failed to delete order:', error);
      message.error(error?.response?.data?.message || 'Lỗi khi xóa đơn hàng!');
    }
  };

  const handleViewDetail = (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể xem chi tiết đơn hàng từ chi nhánh khác!');
      return;
    }
    setViewOrder(record);
    showViewModal();
  };

  const handleRefresh = () => {
    refetch();
    message.success('Đã làm mới danh sách đơn hàng');
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const paginationConfig = {
    show: true,
    pageSizeOptions: [5, 10, 20, 50],
    showTotal: true,
    showSizeChanger: true,
    total: filteredData.length,
    showTotal: (total, range) => `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} mục`,
  };

  return (
    <div className="orders-table-container">
      <PageWrapperV2
        title="Quản lý đơn hàng"
        onAdd={showAddModal}
        onRefresh={handleRefresh}
        loading={isLoading}
        searchProps={{
          value: searchText,
          onChange: (e) => setSearchText(e.target.value),
          placeholder: 'Tìm kiếm theo tên hoặc mã đơn',
        }}
        filterProps={{
          onChange: handleFilterChange,
          fields: [
            { name: 'startOrderDate', type: 'date', label: 'Từ ngày' },
            { name: 'endOrderDate', type: 'date', label: 'Đến ngày' },
            {
              name: 'status',
              type: 'select',
              label: 'Trạng thái đơn hàng',
              options: [
                { value: 'pending', label: 'Đang chờ' },
                { value: 'confirmed', label: 'Đã xác nhận' },
                { value: 'completed', label: 'Hoàn thành' },
                { value: 'cancelled', label: 'Hủy' },
              ],
            },
            {
              name: 'paymentStatus',
              type: 'select',
              label: 'Trạng thái thanh toán',
              options: [
                { value: 'pending', label: 'Chưa thanh toán' },
                { value: 'paid', label: 'Đã thanh toán' },
                { value: 'processing', label: 'Đang xử lý' },
              ],
            },
          ],
        }}
      >
        <ReusableTableV2
          dataSource={filteredData.map(item => ({ ...item, key: item.id }))}
          columns={[
            { dataIndex: 'id', title: 'ID', primary: true },
            { dataIndex: 'customerName', title: 'Tên khách hàng', render: (text) => text || 'N/A' },
            {
              dataIndex: 'orderDate',
              title: 'Thời gian đặt',
              render: (date) => (date ? new Date(date).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'),
            },
            {
              dataIndex: 'receiveDate',
              title: 'Ngày nhận',
              render: (date) => (date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'),
            },
            {
              dataIndex: 'receiveTime',
              title: 'Giờ nhận',
              render: (time) => (time ? time : 'N/A'),
            },
            { dataIndex: 'shippingAddress', title: 'Địa chỉ', render: (text) => text || 'N/A' },
            {
              dataIndex: 'status',
              title: 'Trạng thái',
              render: (status) =>
                ({
                  pending: 'Đang chờ',
                  confirmed: 'Đã xác nhận',
                  completed: 'Hoàn thành',
                  cancelled: 'Hủy',
                }[status] || status || 'N/A'),
            },
            {
              dataIndex: 'paymentStatus',
              title: 'Thanh toán',
              render: (status) =>
                ({
                  pending: 'Chưa thanh toán',
                  paid: 'Đã thanh toán',
                  processing: 'Đang xử lý',
                }[status] || status || 'N/A'),
            },
            {
              title: null,
              key: 'actions',
              width: 180,
              align: 'center',
              render: (_, record) => (
                <div className="">
                  <Tooltip title="Xem chi tiết">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewDetail(record)}
                      className=""
                    />
                  </Tooltip>
                  <Tooltip title="Chỉnh sửa">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(record)}
                      className=""
                    />
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <Popconfirm
                      title="Xóa đơn hàng"
                      description={`Bạn có chắc chắn muốn xóa đơn hàng ${record.id}?`}
                      onConfirm={() => handleDelete(record)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        className=""
                        danger
                      />
                    </Popconfirm>
                  </Tooltip>
                </div>
              ),
            },
          ]}
          loading={isLoading}
          listHeader="DANH SÁCH ĐƠN HÀNG"
          emptyMessage="Không tìm thấy đơn hàng nào."
          pagination={paginationConfig}
          rowKey="id"
          className="orders-table"
        />
      </PageWrapperV2>

      <CreateOrder
        open={addOpen}
        onCancel={handleAddCancel}
        onSubmit={handleCreateOrUpdate}
        branchId={branchId}
      />
      <EditOrder
        open={editOpen}
        onCancel={handleEditCancel}
        onSubmit={handleCreateOrUpdate}
        formData={selectedOrder}
        branchId={branchId}
      />
      <ViewOrderDetail
        open={viewOpen}
        onCancel={handleViewCancel}
        orderData={viewOrder}
        branchId={branchId}
      />
    </div>
  );
};

export default OrdersTableV2;