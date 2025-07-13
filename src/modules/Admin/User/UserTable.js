import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tooltip, Popconfirm, message } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, WalletOutlined } from '@ant-design/icons';

const UserTable = ({ users, loading, ...props }) => {
    const columns = [
        {
            title: 'TÊN KHÁCH HÀNG',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'TÀI KHOẢN',
            dataIndex: 'username',
            key: 'username',
            sorter: (a, b) => a.username.localeCompare(b.username),
        },
        {
            title: 'SỐ ĐIỆN THOẠI',
            dataIndex: 'phone',
            key: 'phone',
            sorter: (a, b) => a.phone.localeCompare(b.phone),
        },
        {
            title: 'SỐ DƯ',
            dataIndex: 'balance',
            key: 'balance',
            sorter: (a, b) => a.balance - b.balance,
            render: (value) => value.toLocaleString('vi-VN'),
        },
        {
            title: 'HÀNH ĐỘNG',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem ví">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => props.onViewWallet(record)}
                            className="action-btn view-btn"
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Nạp tiền">
                        <Button
                            type="text"
                            icon={<WalletOutlined />}
                            onClick={() => props.onDeposit(record)}
                            className="action-btn deposit-btn"
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => props.onEdit(record)}
                            className="action-btn edit-btn"
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xóa người dùng"
                            description={`Bạn có chắc chắn muốn xóa người dùng ${record.name}?`}
                            onConfirm={() => props.onDelete(record)}
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

    return <Table rowKey="userId" columns={columns} dataSource={users} loading={loading} pagination={false} />;
};

export default UserTable; 