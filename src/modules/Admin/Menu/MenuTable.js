import React, { useState, useMemo } from 'react';
import { Button, Space, DatePicker, Tag, Tooltip, Popconfirm, message } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import ReusableTable from '../../../components/common/ReusableTable';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import locale from 'antd/locale/vi_VN';
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
    const [selectedDate, setSelectedDate] = useState(null);

    // Get user's locale for date formatting
    const userLocale = navigator.language || 'vi-VN';

    // Determine date format based on locale
    const getDateFormat = () => {
        const locale = userLocale.toLowerCase();
        if (locale.includes('us') || locale.includes('en-us')) {
            return 'MM/DD/YYYY';
        } else if (locale.includes('gb') || locale.includes('en-gb')) {
            return 'DD/MM/YYYY';
        } else if (locale.includes('vi')) {
            return 'DD/MM/YYYY';
        } else {
            return 'DD/MM/YYYY'; // Default format
        }
    };

    const dateFormat = getDateFormat();

    // Filter data based on selected date
    const filteredData = useMemo(() => {
        if (!selectedDate) return dataSource;

        const selectedDateStr = selectedDate.format(dateFormat);
        return dataSource.filter(item => {
            // Ensure item.date exists and is a string
            if (!item.date || typeof item.date !== 'string') {
                return false;
            }
            return item.date === selectedDateStr;
        });
    }, [dataSource, selectedDate, dateFormat]);

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

    // Handle date filter change
    const handleDateChange = (date) => {
        try {
            setSelectedDate(date);
            if (date && dayjs.isDayjs(date)) {
                const formattedDate = date.format(dateFormat);
                message.info(`Lọc menu theo ngày: ${formattedDate}`);
            } else {
                message.info('Đã xóa bộ lọc ngày');
            }
        } catch (error) {
            console.warn('Date change error:', error);
            message.error('Có lỗi khi xử lý ngày đã chọn');
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
                // Sort by date with error handling
                try {
                    if (!a.date || !b.date) return 0;

                    const dateA = dayjs(a.date, dateFormat);
                    const dateB = dayjs(b.date, dateFormat);

                    // Check if dates are valid
                    if (!dateA.isValid() || !dateB.isValid()) {
                        return 0;
                    }

                    return dateA.valueOf() - dateB.valueOf();
                } catch (error) {
                    console.warn('Date sorting error:', error);
                    return 0;
                }
            },
            render: (date) => (
                <span className="vietnamese-text">
                    {date || '-'}
                </span>
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
            {/* Date Filter */}
            <div className="menu-table-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CalendarOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
                    <DatePicker
                        placeholder="Lọc theo ngày"
                        value={selectedDate}
                        onChange={handleDateChange}
                        allowClear
                        className="date-filter-input"
                        style={{ width: 300 }}
                        format={dateFormat}
                        showToday
                        locale={locale.DatePicker}
                    />
                    {selectedDate && (
                        <span style={{
                            fontSize: '14px',
                            color: '#666',
                            fontWeight: '500'
                        }}>
                            {filteredData.length} kết quả
                        </span>
                    )}
                </div>
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