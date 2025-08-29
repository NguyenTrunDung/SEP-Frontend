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
    useDeleteDiseaseCategoryFoodRestriction
} from '../../../hooks/queries/useDiseaseCategoryFoodRestrictions';
import { useFoods } from '../../../hooks/queries/useFoods';
import { diseaseCategoryFoodRestrictionService } from '../../../services/diseaseCategoryFoodRestrictionService';

const FoodForPatientPageContent = ({
    restrictionsData,
    diseaseCategoriesData,
    foodsData,
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
                nutritionalMeals={foodsData}
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
    const { foods, isLoading: foodsLoading } = useFoods();
    const [selectedRestriction, setSelectedRestriction] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // React Query mutations
    const deleteRestrictionMutation = useDeleteDiseaseCategoryFoodRestriction();

    const handleCreateOrUpdate = async (formData) => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // Tìm thực phẩm trong danh sách foods để lấy priceForPatient
            const selectedFood = foods.find(food => food.name === formData.nutritionalMealName?.trim());
            const price = selectedFood ? selectedFood.priceForPatient : null;

            const mealData = {
                id: formData.id,
                diseaseCategoryId: formData.diseaseCategoryId,
                name: formData.nutritionalMealName?.trim(),
                price: price, // Lấy từ priceForPatient hoặc null nếu nhập tay
                mealTime: formData.mealTime,
                reason: formData.reason?.trim(),
                alternativeRecommendations: formData.alternativeRecommendations?.trim(),
                requiresPhysicianOverride: formData.requiresPhysicianOverride || false,
                isActive: formData.isActive !== undefined ? formData.isActive : true,
                branchId: formData.branchId || 1,
            };

            // Validate required fields
            if (!mealData.diseaseCategoryId) throw new Error('Thiếu danh mục bệnh');
            if (!mealData.name) throw new Error('Thiếu tên món ăn');
            if (!mealData.mealTime) throw new Error('Thiếu buổi ăn');
            if (!['morning', 'noon', 'evening'].includes(mealData.mealTime)) throw new Error('Giá trị buổi ăn không hợp lệ');
            if (!mealData.reason) throw new Error('Thiếu lý do');

            console.log('🔍 Payload:', mealData);
            await diseaseCategoryFoodRestrictionService.createNutritionalMeal(mealData);
            message.success(formData.id ? 'Cập nhật hạn chế thực phẩm thành công!' : 'Tạo hạn chế thực phẩm thành công!');

            // Refresh the list
            console.log('🔄 Gọi refetch để làm mới danh sách');
            await refetch();
            message.success('Danh sách đã được làm mới!');

            // Close modal and reset form
            if (formData.id) {
                handleEditCancel();
            } else {
                handleCreateCancel();
            }
            setSelectedRestriction(null);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi lưu hạn chế thực phẩm!';
            console.error('❌ Lỗi khi lưu hạn chế:', errorMessage, error.response?.data);
            message.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (record) => {
        setSelectedRestriction(record);
        showEditModal();
    };

    const handleDelete = async (record) => {
        try {
            await deleteRestrictionMutation.mutateAsync(record.id);
            message.success('Xóa hạn chế thực phẩm thành công!');
            console.log('🔄 Gọi refetch sau khi xóa');
            await refetch();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Lỗi khi xóa hạn chế thực phẩm!';
            console.error('❌ Lỗi khi xóa hạn chế:', errorMessage);
            message.error(errorMessage);
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

    const isLoading = restrictionsLoading || diseaseCategoriesLoading || foodsLoading || deleteRestrictionMutation.isPending;

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
                foodsData={foods}
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