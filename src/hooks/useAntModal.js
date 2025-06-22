import { useState, useCallback } from 'react';

/**
 * Custom hook for handling Ant Design modals
 * Provides consistent modal handling patterns across the application
 */
export const useAntModal = () => {
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const showModal = useCallback(() => {
        setOpen(true);
    }, []);

    const hideModal = useCallback(() => {
        setOpen(false);
        setConfirmLoading(false);
    }, []);

    const handleCancel = useCallback(() => {
        hideModal();
    }, [hideModal]);

    const handleOk = useCallback(async (onOk) => {
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
    }, [hideModal]);

    const toggleModal = useCallback(() => {
        setOpen(prev => !prev);
    }, []);

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