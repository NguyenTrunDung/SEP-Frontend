import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Row, Col } from 'antd';

const initialFormValues = {
    userName: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
};

const UserModal = ({ visible, onClose, onSubmit, user, mode }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (mode === 'edit' && user) {
                form.setFieldsValue({ ...initialFormValues, ...user });
            } else if (mode === 'create') {
                form.setFieldsValue(initialFormValues);
            }
        } else {
            form.resetFields();
        }
    }, [visible, user, mode, form]);

    // Xử lý submit giống CreateFood: chỉ gọi khi form hợp lệ
    const handleFinish = (values) => {
        const createdBy = localStorage.getItem('rememberedEmail') || '';
        onSubmit({ ...values, createdBy });
    };

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            title={mode === 'edit' ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}
        >
            <Form form={form} layout="vertical" initialValues={initialFormValues} onFinish={handleFinish}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Tên đăng nhập" name="userName" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Số điện thoại" name="phoneNumber" rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại!' },
                            {
                                pattern: /^0[0-9]{9}$/,
                                message: 'Số điện thoại phải là 10 số, bắt đầu bằng 0!'
                            }
                        ]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={mode === 'create' ? [
                                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                {
                                    pattern: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/,
                                    message: 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt (VD: Example@123123)!'
                                }
                            ] : []}
                        >
                            <Input.Password disabled={mode === 'edit'} placeholder={mode === 'edit' ? 'Không thể đổi mật khẩu ở đây' : ''} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Họ" name="firstName" rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Tên" name="lastName" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        {mode === 'edit' ? 'Lưu thay đổi' : 'Lưu'}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UserModal; 