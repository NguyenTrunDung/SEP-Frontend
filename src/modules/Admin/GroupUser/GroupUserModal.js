import React from 'react';
import { Form, Input, Button, Space, Tree } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import '../Branch/Branch.css'; // Sử dụng cùng CSS với EditBranch

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
    const { form, handleSubmit, resetForm } = useAntForm();

    React.useEffect(() => {
        if (visible) {
            form.setFieldsValue({ name: initialValues.name || '' });
        } else {
            resetForm();
        }
    }, [visible, initialValues, form, resetForm]);

    const handleFormSubmit = async (values) => {
        try {
            await handleSubmit(async () => {
                onOk({ ...values, permissions: checkedKeys });
            });
        } catch (error) {
            console.error('❌ Lỗi khi xử lý nhóm người dùng:', error);
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
                        {isEdit ? 'Lưu' : 'Lưu'}
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
                <div className="custom-floating">
                    <label className="floating-label">Tên nhóm người dùng</label>
                    <Form.Item
                        name="name"
                        rules={[{ required: true, message: 'Nhập tên nhóm!' }]}
                        style={{ marginBottom: 0 }}
                    >
                        <Input className="input-label" placeholder="Tên nhóm người dùng" />
                    </Form.Item>
                </div>

                <Tree
                    checkable
                    defaultExpandAll
                    treeData={menuTree}
                    checkedKeys={checkedKeys}
                    onCheck={onCheckedKeysChange}
                    style={{ background: '#f9f9f9', padding: 12, borderRadius: 8, height: 300, overflowY: 'auto' }}
                />
            </ReusableForm>
        </ReusableModal>
    );
};

export default GroupUserModal;