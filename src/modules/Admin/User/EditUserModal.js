import React from 'react';
import { Modal, Form, Input, Button } from 'antd';

const EditUserModal = ({ visible, onClose, onSubmit, user }) => {
    const [form] = Form.useForm();

    React.useEffect(() => {
        if (visible && user) {
            form.setFieldsValue({
                name: user.name,
                phone: user.phone,
                email: user.email,
            });
        }
    }, [visible, user, form]);

    const handleFinish = (values) => {
        onSubmit(values);
        form.resetFields();
    };

    return (
        <Modal open={visible} onCancel={onClose} footer={null} title="Chỉnh sửa thông tin nhân viên">
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item label="Tên nhân viên" name="name" rules={[{ required: true, message: 'Nhập tên!' }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Nhập số điện thoại!' }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}>
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block>Lưu</Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditUserModal; 