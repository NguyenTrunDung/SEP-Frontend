import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Space, message } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { branchService } from '../../../services/branchService';
import './CreateBranch.css';

const CreateBranch = ({ open, onCancel, onSubmit }) => {
    const { form, handleSubmit, resetForm } = useAntForm();
    const [focus, setFocus] = useState('');

    useEffect(() => {
        if (!open) {
            resetForm();
        }
    }, [open, resetForm]);

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

            const isUnique = await branchService.validateBranchName?.(normalizedName);
            if (isUnique === false) {
                form.setFields([
                    {
                        name: 'name',
                        errors: ['Tên chi nhánh đã tồn tại!'],
                    },
                ]);
                return;
            }

            await handleSubmit(async () => {
                if (onSubmit) {
                    await onSubmit({
                        name: values.name.trim(),
                        phoneNumber: values.phoneNumber?.trim() || '',
                        address: values.address?.trim() || '',
                    });
                }
            });
        } catch (error) {
            console.error('❌ Lỗi khi tạo chi nhánh:', error);
            message.error(error.response?.data?.message || 'Lỗi khi tạo chi nhánh!');
        }
    };

    return (
        <ReusableModal
            title={<span style={{ fontSize: '30px', color: '#000' }}>Thêm</span>}
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
                            fontSize: 14,
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
                            fontSize: 14,
                        }}
                    >
                        X
                    </Button>
                </Space>
            </div>

            <ReusableForm form={form} onFinish={handleFormSubmit} layout="vertical">

                <Form.Item
                    name="name"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên chi nhánh!' },
                        { whitespace: true, message: 'Tên chi nhánh không được chỉ chứa khoảng trắng!' },
                    ]}
                    style={{ marginBottom: 0 }}
                >
                    <div className="branch-floating-input-wrapper">
                        <Input
                            className="branch-custom-input"
                            onFocus={() => setFocus('name')}
                            onBlur={(e) => {
                                if (!e.target.value) setFocus('');
                            }}
                            value={form.getFieldValue('name')}
                            onChange={(e) => form.setFieldValue('name', e.target.value)}
                        />
                        <label
                            className={`branch-floating-label ${focus === 'name' || form.getFieldValue('name') ? 'focused' : ''}`}
                        >
                            Tên chi nhánh
                        </label>
                    </div>
                </Form.Item>

                <Form.Item
                    name="phoneNumber"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                    style={{ marginBottom: 0 }}
                >
                    <div className="branch-floating-input-wrapper">
                        <Input
                            className="branch-custom-input"
                            onFocus={() => setFocus('phone')}
                            onBlur={(e) => {
                                if (!e.target.value) setFocus('');
                            }}
                            value={form.getFieldValue('phoneNumber')}
                            onChange={(e) => form.setFieldValue('phoneNumber', e.target.value)}
                        />
                        <label
                            className={`branch-floating-label ${focus === 'phone' || form.getFieldValue('phoneNumber') ? 'focused' : ''}`}
                        >
                            Số điện thoại
                        </label>
                    </div>
                </Form.Item>

                <Form.Item
                    name="address"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                    style={{ marginBottom: 0 }}
                >
                    <div className="branch-floating-input-wrapper">
                        <Input.TextArea
                            className="branch-custom-textarea"
                            autoSize={{ minRows: 3, maxRows: 5 }}
                            onFocus={() => setFocus('address')}
                            onBlur={(e) => {
                                if (!e.target.value) setFocus('');
                            }}
                            value={form.getFieldValue('address')}
                            onChange={(e) => form.setFieldValue('address', e.target.value)}
                        />
                        <label
                            className={`branch-floating-label textarea-label ${focus === 'address' || form.getFieldValue('address') ? 'focused' : ''}`}
                        >
                            Địa chỉ
                        </label>
                    </div>
                </Form.Item>

            </ReusableForm>
        </ReusableModal>
    );
};

export default CreateBranch;
