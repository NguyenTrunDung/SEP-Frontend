import React, { useEffect, useState } from 'react';
import { message, Button, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import ViewPatientOrderDetail from './ViewOrderDetail';
import { useOrders } from '../../../hooks/queries/useOrders';
import { useAntModal } from '../../../hooks/useAntModal';
import environment from '../../../config/environment';
import PERMISSIONS from '../../../constants/permissions';
import { orderService } from '../../../services/orderService';
import moment from 'moment';

const PatientView = () => {
  const branchId = environment.multiTenant.getCurrentBranchId();
  const [patientOrdersData, setPatientOrdersData] = useState([]);
  const [viewOrder, setViewOrder] = useState(null);
  const { open: viewOpen, showModal: showViewModal, handleCancel: handleViewCancel } = useAntModal();

  const { orders, isLoading, error, refetch } = useOrders(
    branchId,
    { isOrderPatient: true, status: 'Confirmed' },
    '',
    {
      onSuccess: (data) => {
        console.log('✅ Patient orders fetched successfully:', JSON.stringify(data, null, 2));
      },
      onError: (err) => {
        console.error('❌ Error fetching patient orders:', err);
        message.error('Không thể tải dữ liệu đơn hàng bệnh nhân.');
      },
    }
  );

  // Hàm lấy tên nurse từ userId
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
      console.warn(`🚧 Using fallback name for userId ${userId}`);
      return `Nurse ${userId.slice(0, 8)}`;
    }
  };

  useEffect(() => {
    if (error) {
      console.error('❌ Error fetching patient orders:', error);
      message.error('Không thể tải dữ liệu đơn hàng bệnh nhân.');
      setPatientOrdersData([]);
    } else if (orders) {
      const orderList = Array.isArray(orders) ? orders : (orders.data || []);
      console.log('🔍 Raw orders data:', JSON.stringify(orderList, null, 2));
      const fetchOrdersWithNurseNames = async () => {
        const filtered = await Promise.all(
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
                patientId: order.patientId || order.userId || 'Unknown', // Ensure patientId is included
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
        setPatientOrdersData(filtered);
        console.log('🔍 Filtered patient orders (Confirmed only):', JSON.stringify(filtered, null, 2));
      };
      fetchOrdersWithNurseNames();
    }
  }, [orders, error, branchId]);

  const handleViewDetail = async (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể xem chi tiết đơn hàng từ chi nhánh khác!');
      return;
    }
    try {
      console.log('🔍 Fetching order details for order ID:', record.id);
      console.log('🔍 Record data:', JSON.stringify(record, null, 2));
      const orderDetails = await orderService.getOrderDetails(record.id);
      console.log('🔍 Order details response:', JSON.stringify(orderDetails, null, 2));
      if (!orderDetails?.data) {
        throw new Error('Không có chi tiết đơn hàng từ API.');
      }
      const nurseName = await fetchNurseName(record.userId, record.branchId);
      const updatedOrder = {
        ...record,
        patientId: record.patientId || record.userId || 'Unknown',
        customerAddress: record.customerAddress || record.shippingAddress || 'Phòng bệnh nhân',
        status: record.status || 'Confirmed',
        total: record.total || 0,
        receiveDate: record.receiveDate || null,
        userName: nurseName,
        orderDetails: orderDetails.data.map((item) => ({
          ...item,
          foodName: item.foodName || item.name || `Món ăn ID ${item.foodId || 'Unknown'}`,
          Qty: item.Qty ?? item.quantity ?? 1,
        })),
      };
      setViewOrder(updatedOrder);
      console.log('🔍 Set viewOrder:', JSON.stringify(updatedOrder, null, 2));
      showViewModal();
    } catch (error) {
      console.error('❌ Failed to fetch order details:', error);
      message.error('Không thể lấy chi tiết đơn hàng!');
      setViewOrder({}); // Set to empty object instead of null
    }
  };

  const handleStatusChange = () => {
    refetch();
    console.log('🔄 Refetching patient orders after status change');
  };

  if (!branchId) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h3>Vui lòng chọn chi nhánh để xem đơn hàng</h3>
        <p>Bạn cần chọn một chi nhánh để xem đơn hàng bệnh nhân.</p>
      </div>
    );
  }

  const tableData = patientOrdersData.map((order) => ({
    key: order.id,
    id: order.id,
    orderId: order.id,
    orderTime: moment(order.orderDate).format('DD/MM/YYYY HH:mm'),
    total: order.total || 0,
    receiveDate: order.receiveDate || null,
    userName: order.userName,
    branchId: order.branchId,
    patientId: order.patientId || 'Unknown', // Ensure patientId is included
  }));

  const columns = [
    {
      title: 'Mã Đơn Hàng',
      dataIndex: 'orderId',
      align: 'left',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Ngày Đặt',
      dataIndex: 'orderTime',
      align: 'left',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Tên Người Tạo',
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
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const paginationConfig = {
    show: true,
    pageSizeOptions: [5, 10, 20],
    showSizeChanger: true,
    total: tableData.length,
    showTotal: (total, range) =>
      `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} đơn hàng`,
  };

  return (
    <div className="patient-view-table-container">
      <PageWrapperV2
        title="Đơn Hàng Bệnh Nhân"
        showAddButton={false}
        showRefreshButton={true}
        onRefresh={refetch}
        loading={isLoading}
        resourceName="kitchen-orders"
        viewPermission={[]}
       hideOnNoPermission={false}
        // permissionFallback={<div>Bạn không có quyền xem đơn hàng bệnh nhân.</div>}
      >
        {error && <div style={{ color: 'red', marginBottom: 16 }}>Lỗi: {error.message}</div>}
        <ReusableTableV2
          dataSource={tableData}
          columns={columns}
          rowKey="key"
          listHeader="DANH SÁCH ĐƠN HÀNG BỆNH NHÂN (ĐÃ XÁC NHẬN)"
          pagination={paginationConfig}
          emptyMessage="Chưa có đơn hàng đã xác nhận nào."
          loading={isLoading}
          resourceName="patient-orders"
          hideActionsOnNoPermission={true}
          showPermissionTooltips={true}
        />
      </PageWrapperV2>
      <ViewPatientOrderDetail
        open={viewOpen}
        onCancel={handleViewCancel}
        orderData={viewOrder || {}}
        branchId={branchId}
        orderDetails={viewOrder?.orderDetails || []}
        onStatusChange={handleStatusChange}
        isPatientView={true}
      />
    </div>
  );
};

export default PatientView;