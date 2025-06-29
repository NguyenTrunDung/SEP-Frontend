import React, { useState, useMemo } from 'react';
import { Button, Space, DatePicker, Tag, Tooltip, Popconfirm, message } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import ReusableTable from '../../../components/common/ReusableTable';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import locale from 'antd/locale/vi_VN';

/**
 * MenuTable component for displaying menu list with Vietnamese interface
 * Now uses real API data from GetMenuList endpoint with automatic branch context
 */
const MenuTable = ({
    dataSource = [],
    loading, // Remove default - let parent explicitly control loading state
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

    // Transform API data to display format
    const transformedData = useMemo(() => {
        return dataSource.map(menu => ({
            id: menu.id,
            menuId: menu.id,
            // Transform API date format to display format
            date: menu.date ? dayjs(menu.date).format(dateFormat) : '-',
            // Map API fields to display fields
            serviceTime: menu.isTime || false,
            startTime: menu.timeFrom || null,
            endTime: menu.timeTo || null,
            // Keep original API data for actions
            originalData: menu,
            // Additional display fields
            name: menu.name || '-',
            timeOfDay: menu.timeOfDay || '-',
            totalDishes: menu.details?.length || 0,
            branchId: menu.branchId,
            createdAt: menu.createdAt,
            updatedAt: menu.updatedAt
        }));
    }, [dataSource, dateFormat]);

    // Filter data based on selected date
    const filteredData = useMemo(() => {
        if (!selectedDate) return transformedData;

        const selectedDateStr = selectedDate.format(dateFormat);
        return transformedData.filter(item => {
            return item.date === selectedDateStr;
        });
    }, [transformedData, selectedDate, dateFormat]);

    // Handle actions
    const handleView = (record) => {
        if (onView) {
            onView(record.originalData || record);
        } else {
            message.info(`Xem chi tiết menu ngày ${record.date} - ${record.totalDishes} món ăn`);
        }
    };

    const handleEdit = (record) => {
        if (onEdit) {
            onEdit(record.originalData || record);
        } else {
            message.info(`Chỉnh sửa menu ngày ${record.date}`);
        }
    };

    const handleDelete = (record) => {
        if (onDelete) {
            onDelete(record.originalData || record);
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
                <span className="vietnamese-text date-column">
                    {date || '-'}
                </span>
            ),
        },
        {
            title: 'TÊN MENU',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            ellipsis: true,
            render: (name) => (
                <span className="vietnamese-text menu-name-column">
                    {name || '-'}
                </span>
            ),
        },
        {
            title: 'SỐ MÓN ĂN',
            dataIndex: 'totalDishes',
            key: 'totalDishes',
            width: 100,
            align: 'center',
            sorter: (a, b) => a.totalDishes - b.totalDishes,
            render: (totalDishes) => (
                <Tag color="blue" className="vietnamese-text">
                    {totalDishes} món
                </Tag>
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
                <span className="vietnamese-text time-column">
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
                <span className="vietnamese-text time-column">
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
                            description={`Bạn có chắc chắn muốn xóa menu "${record.name}" ngày ${record.date}?`}
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
            {/* Date Filter using the shared header styling */}
            <div className="reusable-table-header">
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

            {/* Table using the unified ReusableTable component */}
            <ReusableTable
                {...rest}
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
                className="reusable-table"
            />
        </div>
    );
};

MenuTable.propTypes = {
    dataSource: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            date: PropTypes.string,
            name: PropTypes.string,
            isTime: PropTypes.bool,
            timeFrom: PropTypes.string,
            timeTo: PropTypes.string,
            details: PropTypes.array,
            branchId: PropTypes.number,
            createdAt: PropTypes.string,
            updatedAt: PropTypes.string,
        })
    ),
    loading: PropTypes.bool, // Optional - defaults to false if undefined
    onView: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    className: PropTypes.string,
};

export default MenuTable; 