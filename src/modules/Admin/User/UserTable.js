import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tooltip, Popconfirm, message } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, WalletOutlined } from '@ant-design/icons';

const UserTable = ({ users, loading, ...props }) => {
    const columns = [
        {
            title: 'TÊN NGƯỜI DÙNG',
            dataIndex: 'userName',
            key: 'userName',
            sorter: (a, b) => (a.userName || '').localeCompare(b.userName || ''),
        },
        {
            title: 'HỌ',
            dataIndex: 'firstName',
            key: 'firstName',
            sorter: (a, b) => (a.firstName || '').localeCompare(b.firstName || ''),
        },
        {
            title: 'TÊN',
            dataIndex: 'lastName',
            key: 'lastName',
            sorter: (a, b) => (a.lastName || '').localeCompare(b.lastName || ''),
        },
        {
            title: 'EMAIL',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),
        },
        {
            title: 'SỐ ĐIỆN THOẠI',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            sorter: (a, b) => (a.phoneNumber || '').localeCompare(b.phoneNumber || ''),
        },
        {
            title: 'SỐ DƯ',
            dataIndex: 'balance',
            key: 'balance',
            sorter: (a, b) => (a.balance || 0) - (b.balance || 0),
            render: (value) => (value == null ? 0 : value).toLocaleString('vi-VN'),
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
                            description={`Bạn có chắc chắn muốn xóa người dùng ${record.userName || ''}?`}
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

    return <Table rowKey="userId" columns={columns} dataSource={users} loading={loading} pagination={{ pageSize: 10 }} />;
};

export default UserTable; 