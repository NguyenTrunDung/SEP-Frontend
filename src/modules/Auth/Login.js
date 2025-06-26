import React from 'react';
import { Row, Col, Card, Typography, Image, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../../components/common/AuthForm';
import './Login.css';

const { Title } = Typography;

const Login = () => {
    const navigate = useNavigate();

    const handleClose = () => {
        navigate('/'); // hoặc navigate(-1);
    };

    return (
        <div className="login-layout">
            {/* Nút Close ở góc phải trên cùng */}
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
                                src="images/mo.jpg"
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
                                src="images/lg.png"
                                alt="Dussmann Logo"
                                preview={false}
                                className="login-logo"
                                width={100}
                            />
                            <Title level={3}>Welcome to Hệ thống đặt suất ăn bệnh viện!</Title>
                        </div>

                        <AuthForm
                            passwordLabel="Mật khẩu"
                            submitText="Đăng Nhập"
                            showTestAccounts={false}
                            errorMessage="This field is required"
                            fields={[
                                { name: 'username', placeholder: 'Tên đăng nhập', required: true },
                                { name: 'password', placeholder: 'Mật khẩu', type: 'password', required: true },
                            ]}
                        />
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default Login;
