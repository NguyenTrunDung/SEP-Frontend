import React, { useState } from 'react';
import { Table, Button, Space, Tooltip, Switch, message, Popconfirm, Input, Select } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import UserAccountModal from './UserAccountModal';
import { fetchUserAccountsByBranch, updateUserAccountStatus, createUserAccount, updateUserAccount, deleteUserAccount } from '../../../services/userAccountService';
import { fetchGroupUsersByBranch } from '../../../services/groupUserService';
import { extractErrorMessage } from '../../../utils/errorHandler';


// Đổi tên hàm extractErrorMessage thành extractApiErrorMessage
function extractApiErrorMessage(err) {
    if (Array.isArray(err?.response?.data)) {
        // Lấy tất cả description, nối lại thành chuỗi
        return err.response.data.map(e => e.description).join(', ');
    }
    return (
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Đã xảy ra lỗi'
    );
}

const UserAccount = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [groupFilter, setGroupFilter] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [groupOptions, setGroupOptions] = useState([]);
    // Thêm state cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    React.useEffect(() => {
        const branchId = localStorage.getItem('currentBranchId') || '1';
        fetchUserAccountsByBranch(branchId)
            .then(data => {
                let arr = Array.isArray(data) ? data : (data ? [data] : []);
                const mapped = arr.map(u => ({
                    id: u.userId,
                    username: u.branchRoleName,
                    name: u.fullName,
                    email: u.email,
                    groupId: u.branchRoleId,
                    groupName: u.branchRoleName,
                    status: u.isActive,
                    branchId: u.branchId,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    phone: u.phoneNumber,
                    userName: u.userName
                }));
                setUsers(mapped);
                message.success('Lấy danh sách tài khoản thành công!');
            })
            .catch(err => {
                message.error(extractApiErrorMessage(err));
            });
        fetchGroupUsersByBranch(branchId)
            .then(data => {
                let arr = Array.isArray(data) ? data : (data ? [data] : []);
                setGroupOptions(arr.map(g => ({ value: g.id, label: g.name })));
            })
            .catch(() => setGroupOptions([]));
    }, []);

    const filteredUsers = users.filter(u => {
        const s = (search || '').toLowerCase();
        const groupOk = groupFilter ? u.groupId === groupFilter : true;
        return (
            ((u.name && u.name.toLowerCase().includes(s)) ||
                (u.username && u.username.toLowerCase().includes(s)) ||
                (u.email && u.email.toLowerCase().includes(s))) && groupOk
        );
    });
    // Tính toán dataSource cho trang hiện tại
    const pagedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const openModal = (user) => {
        setEditingUser(user);
        setModalVisible(true);
        setIsEdit(!!user);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingUser(null);
        setIsEdit(false);
    };

    const handleModalOk = async (values) => {
        const branchId = localStorage.getItem('currentBranchId') || '1';
        if (isEdit && editingUser) {
            try {
                const payload = {
                    userId: editingUser.id,
                    branchId: editingUser.branchId,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    email: values.email,
                    userName: values.username,
                    branchRoleId: values.groupId,
                    phoneNumber: values.phone,
                    isActive: editingUser.status
                };
                console.log('[UpdateUserAccount] Payload:', payload);
                await updateUserAccount(editingUser.id, payload);
                message.success('Cập nhật tài khoản thành công!');
                handleRefresh();
                closeModal();
            } catch (err) {
                // Hiển thị lỗi trả về từ API bằng message.error (không setFields)
                message.error(extractApiErrorMessage(err));
            }
        } else {
            try {
                await createUserAccount({
                    firstName: values.firstName,
                    lastName: values.lastName,
                    email: values.email,
                    userName: values.username,
                    password: values.password,
                    branchId: branchId,
                    branchRoleId: values.groupId,
                    phoneNumber: values.phone
                });
                message.success('Thêm tài khoản thành công!');
                handleRefresh();
                closeModal();
            } catch (err) {
                // Hiển thị lỗi trả về từ API bằng message.error (không setFields)
                message.error(extractApiErrorMessage(err));
            }
        }
    };

    const handleDelete = async (user) => {
        try {
            await deleteUserAccount(user.id, user.branchId);
            message.success('Đã xóa tài khoản!');
            handleRefresh();
        } catch (err) {
            message.error(extractApiErrorMessage(err));
        }
    };

    const handleRefresh = () => {
        const branchId = localStorage.getItem('currentBranchId') || '1';
        fetchUserAccountsByBranch(branchId)
            .then(data => {
                let arr = Array.isArray(data) ? data : (data ? [data] : []);
                const mapped = arr.map(u => ({
                    id: u.userId,
                    username: u.branchRoleName,
                    name: u.fullName,
                    email: u.email,
                    groupId: u.branchRoleId,
                    groupName: u.branchRoleName,
                    status: u.isActive,
                    branchId: u.branchId,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    phone: u.phoneNumber,
                    userName: u.userName
                }));
                setUsers(mapped);
                setSearch('');
                setGroupFilter(null);
                message.success('Đã làm mới danh sách');
            })
            .catch(err => {
                message.error(extractApiErrorMessage(err));
            });
        fetchGroupUsersByBranch(branchId)
            .then(data => {
                let arr = Array.isArray(data) ? data : (data ? [data] : []);
                setGroupOptions(arr.map(g => ({ value: g.id, label: g.name })));
            })
            .catch(() => setGroupOptions([]));
    };

    const handleStatusChange = async (checked, user) => {
        try {
            await updateUserAccountStatus(user, checked);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: checked } : u));
            message.success('Đã cập nhật trạng thái!');
        } catch (err) {
            message.error(extractApiErrorMessage(err));
        }
    };

    const columns = [
        { title: 'Tên nhóm người dùng', dataIndex: 'username', key: 'username', sorter: (a, b) => (a.username || '').localeCompare(b.username || '') },
        { title: 'Tên người dùng', dataIndex: 'name', key: 'name', sorter: (a, b) => (a.name || '').localeCompare(b.name || '') },
        { title: 'Email (Tài khoản)', dataIndex: 'email', key: 'email', sorter: (a, b) => (a.email || '').localeCompare(b.email || '') },
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
                    options={groupOptions}
                />
            </div>
            <Table
                rowKey="id"
                columns={columns}
                dataSource={pagedUsers}
                pagination={{
                    total: filteredUsers.length,
                    current: currentPage,
                    pageSize,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                    onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    },
                    showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} tài khoản`,
                }}
            />
            <UserAccountModal
                visible={modalVisible}
                onCancel={closeModal}
                onOk={handleModalOk}
                initialValues={editingUser ? { ...editingUser, phone: editingUser.phone || editingUser.phoneNumber } : {}}
                isEdit={isEdit}
                groupOptions={groupOptions}
            />
        </div>
    );
};

export default UserAccount; 