import { useState } from 'react';
import { Form, message } from 'antd';

/**
 * Custom hook for handling Ant Design forms
 * Provides consistent form handling patterns across the application
 */
export const useAntForm = (initialValues = {}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (onSubmit) => {
        try {
            setLoading(true);
            setErrors({});
            const values = await form.validateFields();
            await onSubmit(values);
            return { success: true, data: values };
        } catch (error) {
            if (error.errorFields) {
                // Validation errors from form
                const validationErrors = {};
                error.errorFields.forEach(({ name, errors }) => {
                    validationErrors[name[0]] = errors[0];
                });
                setErrors(validationErrors);
                message.error('Please check your form for errors');
            } else {
                // Other errors (API errors, etc.)
                message.error(error.message || 'An error occurred while submitting the form');
            }
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        form.resetFields();
        setErrors({});
        setLoading(false);
    };

    const setFieldValues = (values) => {
        form.setFieldsValue(values);
    };

    const getFieldValue = (name) => {
        return form.getFieldValue(name);
    };

    const validateField = async (name) => {
        try {
            await form.validateFields([name]);
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
            return true;
        } catch (error) {
            const errorMessage = error.errorFields?.[0]?.errors?.[0] || 'Validation error';
            setErrors(prev => ({ ...prev, [name]: errorMessage }));
            return false;
        }
    };

    return {
        form,
        loading,
        errors,
        handleSubmit,
        resetForm,
        setFieldValues,
        getFieldValue,
        validateField,
    };
}; 