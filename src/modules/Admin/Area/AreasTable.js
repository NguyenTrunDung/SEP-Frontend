import React, { useState, useEffect, useMemo } from 'react';
import { Input, Button, Tooltip, Popconfirm, message } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import CreateArea from './CreateArea';
import EditArea from './EditArea';
import { useAntModal } from '../../../hooks/useAntModal';
import { useAreas, useCreateArea, useUpdateArea, useDeleteArea } from '../../../hooks/queries/useAreas';
import { useGlobalErrorHandler } from '../../../hooks/useGlobalErrorHandler';
import { environment } from '../../../services/api/config';
import './Area.css';

const AreasTable = () => {
  const [searchText, setSearchText] = useState('');
  const [areasData, setAreasData] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';

  // Modal controls
  const { open: addOpen, showModal: showAddModal, handleCancel: handleAddCancel } = useAntModal();
  const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();

  // API hooks
  const { areas, isLoading, error, refetch } = useAreas(branchId);
  const createAreaMutation = useCreateArea();
  const updateAreaMutation = useUpdateArea();
  const deleteAreaMutation = useDeleteArea();
  const { handleNonPermissionError } = useGlobalErrorHandler();

  // Handle data loading and errors
  useEffect(() => {
    if (error) {
      handleNonPermissionError(error, 'Không thể tải dữ liệu khu vực.');
      setAreasData([]);
    } else {
      // Filter areas to ensure only those matching the current branchId are displayed
      const filteredAreas = (areas || []).filter(area => String(area.branchId) === String(branchId));
      if (environment.features.enableLogging) {
        console.log(`🔍 AreasTable: Filtered areas for branch ${branchId}:`, filteredAreas);
      }
      setAreasData(filteredAreas);
    }
  }, [areas, error, handleNonPermissionError, branchId]);

  // Filter data based on search text
  const filteredData = useMemo(() => {
    return !searchText
      ? areasData
      : areasData.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
  }, [areasData, searchText]);

  // Handle create or update area
  const handleCreateOrUpdate = async (formData) => {
    try {
      const payload = { name: formData.name, branchId };
      if (formData.id) {
        await updateAreaMutation.mutateAsync({ areaId: formData.id, areaData: payload, branchId });
        message.success('Cập nhật khu vực thành công');
        handleEditCancel();
      } else {
        await createAreaMutation.mutateAsync({ areaData: payload, branchId });
        message.success('Tạo khu vực thành công');
        handleAddCancel();
      }
      refetch();
    } catch (error) {
      console.error('Failed to save area:', error);
      message.error(error.response?.data?.message || 'Lỗi khi lưu khu vực!');
    }
  };

  // Handle edit action
  const handleEdit = (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể chỉnh sửa khu vực từ chi nhánh khác!');
      return;
    }
    setSelectedArea(record);
    showEditModal();
  };

  // Handle delete action
  const handleDelete = async (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể xóa khu vực từ chi nhánh khác!');
      return;
    }
    try {
      await deleteAreaMutation.mutateAsync({ areaId: record.id, branchId });
      message.success('Xóa khu vực thành công');
      refetch();
    } catch (error) {
      console.error('Failed to delete area:', error);
      message.error(error.response?.data?.message || 'Lỗi khi xóa khu vực!');
    }
  };

  // Handle refresh action
  const handleRefresh = () => {
    refetch();
    message.success('Đã làm mới danh sách khu vực');
  };

  return (
    <div className="area-wrapper">
      <div className="area-header">
        <h2 className="area-title">Danh mục khu vực</h2>
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
        placeholder="Tìm kiếm khu vực"
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      <div className="list-header">TÊN KHU VỰC</div>
      <div className="area-list">
        {filteredData.map((item) => (
          <div className="area-item" key={item.id}>
            <span className="area-name">{item.name}</span>
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

      <div className="pagination-footer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
          <select className="page-size">
            <option value="10">10</option>
          </select>
          <div className="pagination">
            <Button type="text">{'<<'}</Button>
            <Button type="text">{'<'}</Button>
            <Button type="primary">1</Button>
            <Button type="text">{'>'}</Button>
            <Button type="text">{'>>'}</Button>
          </div>
        </div>
        <span>Hiển thị từ 1 đến {filteredData.length} trong tổng số {filteredData.length}</span>
      </div>

      <CreateArea
        open={addOpen}
        onCancel={handleAddCancel}
        onSubmit={handleCreateOrUpdate}
        branchId={branchId}
      />
      <EditArea
        open={editOpen}
        onCancel={handleEditCancel}
        onSubmit={handleCreateOrUpdate}
        formData={selectedArea}
        branchId={branchId}
      />
    </div>
  );
};

export default AreasTable;