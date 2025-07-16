import React, { useState } from 'react';
import { Table, Button, Space, Tooltip, Switch, message, Popconfirm, Input, Select } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import UserAccountModal from './UserAccountModal';
import { fetchUserAccountsByBranch, updateUserAccountStatus } from '../../../services/userAccountService';

// Mock nhóm người dùng
const mockGroups = [
    { id: 1, name: 'Quản lý' },
    { id: 2, name: 'Nhân viên' },
    { id: 3, name: 'Quản lý chi nhánh' },
    { id: 4, name: 'Thu ngân' },
    { id: 5, name: 'Nhà bếp' },
    { id: 6, name: 'Nhân viên giao hàng' },
];


const UserAccount = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [groupFilter, setGroupFilter] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

    // Fetch user accounts by branch on mount
    React.useEffect(() => {
        const branchId = localStorage.getItem('currentBranchId') || '1';
        fetchUserAccountsByBranch(branchId)
            .then(data => {
                let arr = Array.isArray(data) ? data : (data ? [data] : []);
                // Map API data to table fields
                const mapped = arr.map(u => ({
                    id: u.userId,
                    username: u.branchRoleName,
                    name: u.fullName,
                    email: u.email,
                    branchId: u.branchId,
                    groupId: u.branchRoleId,
                    groupName: u.branchRoleName,
                    status: u.isActive
                }));
                setUsers(mapped);
                message.success('Lấy danh sách tài khoản thành công!');
            })
            .catch(err => {
                message.error('Không thể lấy danh sách tài khoản!');
            });
    }, []);

    // Filter users theo search và group
    const filteredUsers = users.filter(u => {
        const s = (search || '').toLowerCase();
        const groupOk = groupFilter ? u.groupId === groupFilter : true;
        return (
            ((u.name && u.name.toLowerCase().includes(s)) ||
                (u.username && u.username.toLowerCase().includes(s)) ||
                (u.email && u.email.toLowerCase().includes(s))) && groupOk
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
        const branchId = localStorage.getItem('currentBranchId') || '1';
        fetchUserAccountsByBranch(branchId)
            .then(data => {
                let arr = Array.isArray(data) ? data : (data ? [data] : []);
                const mapped = arr.map(u => ({
                    id: u.userId,
                    username: u.branchRoleName, // or u.userName if available
                    name: u.fullName,
                    email: u.email,
                    branchId: u.branchId,
                    groupId: u.branchRoleId,
                    groupName: u.branchRoleName,
                    status: u.isActive
                }));
                setUsers(mapped);
                setSearch('');
                setGroupFilter(null);
                message.success('Đã làm mới danh sách');
            })
            .catch(err => {
                message.error('Không thể làm mới danh sách tài khoản!');
            });
    };

    // Đổi trạng thái
    const handleStatusChange = async (checked, user) => {
        try {
            await updateUserAccountStatus(user, checked);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: checked } : u));
            message.success('Đã cập nhật trạng thái!');
        } catch (err) {
            message.error('Cập nhật trạng thái thất bại!');
        }
    };

    const columns = [
        { title: 'Tài khoản', dataIndex: 'username', key: 'username', sorter: (a, b) => (a.username || '').localeCompare(b.username || '') },
        { title: 'Tên người dùng', dataIndex: 'name', key: 'name', sorter: (a, b) => (a.name || '').localeCompare(b.name || '') },
        { title: 'Email', dataIndex: 'email', key: 'email', sorter: (a, b) => (a.email || '').localeCompare(b.email || '') },
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