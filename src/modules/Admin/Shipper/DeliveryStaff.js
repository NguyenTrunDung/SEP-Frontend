import React, { useEffect, useState } from 'react';
import { Modal, Button, message, Table, Space } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import { useDeliveryOrders, useUpdateOrder } from '../../../hooks/queries/useOrders';
import { environment } from '../../../services/api/config';
import { orderService } from '../../../services/orderService';
import moment from 'moment';
import { EyeOutlined } from '@ant-design/icons';
import './DeliveryStaff.css';
import { PERMISSIONS } from '../../../constants/permissions';
import { useTimezone } from '../../../hooks/useTimezone';

const DeliveryStaffView = () => {
  const queryClient = useQueryClient();
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';
  const { format, convert } = useTimezone();

  const [filters, setFilters] = useState({
    startOrderDate: convert.toDatePicker(new Date()).startOf('month').format('YYYY-MM-DD'),
    endOrderDate: convert.toDatePicker(new Date()).format('YYYY-MM-DD'),
    status: 'Delivered', // Match database casing
  });
  const [searchText, setSearchText] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

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

  const handleViewDetailsClick = async (record) => {
    setIsLoadingDetails(true);
    try {
      const details = await orderService.getOrderDetails(record.id);
      setOrderDetails(details.data);
      setIsDetailModalVisible(true);
    } catch (error) {
      console.error('❌ Error fetching order details:', error);
      message.error('Không thể tải chi tiết đơn hàng.');
    } finally {
      setIsLoadingDetails(false);
    }
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

  const handleDetailModalCancel = () => {
    setIsDetailModalVisible(false);
    setOrderDetails([]);
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
      render: (date) => (date ? format.date(date, 'DD/MM/YYYY') : 'N/A'),
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
      dataIndex: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Button
            shape="circle"
            type="text"
            icon={<EyeOutlined style={{ fontSize: 16 }} />}
            onClick={() => handleViewDetailsClick(record)}
          />
          <Button
            shape="circle"
            type="text"
            className="check-button-hover"
            icon={<span style={{ fontSize: 16 }}>✓</span>}
            onClick={() => handleConfirmClick(record)}
            loading={isUpdating}
          />
        </Space>
      ),
    },
  ];

  const detailColumns = [
    { title: '#', dataIndex: 'index', key: 'index', align: 'center', render: (_, __, idx) => idx + 1 },
    {
      title: 'TÊN MÓN',
      dataIndex: 'foodName',
      key: 'foodName',
      align: 'center',
      render: (foodName, record) => foodName || record.name || `Món ăn ID ${record.foodId || 'Unknown'}`,
    },
    {
      title: 'GIÁ TIỀN',
      dataIndex: 'price',
      align: 'center',
      key: 'price',
      render: (val) => format.currency(val) || '0',
    },
    {
      title: 'SỐ LƯỢNG',
      dataIndex: 'Qty',
      align: 'center',
      key: 'qty',
      render: (Qty) => Qty ?? 1,
    },
    { title: 'GHI CHÚ', dataIndex: 'note', key: 'note', render: (note) => note || '' },
    {
      title: 'TIỀN',
      dataIndex: 'total',
      align: 'center',
      key: 'total',
      render: (val) => format.currency(val) || '0',
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

      {/* Modal for confirming delivery */}
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

      {/* Modal for viewing dish details */}
      <Modal
        open={isDetailModalVisible}
        onCancel={handleDetailModalCancel}
        footer={null}
        title="Chi tiết món ăn"
        centered
        width={800}
        bodyStyle={{ padding: 24 }}
      >
        <Table
          columns={detailColumns}
          dataSource={orderDetails.map((item, index) => ({ ...item, key: index }))}
          pagination={false}
          bordered
          loading={isLoadingDetails}
        />
      </Modal>
    </div>
  );
};

export default DeliveryStaffView;