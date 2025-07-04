import React, { useState, useEffect, useMemo } from 'react';
import {
  Input,
  Button,
  Tooltip,
  Popconfirm,
  message,
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import CreateArea from './CreateArea';
import EditArea from './EditArea';
import { useAntModal } from '../../../hooks/useAntModal';
import {
  useAreas,
  useCreateArea,
  useUpdateArea,
  useDeleteArea,
} from '../../../hooks/queries/useAreas';
import { useGlobalErrorHandler } from '../../../hooks/useGlobalErrorHandler';
import { environment } from '../../../services/api/config';
import './Area.css';

const AreasTable = () => {
  const [searchText, setSearchText] = useState('');
  const [areasData, setAreasData] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const branchId = environment.multiTenant.getCurrentBranchId() || '1';

  const { open: addOpen, showModal: showAddModal, handleCancel: handleAddCancel } = useAntModal();
  const { open: editOpen, showModal: showEditModal, handleCancel: handleEditCancel } = useAntModal();

  const { areas, isLoading, error, refetch } = useAreas(branchId);
  const createAreaMutation = useCreateArea();
  const updateAreaMutation = useUpdateArea();
  const deleteAreaMutation = useDeleteArea();
  const { handleNonPermissionError } = useGlobalErrorHandler();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (error) {
      handleNonPermissionError(error, 'Không thể tải dữ liệu khu vực.');
      setAreasData([]);
    } else {
      const filtered = (areas || []).filter(area => String(area.branchId) === String(branchId));
      if (environment.features.enableLogging) {
        console.log(`🔍 AreasTable: Filtered areas for branch ${branchId}:`, filtered);
      }
      setAreasData(filtered);
    }
  }, [areas, error, handleNonPermissionError, branchId]);

  const filteredData = useMemo(() => {
    return searchText
      ? areasData.filter((item) =>
          item.name.toLowerCase().includes(searchText.toLowerCase())
        )
      : areasData;
  }, [areasData, searchText]);

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
      message.error(error?.response?.data?.message || 'Lỗi khi lưu khu vực!');
    }
  };

  const handleEdit = (record) => {
    if (String(record.branchId) !== String(branchId)) {
      message.error('Không thể chỉnh sửa khu vực từ chi nhánh khác!');
      return;
    }
    setSelectedArea(record);
    showEditModal();
  };

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
      message.error(error?.response?.data?.message || 'Lỗi khi xóa khu vực!');
    }
  };

  const handleRefresh = () => {
    refetch();
    message.success('Đã làm mới danh sách khu vực');
  };

  return (
    <div className="area-wrapper">
      {/* Header */}
      <div className="area-header">
        <h2 className="area-title">Danh mục khu vực</h2>
        <div>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} style={{ marginRight: 8 }}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Thêm
          </Button>
        </div>
      </div>

      {/* Search */}
      <Input
        className="search-input"
        placeholder="Tìm kiếm khu vực"
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      {/* List */}
      <div className="list-header">TÊN KHU VỰC</div>
      {isLoading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          {paginatedData.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: 32, color: '#999' }}>
              Không tìm thấy khu vực nào.
            </div>
          ) : (
            <div className="area-list">
              {paginatedData.map((item) => (
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
          )}
        </>
      )}

      {/* Pagination - Luôn hiển thị */}
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
