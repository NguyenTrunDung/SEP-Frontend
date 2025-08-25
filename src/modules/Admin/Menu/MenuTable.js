import React, { useState, useMemo } from 'react';
import {
    Button,
    DatePicker,
    Tag,
    Tooltip,
    Popconfirm,
    message
} from 'antd';
import {
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined
} from '@ant-design/icons';
import ReusableTable from '../../../components/common/ReusableTable';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import locale from 'antd/locale/vi_VN';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import { useTimezone } from '../../../hooks/useTimezone';

const MenuTable = ({
    dataSource = [],
    loading,
    onView,
    onEdit,
    onDelete,
    onAddMenu,
    className,
    ...rest
}) => {
    const { format } = useTimezone();
    const [selectedDate, setSelectedDate] = useState(null);

    const transformedData = useMemo(() => {
        return dataSource.map(menu => ({
            id: menu.id,
            menuId: menu.id,
            date: menu.date ? format.date(menu.date, 'DD/MM/YYYY') : '-',
            serviceTime: menu.isTime || false,
            startTime: menu.timeFrom || null,
            endTime: menu.timeTo || null,
            originalData: menu,
            name: menu.name || '-',
            totalDishes: menu.details?.length || 0,
            branchId: menu.branchId,
            createdAt: menu.createdAt,
            updatedAt: menu.updatedAt
        }));
    }, [dataSource, format]);

    const filteredData = useMemo(() => {
        if (!selectedDate) return transformedData;
        const selectedDateStr = format.date(selectedDate, 'DD/MM/YYYY');
        return transformedData.filter(item => item.date === selectedDateStr);
    }, [transformedData, selectedDate, format]);

    const handleDateChange = (date) => {
        try {
            setSelectedDate(date);
            if (date && dayjs.isDayjs(date)) {
                const formattedDate = format.date(date, 'DD/MM/YYYY');
                message.info(`Lọc menu theo ngày: ${formattedDate}`);
            } else {
                message.info('Đã xóa bộ lọc ngày');
            }
        } catch (error) {
            console.warn('Date change error:', error);
            message.error('Có lỗi khi xử lý ngày đã chọn');
        }
    };

    const handleView = (record) => {
        onView?.(record.originalData || record);
    };

    const handleEdit = (record) => {
        onEdit?.(record.originalData || record);
    };

    const handleDelete = (record) => {
        onDelete?.(record.originalData || record);
    };

    const columns = [
        {
            title: 'NGÀY',
            dataIndex: 'date',
            key: 'date',
            width: 120,
            sorter: (a, b) => {
                try {
                    const dateA = format.parseDate(a.date, 'DD/MM/YYYY');
                    const dateB = format.parseDate(b.date, 'DD/MM/YYYY');
                    return dateA && dateB ? dateA.valueOf() - dateB.valueOf() : 0;
                } catch {
                    return 0;
                }
            },
            render: (date) => <span>{date || '-'}</span>
        },
        {
            title: 'THỜI GIAN PHỤC VỤ',
            dataIndex: 'serviceTime',
            key: 'serviceTime',
            width: 150,
            align: 'center',
            filters: [
                { text: 'Có', value: true },
                { text: 'Không', value: false }
            ],
            onFilter: (value, record) => record.serviceTime === value,
            render: (serviceTime) => (
                <Tag color={serviceTime ? 'green' : 'red'}>
                    {serviceTime ? 'Có' : 'Không'}
                </Tag>
            )
        },
        {
            title: 'THỜI GIAN TỪ',
            dataIndex: 'startTime',
            key: 'startTime',
            width: 120,
            align: 'center',
            render: (startTime) => <span>{startTime || '-'}</span>
        },
        {
            title: 'THỜI GIAN ĐẾN',
            dataIndex: 'endTime',
            key: 'endTime',
            width: 120,
            align: 'center',
            render: (endTime) => <span>{endTime || '-'}</span>
        },
        {
            title: 'HÀNH ĐỘNG',
            key: 'actions',
            width: 180,
            align: 'center',
            render: (_, record) => (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xóa menu"
                            description={`Xóa menu "${record.name}" ngày ${record.date}?`}
                            onConfirm={() => handleDelete(record)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                danger
                            />
                        </Popconfirm>
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <div className={`reusable-table-container ${className || ''}`}>
            {/* Header */}
            <div
                className="reusable-table-header"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16
                }}
            >
                <DatePicker
                    placeholder="Tìm kiếm thực đơn"
                    value={selectedDate}
                    onChange={handleDateChange}
                    allowClear
                    style={{ width: 220 }}
                    format="DD/MM/YYYY"
                    locale={locale.DatePicker}
                />
                {onAddMenu && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={onAddMenu}
                    >
                        Thêm Menu Mới
                    </Button>
                )}
            </div>

            {/* Table */}
            <ReusableTableV2
                {...rest}
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                rowKey="id"
                pagination={{
                    show: true,
                    pageSizeOptions: [5, 10, 20, 50],
                    showTotal: true,
                    showSizeChanger: true,
                }}
                className="reusable-table-v2"
            />
        </div>
    );
};

MenuTable.propTypes = {
    dataSource: PropTypes.array,
    loading: PropTypes.bool,
    onView: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onAddMenu: PropTypes.func,
    className: PropTypes.string
};

export default MenuTable;
