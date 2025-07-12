import React from 'react';
import { Modal, Form, Input, Tree } from 'antd';

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
    }, [visible, initialValues, form]);

    const handleOk = () => {
        form.validateFields().then(values => {
            onOk({ ...values, permissions: checkedKeys });
        });
    };

    return (
        <Modal
            open={visible}
            onCancel={onCancel}
            onOk={handleOk}
            title={isEdit ? 'Sửa nhóm người dùng' : 'Thêm nhóm người dùng'}
            okText="Lưu"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Tên nhóm người dùng" name="name" rules={[{ required: true, message: 'Nhập tên nhóm!' }]}>
                    <Input />
                </Form.Item>
                <Tree
                    checkable
                    defaultExpandAll
                    treeData={menuTree}
                    checkedKeys={checkedKeys}
                    onCheck={onCheckedKeysChange}
                    style={{ background: '#f9f9f9', padding: 12, borderRadius: 8 }}
                />
            </Form>
        </Modal>
    );
};

export default GroupUserModal; 