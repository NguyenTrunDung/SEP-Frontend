import React, { useState, useMemo } from 'react';
import { message, Tag, Space, Button, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons';
import PageWrapperV2 from '../common/PageWrapperV2';
import ReusableTableV2 from '../common/ReusableTableV2';
import { useAntModal } from '../../hooks/useAntModal';

/**
 * Example component demonstrating PageWrapperV2 and ReusableTableV2 usage
 * This follows the same pattern as AreasTable but uses the new reusable components
 * with enhanced Ant Design Table features
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
            population: 1500
        },
        {
            id: 2,
            name: 'Khu vực B',
            description: 'Mô tả khu vực B',
            status: 'inactive',
            createdAt: '2024-01-20',
            area: 'South',
            population: 2300
        },
        {
            id: 3,
            name: 'Khu vực C',
            description: 'Mô tả khu vực C',
            status: 'active',
            createdAt: '2024-01-25',
            area: 'East',
            population: 1800
        },
        {
            id: 4,
            name: 'Khu vực D',
            description: 'Mô tả khu vực D',
            status: 'pending',
            createdAt: '2024-02-01',
            area: 'West',
            population: 2100
        },
    ]);

    const { open: addOpen, showModal: showAddModal, handleCancel: handleAddCancel } = useAntModal();
    const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();

    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

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
            title: 'Tên khu vực',
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
            title: 'Khu vực',
            dataIndex: 'area',
            key: 'area',
            sorter: (a, b) => a.area.localeCompare(b.area),
            filters: [
                { text: 'North', value: 'North' },
                { text: 'South', value: 'South' },
                { text: 'East', value: 'East' },
                { text: 'West', value: 'West' },
            ],
            onFilter: (value, record) => record.area === value,
            render: (text) => (
                <Tag color="blue" style={{ fontWeight: 500 }}>
                    {text}
                </Tag>
            ),
        },
        {
            title: 'Dân số',
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
            title: 'Trạng thái',
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
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (date) => (
                <span style={{ fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace', fontSize: '13px' }}>
                    {new Date(date).toLocaleDateString('vi-VN')}
                </span>
            ),
        },
    ];

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

    const handleDuplicate = (record) => {
        const newRecord = {
            ...record,
            id: Date.now(),
            name: `${record.name} (Bản sao)`,
        };
        setData(prev => [...prev, newRecord]);
        message.success(`Đã nhân bản: ${record.name}`);
    };

    const handleRowClick = (record, index) => {
        console.log('Clicked row:', record, 'at index:', index);
        message.info(`Đã chọn: ${record.name}`);
    };

    const handleSelectionChange = (selectedKeys, selectedRows) => {
        setSelectedRowKeys(selectedKeys);
        console.log('Selected rows:', selectedRows);
    };

    // Custom actions for each row
    const customActions = (record) => (
        <Space size="small">
            <Tooltip title="Xem chi tiết">
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    className="view-btn"
                    onClick={() => handleView(record)}
                />
            </Tooltip>
            <Tooltip title="Nhân bản">
                <Button
                    type="text"
                    icon={<CopyOutlined />}
                    className="edit-btn"
                    onClick={() => handleDuplicate(record)}
                />
            </Tooltip>
        </Space>
    );

    return (
        <PageWrapperV2
            title="Danh mục khu vực"
            onAdd={handleAdd}
            onRefresh={handleRefresh}
            loading={loading}
            searchProps={{
                value: searchText,
                onChange: (e) => setSearchText(e.target.value),
                placeholder: 'Tìm kiếm khu vực...'
            }}
        >
            <ReusableTableV2
                dataSource={filteredData}
                columns={columns}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRowClick={handleRowClick}
                actions={customActions}
                emptyMessage="Không tìm thấy khu vực nào."
                // Enhanced Ant Design Table features
                rowSelection={{
                    selectedRowKeys,
                    onChange: handleSelectionChange,
                    selections: [
                        {
                            key: 'all-data',
                            text: 'Chọn tất cả',
                            onSelect: () => {
                                setSelectedRowKeys(filteredData.map(item => item.id));
                            },
                        },
                        {
                            key: 'clear',
                            text: 'Bỏ chọn tất cả',
                            onSelect: () => {
                                setSelectedRowKeys([]);
                            },
                        },
                    ],
                }}
                expandable={{
                    expandedRowRender: (record) => (
                        <div style={{ padding: '16px', background: '#fafafa', borderRadius: '6px' }}>
                            <h4>Chi tiết khu vực: {record.name}</h4>
                            <p><strong>Mô tả:</strong> {record.description}</p>
                            <p><strong>Dân số:</strong> {record.population.toLocaleString()} người</p>
                            <p><strong>Ngày tạo:</strong> {new Date(record.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                    ),
                    rowExpandable: (record) => record.description.length > 10,
                }}
                scroll={{ x: 1200 }}
                sticky
                size="middle"
                bordered={false}
                showSorterTooltip={true}
                // Custom action column configuration
                actionColumn={{
                    title: 'Thao tác',
                    key: 'action',
                    width: 200,
                    fixed: 'right',
                    render: null, // Will be auto-generated
                }}
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
        </PageWrapperV2>
    );
};

export default PageWrapperV2Example; 