// src/components/nurse/PatientTable.js
import React, { useState, useMemo } from 'react';
import { Button, Input, Tooltip, message } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import ReusableTable from '../../../components/common/ReusableTable';
import PropTypes from 'prop-types';

const PatientTable = ({
  dataSource = [],
  loading = false,
  onView,
  className,
  onSearch,
  ...rest
}) => {
  const [searchText, setSearchText] = useState('');

  const filteredData = useMemo(() => {
    if (!searchText.trim()) return dataSource;
    return dataSource.filter(
      (item) =>
        item.FullName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.MedicalRecordNumber.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [dataSource, searchText]);

  const handleSearch = (value) => {
    setSearchText(value);
    if (onSearch) onSearch(value);
  };

  const handleView = (record) => {
    if (onView) onView(record);
    else message.info(`Xem chi tiết bệnh nhân ${record.FullName}`);
  };

  const columns = [
    {
      title: 'MÃ HỒ SƠ',
      dataIndex: 'MedicalRecordNumber',
      key: 'MedicalRecordNumber',
      width: 120,
      sorter: (a, b) => a.MedicalRecordNumber.localeCompare(b.MedicalRecordNumber),
      render: (text) => <span className="vietnamese-text">{text}</span>,
    },
    {
      title: 'HỌ TÊN',
      dataIndex: 'FullName',
      key: 'FullName',
      sorter: (a, b) => a.FullName.localeCompare(b.FullName),
      render: (text) => <span className="vietnamese-text">{text}</span>,
    },
    {
      title: 'PHÒNG',
      dataIndex: 'RoomNumber',
      key: 'RoomNumber',
      width: 100,
      render: (text) => <span className="vietnamese-text">{text || '-'}</span>,
    },
    {
      title: 'GIƯỜNG',
      dataIndex: 'BedNumber',
      key: 'BedNumber',
      width: 100,
      render: (text) => <span className="vietnamese-text">{text || '-'}</span>,
    },
    {
      title: 'BÁC SĨ ĐIỀU TRỊ',
      dataIndex: 'AttendingPhysician',
      key: 'AttendingPhysician',
      render: (text) => <span className="vietnamese-text">{text || '-'}</span>,
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'IsActive',
      key: 'IsActive',
      width: 120,
      align: 'center',
      filters: [
        { text: 'Đang điều trị', value: true },
        { text: 'Đã xuất viện', value: false },
      ],
      onFilter: (value, record) => record.IsActive === value,
      render: (value) => (
        <span className="vietnamese-text">{value ? 'Đang điều trị' : 'Đã xuất viện'}</span>
      ),
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div className="action-buttons">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              className="action-btn view-btn"
              size="small"
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className={`reusable-table-container ${className || ''}`}>
      <div className="reusable-table-header">
        <Input.Search
          placeholder="Tìm kiếm theo tên hoặc mã hồ sơ"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          onSearch={handleSearch}
          allowClear
          style={{ width: 300 }}
          prefix={<SearchOutlined />}
        />
        {searchText && (
          <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
            {filteredData.length} kết quả
          </span>
        )}
      </div>
      <ReusableTable
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="Id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} bệnh nhân`,
        }}
        className="reusable-table"
        {...rest}
      />
    </div>
  );
};

PatientTable.propTypes = {
  dataSource: PropTypes.arrayOf(
    PropTypes.shape({
      Id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      MedicalRecordNumber: PropTypes.string.isRequired,
      FullName: PropTypes.string.isRequired,
      RoomNumber: PropTypes.string,
      BedNumber: PropTypes.string,
      AttendingPhysician: PropTypes.string,
      IsActive: PropTypes.bool.isRequired,
    })
  ),
  loading: PropTypes.bool,
  onView: PropTypes.func,
  onSearch: PropTypes.func,
  className: PropTypes.string,
};

export default PatientTable;