import React from 'react';
import { Row, Col, Card, Typography, Layout, Image } from 'antd';
import AuthForm from '../../components/common/AuthForm';
import './Login.css';

const { Title } = Typography;
const { Content } = Layout;

const Login = () => {
    return (
        <Layout className="login-layout">
            <Content>
                <Row className="login-row" justify="center" align="middle">
                    <Col xs={22} sm={18} md={12} lg={10} xl={8}>
                        <Card
                            className="login-card"
                            bordered={false}
                            cover={
                                <div className="login-header">
                                    {/* Optional: Add a hospital logo here */}
                                    {/* <Image 
                                        src="/logo.png" 
                                        alt="Hospital Logo"
                                        preview={false}
                                        width={80}
                                    /> */}
                                    <Title level={2} className="login-title">
                                        Hospital Canteen
                                    </Title>
                                    <p className="login-subtitle">
                                        Sign in to access the management system
                                    </p>
                                </div>
                            }
                        >
                            <AuthForm
                                title=""
                                submitText="Sign In"
                                showTestAccounts={true}
                            />
                        </Card>
                        <div className="login-footer">
                            <p>© {new Date().getFullYear()} Hospital Canteen Management System</p>
                        </div>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default Login; 