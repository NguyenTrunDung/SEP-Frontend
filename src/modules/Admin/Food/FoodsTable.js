import React, { useState, useMemo } from 'react';
import { Button, Space, Input, Tooltip, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import ReusableTable from '../../../components/common/ReusableTable';
import { useFoodCategories } from '../../../hooks/queries/useFoodCategories';
import PropTypes from 'prop-types';

const FoodsTable = ({
  dataSource = [],
  loading = false,
  onEdit,
  onDelete,
  className,
  ...rest
}) => {
  const [searchText, setSearchText] = useState('');
  const { categories } = useFoodCategories(1); // Hardcoded branchId

  const categoryMap = useMemo(() => {
    return categories.reduce((map, category) => {
      map[category.id] = category.name;
      return map;
    }, {});
  }, [categories]);

  const filteredData = useMemo(() => {
    if (!searchText) return dataSource;
    return dataSource.filter(item =>
      item.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [dataSource, searchText]);

  const handleEdit = (record) => {
    if (onEdit) {
      onEdit(record);
    } else {
      message.info(`Chỉnh sửa món ăn ${record.name}`);
    }
  };

  const handleDelete = (record) => {
    if (onDelete) {
      onDelete(record);
    } else {
      message.success(`Đã xóa món ăn ${record.name}`);
    }
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
      title: 'DANH MỤC',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId) => (
        <span className="vietnamese-text">{categoryMap[categoryId] || 'Không xác định'}</span>
      ),
    },
    {
      title: 'MÔ TẢ',
      dataIndex: 'description',
      key: 'description',
      render: (description) => (
        <span className="vietnamese-text">{description || 'Không có'}</span>
      ),
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
      title: 'HÌNH ẢNH',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (url) => (
        url ? <img src={url} alt="food" style={{ width: 50 }} /> : <span>Không có</span>
      ),
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'actions',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <div className="action-buttons">
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
    </div>
  );
};

FoodsTable.propTypes = {
  dataSource: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      categoryId: PropTypes.number.isRequired,
      description: PropTypes.string,
      priceForGuest: PropTypes.number.isRequired,
      imageUrl: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  className: PropTypes.string,
};

export default FoodsTable;