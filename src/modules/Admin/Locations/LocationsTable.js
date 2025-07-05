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
  CaretRightOutlined,
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
  onRefresh,
  onCreateOrUpdate,
  areas,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const [editingLocation, setEditingLocation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const areasWithLocations = useMemo(() => {
    const areaIds = new Set(dataSource.map((item) => String(item.areaId)));
    return areas.filter((area) => areaIds.has(String(area.id)));
  }, [dataSource, areas]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(dataSource)) return [];
    const keyword = searchText.toLowerCase();
    return dataSource.filter((item) => {
      const name = item?.name?.toLowerCase?.() || '';
      const room = item?.roomNumber?.toLowerCase?.() || '';
      const matchesKeyword = name.includes(keyword) || room.includes(keyword);
      const matchesArea = selectedArea ? String(item.areaId) === String(selectedArea) : true;
      return matchesKeyword && matchesArea;
    });
  }, [dataSource, searchText, selectedArea]);

  const total = filteredData.length;
  const totalPages = Math.ceil(total / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleChangePageSize = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

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
      {/* Header */}
      <div className="location-header">
        <h2 className="location-title">Danh mục vị trí</h2>
        <div>
          <Button icon={<ReloadOutlined />} onClick={onRefresh} style={{ marginRight: 8 }}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Thêm
          </Button>
        </div>
      </div>

      {/* Search + Filter */}
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
            <Option key={id} value={id}>
              {name}
            </Option>
          ))}
        </Select>
      </div>

      {/* Label row */}
      <div className="list-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="area-id" />
          <span>TÊN CHI NHÁNH</span>
        </div>
      </div>

      {/* Data */}
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          {paginatedData.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: 32, color: '#999' }}>
              Không tìm thấy danh mục vị trí.
            </div>
          ) : (
            <Collapse
              bordered={false}
              expandIconPosition="left"
              expandIcon={({ isActive }) => (
                <CaretRightOutlined rotate={isActive ? 90 : 0} style={{ color: '#00A99D' }} />
              )}
              style={{ background: '#fff' }}
            >
              {areasWithLocations.map((area) => {
                const locations = paginatedData.filter(
                  (loc) => String(loc.areaId) === String(area.id)
                );
                if (locations.length === 0) return null;
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
          )}
        </>
      )}

      {/* Pagination luôn hiển thị */}
      <div
        className="pagination-footer"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 8,
          marginTop: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <select className="page-size" value={pageSize} onChange={handleChangePageSize}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <div className="pagination">
            <Button type="text" onClick={() => handlePageChange(1)} disabled={currentPage === 1 || total === 0}>
              {'<<'}
            </Button>
            <Button
              type="text"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || total === 0}
            >
              {'<'}
            </Button>
            <Button type="primary" disabled={total === 0}>{currentPage}</Button>
            <Button
              type="text"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || total === 0}
            >
              {'>'}
            </Button>
            <Button
              type="text"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || total === 0}
            >
              {'>>'}
            </Button>
          </div>
        </div>
        <span>
          Hiển thị từ {total === 0 ? 0 : (currentPage - 1) * pageSize + 1} đến{' '}
          {Math.min(currentPage * pageSize, total)} trong tổng số {total}
        </span>
      </div>

      {/* Modals */}
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
