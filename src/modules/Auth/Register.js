// src/modules/Auth/Register.js
import React from 'react';
import { Row, Col, Card, Typography, Image, Button, Form, Input, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Login.css'; // dùng lại CSS của login

const { Title, Text } = Typography;

const Register = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);

    const handleClose = () => {
        navigate('/');
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await authService.register({
                email: values.email,
                password: values.password,
                firstName: values.firstName,
                lastName: values.lastName,
                address: values.address
            });

            message.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
            navigate('/login');
        } catch (error) {
            const errorMessage = error.response?.data?.errors?.[0]?.description ||
                error.response?.data?.message ||
                'Đăng ký thất bại. Vui lòng thử lại.';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formFields = [
        {
            name: 'firstName',
            label: 'Họ',
            rules: [
                { required: true, message: 'Vui lòng nhập họ của bạn!' },
                { min: 2, message: 'Họ phải có ít nhất 2 ký tự!' }
            ],
            component: <Input size="large" placeholder="Nhập họ của bạn" />
        },
        {
            name: 'lastName',
            label: 'Tên',
            rules: [
                { required: true, message: 'Vui lòng nhập tên của bạn!' },
                { min: 2, message: 'Tên phải có ít nhất 2 ký tự!' }
            ],
            component: <Input size="large" placeholder="Nhập tên của bạn" />
        },
        {
            name: 'email',
            label: 'Email',
            rules: [
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
            ],
            component: <Input size="large" placeholder="Nhập email của bạn" />
        },
        {
            name: 'password',
            label: 'Mật khẩu',
            rules: [
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                {
                    pattern: /^(?=.*[A-Z])(?=.*\d).+$/,
                    message: 'Mật khẩu phải chứa ít nhất một chữ in hoa và một số!'
                }
            ],
            component: <Input.Password size="large" placeholder="Nhập mật khẩu" />
        },
        {
            name: 'confirmPassword',
            label: 'Xác nhận mật khẩu',
            dependencies: ['password'],
            rules: [
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                    validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    }
                })
            ],
            component: <Input.Password size="large" placeholder="Nhập lại mật khẩu" />
        },
        {
            name: 'address',
            label: 'Địa chỉ',
            rules: [
                { required: true, message: 'Vui lòng nhập địa chỉ!' },
                { min: 5, message: 'Địa chỉ phải có ít nhất 5 ký tự!' }
            ],
            component: <Input size="large" placeholder="Nhập địa chỉ của bạn" />
        }
    ];

    return (
        <div className="login-layout">
            {/* Nút close ở góc phải */}
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
                                src="https://dussmannfood.superweb.xyz/assets/auth-v2-register-illustration-light-BRfYNCm0.png"
                                alt="Avatar"
                                preview={false}
                                className="login-avatar"
                            />
                        </div>
                    </Col>

                    <Col xs={24} md={7} className="login-right">
                        <div className="login-welcome">
                            <Title level={3}>Đăng ký tài khoản mới</Title>
                        </div>

                        <Form
                            form={form}
                            name="register-form"
                            onFinish={handleSubmit}
                            layout="vertical"
                            requiredMark={false}
                            size="large"
                        >
                            {formFields.map((field, index) => (
                                <Form.Item
                                    key={index}
                                    name={field.name}
                                    label={field.label}
                                    rules={field.rules}
                                    style={{ marginBottom: 16 }}
                                >
                                    {field.component}
                                </Form.Item>
                            ))}

                            <Form.Item style={{ marginBottom: 16 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    size="large"
                                    block
                                    style={{ borderRadius: '6px', backgroundColor: '#17a2b8', borderColor: '#17a2b8' }}
                                >
                                    Đăng ký
                                </Button>
                            </Form.Item>

                            <Text style={{ display: 'block', textAlign: 'center', marginTop: 16 }}>
                                Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                            </Text>
                        </Form>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default Register;
