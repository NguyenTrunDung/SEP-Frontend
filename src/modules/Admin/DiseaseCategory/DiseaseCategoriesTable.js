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

  const filteredData = useMemo(() => {
    return !searchText
      ? data
      : data.filter((item) =>
          item.name?.toLowerCase().includes(searchText.toLowerCase())
        );
  }, [data, searchText]);

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
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 300, marginBottom: 16 }}
      />

      <div className="list-header">TÊN BỆNH</div>

      {loading ? (
        <div>Đang tải...</div>
      ) : filteredData.length === 0 ? (
        <div>Không tìm thấy danh mục bệnh.</div>
      ) : (
        <div className="disease-category-list">
          {filteredData.map((item) => (
            <div className="disease-category-item" key={item.id}>
              <span className="disease-category-name">{item.name}</span>
              <div className="actions">
                <Tooltip title="Chỉnh sửa">
                  <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(item)} />
                </Tooltip>
                <Popconfirm title={`Xoá ${item.name}?`} onConfirm={() => onDelete(item)}>
                  <Button type="text" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      )}

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
          </div>
        </div>
        <span>
          Hiển thị từ 1 đến {filteredData.length} trong tổng số {filteredData.length}
        </span>
      </div>
    </div>
  );
};

export default DiseaseCategoriesTable;
