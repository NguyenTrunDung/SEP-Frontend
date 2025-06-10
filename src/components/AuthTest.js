import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Divider, Tag, Space, Alert, Table, Row, Col, Select } from 'antd';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { TEST_ACCOUNTS } from '../constants/roles';
import { getDisplayRole } from '../utils/authUtils';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const AuthTest = () => {
    const [loginForm] = Form.useForm();
    const [loginLoading, setLoginLoading] = useState(false);
    const [selectedTestAccount, setSelectedTestAccount] = useState('ADMIN');

    const {
        user,
        loading,
        error,
        login,
        logout,
        permissions,
        userBranches,
        defaultBranch,
        selectedBranch,
        isSystemAdmin,
        selectBranch,
        isAuthenticated,
        isTokenExpired
    } = useAuth();

    const {
        hasPermission,
        hasAnyPermission,
        PERMISSIONS,
        canViewOverview,
        canManageFoods,
        canManageOrders,
        canManageUsers,
        canViewReports
    } = usePermissions();

    const handleLogin = async (values) => {
        setLoginLoading(true);
        try {
            await login(values);
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        loginForm.resetFields();
        setSelectedTestAccount('ADMIN');
    };

    const handleTestAccountChange = (accountKey) => {
        setSelectedTestAccount(accountKey);
        const account = TEST_ACCOUNTS[accountKey];
        loginForm.setFieldsValue({
            email: account.email,
            password: account.password
        });
    };

    const handleBranchSelect = async (branchId) => {
        try {
            await selectBranch(branchId);
        } catch (error) {
            console.error('Branch selection error:', error);
        }
    };

    const testPermissions = [
        { permission: 'overview:view', label: 'View Overview', category: 'General' },
        { permission: 'foods:view', label: 'View Foods', category: 'Food Management' },
        { permission: 'foods:add', label: 'Add Foods', category: 'Food Management' },
        { permission: 'foods:edit', label: 'Edit Foods', category: 'Food Management' },
        { permission: 'orders:view', label: 'View Orders', category: 'Order Management' },
        { permission: 'orders:add', label: 'Add Orders', category: 'Order Management' },
        { permission: 'orders:approve', label: 'Approve Orders', category: 'Order Management' },
        { permission: 'kitchen:view', label: 'Kitchen Dashboard', category: 'Kitchen' },
        { permission: 'kitchen:status', label: 'Update Kitchen Status', category: 'Kitchen' },
        { permission: 'users:view', label: 'View Users', category: 'User Management' },
        { permission: 'users:edit', label: 'Edit Users', category: 'User Management' },
        { permission: 'patients:view', label: 'View Patients', category: 'Patient Care' },
        { permission: 'reports:view', label: 'View Reports', category: 'Reports' },
        { permission: 'system:settings', label: 'System Settings', category: 'System' },
        { permission: 'branches:view', label: 'View Branches', category: 'Branch Management' }
    ];

    const permissionColumns = [
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: 150,
        },
        {
            title: 'Permission',
            dataIndex: 'permission',
            key: 'permission',
            render: (text) => <Text code style={{ fontSize: '11px' }}>{text}</Text>
        },
        {
            title: 'Description',
            dataIndex: 'label',
            key: 'label'
        },
        {
            title: 'Access',
            key: 'access',
            width: 100,
            render: (_, record) => (
                <Tag color={hasPermission(record.permission) ? 'green' : 'red'} size="small">
                    {hasPermission(record.permission) ? 'Granted' : 'Denied'}
                </Tag>
            )
        }
    ];

    if (loading) {
        return (
            <Card style={{ maxWidth: 600, margin: '50px auto' }}>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Text>Loading authentication state...</Text>
                </div>
            </Card>
        );
    }

    if (!isAuthenticated) {
        return (
            <Card title="🔐 HOMMS Authentication Test - Login Required" style={{ maxWidth: 600, margin: '50px auto' }}>
                {error && (
                    <Alert
                        message="Login Error"
                        description={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                        <Text strong>Quick Test Account Selection:</Text>
                        <Select
                            value={selectedTestAccount}
                            onChange={handleTestAccountChange}
                            style={{ width: '100%', marginTop: 8 }}
                            placeholder="Select a test account"
                        >
                            {Object.entries(TEST_ACCOUNTS).map(([key, account]) => (
                                <Option key={key} value={key}>
                                    <Space>
                                        <Tag color={key === 'ADMIN' ? 'red' : 'blue'} size="small">
                                            {account.role}
                                        </Tag>
                                        <Text style={{ fontSize: '12px' }}>{account.email}</Text>
                                    </Space>
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <Form
                        form={loginForm}
                        onFinish={handleLogin}
                        layout="vertical"
                        initialValues={{
                            email: TEST_ACCOUNTS.ADMIN.email,
                            password: TEST_ACCOUNTS.ADMIN.password
                        }}
                    >
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Please input your email!' },
                                { type: 'email', message: 'Please enter a valid email!' }
                            ]}
                        >
                            <Input placeholder="Enter your email" />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                            <Input.Password placeholder="Enter your password" />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loginLoading}
                                block
                            >
                                Test Login
                            </Button>
                        </Form.Item>
                    </Form>

                    <Divider />

                    <div style={{ textAlign: 'center' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            This is a development authentication test interface.<br />
                            Select different accounts above to test various permission levels.
                        </Text>
                    </div>
                </Space>
            </Card>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card
                        title="🛡️ Authentication Status"
                        extra={
                            <Button type="primary" danger onClick={handleLogout}>
                                Logout
                            </Button>
                        }
                    >
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <div>
                                        <Text strong>User: </Text>
                                        <Text>{user?.fullName || user?.firstName + ' ' + user?.lastName || user?.email}</Text>
                                    </div>

                                    <div>
                                        <Text strong>Email: </Text>
                                        <Text>{user?.email}</Text>
                                    </div>

                                    <div>
                                        <Text strong>Display Role: </Text>
                                        <Tag color={isSystemAdmin ? 'red' : 'blue'}>
                                            {getDisplayRole(user, isSystemAdmin)}
                                        </Tag>
                                    </div>

                                    <div>
                                        <Text strong>Backend Roles: </Text>
                                        {user?.roles?.map(role => (
                                            <Tag key={role} color="geekblue" size="small">
                                                {role}
                                            </Tag>
                                        ))}
                                    </div>
                                </Space>
                            </Col>

                            <Col span={12}>
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <div>
                                        <Text strong>User ID: </Text>
                                        <Text code style={{ fontSize: '11px' }}>{user?.id}</Text>
                                    </div>

                                    <div>
                                        <Text strong>Token Status: </Text>
                                        <Tag color={isTokenExpired ? 'red' : 'green'}>
                                            {isTokenExpired ? 'Expired' : 'Valid'}
                                        </Tag>
                                    </div>

                                    <div>
                                        <Text strong>Total Permissions: </Text>
                                        <Tag color="blue">{permissions?.length || 0}</Tag>
                                    </div>

                                    <div>
                                        <Text strong>System Admin: </Text>
                                        <Tag color={isSystemAdmin ? 'red' : 'default'}>
                                            {isSystemAdmin ? 'Yes' : 'No'}
                                        </Tag>
                                    </div>
                                </Space>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col span={16}>
                    <Card title="🔐 Permission Test Matrix" size="small">
                        <Table
                            columns={permissionColumns}
                            dataSource={testPermissions}
                            pagination={false}
                            size="small"
                            rowKey="permission"
                            scroll={{ y: 400 }}
                        />
                    </Card>
                </Col>

                <Col span={8}>
                    <Card title="⚡ Quick Permission Checks" size="small">
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <div>
                                <Text strong>Can View Overview: </Text>
                                <Tag color={canViewOverview ? 'green' : 'red'} size="small">
                                    {canViewOverview ? 'Yes' : 'No'}
                                </Tag>
                            </div>

                            <div>
                                <Text strong>Can Manage Foods: </Text>
                                <Tag color={canManageFoods ? 'green' : 'red'} size="small">
                                    {canManageFoods ? 'Yes' : 'No'}
                                </Tag>
                            </div>

                            <div>
                                <Text strong>Can Manage Orders: </Text>
                                <Tag color={canManageOrders ? 'green' : 'red'} size="small">
                                    {canManageOrders ? 'Yes' : 'No'}
                                </Tag>
                            </div>

                            <div>
                                <Text strong>Can Manage Users: </Text>
                                <Tag color={canManageUsers ? 'green' : 'red'} size="small">
                                    {canManageUsers ? 'Yes' : 'No'}
                                </Tag>
                            </div>

                            <div>
                                <Text strong>Can View Reports: </Text>
                                <Tag color={canViewReports ? 'green' : 'red'} size="small">
                                    {canViewReports ? 'Yes' : 'No'}
                                </Tag>
                            </div>
                        </Space>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title="🏢 Branch Information" size="small">
                        <Row gutter={[16, 16]}>
                            <Col span={8}>
                                <div>
                                    <Text strong>Default Branch: </Text>
                                    {defaultBranch ? (
                                        <div>
                                            <Text>{defaultBranch.name}</Text>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: '12px' }}>{defaultBranch.code}</Text>
                                        </div>
                                    ) : (
                                        <Text type="secondary">None</Text>
                                    )}
                                </div>
                            </Col>

                            <Col span={8}>
                                <div>
                                    <Text strong>Selected Branch: </Text>
                                    {selectedBranch ? (
                                        <div>
                                            <Text>{selectedBranch.name}</Text>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: '12px' }}>{selectedBranch.code}</Text>
                                        </div>
                                    ) : (
                                        <Text type="secondary">None</Text>
                                    )}
                                </div>
                            </Col>

                            <Col span={8}>
                                <div>
                                    <Text strong>Available Branches: </Text>
                                    <Text>{userBranches?.length || 0}</Text>
                                    {userBranches?.length > 0 && (
                                        <div style={{ marginTop: 8 }}>
                                            {userBranches.map(branch => (
                                                <Tag
                                                    key={branch.branchId}
                                                    color="blue"
                                                    style={{ marginBottom: 4, cursor: 'pointer' }}
                                                    onClick={() => handleBranchSelect(branch.branchId)}
                                                    size="small"
                                                >
                                                    {branch.branchName}
                                                </Tag>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title="📋 All User Permissions" size="small">
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            <Space wrap>
                                {permissions?.map(permission => (
                                    <Tag key={permission} color="green" size="small">
                                        {permission}
                                    </Tag>
                                ))}
                            </Space>
                            {(!permissions || permissions.length === 0) && (
                                <Text type="secondary">No permissions loaded</Text>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AuthTest; 