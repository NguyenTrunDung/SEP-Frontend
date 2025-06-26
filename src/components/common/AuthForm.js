import React from 'react';
import { Form, Input, Button, Card, Typography, Divider, Space, Tag } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TEST_ACCOUNTS } from '../../constants/roles';
import PropTypes from 'prop-types';
import './AuthForm.css'; // Đảm bảo import CSS

const { Title, Text } = Typography;

const AuthForm = ({
    submitText = 'Đăng Nhập',
    showTestAccounts = true,
    customFields = [],
    onSuccess,
    redirectPath = '/redirect'
}) => {
    const [form] = Form.useForm();
    const { login, loading, error } = useAuth() || {}; // Fallback để tránh lỗi nếu useAuth không tồn tại
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || redirectPath;

    const handleSubmit = async (values) => {
        try {
            if (!login) {
                console.error('Login function is not available');
                return;
            }
            await login(values);
            if (onSuccess) {
                onSuccess(values);
            }
            navigate(from, { replace: true });
        } catch (err) {
            console.error('Login error:', err);
        }
    };

    const handleTestAccountClick = (account) => {
        if (form && account) {
            form.setFieldsValue({
                email: account.email,
                password: account.password
            });
        }
    };

    const defaultFields = [
        {
            name: 'email',
            label: 'Email',
            rules: [
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Vui lòng nhập email hợp lệ!' }
            ],
            component: <Input size="large" placeholder="Email" />
        },
        {
            name: 'password',
            label: 'Mật khẩu',
            rules: [{ required: true, message: 'Vui lòng nhập mật khẩu!' }],
            component: <Input.Password size="large" placeholder="Mật khẩu" />
        }
    ];

    const allFields = [...defaultFields, ...customFields];

    return (
        <div className="auth-form-container">
            <Card className="auth-form-card" variant={false}>
                <Form
                    form={form}
                    name="auth-form"
                    onFinish={handleSubmit}
                    layout="vertical"
                    requiredMark={false}
                    size="large"
                >
                    {error && (
                        <div
                            style={{
                                padding: '12px 16px',
                                marginBottom: '16px',
                                backgroundColor: '#fff2f0',
                                border: '1px solid #ffccc7',
                                borderRadius: '6px',
                                color: '#ff4d4f'
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {allFields.map((field, index) => (
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
                            {submitText}
                        </Button>
                    </Form.Item>
                </Form>

                {showTestAccounts && TEST_ACCOUNTS && (
                    <>
                        <Divider>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                Development Test Accounts
                            </Text>
                        </Divider>

                        <div style={{ textAlign: 'center' }}> {/* Sửa text-align thành camelCase */}
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                <Text type="secondary" style={{ fontSize: '12px', marginBottom: 8 }}>
                                    Click any account below to auto-fill credentials:
                                </Text>

                                <Space wrap size="small" style={{ justifyContent: 'center' }}>
                                    {Object.values(TEST_ACCOUNTS).map((account, index) => (
                                        <Tag
                                            key={index}
                                            color={account.email === 'admin@homms.com' ? 'red' : 'blue'}
                                            style={{
                                                cursor: 'pointer',
                                                fontSize: '11px',
                                                padding: '2px 8px',
                                                border: 'none',
                                                borderRadius: '4px'
                                            }}
                                            onClick={() => handleTestAccountClick(account)}
                                            title={`${account.role} - ${account.description}`}
                                        >
                                            {account.role}
                                        </Tag>
                                    ))}
                                </Space>

                                <div style={{ marginTop: 12 }}>
                                    <Text type="secondary" style={{ fontSize: '11px' }}>
                                        <strong>Password Pattern:</strong> RoleName@123 (e.g., Manager@123)
                                        <br />
                                        <strong>Admin Exception:</strong> Admin@123456
                                    </Text>
                                </div>
                            </Space>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};

AuthForm.propTypes = {
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