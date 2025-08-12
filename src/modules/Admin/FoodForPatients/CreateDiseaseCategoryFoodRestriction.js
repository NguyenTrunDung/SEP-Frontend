import React, { useEffect } from 'react';
import { Form, Input, Button, Space, Select, Switch } from 'antd';
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
    const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm();
    const { diseaseCategories } = useDiseaseCategories();
    const { foods } = useFoods();

    useEffect(() => {
        if (open) {
            form.setFieldsValue(initialValues);
        } else {
            resetForm();
        }
    }, [open, initialValues]); // Removed form, resetForm from dependencies

    const handleFormSubmit = async (values) => {
        console.log('🚀 CreateDiseaseCategoryFoodRestriction - Form submit with values:', values);

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

    return (
        <ReusableModal
            title={<span style={{ fontSize: '30px' }}>Thêm</span>}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={600}
            destroyOnClose
            closable={false}
        >
            <div style={{ position: 'absolute', top: 16, right: 24, zIndex: 1 }}>
                <Space>
                    <Button
                        type="primary"
                        onClick={() => form.submit()}
                        loading={formLoading}
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
                        onClick={handleCancel}
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
                    // label="Danh mục bệnh"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục bệnh!' }]}
                    className="floating-form-item"
                >
                    <Select
                        placeholder="Chọn danh mục bệnh"
                        className="floating-input"
                        options={diseaseCategories.map(category => ({
                            value: category.id,
                            label: category.name,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="foodId"
                    // label="Thực phẩm"
                    rules={[{ required: true, message: 'Vui lòng chọn thực phẩm!' }]}
                    className="floating-form-item"
                >
                    <Select
                        placeholder="Chọn thực phẩm"
                        className="floating-input"
                        options={foods.map(food => ({
                            value: food.id,
                            label: food.name,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="reason"
                    // label="Lý do hạn chế"
                    rules={[{ required: true, message: 'Vui lòng nhập lý do hạn chế!' }]}
                    className="floating-form-item"
                >
                    <TextArea
                        placeholder="Nhập lý do hạn chế thực phẩm này cho bệnh nhân"
                        className="floating-input"
                        rows={4}
                    />
                </Form.Item>

                <Form.Item
                    name="alternativeRecommendations"
                    // label="Khuyến nghị thay thế"
                    className="floating-form-item"
                >
                    <TextArea
                        placeholder="Nhập các thực phẩm thay thế được khuyến nghị"
                        className="floating-input"
                        rows={3}
                    />
                </Form.Item>

                <Form.Item
                    name="requiresPhysicianOverride"
                    label="Yêu cầu bác sĩ phê duyệt"
                    valuePropName="checked"
                    className="floating-form-item"
                >
                    <Switch />
                </Form.Item>

                <Form.Item
                    name="isActive"
                    label="Trạng thái hoạt động"
                    valuePropName="checked"
                    initialValue={true}
                    className="floating-form-item"
                >
                    <Switch />
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