import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
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
        } else {
            form.resetFields();
        }
    }, [visible, initialValues, form]);

    const handleOk = () => {
        form.validateFields().then(values => {
            if (values.dob) {
                values.dob = values.dob.format('YYYY-MM-DD');
            }
            onOk(values);
        });
    };

    return (
        <Modal
            open={visible}
            onCancel={onCancel}
            onOk={handleOk}
            title={isEdit ? 'Sửa tài khoản' : 'Thêm tài khoản'}
            okText="Lưu"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <Form.Item label="Tên người dùng" name="name" style={{ flex: 1 }} rules={[{ required: true, message: 'Nhập tên người dùng!' }]}>
                        <Input placeholder="Nhập tên người dùng" />
                    </Form.Item>
                    <Form.Item label="Tài khoản" name="username" style={{ flex: 1 }} rules={[{ required: true, message: 'Nhập tài khoản!' }]}>
                        <Input placeholder="Nhập tài khoản người dùng" />
                    </Form.Item>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <Form.Item label="Mật khẩu" name="password" style={{ flex: 1 }} rules={[{ required: !isEdit, message: 'Nhập mật khẩu!' }]}>
                        <Input.Password placeholder="Nhập mật khẩu người dùng" />
                    </Form.Item>
                    <Form.Item label="Nhóm người dùng" name="groupId" style={{ flex: 1 }} rules={[{ required: true, message: 'Chọn nhóm người dùng!' }]}>
                        <Select placeholder="Chọn nhóm người dùng" options={groupOptions} />
                    </Form.Item>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <Form.Item label="Ngày sinh" name="dob" style={{ flex: 1 }}>
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder="Nhập ngày sinh" />
                    </Form.Item>
                    <Form.Item label="Email" name="email" style={{ flex: 1 }} rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}>
                        <Input placeholder="Nhập Email" />
                    </Form.Item>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <Form.Item label="Số điện thoại" name="phone" style={{ flex: 1 }}>
                        <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>
                    <Form.Item label="Địa chỉ" name="address" style={{ flex: 1 }}>
                        <Input placeholder="Nhập địa chỉ hiện tại" />
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
};

export default UserAccountModal; 