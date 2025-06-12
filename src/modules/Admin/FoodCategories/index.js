import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import withPageWrapper from '../../../components/common/PageWrapper';
import FoodCategoriesTable from './FoodCategoriesTable';
import CreateFoodCategory from './CreateFoodCategory';
import { useAntModal } from '../../../hooks/useAntModal';
import { useFoodCategories } from '../../../hooks/queries/useFoodCategories';
import { foodCategoryService } from '../../../services/foodCategoryService';
import { useFoodCategoryContext } from '../../../context/FoodCategoryContext';

const FoodCategoriesPageContent = ({
  categoriesData,
  loading,
  onEdit,
  onDelete,
  modalProps,
  onCreateOrUpdate,
}) => {
  return (
    <>
      <FoodCategoriesTable
        dataSource={categoriesData}
        loading={loading}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <CreateFoodCategory
        open={modalProps.open}
        onCancel={modalProps.handleCancel}
        onSubmit={onCreateOrUpdate}
        initialValues={{ sort: 0 }}
      />
    </>
  );
};

const FoodCategoriesPageWithWrapper = withPageWrapper(FoodCategoriesPageContent);

const FoodCategories = () => {
  const { open, showModal, handleCancel } = useAntModal();
  const { triggerRefresh } = useFoodCategoryContext();
  const { categories } = useFoodCategories(1); // Hardcoded branchId
  const [categoriesData, setCategoriesData] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCategoriesData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      setCategoriesData(categories);
    } catch (error) {
      message.error('Không thể tải dữ liệu danh mục!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesData();
  }, [categories, refreshTrigger]);

  const handleCreateOrUpdate = async (formData) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const formDataPayload = new FormData();
          formDataPayload.append('name', formData.name);
          formDataPayload.append('sort', formData.sort);
          formDataPayload.append('imageUrl', formData.imageUrl || '');

          if (formData.id) {
            await foodCategoryService.updateFoodCategory(formData.id, formDataPayload, 1);
            message.success('Cập nhật danh mục thành công!');
          } else {
            await foodCategoryService.createFoodCategory(formDataPayload, 1);
            message.success('Tạo danh mục thành công!');
          }

          setCategoriesData(prevData => {
            if (formData.id) {
              return prevData.map(item => (item.id === formData.id ? { ...item, ...formData } : item));
            }
            return [{ id: Date.now(), ...formData }, ...prevData];
          });

          setRefreshTrigger(prev => prev + 1);
          handleCancel();
          resolve();
        } catch (error) {
          message.error(error.message || 'Có lỗi xảy ra khi lưu danh mục!');
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
      await foodCategoryService.deleteFoodCategory(record.id, 1);
      setCategoriesData(prevData => prevData.filter(item => item.id !== record.id));
      message.success(`Đã xóa danh mục ${record.name}`);
    } catch (error) {
      message.error(error.message || 'Không thể xóa danh mục.');
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    message.success('Đã làm mới danh sách danh mục');
    triggerRefresh();
  };

  return (
    <FoodCategoriesPageWithWrapper
      pageTitle="Quản Lý Danh Mục Món Ăn"
      pageDescription="Tạo và quản lý danh mục món ăn một cách dễ dàng và hiệu quả"
      pageIcon="🍽️"
      loading={loading}
      primaryButton={{
        text: 'Thêm Danh Mục Mới',
        icon: <PlusOutlined />,
        onClick: showModal,
      }}
      onRefresh={handleRefresh}
      refreshText="Làm mới"
      categoriesData={categoriesData}
      onEdit={handleEdit}
      onDelete={handleDelete}
      modalProps={{ open, handleCancel }}
      onCreateOrUpdate={handleCreateOrUpdate}
    />
  );
};

export default FoodCategories;