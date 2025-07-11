import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'antd';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import { kitchenOrders } from '../../../mocks/kitchenMockData';
import './Kitchen.css';

const KitchenView = () => {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const grouped = {};

    kitchenOrders.forEach((order) => {
      order.items.forEach((item, index) => {
        const key = `${order.id}-${index}`;
        if (!grouped[order.id]) grouped[order.id] = [];
        grouped[order.id].push({
          key,
          id: order.id,
          name: item.name,
          quantity: item.quantity,
          note: item.note,
          createdAt: order.createdAt,
        });
      });
    });

    const rows = [];
    for (const id in grouped) {
      const group = grouped[id];
      group.forEach((item, index) => {
        rows.push({ ...item, rowSpan: index === 0 ? group.length : 0 });
      });
    }

    setData(rows);
  }, []);

  const handleConfirmClick = (record) => {
    setSelectedItem(record);
    setIsModalVisible(true);
  };

  const handleConfirmDone = () => {
    setData((prev) => prev.filter((item) => item.key !== selectedItem.key));
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
      `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} món`,
  };

  return (
    <div className="kitchen-table-container">
      <PageWrapperV2
        title="Nhà bếp"
        showAddButton={false}
        showRefreshButton={false}
        searchProps={{
          value: '',
          onChange: () => {},
          placeholder: '',
        }}
      >
        <ReusableTableV2
          dataSource={data}
          columns={columns}
          rowKey="key"
          listHeader="DANH SÁCH MÓN ĂN"
          pagination={paginationConfig}
          emptyMessage="Không có món ăn nào."
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

export default KitchenView;
