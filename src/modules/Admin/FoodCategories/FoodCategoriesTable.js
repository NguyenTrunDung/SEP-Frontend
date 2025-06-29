// FoodCategoriesTable.jsx
import React, { useState, useMemo } from 'react';
import { Button, Input, Tooltip, Popconfirm, message, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined, DragOutlined } from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ReusableTable from '../../../components/common/ReusableTable';
import { FoodImage } from '../../../components/common/ImageDisplay';
import { useReorderFoodCategories } from '../../../hooks/queries/useFoodCategories';
import environment from '../../../config/environment';
import PropTypes from 'prop-types';

// Sortable Row Component for drag-and-drop
const SortableRow = ({ children, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
  });

  const style = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child, index) => {
        if (index === 0) {
          // Add drag handle to the first column
          return React.cloneElement(child, {
            children: (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  {...listeners}
                  style={{
                    cursor: 'grab',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#999',
                  }}
                >
                  <DragOutlined />
                </div>
                {child.props.children}
              </div>
            ),
          });
        }
        return child;
      })}
    </tr>
  );
};

const FoodCategoriesTable = ({
  dataSource = [],
  loading, // Remove default - let parent explicitly control loading state
  onEdit,
  onDelete,
  onViewDetails,
  className,
  branchId, // Add branchId prop for reordering
  ...rest
}) => {
  const [searchText, setSearchText] = useState('');
  const [dragDropEnabled, setDragDropEnabled] = useState(false);





  // Reorder mutation
  const reorderMutation = useReorderFoodCategories();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredData = useMemo(() => {
    if (!searchText) return dataSource;
    return dataSource.filter(item =>
      item.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [dataSource, searchText]);

  // Use original data for drag-drop (no search filtering during drag)
  const displayData = dragDropEnabled ? dataSource : filteredData;



  const handleEdit = (record) => {
    if (onEdit) {
      onEdit(record);
    }
  };

  const handleDelete = (record) => {
    if (onDelete) {
      onDelete(record);
    }
  };

  const handleViewDetails = (record) => {
    if (onViewDetails) {
      onViewDetails(record);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (value) {
      message.info(`Lọc danh mục theo: ${value}`);
    } else {
      message.info('Đã xóa bộ lọc tìm kiếm');
    }
  };

  // Handle drag end event
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    try {
      const oldIndex = displayData.findIndex((item) => item.id === active.id);
      const newIndex = displayData.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      // Create new order with updated sort values
      const newData = arrayMove(displayData, oldIndex, newIndex);
      const categoryOrders = newData.map((item, index) => ({
        categoryId: item.id,
        sort: index + 1, // 1-based sort values
      }));

      // Get current branch ID
      const currentBranchId = branchId || environment.multiTenant.getCurrentBranchId() || '1';

      if (environment.features.enableLogging) {
        console.log('🔄 Reordering categories:', categoryOrders);
      }

      // Call reorder API
      await reorderMutation.mutateAsync({
        categoryOrders,
        branchId: currentBranchId,
      });

    } catch (error) {
      console.error('❌ Failed to reorder categories:', error);
      // Error message is handled by the mutation hook
    }
  };

  // Toggle drag-drop mode
  const handleDragDropToggle = (checked) => {
    setDragDropEnabled(checked);
    if (checked && searchText) {
      // Clear search when enabling drag-drop
      setSearchText('');
      message.info('Đã tắt tìm kiếm để sử dụng chức năng kéo thả');
    }
    message.info(checked ? 'Đã bật chế độ kéo thả' : 'Đã tắt chế độ kéo thả');
  };

  const columns = [
    {
      title: 'TÊN DANH MỤC',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => <span className="vietnamese-text">{name || '-'}</span>,
    },
    {
      title: 'HÌNH ẢNH',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 100,
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
      title: 'THỨ TỰ',
      dataIndex: 'sort',
      key: 'sort',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.sort - b.sort,
      render: (sort) => <span className="vietnamese-text">{sort || 0}</span>,
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'actions',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <div className="action-buttons">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              className="action-btn view-btn"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="action-btn edit-btn"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa danh mục"
              description={`Bạn có chắc chắn muốn xóa danh mục ${record.name}?`}
              onConfirm={() => handleDelete(record)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                className="action-btn delete-btn"
                size="small"
                danger
              />
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  // Table component with drag-and-drop support
  const TableComponent = () => {
    const tableProps = {
      columns,
      dataSource: displayData,
      loading: loading || reorderMutation.isLoading,
      rowKey: "id",
      pagination: {
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} danh mục`,
      },
      className: "reusable-table",
      ...rest,
    };



    if (dragDropEnabled) {
      // Add sortable row component for drag-and-drop
      tableProps.components = {
        body: {
          row: SortableRow,
        },
      };
    }

    return <ReusableTable  {...tableProps} />;
  };

  return (
    <div className={`reusable-table-container ${className || ''}`}>
      <div className="reusable-table-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SearchOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
            <Input
              placeholder="Tìm kiếm danh mục"
              value={searchText}
              onChange={handleSearch}
              style={{ width: 300 }}
              allowClear
              disabled={dragDropEnabled}
            />
            {searchText && !dragDropEnabled && (
              <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                {filteredData.length} kết quả
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              Kéo thả để sắp xếp:
            </span>
            <Switch
              checked={dragDropEnabled}
              onChange={handleDragDropToggle}
              loading={reorderMutation.isLoading}
            />
          </div>
        </div>
      </div>

      {dragDropEnabled ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={displayData.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <TableComponent />
          </SortableContext>
        </DndContext>
      ) : (
        <TableComponent />
      )}
    </div>
  );
};

FoodCategoriesTable.propTypes = {
  dataSource: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      imageUrl: PropTypes.string,
      sort: PropTypes.number,
    })
  ),
  loading: PropTypes.bool, // Optional - defaults to false if undefined
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onViewDetails: PropTypes.func,
  className: PropTypes.string,
  branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default FoodCategoriesTable;