import React, { useState, useMemo } from 'react';
import { Input, Button, Tooltip, Popconfirm } from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import './DiseaseCategory.css';

const DiseaseCategoriesTable = ({ data, loading, onEdit, onDelete, onRefresh, onAdd }) => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredData = useMemo(() => {
    return !searchText
      ? data
      : data.filter((item) =>
          item.diseaseCategoryName?.toLowerCase().includes(searchText.toLowerCase())
        );
  }, [data, searchText]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const total = filteredData.length;
  const totalPages = Math.ceil(total / pageSize);

  const handleChangePageSize = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="disease-category-wrapper">
      <div className="disease-category-header">
        <h2 className="disease-category-title">Danh mục bệnh</h2>
        <div>
          <Button icon={<ReloadOutlined />} onClick={onRefresh} style={{ marginRight: 8 }}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            Thêm
          </Button>
        </div>
      </div>

      <Input
        placeholder="Tìm kiếm danh mục bệnh"
        prefix={<SearchOutlined />}
        value={searchText}
        style={{ width: 300 }}
        onChange={(e) => {
          setSearchText(e.target.value);
          setCurrentPage(1);
        }}
      />

      <div className="list-header">TÊN BỆNH</div>

      {loading ? (
        <div>Đang tải...</div>
      ) : filteredData.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: 32, color: '#999' }}>
          Không tìm thấy danh mục bệnh.
        </div>
      ) : (
        <div className="disease-category-list">
          {paginatedData.map((item) => (
            <div className="disease-category-item" key={item.id}>
              <span className="disease-category-name">{item.diseaseCategoryName}</span>
              <div className="actions">
                <Tooltip title="Chỉnh sửa">
                  <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(item)} />
                </Tooltip>
                <Popconfirm
                  title={`Xoá ${item.diseaseCategoryName}?`}
                  onConfirm={() => onDelete(item)}
                >
                  <Button type="text" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
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
    </div>
  );
};

export default DiseaseCategoriesTable;
