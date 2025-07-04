import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AreasTable from './AreasTable';
import CreateArea from './CreateArea';
import EditArea from './EditArea';
import { useAntModal } from '../../../hooks/useAntModal';
import { useAreas, useCreateArea, useUpdateArea, useDeleteArea } from '../../../hooks/queries/useAreas';
import { useGlobalErrorHandler } from '../../../hooks/useGlobalErrorHandler';
import { environment } from '../../../services/api/config';
import './Area.css';

const AreasPageContent = ({
    areasData,
    loading,
    onEdit,
    onDelete,
    onViewDetails,
    addModalProps,
    editModalProps,
    detailsModalProps,
    onCreateOrUpdate,
    onRefresh,
    branchId,
}) => (
    <>
        <AreasTable
            dataSource={areasData}
            loading={loading}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
            branchId={branchId}
        />
        <CreateArea
            open={addModalProps.open}
            onCancel={addModalProps.handleCancel}
            onSubmit={onCreateOrUpdate}
            branchId={branchId}
        />
        <EditArea
            open={editModalProps.open}
            onCancel={editModalProps.handleCancel}
            onSubmit={onCreateOrUpdate}
            formData={editModalProps.formData}
            branchId={branchId}
        />
        
    </>
);

const AreasPage = () => {
    const { open: addOpen, showModal: showAddModal, handleCancel: handleAddCancel } = useAntModal();
    const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();
    const { handleNonPermissionError } = useGlobalErrorHandler();
    const branchId = environment.multiTenant.getCurrentBranchId() || '1';

    const { areas, isLoading, error, refetch } = useAreas(branchId);
    const createAreaMutation = useCreateArea();
    const updateAreaMutation = useUpdateArea();
    const deleteAreaMutation = useDeleteArea();

    const [areasData, setAreasData] = useState([]);
    const [selectedArea, setSelectedArea] = useState(null);

    useEffect(() => {
        if (error) {
            handleNonPermissionError(error, 'Không thể tải dữ liệu khu vực.');
            setAreasData([]);
        } else {
            setAreasData(areas || []);
        }
    }, [areas, error, handleNonPermissionError]);

    const handleCreateOrUpdate = async (formData) => {
        try {
            const payload = { name: formData.name, branchId };
            if (formData.id) {
                await updateAreaMutation.mutateAsync({ areaId: formData.id, areaData: payload, branchId });
                handleEditCancel();
            } else {
                await createAreaMutation.mutateAsync({ areaData: payload, branchId });
                handleAddCancel();
            }
        } catch (error) {
            console.error('Failed to save area:', error);
            message.error(error.response?.data?.message || 'Lỗi khi lưu khu vực!');
        }
    };

    const handleEdit = (record) => {
        setSelectedArea(record);
        showEditModal();
    };

    const handleDelete = async (record) => {
        try {
            await deleteAreaMutation.mutateAsync(record.id);
        } catch (error) {
            console.error('Failed to delete area:', error);
            message.error(error.response?.data?.message || 'Lỗi khi xóa khu vực!');
        }
    };



    const handleRefresh = () => {
        refetch();
        message.success('Đã làm mới danh sách khu vực');
    };

    return (
        <AreasPageContent
            areasData={areasData}
            loading={isLoading}
            branchId={branchId}
            onEdit={handleEdit}
            onDelete={handleDelete}

            addModalProps={{ open: addOpen, handleCancel: handleAddCancel }}
            editModalProps={{ open: editOpen, handleCancel: handleEditCancel, formData: selectedArea }}
           
            onCreateOrUpdate={handleCreateOrUpdate}
            onRefresh={handleRefresh}
        />
    );
};

export default AreasPage;
