import React, { useState, useMemo } from 'react';
import { Button, Input, Tooltip, Popconfirm, Modal, Descriptions, Spin, message } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import ReusableTable from '../../../components/common/ReusableTable';
import PropTypes from 'prop-types';
import { foodService } from '../../../services/foodService';

const FoodsTable = ({
  dataSource = [],
  loading = false,
  onEdit,
  onDelete,
  className,
  ...rest
}) => {
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Debug log để kiểm tra dữ liệu món ăn
  useMemo(() => {
    console.log('🔍 Foods dataSource:', dataSource);
  }, [dataSource]);

  const filteredData = useMemo(() => {
    if (!searchText) return dataSource;
    return dataSource.filter(item =>
      item.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [dataSource, searchText]);

  const handleEdit = (record) => {
    console.log('✏️ Editing food:', record);
    if (onEdit) {
      onEdit(record);
    }
  };

  const handleDelete = (record) => {
    console.log('🗑️ Deleting food:', record);
    if (onDelete) {
      onDelete(record);
    } else {
      message.success(`Đã xóa món ăn ${record.name}`);
    }
  };

  const handleViewDetails = async (record) => {
    setModalLoading(true);
    setIsModalVisible(true);
    try {
      const response = await foodService.getFood(record.id, '1');
      setSelectedFood(response);
    } catch (error) {
      message.error('Không thể tải chi tiết món ăn!');
      setIsModalVisible(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedFood(null);
    setModalLoading(false);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (value) {
      message.info(`Lọc món ăn theo: ${value}`);
    } else {
      message.info('Đã xóa bộ lọc tìm kiếm');
    }
  };

  const columns = [
    {
      title: 'TÊN MÓN ĂN',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => <span className="vietnamese-text">{name || '-'}</span>,
    },
    {
      title: 'HÌNH ẢNH',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (url) => (
        url ? <img src={url} alt="food" style={{ width: 50 }} /> : <span>Không có</span>
      ),
    },
    {
      title: 'DANH MỤC',
      dataIndex: 'category',
      key: 'category',
      render: (category, record) => {
        const categoryName = category?.name || 'Chưa chọn danh mục';
        console.log(`🔍 Rendering food id: ${record.id}, categoryId: ${record.categoryId}, Name: ${categoryName}`);
        return <span className="vietnamese-text">{categoryName}</span>;
      },
    },
    {
      title: 'GIÁ',
      dataIndex: 'priceForGuest',
      key: 'priceForGuest',
      sorter: (a, b) => a.priceForGuest - b.priceForGuest,
      render: (price) => (
        <span className="vietnamese-text">{price ? `${price.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ'}</span>
      ),
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'actions',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <div className="action-buttons">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              className="action-btn view-btn"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="action-btn edit-btn"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa món ăn"
              description={`Bạn có chắc chắn muốn xóa món ăn ${record.name}?`}
              onConfirm={() => handleDelete(record)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                className="action-btn delete-btn"
                size="small"
                danger
              />
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className={`reusable-table-container ${className || ''}`}>
      <div className="reusable-table-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SearchOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
          <Input
            placeholder="Tìm kiếm món ăn"
            value={searchText}
            onChange={handleSearch}
            style={{ width: 300 }}
            allowClear
          />
          {searchText && (
            <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
              {filteredData.length} kết quả
            </span>
          )}
        </div>
      </div>
      <ReusableTable
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} món ăn`,
        }}
        className="reusable-table"
        {...rest}
      />
      <Modal
        title="Chi tiết món ăn"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Đóng
          </Button>,
        ]}
        width={600}
        className="food-detail-modal"
      >
        {modalLoading ? (
          <div className="modal-loading">
            <Spin size="large" />
          </div>
        ) : selectedFood ? (
          <div className="food-detail-content">
            {selectedFood.imageUrl && (
              <img
                src={selectedFood.imageUrl}
                alt={selectedFood.name}
                className="food-image"
              />
            )}
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Tên món ăn">
                {selectedFood.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Danh mục">
                {selectedFood.category?.name || 'Chưa chọn danh mục'}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {selectedFood.description || 'Không có'}
              </Descriptions.Item>
              <Descriptions.Item label="Giá cho khách">
                {selectedFood.priceForGuest
                  ? `${selectedFood.priceForGuest.toLocaleString('vi-VN')} VNĐ`
                  : '0 VNĐ'}
              </Descriptions.Item>
              <Descriptions.Item label="Giá cho bệnh nhân">
                {selectedFood.priceForPatient
                  ? `${selectedFood.priceForPatient.toLocaleString('vi-VN')} VNĐ`
                  : '0 VNĐ'}
              </Descriptions.Item>
              <Descriptions.Item label="Giá cho nhân viên">
                {selectedFood.priceForStaff
                  ? `${selectedFood.priceForStaff.toLocaleString('vi-VN')} VNĐ`
                  : '0 VNĐ'}
              </Descriptions.Item>
              <Descriptions.Item label="Thứ tự sắp xếp">
                {selectedFood.sort || '0'}
              </Descriptions.Item>
              <Descriptions.Item label="Là món kèm">
                {selectedFood.isAddOn ? 'Có' : 'Không'}
              </Descriptions.Item>
              <Descriptions.Item label="Là món chính">
                {selectedFood.isSetDish ? 'Có' : 'Không'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        ) : (
          <p>Không có dữ liệu món ăn.</p>
        )}
      </Modal>
    </div>
  );
};

FoodsTable.propTypes = {
  dataSource: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      categoryId: PropTypes.number.isRequired,
      category: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        imageUrl: PropTypes.string,
        sort: PropTypes.number,
      }),
      description: PropTypes.string,
      priceForGuest: PropTypes.number.isRequired,
      priceForPatient: PropTypes.number,
      priceForStaff: PropTypes.number,
      imageUrl: PropTypes.string,
      isAddOn: PropTypes.bool,
      isSetDish: PropTypes.bool,
      sort: PropTypes.number,
    })
  ),
  loading: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  className: PropTypes.string,
};

export default FoodsTable;