import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, message, Select, InputNumber, Switch } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { useDiseaseCategories } from '../../../hooks/queries/useDiseaseCategoryFoodRestrictions';
import { useFoods } from '../../../hooks/queries/useFoods';
import PropTypes from 'prop-types';

const { TextArea } = Input;

const CreateDiseaseCategoryFoodRestriction = ({
    open,
    onCancel,
    onSubmit,
    initialValues = {},
}) => {
    const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm(initialValues);
    const { diseaseCategories } = useDiseaseCategories();
    const { foods } = useFoods();

    useEffect(() => {
        if (open) {
            // Reset form to initial values when modal opens
            form.setFieldsValue(initialValues);
        } else if (!open) {
            // Clean up when modal closes
            resetForm();
        }
    }, [open, initialValues, form, resetForm]);

    const handleFormSubmit = async (values) => {
        console.log('🚀 CreateDiseaseCategoryFoodRestriction - Form submit with values:', values);

        const result = await handleSubmit(async (formData) => {
            if (onSubmit) {
                await onSubmit(formData);
            }
        });

        if (result.success) {
            // Success message is handled in the mutation hooks
            handleCancel();
        }
    };

    const handleCancel = () => {
        resetForm();
        if (onCancel) {
            onCancel();
        }
    };

    // Helper function to get restriction level display
    const getRestrictionLevelDisplay = (level) => {
        switch (level) {
            case 1:
                return { text: 'Cảnh báo (Warning)', color: '#faad14' };
            case 2:
                return { text: 'Hạn chế (Restricted)', color: '#ff4d4f' };
            case 3:
                return { text: 'Cấm (Forbidden)', color: '#d32f2f' };
            default:
                return { text: 'Chọn mức độ', color: '#999' };
        }
    };

    return (
        <ReusableModal
            title="Thêm Hạn Chế Thực Phẩm Mới"
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={700}
            destroyOnClose
        >
            <ReusableForm
                form={form}
                onFinish={handleFormSubmit}
                initialValues={initialValues}
                layout="vertical"
                className={formLoading ? 'form-loading' : ''}
            >
                <Form.Item name="id" hidden>
                    <Input />
                </Form.Item>

                <Form.Item
                    name="diseaseCategoryId"
                    label="Danh mục bệnh"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục bệnh!' }]}
                >
                    <Select
                        placeholder="Chọn danh mục bệnh"
                        options={diseaseCategories.map(category => ({
                            value: category.id,
                            label: category.name,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="foodId"
                    label="Thực phẩm"
                    rules={[{ required: true, message: 'Vui lòng chọn thực phẩm!' }]}
                >
                    <Select
                        placeholder="Chọn thực phẩm"
                        options={foods.map(food => ({
                            value: food.id,
                            label: food.name,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="restrictionLevel"
                    label="Mức độ hạn chế"
                    rules={[{ required: true, message: 'Vui lòng chọn mức độ hạn chế!' }]}
                >
                    <Select
                        placeholder="Chọn mức độ hạn chế"
                        options={[
                            { value: 1, label: 'Cảnh báo (Warning)', color: '#faad14' },
                            { value: 2, label: 'Hạn chế (Restricted)', color: '#ff4d4f' },
                            { value: 3, label: 'Cấm (Forbidden)', color: '#d32f2f' },
                        ]}
                    />
                </Form.Item>

                <Form.Item
                    name="reason"
                    label="Lý do hạn chế"
                    rules={[{ required: true, message: 'Vui lòng nhập lý do hạn chế!' }]}
                >
                    <TextArea
                        placeholder="Nhập lý do hạn chế thực phẩm này cho bệnh nhân"
                        rows={4}
                    />
                </Form.Item>

                <Form.Item
                    name="alternativeRecommendations"
                    label="Khuyến nghị thay thế"
                >
                    <TextArea
                        placeholder="Nhập các thực phẩm thay thế được khuyến nghị"
                        rows={3}
                    />
                </Form.Item>

                <Form.Item
                    name="requiresPhysicianOverride"
                    label="Yêu cầu bác sĩ phê duyệt"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>

                <Form.Item
                    name="isActive"
                    label="Trạng thái hoạt động"
                    valuePropName="checked"
                    initialValue={true}
                >
                    <Switch />
                </Form.Item>

                <Form.Item className="form-actions">
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button onClick={handleCancel} size="large">
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" loading={formLoading} size="large">
                            Lưu Hạn Chế
                        </Button>
                    </Space>
                </Form.Item>
            </ReusableForm>
        </ReusableModal>
    );
};

CreateDiseaseCategoryFoodRestriction.propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
};

export default CreateDiseaseCategoryFoodRestriction; 