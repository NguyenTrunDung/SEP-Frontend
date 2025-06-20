import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import withPageWrapper from '../../../components/common/PageWrapper';
import FoodsTable from './FoodsTable';
import CreateFood from './CreateFood';
import { useAntModal } from '../../../hooks/useAntModal';

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

const FoodsWithWrapperExample = () => {
  const { open, showModal, handleCancel } = useAntModal();
  const [loading, setLoading] = useState(false);
  const [foodsData, setFoodsData] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedFood, setSelectedFood] = useState(null);

  // Mock foods data with corrected structure
  const mockFoodsData = [
    { id: 1, name: 'Bánh mì', categoryId: 1, description: 'Bánh mì đặc biệt', priceForGuest: 25000, priceForPatient: 20000, priceForStaff: 20000, sort: 1, imageUrl: 'https://example.com/banhmi.jpg' },
    { id: 2, name: 'Phở bò', categoryId: 2, description: 'Phở bò tái', priceForGuest: 50000, priceForPatient: 45000, priceForStaff: 45000, sort: 2, imageUrl: null },
    { id: 3, name: 'Coca Cola', categoryId: 3, description: 'Nước ngọt', priceForGuest: 15000, priceForPatient: 12000, priceForStaff: 12000, sort: 3, imageUrl: 'https://example.com/coke.jpg' },
    { id: 4, name: 'Chè đậu', categoryId: 4, description: 'Chè đậu xanh', priceForGuest: 10000, priceForPatient: 8000, priceForStaff: 8000, sort: 4, imageUrl: null },
    { id: 5, name: 'Salad rau', categoryId: 5, description: 'Salad chay', priceForGuest: 30000, priceForPatient: 25000, priceForStaff: 25000, sort: 5, imageUrl: 'https://example.com/salad.jpg' },
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

  // Calculate next sort value
  const nextSort = foodsData.length > 0
    ? Math.max(...foodsData.map(item => item.sort || 0)) + 1
    : 1;

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
            priceForPatient: formData.priceForPatient,
            priceForStaff: formData.priceForStaff,
            sort: formData.sort,
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
          setSelectedFood(null);
          resolve();
        } catch (error) {
          message.error('Có lỗi xảy ra khi lưu món ăn!');
          reject(error);
        }
      }, 1500);
    });
  };

  const handleEdit = (record) => {
    setSelectedFood(record);
    showModal();
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
        onClick: () => {
          setSelectedFood(null);
          showModal();
        },
      }}
      onRefresh={handleRefresh}
      refreshText="Làm mới"
      foodsData={foodsData}
      onEdit={handleEdit}
      onDelete={handleDelete}
      modalProps={{ open, handleCancel }}
      onCreateOrUpdate={handleCreateOrUpdate}
      selectedFood={selectedFood}
      nextSort={nextSort}
    />
  );
};

export default FoodsWithWrapperExample;