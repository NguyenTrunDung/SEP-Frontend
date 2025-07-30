import React, { useEffect, useState } from 'react';
import { Modal, Button, message } from 'antd';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import { useDeliveryOrders, useUpdateOrder } from '../../../hooks/queries/useOrders';
import { environment } from '../../../services/api/config';
import { orderService } from '../../../services/orderService';
import moment from 'moment';
import './DeliveryStaff.css';

const DeliveryStaffView = () => {
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';
  const [filters, setFilters] = useState({
    startOrderDate: moment().startOf('month').format('YYYY-MM-DD'),
    endOrderDate: moment().format('YYYY-MM-DD'),
    status: 'Delivered', // Chỉ lấy các đơn hàng đang giao
  });
  const [searchText, setSearchText] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { orders: data, isLoading, error, refetch } = useDeliveryOrders(branchId, filters, searchText);
  const { mutate: updateOrder, isLoading: isUpdating } = useUpdateOrder();

  useEffect(() => {
    console.log('🔍 DeliveryStaffView data:', data);
    if (error) {
      console.error('❌ Error fetching delivery orders:', error);
      message.error('Không thể tải dữ liệu đơn hàng giao hàng.');
    }
  }, [error, data]);

  const handleConfirmClick = (record) => {
    setSelectedItem(record);
    setIsModalVisible(true);
  };

  const handleConfirmDone = async () => {
    try {
      await updateOrder({
        orderId: selectedItem.id,
        branchId,
        newStatus: 'Completed',
        updateFn: orderService.updateDeliveryOrderStatus,
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
    total: data.length,
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
        searchProps={{
          value: searchText,
          onChange: (e) => setSearchText(e.target.value),
          placeholder: 'Tìm kiếm đơn hàng',
        }}
      >
        <ReusableTableV2
          dataSource={data.map(item => ({ ...item, key: item.id }))}
          columns={columns}
          rowKey="id"
          listHeader="DANH SÁCH ĐƠN HÀNG"
          pagination={paginationConfig}
          emptyMessage="Không có dữ liệu."
          loading={isLoading}
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