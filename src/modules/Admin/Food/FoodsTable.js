import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button, Input, Tooltip, Popconfirm, Modal, Descriptions, Spin, message, Select } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined, FilterOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import { FoodImage } from '../../../components/common/ImageDisplay';
import PropTypes from 'prop-types';
import { foodService } from '../../../services/foodService';
import * as XLSX from 'xlsx';
import { PERMISSIONS } from '../../../constants/permissions';

const FoodsTable = ({
  dataSource = [],
  loading,
  onEdit,
  onDelete,
  className,
  ...rest
}) => {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Debug log để kiểm tra dữ liệu món ăn
  useMemo(() => {
    console.log('🔍 Foods dataSource:', dataSource);
  }, [dataSource]);

  // Debounce search text to avoid excessive message notifications
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 1000);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText]);

  // Extract unique categories for filter dropdown
  const categoryOptions = useMemo(() => {
    const uniqueCategories = dataSource
      .map(item => item.category)
      .filter(category => category && category.id)
      .reduce((acc, category) => {
        if (!acc.find(c => c.id === category.id)) {
          acc.push(category);
        }
        return acc;
      }, [])
      .sort((a, b) => a.name.localeCompare(b.name));

    return [
      { value: null, label: 'Tất cả danh mục' },
      ...uniqueCategories.map(category => ({
        value: category.id,
        label: category.name
      }))
    ];
  }, [dataSource]);

  const filteredData = useMemo(() => {
    let filtered = dataSource;

    if (searchText) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedCategory !== null) {
      filtered = filtered.filter(item => item.category?.id === selectedCategory);
    }

    return filtered;
  }, [dataSource, searchText, selectedCategory]);

  useEffect(() => {
    if (debouncedSearchText && debouncedSearchText.trim()) {
      const searchResults = dataSource.filter(item => {
        let matches = item.name?.toLowerCase().includes(debouncedSearchText.toLowerCase());
        if (selectedCategory !== null) {
          matches = matches && item.category?.id === selectedCategory;
        }
        return matches;
      });
      // message.info(`Tìm kiếm: "${debouncedSearchText}" - ${searchResults.length} kết quả`);
    }
  }, [debouncedSearchText, dataSource, selectedCategory]);

  const handleEdit = (record) => {
    console.log('✏️ Editing food:', record);
    if (onEdit) {
      onEdit(record);
    }
  };

  const handleDelete = (record) => {
    console.log('🗑️ Deleting food:', record);
    if (onDelete) {
      onDelete(record);
    } else {
      message.success(`Đã xóa món ăn ${record.name}`);
    }
  };

  const handleViewDetails = async (record) => {
    setModalLoading(true);
    setIsModalVisible(true);
    try {
      const response = await foodService.getFood(record.id, '1');
      setSelectedFood(response);
    } catch (error) {
      message.error('Không thể tải chi tiết món ăn!');
      setIsModalVisible(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedFood(null);
    setModalLoading(false);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);

    if (!value && searchText) {
      message.success('Đã xóa bộ lọc tìm kiếm');
    }
  };

  const handleCategoryFilter = (value) => {
    setSelectedCategory(value);
    if (value !== null) {
      const categoryName = categoryOptions.find(option => option.value === value)?.label;
      message.info(`Lọc món ăn theo danh mục: ${categoryName}`);
    } else {
      message.info('Đã xóa bộ lọc danh mục');
    }
  };

  const clearAllFilters = () => {
    setSearchText('');
    setDebouncedSearchText('');
    setSelectedCategory(null);
    message.success('Đã xóa tất cả bộ lọc');
  };

  const handleExportExcel = () => {
    try {
      const exportData = filteredData.map(food => ({
        'Tên món ăn': food.name || '-',
        'Danh mục': food.category?.name || 'Chưa chọn danh mục',
        'Giá cho khách': food.priceForGuest ? `${food.priceForGuest.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ',
        'Giá cho bệnh nhân': food.priceForPatient ? `${food.priceForPatient.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ',
        'Giá cho nhân viên': food.priceForStaff ? `${food.priceForStaff.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ',
        'Mô tả': food.description || 'Không có',
        'Là món kèm': food.isAddOn ? 'Có' : 'Không',
        'Là món chính': food.isSetDish ? 'Có' : 'Không',
        'Thứ tự sắp xếp': food.sort || '0',
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      ws['!cols'] = [
        { wch: 25 }, // Tên món ăn
        { wch: 20 }, // Danh mục
        { wch: 15 }, // Giá cho khách
        { wch: 15 }, // Giá cho bệnh nhân
        { wch: 15 }, // Giá cho nhân viên
        { wch: 30 }, // Mô tả
        { wch: 10 }, // Là món kèm
        { wch: 10 }, // Là món chính
        { wch: 15 }, // Thứ tự sắp xếp
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Foods');
      const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
      const fileName = `Foods_${timestamp}.xlsx`;
      XLSX.writeFile(wb, fileName);
      message.success('Xuất file Excel thành công!');
    } catch (err) {
      console.error('Error exporting Excel:', err);
      message.error('Không thể xuất file Excel. Vui lòng thử lại.');
    }
  };

  const columns = [
    {
      title: 'TÊN MÓN ĂN',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => <span className="vietnamese-text">{name || '-'}</span>,
    },
    {
      title: 'HÌNH ẢNH',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 200,
      align: 'center',
      render: (url, record) => (
        <FoodImage
          src={url}
          alt={record.name}
          size="small"
          preview={true}
        />
      ),
    },
    {
      title: 'DANH MỤC',
      dataIndex: 'category',
      key: 'category',
      render: (category, record) => {
        const categoryName = category?.name || 'Chưa chọn danh mục';
        console.log(`🔍 Rendering food id: ${record.id}, categoryId: ${record.categoryId}, Name: ${categoryName}`);
        return <span className="vietnamese-text">{categoryName}</span>;
      },
    },
    {
      title: 'GIÁ',
      dataIndex: 'priceForGuest',
      key: 'priceForGuest',
      sorter: (a, b) => a.priceForGuest - b.priceForGuest,
      render: (price) => (
        <span className="vietnamese-text">{price ? `${price.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ'}</span>
      ),
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'actions',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <div className="">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa món ăn"
              description={`Bạn có chắc chắn muốn xóa món ăn ${record.name}?`}
              onConfirm={() => handleDelete(record)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
              />
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className={`reusable-table-v2 ${className || ''}`}>
      <div className="reusable-table-header">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SearchOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
            <Input
              placeholder="Tìm kiếm món ăn theo tên..."
              value={searchText}
              onChange={handleSearch}
              style={{ width: 280 }}
              allowClear
              suffix={
                searchText && searchText !== debouncedSearchText ? (
                  <Spin size="small" />
                ) : null
              }
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FilterOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
            <Select
              placeholder="Lọc theo danh mục"
              value={selectedCategory}
              onChange={handleCategoryFilter}
              style={{ width: 200 }}
              allowClear
              options={categoryOptions}
            />
          </div>

          <Tooltip title="Xuất danh sách ra Excel">
            <Button
              icon={<FileExcelOutlined />}
              onClick={handleExportExcel}
              style={{ marginLeft: 'auto', color: 'green' }}
            >
              Xuất File
            </Button>
          </Tooltip>
          {(searchText || selectedCategory !== null) && (
            <Button
              size="small"
              onClick={clearAllFilters}
              style={{ marginLeft: '8px' }}
            >
              Xóa tất cả bộ lọc
            </Button>
          )}
        </div>
      </div>
      <ReusableTableV2
        {...rest}
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="id"
        pagination={{
          show: true,
          pageSizeOptions: [5, 10, 20, 50],
          showTotal: true,
          showSizeChanger: true,
        }}
        className="reusable-table-v2"
        // Permission controls for table actions
        resourceName="foods"
        editPermission={PERMISSIONS.FOODS_EDIT}
        deletePermission={PERMISSIONS.FOODS_DELETE}
        hideActionsOnNoPermission={true}
        showPermissionTooltips={true}
      />
      <Modal
        title="Chi tiết món ăn"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Đóng
          </Button>,
        ]}
        width={600}
        className="food-detail-modal"
      >
        {modalLoading ? (
          <div className="modal-loading">
            <Spin size="large" />
          </div>
        ) : selectedFood ? (
          <div className="food-detail-content">
            {selectedFood.imageUrl && (
              <FoodImage
                src={selectedFood.imageUrl}
                alt={selectedFood.name}
                size="small"
                preview={true}
              />
            )}
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Tên món ăn">
                {selectedFood.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Danh mục">
                {selectedFood.category?.name || 'Chưa chọn danh mục'}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {selectedFood.description || 'Không có'}
              </Descriptions.Item>
              <Descriptions.Item label="Giá cho khách">
                {selectedFood.priceForGuest
                  ? `${selectedFood.priceForGuest.toLocaleString('vi-VN')} VNĐ`
                  : '0 VNĐ'}
              </Descriptions.Item>
              <Descriptions.Item label="Giá cho bệnh nhân">
                {selectedFood.priceForPatient
                  ? `${selectedFood.priceForPatient.toLocaleString('vi-VN')} VNĐ`
                  : '0 VNĐ'}
              </Descriptions.Item>
              <Descriptions.Item label="Giá cho nhân viên">
                {selectedFood.priceForStaff
                  ? `${selectedFood.priceForStaff.toLocaleString('vi-VN')} VNĐ`
                  : '0 VNĐ'}
              </Descriptions.Item>
              <Descriptions.Item label="Thứ tự sắp xếp">
                {selectedFood.sort || '0'}
              </Descriptions.Item>
              <Descriptions.Item label="Là món kèm">
                {selectedFood.isAddOn ? 'Có' : 'Không'}
              </Descriptions.Item>
              <Descriptions.Item label="Là món chính">
                {selectedFood.isSetDish ? 'Có' : 'Không'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        ) : (
          <p>Không có dữ liệu món ăn.</p>
        )}
      </Modal>
    </div>
  );
};

FoodsTable.propTypes = {
  dataSource: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      categoryId: PropTypes.number.isRequired,
      category: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        imageUrl: PropTypes.string,
        sort: PropTypes.number,
      }),
      description: PropTypes.string,
      priceForGuest: PropTypes.number.isRequired,
      priceForPatient: PropTypes.number,
      priceForStaff: PropTypes.number,
      imageUrl: PropTypes.string,
      isAddOn: PropTypes.bool,
      isSetDish: PropTypes.bool,
      sort: PropTypes.number,
    })
  ),
  loading: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  className: PropTypes.string,
};

export default FoodsTable;