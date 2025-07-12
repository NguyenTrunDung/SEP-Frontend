import React, { useState, useEffect } from 'react';
import UserTable from './UserTable';
import WalletModal from './WalletModal';
import DepositModal from './DepositModal';
import EditUserModal from './EditUserModal';
import { Modal, message, Input, Button, Space, Tooltip } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../../../services/api/config';
import environment from '../../../config/environment';

const initialUsers = [
    {
        id: 1,
        name: 'Nguyễn Văn A',
        username: 'nguyenvana',
        phone: '0912345678',
        balance: 45400,
        email: 'vana@example.com',
    },
    {
        id: 2,
        name: 'Trần Thị B',
        username: 'tranthib',
        phone: '0987654321',
        balance: 120000,
        email: 'thib@example.com',
    },
];

const UserManagement = () => {
    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [walletVisible, setWalletVisible] = useState(false);
    const [depositVisible, setDepositVisible] = useState(false);
    const [editVisible, setEditVisible] = useState(false);
    const [isCreate, setIsCreate] = useState(false);

    // Lấy danh sách user khi load trang
    useEffect(() => {
        // TODO: Bỏ mock, dùng API thực tế khi backend sẵn sàng
        api.get(environment.api.endpoints.users)
            .then(res => setUsers(res.data))
            .catch(() => message.error('Không thể tải danh sách người dùng'));
    }, []);

    // Filter users theo search (có thể dùng API filter nếu backend hỗ trợ)
    const filteredUsers = users.filter(u => {
        const s = search.toLowerCase();
        return (
            u.name.toLowerCase().includes(s) ||
            u.username.toLowerCase().includes(s) ||
            u.phone.includes(s)
        );
    });
    // TODO: Nếu muốn search bằng API, gọi api.get(`${environment.api.endpoints.users}?search=${search}`)

    // Xử lý action
    const handleViewWallet = (user) => {
        setSelectedUser(user);
        setWalletVisible(true);
        // TODO: Gọi API lấy số dư và lịch sử ví nếu cần
        // api.get(environment.api.buildEndpoint(`/wallets/${user.id}`))
    };
    const handleDeposit = (user) => {
        setSelectedUser(user);
        setDepositVisible(true);
    };
    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsCreate(false);
        setEditVisible(true);
    };
    const handleDelete = (user) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc muốn xóa người dùng "${user.name}"?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: () => {
                // TODO: Gọi API xóa user
                api.delete(`${environment.api.endpoints.users}/${user.id}`)
                    .then(() => {
                        setUsers(prev => prev.filter(u => u.id !== user.id));
                        message.success('Đã xóa người dùng');
                    })
                    .catch(() => message.error('Xóa người dùng thất bại'));
            },
        });
    };

    // Xử lý submit form
    const handleDepositSubmit = (values) => {
        setDepositVisible(false);
        // TODO: Gọi API nạp tiền
        // api.post(environment.api.buildEndpoint('/wallets/deposit'), { userId: selectedUser.id, ...values })
        message.success(`Nạp ${values.amount.toLocaleString('vi-VN')} thành công (mock)`);
    };
    const handleEditSubmit = (values) => {
        if (isCreate) {
            // TODO: Gọi API tạo user
            api.post(environment.api.endpoints.users, values)
                .then(res => {
                    setUsers(prev => [...prev, res.data]);
                    message.success('Thêm người dùng thành công');
                })
                .catch(() => message.error('Thêm người dùng thất bại'));
        } else {
            // TODO: Gọi API cập nhật user
            api.put(`${environment.api.endpoints.users}/${selectedUser.id}`, values)
                .then(res => {
                    setUsers(prev => prev.map(u =>
                        u.id === selectedUser.id ? res.data : u
                    ));
                    message.success('Cập nhật thông tin thành công');
                })
                .catch(() => message.error('Cập nhật thông tin thất bại'));
        }
        setEditVisible(false);
    };

    // Thêm mới user
    const handleCreate = () => {
        setSelectedUser(null);
        setIsCreate(true);
        setEditVisible(true);
    };

    // Làm mới
    const handleRefresh = () => {
        setSearch('');
        // TODO: Gọi lại API lấy danh sách user
        api.get(environment.api.endpoints.users)
            .then(res => setUsers(res.data))
            .catch(() => message.error('Không thể tải danh sách người dùng'));
        message.success('Đã làm mới danh sách');
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h1 style={{ margin: 0 }}>Quản lý ví người dùng</h1>
                <Space>
                    <Tooltip title="Làm mới danh sách">
                        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                            Làm mới
                        </Button>
                    </Tooltip>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        Thêm người dùng
                    </Button>
                </Space>
            </div>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Input
                    prefix={<SearchOutlined />}
                    placeholder="Tìm theo tên, tài khoản, số điện thoại"
                    allowClear
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: 300, borderRadius: 4 }}
                />
            </div>
            <UserTable
                onViewWallet={handleViewWallet}
                onDeposit={handleDeposit}
                onEdit={handleEdit}
                onDelete={handleDelete}
                users={filteredUsers}
            />
            <WalletModal
                visible={walletVisible}
                onClose={() => setWalletVisible(false)}
                user={selectedUser}
            // TODO: Truyền thêm props lịch sử ví, số dư từ API nếu cần
            />
            <DepositModal
                visible={depositVisible}
                onClose={() => setDepositVisible(false)}
                onSubmit={handleDepositSubmit}
                user={selectedUser}
            />
            <EditUserModal
                visible={editVisible}
                onClose={() => setEditVisible(false)}
                onSubmit={handleEditSubmit}
                user={selectedUser}
                isCreate={isCreate}
            />
        </div>
    );
};

export default UserManagement; 