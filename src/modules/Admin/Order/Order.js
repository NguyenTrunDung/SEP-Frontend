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
import { orderService } from '../../../services/orderService';
import moment from 'moment';
import './Order.css';

const OrdersTableV2 = () => {
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    startOrderDate: moment().startOf('month').format('YYYY-MM-DD'),
    endOrderDate: moment().format('YYYY-MM-DD'),
    status: null,
    isPaid: null,
  });
  const [ordersData, setOrdersData] = useState([]);
  const [viewOrder, setViewOrder] = useState(null);
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';

  const { open: viewOpen, showModal: showViewModal, handleCancel: handleViewCancel } = useAntModal();
  const { orders, isLoading, error, refetch } = useOrders(branchId, filters, searchText);
  const { handleNonPermissionError } = useGlobalErrorHandler();

  useEffect(() => {
    refetch();
  }, [filters, searchText, refetch]);

  useEffect(() => {
    if (error) {
      console.error('❌ Error fetching orders:', error);
      handleNonPermissionError(error, 'Không thể tải dữ liệu đơn hàng.');
      setOrdersData([]);
    } else if (orders) {
      const orderList = Array.isArray(orders) ? orders : (orders.data || []);
      const filtered = orderList.filter(order => String(order.branchId) === String(branchId));
      setOrdersData(filtered);
      console.log('🔍 Orders data set:', filtered);
    }
  }, [orders, error, handleNonPermissionError, branchId]);

  const filteredData = useMemo(() => {
    return ordersData;
  }, [ordersData]);

  const handleViewDetail = async (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể xem chi tiết đơn hàng từ chi nhánh khác!');
      return;
    }
    try {
      const orderDetails = await orderService.getOrderDetails(record.id);
      setViewOrder({
        ...record,
        orderDetails: orderDetails.data.map((item) => ({
          ...item,
          foodName: item.foodName || item.name || `Món ăn ID ${item.foodId || 'Unknown'}`,
        })),
      });
      showViewModal();
      refetch();
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      message.error('Không thể lấy chi tiết đơn hàng!');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    refetch();
  };

  const handleClearFilters = () => {
    setFilters({
      startOrderDate: moment().startOf('month').format('YYYY-MM-DD'),
      endOrderDate: moment().format('YYYY-MM-DD'),
      status: null,
      isPaid: null,
    });
    setSearchText('');
    refetch();
  };

  const handleStatusChange = () => {
    refetch();
    console.log('🔄 Refetching orders after status change');
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
        showRefreshButton={true}
        onRefresh={refetch}
        searchProps={{
          value: searchText,
          onChange: (e) => {
            setSearchText(e.target.value);
            refetch();
          },
          placeholder: 'Tìm kiếm đơn hàng',
        }}
        filterProps={{
          filters: filters,
          onChange: handleFilterChange,
          fields: [
            { name: 'startOrderDate', type: 'date', label: 'Từ ngày' },
            { name: 'endOrderDate', type: 'date', label: 'Đến ngày' },
            {
              name: 'status',
              type: 'select',
              label: 'Trạng thái đơn hàng',
              options: [
                { value: 'Pending', label: 'Chưa xử lý' },
                { value: 'Confirmed', label: 'Đang xử lý' },
                { value: 'Delivered', label: 'Đang giao hàng' },
                { value: 'Completed', label: 'Hoàn thành' },
                { value: 'Cancelled', label: 'Đã hủy' },
                { value: 'PendingPayment', label: 'Chờ thanh toán' },
              ],
            },
            {
              name: 'isPaid',
              type: 'select',
              label: 'Trạng thái thanh toán',
              options: [
                { value: true, label: 'Hoàn thành' },
                { value: false, label: 'Chưa xử lý' },
              ],
            },
          ],
        }}
      >
        <ReusableTableV2
          dataSource={filteredData.map(item => ({ ...item, key: item.id }))}
          columns={[
            { dataIndex: 'id', title: 'ID', primary: true, align: 'center' },
            { dataIndex: 'customerName', title: 'Tên khách hàng', render: (text) => text || 'N/A', align: 'center' },
            {
              dataIndex: 'orderDate',
              title: 'Thời gian đặt',
              render: (date) =>
                date ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span>{new Date(date).toLocaleTimeString('vi-VN', { timeStyle: 'short' })}</span>
                    <span>{new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                  </div>
                ) : 'N/A',
              align: 'center',
            },
            {
              dataIndex: 'receiveDate',
              title: 'Ngày nhận',
              render: (date) => (date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'),
              align: 'center',
            },
            {
              dataIndex: 'receiveTime',
              title: 'Giờ nhận',
              render: (time) => (time ? time : 'N/A'),
              align: 'center',
            },
            { dataIndex: 'shippingAddress', title: 'Địa chỉ', render: (text) => text || 'N/A', align: 'center' },
            {
              dataIndex: 'status',
              title: 'Trạng thái',
              render: (status) => ({
                pending: 'Chưa xử lý',
                confirmed: 'Đang xử lý',
                delivered: 'Đang giao hàng',
                completed: 'Hoàn thành',
                cancelled: 'Đã hủy',
                pendingpayment: 'Chờ thanh toán',
              }[status.toLowerCase()] || status || 'N/A'),
              align: 'center',
            },
            {
              dataIndex: 'isPaid',
              title: 'Thanh toán',
              render: (isPaid) => (isPaid ? 'Hoàn thành' : 'Chưa xử lý'),
              align: 'center',
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
        onStatusChange={handleStatusChange}
        orderDetails={viewOrder?.orderDetails || []}
      />
    </div>
  );
};

export default OrdersTableV2;