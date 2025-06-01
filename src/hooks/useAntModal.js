import { useState } from 'react';

/**
 * Custom hook for handling Ant Design modals
 * Provides consistent modal handling patterns across the application
 */
export const useAntModal = () => {
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const showModal = () => {
        setOpen(true);
    };

    const hideModal = () => {
        setOpen(false);
        setConfirmLoading(false);
    };

    const handleCancel = () => {
        hideModal();
    };

    const handleOk = async (onOk) => {
        if (!onOk) {
            hideModal();
            return;
        }

        try {
            setConfirmLoading(true);
            await onOk();
            hideModal();
            return { success: true };
        } catch (error) {
            setConfirmLoading(false);
            return { success: false, error };
        }
    };

    const toggleModal = () => {
        setOpen(prev => !prev);
    };

    return {
        open,
        confirmLoading,
        showModal,
        hideModal,
        handleCancel,
        handleOk,
        toggleModal,
    };
}; 