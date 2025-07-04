import React, { useState, useMemo } from 'react';
import {
  Input,
  Button,
  Tooltip,
  Popconfirm,
  message,
  Collapse,
  Select,
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
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
  areaId,
  onRefresh,
  onCreateOrUpdate,
  areas,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const {
    open: addOpen,
    showModal: showAddModal,
    handleCancel: handleAddCancel,
  } = useAntModal();
  const {
    open: editOpen,
    showModal: showEditModal,
    handleCancel: handleEditCancel,
  } = useAntModal();
  const [editingLocation, setEditingLocation] = useState(null);

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
          className="search-input"
          placeholder="Tìm kiếm vị trí hoặc số phòng"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          className="area-select"
          placeholder="Chọn khu vực"
          value={selectedArea}
          onChange={setSelectedArea}
          allowClear
          style={{ width: 200 }}
        >
          {areas.map((area) => (
            <Option key={area.id} value={area.id}>
              {area.name}
            </Option>
          ))}
        </Select>
      </div><div className="list-header">TÊN CHI NHÁNH</div>

      <Collapse
        accordion
        bordered={false}
        expandIconPosition="left"
        style={{ background: '#fff' }}
      >
        {areas
          .filter((area) =>
            filteredData.some((loc) => String(loc.areaId) === String(area.id))
          )
          .map((area) => {
            const locations = filteredData.filter(
              (loc) => String(loc.areaId) === String(area.id)
            );
            return (
              <Panel
                key={area.id}
                header={
                  <span style={{ fontWeight: 500 }}>
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


      <CreateLocation
        open={addOpen}
        onCancel={handleAddCancel}
        onSubmit={handleCreateOrUpdate}
        branchId={branchId}
        areaId={areaId}
      />
      <EditLocation
        open={editOpen}
        onCancel={handleEditCancel}
        onSubmit={handleCreateOrUpdate}
        formData={editingLocation}
        branchId={branchId}
        areaId={areaId}
      />
    </div>
  );
};

export default LocationsTable;
