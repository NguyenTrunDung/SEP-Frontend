import React from 'react';
import { Form } from 'antd';
import PropTypes from 'prop-types';

/**
 * Reusable Form component that extends Ant Design Form
 * Provides full customization while maintaining consistency
 */
const ReusableForm = ({
    form,
    children,
    onFinish,
    onFinishFailed,
    initialValues,
    layout = 'vertical',
    size = 'large',
    requiredMark = true,
    validateTrigger = 'onChange',
    autoComplete = 'off',
    preserve = true,
    scrollToFirstError = true,
    className,
    style,
    disabled = false,
    colon = false,
    ...rest
}) => {
    const handleFinish = (values) => {
        if (onFinish) {
            onFinish(values);
        }
    };

    const handleFinishFailed = (errorInfo) => {
        if (onFinishFailed) {
            onFinishFailed(errorInfo);
        }
    };

    return (
        <Form
            form={form}
            layout={layout}
            size={size}
            requiredMark={requiredMark}
            validateTrigger={validateTrigger}
            autoComplete={autoComplete}
            preserve={preserve}
            scrollToFirstError={scrollToFirstError}
            initialValues={initialValues}
            onFinish={handleFinish}
            onFinishFailed={handleFinishFailed}
            className={className}
            style={style}
            disabled={disabled}
            colon={colon}
            {...rest}
        >
            {children}
        </Form>
    );
};

ReusableForm.propTypes = {
    form: PropTypes.object,
    children: PropTypes.node.isRequired,
    onFinish: PropTypes.func,
    onFinishFailed: PropTypes.func,
    initialValues: PropTypes.object,
    layout: PropTypes.oneOf(['horizontal', 'vertical', 'inline']),
    size: PropTypes.oneOf(['small', 'middle', 'large']),
    requiredMark: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    validateTrigger: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    autoComplete: PropTypes.string,
    preserve: PropTypes.bool,
    scrollToFirstError: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    className: PropTypes.string,
    style: PropTypes.object,
    disabled: PropTypes.bool,
    colon: PropTypes.bool,
};

export default ReusableForm; 