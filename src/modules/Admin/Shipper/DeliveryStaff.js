import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'antd';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import { deliveryOrders } from '../../../mocks/deliveryMockData';
import './DeliveryStaff.css';

const DeliveryStaffView = () => {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    setData(deliveryOrders);
  }, []);

  const handleConfirmClick = (record) => {
    setSelectedItem(record);
    setIsModalVisible(true);
  };

  const handleConfirmDone = () => {
    setData((prev) => prev.filter((item) => item.id !== selectedItem.id));
    setIsModalVisible(false);
    setSelectedItem(null);
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
      dataIndex: 'tenKhachHang',
      align: 'left',
    },
    {
      title: 'NGÀY NHẬN',
      dataIndex: 'ngayNhan',
      align: 'left',
    },
    {
      title: 'SỐ ĐIỆN THOẠI',
      dataIndex: 'soDienThoai',
      align: 'left',
    },
    {
      title: 'ĐỊA CHỈ',
      dataIndex: 'diaChi',
      align: 'left',
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
        showRefreshButton={false}
      >
        <ReusableTableV2
          dataSource={data}
          columns={columns}
          rowKey="id"
          listHeader="DANH SÁCH ĐƠN HÀNG"
          pagination={paginationConfig}
          emptyMessage="Không có dữ liệu."
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