import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import BranchesTable from './BranchesTable';
import CreateBranch from './CreateBranch';
import EditBranch from './EditBranch';
import { useAntModal } from '../../../hooks/useAntModal';
import { useGlobalErrorHandler } from '../../../hooks/useGlobalErrorHandler';
import { branchService } from '../../../services/branchService';
import { environment } from '../../../services/api/config';
import './Branch.css';

const BranchesPageContent = ({
  branchesData,
  loading,
  onEdit,
  onDelete,
  addModalProps,
  editModalProps,
  onCreateOrUpdate,
  onRefresh,
}) => (
  <>
    <BranchesTable
      dataSource={branchesData}
      loading={loading}
      onEdit={onEdit}
      onDelete={onDelete}
      onRefresh={onRefresh}
      onCreateOrUpdate={onCreateOrUpdate}
      showAddModal={addModalProps.showModal}
    />
    <CreateBranch
      open={addModalProps.open}
      onCancel={addModalProps.handleCancel}
      onSubmit={onCreateOrUpdate}
    />
    <EditBranch
      open={editModalProps.open}
      onCancel={editModalProps.handleCancel}
      onSubmit={onCreateOrUpdate}
      formData={editModalProps.formData}
    />
  </>
);

const BranchesPage = () => {
  const { open: addOpen, showModal: showAddModal, handleCancel: handleAddCancel } = useAntModal();
  const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();
  const { handleNonPermissionError } = useGlobalErrorHandler();

  const branchId = environment.multiTenant.getCurrentBranchId() || '1';
  const [branchesData, setBranchesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const allBranches = await branchService.getAllBranches();

      // Nếu cần lọc theo branchId (giống area), thì lọc:
      const filtered = allBranches.filter(branch => String(branch.id) === String(branchId));
      if (environment.features.enableLogging) {
        console.log(`🔍 BranchesPage: Filtered branches for branch ${branchId}:`, filtered);
      }
      setBranchesData(filtered);
    } catch (error) {
      console.error('❌ Error fetching branches:', error);
      handleNonPermissionError(error, 'Không thể tải dữ liệu chi nhánh.');
      setBranchesData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [branchId]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      const payload = {
        Name: formData.Name || formData.name?.trim(),
        Phone: formData.Phone || formData.phoneNumber?.trim() || '',
        Address: formData.Address || formData.address?.trim() || '',
        IsActive: formData.IsActive !== undefined ? formData.IsActive : true,
      };

      if (formData.id) {
        await branchService.updateBranch(formData.id, payload);
        message.success('Cập nhật chi nhánh thành công');
        handleEditCancel();
      } else {
        await branchService.createBranch(payload);
        message.success('Tạo chi nhánh thành công');
        handleAddCancel();
      }

      fetchBranches();
    } catch (error) {
      console.error('❌ Lỗi lưu chi nhánh:', error);
      message.error(error.response?.data?.message || 'Lỗi khi lưu chi nhánh!');
    }
  };

  const handleEdit = (record) => {
    // Nếu bạn cần ngăn chỉnh sửa chi nhánh khác (giống khu vực):
    if (String(record.id) !== String(branchId)) {
      message.error('Không thể chỉnh sửa chi nhánh khác!');
      return;
    }

    setSelectedBranch(record);
    showEditModal();
  };

  const handleDelete = async (record) => {
    if (String(record.id) !== String(branchId)) {
      message.error('Không thể xoá chi nhánh khác!');
      return;
    }

    try {
      await branchService.deleteBranch(record.id);
      message.success('Xóa chi nhánh thành công');
      fetchBranches();
    } catch (error) {
      console.error('❌ Lỗi xoá chi nhánh:', error);
      message.error(error.response?.data?.message || 'Lỗi khi xoá chi nhánh!');
    }
  };

  const handleRefresh = () => {
    fetchBranches();
    message.success('Đã làm mới danh sách chi nhánh');
  };

  return (
    <BranchesPageContent
      branchesData={branchesData}
      loading={isLoading}
      onEdit={handleEdit}
      onDelete={handleDelete}
      addModalProps={{ open: addOpen, showModal: showAddModal, handleCancel: handleAddCancel }}
      editModalProps={{ open: editOpen, handleCancel: handleEditCancel, formData: selectedBranch }}
      onCreateOrUpdate={handleCreateOrUpdate}
      onRefresh={handleRefresh}
    />
  );
};

export default BranchesPage;
