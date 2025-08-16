import React, { useState } from 'react';
import { message } from 'antd';
import { withPageWrapperV2 } from '../../../components/common/PageWrapperV2';
import DiseaseCategoryFoodRestrictionsTable from './DiseaseCategoryFoodRestrictionsTable';
import CreateDiseaseCategoryFoodRestriction from './CreateDiseaseCategoryFoodRestriction';
import EditDiseaseCategoryFoodRestriction from './EditDiseaseCategoryFoodRestriction';
import { useAntModal } from '../../../hooks/useAntModal';
import {
    useDiseaseCategoryFoodRestrictions,
    useDiseaseCategories,
    useCreateDiseaseCategoryFoodRestriction,
    useUpdateDiseaseCategoryFoodRestriction,
    useDeleteDiseaseCategoryFoodRestriction
} from '../../../hooks/queries/useDiseaseCategoryFoodRestrictions';

const FoodForPatientPageContent = ({
    restrictionsData,
    diseaseCategoriesData,
    loading,
    onEdit,
    onDelete,
    createModalProps,
    editModalProps,
    onCreateOrUpdate,
    selectedRestriction,
}) => {
    return (
        <>
            <DiseaseCategoryFoodRestrictionsTable
                dataSource={restrictionsData}
                diseaseCategories={diseaseCategoriesData}
                loading={loading}
                onEdit={onEdit}
                onDelete={onDelete}
            />
            <CreateDiseaseCategoryFoodRestriction
                open={createModalProps.open}
                onCancel={createModalProps.handleCancel}
                onSubmit={onCreateOrUpdate}
            />
            <EditDiseaseCategoryFoodRestriction
                open={editModalProps.open}
                onCancel={editModalProps.handleCancel}
                onSubmit={onCreateOrUpdate}
                formData={selectedRestriction}
            />
        </>
    );
};

const FoodForPatientPageWithWrapper = withPageWrapperV2(FoodForPatientPageContent);

const FoodForPatientPage = () => {
    const { open: createOpen, showModal: showCreateModal, handleCancel: handleCreateCancel } = useAntModal();
    const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();

    // React Query hooks
    const { restrictions, isLoading: restrictionsLoading, refetch } = useDiseaseCategoryFoodRestrictions();
    const { diseaseCategories, isLoading: diseaseCategoriesLoading } = useDiseaseCategories();
    const [selectedRestriction, setSelectedRestriction] = useState(null);

    // React Query mutations
    const createRestrictionMutation = useCreateDiseaseCategoryFoodRestriction();
    const updateRestrictionMutation = useUpdateDiseaseCategoryFoodRestriction();
    const deleteRestrictionMutation = useDeleteDiseaseCategoryFoodRestriction();

    const handleCreateOrUpdate = async (formData) => {
        try {
            if (formData.id) {
                // Update existing restriction
                await updateRestrictionMutation.mutateAsync({
                    id: formData.id,
                    restrictionData: {
                        diseaseCategoryId: formData.diseaseCategoryId,
                        nutritionalMealCode: formData.nutritionalMealCode,
                        mealTime: formData.mealTime,
                        reason: formData.reason,
                        alternativeRecommendations: formData.alternativeRecommendations,
                        requiresPhysicianOverride: formData.requiresPhysicianOverride,
                        isActive: formData.isActive,
                    }
                });
            } else {
                // Create new restriction
                await createRestrictionMutation.mutateAsync({
                    diseaseCategoryId: formData.diseaseCategoryId,
                    nutritionalMealCode: formData.nutritionalMealCode,
                    mealTime: formData.mealTime,
                    reason: formData.reason,
                    alternativeRecommendations: formData.alternativeRecommendations,
                    requiresPhysicianOverride: formData.requiresPhysicianOverride,
                    isActive: formData.isActive,
                });
            }

            // Close modal and reset form
            if (formData.id) {
                handleEditCancel();
            } else {
                handleCreateCancel();
            }
            setSelectedRestriction(null);
        } catch (error) {
            // Error handling is done in the mutation hooks
            console.error('Failed to save restriction:', error);
        }
    };

    const handleEdit = (record) => {
        setSelectedRestriction(record);
        showEditModal();
    };

    const handleDelete = async (record) => {
        try {
            await deleteRestrictionMutation.mutateAsync(record.id);
        } catch (error) {
            // Error handling is done in the mutation hook
            console.error('Failed to delete restriction:', error);
        }
    };

    const handleRefresh = () => {
        refetch();
        message.success('Đã làm mới danh sách hạn chế thực phẩm');
    };

    const handleAdd = () => {
        setSelectedRestriction(null);
        showCreateModal();
    };

    const isLoading = restrictionsLoading ||
        diseaseCategoriesLoading ||
        createRestrictionMutation.isPending ||
        updateRestrictionMutation.isPending ||
        deleteRestrictionMutation.isPending;

    return (
        <>
            <FoodForPatientPageWithWrapper
                title="Quản Lý Món Ăn Dinh Dưỡng Cho Bệnh Nhân"
                onAdd={handleAdd}
                onRefresh={handleRefresh}
                loading={isLoading}
                addButtonText="Thêm"
                refreshButtonText="Làm mới"
                showAddButton={true}
                showRefreshButton={true}
                showSearch={false}
                restrictionsData={restrictions}
                diseaseCategoriesData={diseaseCategories}
                onEdit={handleEdit}
                onDelete={handleDelete}
                createModalProps={{ open: createOpen, handleCancel: handleCreateCancel }}
                editModalProps={{ open: editOpen, handleCancel: handleEditCancel }}
                onCreateOrUpdate={handleCreateOrUpdate}
                selectedRestriction={selectedRestriction}
            />
        </>
    );
};

export default FoodForPatientPage;