import React, { useState, useEffect, useMemo } from 'react';
import { message } from 'antd';
import { withPageWrapperV2 } from '../../../components/common/PageWrapperV2';
import DepartmentsTable from './DepartmentsTable';
import CreateDepartment from './CreateDepartment';
import EditDepartment from './EditDepartment';
import { useAntModal } from '../../../hooks/useAntModal';
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  useLocationsForBranch,
} from '../../../hooks/queries/useDepartments';
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
  locations,
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
      initialValues={{ locations }}
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
      locationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      locationName: PropTypes.string,
      branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ),
  filteredData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      locationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      locationName: PropTypes.string,
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
  locations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

const DepartmentsPageWithWrapper = withPageWrapperV2(DepartmentsPageContent);

const DepartmentsPage = () => {
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';
  const { open: createOpen, showModal: showCreateModal, handleCancel: handleCreateCancel } = useAntModal();
  const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();
  const { handleNonPermissionError } = useGlobalErrorHandler();
  const { departments, isLoading: departmentsLoading, error, refetch, isRefetching } = useDepartments(branchId);
  const { locations, isLoading: locationsLoading } = useLocationsForBranch(branchId);
  const createDepartmentMutation = useCreateDepartment();
  const updateDepartmentMutation = useUpdateDepartment();
  const deleteDepartmentMutation = useDeleteDepartment();
  const [departmentsData, setDepartmentsData] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ locationId: undefined }); // Thêm state cho filters
  const memoizedSelectedDepartment = useMemo(() => selectedDepartment, [selectedDepartment]);

  useEffect(() => {
    if (error) {
      handleNonPermissionError(error, 'Không thể tải dữ liệu phòng ban.');
      setDepartmentsData([]);
    } else if (departments && locations) {
      const filtered = departments.filter(dept => String(dept.branchId) === String(branchId));
      const enrichedData = filtered.map(dept => {
        const location = locations.find(loc => String(loc.id) === String(dept.locationId));
        return {
          ...dept,
          locationName: location ? location.name : 'N/A',
        };
      });
      setDepartmentsData(enrichedData);
    }
  }, [departments, locations, error, handleNonPermissionError, branchId]);

  const filteredData = useMemo(() => {
    const keyword = searchText.toLowerCase();
    return departmentsData.filter((item) => {
      const matchesKeyword =
        item?.name?.toLowerCase()?.includes(keyword) ||
        item?.locationName?.toLowerCase()?.includes(keyword);
      const matchesLocation = filters.locationId
        ? String(item.locationId) === String(filters.locationId)
        : true;
      return matchesKeyword && matchesLocation;
    });
  }, [departmentsData, searchText, filters.locationId]);

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
      if (!formData.locationId) {
        message.error('Vui lòng chọn vị trí!');
        return;
      }
      if (!/^[\p{L}0-9\s\-_,()./\\&]+$/u.test(name)) {
        message.error('Tên phòng ban chỉ được chứa chữ cái, số và các ký tự đặc biệt (- _ , . ( ) / \\ &)');
        return;
      }
      if (formData.id) {
        const payload = {
          name,
          locationId: Number(formData.locationId),
          branchId: Number(branchId),
        };
        await updateDepartmentMutation.mutateAsync({
          deptId: formData.id,
          deptData: payload,
          branchId,
        });
        message.success('Cập nhật phòng ban thành công');
        handleEditCancel();
        await refetch();
      } else {
        const payload = {
          name,
          locationId: Number(formData.locationId),
          branchId: Number(branchId),
        };
        await createDepartmentMutation.mutateAsync({ deptData: payload, branchId });
        message.success('Tạo phòng ban thành công');
        handleCreateCancel();
        await refetch();
      }
      setSelectedDepartment(null);
    } catch (error) {
      console.error('🛑 Failed to save department:', {
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
      await refetch();
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
    setFilters({ locationId: undefined }); // Reset filter khi làm mới
    setSearchText(''); // Reset search khi làm mới
    message.success('Đã làm mới danh sách phòng ban');
  };

  const handleAdd = () => {
    setSelectedDepartment(null);
    showCreateModal();
  };

  const isLoading =
    departmentsLoading ||
    locationsLoading ||
    createDepartmentMutation.isPending ||
    updateDepartmentMutation.isPending ||
    deleteDepartmentMutation.isPending ||
    isRefetching;

  // Cấu hình filterProps cho dropdown Location
  const filterProps = {
    fields: [
      {
        name: 'locationId',
        type: 'select',
        label: 'Lọc theo vị trí',
        options: locations.map(loc => ({
          value: loc.id,
          label: loc.name,
        })),
      },
    ],
    filters,
    onChange: (newFilters) => setFilters(newFilters),
  };

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
        placeholder: 'Tìm kiếm phòng ban hoặc vị trí',
      }}
      filterProps={filterProps} // Thêm filterProps
      departmentsData={departmentsData}
      filteredData={filteredData}
      onEdit={handleEdit}
      onDelete={handleDelete}
      createModalProps={{ open: createOpen, handleCancel: handleCreateCancel }}
      editModalProps={{
        open: editOpen,
        handleCancel: handleEditCancel,
        formData: memoizedSelectedDepartment,
      }}
      onCreateOrUpdate={handleCreateOrUpdate}
      branchId={branchId}
      locations={locations}
    />
  );
};

export default DepartmentsPage;