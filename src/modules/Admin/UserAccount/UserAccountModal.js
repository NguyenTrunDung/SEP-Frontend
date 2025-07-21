import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button } from 'antd';
import dayjs from 'dayjs';

const UserAccountModal = ({
    visible,
    onCancel,
    onOk,
    initialValues = {},
    isEdit = false,
    groupOptions = [],
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                ...initialValues,
                dob: initialValues.dob ? dayjs(initialValues.dob) : null,
            });
            window.__userAccountModalForm__ = form;
        } else {
            form.resetFields();
            if (window.__userAccountModalForm__ === form) {
                window.__userAccountModalForm__ = undefined;
            }
        }
    }, [visible, initialValues, form]);

    // Sử dụng onFinish để submit form giống các modal khác
    const handleFinish = (values) => {
        if (values.dob) {
            values.dob = values.dob.format('YYYY-MM-DD');
        }
        onOk(values);
    };

    return (
        <Modal
            open={visible}
            onCancel={onCancel}
            footer={null}
            title={isEdit ? 'Sửa tài khoản' : 'Thêm tài khoản'}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <Form.Item label="Họ" name="firstName" style={{ flex: 1 }} rules={[{ required: true, message: 'Nhập họ!' }]}>
                        <Input placeholder="Nhập họ" />
                    </Form.Item>
                    <Form.Item label="Tên" name="lastName" style={{ flex: 1 }} rules={[{ required: true, message: 'Nhập tên!' }]}>
                        <Input placeholder="Nhập tên" />
                    </Form.Item>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <Form.Item label="Tài khoản" name="username" style={{ flex: 1 }} rules={[{ required: true, message: 'Nhập tài khoản!' }]}>
                        <Input placeholder="Nhập tài khoản người dùng" />
                    </Form.Item>
                    {!isEdit && (
                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            style={{ flex: 1 }}
                            rules={[
                                { required: true, message: 'Nhập mật khẩu!' },
                                {
                                    pattern: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/,
                                    message: 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt (VD: Example@123123)!'
                                }
                            ]}
                        >
                            <Input.Password placeholder="Nhập mật khẩu người dùng" />
                        </Form.Item>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <Form.Item label="Nhóm người dùng" name="groupId" style={{ flex: 1 }} rules={[{ required: true, message: 'Chọn nhóm người dùng!' }]}>
                        <Select placeholder="Chọn nhóm người dùng" options={groupOptions} />
                    </Form.Item>
                    <Form.Item label="Email" name="email" style={{ flex: 1 }} rules={[{ required: true, message: 'Nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
                        <Input placeholder="Nhập Email" />
                    </Form.Item>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <Form.Item label="Số điện thoại" name="phone" style={{ flex: 1 }} rules={[
                        { required: true, message: 'Nhập số điện thoại!' },
                        {
                            pattern: /^0[0-9]{9}$/,
                            message: 'Số điện thoại phải là 10 số, bắt đầu bằng 0!'
                        }
                    ]}>
                        <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>
                </div>
                <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
                    <Button type="primary" htmlType="submit">{isEdit ? 'Lưu' : 'Tạo tài khoản'}</Button>
                    <Button style={{ marginLeft: 8 }} onClick={onCancel}>Hủy</Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UserAccountModal; 