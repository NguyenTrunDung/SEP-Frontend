import React, { useState, useEffect } from 'react';
import UserTable from './UserTable';
import WalletModal from './WalletModal';
import DepositModal from './DepositModal';
import EditUserModal from './EditUserModal';
import { Modal, message, Input, Button, Space, Tooltip } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../../../services/api/config';
import environment from '../../../config/environment';
import { fetchUserWalletList } from '../../../services/userWalletService';

const initialUsers = [
    {
        userId: 1, // Đổi từ id sang userId cho đồng bộ
        name: 'Nguyễn Văn A',
        username: 'nguyenvana',
        phone: '0912345678',
        balance: 45400,
        email: 'vana@example.com',
    },
    {
        userId: 2,
        name: 'Trần Thị B',
        username: 'tranthib',
        phone: '0987654321',
        balance: 120000,
        email: 'thib@example.com',
    },
];

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [walletVisible, setWalletVisible] = useState(false);
    const [depositVisible, setDepositVisible] = useState(false);
    const [editVisible, setEditVisible] = useState(false);
    const [isCreate, setIsCreate] = useState(false);
    const [branchId, setBranchId] = useState(localStorage.getItem('currentBranchId'));

    // Hàm load lại danh sách user wallet
    const loadUserWalletList = () => {
        setLoading(true);
        fetchUserWalletList()
            .then((users) => {
                const safeUsers = users.map(u => ({
                    ...u,
                    name: u.fullName == null ? 'NULL' : u.fullName,
                    username: u.email == null ? 'NULL' : u.email,
                    phone: u.phoneNumber == null ? 'NULL' : u.phoneNumber,
                    balance: u.balance == null ? 0 : u.balance,
                    customerCode: u.customerCode == null ? 'NULL' : u.customerCode,
                    isCustomerAccount: u.isCustomerAccount == null ? 'NULL' : u.isCustomerAccount,
                    isCustomerEnabled: u.isCustomerEnabled == null ? 'NULL' : u.isCustomerEnabled,
                }));
                setUsers(safeUsers);
            })
            .catch(() => message.error('Không thể tải danh sách người dùng'))
            .finally(() => setLoading(false));
    };

    // Lắng nghe sự thay đổi branchId trong localStorage (tab khác) và custom event (tab hiện tại)
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'currentBranchId') {
                setBranchId(localStorage.getItem('currentBranchId'));
            }
        };
        const handleBranchChanged = () => {
            setBranchId(localStorage.getItem('currentBranchId'));
        };
        window.addEventListener('storage', handleStorage);
        window.addEventListener('branchChanged', handleBranchChanged);
        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('branchChanged', handleBranchChanged);
        };
    }, []);

    // Load lại data khi branchId thay đổi
    useEffect(() => {
        if (!branchId) return;
        loadUserWalletList();
    }, [branchId]);

    // Hàm này bạn gọi sau khi chuyển branch thành công
    const handleBranchChange = () => {
        loadUserWalletList();
    };

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
                api.delete(`${environment.api.endpoints.users}/${user.userId}`)
                    .then(() => {
                        setUsers(prev => prev.filter(u => u.userId !== user.userId));
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
        // api.post(environment.api.buildEndpoint('/wallets/deposit'), { userId: selectedUser.userId, ...values })
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
            api.put(`${environment.api.endpoints.users}/${selectedUser.userId}`, values)
                .then(res => {
                    setUsers(prev => prev.map(u =>
                        u.userId === selectedUser.userId ? res.data : u
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
        setLoading(true);
        fetchUserWalletList()
            .then(setUsers)
            .catch(() => message.error('Không thể tải danh sách người dùng'))
            .finally(() => setLoading(false));
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
                users={users}
                loading={loading}
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