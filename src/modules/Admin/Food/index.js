import React, { useState } from 'react';
import { message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import withPageWrapper from '../../../components/common/PageWrapper';
import FoodsTable from './FoodsTable';
import CreateFood from './CreateFood';
import EditFood from './EditFood';
import { useAntModal } from '../../../hooks/useAntModal';
import {
  useFoods,
  useCreateFoodWithImage,
  useUpdateFoodWithImage,
  useDeleteFood
} from '../../../hooks/queries/useFoods';
import PageWrapperV2Example from '../../../components/examples/PageWrapperV2Example';

const FoodsPageContent = ({
  foodsData,
  loading,
  onEdit,
  onDelete,
  createModalProps,
  editModalProps,
  onCreateOrUpdate,
  selectedFood,
}) => {
  return (
    <>
      <FoodsTable
        dataSource={foodsData}
        loading={loading}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <CreateFood
        open={createModalProps.open}
        onCancel={createModalProps.handleCancel}
        onSubmit={onCreateOrUpdate}
        initialValues={{ priceForGuest: 0, priceForPatient: 0, priceForStaff: 0 }}
      />
      <EditFood
        open={editModalProps.open}
        onCancel={editModalProps.handleCancel}
        onSubmit={onCreateOrUpdate}
        formData={selectedFood}
      />
    </>
  );
};

const FoodsPageWithWrapper = withPageWrapper(FoodsPageContent);

const Foods = () => {
  const { open: createOpen, showModal: showCreateModal, handleCancel: handleCreateCancel } = useAntModal();
  const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();
  const { foods, isLoading: foodsLoading, refetch } = useFoods();
  const [selectedFood, setSelectedFood] = useState(null);

  // React Query mutations
  const createFoodMutation = useCreateFoodWithImage();
  const updateFoodMutation = useUpdateFoodWithImage();
  const deleteFoodMutation = useDeleteFood();

  const handleCreateOrUpdate = async (formData, imageFile) => {
    try {
      const foodData = {
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description || '',
        priceForGuest: formData.priceForGuest,
        priceForPatient: formData.priceForPatient,
        priceForStaff: formData.priceForStaff,
        isAddOn: formData.isAddOn || false,
        isSetDish: formData.isSetDish || false,
      };

      if (formData.id) {
        // Update existing food - include sort field to preserve existing order
        foodData.sort = formData.sort;

        await updateFoodMutation.mutateAsync({
          id: formData.id,
          foodData,
          imageFile
        });
      } else {
        // Create new food - do NOT include sort field (backend auto-assigns)
        await createFoodMutation.mutateAsync({
          foodData,
          imageFile
        });
      }

      // Close modal and reset form
      if (formData.id) {
        handleEditCancel();
      } else {
        handleCreateCancel();
      }
      setSelectedFood(null);
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error('Failed to save food:', error);
    }
  };

  const handleEdit = (record) => {
    setSelectedFood(record);
    showEditModal();
  };

  const handleDelete = async (record) => {
    try {
      await deleteFoodMutation.mutateAsync(record.id);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Failed to delete food:', error);
    }
  };

  const handleRefresh = () => {
    refetch();
    message.success('Đã làm mới danh sách món ăn');
  };

  const isLoading = foodsLoading ||
    createFoodMutation.isPending ||
    updateFoodMutation.isPending ||
    deleteFoodMutation.isPending;

  return (
    <>
      <FoodsPageWithWrapper
        pageTitle="Quản Lý Món Ăn"
        pageDescription="Tạo và quản lý món ăn một cách dễ dàng và hiệu quả"
        pageIcon="🍔"
        loading={isLoading}
        primaryButton={{
          text: 'Thêm Món Ăn Mới',
          icon: <PlusOutlined />,
          onClick: () => {
            setSelectedFood(null);
            showCreateModal();
          },
          disabled: isLoading,
        }}
        onRefresh={handleRefresh}
        refreshText="Làm mới"
        foodsData={foods}
        onEdit={handleEdit}
        onDelete={handleDelete}
        createModalProps={{ open: createOpen, handleCancel: handleCreateCancel }}
        editModalProps={{ open: editOpen, handleCancel: handleEditCancel }}
        onCreateOrUpdate={handleCreateOrUpdate}
        selectedFood={selectedFood} />

      <PageWrapperV2Example />

    </>

  );
};

export default Foods;