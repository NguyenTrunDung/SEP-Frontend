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
  areaId,
  areas,
}) => (
  <>
    <LocationsTable
      dataSource={locationsData}
      loading={loading}
      onEdit={onEdit}
      onDelete={onDelete}
      branchId={branchId}
      areaId={areaId}
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
      areaId={areaId}
    />
  </>
);

const LocationsPage = ({ areaId }) => {
  const { open: addOpen, showModal: showAddModal, handleCancel: handleAddCancel } = useAntModal();
  const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();
  const { handleNonPermissionError } = useGlobalErrorHandler();
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';
  const [normalizedAreaId, setNormalizedAreaId] = useState(areaId ? String(areaId) : null);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [locationsData, setLocationsData] = useState([]);
  const [areas, setAreas] = useState([]);

  const { locations, isLoading, error, refetch } = useLocations(normalizedAreaId, branchId);
  const createLocationMutation = useCreateLocation();
  const updateLocationMutation = useUpdateLocation();
  const deleteLocationMutation = useDeleteLocation();

  useEffect(() => {
    if (Array.isArray(locations)) {
      setLocationsData(locations);
    } else {
      setLocationsData([]);
    }
  }, [locations, branchId, normalizedAreaId]);

  useEffect(() => {
    const fetchDefaultArea = async () => {
      if (!areaId && !normalizedAreaId) {
        setIsLoadingAreas(true);
        try {
          const response = await areaService.getAreas(branchId);
          const areasList = response.data || [];
          setAreas(areasList);
          if (areasList.length > 0) {
            setNormalizedAreaId(String(areasList[0].id));
          } else {
            message.warning('Không tìm thấy khu vực nào cho chi nhánh này!');
          }
        } catch (error) {
          message.error('Không thể tải danh sách khu vực!');
        } finally {
          setIsLoadingAreas(false);
        }
      }
    };
    fetchDefaultArea();
  }, [areaId, branchId, normalizedAreaId]);

  useEffect(() => {
    const fetchAllAreas = async () => {
      try {
        const response = await areaService.getAreas(branchId);
        setAreas(response.data || []);
      } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách area:', error);
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
    if (!normalizedAreaId) {
      message.error('Vui lòng cung cấp khu vực hợp lệ để làm mới danh sách!');
      return;
    }
    refetch();
    message.success('Đã làm mới danh sách vị trí');
  };

  return (
    <LocationsPageContent
      locationsData={locationsData}
      loading={isLoading}
      branchId={branchId}
      areaId={normalizedAreaId}
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
