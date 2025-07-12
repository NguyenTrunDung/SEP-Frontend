import React, { useState } from 'react';
import { Table, Button, Space, Tooltip, Switch, message, Popconfirm, Input, Select } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import UserAccountModal from './UserAccountModal';

// Mock nhóm người dùng
const mockGroups = [
    { id: 1, name: 'Quản lý' },
    { id: 2, name: 'Nhân viên' },
    { id: 3, name: 'Quản lý chi nhánh' },
    { id: 4, name: 'Thu ngân' },
    { id: 5, name: 'Nhà bếp' },
    { id: 6, name: 'Nhân viên giao hàng' },
];

// Mock user data
const initialUsers = [
    { id: 1, username: 'admin', name: 'Nguyễn Văn A', groupId: 1, dob: '1990-01-01', email: 'admin@example.com', phone: '0912345678', address: 'Hà Nội', status: true },
    { id: 2, username: 'staff1', name: 'Trần Thị B', groupId: 2, dob: '1995-05-10', email: 'staff1@example.com', phone: '0987654321', address: 'HCM', status: false },
];

const UserAccount = () => {
    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState('');
    const [groupFilter, setGroupFilter] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

    // Filter users theo search và group
    const filteredUsers = users.filter(u => {
        const s = search.toLowerCase();
        const groupOk = groupFilter ? u.groupId === groupFilter : true;
        return (
            (u.name.toLowerCase().includes(s) || u.username.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)) && groupOk
        );
    });

    // Mở modal thêm/sửa
    const openModal = (user) => {
        setEditingUser(user);
        setModalVisible(true);
        setIsEdit(!!user);
    };

    // Đóng modal
    const closeModal = () => {
        setModalVisible(false);
        setEditingUser(null);
        setIsEdit(false);
    };

    // Xử lý submit
    const handleModalOk = (values) => {
        if (editingUser) {
            // TODO: Gọi API cập nhật user
            setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...values } : u));
            message.success('Cập nhật tài khoản thành công (mock)');
        } else {
            // TODO: Gọi API tạo user
            setUsers(prev => [...prev, { ...values, id: Date.now(), status: true }]);
            message.success('Thêm tài khoản thành công (mock)');
        }
        closeModal();
    };

    // Xử lý xóa
    const handleDelete = (user) => {
        // TODO: Gọi API xóa user
        setUsers(prev => prev.filter(u => u.id !== user.id));
        message.success('Đã xóa tài khoản (mock)');
    };

    // Làm mới
    const handleRefresh = () => {
        // TODO: Gọi API lấy lại danh sách user
        setUsers(initialUsers);
        setSearch('');
        setGroupFilter(null);
        message.success('Đã làm mới danh sách');
    };

    // Đổi trạng thái
    const handleStatusChange = (checked, user) => {
        // TODO: Gọi API cập nhật trạng thái user
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: checked } : u));
        message.success('Đã cập nhật trạng thái (mock)');
    };

    const columns = [
        { title: 'Tài khoản', dataIndex: 'username', key: 'username', sorter: (a, b) => a.username.localeCompare(b.username) },
        { title: 'Tên người dùng', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
        { title: 'Ngày sinh', dataIndex: 'dob', key: 'dob', sorter: (a, b) => (a.dob || '').localeCompare(b.dob || '') },
        { title: 'Email', dataIndex: 'email', key: 'email', sorter: (a, b) => a.email.localeCompare(b.email) },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (value, record) => (
                <Switch checked={value} onChange={checked => handleStatusChange(checked, record)} />
            ),
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
                            title="Xóa tài khoản"
                            description={`Bạn có chắc chắn muốn xóa tài khoản ${record.username}?`}
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
                <h1 style={{ margin: 0 }}>Người dùng</h1>
                <Space>
                    <Tooltip title="Làm mới danh sách">
                        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>Làm mới</Button>
                    </Tooltip>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
                        Thêm tài khoản
                    </Button>
                </Space>
            </div>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Input
                    placeholder="Tìm kiếm theo tên, tài khoản, email"
                    allowClear
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: 260, borderRadius: 4 }}
                />
                <Select
                    placeholder="Lọc theo nhóm người dùng"
                    allowClear
                    style={{ width: 200 }}
                    value={groupFilter}
                    onChange={setGroupFilter}
                    options={mockGroups.map(g => ({ value: g.id, label: g.name }))}
                />
            </div>
            <Table rowKey="id" columns={columns} dataSource={filteredUsers} pagination={false} />
            <UserAccountModal
                visible={modalVisible}
                onCancel={closeModal}
                onOk={handleModalOk}
                initialValues={editingUser || {}}
                isEdit={isEdit}
                groupOptions={mockGroups.map(g => ({ value: g.id, label: g.name }))}
            />
        </div>
    );
};

export default UserAccount; 