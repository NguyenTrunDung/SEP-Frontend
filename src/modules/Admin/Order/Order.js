import React, { useState, useEffect, useMemo } from 'react';
import { message, Button, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import ViewOrderDetail from './OrderDetails';
import { useAntModal } from '../../../hooks/useAntModal';
import { useOrders } from '../../../hooks/queries/useOrders';
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
  const [viewOrder, setViewOrder] = useState(null);
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';

  const { open: viewOpen, showModal: showViewModal, handleCancel: handleViewCancel } = useAntModal();
  const { orders, isLoading, error, refetch } = useOrders(branchId, filters, searchText);
  const { handleNonPermissionError } = useGlobalErrorHandler();

  useEffect(() => {
    if (error) {
      console.error('❌ Error fetching orders:', error);
      handleNonPermissionError(error, 'Không thể tải dữ liệu đơn hàng.');
      setOrdersData([]);
    } else if (orders) {
      const orderList = Array.isArray(orders) ? orders : (orders.data || []);
      const filtered = orderList.filter(order => String(order.branchId) === String(branchId));
      setOrdersData(filtered);
    }
  }, [orders, error, handleNonPermissionError, branchId]);

  const filteredData = useMemo(() => {
    return searchText || Object.values(filters).some(val => val)
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
  }, [ordersData, searchText, filters]);

  const handleViewDetail = (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể xem chi tiết đơn hàng từ chi nhánh khác!');
      return;
    }
    setViewOrder(record);
    showViewModal();
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleStatusChange = () => {
    refetch(); // Refresh the order list after status change
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
        title="Đơn hàng"
        loading={isLoading}
        showAddButton={false}
        showRefreshButton={false}
        searchProps={{
          value: searchText,
          onChange: (e) => setSearchText(e.target.value),
          placeholder: 'Tìm kiếm đơn hàng',
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
                { value: 'delivered', label: 'Đang giao hàng' },
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
              render: (date) =>
                date ? new Date(date).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A',
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
                  delivered: 'Đang giao hàng',
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
              width: 80,
              align: 'center',
              render: (_, record) => (
                <div>
                  <Tooltip title="Xem chi tiết">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewDetail(record)}
                    />
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

      <ViewOrderDetail
        open={viewOpen}
        onCancel={handleViewCancel}
        orderData={viewOrder}
        branchId={branchId}
        onStatusChange={handleStatusChange} // Pass the refetch function
      />
    </div>
  );
};

export default OrdersTableV2;