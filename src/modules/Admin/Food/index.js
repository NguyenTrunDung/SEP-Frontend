import React, { useState } from 'react';
import { message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import withPageWrapper from '../../../components/common/PageWrapper';
import FoodsTable from './FoodsTable';
import CreateFood from './CreateFood';
import { useAntModal } from '../../../hooks/useAntModal';
import { useFoods } from '../../../hooks/queries/useFoods';
import { foodService } from '../../../services/foodService';

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
  const queryClient = useQueryClient();
  const { open, showModal, handleCancel } = useAntModal();
  const { foods, isLoading: foodsLoading } = useFoods('1'); // Default branchId to '1'
  const [selectedFood, setSelectedFood] = useState(null);

  // Calculate next sort value
  const nextSort = foods && foods.length > 0
    ? Math.max(...foods.map(item => item.sort || 0)) + 1
    : 1;

  const handleCreateOrUpdate = async (formData) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const foodDto = {
            name: formData.name,
            categoryId: formData.categoryId,
            description: formData.description || '',
            priceForGuest: formData.priceForGuest,
            priceForPatient: formData.priceForPatient,
            priceForStaff: formData.priceForStaff,
            sort: formData.sort,
            imageUrl: formData.imageUrl || '',
          };

          if (formData.id) {
            await foodService.updateFood(formData.id, foodDto, '1');
            message.success('Cập nhật món ăn thành công!');
          } else {
            await foodService.createFood(foodDto, '1');
            message.success('Tạo món ăn thành công!');
          }

          queryClient.invalidateQueries(['foods', '1']);
          handleCancel();
          setSelectedFood(null);
          resolve();
        } catch (error) {
          message.error(error.message || 'Có lỗi xảy ra khi lưu món ăn!');
          reject(error);
        }
      }, 1500);
    });
  };

  const handleEdit = (record) => {
    setSelectedFood(record);
    showModal();
  };

  const handleDelete = async (record) => {
    try {
      await foodService.deleteFood(record.id, '1');
      queryClient.invalidateQueries(['foods', '1']);
      message.success(`Đã xóa món ăn ${record.name}`);
    } catch (error) {
      message.error(error.message || 'Không thể xóa món ăn.');
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(['foods', '1']);
    message.success('Đã làm mới danh sách món ăn');
  };

  return (
    <FoodsPageWithWrapper
      pageTitle="Quản Lý Món Ăn"
      pageDescription="Tạo và quản lý món ăn một cách dễ dàng và hiệu quả"
      pageIcon="🍔"
      loading={foodsLoading}
      primaryButton={{
        text: 'Thêm Món Ăn Mới',
        icon: <PlusOutlined />,
        onClick: () => {
          setSelectedFood(null);
          showModal();
        },
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