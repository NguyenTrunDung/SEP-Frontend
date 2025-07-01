import React, { useEffect } from 'react';
import { Form, Input, Button, Space } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { areaService } from '../../../services/areaService';

const CreateArea = ({ open, onCancel, onSubmit, branchId }) => {
    const { form, handleSubmit, resetForm } = useAntForm();

    useEffect(() => {
        if (!open) resetForm();
    }, [open, resetForm]);

    const handleFormSubmit = async (values) => {
        try {
            const isUnique = await areaService.validateAreaName(branchId, values.name);
            if (!isUnique) {
                form.setFields([
                    {
                        name: 'name',
                        errors: ['Tên khu vực đã tồn tại trong chi nhánh này!'],
                    },
                ]);
                return;
            }
            await handleSubmit(async () => {
                if (onSubmit) {
                    await onSubmit({ name: values.name, branchId });
                }
            });
        } catch (error) {
            console.error('Failed to validate area name:', error);
            form.setFields([
                {
                    name: 'name',
                    errors: [error.response?.data?.message || 'Lỗi khi kiểm tra tên khu vực!'],
                },
            ]);
        }
    };

    return (
        <ReusableModal
            title={<span style={{ fontSize: '30px' }}>Thêm</span>}
            open={open}
            onCancel={onCancel}
            footer={null}
            destroyOnClose
            closable={false}
        >
            {/* Nút X và Lưu ở góc phải trên cùng */}
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
                            fontSize: 14
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
                            fontSize: 14
                        }}
                    >
                        X
                    </Button>
                </Space>
            </div>


            <ReusableForm form={form} onFinish={handleFormSubmit} layout="vertical">
                <Form.Item
                    name="name"
                    rules={[{ required: true, message: 'Tên khu vực' }]}
                >
                    <Input placeholder="Tên khu vực" style={{ width: '100%' }} />
                </Form.Item>
            </ReusableForm>
        </ReusableModal>
    );
};

export default CreateArea;
