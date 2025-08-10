import React, { useState, useEffect, useMemo } from 'react';
import { Button, Space, Tooltip, message, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import GroupUserModal from './GroupUserModal';
import { fetchGroupUsersByBranch, createGroupUser, updateGroupUser, deleteGroupUser } from '../../../services/groupUserService';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';

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
        title: 'Đơn hàng bệnh nhân',
        key: 'orderpatients',
        children: [
            { title: 'Xem', key: 'orderpatients:view' },
            { title: 'Thêm', key: 'orderpatients:add' },
            { title: 'Sửa', key: 'orderpatients:edit' },
            { title: 'Xóa', key: 'orderpatients:delete' },
            { title: 'Duyệt đơn', key: 'orderpatients:approve' },
            { title: 'Hủy đơn', key: 'orderpatients:cancel' },
            { title: 'Chuyển trạng thái', key: 'orderpatients:status' },
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
        title: 'Phản hồi',
        key: 'feedbacks',
        children: [
            { title: 'Xem', key: 'feedbacks:view' },
            { title: 'Trả lời', key: 'feedbacks:reply' },
            { title: 'Xóa', key: 'feedbacks:delete' },
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
        title: 'Khoa phòng',
        key: 'departments',
        children: [
            { title: 'Xem', key: 'departments:view' },
            { title: 'Thêm', key: 'departments:add' },
            { title: 'Sửa', key: 'departments:edit' },
            { title: 'Xóa', key: 'departments:delete' },
        ],
    },
    {
        title: 'Danh mục bệnh',
        key: 'diseasecategories',
        children: [
            { title: 'Xem', key: 'diseasecategories:view' },
            { title: 'Thêm', key: 'diseasecategories:add' },
            { title: 'Sửa', key: 'diseasecategories:edit' },
            { title: 'Xóa', key: 'diseasecategories:delete' },
        ],
    },
    {
        title: 'Thức ăn cho bệnh nhân',
        key: 'foodforpatients',
        children: [
            { title: 'Xem', key: 'foodforpatients:view' },
            { title: 'Thêm', key: 'foodforpatients:add' },
            { title: 'Sửa', key: 'foodforpatients:edit' },
            { title: 'Xóa', key: 'foodforpatients:delete' },
            //   { title: 'Quản lý hạn chế', key: 'foodforpatients:restrictions' },
        ],
    },
    {
        title: 'Nhóm người dùng',
        key: 'groupusers',
        children: [
            { title: 'Xem', key: 'groupusers:view' },
            { title: 'Thêm', key: 'groupusers:add' },
            { title: 'Sửa', key: 'groupusers:edit' },
            { title: 'Xóa', key: 'groupusers:delete' },
            { title: 'Gán quyền', key: 'groupusers:permissions' },
        ],
    },
    {
        title: 'Tài khoản người dùng',
        key: 'useraccounts',
        children: [
            { title: 'Xem', key: 'useraccounts:view' },
            { title: 'Thêm', key: 'useraccounts:add' },
            { title: 'Sửa', key: 'useraccounts:edit' },
            { title: 'Xóa', key: 'useraccounts:delete' },
            { title: 'Khóa/Mở khóa', key: 'useraccounts:status' },
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
    const [search] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [checkedKeys, setCheckedKeys] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
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

    const filteredGroups = useMemo(() => {
        return groups.filter(g => g.name && g.name.toLowerCase().includes(search.toLowerCase()));
    }, [groups, search]);

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

    const handleModalOk = async (values) => {
        try {
            const branchId = localStorage.getItem('currentBranchId') || '1';
            const payload = {
                name: values.name,
                permissions: values.permissions,
                branchId: parseInt(branchId)
            };

            if (editingGroup) {
                await updateGroupUser(editingGroup.id, payload);
                setGroups(prev => prev.map(g => g.id === editingGroup.id ? { ...g, ...payload } : g));
                message.success('Cập nhật nhóm thành công!');
            } else {
                const newGroup = await createGroupUser(payload);
                setGroups(prev => [...prev, newGroup]);
                message.success('Thêm nhóm thành công!');
            }
            closeModal();
        } catch (error) {
            console.error('❌ Lỗi khi xử lý nhóm người dùng:', error);
            message.error(error.response?.data?.message || 'Lỗi khi xử lý nhóm người dùng!');
        }
    };

    const handleDelete = async (group) => {
        try {
            await deleteGroupUser(group.id);
            setGroups(prev => prev.filter(g => g.id !== group.id));
            message.success('Đã xóa nhóm thành công!');
        } catch (error) {
            console.error('❌ Lỗi khi xóa nhóm người dùng:', error);
            message.error(error.response?.data?.message || 'Lỗi khi xóa nhóm người dùng!');
        }
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
            title: 'TÊN NHÓM',
            dataIndex: 'name',
            key: 'name',
            align: 'left',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'HÀNH ĐỘNG',
            key: 'action',
            align: 'right',
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

    const paginationConfig = {
        show: true,
        pageSizeOptions: [5, 10, 20, 50],
        showSizeChanger: true,
        total: filteredGroups.length,
        current: currentPage,
        pageSize: pageSize,
        onChange: (page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
        },
        showTotal: (total, range) => `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} mục`,
    };

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h1 style={{ margin: 0 }}>Nhóm người dùng</h1>
                <Space>
                    <Tooltip title="Làm mới danh sách">
                        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>Làm mới</Button>
                    </Tooltip>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
                        Thêm
                    </Button>
                </Space>
            </div>
            <ReusableTableV2
                dataSource={filteredGroups.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                columns={columns}
                pagination={paginationConfig}
                listHeader="TÊN NHÓM"
                onEdit={openModal}
                onDelete={handleDelete}
                emptyMessage="Không tìm thấy nhóm người dùng nào."
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