import React, { useState } from 'react';
import { Table, Button, Space, Tooltip, message, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import GroupUserModal from './GroupUserModal';
import { fetchGroupUsersByBranch } from '../../../services/groupUserService';

const menuTree = [
    {
        title: 'Tổng quan',
        key: 'overview',
        children: [
            { title: 'Xem', key: 'overview:view' },
        ],
    },
    {
        title: 'Món ăn',
        key: 'foods',
        children: [
            { title: 'Xem', key: 'foods:view' },
            { title: 'Thêm', key: 'foods:add' },
            { title: 'Sửa', key: 'foods:edit' },
            { title: 'Xóa', key: 'foods:delete' },
        ],
    },
    {
        title: 'Danh mục món ăn',
        key: 'foodcategories',
        children: [
            { title: 'Xem', key: 'foodcategories:view' },
            { title: 'Thêm', key: 'foodcategories:add' },
            { title: 'Sửa', key: 'foodcategories:edit' },
            { title: 'Xóa', key: 'foodcategories:delete' },
        ],
    },
    {
        title: 'Đơn hàng',
        key: 'orders',
        children: [
            { title: 'Xem', key: 'orders:view' },
            { title: 'Thêm', key: 'orders:add' },
            { title: 'Sửa', key: 'orders:edit' },
            { title: 'Xóa', key: 'orders:delete' },
            { title: 'Duyệt đơn', key: 'orders:approve' },
            { title: 'Hủy đơn', key: 'orders:cancel' },
            { title: 'Chuyển trạng thái', key: 'orders:status' },
        ],
    },
    {
        title: 'Thực đơn',
        key: 'menus',
        children: [
            { title: 'Xem', key: 'menus:view' },
            { title: 'Thêm', key: 'menus:add' },
            { title: 'Sửa', key: 'menus:edit' },
            { title: 'Xóa', key: 'menus:delete' },
            { title: 'Công bố', key: 'menus:publish' },
        ],
    },
    {
        title: 'Nhà bếp',
        key: 'kitchen',
        children: [
            { title: 'Xem', key: 'kitchen:view' },
            { title: 'Đổi trạng thái', key: 'kitchen:status' },
            { title: 'Chuẩn bị món', key: 'kitchen:prepare' },
            { title: 'Hoàn tất món', key: 'kitchen:complete' },
        ],
    },
    {
        title: 'Giao hàng',
        key: 'delivery',
        children: [
            { title: 'Xem', key: 'delivery:view' },
            { title: 'Phân công', key: 'delivery:assign' },
            { title: 'Cập nhật trạng thái', key: 'delivery:status' },
            { title: 'Hoàn tất giao', key: 'delivery:complete' },
        ],
    },
    {
        title: 'Người dùng',
        key: 'users',
        children: [
            { title: 'Xem', key: 'users:view' },
            { title: 'Thêm', key: 'users:add' },
            { title: 'Sửa', key: 'users:edit' },
            { title: 'Xóa', key: 'users:delete' },
            { title: 'Gán vai trò', key: 'users:roles' },
        ],
    },
    {
        title: 'Bệnh nhân',
        key: 'patients',
        children: [
            { title: 'Xem', key: 'patients:view' },
            { title: 'Thêm', key: 'patients:add' },
            { title: 'Sửa', key: 'patients:edit' },
            { title: 'Xóa', key: 'patients:delete' },
            { title: 'Chế độ ăn', key: 'patients:dietary' },
        ],
    },
    {
        title: 'Chi nhánh',
        key: 'branches',
        children: [
            { title: 'Xem', key: 'branches:view' },
            { title: 'Thêm', key: 'branches:add' },
            { title: 'Sửa', key: 'branches:edit' },
            { title: 'Xóa', key: 'branches:delete' },
            { title: 'Cài đặt chi nhánh', key: 'branches:settings' },
        ],
    },
    {
        title: 'Khu vực',
        key: 'areas',
        children: [
            { title: 'Xem', key: 'areas:view' },
            { title: 'Thêm', key: 'areas:add' },
            { title: 'Sửa', key: 'areas:edit' },
            { title: 'Xóa', key: 'areas:delete' },
        ],
    },
    {
        title: 'Địa điểm',
        key: 'locations',
        children: [
            { title: 'Xem', key: 'locations:view' },
            { title: 'Thêm', key: 'locations:add' },
            { title: 'Sửa', key: 'locations:edit' },
            { title: 'Xóa', key: 'locations:delete' },
        ],
    },
    {
        title: 'Ví thanh toán',
        key: 'wallet',
        children: [
            { title: 'Xem', key: 'wallet:view' },
            { title: 'Giao dịch', key: 'wallet:transactions' },
            { title: 'Nạp tiền', key: 'wallet:topup' },
            { title: 'Hoàn tiền', key: 'wallet:refund' },
        ],
    },
    {
        title: 'Báo cáo',
        key: 'reports',
        children: [
            { title: 'Xem tổng quan', key: 'reports:view' },
            { title: 'Doanh thu', key: 'reports:revenue' },
            { title: 'Đơn hàng', key: 'reports:orders' },
            { title: 'Bệnh nhân', key: 'reports:patients' },
            { title: 'Xuất báo cáo', key: 'reports:export' },
        ],
    },
    {
        title: 'Hệ thống',
        key: 'system',
        children: [
            { title: 'Cài đặt', key: 'system:settings' },
            { title: 'Sao lưu', key: 'system:backup' },
            { title: 'Nhật ký hệ thống', key: 'system:logs' },
            { title: 'Bảo trì', key: 'system:maintenance' },
        ],
    },
];

const GroupUser = () => {
    const [groups, setGroups] = useState([]);
    const [search, setSearch] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [checkedKeys, setCheckedKeys] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    // Thêm state cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Fetch group users by branch on mount
    React.useEffect(() => {
        const branchId = localStorage.getItem('currentBranchId') || '1';
        fetchGroupUsersByBranch(branchId)
            .then(data => {
                let arr = Array.isArray(data) ? data : (data ? [data] : []);
                setGroups(arr);
                message.success('Lấy danh sách nhóm người dùng thành công!');
            })
            .catch(err => {
                message.error('Không thể lấy danh sách nhóm người dùng!');
            });
    }, []);

    const filteredGroups = groups.filter(g => g.name && g.name.toLowerCase().includes(search.toLowerCase()));
    // Tính toán dataSource cho trang hiện tại
    const pagedGroups = filteredGroups.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const openModal = (group) => {
        setEditingGroup(group);
        setModalVisible(true);
        setIsEdit(!!group);
        if (group) {
            setCheckedKeys(group.permissions);
        } else {
            setCheckedKeys([]);
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingGroup(null);
        setCheckedKeys([]);
        setIsEdit(false);
    };

    const handleModalOk = (values) => {
        if (editingGroup) {
            setGroups(prev => prev.map(g => g.id === editingGroup.id ? { ...g, name: values.name, permissions: values.permissions } : g));
            message.success('Cập nhật nhóm thành công (mock)');
        } else {
            setGroups(prev => [...prev, { id: Date.now(), name: values.name, permissions: values.permissions }]);
            message.success('Thêm nhóm thành công (mock)');
        }
        closeModal();
    };

    const handleDelete = (group) => {
        setGroups(prev => prev.filter(g => g.id !== group.id));
        message.success('Đã xóa nhóm (mock)');
    };

    const handleRefresh = () => {
        const branchId = localStorage.getItem('currentBranchId') || '1';
        fetchGroupUsersByBranch(branchId)
            .then(data => {
                let arr = Array.isArray(data) ? data : (data ? [data] : []);
                setGroups(arr);
                message.success('Làm mới danh sách nhóm người dùng thành công!');
            })
            .catch(err => {
                message.error('Không thể làm mới danh sách nhóm người dùng!');
            });
    };

    const columns = [
        {
            title: 'Tên nhóm',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => openModal(record)}
                            className="action-btn edit-btn"
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xóa nhóm người dùng"
                            description={`Bạn có chắc chắn muốn xóa nhóm ${record.name}?`}
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
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h1 style={{ margin: 0 }}>Nhóm người dùng</h1>
                <Space>
                    <Tooltip title="Làm mới danh sách">
                        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>Làm mới</Button>
                    </Tooltip>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
                        Thêm nhóm người dùng
                    </Button>
                </Space>
            </div>
            <Table
                rowKey="id"
                columns={columns}
                dataSource={pagedGroups}
                pagination={{
                    total: filteredGroups.length,
                    current: currentPage,
                    pageSize,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                    onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    },
                    showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} nhóm`,
                }}
            />
            <GroupUserModal
                visible={modalVisible}
                onCancel={closeModal}
                onOk={handleModalOk}
                initialValues={editingGroup || {}}
                checkedKeys={checkedKeys}
                onCheckedKeysChange={setCheckedKeys}
                menuTree={menuTree}
                isEdit={isEdit}
            />
        </div>
    );
};

export default GroupUser;