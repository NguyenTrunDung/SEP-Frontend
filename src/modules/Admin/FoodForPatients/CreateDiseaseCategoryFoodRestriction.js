import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Button, Space, Select, Switch, message } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { useDiseaseCategories } from '../../../hooks/queries/useDiseaseCategoryFoodRestrictions';
import { diseaseCategoryFoodRestrictionService } from '../../../services/diseaseCategoryFoodRestrictionService';
import PropTypes from 'prop-types';

const { TextArea } = Input;

const CreateDiseaseCategoryFoodRestriction = ({
    open,
    onCancel,
    onSubmit,
    initialValues = {},
}) => {
    const { form, loading: formLoading, handleSubmit } = useAntForm();
    const { diseaseCategories } = useDiseaseCategories();

    useEffect(() => {
        if (open) {
            form.setFieldsValue(initialValues);
        } else {
            form.resetFields();
        }
    }, [open, initialValues, form]);

    const handleFormSubmit = async (values) => {
        console.log('🚀 Form submit with values:', values);
        const result = await handleSubmit(async (formData) => {
            try {
                // Tạo món ăn mới
                const mealData = {
                    name: formData.nutritionalMealName,
                    price: formData.price,
                    branchId: formData.branchId || 1, // Giả định branchId nếu không có
                };
                const mealResponse = await diseaseCategoryFoodRestrictionService.createNutritionalMeal(mealData);
                const nutritionalMealCode = mealResponse.data.code;

                // Tạo hạn chế thực phẩm với nutritionalMealCode
                await onSubmit?.({
                    ...formData,
                    nutritionalMealCode,
                });
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Lỗi khi tạo món ăn hoặc hạn chế thực phẩm!';
                message.error(errorMessage);
                throw error;
            }
        });

        if (result.success) {
            handleCancel();
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel?.();
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
                    name="nutritionalMealName"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên món ăn!' },
                        { max: 100, message: 'Tên món ăn không được vượt quá 100 ký tự!' },
                    ]}
                    className="floating-form-item"
                >
                    <Input
                        placeholder="Nhập tên món ăn dinh dưỡng"
                        className="floating-input"
                    />
                </Form.Item>

                <Form.Item
                    name="price"
                    rules={[
                        { required: true, message: 'Vui lòng nhập giá tiền!' },
                        { type: 'number', min: 0, message: 'Giá tiền phải lớn hơn hoặc bằng 0!' },
                    ]}
                    className="floating-form-item"
                >
                    <InputNumber
                        placeholder="Nhập giá tiền (VNĐ)"
                        className="floating-input"
                        style={{ width: '100%' }}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                </Form.Item>

                <Form.Item
                    name="mealTime"
                    rules={[{ required: true, message: 'Vui lòng chọn buổi ăn!' }]}
                    className="floating-form-item"
                >
                    <Select
                        placeholder="Chọn buổi ăn"
                        className="floating-input"
                        options={[
                            { value: 'morning', label: 'Buổi sáng' },
                            { value: 'noon', label: 'Buổi trưa' },
                            { value: 'evening', label: 'Buổi tối' },
                        ]}
                    />
                </Form.Item>

                <Form.Item
                    name="reason"
                    rules={[{ required: true, message: 'Vui lòng nhập lý do!' }]}
                    className="floating-form-item"
                >
                    <TextArea
                        placeholder="Nhập lý do chọn món ăn này cho bệnh nhân"
                        className="floating-input"
                        rows={4}
                    />
                </Form.Item>

                <Form.Item
                    name="alternativeRecommendations"
                    className="floating-form-item"
                >
                    <TextArea
                        placeholder="Nhập các món ăn thay thế được khuyến nghị"
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