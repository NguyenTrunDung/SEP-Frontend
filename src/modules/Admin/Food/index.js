import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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
        initialValues={{ priceForGuest: 0 }}
      />
    </>
  );
};

const FoodsPageWithWrapper = withPageWrapper(FoodsPageContent);

const Foods = () => {
  const { open, showModal, handleCancel } = useAntModal();
  const { foods } = useFoods(1); // Hardcoded branchId
  const [foodsData, setFoodsData] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchFoodsData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      setFoodsData(foods);
    } catch (error) {
      message.error('Không thể tải dữ liệu món ăn!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodsData();
  }, [foods, refreshTrigger]);

  const handleCreateOrUpdate = async (formData) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const foodDto = {
            name: formData.name,
            categoryId: formData.categoryId,
            description: formData.description || '',
            priceForGuest: formData.priceForGuest,
            imageUrl: formData.imageUrl || '',
          };

          if (formData.id) {
            await foodService.updateFood(formData.id, foodDto, 1);
            message.success('Cập nhật món ăn thành công!');
          } else {
            await foodService.createFood(foodDto, 1);
            message.success('Tạo món ăn thành công!');
          }

          setFoodsData(prevData => {
            if (formData.id) {
              return prevData.map(item => (item.id === formData.id ? { ...item, ...foodDto } : item));
            }
            return [{ id: Date.now(), ...foodDto }, ...prevData];
          });

          setRefreshTrigger(prev => prev + 1);
          handleCancel();
          resolve();
        } catch (error) {
          message.error(error.message || 'Có lỗi xảy ra khi lưu món ăn!');
          reject(error);
        }
      }, 1500);
    });
  };

  const handleEdit = (record) => {
    showModal(record);
  };

  const handleDelete = async (record) => {
    try {
      await foodService.deleteFood(record.id, 1);
      setFoodsData(prevData => prevData.filter(item => item.id !== record.id));
      message.success(`Đã xóa món ăn ${record.name}`);
    } catch (error) {
      message.error(error.message || 'Không thể xóa món ăn.');
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    message.success('Đã làm mới danh sách món ăn');
  };

  return (
    <FoodsPageWithWrapper
      pageTitle="Quản Lý Món Ăn"
      pageDescription="Tạo và quản lý món ăn một cách dễ dàng và hiệu quả"
      pageIcon="🍔"
      loading={loading}
      primaryButton={{
        text: 'Thêm Món Ăn Mới',
        icon: <PlusOutlined />,
        onClick: showModal,
      }}
      onRefresh={handleRefresh}
      refreshText="Làm mới"
      foodsData={foodsData}
      onEdit={handleEdit}
      onDelete={handleDelete}
      modalProps={{ open, handleCancel }}
      onCreateOrUpdate={handleCreateOrUpdate}
    />
  );
};

export default Foods;