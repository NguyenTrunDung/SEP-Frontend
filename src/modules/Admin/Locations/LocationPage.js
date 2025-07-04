import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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
import './Location.css';

const LocationsPageContent = ({
  locationsData,
  loading,
  onEdit,
  onDelete,
  addModalProps,
  editModalProps,
  onCreateOrUpdate,
  onRefresh,
  branchId,
  areas,
}) => (
  <>
    <LocationsTable
      dataSource={locationsData}
      loading={loading}
      onEdit={onEdit}
      onDelete={onDelete}
      branchId={branchId}
      onRefresh={onRefresh}
      onCreateOrUpdate={onCreateOrUpdate}
      areas={areas}
    />
    <CreateLocation
      open={addModalProps.open}
      onCancel={addModalProps.handleCancel}
      onSubmit={onCreateOrUpdate}
      branchId={branchId}
    />
    <EditLocation
      open={editModalProps.open}
      onCancel={editModalProps.handleCancel}
      onSubmit={onCreateOrUpdate}
      formData={editModalProps.formData}
      branchId={branchId}
    />
  </>
);

const LocationsPage = () => {
  const { open: addOpen, showModal: showAddModal, handleCancel: handleAddCancel } = useAntModal();
  const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();
  const { handleNonPermissionError } = useGlobalErrorHandler();
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';
  const [locationsData, setLocationsData] = useState([]);
  const [areas, setAreas] = useState([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);

  const { locations, isLoading, error, refetch } = useLocations(null, branchId); // Không truyền areaId để lấy tất cả
  const createLocationMutation = useCreateLocation();
  const updateLocationMutation = useUpdateLocation();
  const deleteLocationMutation = useDeleteLocation();

  useEffect(() => {
    if (Array.isArray(locations)) {
      setLocationsData(locations);
    } else {
      setLocationsData([]);
    }
  }, [locations, branchId]);

  useEffect(() => {
    const fetchAllAreas = async () => {
      setIsLoadingAreas(true);
      try {
        const response = await areaService.getAreas(branchId);
        setAreas(response.data || []);
        if ((response.data || []).length === 0) {
          message.warning('Không tìm thấy khu vực nào cho chi nhánh này!');
        }
      } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách area:', error);
        message.error('Không thể tải danh sách khu vực!');
      } finally {
        setIsLoadingAreas(false);
      }
    };
    fetchAllAreas();
  }, [branchId]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (!formData.areaId) throw new Error('Khu vực không được để trống!');

      const payload = {
        name: formData.name.trim(),
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
        handleAddCancel();
      }
      refetch();
    } catch (error) {
      console.error('❌ Lỗi khi lưu vị trí:', error);
      message.error(error.response?.data?.message || 'Lỗi khi lưu vị trí!');
    }
  };

  const handleEdit = (record) => {
    showEditModal();
    handleEditCancel(record);
  };

  const handleDelete = async (record) => {
    try {
      await deleteLocationMutation.mutateAsync(record.id);
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi xóa vị trí!');
    }
  };

  const handleRefresh = () => {
    refetch();
    message.success('Đã làm mới danh sách vị trí');
  };

  return (
    <LocationsPageContent
      locationsData={locationsData}
      loading={isLoading || isLoadingAreas}
      branchId={branchId}
      areas={areas}
      onEdit={handleEdit}
      onDelete={handleDelete}
      addModalProps={{ open: addOpen, handleCancel: handleAddCancel }}
      editModalProps={{ open: editOpen, handleCancel: handleEditCancel, formData: null }}
      onCreateOrUpdate={handleCreateOrUpdate}
      onRefresh={handleRefresh}
    />
  );
};

export default LocationsPage;