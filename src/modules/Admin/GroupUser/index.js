import React, { useState } from 'react';
import { Table, Button, Space, Tooltip, message, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import GroupUserModal from './GroupUserModal';

// Mock data nhóm người dùng
const initialGroups = [
    { id: 1, name: 'Nhóm Quản trị viên', permissions: ['overview:view', 'orders:view', 'orders:add', 'orders:edit'] },
    { id: 2, name: 'Nhóm Nhân viên', permissions: ['orders:view'] },
];

// Mock cấu trúc menu và quyền
const menuTree = [
    {
        title: 'Tổng quan',
        key: 'overview',
        children: [
            { title: 'Xem', key: 'overview:view' },
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
            { title: 'Xem QR', key: 'orders:qr' },
            { title: 'Hủy đơn', key: 'orders:cancel' },
            { title: 'Chuyển trạng thái', key: 'orders:status' },
        ],
    },
    {
        title: 'Nhà bếp',
        key: 'kitchen',
        children: [
            { title: 'Xem', key: 'kitchen:view' },
        ],
    },
];

const GroupUser = () => {
    const [groups, setGroups] = useState(initialGroups);
    const [search, setSearch] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [checkedKeys, setCheckedKeys] = useState([]);
    const [isEdit, setIsEdit] = useState(false);

    // Filter nhóm theo search
    const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

    // Mở modal thêm/sửa
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

    // Đóng modal
    const closeModal = () => {
        setModalVisible(false);
        setEditingGroup(null);
        setCheckedKeys([]);
        setIsEdit(false);
    };

    // Xử lý submit
    const handleModalOk = (values) => {
        if (editingGroup) {
            // TODO: Gọi API cập nhật nhóm
            setGroups(prev => prev.map(g => g.id === editingGroup.id ? { ...g, name: values.name, permissions: values.permissions } : g));
            message.success('Cập nhật nhóm thành công (mock)');
        } else {
            // TODO: Gọi API tạo nhóm
            setGroups(prev => [...prev, { id: Date.now(), name: values.name, permissions: values.permissions }]);
            message.success('Thêm nhóm thành công (mock)');
        }
        closeModal();
    };

    // Xử lý xóa
    const handleDelete = (group) => {
        // TODO: Gọi API xóa nhóm
        setGroups(prev => prev.filter(g => g.id !== group.id));
        message.success('Đã xóa nhóm (mock)');
    };

    // Làm mới
    const handleRefresh = () => {
        // TODO: Gọi API lấy lại danh sách nhóm
        setGroups(initialGroups);
        message.success('Đã làm mới danh sách');
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
            <Table rowKey="id" columns={columns} dataSource={filteredGroups} pagination={false} />
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