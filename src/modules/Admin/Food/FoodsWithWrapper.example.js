import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import withPageWrapper from '../../../components/common/PageWrapper';
import FoodsTable from './FoodsTable';
import CreateFood from './CreateFood';
import { useAntModal } from '../../../hooks/useAntModal';

/**
 * Example: Refactoring the Foods page to use PageWrapper HOC
 * This shows how to structure the Foods page with the HOC
 */

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

const FoodsWithWrapperExample = () => {
  const { open, showModal, handleCancel } = useAntModal();
  const [loading, setLoading] = useState(false);
  const [foodsData, setFoodsData] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Mock foods data
  const mockFoodsData = [
    { id: 1, name: 'Bánh mì', categoryId: 1, description: 'Bánh mì đặc biệt', priceForGuest: 20000, imageUrl: 'https://example.com/banhmi.jpg' },
    { id: 2, name: 'Phở bò', categoryId: 2, description: 'Phở bò tái', priceForGuest: 50000, imageUrl: null },
    { id: 3, name: 'Coca Cola', categoryId: 3, description: 'Nước ngọt', priceForGuest: 15000, imageUrl: 'https://example.com/coke.jpg' },
    { id: 4, name: 'Chè đậu', categoryId: 4, description: 'Chè đậu xanh', priceForGuest: 10000, imageUrl: null },
    { id: 5, name: 'Salad rau', categoryId: 5, description: 'Salad chay', priceForGuest: 30000, imageUrl: 'https://example.com/salad.jpg' },
  ];

  // Mock categories for table display
  const mockCategories = [
    { id: 1, name: 'Điểm tâm' },
    { id: 2, name: 'Món chính' },
    { id: 3, name: 'Nước giải khát' },
    { id: 4, name: 'Tráng miệng' },
    { id: 5, name: 'Món chay' },
  ];

  const fetchFoodsData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setFoodsData(mockFoodsData);
    } catch (error) {
      message.error('Không thể tải dữ liệu món ăn!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodsData();
  }, [refreshTrigger]);

  const handleCreateOrUpdate = async (formData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const newFood = {
            id: formData.id || Date.now(),
            name: formData.name,
            categoryId: formData.categoryId,
            description: formData.description || '',
            priceForGuest: formData.priceForGuest,
            imageUrl: formData.imageUrl || null,
          };

          setFoodsData(prevData => {
            if (formData.id) {
              return prevData.map(item => (item.id === formData.id ? newFood : item));
            }
            return [newFood, ...prevData];
          });

          message.success(formData.id ? 'Cập nhật món ăn thành công!' : 'Tạo món ăn thành công!');
          setRefreshTrigger(prev => prev + 1);
          handleCancel();
          resolve();
        } catch (error) {
          message.error('Có lỗi xảy ra khi lưu món ăn!');
          reject(error);
        }
      }, 1500);
    });
  };

  const handleEdit = (record) => {
    showModal(record);
  };

  const handleDelete = (record) => {
    setFoodsData(prevData => prevData.filter(item => item.id !== record.id));
    message.success(`Đã xóa món ăn ${record.name}`);
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

export default FoodsWithWrapperExample;
