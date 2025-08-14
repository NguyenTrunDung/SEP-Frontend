import React, { useEffect } from 'react';
import { Form, Input, Select, Button, Space } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';

const UserAccountModal = ({ visible, onCancel, onOk, initialValues = {}, isEdit = false, groupOptions = [] }) => {
    const { form, handleSubmit, resetForm } = useAntForm();

    useEffect(() => {
        if (visible) {
            form.setFieldsValue(initialValues);
            window.__userAccountModalForm__ = form;
        } else {
            resetForm();
            if (window.__userAccountModalForm__ === form) {
                window.__userAccountModalForm__ = undefined;
            }
        }
    }, [visible, initialValues, form, resetForm]);

    const handleFormSubmit = async (values) => {
        try {
            await handleSubmit(async () => {
                if (onOk) {
                    await onOk(values);
                }
            });
        } catch (error) {
            console.error('❌ Failed to submit form:', error.response?.data?.message || error.message);
            form.setFields([
                {
                    name: 'email',
                    errors: [error.response?.data?.message || 'Lỗi khi xử lý dữ liệu!'],
                },
            ]);
        }
    };

    return (
        <ReusableModal
            title={<span style={{ fontSize: '30px' }}>{isEdit ? 'Chỉnh sửa' : 'Thêm'}</span>}
            open={visible}
            onCancel={onCancel}
            footer={null}
            destroyOnClose
            closable={false}
        >
            <div style={{ position: 'absolute', top: 16, right: 24, zIndex: 1 }}>
                <Space>
                    <Button
                        type="primary"
                        onClick={() => form.submit()}
                        style={{
                            backgroundColor: '#52c41a',
                            border: 'none',
                            minWidth: 64,
                            height: 32,
                            fontSize: 14,
                        }}
                    >
                        Lưu
                    </Button>
                    <Button
                        onClick={onCancel}
                        style={{
                            backgroundColor: '#ff4d4f',
                            color: '#fff',
                            border: 'none',
                            minWidth: 64,
                            height: 32,
                            fontSize: 14,
                        }}
                    >
                        X
                    </Button>
                </Space>
            </div>

            <ReusableForm form={form} onFinish={handleFormSubmit} layout="vertical">
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <Form.Item
                        // label="Họ"
                        name="firstName"
                        style={{ flex: 1 }}
                        rules={[
                            { required: true, message: 'Nhập họ!' },
                            { whitespace: true, message: 'Họ không được chỉ chứa khoảng trắng!' },
                        ]}
                        className="floating-form-item"
                    >
                        <Input className="floating-input" placeholder="Nhập họ" />
                    </Form.Item>
                    <Form.Item
                        // label="Tên"
                        name="lastName"
                        style={{ flex: 1 }}
                        rules={[
                            { required: true, message: 'Nhập tên!' },
                            { whitespace: true, message: 'Tên không được chỉ chứa khoảng trắng!' },
                        ]}
                        className="floating-form-item"
                    >
                        <Input className="floating-input" placeholder="Nhập tên" />
                    </Form.Item>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <Form.Item
                        // label="Tài khoản"
                        name="username"
                        style={{ flex: 1 }}
                        rules={[
                            { required: true, message: 'Nhập tài khoản!' },
                            { whitespace: true, message: 'Tài khoản không được chỉ chứa khoảng trắng!' },
                        ]}
                        className="floating-form-item"
                    >
                        <Input className="floating-input" placeholder="Nhập tài khoản người dùng" />
                    </Form.Item>
                    {!isEdit && (
                        <Form.Item
                            // label="Mật khẩu"
                            name="password"
                            style={{ flex: 1 }}
                            rules={[
                                { required: true, message: 'Nhập mật khẩu!' },
                                {
                                    pattern: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/,
                                    message: 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt (VD: Example@123123)!',
                                },
                            ]}
                            className="floating-form-item"
                        >
                            <Input.Password className="floating-input" placeholder="Nhập mật khẩu người dùng" />
                        </Form.Item>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <Form.Item
                        // label="Nhóm người dùng"
                        name="groupId"
                        style={{ flex: 1 }}
                        rules={[{ required: true, message: 'Chọn nhóm người dùng!' }]}
                        className="floating-form-item"
                    >
                        <Select className="floating-input" placeholder="Chọn nhóm người dùng" options={groupOptions} />
                    </Form.Item>
                    <Form.Item
                        // label="Email"
                        name="email"
                        style={{ flex: 1 }}
                        rules={[
                            { required: true, message: 'Nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' },
                        ]}
                        className="floating-form-item"
                    >
                        <Input className="floating-input" placeholder="Nhập Email" />
                    </Form.Item>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <Form.Item
                        // label="Số điện thoại"
                        name="phone"
                        style={{ flex: 1 }}
                        rules={[
                            { required: true, message: 'Nhập số điện thoại!' },
                            {
                                pattern: /^0[0-9]{9}$/,
                                message: 'Số điện thoại phải là 10 số, bắt đầu bằng 0!',
                            },
                        ]}
                        className="floating-form-item"
                    >
                        <Input className="floating-input" placeholder="Nhập số điện thoại" />
                    </Form.Item>
                </div>
            </ReusableForm>
        </ReusableModal>
    );
};

export default UserAccountModal;