import React, { useState } from 'react';
import { message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import withPageWrapper from '../../../components/common/PageWrapper';
import FoodsTable from './FoodsTable';
import CreateFood from './CreateFood';
import { useAntModal } from '../../../hooks/useAntModal';
import {
  useFoods,
  useCreateFoodWithImage,
  useUpdateFoodWithImage,
  useDeleteFood
} from '../../../hooks/queries/useFoods';

const FoodsPageContent = ({
  foodsData,
  loading,
  onEdit,
  onDelete,
  modalProps,
  onCreateOrUpdate,
  selectedFood,
  nextSort,
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
        open={modalProps.open}
        onCancel={modalProps.handleCancel}
        onSubmit={onCreateOrUpdate}
        initialValues={{ priceForGuest: 0, priceForPatient: 0, priceForStaff: 0, sort: nextSort }}
        formData={selectedFood}
      />
    </>
  );
};

const FoodsPageWithWrapper = withPageWrapper(FoodsPageContent);

const Foods = () => {
  const { open, showModal, handleCancel } = useAntModal();
  const { foods, isLoading: foodsLoading, refetch } = useFoods();
  const [selectedFood, setSelectedFood] = useState(null);

  // React Query mutations
  const createFoodMutation = useCreateFoodWithImage();
  const updateFoodMutation = useUpdateFoodWithImage();
  const deleteFoodMutation = useDeleteFood();

  // Calculate next sort value
  const nextSort = foods && foods.length > 0
    ? Math.max(...foods.map(item => item.sort || 0)) + 1
    : 1;

  const handleCreateOrUpdate = async (formData, imageFile) => {
    try {
      const foodData = {
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description || '',
        priceForGuest: formData.priceForGuest,
        priceForPatient: formData.priceForPatient,
        priceForStaff: formData.priceForStaff,
        sort: formData.sort,
        isAddOn: formData.isAddOn || false,
        isSetDish: formData.isSetDish || false,
      };

      if (formData.id) {
        // Update existing food
        await updateFoodMutation.mutateAsync({
          id: formData.id,
          foodData,
          imageFile
        });
      } else {
        // Create new food
        await createFoodMutation.mutateAsync({
          foodData,
          imageFile
        });
      }

      // Close modal and reset form
      handleCancel();
      setSelectedFood(null);
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error('Failed to save food:', error);
    }
  };

  const handleEdit = (record) => {
    setSelectedFood(record);
    showModal();
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
          showModal();
        },
        disabled: isLoading,
      }}
      onRefresh={handleRefresh}
      refreshText="Làm mới"
      foodsData={foods}
      onEdit={handleEdit}
      onDelete={handleDelete}
      modalProps={{ open, handleCancel }}
      onCreateOrUpdate={handleCreateOrUpdate}
      selectedFood={selectedFood}
      nextSort={nextSort}
    />
  );
};

export default Foods;