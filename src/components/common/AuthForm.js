import React from 'react';
import { Form, Input, Button, Card, Typography, Divider, Space, Tag, Checkbox } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TEST_ACCOUNTS } from '../../constants/roles';
import PropTypes from 'prop-types';
import './AuthForm.css';

const { Title, Text } = Typography;

const AuthForm = ({
    submitText = 'Đăng Nhập',
    showTestAccounts = true,
    customFields = [],
    onSuccess,
    redirectPath = '/redirect',
    customStyle = {},
    loginType = 'internal' // Thêm prop loginType
}) => {
    const [form] = Form.useForm();
    const { login, loading, error } = useAuth() || {};
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || redirectPath;

    const handleSubmit = async (values) => {
        try {
            if (!login) {
                console.error('Login function is not available');
                return;
            }

            // Gọi login với loginType
            await login(values, loginType);

            if (onSuccess) {
                onSuccess(values);
            }

            // Navigate to appropriate page instead of using /redirect
            if (from && from !== '/redirect') {
                // If we have a specific 'from' location, go there
                navigate(from, { replace: true });
            } else {
                // Otherwise, navigate to /redirect for role-based routing
                navigate('/redirect', { replace: true });
            }
        } catch (err) {
            console.error('Login error:', err);
            // Không cần xử lý error ở đây vì AuthContext đã xử lý
        }
    };

    const handleTestAccountClick = (account) => {
        if (form && account) {
            form.setFieldsValue({
                email: account.email,
                password: account.password,
                remember: false
            });
        }
    };

    // Khởi tạo giá trị ban đầu cho form từ localStorage
    React.useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        const rememberedPassword = localStorage.getItem('rememberedPassword');
        if (rememberedEmail && rememberedPassword) {
            form.setFieldsValue({
                email: rememberedEmail,
                password: rememberedPassword,
                remember: true
            });
        }
    }, [form]);

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
            rules: [
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                { pattern: /^[A-Z].*$/, message: 'Mật khẩu phải bắt đầu bằng chữ in hoa!' },
                { pattern: /[0-9]/, message: 'Mật khẩu phải chứa ít nhất 1 số!' },
                { pattern: /[!@#$%^&*(),.?":{}|<>]/, message: 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt!' }
            ],
            component: <Input.Password size="large" placeholder="Mật khẩu" />
        },
        {
            name: 'remember',
            valuePropName: 'checked',
            //component: <Checkbox>Ghi nhớ</Checkbox>
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
                            valuePropName={field.valuePropName}
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
                            style={{
                                borderRadius: '6px',
                                ...(customStyle.submitButton || { backgroundColor: '#17a2b8', borderColor: '#17a2b8' })
                            }}
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

                        <div style={{ textAlign: 'center' }}>
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

// Component riêng cho public login
export const AuthFormPublic = ({
    submitText = 'Đăng Nhập',
    showTestAccounts = false,
    customFields = [],
    onSuccess,
    redirectPath = '/',
    customStyle = {}
}) => {
    const [form] = Form.useForm();
    const { login, loading, error } = useAuth() || {};

    const handleSubmit = async (values) => {
        try {
            if (!login) {
                console.error('Login function is not available');
                return;
            }

            // Gọi login với loginType public
            await login(values, 'public');

            // Gọi callback onSuccess để parent component xử lý redirect
            if (onSuccess) {
                onSuccess(values);
            }
            // Không tự động navigate ở đây, để parent component xử lý
        } catch (err) {
            console.error('Login error:', err);
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
            rules: [
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Vui lòng nhập mật khẩu hợp lệ!' },
            ],
            component: <Input.Password size="large" placeholder="Mật khẩu" />
        }
    ];

    const allFields = [...defaultFields, ...customFields];

    return (
        <div className="auth-form-container">
            <Form
                form={form}
                name="auth-form-public"
                onFinish={handleSubmit}
                layout="vertical"
                requiredMark={false}
                //onFinishFailed={onFinishFailed}
                autoComplete="off"
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
                        valuePropName={field.valuePropName}
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
                        style={{
                            borderRadius: '6px',
                            ...(customStyle.submitButton || { backgroundColor: '#b4c80f', borderColor: '#b4c80f' })
                        }}
                    >
                        {submitText}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

AuthForm.propTypes = {
    submitText: PropTypes.string,
    showTestAccounts: PropTypes.bool,
    customFields: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            label: PropTypes.string,
            rules: PropTypes.array,
            component: PropTypes.node.isRequired,
            valuePropName: PropTypes.string
        })
    ),
    onSuccess: PropTypes.func,
    redirectPath: PropTypes.string,
    customStyle: PropTypes.object,
    loginType: PropTypes.oneOf(['internal', 'public'])
};

AuthFormPublic.propTypes = {
    submitText: PropTypes.string,
    showTestAccounts: PropTypes.bool,
    customFields: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            label: PropTypes.string,
            rules: PropTypes.array,
            component: PropTypes.node.isRequired,
            valuePropName: PropTypes.string
        })
    ),
    onSuccess: PropTypes.func,
    redirectPath: PropTypes.string,
    customStyle: PropTypes.object
};

export default AuthForm;