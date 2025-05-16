// src/pages/Orders/OrderList.js
import React, { useState } from 'react';
import { Table, Tag, Button, Space, Select, Input, Form, Spin, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useOrders, useUpdateOrderStatus } from '../../../hooks/queries/userOrderQueries';
import { ORDER_STATUS } from '../../../mocks/orderData';

const { Option } = Select;

// Tag colors for different statuses
const statusColors = {
    [ORDER_STATUS.PENDING]: 'blue',
    [ORDER_STATUS.PREPARING]: 'orange',
    [ORDER_STATUS.READY]: 'green',
    [ORDER_STATUS.DELIVERED]: 'purple',
    [ORDER_STATUS.CANCELLED]: 'red',
};

const OrderList = () => {
    // State for filters
    const [filters, setFilters] = useState({});
    const [form] = Form.useForm();

    // Get orders with React Query
    const { data: orders, isLoading, isError, refetch } = useOrders(filters);

    // Update order status mutation
    const updateOrderStatus = useUpdateOrderStatus();

    const handleUpdateStatus = (orderId, status) => {
        updateOrderStatus.mutate(
            { orderId, status },
            {
                onSuccess: () => {
                    message.success(`Order status updated to ${status}`);
                },
                onError: (error) => {
                    message.error(`Failed to update status: ${error.message}`);
                },
            }
        );
    };

    const handleSearch = (values) => {
        setFilters(values);
    };

    const resetFilters = () => {
        form.resetFields();
        setFilters({});
    };

    const columns = [
        {
            title: 'Order ID',
            dataIndex: 'id',
            key: 'id',
            render: (id) => id.substring(0, 8) + '...',
        },
        {
            title: 'Customer',
            dataIndex: 'userName',
            key: 'userName',
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
        },
        {
            title: 'Items',
            dataIndex: 'items',
            key: 'items',
            render: (items) => `${items.length} item(s)`,
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            render: (total) => `$${total.toFixed(2)}`,
            sorter: (a, b) => a.total - b.total,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={statusColors[status] || 'default'}>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleString(),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Select
                        value={record.status}
                        style={{ width: 120 }}
                        onChange={(value) => handleUpdateStatus(record.id, value)}
                        disabled={record.status === ORDER_STATUS.CANCELLED || updateOrderStatus.isPending}
                    >
                        {Object.values(ORDER_STATUS).map((status) => (
                            <Option key={status} value={status}>{status}</Option>
                        ))}
                    </Select>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <h1>Orders Management</h1>

            <Form
                form={form}
                layout="inline"
                onFinish={handleSearch}
                style={{ marginBottom: '20px' }}
            >
                <Form.Item name="status" label="Status">
                    <Select style={{ width: 150 }} allowClear placeholder="Filter by status">
                        {Object.values(ORDER_STATUS).map((status) => (
                            <Option key={status} value={status}>{status}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="userId" label="User ID">
                    <Input placeholder="Filter by user ID" />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SearchOutlined />}
                    >
                        Search
                    </Button>
                </Form.Item>

                <Form.Item>
                    <Button onClick={resetFilters} icon={<ReloadOutlined />}>
                        Reset
                    </Button>
                </Form.Item>
            </Form>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                </div>
            ) : isError ? (
                <div style={{ color: 'red', padding: '20px' }}>
                    Error loading orders. Please try again.
                </div>
            ) : (
                <Table
                    dataSource={orders}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            )}
        </div>
    );
};

export default OrderList;