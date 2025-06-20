import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import withPageWrapper from '../../../components/common/PageWrapper';
import FoodCategoriesTable from './FoodCategoriesTable';
import CreateFoodCategory from './CreateFoodCategory';
import { useAntModal } from '../../../hooks/useAntModal';
import { foodCategoryService } from './api/foodCategoryService';
import { environment } from './api/config';

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

const FoodCategoriesWithWrapperExample = () => {
  const { open, showModal, handleCancel } = useAntModal();
  const [loading, setLoading] = useState(false);
  const [categoriesData, setCategoriesData] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchCategoriesData = async () => {
    setLoading(true);
    try {
      const branchId = environment.multiTenant.getCurrentBranchId() || '1';
      console.log('🔍 Fetching categories with branchId:', branchId);
      console.log('🔍 Token:', environment.auth.getToken());
      const categories = await foodCategoryService.getFoodCategories(branchId);
      console.log('✅ Raw API response (fetch):', categories);
      setCategoriesData(categories?.data || categories || []);
      message.success(`Tải ${categories?.data?.length || categories?.length || 0} danh mục thành công!`);
    } catch (error) {
      console.error('❌ Error fetching categories:', error.message, error.response?.data);
      message.error('Không thể tải dữ liệu danh mục: ' + (error.message || 'Lỗi không xác định'));
      setCategoriesData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesData();
  }, [refreshTrigger]);

  const handleCreateOrUpdate = async (formData) => {
    const branchId = environment.multiTenant.getCurrentBranchId() || '1';
    try {
      console.log('🔍 FormData received:', formData);
      const jsonData = {
        name: formData.name || '', // Ensure non-null
        imageUrl: formData.imageUrl || '',
        sort: formData.sort != null ? parseInt(formData.sort, 10) : 0, // Handle null/undefined
      };

      console.log('🔍 JSON Data sending:', jsonData);

      let response;
      if (formData.id) {
        response = await foodCategoryService.updateFoodCategory(formData.id, jsonData, branchId);
        message.success('Cập nhật danh mục thành công!');
      } else {
        response = await foodCategoryService.createFoodCategory(jsonData, branchId);
        message.success('Tạo danh mục thành công!');
      }

      console.log('✅ API response (create/update):', response);
      const updatedCategory = response?.data;
      if (updatedCategory) {
        setCategoriesData(prevData => {
          if (formData.id) {
            return prevData.map(item =>
              item.id === formData.id ? { ...item, ...updatedCategory } : item
            );
          } else {
            return [updatedCategory, ...prevData];
          }
        });
      }

      setRefreshTrigger(prev => prev + 1);
      handleCancel();
      return response;
    } catch (error) {
      console.error('❌ Error saving category:', error.message, error.response?.data);
      message.error('Có lỗi xảy ra khi lưu danh mục: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const handleEdit = (record) => {
    console.log('🔍 Editing category:', record);
    showModal(record);
  };

  const handleDelete = async (record) => {
    const branchId = environment.multiTenant.getCurrentBranchId() || '1';
    try {
      await foodCategoryService.deleteFoodCategory(record.id, branchId);
      message.success(`Đã xóa danh mục ${record.name}`);
      setCategoriesData(prevData => prevData.filter(item => item.id !== record.id));
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('❌ Error deleting category:', error.message, error.response?.data);
      message.error('Không thể xóa danh mục!');
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    message.success('Đã làm mới danh sách danh mục');
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

export default FoodCategoriesWithWrapperExample;