import React, { useState, useEffect, useMemo } from 'react';
import { message, Collapse, Select, Input, Button } from 'antd';
import { withPageWrapperV2 } from '../../../components/common/PageWrapperV2';
import LocationsTable from './LocationsTable';
import CreateLocation from './CreateLocation';
import EditLocation from './EditLocation';
import { useAntModal } from '../../../hooks/useAntModal';
import {
  useLocations,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
} from '../../../hooks/queries/useLocations';
import { areaService } from '../../../services/areaService';
import { useGlobalErrorHandler } from '../../../hooks/useGlobalErrorHandler';
import { environment } from '../../../services/api/config';
import PropTypes from 'prop-types';
import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

const LocationsPageContent = ({
  locationsData,
  filteredData,
  loading,
  onEdit,
  onDelete,
  createModalProps,
  editModalProps,
  onCreateOrUpdate,
  branchId,
  areas,
  filters,
  onFilterChange,
  searchText,
  onSearchChange,
}) => (
  <>
    <LocationsTable
      dataSource={filteredData}
      loading={loading}
      onEdit={onEdit}
      onDelete={onDelete}
      branchId={branchId}
      areas={areas}
    />
    <CreateLocation
      open={createModalProps.open}
      onCancel={createModalProps.handleCancel}
      onSubmit={onCreateOrUpdate}
      branchId={branchId}
      areas={areas}
    />
    <EditLocation
      open={editModalProps.open}
      onCancel={editModalProps.handleCancel}
      onSubmit={onCreateOrUpdate}
      formData={editModalProps.formData}
      branchId={branchId}
      areas={areas}
    />
  </>
);

LocationsPageContent.propTypes = {
  locationsData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      roomNumber: PropTypes.string,
      areaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ),
  filteredData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      roomNumber: PropTypes.string,
      areaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
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
  areas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  filters: PropTypes.object,
  onFilterChange: PropTypes.func,
  searchText: PropTypes.string,
  onSearchChange: PropTypes.func,
};

const LocationsPageWithWrapper = withPageWrapperV2(LocationsPageContent);

const LocationsPage = () => {
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';
  const { open: createOpen, showModal: showCreateModal, handleCancel: handleCreateCancel } = useAntModal();
  const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();
  const { handleNonPermissionError } = useGlobalErrorHandler();
  const { locations, isLoading: isFetchingLocations, error, refetch, isRefetching } = useLocations(null, branchId);
  const createLocationMutation = useCreateLocation();
  const updateLocationMutation = useUpdateLocation();
  const deleteLocationMutation = useDeleteLocation();
  const [locationsData, setLocationsData] = useState([]);
  const [areas, setAreas] = useState([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ areaId: undefined });

  useEffect(() => {
    if (error) {
      handleNonPermissionError(error, 'Không thể tải danh sách vị trí.');
      setLocationsData([]);
    } else if (Array.isArray(locations)) {
      const filteredLocations = locations.filter((loc) => String(loc.branchId) === String(branchId));
      setLocationsData(filteredLocations);
    } else {
      setLocationsData([]);
    }
  }, [locations, error, handleNonPermissionError, branchId]);

  useEffect(() => {
    const fetchAllAreas = async () => {
      setIsLoadingAreas(true);
      try {
        const response = await areaService.getAreas(branchId);
        const fetchedAreas = response.data || [];
        setAreas(fetchedAreas);
        if (fetchedAreas.length === 0) {
          message.warning('Không tìm thấy khu vực nào cho chi nhánh này!');
        }
      } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách khu vực:', error);
        message.error('Không thể tải danh sách khu vực!');
      } finally {
        setIsLoadingAreas(false);
      }
    };
    fetchAllAreas();
  }, [branchId]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(locationsData)) return [];
    const keyword = searchText.toLowerCase();
    return locationsData.filter((item) => {
      const name = item?.name?.toLowerCase?.() || '';
      const room = item?.roomNumber?.toLowerCase?.() || '';
      const matchesKeyword = name.includes(keyword) || room.includes(keyword);
      const matchesArea = filters.areaId ? String(item.areaId) === String(filters.areaId) : true;
      return matchesKeyword && matchesArea;
    });
  }, [locationsData, searchText, filters.areaId]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      const name = formData.name?.trim();
      if (!name || name.length < 3) {
        message.error('Tên vị trí phải có ít nhất 3 ký tự!');
        return;
      }
      if (name.length > 100) {
        message.error('Tên vị trí không được vượt quá 100 ký tự!');
        return;
      }
      if (!/^[\p{L}0-9\s\-_,()./\\&]+$/u.test(name)) {
        message.error('Tên vị trí chỉ được chứa chữ cái, số và các ký tự đặc biệt (- _ , . ( ) / \\ &)');
        return;
      }
      if (!formData.areaId) {
        message.error('Khu vực không được để trống!');
        return;
      }

      const payload = {
        name,
        description: '',
        roomNumber: formData.roomNumber?.trim() || '',
        capacity: 0,
        sort: 0,
        isActive: true,
        areaId: parseInt(formData.areaId, 10),
        branchId: parseInt(branchId, 10),
      };

      if (formData.id) {
        await updateLocationMutation.mutateAsync({
          locationId: formData.id,
          locationData: payload,
          branchId,
          areaId: formData.areaId,
        });
        message.success('Cập nhật vị trí thành công');
        handleEditCancel();
      } else {
        await createLocationMutation.mutateAsync({
          locationData: payload,
          branchId,
          areaId: formData.areaId,
        });
        message.success('Tạo vị trí thành công');
        handleCreateCancel();
      }
      setSelectedLocation(null);
      await refetch();
    } catch (error) {
      console.error('❌ Lỗi khi lưu vị trí:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
      message.error(error.response?.data?.message || 'Lỗi khi lưu vị trí!');
    }
  };

  const handleEdit = (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể chỉnh sửa vị trí từ chi nhánh khác!');
      return;
    }
    setSelectedLocation(record);
    showEditModal();
  };

  const handleDelete = async (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể xóa vị trí từ chi nhánh khác!');
      return;
    }
    try {
      await deleteLocationMutation.mutateAsync({ locationId: record.id, branchId });
      message.success('Xóa vị trí thành công');
      await refetch();
    } catch (error) {
      console.error('❌ Lỗi khi xóa vị trí:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
      message.error(error.response?.data?.message || 'Lỗi khi xóa vị trí!');
    }
  };

  const handleRefresh = () => {
    refetch();
    setSearchText('');
    setFilters({ areaId: undefined });
    message.success('Đã làm mới danh sách vị trí');
  };

  const handleAdd = () => {
    setSelectedLocation(null);
    showCreateModal();
  };

  const isCombinedLoading =
    isFetchingLocations ||
    isLoadingAreas ||
    createLocationMutation.isPending ||
    updateLocationMutation.isPending ||
    deleteLocationMutation.isPending ||
    isRefetching;

  return (
    <LocationsPageWithWrapper
      title="Danh mục vị trí"
      onAdd={handleAdd}
      onRefresh={handleRefresh}
      loading={isCombinedLoading}
      addButtonText="Thêm"
      refreshButtonText="Làm mới"
      showAddButton={true}
      showRefreshButton={true}
      showSearch={true}
      searchProps={{
        value: searchText,
        onChange: (e) => setSearchText(e.target.value),
        placeholder: 'Tìm kiếm vị trí hoặc số phòng',
      }}
      filterProps={{
        fields: [
          {
            name: 'areaId',
            type: 'select',
            label: 'Lọc theo khu vực',
            options: areas.map((area) => ({
              value: area.id,
              label: area.name,
            })),
            allowClear: true,
          },
        ],
        filters,
        onChange: (newFilters) => setFilters(newFilters),
      }}
      locationsData={locationsData}
      filteredData={filteredData}
      onEdit={handleEdit}
      onDelete={handleDelete}
      createModalProps={{ open: createOpen, handleCancel: handleCreateCancel }}
      editModalProps={{
        open: editOpen,
        handleCancel: handleEditCancel,
        formData: selectedLocation,
      }}
      onCreateOrUpdate={handleCreateOrUpdate}
      branchId={branchId}
      areas={areas}
      filters={filters}
      onFilterChange={(newFilters) => setFilters(newFilters)}
      searchText={searchText}
      onSearchChange={(e) => setSearchText(e.target.value)}
    />
  );
};

export default LocationsPage;