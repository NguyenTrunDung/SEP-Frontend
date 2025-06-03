import React from 'react';
import { Modal } from 'antd';
import PropTypes from 'prop-types';

/**
 * Reusable Modal component that extends Ant Design Modal
 * Provides full customization while maintaining consistency
 */
const ReusableModal = ({
    children,
    title,
    open,
    onOk,
    onCancel,
    okText = 'OK',
    cancelText = 'Cancel',
    width = 520,
    centered = true,
    maskClosable = false,
    closable = true,
    destroyOnClose = true,
    keyboard = true,
    mask = true,
    okButtonProps,
    cancelButtonProps,
    confirmLoading = false,
    footer,
    bodyStyle,
    className,
    style,
    wrapClassName,
    zIndex = 1000,
    afterClose,
    getContainer,
    forceRender = false,
    ...rest
}) => {
    const handleOk = (e) => {
        if (onOk) {
            onOk(e);
        }
    };

    const handleCancel = (e) => {
        if (onCancel) {
            onCancel(e);
        }
    };

    return (
        <Modal
            title={title}
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            okText={okText}
            cancelText={cancelText}
            width={width}
            centered={centered}
            maskClosable={maskClosable}
            closable={closable}
            destroyOnClose={destroyOnClose}
            keyboard={keyboard}
            mask={mask}
            okButtonProps={okButtonProps}
            cancelButtonProps={cancelButtonProps}
            confirmLoading={confirmLoading}
            footer={footer}
            bodyStyle={bodyStyle}
            className={className}
            style={style}
            wrapClassName={wrapClassName}
            zIndex={zIndex}
            afterClose={afterClose}
            getContainer={getContainer}
            forceRender={forceRender}
            {...rest}
        >
            {children}
        </Modal>
    );
};

ReusableModal.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    open: PropTypes.bool.isRequired,
    onOk: PropTypes.func,
    onCancel: PropTypes.func.isRequired,
    okText: PropTypes.string,
    cancelText: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    centered: PropTypes.bool,
    maskClosable: PropTypes.bool,
    closable: PropTypes.bool,
    destroyOnClose: PropTypes.bool,
    keyboard: PropTypes.bool,
    mask: PropTypes.bool,
    okButtonProps: PropTypes.object,
    cancelButtonProps: PropTypes.object,
    confirmLoading: PropTypes.bool,
    footer: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
    bodyStyle: PropTypes.object,
    className: PropTypes.string,
    style: PropTypes.object,
    wrapClassName: PropTypes.string,
    zIndex: PropTypes.number,
    afterClose: PropTypes.func,
    getContainer: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
    forceRender: PropTypes.bool,
};

export default ReusableModal; 