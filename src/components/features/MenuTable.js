import React, { useState, useMemo } from 'react';
import { Button, Space, Input, Tag, Tooltip, Popconfirm, message } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import ReusableTable from '../common/ReusableTable';
import PropTypes from 'prop-types';
import './MenuTable.css';

/**
 * MenuTable component for displaying menu list with Vietnamese interface
 * Follows the structure from the provided UI design
 */
const MenuTable = ({
    dataSource = [],
    loading = false,
    onView,
    onEdit,
    onDelete,
    className,
    ...rest
}) => {
    const [searchText, setSearchText] = useState('');

    // Filter data based on search
    const filteredData = useMemo(() => {
        if (!searchText.trim()) return dataSource;

        return dataSource.filter(item =>
            item.date?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.id?.toString().includes(searchText) ||
            (item.serviceTime && searchText.toLowerCase().includes('có')) ||
            (!item.serviceTime && searchText.toLowerCase().includes('không'))
        );
    }, [dataSource, searchText]);

    // Handle actions
    const handleView = (record) => {
        if (onView) {
            onView(record);
        } else {
            message.info(`Xem chi tiết menu ngày ${record.date}`);
        }
    };

    const handleEdit = (record) => {
        if (onEdit) {
            onEdit(record);
        } else {
            message.info(`Chỉnh sửa menu ngày ${record.date}`);
        }
    };

    const handleDelete = (record) => {
        if (onDelete) {
            onDelete(record);
        } else {
            message.success(`Đã xóa menu ngày ${record.date}`);
        }
    };

    // Table columns following the Vietnamese interface
    const columns = [
        {
            title: 'NGÀY',
            dataIndex: 'date',
            key: 'date',
            width: 120,
            sorter: (a, b) => {
                // Sort by date
                const dateA = new Date(a.date.split('/').reverse().join('-'));
                const dateB = new Date(b.date.split('/').reverse().join('-'));
                return dateA - dateB;
            },
            render: (date) => (
                <span className="vietnamese-text">{date}</span>
            ),
        },
        {
            title: 'THỜI GIAN PHỤC VỤ',
            dataIndex: 'serviceTime',
            key: 'serviceTime',
            width: 150,
            align: 'center',
            filters: [
                { text: 'Có', value: true },
                { text: 'Không', value: false },
            ],
            onFilter: (value, record) => record.serviceTime === value,
            render: (serviceTime) => (
                <Tag
                    color={serviceTime ? 'green' : 'red'}
                    className="vietnamese-text"
                >
                    {serviceTime ? 'Có' : 'Không'}
                </Tag>
            ),
        },
        {
            title: 'THỜI GIAN TỪ',
            dataIndex: 'startTime',
            key: 'startTime',
            width: 120,
            align: 'center',
            render: (startTime) => (
                <span className="vietnamese-text">
                    {startTime || '-'}
                </span>
            ),
        },
        {
            title: 'THỜI GIAN ĐẾN',
            dataIndex: 'endTime',
            key: 'endTime',
            width: 120,
            align: 'center',
            render: (endTime) => (
                <span className="vietnamese-text">
                    {endTime || '-'}
                </span>
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
                            onClick={() => handleView(record)}
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
                            title="Xóa menu"
                            description={`Bạn có chắc chắn muốn xóa menu ngày ${record.date}?`}
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
        <div className={`menu-table-container ${className || ''}`}>
            {/* Search Input */}
            <div className="menu-table-header">
                <Input
                    placeholder="Tìm kiếm thực đơn"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                    className="search-input"
                    style={{ width: 300 }}
                />
            </div>

            {/* Table */}
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
                        `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} thực đơn`,
                }}
                className="menu-table"
                {...rest}
            />
        </div>
    );
};

MenuTable.propTypes = {
    dataSource: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            date: PropTypes.string.isRequired,
            serviceTime: PropTypes.bool.isRequired,
            startTime: PropTypes.string,
            endTime: PropTypes.string,
        })
    ),
    loading: PropTypes.bool,
    onView: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    className: PropTypes.string,
};

export default MenuTable; 