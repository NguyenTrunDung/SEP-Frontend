import React, { useEffect, useState } from 'react';
import { message, Button, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import ViewOrderDetail from './ViewOrderDetail';
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

  const { orders, isLoading, error, refetch } = useOrders(branchId, { isOrderPatient: true }, '', {
    onSuccess: (data) => {
      console.log('✅ Patient orders fetched successfully:', data);
    },
    onError: (err) => {
      console.error('❌ Error fetching patient orders:', err);
      message.error('Không thể tải dữ liệu đơn hàng của bạn.');
    },
  });

  useEffect(() => {
    if (error) {
      console.error('❌ Error fetching patient orders:', error);
      message.error('Không thể tải dữ liệu đơn hàng bệnh nhân.');
      setPatientOrdersData([]);
    } else if (orders) {
      const orderList = Array.isArray(orders) ? orders : (orders.data || []);
      const filtered = orderList
        .filter(
          (order) => String(order.branchId) === String(branchId) && order.isPatientOrder === true
        )
        .map((order) => ({
          ...order,
          userName: order.userName || 'Unknown Nurse',
          orderDetails: (order.orderDetails || []).map((item) => ({
            ...item,
            foodName: item.foodName || item.name || `Món ăn ID ${item.foodId || 'Unknown'}`,
            Qty: item.Qty ?? item.quantity ?? 1,
          })),
        }));
      setPatientOrdersData(filtered);
      console.log('🔍 Patient orders data set:', filtered);
    }
  }, [orders, error, branchId]);

  const handleViewDetail = async (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể xem chi tiết đơn hàng từ chi nhánh khác!');
      return;
    }
    try {
      const orderDetails = await orderService.getOrderDetails(record.id);
      setViewOrder({
        ...record,
        customerAddress: record.customerAddress || 'Phòng bệnh nhân',
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
    orderId: order.code || `ORD${order.id}`,
    orderTime: moment(order.orderDate).format('DD/MM/YYYY HH:mm'),
    userName: order.userName || 'Unknown Nurse',
    branchId: order.branchId,
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
        resourceName="patient-orders"
        viewPermission={PERMISSIONS.PATIENT_ORDER_VIEW}
        hideOnNoPermission={true}
        permissionFallback={<div>Bạn không có quyền xem đơn hàng bệnh nhân.</div>}
      >
        {error && <div style={{ color: 'red', marginBottom: 16 }}>Lỗi: {error.message}</div>}
        <ReusableTableV2
          dataSource={tableData}
          columns={columns}
          rowKey="key"
          listHeader="DANH SÁCH ĐƠN HÀNG BỆNH NHÂN"
          pagination={paginationConfig}
          emptyMessage="Chưa có đơn hàng nào."
          loading={isLoading}
          resourceName="patient-orders"
          hideActionsOnNoPermission={true}
          showPermissionTooltips={true}
        />
      </PageWrapperV2>
      <ViewOrderDetail
        open={viewOpen}
        onCancel={handleViewCancel}
        orderData={viewOrder}
        branchId={branchId}
        orderDetails={viewOrder?.orderDetails || []}
        isPatientView={true}
      />
    </div>
  );
};

export default PatientView;