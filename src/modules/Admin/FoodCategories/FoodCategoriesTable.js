import React, { useState, useMemo } from 'react';
import { Button, Space, Input, Tooltip, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import ReusableTable from '../../../components/common/ReusableTable';
import PropTypes from 'prop-types';

const FoodCategoriesTable = ({
  dataSource = [],
  loading = false,
  onEdit,
  onDelete,
  className,
  ...rest
}) => {
  const [searchText, setSearchText] = useState('');

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
      message.info(`Chỉnh sửa danh mục ${record.name}`);
    }
  };

  const handleDelete = (record) => {
    if (onDelete) {
      onDelete(record);
    } else {
      message.success(`Đã xóa danh mục ${record.name}`);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (value) {
      message.info(`Lọc danh mục theo: ${value}`);
    } else {
      message.info('Đã xóa bộ lọc tìm kiếm');
    }
  };

  const columns = [
    {
      title: 'TÊN DANH MỤC',
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
        url ? <img src={url} alt="category" style={{ width: 50 }} /> : <span>Không có</span>
      ),
    },
    {
      title: 'THỨ TỰ',
      dataIndex: 'sort',
      key: 'sort',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.sort - b.sort,
      render: (sort) => <span className="vietnamese-text">{sort || 0}</span>,
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
              title="Xóa danh mục"
              description={`Bạn có chắc chắn muốn xóa danh mục ${record.name}?`}
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
            placeholder="Tìm kiếm danh mục"
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
            `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} danh mục`,
        }}
        className="reusable-table"
        {...rest}
      />
    </div>
  );
};

FoodCategoriesTable.propTypes = {
  dataSource: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      imageUrl: PropTypes.string,
      sort: PropTypes.number,
    })
  ),
  loading: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  className: PropTypes.string,
};

export default FoodCategoriesTable;