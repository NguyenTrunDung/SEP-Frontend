import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import withPageWrapper from '../../../components/common/PageWrapper';
import FoodCategoriesTable from './FoodCategoriesTable';
import AddFoodCategory from '../FoodCategories/CreateFoodCategory';
import EditFoodCategory from '../FoodCategories/EditFoodCategory';
import FoodCategoryDetails from './FoodCategoryDetails';
import { useAntModal } from '../../../hooks/useAntModal';
import { useFoodCategories } from '../../../hooks/queries/useFoodCategories';
import { foodCategoryService } from '../../../services/foodCategoryService';
import { useFoodCategoryContext } from '../../../context/FoodCategoryContext';
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
}) => {
  return (
    <>
      <FoodCategoriesTable
        dataSource={categoriesData}
        loading={loading}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
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
  const { triggerRefresh } = useFoodCategoryContext();
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';
  const { categories, isLoading, error } = useFoodCategories(branchId);
  const [categoriesData, setCategoriesData] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editCategory, setEditCategory] = useState(null);

  useEffect(() => {
    if (error) {
      message.error(error.message || 'Không thể tải dữ liệu danh mục.');
      setCategoriesData([]);
    } else {
      setCategoriesData(categories || []);
      if (categories?.length > 0) {
        message.success(`Tải ${categories.length} danh mục thành công!`);
      }
    }
  }, [categories, error, refreshTrigger]);

  const handleCreateOrUpdate = async (formData) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const payload = {
            name: formData.name,
            sort: parseInt(formData.sort, 10) || 0,
            imageUrl: formData.imageUrl || '',
            branchId: parseInt(branchId, 10),
          };

          let response;
          if (formData.id) {
            response = await foodCategoryService.updateFoodCategory(formData.id, payload, branchId);
            message.success('Cập nhật danh mục thành công!');
            setCategoriesData((prevData) =>
              prevData.map((item) => (item.id === formData.id ? { ...item, ...response.data.data } : item))
            );
          } else {
            response = await foodCategoryService.createFoodCategory(payload, branchId);
            message.success('Tạo danh mục thành công!');
            setCategoriesData((prevData) => [response.data.data, ...prevData]);
          }

          setRefreshTrigger((prev) => prev + 1);
          triggerRefresh();
          if (formData.id) {
            handleEditCancel();
          } else {
            handleAddCancel();
          }
          resolve(response.data);
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục!';
          message.error(errorMessage);
          reject(error);
        }
      }, 1500);
    });
  };

  const handleEdit = (record) => {
    setEditCategory(record);
    showEditModal();
  };

  const handleDelete = async (record) => {
    try {
      await foodCategoryService.deleteFoodCategory(record.id, branchId);
      setCategoriesData((prevData) => prevData.filter((item) => item.id !== record.id));
      message.success(`Đã xóa danh mục ${record.name}`);
      triggerRefresh();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không thể xóa danh mục.';
      message.error(errorMessage);
    }
  };

  const handleViewDetails = (record) => {
    setSelectedCategory(record);
    showDetailsModal();
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
    message.success('Đã làm mới danh sách danh mục');
    triggerRefresh();
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