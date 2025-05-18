import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, ShoppingCartOutlined, FileTextOutlined, DollarOutlined } from '@ant-design/icons';

const Dashboard = () => {
    return (
        <div style={{ padding: '24px', background: '#fff', borderRadius: '8px' }}>
            <h1>Welcome to Admin Dashboard</h1>
            <p>Select an option from the sidebar to manage your hospital canteen.</p>

            <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Users"
                            value={1234}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Active Orders"
                            value={56}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Menu Items"
                            value={89}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Today's Revenue"
                            value={2345}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#f5222d' }}
                            precision={2}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard; 