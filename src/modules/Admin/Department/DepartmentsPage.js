import React, { useState, useEffect, useMemo } from 'react';
import { message } from 'antd';
import { withPageWrapperV2 } from '../../../components/common/PageWrapperV2';
import DepartmentsTable from './DepartmentsTable';
import CreateDepartment from './CreateDepartment';
import EditDepartment from './EditDepartment';
import { useAntModal } from '../../../hooks/useAntModal';
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '../../../hooks/queries/useDepartments';
import { useGlobalErrorHandler } from '../../../hooks/useGlobalErrorHandler';
import { environment } from '../../../services/api/config';
import PropTypes from 'prop-types';

const DepartmentsPageContent = ({
  departmentsData,
  filteredData,
  loading,
  onEdit,
  onDelete,
  createModalProps,
  editModalProps,
  onCreateOrUpdate,
  branchId,
}) => (
  <>
    <DepartmentsTable
      dataSource={filteredData}
      loading={loading}
      onEdit={onEdit}
      onDelete={onDelete}
      branchId={branchId}
    />
    <CreateDepartment
      open={createModalProps.open}
      onCancel={createModalProps.handleCancel}
      onSubmit={onCreateOrUpdate}
      branchId={branchId}
    />
    <EditDepartment
      open={editModalProps.open}
      onCancel={editModalProps.handleCancel}
      onSubmit={onCreateOrUpdate}
      formData={editModalProps.formData}
      branchId={branchId}
    />
  </>
);

DepartmentsPageContent.propTypes = {
  departmentsData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ),
  filteredData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ),
  loading: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  createModalProps: PropTypes.shape({
    open: PropTypes.bool,
    handleCancel: PropTypes.func,
  }),
  editModalProps: PropTypes.shape({
    open: PropTypes.bool,
    handleCancel: PropTypes.func,
    formData: PropTypes.object,
  }),
  onCreateOrUpdate: PropTypes.func,
  branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

const DepartmentsPageWithWrapper = withPageWrapperV2(DepartmentsPageContent);

const DepartmentsPage = () => {
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';
  const { open: createOpen, showModal: showCreateModal, handleCancel: handleCreateCancel } = useAntModal();
  const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();
  const { handleNonPermissionError } = useGlobalErrorHandler();
  const { departments, isLoading: departmentsLoading, error, refetch } = useDepartments(branchId);
  const createDepartmentMutation = useCreateDepartment();
  const updateDepartmentMutation = useUpdateDepartment();
  const deleteDepartmentMutation = useDeleteDepartment();
  const [departmentsData, setDepartmentsData] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchText, setSearchText] = useState('');

  // Memoize selectedDepartment to prevent unnecessary prop changes
  const memoizedSelectedDepartment = useMemo(() => selectedDepartment, [selectedDepartment]);

  useEffect(() => {
    console.log('🔍 DepartmentsPage useEffect triggered:', { departments, error });
    if (error) {
      handleNonPermissionError(error, 'Không thể tải dữ liệu phòng ban.');
      setDepartmentsData([]);
    } else if (departments) {
      const filteredDepartments = departments.filter(dept => String(dept.branchId) === String(branchId));
      if (environment.features.enableLogging) {
        console.log(`🔍 DepartmentsPage: Filtered departments for branch ${branchId}:`, filteredDepartments);
      }
      // Only update state if data has changed
      setDepartmentsData((prev) => {
        const prevIds = prev.map(d => d.id).join(',');
        const newIds = filteredDepartments.map(d => d.id).join(',');
        if (prevIds !== newIds) {
          return filteredDepartments;
        }
        return prev;
      });
    }
  }, [departments, error, handleNonPermissionError, branchId]);

  const filteredData = useMemo(() => {
    const keyword = searchText.toLowerCase();
    return departmentsData.filter(
      (item) =>
        item?.name?.toLowerCase()?.includes(keyword)
    );
  }, [departmentsData, searchText]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      const name = formData.name?.trim();
      if (!name || name.length < 3) {
        message.error('Tên phòng ban phải có ít nhất 3 ký tự!');
        return;
      }
      if (name.length > 100) {
        message.error('Tên phòng ban không được vượt quá 100 ký tự!');
        return;
      }
      if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
        message.error('Tên phòng ban chỉ được chứa chữ cái, số và khoảng trắng!');
        return;
      }

      if (formData.id) {
        const payload = { name };
        if (environment.features.enableLogging) {
          console.log('🔍 Sending update department:', { deptId: formData.id, payload });
        }
        await updateDepartmentMutation.mutateAsync({ deptId: formData.id, deptData: payload, branchId });
        message.success('Cập nhật phòng ban thành công');
        handleEditCancel();
      } else {
        const payload = { name, branchId: parseInt(branchId) };
        if (environment.features.enableLogging) {
          console.log('🔍 Sending create department:', { payload });
        }
        await createDepartmentMutation.mutateAsync({ deptData: payload, branchId });
        message.success('Tạo phòng ban thành công');
        handleCreateCancel();
      }
      setSelectedDepartment(null);
    } catch (error) {
      console.error('Failed to save department:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
      message.error(error.response?.data?.message || 'Lỗi khi lưu phòng ban!');
    }
  };

  const handleEdit = (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể chỉnh sửa phòng ban từ chi nhánh khác!');
      return;
    }
    setSelectedDepartment(record);
    showEditModal();
  };

  const handleDelete = async (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể xóa phòng ban từ chi nhánh khác!');
      return;
    }
    try {
      await deleteDepartmentMutation.mutateAsync({ deptId: record.id, branchId });
      message.success('Xóa phòng ban thành công');
    } catch (error) {
      console.error('Failed to delete department:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
      message.error(error.response?.data?.message || 'Lỗi khi xóa phòng ban!');
    }
  };

  const handleRefresh = () => {
    refetch();
    message.success('Đã làm mới danh sách phòng ban');
  };

  const handleAdd = () => {
    setSelectedDepartment(null);
    showCreateModal();
  };

  const isLoading =
    departmentsLoading ||
    createDepartmentMutation.isPending ||
    updateDepartmentMutation.isPending ||
    deleteDepartmentMutation.isPending;

  return (
    <DepartmentsPageWithWrapper
      title="Quản Lý Phòng Ban"
      onAdd={handleAdd}
      onRefresh={handleRefresh}
      loading={isLoading}
      addButtonText="Thêm"
      refreshButtonText="Làm mới"
      showAddButton={true}
      showRefreshButton={true}
      showSearch={true}
      searchProps={{
        value: searchText,
        onChange: (e) => setSearchText(e.target.value),
        placeholder: 'Tìm kiếm phòng ban',
      }}
      departmentsData={departmentsData}
      filteredData={filteredData}
      onEdit={handleEdit}
      onDelete={handleDelete}
      createModalProps={{ open: createOpen, handleCancel: handleCreateCancel }}
      editModalProps={{ open: editOpen, handleCancel: handleEditCancel, formData: memoizedSelectedDepartment }}
      onCreateOrUpdate={handleCreateOrUpdate}
      branchId={branchId}
    />
  );
};

export default DepartmentsPage;