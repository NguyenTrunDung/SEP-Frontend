import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tooltip, Popconfirm, message } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, WalletOutlined } from '@ant-design/icons';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import { PERMISSIONS } from '../../../constants/permissions';

const UserTable = ({ users, loading, onViewWallet, onDeposit, onEdit, onDelete, pagination, ...props }) => {
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
                            onClick={() => onViewWallet(record)}
                            className="action-btn view-btn"
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Nạp tiền">
                        <Button
                            type="text"
                            icon={<WalletOutlined />}
                            onClick={() => onDeposit(record)}
                            className="action-btn deposit-btn"
                            size="small"
                        />
                    </Tooltip>
                    {/* Edit and Delete buttons will be handled by ReusableTableV2 */}
                </Space>
            ),
        },
    ];

    return (
        <ReusableTableV2
            columns={columns}
            dataSource={users}
            loading={loading}
            pagination={pagination}
            rowKey="userId"
            resourceName="users"
            editPermission={PERMISSIONS.USERS_EDIT}
            deletePermission={PERMISSIONS.USERS_DELETE}
            hideActionsOnNoPermission={true}
            showPermissionTooltips={true}
            onEdit={onEdit}
            onDelete={onDelete}
            customPermissionCheck={(action, record) => {
                // Custom permission logic if needed
                if (action === 'edit') {
                    // Additional checks for editing users
                    return true; // Or implement custom logic
                }
                if (action === 'delete') {
                    // Additional checks for deleting users  
                    return true; // Or implement custom logic
                }
                return true;
            }}
        />
    );
};

export default UserTable; 