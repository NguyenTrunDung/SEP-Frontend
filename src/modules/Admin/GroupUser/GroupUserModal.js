import React from 'react';
import { Modal, Form, Input, Button, Tree } from 'antd';

const GroupUserModal = ({
    visible,
    onCancel,
    onOk,
    initialValues = {},
    checkedKeys = [],
    onCheckedKeysChange,
    menuTree = [],
    isEdit = false,
}) => {
    const [form] = Form.useForm();

    React.useEffect(() => {
        if (visible) {
            form.setFieldsValue({ name: initialValues.name || '' });
        } else {
            form.resetFields();
        }
    }, [visible, form]);

    // Sử dụng onFinish để submit form giống các modal khác
    const handleFinish = (values) => {
        onOk({ ...values, permissions: checkedKeys });
    };

    return (
        <Modal
            open={visible}
            onCancel={onCancel}
            // Không dùng onOk, dùng submit button của form
            footer={null}
            title={isEdit ? 'Sửa nhóm người dùng' : 'Thêm nhóm người dùng'}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item label="Tên nhóm người dùng" name="name" rules={[{ required: true, message: 'Nhập tên nhóm!' }]}>
                    <Input />
                </Form.Item>
                <Tree
                    checkable
                    defaultExpandAll
                    treeData={menuTree}
                    checkedKeys={checkedKeys}
                    onCheck={onCheckedKeysChange}
                    style={{ background: '#f9f9f9', padding: 12, borderRadius: 8, height: 300, overflowY: 'auto' }}
                />
                <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
                    <Button type="primary" htmlType="submit">
                        {isEdit ? 'Lưu' : 'Tạo nhóm'}
                    </Button>
                    <Button style={{ marginLeft: 8 }} onClick={onCancel}>
                        Hủy
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default GroupUserModal; 