import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import DiseaseCategoriesTable from './DiseaseCategoriesTable';
import CreateDiseaseCategory from './CreateDiseaseCategory';
import EditDiseaseCategory from './EditDiseaseCategory';
import { useAntModal } from '../../../hooks/useAntModal';
import {
  useDiseaseCategories,
  useCreateDiseaseCategory,
  useUpdateDiseaseCategory,
  useDeleteDiseaseCategory,
} from '../../../hooks/queries/useDiseaseCategories';
import { useGlobalErrorHandler } from '../../../hooks/useGlobalErrorHandler';
import { environment } from '../../../services/api/config';

const DiseaseCategoriesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { open: addOpen, showModal: showAddModal, handleCancel: handleAddCancel } = useAntModal();
  const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();
  const { handleNonPermissionError } = useGlobalErrorHandler();

  const branchId = environment.multiTenant.getCurrentBranchId() || '1';

  const {
    diseaseCategories,
    isLoading,
    error,
    refetch,
  } = useDiseaseCategories(branchId);

  const createCategory = useCreateDiseaseCategory();
  const updateCategory = useUpdateDiseaseCategory();
  const deleteCategory = useDeleteDiseaseCategory();

  useEffect(() => {
    if (error) {
      handleNonPermissionError(error, 'Không thể tải danh sách danh mục bệnh.');
    }
  }, [error]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      const payload = { name: formData.name, branchId };
      if (formData.id) {
        await updateCategory.mutateAsync({ categoryId: formData.id, categoryData: payload, branchId });
        message.success('Cập nhật danh mục bệnh thành công');
        handleEditCancel();
      } else {
        await createCategory.mutateAsync({ categoryData: payload, branchId });
        message.success('Tạo danh mục bệnh thành công');
        handleAddCancel();
      }
      refetch();
    } catch (err) {
      message.error(err.response?.data?.message || 'Lỗi khi lưu danh mục bệnh!');
    }
  };

  const handleEdit = (record) => {
    if (String(record.branchId) !== String(branchId)) {
      return message.error('Không thể chỉnh sửa danh mục bệnh từ chi nhánh khác!');
    }
    setSelectedCategory(record);
    showEditModal();
  };

  const handleDelete = async (record) => {
    if (String(record.branchId) !== String(branchId)) {
      return message.error('Không thể xoá danh mục bệnh từ chi nhánh khác!');
    }
    try {
      await deleteCategory.mutateAsync({ categoryId: record.id, branchId });
      message.success('Xoá danh mục bệnh thành công');
      refetch();
    } catch (err) {
      message.error(err.response?.data?.message || 'Lỗi khi xoá danh mục bệnh!');
    }
  };

  const handleRefresh = () => {
    refetch();
    message.success('Đã làm mới danh sách danh mục bệnh');
  };

  return (
    <>
      <DiseaseCategoriesTable
        data={diseaseCategories || []}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={showAddModal}
        onRefresh={handleRefresh}
      />

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
    </>
  );
};

export default DiseaseCategoriesPage;
