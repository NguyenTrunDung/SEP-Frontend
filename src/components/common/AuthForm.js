import React from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PropTypes from 'prop-types';

const { Title } = Typography;

const AuthForm = ({
    title = 'Login',
    submitText = 'Login',
    showTestAccounts = true,
    customFields = [],
    onSuccess,
    redirectPath = '/redirect'
}) => {
    const [form] = Form.useForm();
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || redirectPath;

    const handleSubmit = async (values) => {
        try {
            await login(values);
            if (onSuccess) {
                onSuccess(values);
            }
            navigate(from, { replace: true });
        } catch (err) {
            // Error is handled by the auth context
        }
    };

    const defaultFields = [
        {
            name: 'email',
            label: 'Email',
            rules: [
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
            ],
            component: <Input />
        },
        {
            name: 'password',
            label: 'Password',
            rules: [{ required: true, message: 'Please input your password!' }],
            component: <Input.Password />
        }
    ];

    const allFields = [...defaultFields, ...customFields];

    return (
        <div className="auth-form-container">
            <Card className="auth-form-card">
                <Title level={2}>{title}</Title>
                <Form
                    form={form}
                    name="auth-form"
                    onFinish={handleSubmit}
                    layout="vertical"
                    requiredMark={false}
                >
                    {error && <div className="error-message">{error}</div>}

                    {allFields.map((field, index) => (
                        <Form.Item
                            key={index}
                            name={field.name}
                            label={field.label}
                            rules={field.rules}
                        >
                            {field.component}
                        </Form.Item>
                    ))}

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                        >
                            {submitText}
                        </Button>
                    </Form.Item>
                </Form>

                {showTestAccounts && (
                    <div className="login-help">
                        <p>Test Accounts:</p>
                        <ul>
                            <li>Admin: admin@hospital.com / admin123</li>
                            <li>Doctor: doctor@hospital.com / doctor123</li>
                            <li>Patient: patient@hospital.com / patient123</li>
                            <li>Staff: staff@hospital.com / staff123</li>
                        </ul>
                    </div>
                )}
            </Card>
        </div>
    );
};

AuthForm.propTypes = {
    title: PropTypes.string,
    submitText: PropTypes.string,
    showTestAccounts: PropTypes.bool,
    customFields: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            rules: PropTypes.array,
            component: PropTypes.node.isRequired
        })
    ),
    onSuccess: PropTypes.func,
    redirectPath: PropTypes.string
};

export default AuthForm; 