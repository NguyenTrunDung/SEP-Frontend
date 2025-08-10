import React, { useState, useMemo } from 'react';
import { Collapse, Button, Tooltip, Popconfirm } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CaretRightOutlined,
} from '@ant-design/icons';
import PropTypes from 'prop-types';
import './Location.css';

const { Panel } = Collapse;

const LocationsTable = ({
  dataSource,
  loading,
  onEdit,
  onDelete,
  branchId,
  areas,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const areasWithLocations = useMemo(() => {
    const areaIds = new Set(dataSource.map((item) => String(item.areaId)));
    return areas.filter((area) => areaIds.has(String(area.id)));
  }, [dataSource, areas]);

  const total = dataSource.length;
  const totalPages = Math.ceil(total / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return dataSource.slice(start, start + pageSize);
  }, [dataSource, currentPage, pageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleChangePageSize = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="location-wrapper">
      <div className="list-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="area-id" />
          <span>TÊN CHI NHÁNH</span>
        </div>
      </div>

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
                              onClick={() => onEdit(item)}
                              disabled={String(item.branchId) !== String(branchId)}
                            />
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <Popconfirm
                              title="Xóa vị trí"
                              description={`Bạn có chắc chắn muốn xóa vị trí ${item.name}?`}
                              onConfirm={() => onDelete(item)}
                              okText="Xóa"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                              disabled={String(item.branchId) !== String(branchId)}
                            >
                              <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                danger
                                disabled={String(item.branchId) !== String(branchId)}
                              />
                            </Popconfirm>
                          </Tooltip>
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
    </div>
  );
};

LocationsTable.propTypes = {
  dataSource: PropTypes.arrayOf(
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
  branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  areas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

export default LocationsTable;