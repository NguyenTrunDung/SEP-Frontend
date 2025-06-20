// src/modules/Auth/Register.js
import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Register.css'; // Create this CSS file for styling

const { Title, Text } = Typography;

const Register = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);

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

            message.success('Registration successful! Please check your email to confirm your account.');
            navigate('/login');
        } catch (error) {
            const errorMessage = error.response?.data?.errors?.[0]?.description || 
                               error.response?.data?.message || 
                               'Registration failed. Please try again.';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formFields = [
        {
            name: 'firstName',
            label: 'First Name',
            rules: [
                { required: true, message: 'Please input your first name!' },
                { min: 2, message: 'First name must be at least 2 characters!' }
            ],
            component: <Input size="large" placeholder="Enter your first name" />
        },
        {
            name: 'lastName',
            label: 'Last Name',
            rules: [
                { required: true, message: 'Please input your last name!' },
                { min: 2, message: 'Last name must be at least 2 characters!' }
            ],
            component: <Input size="large" placeholder="Enter your last name" />
        },
        {
            name: 'email',
            label: 'Email',
            rules: [
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
            ],
            component: <Input size="large" placeholder="Enter your email" />
        },
        {
            name: 'password',
            label: 'Password',
            rules: [
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' },
                { pattern: /^(?=.*[A-Z])(?=.*\d).+$/, 
                  message: 'Password must contain at least one uppercase letter and one number!' }
            ],
            component: <Input.Password size="large" placeholder="Enter your password" />
        },
        {
            name: 'confirmPassword',
            label: 'Confirm Password',
            dependencies: ['password'],
            rules: [
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                    validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                        }
                        return Promise.reject(new Error('The two passwords do not match!'));
                    }
                })
            ],
            component: <Input.Password size="large" placeholder="Confirm your password" />
        },
        {
            name: 'address',
            label: 'Address',
            rules: [
                { required: true, message: 'Please input your address!' },
                { min: 5, message: 'Address must be at least 5 characters!' }
            ],
            component: <Input size="large" placeholder="Enter your address" />
        }
    ];

    return (
        <div className="register-container">
            <Card className="register-card">
                <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
                    Register
                </Title>
                
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
                            style={{ borderRadius: '6px' }}
                        >
                            Register
                        </Button>
                    </Form.Item>

                    <Text style={{ display: 'block', textAlign: 'center' }}>
                        Already have an account? <Link to="/login">Sign in</Link>
                    </Text>
                </Form>
            </Card>
        </div>
    );
};

export default Register;