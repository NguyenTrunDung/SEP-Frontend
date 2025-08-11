import React, { useEffect, useState } from 'react';
import { Modal, Button, message } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import { useDeliveryOrders, useUpdateOrder } from '../../../hooks/queries/useOrders';
import { environment } from '../../../services/api/config';
import moment from 'moment';
import './DeliveryStaff.css';
import { PERMISSIONS } from '../../../constants/permissions';

const DeliveryStaffView = () => {
  const queryClient = useQueryClient();
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';
  const [filters, setFilters] = useState({
    startOrderDate: moment().startOf('month').format('YYYY-MM-DD'),
    endOrderDate: moment().format('YYYY-MM-DD'),
    status: 'Delivered', // Match database casing
  });
  const [searchText, setSearchText] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { orders: data, isLoading, error, refetch } = useDeliveryOrders(branchId, filters, searchText, {
    onSuccess: (data) => {
      console.log('✅ Delivery orders fetched successfully:', data);
    },
    onError: (err) => {
      console.error('❌ Error fetching delivery orders:', err);
      message.error('Không thể tải dữ liệu đơn hàng giao hàng.');
    },
  });

  const { mutate: updateOrder, isLoading: isUpdating } = useUpdateOrder({
    onSuccess: () => {
      message.success('Xác nhận giao hàng thành công!');
      refetch();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || error.message || 'Xác nhận giao hàng thất bại!');
      console.error('❌ Update delivery order error:', error.response?.data || error);
    },
  });

  useEffect(() => {
    console.log('🔍 DeliveryStaffView - Branch ID:', branchId);
    console.log('🔍 DeliveryStaffView - Filters:', filters);
    console.log('🔍 DeliveryStaffView - Data:', data);
    console.log('🔍 DeliveryStaffView - Error:', error);
    queryClient.invalidateQueries({ queryKey: ['orders', 'list', { branchId }] });
    refetch();
  }, [filters, searchText, queryClient, refetch, data, error]);

  const handleConfirmClick = (record) => {
    setSelectedItem(record);
    setIsModalVisible(true);
  };

  const handleConfirmDone = async () => {
    try {
      await updateOrder({
        orderId: selectedItem.id,
        orderData: {
          status: 'Completed',
          branchId,
          customerName: selectedItem.customerName,
          customerPhone: selectedItem.customerPhone,
          customerAddress: selectedItem.customerAddress,
          receiveDate: selectedItem.receiveDate,
        },
        branchId,
        newStatus: 'Completed',
      });
      setIsModalVisible(false);
      setSelectedItem(null);
      refetch();
    } catch (error) {
      console.error('Lỗi xác nhận giao hàng:', error);
      message.error('Xác nhận giao hàng thất bại!');
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
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'TÊN KHÁCH HÀNG',
      dataIndex: 'customerName',
      align: 'left',
      render: (text) => text || 'N/A',
    },
    {
      title: 'NGÀY NHẬN',
      dataIndex: 'receiveDate',
      align: 'left',
      render: (date) => (date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'),
    },
    {
      title: 'SỐ ĐIỆN THOẠI',
      dataIndex: 'customerPhone',
      align: 'left',
      render: (text) => text || 'N/A',
    },
    {
      title: 'ĐỊA CHỈ',
      dataIndex: 'customerAddress',
      align: 'left',
      render: (text) => text || 'N/A',
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
          loading={isUpdating}
        />
      ),
    },
  ];

  const paginationConfig = {
    show: true,
    pageSizeOptions: [5, 10, 20],
    showSizeChanger: true,
    total: data?.length || 0,
    showTotal: (total, range) =>
      `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} đơn`,
  };

  return (
    <div className="delivery-table-container">
      <PageWrapperV2
        title="Nhân viên giao hàng"
        showAddButton={false}
        showRefreshButton={true}
        onRefresh={refetch}
        // Permission controls
        resourceName="delivery"
        viewPermission={PERMISSIONS.DELIVERY_VIEW}
        hideOnNoPermission={true}
        permissionFallback={<div>Bạn không có quyền truy cập trang quản lý giao hàng.</div>}
        searchProps={{
          value: searchText,
          onChange: (e) => setSearchText(e.target.value),
          placeholder: 'Tìm kiếm đơn hàng',
        }}
      >
        {error && <div style={{ color: 'red', marginBottom: 16 }}>Lỗi: {error.message}</div>}
        <ReusableTableV2
          dataSource={data.map(item => ({ ...item, key: item.id }))}
          columns={columns}
          rowKey="id"
          listHeader="DANH SÁCH ĐƠN HÀNG"
          pagination={paginationConfig}
          emptyMessage="Không có dữ liệu."
          loading={isLoading}
          // Permission controls for table actions
          resourceName="delivery"
          editPermission={PERMISSIONS.DELIVERY_STATUS}
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
          Đã giao hàng thành công
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
          >
            Huỷ
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default DeliveryStaffView;