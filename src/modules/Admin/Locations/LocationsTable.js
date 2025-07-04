import React, { useState, useMemo } from 'react';
import { Input, Button, Tooltip, Popconfirm, message, Collapse, Select } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined, CaretRightOutlined } from '@ant-design/icons';
import CreateLocation from './CreateLocation';
import EditLocation from './EditLocation';
import { useAntModal } from '../../../hooks/useAntModal';
import './Location.css';

const { Panel } = Collapse;
const { Option } = Select;

const LocationsTable = ({
  dataSource,
  loading,
  onEdit,
  onDelete,
  branchId,
  onRefresh,
  onCreateOrUpdate,
  areas,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const { open: addOpen, showModal: showAddModal, handleCancel: handleAddCancel } = useAntModal();
  const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();
  const [editingLocation, setEditingLocation] = useState(null);

  // Get list of areaIds with locations
  const areasWithLocations = useMemo(() => {
    const areaIds = [...new Set(dataSource.map((item) => String(item.areaId)))];
    return areas.filter((area) => areaIds.includes(String(area.id)));
  }, [dataSource, areas]);

  // Filter data based on search text and selected area
  const filteredData = useMemo(() => {
    if (!Array.isArray(dataSource)) return [];
    const keyword = searchText.toLowerCase();
    return dataSource.filter((item) => {
      const name = item?.name?.toLowerCase?.() || '';
      const roomNumber = item?.roomNumber?.toLowerCase?.() || '';
      const matchesKeyword = name.includes(keyword) || roomNumber.includes(keyword);
      const matchesArea = selectedArea ? String(item.areaId) === String(selectedArea) : true;
      return matchesKeyword && matchesArea;
    });
  }, [dataSource, searchText, selectedArea]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      await onCreateOrUpdate(formData);
      onRefresh();
      message.success('Lưu vị trí thành công!');
    } catch (error) {
      console.error('❌ Failed to save location:', error);
      message.error('Lỗi khi lưu vị trí!');
    }
  };

  return (
    <div className="location-wrapper">
      <div className="location-header">
        <h2 className="location-title">Danh mục vị trí</h2>
        <div>
          <Button
            className="refresh-btn"
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            style={{ marginRight: 8 }}
          >
            Làm mới
          </Button>
          <Button className="add-btn" type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Thêm
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Select
          placeholder="Khu vực"
          value={selectedArea}
          onChange={setSelectedArea}
          allowClear
          style={{ width: 300 }}
        >
          {areasWithLocations.map(({ id, name }) => (
            <Option key={id} value={id}>{name}</Option>
          ))}
        </Select>
      </div>

      <div className="list-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="area-id"></div> {/* Placeholder for areaId */}
          <span>TÊN CHI NHÁNH</span>
        </div>
      </div>

      <Collapse
        bordered={false}
        expandIconPosition="left"
        expandIcon={({ isActive }) => (
          <CaretRightOutlined
            rotate={isActive ? 90 : 0}
            style={{ color: '#00A99D' }}
          />
        )}
        style={{ background: '#fff' }}
      >
        {areasWithLocations.map((area) => {
          const locations = filteredData.filter((loc) => String(loc.areaId) === String(area.id));
          if (locations.length === 0) return null; // Skip areas with no locations
          return (
            <Panel
              key={area.id}
              header={
                <span style={{ fontWeight: 500, color: '#000' }}>
                  {area.name} ({locations.length})
                </span>
              }
            >
              {locations.map((item) => (
                <div key={item.id} className="location-row">
                  <span className="location-name">{item.name}</span>
                  <div className="actions">
                    <Tooltip title="Chỉnh sửa">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setEditingLocation(item);
                          showEditModal();
                        }}
                      />
                    </Tooltip>
                    <Popconfirm
                      title={`Xóa ${item.name}?`}
                      onConfirm={() => onDelete(item)}
                    >
                      <Button type="text" icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                  </div>
                </div>
              ))}
            </Panel>
          );
        })}
      </Collapse>
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

      <CreateLocation
        open={addOpen}
        onCancel={handleAddCancel}
        onSubmit={handleCreateOrUpdate}
        branchId={branchId}
      />
      <EditLocation
        open={editOpen}
        onCancel={handleEditCancel}
        onSubmit={handleCreateOrUpdate}
        formData={editingLocation}
        branchId={branchId}
      />
    </div>
  );
};

export default LocationsTable;