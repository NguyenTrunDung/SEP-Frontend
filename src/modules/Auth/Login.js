import React from 'react';
import { Row, Col, Card, Typography, Image, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom'; // Added Link import
import AuthForm from '../../components/common/AuthForm';
import './Login.css';

const { Title, Text } = Typography; // Added Text import

const Login = () => {
    const navigate = useNavigate();

    const handleClose = () => {
        navigate('/');
    };

    return (
        <div className="login-layout">
            <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={handleClose}
                className="close-button"
            />

            <Card className="login-card" bordered={false}>
                <Row gutter={0} align="middle">
                    <Col xs={24} md={17} className="login-left">
                        <Title level={2} className="login-title">
                            Hệ thống đặt suất ăn bệnh viện
                        </Title>
                        <div className="avatar-wrapper">
                            <Image
                                src="/images/lgin.jpg" // Added leading slash for consistent path
                                alt="Background"
                                preview={false}
                                className="login-bg"
                            />
                            <Image
                                src="https://dussmannfood.superweb.xyz/assets/auth-v2-login-illustration-light-C4sKfRS1.png"
                                alt="Avatar"
                                preview={false}
                                className="login-avatar"
                            />
                        </div>
                    </Col>

                    <Col xs={24} md={7} className="login-right">
                        <div className="login-welcome">
                            <Image
                                src="/images/lg.png" // Added leading slash for consistent path
                                alt="Dussmann Logo"
                                preview={false}
                                className="login-logo"
                                width={100}
                            />
                            <Title level={3}>Welcome to Hệ thống đặt suất ăn bệnh viện!</Title>
                        </div>

                        <AuthForm
                            submitText="Đăng Nhập"
                            showTestAccounts={false}
                            customFields={[]}
                            loginType="internal"
                        />
                        {/* <Text style={{ display: 'block', textAlign: 'center', marginTop: 16 }}>
                            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
                        </Text> */}
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default Login;