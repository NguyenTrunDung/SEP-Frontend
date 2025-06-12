import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import withPageWrapper from '../../../components/common/PageWrapper';
import FoodCategoriesTable from './FoodCategoriesTable';
import CreateFoodCategory from './CreateFoodCategory';
import { useAntModal } from '../../../hooks/useAntModal';

/**
 * Example: Refactoring the FoodCategories page to use PageWrapper HOC
 * This shows how to structure the FoodCategories page with the HOC
 */

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

  // Mock categories data
  const mockCategoriesData = [
    { id: 1, name: 'Điểm tâm', sort: 1, imageUrl: 'https://example.com/breakfast.jpg' },
    { id: 2, name: 'Món chính', sort: 2, imageUrl: 'https://example.com/main.jpg' },
    { id: 3, name: 'Nước giải khát', sort: 3, imageUrl: null },
    { id: 4, name: 'Tráng miệng', sort: 4, imageUrl: 'https://example.com/dessert.jpg' },
    { id: 5, name: 'Món chay', sort: 5, imageUrl: null },
  ];

  const fetchCategoriesData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setCategoriesData(mockCategoriesData);
    } catch (error) {
      message.error('Không thể tải dữ liệu danh mục!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesData();
  }, [refreshTrigger]);

  const handleCreateOrUpdate = async (formData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const newCategory = {
            id: formData.id || Date.now(),
            name: formData.name,
            sort: formData.sort,
            imageUrl: formData.imageUrl || null,
          };

          setCategoriesData(prevData => {
            if (formData.id) {
              return prevData.map(item => (item.id === formData.id ? newCategory : item));
            }
            return [newCategory, ...prevData];
          });

          message.success(formData.id ? 'Cập nhật danh mục thành công!' : 'Tạo danh mục thành công!');
          setRefreshTrigger(prev => prev + 1);
          handleCancel();
          resolve();
        } catch (error) {
          message.error('Có lỗi xảy ra khi lưu danh mục!');
          reject(error);
        }
      }, 1500);
    });
  };

  const handleEdit = (record) => {
    showModal(record);
  };

  const handleDelete = (record) => {
    setCategoriesData(prevData => prevData.filter(item => item.id !== record.id));
    message.success(`Đã xóa danh mục ${record.name}`);
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

