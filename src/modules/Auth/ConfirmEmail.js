// src/modules/Auth/ConfirmEmail.js
import React, { useState } from 'react';
import { Row, Col, Card, Typography, Layout, Form, Input, Button, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './ConfirmEmail.css'; // Create this CSS file for styling

const { Title, Text } = Typography;
const { Content } = Layout;

const ConfirmEmail = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await authService.confirmEmail({
                email: values.email,
                token: values.token,
            });
            setSuccess('Email confirmed successfully! You can now sign in.');
            form.resetFields();
            setTimeout(() => navigate('/login'), 3000); // Redirect to login after 3 seconds
        } catch (err) {
            setError(err.message || 'Email confirmation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout className="confirm-email-layout">
            <Content>
                <Row className="confirm-email-row" justify="center" align="middle">
                    <Col xs={22} sm={18} md={12} lg={10} xl={8}>
                        <Card
                            className="confirm-email-card"
                            bordered={false}
                            cover={
                                <div className="confirm-email-header">
                                    <Title level={2} className="confirm-email-title">
                                        Confirm Your Email
                                    </Title>
                                    <p className="confirm-email-subtitle">
                                        Enter your email and confirmation token to activate your account
                                    </p>
                                </div>
                            }
                        >
                            {success && (
                                <Alert
                                    message={success}
                                    type="success"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                />
                            )}
                            {error && (
                                <Alert
                                    message={error}
                                    type="error"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                />
                            )}
                            <Form
                                form={form}
                                name="confirm-email-form"
                                onFinish={handleSubmit}
                                layout="vertical"
                                requiredMark={false}
                                size="large"
                            >
                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        { required: true, message: 'Please input your email!' },
                                        { type: 'email', message: 'Please enter a valid email!' },
                                    ]}
                                    style={{ marginBottom: 16 }}
                                >
                                    <Input size="large" placeholder="Enter your email" />
                                </Form.Item>
                                <Form.Item
                                    name="token"
                                    label="Confirmation Token"
                                    rules={[{ required: true, message: 'Please input your confirmation token!' }]}
                                    style={{ marginBottom: 16 }}
                                >
                                    <Input size="large" placeholder="Enter your confirmation token" />
                                </Form.Item>
                                <Form.Item style={{ marginBottom: 16 }}>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        size="large"
                                        block
                                        style={{ borderRadius: '6px' }}
                                    >
                                        Confirm Email
                                    </Button>
                                </Form.Item>
                                <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
                                    <Text>
                                        Back to <a onClick={() => navigate('/register')}>Register</a> or{' '}
                                        <a onClick={() => navigate('/login')}>Sign In</a>
                                    </Text>
                                </Form.Item>
                            </Form>
                        </Card>
                        <div className="confirm-email-footer">
                            <p>© {new Date().getFullYear()} Hospital Canteen Management System</p>
                        </div>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default ConfirmEmail;