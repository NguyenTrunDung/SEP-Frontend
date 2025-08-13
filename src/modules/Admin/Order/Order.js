import React, { useState, useEffect, useMemo } from 'react';
import { message, Button, Tooltip, Tabs } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import ViewOrderDetail from './OrderDetails';
import { useAntModal } from '../../../hooks/useAntModal';
import { useOrders, ORDER_QUERY_KEYS } from '../../../hooks/queries/useOrders';
import { useGlobalErrorHandler } from '../../../hooks/useGlobalErrorHandler';
import { environment } from '../../../services/api/config';
import { orderService } from '../../../services/orderService';
import moment from 'moment';
import './Order.css';
import { PERMISSIONS } from '../../../constants/permissions';

const OrdersTableV2 = () => {
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    startOrderDate: moment().startOf('month').format('YYYY-MM-DD'),
    endOrderDate: moment().format('YYYY-MM-DD'),
    status: "Pending",
    isPaid: true,
  });
  const [viewOrder, setViewOrder] = useState(null);
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';
  const { open: viewOpen, showModal: showViewModal, handleCancel: handleViewCancel } = useAntModal();
  const { handleNonPermissionError } = useGlobalErrorHandler();
  const queryClient = useQueryClient();

  // Separate queries for patient and non-patient orders
  const patientOrderFilters = { ...filters, isOrderPatient: true };
  const nonPatientOrderFilters = { ...filters, isOrderPatient: false };

  const {
    orders: patientOrders,
    isLoading: isPatientLoading,
    error: patientError,
    refetch: refetchPatient,
  } = useOrders(branchId, patientOrderFilters, searchText);

  const {
    orders: nonPatientOrders,
    isLoading: isNonPatientLoading,
    error: nonPatientError,
    refetch: refetchNonPatient,
  } = useOrders(branchId, nonPatientOrderFilters, searchText);

  // State to manage orders data for each tab
  const [patientOrdersData, setPatientOrdersData] = useState([]);
  const [nonPatientOrdersData, setNonPatientOrdersData] = useState([]);

  useEffect(() => {
    if (patientError) {
      console.error('❌ Error fetching patient orders:', patientError);
      handleNonPermissionError(patientError, 'Không thể tải dữ liệu đơn hàng bệnh nhân.');
      setPatientOrdersData([]);
    } else if (patientOrders) {
      const orderList = Array.isArray(patientOrders) ? patientOrders : (patientOrders.data || []);
      const filtered = orderList
        .filter(
          order => String(order.branchId) === String(branchId) && order.isPatientOrder === true
        )
        .map(order => ({
          ...order,
          shippingAddress: order.customerAddress || 'N/A', // Map customerAddress to shippingAddress
        }));
      setPatientOrdersData(filtered);
      console.log('🔍 Patient orders data set:', filtered);
      // Log any unexpected non-patient orders
      const unexpectedNonPatientOrders = orderList.filter(
        order => String(order.branchId) === String(branchId) && order.isPatientOrder === false
      );
      if (unexpectedNonPatientOrders.length > 0) {
        console.warn('⚠️ Unexpected non-patient orders in patient tab:', unexpectedNonPatientOrders);
      }
    }
  }, [patientOrders, patientError, handleNonPermissionError, branchId]);

  useEffect(() => {
    if (nonPatientError) {
      console.error('❌ Error fetching non-patient orders:', nonPatientError);
      handleNonPermissionError(nonPatientError, 'Không thể tải dữ liệu đơn hàng khách và y tá.');
      setNonPatientOrdersData([]);
    } else if (nonPatientOrders) {
      const orderList = Array.isArray(nonPatientOrders) ? nonPatientOrders : (nonPatientOrders.data || []);
      const filtered = orderList
        .filter(
          order => String(order.branchId) === String(branchId) && order.isPatientOrder === false
        )
        .map(order => ({
          ...order,
          shippingAddress: order.customerAddress || 'N/A', // Map customerAddress to shippingAddress
        }));
      setNonPatientOrdersData(filtered);
      console.log('🔍 Non-patient orders data set:', filtered);
      // Log any unexpected patient orders
      const unexpectedPatientOrders = orderList.filter(
        order => String(order.branchId) === String(branchId) && order.isPatientOrder === true
      );
      if (unexpectedPatientOrders.length > 0) {
        console.warn('⚠️ Unexpected patient orders in non-patient tab:', unexpectedPatientOrders);
      }
    }
  }, [nonPatientOrders, nonPatientError, handleNonPermissionError, branchId]);

  const handleViewDetail = async (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể xem chi tiết đơn hàng từ chi nhánh khác!');
      return;
    }
    try {
      const orderDetails = await orderService.getOrderDetails(record.id);
      setViewOrder({
        ...record,
        customerAddress: record.customerAddress || record.shippingAddress || 'N/A', // Ensure customerAddress is passed
        orderDetails: orderDetails.data.map((item) => ({
          ...item,
          foodName: item.foodName || item.name || `Món ăn ID ${item.foodId || 'Unknown'}`,
        })),
      });
      showViewModal();
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      message.error('Không thể lấy chi tiết đơn hàng!');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      startOrderDate: moment().startOf('month').format('YYYY-MM-DD'),
      endOrderDate: moment().format('YYYY-MM-DD'),
      status: null,
      isPaid: null,
    });
    setSearchText('');
  };

  const handleStatusChange = () => {
    refetchPatient();
    refetchNonPatient();
    console.log('🔄 Refetching orders after status change');
  };

  const handleTabChange = (key) => {
    console.log(`🔄 Switching to tab: ${key}`);
    queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.list(branchId) });
  };

  const paginationConfig = (dataLength) => ({
    show: true,
    pageSizeOptions: [5, 10, 20, 50],
    showTotal: true,
    showSizeChanger: true,
    total: dataLength,
    showTotal: (total, range) => `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} mục`,
  });

  const renderTable = (data, isLoading, isPatientTab = false) => (
    <ReusableTableV2
      dataSource={data
        .filter(item => isPatientTab ? item.isPatientOrder === true : item.isPatientOrder === false)
        .map(item => ({ ...item, key: item.id }))}
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
        {
          dataIndex: 'shippingAddress',
          title: 'Địa chỉ',
          render: (text) => text || 'N/A',
          align: 'center',
        },
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
      pagination={paginationConfig(data.length)}
      rowKey="id"
      className="orders-table"
      resourceName="orders"
      editPermission={PERMISSIONS.ORDERS_EDIT}
      deletePermission={PERMISSIONS.ORDERS_DELETE}
      hideActionsOnNoPermission={true}
      showPermissionTooltips={true}
    />
  );

  return (
    <div className="orders-table-container">
      <PageWrapperV2
        title="Đơn hàng"
        loading={isPatientLoading || isNonPatientLoading}
        showAddButton={false}
        showRefreshButton={true}
        onRefresh={() => {
          refetchPatient();
          refetchNonPatient();
        }}
        resourceName="orders"
        viewPermission={PERMISSIONS.ORDERS_VIEW}
        hideOnNoPermission={true}
        permissionFallback={<div>Bạn không có quyền truy cập trang quản lý đơn hàng.</div>}
        searchProps={{
          value: searchText,
          onChange: (e) => {
            setSearchText(e.target.value);
          },
          placeholder: 'Tìm kiếm đơn hàng',
        }}
        filterProps={{
          filters: filters,
          onChange: handleFilterChange,
          onClear: handleClearFilters,
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
        <Tabs
          defaultActiveKey="patient"
          onChange={handleTabChange}
          items={[
            {
              key: 'patient',
              label: 'Đơn hàng bệnh nhân',
              children: renderTable(patientOrdersData, isPatientLoading, true),
            },
            {
              key: 'nonPatient',
              label: 'Đơn hàng khách & nhân viên bệnh viện',
              children: renderTable(nonPatientOrdersData, isNonPatientLoading, false),
            },
          ]}
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