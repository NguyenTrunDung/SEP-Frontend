import React, { useEffect, useState } from 'react';
import { message, Button, Tooltip, Tabs } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import ViewOrderDetail from './OrderDetails';
import ViewPatientOrderDetail from '../Kitchen/ViewOrderDetail';
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
    status: 'Pending',
    isPaid: true,
  });
  const [viewOrder, setViewOrder] = useState(null);
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';
  const { open: viewOpen, showModal: showViewModal, handleCancel: handleViewCancel } = useAntModal();
  const { handleNonPermissionError } = useGlobalErrorHandler();
  const queryClient = useQueryClient();

  // Separate queries for patient and non-patient orders
  const patientOrderFilters = { ...filters, isOrderPatient: true, status: 'Confirmed' };
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

  // Fetch nurse name for patient orders
  const fetchNurseName = async (userId, branchId) => {
    try {
      if (!userId || userId === 'NURSE_DEFAULT') {
        console.warn(`🔍 No valid userId provided: ${userId}, falling back to 'Unknown Nurse'`);
        return 'Unknown Nurse';
      }
      const userData = await orderService.getUserDetails(userId, branchId);
      const nurseName = userData?.firstName && userData?.lastName
        ? `${userData.firstName} ${userData.lastName}`
        : `Nurse ${userId.slice(0, 8)}`;
      console.log(`🔍 Fetched nurse name for userId ${userId}: ${nurseName}`);
      return nurseName;
    } catch (error) {
      console.error(`❌ Failed to fetch nurse name for userId ${userId} in branch ${branchId}:`, error);
      return `Nurse ${userId.slice(0, 8)}`;
    }
  };

  // Process patient orders
  useEffect(() => {
    if (patientError) {
      console.error('❌ Error fetching patient orders:', patientError);
      handleNonPermissionError(patientError, 'Không thể tải dữ liệu đơn hàng bệnh nhân.');
      setPatientOrdersData([]);
    } else if (patientOrders) {
      const orderList = Array.isArray(patientOrders) ? patientOrders : (patientOrders.data || []);
      console.log('🔍 Raw patient orders data:', JSON.stringify(orderList, null, 2));
      const fetchOrdersWithNurseNames = async () => {
        const ordersWithDetails = await Promise.all(
          orderList
            .filter(
              (order) =>
                String(order.branchId) === String(branchId) &&
                order.isPatientOrder === true &&
                ['Confirmed', 'confirmed', 'CONFIRMED'].includes(order.status)
            )
            .map(async (order) => {
              const nurseName = await fetchNurseName(order.userId, order.branchId);
              return {
                ...order,
                userName: nurseName,
                patientId: order.patientId || order.userId || 'Unknown',
                orderDate: order.orderDate || new Date().toISOString(),
                total: order.total || 0,
                receiveDate: order.receiveDate || null,
                orderDetails: (order.orderDetails || []).map((item) => ({
                  ...item,
                  foodName: item.foodName || item.name || `Món ăn ID ${item.foodId || 'Unknown'}`,
                  Qty: item.Qty ?? item.quantity ?? 1,
                })),
              };
            })
        );

        // Group by nurse
        const groupedByNurse = ordersWithDetails.reduce((acc, order) => {
          const userId = order.userId || 'NURSE_DEFAULT';
          if (!acc[userId]) {
            acc[userId] = {
              userId,
              userName: order.userName,
              branchId: order.branchId,
              orders: [],
            };
          }
          acc[userId].orders.push(order);
          return acc;
        }, {});

        const groupedData = Object.values(groupedByNurse);
        setPatientOrdersData(groupedData);
        console.log('🔍 Grouped patient orders by nurse:', JSON.stringify(groupedData, null, 2));
      };
      fetchOrdersWithNurseNames();
    }
  }, [patientOrders, patientError, branchId, handleNonPermissionError]);

  // Process non-patient orders
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
          shippingAddress: order.customerAddress || 'N/A',
        }));
      setNonPatientOrdersData(filtered);
      console.log('🔍 Non-patient orders data set:', filtered);
    }
  }, [nonPatientOrders, nonPatientError, handleNonPermissionError, branchId]);

  const handleViewDetail = async (record, isPatientTab) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể xem chi tiết đơn hàng từ chi nhánh khác!');
      return;
    }
    try {
      if (isPatientTab) {
        const nurseOrders = record.orders;
        const ordersWithDetails = await Promise.all(
          nurseOrders.map(async (order) => {
            const orderDetails = await orderService.getOrderDetailsWithPatientInfo(order.id);
            if (!orderDetails?.data) {
              throw new Error(`Không có chi tiết đơn hàng cho ID ${order.id}`);
            }
            return {
              ...order,
              orderDetails: orderDetails.data.map((item) => ({
                ...item,
                foodName: item.foodName || item.name || `Món ăn ID ${item.foodId || 'Unknown'}`,
                Qty: item.Qty ?? item.quantity ?? 1,
              })),
            };
          })
        );
        setViewOrder({ userName: record.userName, orders: ordersWithDetails });
        console.log('🔍 Set viewOrder for patient tab:', JSON.stringify(ordersWithDetails, null, 2));
      } else {
        const orderDetails = await orderService.getOrderDetails(record.id);
        setViewOrder({
          ...record,
          customerAddress: record.customerAddress || record.shippingAddress || 'N/A',
          orderDetails: orderDetails.data.map((item) => ({
            ...item,
            foodName: item.foodName || item.name || `Món ăn ID ${item.foodId || 'Unknown'}`,
            Qty: item.Qty ?? item.quantity ?? 1,
          })),
        });
        console.log('🔍 Set viewOrder for non-patient tab:', JSON.stringify(record, null, 2));
      }
      showViewModal();
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      message.error('Không thể lấy chi tiết đơn hàng!');
      setViewOrder(isPatientTab ? {} : null);
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

  const patientColumns = [
    {
      title: 'Tên Y Tá',
      dataIndex: 'userName',
      align: 'left',
      render: (text) => <span>{text}</span>,
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
              onClick={() => handleViewDetail(record, true)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const nonPatientColumns = [
    { dataIndex: 'id', title: 'ID', primary: true, align: 'center' },
    { dataIndex: 'customerName', title: 'Tên khách hàng', render: (text) => text || 'N/A', align: 'center' },
    {
      dataIndex: 'orderDate',
      title: 'Ngày đặt',
      render: (date) =>
        date ? new Date(date).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : 'N/A',
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
              onClick={() => handleViewDetail(record, false)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

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
              children: (
                <ReusableTableV2
                  dataSource={patientOrdersData.map(nurse => ({
                    key: nurse.userId,
                    userId: nurse.userId,
                    userName: nurse.userName,
                    branchId: nurse.branchId,
                    orders: nurse.orders,
                  }))}
                  columns={patientColumns}
                  rowKey="key"
                  listHeader="DANH SÁCH Y TÁ CÓ ĐƠN HÀNG BỆNH NHÂN (ĐÃ XÁC NHẬN)"
                  pagination={paginationConfig(patientOrdersData.length)}
                  emptyMessage="Chưa có y tá nào có đơn hàng đã xác nhận."
                  loading={isPatientLoading}
                  resourceName="patient-orders"
                  hideActionsOnNoPermission={true}
                  showPermissionTooltips={true}
                />
              ),
            },
            {
              key: 'nonPatient',
              label: 'Đơn hàng khách & nhân viên bệnh viện',
              children: (
                <ReusableTableV2
                  dataSource={nonPatientOrdersData.map(item => ({ ...item, key: item.id }))}
                  columns={nonPatientColumns}
                  loading={isNonPatientLoading}
                  listHeader="DANH SÁCH ĐƠN HÀNG"
                  emptyMessage="Không tìm thấy đơn hàng nào."
                  pagination={paginationConfig(nonPatientOrdersData.length)}
                  rowKey="id"
                  className="orders-table"
                  resourceName="orders"
                  editPermission={PERMISSIONS.ORDERS_EDIT}
                  deletePermission={PERMISSIONS.ORDERS_DELETE}
                  hideActionsOnNoPermission={true}
                  showPermissionTooltips={true}
                />
              ),
            },
          ]}
        />
      </PageWrapperV2>

      {viewOrder?.orders ? (
        <ViewPatientOrderDetail
          open={viewOpen}
          onCancel={handleViewCancel}
          orderData={viewOrder}
          branchId={branchId}
          onStatusChange={handleStatusChange}
          orderDetails={viewOrder.orders}
          isPatientView={true}
        />
      ) : (
        <ViewOrderDetail
          open={viewOpen}
          onCancel={handleViewCancel}
          orderData={viewOrder}
          branchId={branchId}
          onStatusChange={handleStatusChange}
          orderDetails={viewOrder?.orderDetails || []}
        />
      )}
    </div>
  );
};

export default OrdersTableV2;