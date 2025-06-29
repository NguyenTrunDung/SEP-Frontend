import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import withPageWrapper from '../../../components/common/PageWrapper';
import FoodCategoriesTable from './FoodCategoriesTable';
import AddFoodCategory from '../FoodCategories/CreateFoodCategory';
import EditFoodCategory from '../FoodCategories/EditFoodCategory';
import FoodCategoryDetails from './FoodCategoryDetails';
import { useAntModal } from '../../../hooks/useAntModal';
import {
  useFoodCategories,
  useCreateFoodCategory,
  useUpdateFoodCategory,
  useDeleteFoodCategory
} from '../../../hooks/queries/useFoodCategories';
import { useGlobalErrorHandler } from '../../../hooks/useGlobalErrorHandler';
import { environment } from '../../../services/api/config';

const FoodCategoriesPageContent = ({
  categoriesData,
  loading,
  onEdit,
  onDelete,
  onViewDetails,
  addModalProps,
  editModalProps,
  detailsModalProps,
  onCreateOrUpdate,
  branchId, // Add branchId prop
}) => {


  return (
    <>
      <FoodCategoriesTable
        dataSource={categoriesData}
        loading={loading}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
        branchId={branchId} // Pass branchId to enable drag-and-drop
      />

      <AddFoodCategory
        open={addModalProps.open}
        onCancel={addModalProps.handleCancel}
        onSubmit={onCreateOrUpdate}
      />
      <EditFoodCategory
        open={editModalProps.open}
        onCancel={editModalProps.handleCancel}
        onSubmit={onCreateOrUpdate}
        formData={editModalProps.formData}
      />
      <FoodCategoryDetails
        open={detailsModalProps.open}
        onCancel={detailsModalProps.handleCancel}
        category={detailsModalProps.category}
      />
    </>
  );
};

const FoodCategoriesPageWithWrapper = withPageWrapper(FoodCategoriesPageContent);

const FoodCategories = () => {
  const { open: addOpen, showModal: showAddModal, handleCancel: handleAddCancel } = useAntModal();
  const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();
  const { open: detailsOpen, showModal: showDetailsModal, handleCancel: handleDetailsCancel } = useAntModal();
  const { handleNonPermissionError } = useGlobalErrorHandler();
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';

  // React Query hooks for CRUD operations
  const { categories, isLoading, error, refetch } = useFoodCategories(branchId);
  const createCategoryMutation = useCreateFoodCategory();
  const updateCategoryMutation = useUpdateFoodCategory();
  const deleteCategoryMutation = useDeleteFoodCategory();



  const [categoriesData, setCategoriesData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editCategory, setEditCategory] = useState(null);

  useEffect(() => {
    if (error) {
      // Use global error handler for consistent error management
      handleNonPermissionError(error, 'Không thể tải dữ liệu danh mục.');
      setCategoriesData([]);
    } else {
      setCategoriesData(categories || []);
      if (categories?.length > 0) {
        console.log(`✅ Loaded ${categories.length} food categories successfully`);
      }
    }
  }, [categories, error, handleNonPermissionError]);

  const handleCreateOrUpdate = async (formData, imageFile = null) => {
    try {
      const payload = {
        name: formData.name,
        imageUrl: formData.imageUrl || '',
      };

      if (formData.id) {
        // Update existing category - include sort field to preserve existing order
        payload.sort = formData.sort;

        await updateCategoryMutation.mutateAsync({
          categoryId: formData.id,
          categoryData: payload,
          imageFile, // Pass image file for server upload if provided
          branchId: branchId, // Keep as string for consistent cache keys
        });
        handleEditCancel();
      } else {
        // Create new category - do NOT include sort field (backend auto-assigns)
        await createCategoryMutation.mutateAsync({
          categoryData: payload,
          imageFile, // Pass image file for server upload if provided
          branchId: branchId, // Keep as string for consistent cache keys
        });
        handleAddCancel();
      }
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error('Failed to save category:', error);
      throw error; // Re-throw for form handling
    }
  };

  const handleEdit = (record) => {
    setEditCategory(record);
    showEditModal();
  };

  const handleDelete = async (record) => {
    try {
      await deleteCategoryMutation.mutateAsync(record.id);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Failed to delete category:', error);
    }
  };

  const handleViewDetails = (record) => {
    setSelectedCategory(record);
    showDetailsModal();
  };

  const handleRefresh = () => {
    refetch();
    message.success('Đã làm mới danh sách danh mục');
  };

  return (
    <FoodCategoriesPageWithWrapper
      pageTitle="Quản Lý Danh Mục Món Ăn"
      pageDescription="Tạo và quản lý danh mục món ăn một cách dễ dàng và hiệu quả"
      pageIcon="🍽️"
      loading={isLoading}
      primaryButton={{
        text: 'Thêm Danh Mục Mới',
        icon: <PlusOutlined />,
        onClick: showAddModal,
      }}
      onRefresh={handleRefresh}
      refreshText="Làm mới"
      categoriesData={categoriesData}
      branchId={branchId} // Pass branchId for drag-and-drop functionality
      onEdit={handleEdit}
      onDelete={handleDelete}
      onViewDetails={handleViewDetails}
      addModalProps={{ open: addOpen, handleCancel: handleAddCancel }}
      editModalProps={{ open: editOpen, handleCancel: handleEditCancel, formData: editCategory }}
      detailsModalProps={{ open: detailsOpen, handleCancel: handleDetailsCancel, category: selectedCategory }}
      onCreateOrUpdate={handleCreateOrUpdate}
    />
  );
};

export default FoodCategories;