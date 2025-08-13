import React, { useEffect } from 'react';
import { Form, Input, Button, Space, message } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { branchService } from '../../../services/branchService';
import './Branch.css';

const EditBranch = ({ open, onCancel, onSubmit, formData }) => {
    const { form, handleSubmit, resetForm } = useAntForm();

    useEffect(() => {
        if (formData && open) {
            form.setFieldsValue({
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                address: formData.address,
                paymentStatus: formData.paymentStatus,
            });
        } else if (!open) {
            resetForm();
        }
    }, [formData, open, form, resetForm]);

    const handleFormSubmit = async (values) => {
        try {
            const normalizedName = values.name.trim().toLowerCase();
            if (!normalizedName) {
                form.setFields([
                    {
                        name: 'name',
                        errors: ['Tên chi nhánh không được để trống!'],
                    },
                ]);
                return;
            }

            // Check if name is different from current name before validating
            const currentName = formData?.name?.trim().toLowerCase();
            if (normalizedName !== currentName) {
                const isUnique = await branchService.validateBranchName?.(normalizedName, formData?.id);
                if (isUnique === false) {
                    form.setFields([
                        {
                            name: 'name',
                            errors: ['Tên chi nhánh đã tồn tại!'],
                        },
                    ]);
                    return;
                }
            }

            await handleSubmit(async () => {
                if (onSubmit) {
                    await onSubmit({
                        id: formData?.id,
                        Name: values.name.trim(),
                        Phone: values.phoneNumber?.trim() || '',
                        Address: values.address?.trim() || '',
                        IsActive: true
                    });
                }
            });
        } catch (error) {
            console.error('❌ Lỗi khi cập nhật chi nhánh:', error);
            message.error(error.response?.data?.message || 'Lỗi khi cập nhật chi nhánh!');
        }
    };

    return (
        <ReusableModal
            title={<span style={{ fontSize: '30px' }}>Chỉnh sửa chi nhánh</span>}
            open={open}
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
                <div className="custom-floating">
                    <label className="floating-label">Tên chi nhánh</label>
                    <Form.Item
                        name="name"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên chi nhánh!' },
                            { whitespace: true, message: 'Tên chi nhánh không được chỉ chứa khoảng trắng!' }
                        ]}
                        style={{ marginBottom: 0 }}
                    >
                        <Input className="input-label" placeholder="Tên chi nhánh" />
                    </Form.Item>
                </div>

                <div className="custom-floating">
                    <label className="floating-label">Số điện thoại</label>
                    <Form.Item
                        name="phoneNumber"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                        style={{ marginBottom: 0 }}
                    >
                        <Input className="input-label" placeholder="Số điện thoại" />
                    </Form.Item>
                </div>

                <div className="custom-floating">
                    <label className="floating-label">Địa chỉ</label>
                    <Form.Item
                        name="address"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                        style={{ marginBottom: 0 }}
                    >
                        <Input.TextArea
                            className="input-label"
                            placeholder="Địa chỉ"
                            autoSize={{ minRows: 3, maxRows: 5 }}
                        />
                    </Form.Item>

                </div>

            </ReusableForm>
        </ReusableModal>
    );
};

export default EditBranch;
