import React, { useEffect, useState, useRef } from 'react';
import { Form, Input, InputNumber, Button, Space, Select, Switch, message } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { useDiseaseCategories } from '../../../hooks/queries/useDiseaseCategoryFoodRestrictions';
import { diseaseCategoryFoodRestrictionService } from '../../../services/diseaseCategoryFoodRestrictionService';
import PropTypes from 'prop-types';
import '../Department/Department.css';

const { TextArea } = Input;

const EditDiseaseCategoryFoodRestriction = ({ open, onCancel, onSubmit, formData }) => {
    const { form, loading: formLoading, resetForm } = useAntForm(formData || {});
    const { diseaseCategories } = useDiseaseCategories();
    const [focus, setFocus] = useState('');
    const prevFormDataRef = useRef(null);

    useEffect(() => {
        if (open && formData) {
            if (
                prevFormDataRef.current &&
                prevFormDataRef.current.id === formData.id &&
                prevFormDataRef.current.diseaseCategoryId === formData.diseaseCategoryId &&
                prevFormDataRef.current.nutritionalMealName === formData.nutritionalMealName &&
                prevFormDataRef.current.price === formData.price &&
                prevFormDataRef.current.mealTime === formData.mealTime &&
                prevFormDataRef.current.reason === formData.reason &&
                prevFormDataRef.current.alternativeRecommendations === formData.alternativeRecommendations &&
                prevFormDataRef.current.requiresPhysicianOverride === formData.requiresPhysicianOverride &&
                prevFormDataRef.current.isActive === formData.isActive
            ) {
                console.log('🔄 Form data unchanged, skipping update');
                return;
            }
            console.log('🔄 Setting form data:', formData);
            form.setFieldsValue({
                id: formData.id,
                diseaseCategoryId: formData.diseaseCategoryId,
                nutritionalMealName: formData.nutritionalMealName,
                price: formData.price,
                mealTime: formData.mealTime,
                reason: formData.reason,
                alternativeRecommendations: formData.alternativeRecommendations,
                requiresPhysicianOverride: formData.requiresPhysicianOverride || false,
                isActive: formData.isActive !== undefined ? formData.isActive : true,
            });
            prevFormDataRef.current = formData;
        } else if (!open) {
            resetForm();
            prevFormDataRef.current = null;
        }
    }, [open, formData, form, resetForm]);

    const handleFormSubmit = async (values) => {
        try {
            // Tạo hoặc cập nhật món ăn mới
            const mealData = {
                name: values.nutritionalMealName,
                price: values.price,
                branchId: values.branchId || 1, // Giả định branchId nếu không có
            };
            const mealResponse = await diseaseCategoryFoodRestrictionService.createNutritionalMeal(mealData);
            const nutritionalMealCode = mealResponse.data.code;

            const updateDto = {
                id: values.id,
                diseaseCategoryId: values.diseaseCategoryId,
                nutritionalMealCode,
                mealTime: values.mealTime,
                reason: values.reason?.trim(),
                alternativeRecommendations: values.alternativeRecommendations?.trim(),
                requiresPhysicianOverride: values.requiresPhysicianOverride,
                isActive: values.isActive,
            };

            if (!updateDto.diseaseCategoryId) {
                form.setFields([
                    { name: 'diseaseCategoryId', errors: ['Vui lòng chọn danh mục bệnh!'] },
                ]);
                return;
            }
            if (!updateDto.nutritionalMealName) {
                form.setFields([
                    { name: 'nutritionalMealName', errors: ['Vui lòng nhập tên món ăn!'] },
                ]);
                return;
            }
            if (updateDto.price === undefined || updateDto.price === null) {
                form.setFields([
                    { name: 'price', errors: ['Vui lòng nhập giá tiền!'] },
                ]);
                return;
            }
            if (!updateDto.mealTime) {
                form.setFields([
                    { name: 'mealTime', errors: ['Vui lòng chọn buổi ăn!'] },
                ]);
                return;
            }
            if (!updateDto.reason) {
                form.setFields([
                    { name: 'reason', errors: ['Vui lòng nhập lý do hạn chế!'] },
                ]);
                return;
            }

            console.log('🔍 Submitting food restriction update:', updateDto);
            await onSubmit(updateDto);
            handleCancel();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Lỗi khi cập nhật món ăn hoặc hạn chế thực phẩm!';
            console.error('❌ Failed to update food restriction:', errorMessage);
            form.setFields([
                { name: 'reason', errors: [errorMessage] },
            ]);
            message.error(errorMessage);
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
            title={<span style={{ fontSize: '30px' }}>Chỉnh sửa</span>}
            open={open}
            onCancel={handleCancel}
            footer={null}
            destroyOnClose
            closable={false}
            width={600}
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
                        loading={formLoading}
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
                layout="vertical"
                className={formLoading ? 'form-loading' : ''}
            >
                <Form.Item name="id" hidden>
                    <Input />
                </Form.Item>

                <Form.Item
                    name="diseaseCategoryId"
                    label=""
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục bệnh!' }]}
                >
                    <Select
                        placeholder="Chọn danh mục bệnh"
                        style={{ width: '100%' }}
                        disabled={diseaseCategories.length === 0}
                        options={diseaseCategories.map(category => ({
                            value: category.id,
                            label: category.name,
                        }))}
                    />
                </Form.Item>

                <div className="custom-floating">
                    <label className="floating-label">Tên món ăn</label>
                    <Form.Item
                        className="floating-form-item"
                        name="nutritionalMealName"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên món ăn!' },
                            { max: 100, message: 'Tên món ăn không được vượt quá 100 ký tự!' },
                        ]}
                        style={{ marginBottom: 0 }}
                    >
                        <Input
                            className="floating-input"
                            placeholder="Nhập tên món ăn dinh dưỡng"
                            onFocus={() => setFocus('nutritionalMealName')}
                            onBlur={() => setFocus('')}
                        />
                    </Form.Item>
                </div>

                <div className="custom-floating">
                    <label className="floating-label">Giá tiền</label>
                    <Form.Item
                        className="floating-form-item"
                        name="price"
                        rules={[
                            { required: true, message: 'Vui lòng nhập giá tiền!' },
                            { type: 'number', min: 0, message: 'Giá tiền phải lớn hơn hoặc bằng 0!' },
                        ]}
                        style={{ marginBottom: 0 }}
                    >
                        <InputNumber
                            className="floating-input"
                            placeholder="Nhập giá tiền (VNĐ)"
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            onFocus={() => setFocus('price')}
                            onBlur={() => setFocus('')}
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    name="mealTime"
                    label=""
                    rules={[{ required: true, message: 'Vui lòng chọn buổi ăn!' }]}
                >
                    <Select
                        placeholder="Chọn buổi ăn"
                        style={{ width: '100%' }}
                        options={[
                            { value: 'morning', label: 'Buổi sáng' },
                            { value: 'noon', label: 'Buổi trưa' },
                            { value: 'evening', label: 'Buổi tối' },
                        ]}
                    />
                </Form.Item>

                <div className="custom-floating">
                    <label className="floating-label">Lý do hạn chế</label>
                    <Form.Item
                        className="floating-form-item"
                        name="reason"
                        rules={[
                            { required: true, message: 'Vui lòng nhập lý do!' },
                            { whitespace: true, message: 'Lý do không được chỉ chứa khoảng trắng!' },
                            { max: 500, message: 'Lý do không được vượt quá 500 ký tự!' },
                        ]}
                        style={{ marginBottom: 0 }}
                    >
                        <TextArea
                            className="floating-input"
                            placeholder="Nhập lý do chọn món ăn này cho bệnh nhân"
                            rows={4}
                            onFocus={() => setFocus('reason')}
                            onBlur={() => setFocus('')}
                        />
                    </Form.Item>
                </div>

                <div className="custom-floating">
                    <label className="floating-label">Khuyến nghị thay thế</label>
                    <Form.Item
                        className="floating-form-item"
                        name="alternativeRecommendations"
                        rules={[{ max: 500, message: 'Khuyến nghị không được vượt quá 500 ký tự!' }]}
                        style={{ marginBottom: 0 }}
                    >
                        <TextArea
                            className="floating-input"
                            placeholder="Nhập các món ăn thay thế được khuyến nghị"
                            rows={3}
                            onFocus={() => setFocus('alternativeRecommendations')}
                            onBlur={() => setFocus('')}
                        />
                    </Form.Item>
                </div>

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
            </ReusableForm>
        </ReusableModal>
    );
};

EditDiseaseCategoryFoodRestriction.propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    formData: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        diseaseCategoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        nutritionalMealCode: PropTypes.string,
        nutritionalMealName: PropTypes.string,
        price: PropTypes.number,
        mealTime: PropTypes.string,
        reason: PropTypes.string,
        alternativeRecommendations: PropTypes.string,
        requiresPhysicianOverride: PropTypes.bool,
        isActive: PropTypes.bool,
    }),
};

export default EditDiseaseCategoryFoodRestriction;