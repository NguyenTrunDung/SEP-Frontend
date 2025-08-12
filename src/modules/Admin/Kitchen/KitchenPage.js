import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import { useChefOrders, useUpdateOrder } from '../../../hooks/queries/useOrders';
import { orderService } from '../../../services/orderService';
import environment from '../../../config/environment';
import './Kitchen.css';
import PERMISSIONS from '../../../constants/permissions';

const KitchenView = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Get current branch ID from environment instead of hardcoded default
  const currentBranchId = environment.multiTenant.getCurrentBranchId();

  const { orders, isLoading, error, refetch } = useChefOrders(currentBranchId, {
    onSuccess: (data) => {
      console.log('✅ Chef orders fetched successfully:', data);
    },
    onError: (err) => {
      console.error('❌ Error fetching chef orders:', err);
      message.error('Không thể tải dữ liệu đơn hàng bếp.');
    },
  });

  const { mutate: updateOrderStatus, isLoading: isUpdating } = useUpdateOrder({
    onSuccess: () => {
      message.success('Cập nhật trạng thái món ăn thành công!');
      refetch();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái món ăn!');
      console.error('❌ Update order status error:', error.response?.data || error);
    },
  });

  // Show message if no branch is selected
  if (!currentBranchId) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h3>Vui lòng chọn chi nhánh để xem đơn hàng bếp</h3>
        <p>Bạn cần chọn một chi nhánh từ thanh điều hướng để xem đơn hàng bếp.</p>
      </div>
    );
  }

  const tableData = orders.flatMap((order) =>
    order.orderDetails?.map((item, index) => {
      console.log(`🔍 Processing order ${order.id}, item ${index}:`, item);
      const key = `${order.id}-${index}`;
      return {
        key,
        id: order.id,
        name: item.foodName || item.name || `Món ăn ID ${item.foodId || 'Unknown'}`,
        quantity: item.Qty ?? 1,
        note: item.note || '',
        createdAt: order.orderDate,
        rowSpan: index === 0 ? order.orderDetails.length : 0,
      };
    }) || []
  );

  const handleConfirmClick = (record) => {
    setSelectedItem(record);
    setIsModalVisible(true);
  };

  const handleConfirmDone = () => {
    if (selectedItem) {
      console.log('🚀 Sending status update for order:', {
        orderId: selectedItem.id,
        branchId: currentBranchId,
        newStatus: 'Delivered',
      });
      updateOrderStatus({
        orderId: selectedItem.id,
        branchId: currentBranchId,
        newStatus: 'Delivered',
      });
      setIsModalVisible(false);
      setSelectedItem(null);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'left',
      render: (text, record) => ({
        children: <span>{text}</span>,
        props: {
          rowSpan: record.rowSpan || 0,
        },
      }),
    },
    {
      title: 'MÓN ĂN',
      dataIndex: 'combined',
      align: 'left',
      colSpan: 2,
      render: (_, record) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '1px dashed #ccc',
            paddingBottom: 4,
            marginBottom: 4,
          }}
        >
          <div style={{ fontWeight: 600, color: '#3d3d3d' }}>{record.name}</div>
          <div style={{ fontWeight: 500, color: '#4a4a4a' }}>{record.quantity}</div>
        </div>
      ),
    },
    {
      title: '',
      dataIndex: 'quantity',
      colSpan: 0,
      render: () => null,
    },
    {
      title: 'GHI CHÚ',
      dataIndex: 'note',
      align: 'left',
      render: (note) =>
        note && !['✔', '✓'].includes(note) ? (
          <span style={{ color: '#888' }}>{note}</span>
        ) : null,
    },
    {
      title: '',
      dataIndex: 'action',
      align: 'center',
      render: (_, record) => (
        <Button
          shape="circle"
          type="text"
          className="check-button-hover"
          icon={<span style={{ fontSize: 16 }}>✓</span>}
          onClick={() => handleConfirmClick(record)}
          disabled={isUpdating}
        />
      ),
    },
  ];

  const paginationConfig = {
    show: true,
    pageSizeOptions: [5, 10, 20],
    showSizeChanger: true,
    total: tableData.length,
    showTotal: (total, range) =>
      `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} món`,
  };

  return (
    <div className="kitchen-table-container">
      <PageWrapperV2
        title="Nhà bếp"
        showAddButton={false}
        showRefreshButton={true}
        onRefresh={refetch}
        loading={isLoading}
        // Permission controls
        resourceName="kitchen"
        viewPermission={PERMISSIONS.KITCHEN_VIEW}
        hideOnNoPermission={true}
        permissionFallback={<div>Bạn không có quyền truy cập trang quản lý nhà bếp.</div>}
      >
        {error && <div style={{ color: 'red', marginBottom: 16 }}>Lỗi: {error.message}</div>}
        <ReusableTableV2
          dataSource={tableData}
          columns={columns}
          rowKey="key"
          listHeader="DANH SÁCH MÓN ĂN"
          pagination={paginationConfig}
          emptyMessage="Không có món ăn nào."
          loading={isLoading}
          // Permission controls for table actions
          resourceName="kitchen"
          editPermission={PERMISSIONS.KITCHEN_STATUS}
          hideActionsOnNoPermission={true}
          showPermissionTooltips={true}
        />
      </PageWrapperV2>

      <Modal
        open={isModalVisible}
        footer={null}
        closable={false}
        centered
        width={360}
        bodyStyle={{
          textAlign: 'center',
          padding: 24,
          borderRadius: 12,
          backgroundColor: '#fff',
        }}
      >
        <h2
          style={{
            fontWeight: '700',
            fontSize: 22,
            marginBottom: 24,
            color: '#333',
            fontFamily: 'sans-serif',
          }}
        >
          Đã hoàn thành món ăn
        </h2>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <Button
            style={{
              backgroundColor: '#ff4d4f',
              color: '#fff',
              padding: '6px 20px',
              fontSize: 16,
              borderRadius: 8,
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              border: 'none',
            }}
            onClick={handleConfirmDone}
            loading={isUpdating}
          >
            Xác Nhận
          </Button>

          <Button
            style={{
              backgroundColor: '#00B8A9',
              color: '#fff',
              padding: '6px 20px',
              fontSize: 16,
              borderRadius: 8,
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              border: 'none',
            }}
            onClick={handleCancel}
            disabled={isUpdating}
          >
            Huỷ
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default KitchenView;