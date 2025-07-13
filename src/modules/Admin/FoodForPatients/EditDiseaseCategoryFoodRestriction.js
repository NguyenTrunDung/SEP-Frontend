import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, message, Select, Switch } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { useDiseaseCategories } from '../../../hooks/queries/useDiseaseCategoryFoodRestrictions';
import { useFoods } from '../../../hooks/queries/useFoods';
import PropTypes from 'prop-types';

const { TextArea } = Input;

const EditDiseaseCategoryFoodRestriction = ({ open, onCancel, onSubmit, formData }) => {
    const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm();
    const { diseaseCategories } = useDiseaseCategories();
    const { foods } = useFoods();

    useEffect(() => {
        if (open) {
            // Reset form when modal opens
            resetForm();
        } else if (!open) {
            // Clean up when modal closes
            resetForm();
        }
    }, [open, form, resetForm]);

    // Handle formData changes when modal is open
    useEffect(() => {
        if (formData && open) {
            console.log('🔄 EditDiseaseCategoryFoodRestriction - Setting form data:', formData);
            form.setFieldsValue({
                id: formData.id,
                diseaseCategoryId: formData.diseaseCategoryId,
                foodId: formData.foodId,
                restrictionLevel: formData.restrictionLevel,
                reason: formData.reason,
                alternativeRecommendations: formData.alternativeRecommendations,
                requiresPhysicianOverride: formData.requiresPhysicianOverride || false,
                isActive: formData.isActive !== undefined ? formData.isActive : true,
            });
        }
    }, [open, formData, form]);

    const handleFormSubmit = async (values) => {
        console.log('🚀 EditDiseaseCategoryFoodRestriction - Form submit with values:', values);

        const result = await handleSubmit(async (formData) => {
            if (onSubmit) {
                await onSubmit(formData);
            }
        });

        if (result.success) {
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
            title="Sửa Hạn Chế Thực Phẩm"
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={700}
            destroyOnClose
        >
            <ReusableForm
                form={form}
                onFinish={handleFormSubmit}
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
                >
                    <Switch />
                </Form.Item>

                <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
                    <Space>
                        <Button onClick={handleCancel}>
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={formLoading}
                            disabled={formLoading}
                        >
                            Cập nhật hạn chế
                        </Button>
                    </Space>
                </Form.Item>
            </ReusableForm>
        </ReusableModal>
    );
};

EditDiseaseCategoryFoodRestriction.propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    formData: PropTypes.object,
};

export default EditDiseaseCategoryFoodRestriction; 