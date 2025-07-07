import React, { useState, useMemo } from 'react';
import { message, Tag, Space, Button, Tooltip, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons';
import { withPageWrapperV2 } from '../common/PageWrapperV2';
import ReusableTableV2 from '../common/ReusableTableV2';
import { useAntModal } from '../../hooks/useAntModal';

/**
 * Example component demonstrating withPageWrapperV2 and ReusableTableV2 usage
 * This showcases the new modern, clean table styling with custom pagination
 * Using HOC pattern for consistency with existing codebase
 */
const PageWrapperV2Content = ({
    data,
    loading,
    onEdit,
    onDelete,
    onView,
    searchText,
    onSearchChange,
    selectedRowKeys,
    onSelectionChange,
    ...props
}) => {
    // Filter data based on search
    const filteredData = useMemo(() => {
        return searchText
            ? data.filter((item) =>
                item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                item.description.toLowerCase().includes(searchText.toLowerCase())
            )
            : data;
    }, [data, searchText]);

    // Enhanced columns with Ant Design Table features
    const columns = [
        {
            title: 'TÊN KHU VỰC',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            filters: [
                { text: 'Khu vực A', value: 'Khu vực A' },
                { text: 'Khu vực B', value: 'Khu vực B' },
                { text: 'Khu vực C', value: 'Khu vực C' },
                { text: 'Khu vực D', value: 'Khu vực D' },
            ],
            onFilter: (value, record) => record.name === value,
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <span style={{ fontWeight: 600, color: '#262626' }}>{text}</span>
                    <span style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.description}</span>
                </Space>
            ),
        },
        {
            title: 'KHU VỰC',
            dataIndex: 'area',
            key: 'area',
            sorter: (a, b) => a.area.localeCompare(b.area),
            filters: [
                { text: 'North', value: 'North' },
                { text: 'South', value: 'South' },
                { text: 'East', value: 'East' },
                { text: 'West', value: 'West' },
                { text: 'Central', value: 'Central' },
            ],
            onFilter: (value, record) => record.area === value,
            render: (text) => (
                <Tag color="blue" style={{ fontWeight: 500 }}>
                    {text}
                </Tag>
            ),
        },
        {
            title: 'DÂN SỐ',
            dataIndex: 'population',
            key: 'population',
            sorter: (a, b) => a.population - b.population,
            render: (text) => (
                <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    {text.toLocaleString()}
                </span>
            ),
        },
        {
            title: 'TRẠNG THÁI',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Hoạt động', value: 'active' },
                { text: 'Không hoạt động', value: 'inactive' },
                { text: 'Chờ xử lý', value: 'pending' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => {
                const statusConfig = {
                    active: { color: 'success', text: 'Hoạt động' },
                    inactive: { color: 'error', text: 'Không hoạt động' },
                    pending: { color: 'warning', text: 'Chờ xử lý' },
                };
                const config = statusConfig[status] || { color: 'default', text: status };
                return (
                    <Tag color={config.color} style={{ fontWeight: 600 }}>
                        {config.text}
                    </Tag>
                );
            },
        },
        {
            title: 'KÍCH HOẠT',
            dataIndex: 'isEnabled',
            key: 'isEnabled',
            render: (enabled, record) => (
                <Switch
                    checked={enabled}
                    onChange={(checked) => {
                        // This would typically update the data through a callback
                        message.success(`${record.name} ${checked ? 'đã được kích hoạt' : 'đã bị vô hiệu hóa'}`);
                    }}
                />
            ),
        },
        {
            title: 'NGÀY TẠO',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (date) => (
                <span style={{ fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace', fontSize: '13px' }}>
                    {new Date(date).toLocaleDateString('vi-VN')}
                </span>
            ),
        },
        {
            title: 'THAO TÁC',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => onView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => onEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => onDelete(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <ReusableTableV2
            dataSource={filteredData}
            columns={columns}
            loading={loading}
            rowKey="id"
            pagination={{
                show: true,
                pageSizeOptions: [5, 10, 20, 50],
                showTotal: true,
                showSizeChanger: true,
            }}
            rowSelection={{
                selectedRowKeys,
                onChange: onSelectionChange,
                selections: [
                    {
                        key: 'all-data',
                        text: 'Chọn tất cả',
                        onSelect: () => {
                            onSelectionChange(filteredData.map(item => item.id), filteredData);
                        },
                    },
                    {
                        key: 'clear',
                        text: 'Bỏ chọn tất cả',
                        onSelect: () => {
                            onSelectionChange([], []);
                        },
                    },
                ],
            }}
            scroll={{ x: 1200 }}
            size="middle"
            bordered={false}
            showSorterTooltip={true}
        />
    );
};

// Wrap the content component with the HOC
const PageWrapperV2WithHOC = withPageWrapperV2(PageWrapperV2Content);

/**
 * Main example component using the HOC pattern
 */
const PageWrapperV2Example = () => {
    const [searchText, setSearchText] = useState('');
    const [data, setData] = useState([
        {
            id: 1,
            name: 'Khu vực A',
            description: 'Mô tả khu vực A',
            status: 'active',
            createdAt: '2024-01-15',
            area: 'North',
            population: 1500,
            isEnabled: true
        },
        {
            id: 2,
            name: 'Khu vực B',
            description: 'Mô tả khu vực B',
            status: 'inactive',
            createdAt: '2024-01-20',
            area: 'South',
            population: 2300,
            isEnabled: false
        },
        {
            id: 3,
            name: 'Khu vực C',
            description: 'Mô tả khu vực C',
            status: 'active',
            createdAt: '2024-01-25',
            area: 'East',
            population: 1800,
            isEnabled: true
        },
        {
            id: 4,
            name: 'Khu vực D',
            description: 'Mô tả khu vực D',
            status: 'pending',
            createdAt: '2024-02-01',
            area: 'West',
            population: 2100,
            isEnabled: true
        },
        {
            id: 5,
            name: 'Khu vực E',
            description: 'Mô tả khu vực E',
            status: 'active',
            createdAt: '2024-02-05',
            area: 'Central',
            population: 3200,
            isEnabled: true
        },
        {
            id: 6,
            name: 'Khu vực F',
            description: 'Mô tả khu vực F',
            status: 'inactive',
            createdAt: '2024-02-10',
            area: 'North',
            population: 1400,
            isEnabled: false
        },
        {
            id: 7,
            name: 'Khu vực G',
            description: 'Mô tả khu vực G',
            status: 'active',
            createdAt: '2024-02-15',
            area: 'South',
            population: 2800,
            isEnabled: true
        },
        {
            id: 8,
            name: 'Khu vực H',
            description: 'Mô tả khu vực H',
            status: 'pending',
            createdAt: '2024-02-20',
            area: 'East',
            population: 1900,
            isEnabled: true
        },
        {
            id: 9,
            name: 'Khu vực I',
            description: 'Mô tả khu vực I',
            status: 'active',
            createdAt: '2024-02-25',
            area: 'West',
            population: 2500,
            isEnabled: true
        },
        {
            id: 10,
            name: 'Khu vực J',
            description: 'Mô tả khu vực J',
            status: 'active',
            createdAt: '2024-03-01',
            area: 'Central',
            population: 3600,
            isEnabled: true
        },
        {
            id: 11,
            name: 'Khu vực K',
            description: 'Mô tả khu vực K',
            status: 'inactive',
            createdAt: '2024-03-05',
            area: 'North',
            population: 1200,
            isEnabled: false
        },
        {
            id: 12,
            name: 'Khu vực L',
            description: 'Mô tả khu vực L',
            status: 'active',
            createdAt: '2024-03-10',
            area: 'South',
            population: 2900,
            isEnabled: true
        }
    ]);

    const { open: addOpen, showModal: showAddModal, handleCancel: handleAddCancel } = useAntModal();
    const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();

    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const handleAdd = () => {
        showAddModal();
    };

    const handleRefresh = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            message.success('Đã làm mới dữ liệu');
        }, 1000);
    };

    const handleEdit = (record) => {
        setSelectedItem(record);
        showEditModal();
        message.info(`Chỉnh sửa: ${record.name}`);
    };

    const handleDelete = (record) => {
        setData(prev => prev.filter(item => item.id !== record.id));
        message.success(`Đã xóa: ${record.name}`);
    };

    const handleView = (record) => {
        message.info(`Xem chi tiết: ${record.name}`);
    };

    const handleSelectionChange = (selectedKeys, selectedRows) => {
        setSelectedRowKeys(selectedKeys);
        console.log('Selected rows:', selectedRows);
    };

    return (
        <>
            <PageWrapperV2WithHOC
                title="Danh mục khu vực"
                onAdd={handleAdd}
                onRefresh={handleRefresh}
                loading={loading}
                searchProps={{
                    value: searchText,
                    onChange: (e) => setSearchText(e.target.value),
                    placeholder: 'Tìm kiếm khu vực...'
                }}
                showSearch={true}
                showAddButton={true}
                showRefreshButton={true}
                addButtonText="Thêm khu vực"
                refreshButtonText="Làm mới"
                searchPlaceholder="Tìm kiếm khu vực..."
                // Pass data and handlers to the wrapped component
                data={data}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                searchText={searchText}
                onSearchChange={setSearchText}
                selectedRowKeys={selectedRowKeys}
                onSelectionChange={handleSelectionChange}
            />

            {/* Example modals would go here */}
            {addOpen && (
                <div className="modal-example">
                    <h3>Thêm khu vực mới</h3>
                    <button onClick={handleAddCancel}>Đóng</button>
                </div>
            )}

            {editOpen && selectedItem && (
                <div className="modal-example">
                    <h3>Chỉnh sửa: {selectedItem.name}</h3>
                    <button onClick={handleEditCancel}>Đóng</button>
                </div>
            )}

            {/* Selection info */}
            {selectedRowKeys.length > 0 && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: '#e6f7ff',
                    borderRadius: '6px',
                    border: '1px solid #91d5ff'
                }}>
                    <strong>Đã chọn {selectedRowKeys.length} khu vực</strong>
                    <Button
                        size="small"
                        style={{ marginLeft: '12px' }}
                        onClick={() => setSelectedRowKeys([])}
                    >
                        Bỏ chọn tất cả
                    </Button>
                </div>
            )}
        </>
    );
};

export default PageWrapperV2Example; 