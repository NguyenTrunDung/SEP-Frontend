import React, { useEffect, useState, useRef } from 'react';
import { Form, Input, Button, Space, Select, Switch, message } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { useDiseaseCategories } from '../../../hooks/queries/useDiseaseCategoryFoodRestrictions';
import { useFoods } from '../../../hooks/queries/useFoods';
import PropTypes from 'prop-types';
import '../Department/Department.css';

const { TextArea } = Input;

const EditDiseaseCategoryFoodRestriction = ({ open, onCancel, onSubmit, formData }) => {
    const { form, loading: formLoading, resetForm } = useAntForm(formData || {});
    const { diseaseCategories } = useDiseaseCategories();
    const { foods } = useFoods();
    const [focus, setFocus] = useState('');
    const prevFormDataRef = useRef(null);

    useEffect(() => {
        if (open && formData) {
            if (
                prevFormDataRef.current &&
                prevFormDataRef.current.id === formData.id &&
                prevFormDataRef.current.diseaseCategoryId === formData.diseaseCategoryId &&
                prevFormDataRef.current.nutritionalMealName === formData.nutritionalMealName &&
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

            // Convert comma-separated mealTime string to array for frontend
            const mealTimeArray = formData.mealTime
                ? formData.mealTime.split(',').map(mt => mt.trim())
                : [];

            form.setFieldsValue({
                id: formData.id,
                diseaseCategoryId: formData.diseaseCategoryId,
                nutritionalMealName: formData.nutritionalMealName,
                mealTime: formData.mealTime,
                reason: formData.reason,
                alternativeRecommendations: formData.alternativeRecommendations,
                requiresPhysicianOverride: formData.requiresPhysicianOverride || false,
                isActive: formData.isActive !== undefined ? formData.isActive : true,
                branchId: formData.branchId || 1,
            });
            prevFormDataRef.current = formData;
        } else if (!open) {
            resetForm();
            prevFormDataRef.current = null;
        }
    }, [open, formData, form, resetForm]);

    const handleFormSubmit = async (values) => {
        console.log('🚀 Gửi form với giá trị:', values);
        await onSubmit?.(values);
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
                        disabled={formLoading}
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
                <Form.Item name="branchId" hidden>
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
                            { required: true, message: 'Vui lòng chọn hoặc nhập tên món ăn!' },
                            { max: 100, message: 'Tên món ăn không được vượt quá 100 ký tự!' },
                        ]}
                        style={{ marginBottom: 0 }}
                    >
                        <Select
                            showSearch
                            allowClear
                            placeholder="Chọn hoặc nhập tên món ăn dinh dưỡng"
                            className="floating-input"
                            options={foods.map(food => ({
                                value: food.name,
                                label: food.name,
                            }))}
                            filterOption={(input, option) =>
                                option.label.toLowerCase().includes(input.toLowerCase())
                            }
                            onFocus={() => setFocus('nutritionalMealName')}
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
                            { value: 'morning', label: 'Sáng' },
                            { value: 'noon', label: 'Trưa' },
                            { value: 'evening', label: 'Chiều' },
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
        nutritionalMealName: PropTypes.string,
        mealTime: PropTypes.string,
        reason: PropTypes.string,
        alternativeRecommendations: PropTypes.string,
        requiresPhysicianOverride: PropTypes.bool,
        isActive: PropTypes.bool,
        branchId: PropTypes.number,
    }),
};

export default EditDiseaseCategoryFoodRestriction;