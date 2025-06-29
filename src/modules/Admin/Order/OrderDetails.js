// src/pages/Orders/OrderDetail.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, List, Tag, Button, Spin, Select, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useOrderById, useUpdateOrderStatus } from '../../../hooks/queries/userOrderQueries';
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

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Fetch order details
    const { data: order, isLoading, isError } = useOrderById(id);

    // Update order status mutation
    const updateOrderStatus = useUpdateOrderStatus();

    const handleUpdateStatus = (status) => {
        updateOrderStatus.mutate(
            { orderId: id, status },
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

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div style={{ padding: '20px' }}>
                <h2>Error loading order details</h2>
                <Button type="primary" onClick={() => navigate('/orders')}>
                    Back to Orders
                </Button>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/orders')}
                style={{ marginBottom: '16px' }}
            >
                Back to Orders
            </Button>

            <Card title={`Order Details - ${order.id}`}>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Customer">{order.userName}</Descriptions.Item>
                    <Descriptions.Item label="Department">{order.department}</Descriptions.Item>

                    <Descriptions.Item label="Status">
                        <Tag color={statusColors[order.status] || 'default'}>
                            {order.status}
                        </Tag>

                        {order.status !== ORDER_STATUS.CANCELLED && (
                            <Select
                                value={order.status}
                                style={{ width: 150, marginLeft: '10px' }}
                                onChange={handleUpdateStatus}
                                loading={updateOrderStatus.isPending}
                            >
                                {Object.values(ORDER_STATUS).map((status) => (
                                    <Option key={status} value={status}>{status}</Option>
                                ))}
                            </Select>
                        )}
                    </Descriptions.Item>

                    <Descriptions.Item label="Created">{new Date(order.createdAt).toLocaleString()}</Descriptions.Item>
                    <Descriptions.Item label="Last Updated">{new Date(order.updatedAt).toLocaleString()}</Descriptions.Item>
                    <Descriptions.Item label="Total Amount">${order.total.toFixed(2)}</Descriptions.Item>

                    {order.notes && (
                        <Descriptions.Item label="Notes" span={2}>
                            {order.notes}
                        </Descriptions.Item>
                    )}
                </Descriptions>

                <h3 style={{ marginTop: '24px' }}>Order Items</h3>
                <List
                    bordered
                    dataSource={order.items}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta
                                title={item.name}
                                description={`Quantity: ${item.quantity} × $${item.price.toFixed(2)}`}
                            />
                            <div>${item.subtotal.toFixed(2)}</div>
                        </List.Item>
                    )}
                    footer={<div style={{ textAlign: 'right' }}><strong>Total: ${order.total.toFixed(2)}</strong></div>}
                />
            </Card>
        </div>
    );
};

export default OrderDetail;