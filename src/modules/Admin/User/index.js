import React, { useState, useEffect } from 'react';
import UserTable from './UserTable';
import WalletModal from './WalletModal';
import DepositModal from './DepositModal';
import UserModal from './UserModal';
import { Modal, message, Input, Button, Space, Tooltip } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../../../services/api/config';
import environment from '../../../config/environment';
import { fetchUserWalletList, depositToWallet, createUser, updateWallet, deleteUserWallet } from '../../../services/userWalletService';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import { PERMISSIONS } from '../../../constants/permissions';

// const initialUsers = [
//     {
//         userId: 1,
//         name: 'Nguyễn Văn A',
//         username: 'nguyenvana',
//         phone: '0912345678',
//         balance: 45400,
//         email: 'vana@example.com',
//     },
//     {
//         userId: 2,
//         name: 'Trần Thị B',
//         username: 'tranthib',
//         phone: '0987654321',
//         balance: 120000,
//         email: 'thib@example.com',
//     },
// ];

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [walletVisible, setWalletVisible] = useState(false);
    const [depositVisible, setDepositVisible] = useState(false);
    const [editVisible, setEditVisible] = useState(false);
    const [branchId, setBranchId] = useState(localStorage.getItem('currentBranchId'));
    const [createVisible, setCreateVisible] = useState(false);
    // State cho modal user chung
    const [userModalVisible, setUserModalVisible] = useState(false);
    const [userModalMode, setUserModalMode] = useState('create'); // 'create' | 'edit'
    const [editingUser, setEditingUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

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
        const s = search.trim().toLowerCase();
        // Gộp họ và tên, loại bỏ null/undefined
        const firstName = (u.firstName || '').toLowerCase();
        const lastName = (u.lastName || '').toLowerCase();
        const fullName = (firstName + ' ' + lastName).trim();
        const name = (u.name || '').toLowerCase();
        const username = (u.username || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const phone = (u.phone || u.phoneNumber || '').toLowerCase();
        const customerCode = (u.customerCode || '').toLowerCase();
        // Có thể thêm các trường khác nếu cần
        return (
            name.includes(s) ||
            fullName.includes(s) ||
            firstName.includes(s) ||
            lastName.includes(s) ||
            username.includes(s) ||
            email.includes(s) ||
            phone.includes(s) ||
            customerCode.includes(s)
        );
    });
    // TODO: Nếu muốn search bằng API, gọi api.get(`${environment.api.endpoints.users}?search=${search}`)

    // Tính toán dataSource cho trang hiện tại
    const pagedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
        setEditingUser(user);
        setUserModalMode('edit');
        setUserModalVisible(true);
    };
    const handleDelete = (user) => {
        const branchId = localStorage.getItem('currentBranchId');
        deleteUserWallet(user.userId, branchId)
            .then(() => {
                setUsers(prev => prev.filter(u => u.userId !== user.userId));
                message.success('Đã xóa người dùng');
            })
            .catch(() => message.error('Xóa người dùng thất bại'));
    };

    // Xử lý submit form
    const handleDepositSubmit = async (values) => {
        setDepositVisible(false);
        try {
            console.log('Dữ liệu nhận từ form nạp tiền:', values);
            await depositToWallet({
                userId: selectedUser.userId,
                amount: values.amount,
                description: values.description || '',
                createdBy: localStorage.getItem('rememberedEmail') || '',
                branchId: Number(localStorage.getItem('currentBranchId'))
            });
            message.success(`Nạp ${values.amount.toLocaleString('vi-VN')} thành công!`);
            loadUserWalletList();
        } catch (err) {
            message.error('Nạp tiền thất bại!');
        }
    };
    const handleEditSubmit = async (values) => {
        // TODO: Gọi API cập nhật user (giữ nguyên logic cũ hoặc cập nhật nếu có API update mới)
        api.put(`${environment.api.endpoints.users}/${selectedUser.userId}`, values)
            .then(res => {
                setUsers(prev => prev.map(u =>
                    u.userId === selectedUser.userId ? res.data : u
                ));
                message.success('Cập nhật thông tin thành công');
            })
            .catch(() => message.error('Cập nhật thông tin thất bại'));
        setEditVisible(false);
    };

    // Thêm mới user
    const handleCreate = () => {
        setEditingUser(null);
        setUserModalMode('create');
        setUserModalVisible(true);
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
        <PageWrapperV2
            title="Quản lý ví người dùng"
            resourceName="users"
            addPermission={PERMISSIONS.USERS_ADD}
            viewPermission={PERMISSIONS.USERS_VIEW}
            hideOnNoPermission={true}
            permissionFallback={<div>Bạn không có quyền truy cập trang quản lý ví người dùng.</div>}
            onAdd={handleCreate}
            addButtonText="Thêm người dùng"
            showAddButton={false} // Temporarily disabled based on commented button
            searchProps={{
                placeholder: "Tìm theo tên, tài khoản, số điện thoại",
                value: search,
                onChange: (e) => setSearch(e.target.value),
                onSearch: () => { }, // Add search functionality if needed
            }}
            actionButtons={[
                {
                    icon: <ReloadOutlined />,
                    onClick: handleRefresh,
                    tooltip: "Làm mới danh sách",
                    type: "default"
                }
            ]}
        >
            <UserTable
                onViewWallet={handleViewWallet}
                onDeposit={handleDeposit}
                onEdit={handleEdit}
                onDelete={handleDelete}
                users={pagedUsers}
                loading={loading}
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
                    showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} người dùng`,
                }}
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
            <UserModal
                visible={userModalVisible}
                mode={userModalMode}
                user={editingUser}
                onClose={() => setUserModalVisible(false)}
                onSubmit={async (values) => {
                    const branchId = Number(localStorage.getItem('currentBranchId'));
                    const createdBy = localStorage.getItem('rememberedEmail') || '';
                    if (userModalMode === 'create') {
                        const description = values.description || values.note || '';
                        const payload = {
                            userId: values.userId,
                            amount: values.amount ?? 0,
                            branchId,
                            description,
                            createdBy,
                            userName: values.userName,
                            password: values.password,
                            firstName: values.firstName,
                            lastName: values.lastName,
                            email: values.email,
                            phoneNumber: values.phoneNumber
                        };
                        console.log('Payload gửi lên API:', payload);
                        try {
                            await createUser(payload);
                            message.success('Thêm ví thành công');
                            setUserModalVisible(false);
                            loadUserWalletList();
                        } catch (err) {
                            const apiMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
                            if (apiMsg) {
                                message.error(apiMsg);
                            } else {
                                message.error('Thêm ví thất bại');
                            }
                        }
                    } else {
                        const payload = {
                            userId: editingUser.userId,
                            branchId,
                            userName: values.userName,
                            firstName: values.firstName,
                            lastName: values.lastName,
                            email: values.email,
                            phoneNumber: values.phoneNumber,
                            isActived: true
                        };
                        try {
                            await updateWallet(payload);
                            message.success('Cập nhật người dùng thành công');
                            setUserModalVisible(false);
                            loadUserWalletList();
                        } catch (err) {
                            const apiMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
                            if (apiMsg) {
                                message.error(apiMsg);
                            } else {
                                message.error('Câp nhật thất bại');
                            }
                        }
                    }
                }}
            />
        </PageWrapperV2>
    );
};

export default UserManagement; 