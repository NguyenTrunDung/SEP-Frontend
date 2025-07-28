import React from 'react';
import { Button, Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import PropTypes from 'prop-types';
import './Department.css';

const DepartmentsTable = ({
  dataSource,
  loading,
  onEdit,
  onDelete,
  branchId,
}) => {
  const columns = [
    {
      title: 'TÊN PHÒNG BAN',
      dataIndex: 'name',
      key: 'name',
      align: 'left',
      primary: true,
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              disabled={String(record.branchId) !== String(branchId)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa phòng ban"
              description={`Bạn có chắc chắn muốn xóa phòng ban ${record.name}?`}
              onConfirm={() => onDelete(record)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              disabled={String(record.branchId) !== String(branchId)}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                disabled={String(record.branchId) !== String(branchId)}
              />
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  const paginationConfig = {
    show: true,
    pageSizeOptions: [5, 10, 20, 50],
    showTotal: true,
    showSizeChanger: true,
    total: dataSource.length,
    showTotal: (total, range) => `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} mục`,
  };

  return (
    <ReusableTableV2
      dataSource={dataSource}
      columns={columns}
      loading={loading}
      rowKey="id"
      pagination={paginationConfig}
      listHeader="TÊN PHÒNG BAN"
      emptyMessage="Không tìm thấy phòng ban nào."
      className="reusable-table-v2"
    />
  );
};

DepartmentsTable.propTypes = {
  dataSource: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ),
  loading: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default DepartmentsTable;