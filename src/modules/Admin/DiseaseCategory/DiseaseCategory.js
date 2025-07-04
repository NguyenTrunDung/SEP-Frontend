// DiseaseCategory.js
import React, { useState, useEffect, useMemo } from 'react';
import { Input, Button, Tooltip, Popconfirm, message } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import CreateDiseaseCategory from './CreateDiseaseCategory';
import EditDiseaseCategory from './EditDiseaseCategory';
import { useAntModal } from '../../../hooks/useAntModal';
import { useDiseaseCategories, useCreateDiseaseCategory, useUpdateDiseaseCategory, useDeleteDiseaseCategory } from '../../../hooks/queries/useDiseaseCategories';
import { useGlobalErrorHandler } from '../../../hooks/useGlobalErrorHandler';
import { environment } from '../../../services/api/config';
import './DiseaseCategory.css';

const DiseaseCategoriesTable = () => {
  const [searchText, setSearchText] = useState('');
  const [diseaseCategoriesData, setDiseaseCategoriesData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';

  // Modal controls
  const { open: addOpen, showModal: showAddModal, handleCancel: handleAddCancel } = useAntModal();
  const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();

  // API hooks
  const { diseaseCategories, isLoading, error, refetch } = useDiseaseCategories(branchId);
  const createCategoryMutation = useCreateDiseaseCategory();
  const updateCategoryMutation = useUpdateDiseaseCategory();
  const deleteCategoryMutation = useDeleteDiseaseCategory();
  const { handleNonPermissionError } = useGlobalErrorHandler();

  // Handle data loading and errors
  useEffect(() => {
    if (error) {
      handleNonPermissionError(error, 'Không thể tải dữ liệu danh mục bệnh.');
      setDiseaseCategoriesData([]);
    } else {
      const filteredCategories = (diseaseCategories || []).filter(category => String(category.branchId) === String(branchId));
      if (environment.features.enableLogging) {
        console.log(`🔍 DiseaseCategoriesTable: Filtered categories for branch ${branchId}:`, filteredCategories);
      }
      setDiseaseCategoriesData(filteredCategories);
    }
  }, [diseaseCategories, error, handleNonPermissionError, branchId]);

  // Filter data based on search text
  const filteredData = useMemo(() => {
    return !searchText
      ? diseaseCategoriesData
      : diseaseCategoriesData.filter((item) =>
          item.name.toLowerCase().includes(searchText.toLowerCase())
        );
  }, [diseaseCategoriesData, searchText]);

  // Handle create or update category
  const handleCreateOrUpdate = async (formData) => {
    try {
      const payload = { name: formData.name, branchId };
      if (formData.id) {
        await updateCategoryMutation.mutateAsync({ categoryId: formData.id, categoryData: payload, branchId });
        message.success('Cập nhật danh mục bệnh thành công');
        handleEditCancel();
      } else {
        await createCategoryMutation.mutateAsync({ categoryData: payload, branchId });
        message.success('Tạo danh mục bệnh thành công');
        handleAddCancel();
      }
      refetch();
    } catch (error) {
      console.error('Failed to save category:', error);
      message.error(error.response?.data?.message || 'Lỗi khi lưu danh mục bệnh!');
    }
  };

  // Handle edit action
  const handleEdit = (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể chỉnh sửa danh mục bệnh từ chi nhánh khác!');
      return;
    }
    setSelectedCategory(record);
    showEditModal();
  };

  // Handle delete action
  const handleDelete = async (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể xóa danh mục bệnh từ chi nhánh khác!');
      return;
    }
    try {
      await deleteCategoryMutation.mutateAsync({ categoryId: record.id, branchId });
      message.success('Xóa danh mục bệnh thành công');
      refetch();
    } catch (error) {
      console.error('Failed to delete category:', error);
      message.error(error.response?.data?.message || 'Lỗi khi xóa danh mục bệnh!');
    }
  };

  // Handle refresh action
  const handleRefresh = () => {
    refetch();
    message.success('Đã làm mới danh sách danh mục bệnh');
  };

  return (
    <div className="disease-category-wrapper">
      <div className="disease-category-header">
        <h2 className="disease-category-title">Danh mục bệnh</h2>
        <div>
          <Button
            className="refresh-btn"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            style={{ marginRight: 8 }}
          >
            Làm mới
          </Button>
          <Button className="add-btn" type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Thêm
          </Button>
        </div>
      </div>

      <Input
        className="search-input"
        placeholder="Tìm kiếm danh mục bệnh"
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      <div className="list-header">TÊN BỆNH</div>
      <div className="disease-category-list">
        {filteredData.map((item) => (
          <div className="disease-category-item" key={item.id}>
            <span className="disease-category-name">{item.name}</span>
            <div className="actions">
              <Tooltip title="Chỉnh sửa">
                <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(item)} />
              </Tooltip>
              <Popconfirm title={`Xóa ${item.name}?`} onConfirm={() => handleDelete(item)}>
                <Button type="text" icon={<DeleteOutlined />} danger />
              </Popconfirm>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination-footer">
        <select className="page-size">
          <option value="10">10</option>
        </select>
        <span>Hiển thị từ 1 đến {filteredData.length} trong tổng số {filteredData.length}</span>
        <div className="pagination">
          <Button type="text">{'<<'}</Button>
          <Button type="text">{'<'}</Button>
          <Button type="primary">1</Button>
          <Button type="text">{'>'}</Button>
          <Button type="text">{'>>'}</Button>
        </div>
      </div>

      <CreateDiseaseCategory
        open={addOpen}
        onCancel={handleAddCancel}
        onSubmit={handleCreateOrUpdate}
        branchId={branchId}
      />
      <EditDiseaseCategory
        open={editOpen}
        onCancel={handleEditCancel}
        onSubmit={handleCreateOrUpdate}
        formData={selectedCategory}
        branchId={branchId}
      />
    </div>
  );
};

export default DiseaseCategoriesTable;