import React from 'react';
import { Modal, Form, InputNumber, Input, Button } from 'antd';

const DepositModal = ({ visible, onClose, onSubmit, user }) => {
    const [form] = Form.useForm();

    const handleFinish = (values) => {
        onSubmit(values);
        form.resetFields();
    };

    // Chặn nhập chữ vào ô số tiền
    const handleKeyPress = (e) => {
        // Chỉ cho phép số và phím điều hướng
        if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    };
    const handlePaste = (e) => {
        const paste = (e.clipboardData || window.clipboardData).getData('text');
        if (!/^\d+$/.test(paste)) {
            e.preventDefault();
        }
    };

    return (
        <Modal open={visible} onCancel={onClose} footer={null} title="Nạp tiền vào ví">
            <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ amount: 0, note: '' }}>
                <Form.Item label="Số tiền" name="amount" rules={[{ required: true, message: 'Nhập số tiền!' }]}>
                    <InputNumber
                        min={1000}
                        step={1000}
                        style={{ width: '100%' }}
                        stringMode={false}
                        onKeyPress={handleKeyPress}
                        onPaste={handlePaste}
                    />
                </Form.Item>
                <Form.Item label="Mô tả" name="note">
                    <Input.TextArea rows={2} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block>Nạp tiền</Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DepositModal; 