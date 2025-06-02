# Unified Table Styling System

This guide explains how to use the enhanced `ReusableTable.css` styling system across all table components in the application for consistent design and user experience.

## Overview

The `ReusableTable.css` provides a comprehensive styling system that combines the best practices from both the original `ReusableTable` and `MenuTable` components. It offers:

- Consistent typography and spacing
- Enhanced action buttons with hover effects
- Professional Vietnamese interface styling
- Responsive design for all screen sizes
- Customizable headers with search/filter functionality

## Basic Usage

### 1. Import the ReusableTable Component

```javascript
import ReusableTable from "../../../components/common/ReusableTable";
```

### 2. Basic Table Structure

```javascript
const MyTableComponent = ({ dataSource, loading }) => {
  return (
    <div className="reusable-table-container">
      <ReusableTable
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey="id"
        className="reusable-table"
      />
    </div>
  );
};
```

## Enhanced Table with Header

### With Search and Filter Header

```javascript
const EnhancedTableComponent = ({ dataSource, loading }) => {
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <div className="reusable-table-container">
      {/* Enhanced Header */}
      <div className="reusable-table-header">
        <Input.Search
          placeholder="Tìm kiếm..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
          style={{ width: 300 }}
        />

        <DatePicker
          placeholder="Lọc theo ngày"
          value={selectedDate}
          onChange={setSelectedDate}
          className="date-filter-input"
          style={{ width: 200 }}
        />
      </div>

      {/* Table */}
      <ReusableTable
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="id"
        className="reusable-table"
      />
    </div>
  );
};
```

## Column Styling Classes

### Date/Time Columns

```javascript
const columns = [
  {
    title: "NGÀY TẠO",
    dataIndex: "createdDate",
    render: (date) => (
      <span className="vietnamese-text date-column">{date}</span>
    ),
  },
  {
    title: "THỜI GIAN",
    dataIndex: "time",
    render: (time) => (
      <span className="vietnamese-text time-column">{time}</span>
    ),
  },
];
```

### Status Indicators

```javascript
{
  title: 'TRẠNG THÁI',
  dataIndex: 'status',
  render: (status) => (
    <span className={`status-${status.toLowerCase()}`}>
      {status}
    </span>
  ),
}
```

Available status classes:

- `status-active` - Green color for active states
- `status-inactive` - Red color for inactive states
- `status-pending` - Orange color for pending states

## Action Buttons

### Enhanced Action Buttons (Recommended)

```javascript
{
  title: 'HÀNH ĐỘNG',
  key: 'actions',
  align: 'center',
  render: (_, record) => (
    <div className="action-buttons">
      <Tooltip title="Xem chi tiết">
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
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
          title="Xác nhận xóa"
          description="Bạn có chắc chắn muốn xóa?"
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
}
```

### Action Button Classes

- `action-btn` - Base action button styling
- `view-btn` - Blue color for view actions
- `edit-btn` - Orange color for edit actions
- `delete-btn` - Red color for delete actions

## Typography and Text Styling

### Vietnamese Text

```javascript
<span className="vietnamese-text">Văn bản tiếng Việt</span>
```

### Utility Classes

```javascript
// Text alignment
<span className="text-center">Centered text</span>
<span className="text-right">Right aligned text</span>
<span className="text-left">Left aligned text</span>

// Font styles
<span className="font-mono">Monospace text</span>
<span className="font-semibold">Semi-bold text</span>
<span className="font-bold">Bold text</span>
```

## Advanced Features

### Striped Rows

Add the `striped` class to enable alternating row colors:

```javascript
<ReusableTable
  className="reusable-table striped"
  // ... other props
/>
```

### Tags

```javascript
<Tag className="vietnamese-text" color="green">
  Hoạt động
</Tag>
```

## Responsive Design

The table automatically handles responsive design:

- **Desktop (>1200px)**: Full layout with all features
- **Tablet (768px-1200px)**: Adjusted padding and button sizes
- **Mobile (<768px)**: Compact layout with horizontal scrolling

## Pagination

The enhanced pagination includes Vietnamese text and improved styling:

```javascript
pagination={{
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) =>
    `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} mục`,
}}
```

## Example: Complete User Table

```javascript
import React, { useState, useMemo } from "react";
import { Button, Input, DatePicker, Tag, Tooltip, Popconfirm } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import ReusableTable from "../../../components/common/ReusableTable";

const UserTable = ({ dataSource, loading, onView, onEdit, onDelete }) => {
  const [searchText, setSearchText] = useState("");

  const filteredData = useMemo(() => {
    return dataSource.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [dataSource, searchText]);

  const columns = [
    {
      title: "TÊN NGƯỜI DÙNG",
      dataIndex: "name",
      render: (name) => (
        <span className="vietnamese-text font-semibold">{name}</span>
      ),
    },
    {
      title: "EMAIL",
      dataIndex: "email",
      render: (email) => (
        <span className="vietnamese-text font-mono">{email}</span>
      ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      align: "center",
      render: (status) => (
        <Tag
          color={status === "active" ? "green" : "red"}
          className="vietnamese-text"
        >
          {status === "active" ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "NGÀY TẠO",
      dataIndex: "createdDate",
      render: (date) => (
        <span className="vietnamese-text date-column">{date}</span>
      ),
    },
    {
      title: "HÀNH ĐỘNG",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <div className="action-buttons">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
              className="action-btn view-btn"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              className="action-btn edit-btn"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa người dùng"
              description="Bạn có chắc chắn muốn xóa người dùng này?"
              onConfirm={() => onDelete(record)}
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

  return (
    <div className="reusable-table-container">
      <div className="reusable-table-header">
        <Input.Search
          placeholder="Tìm kiếm người dùng..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
          style={{ width: 300 }}
        />
      </div>

      <ReusableTable
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} người dùng`,
        }}
        className="reusable-table"
      />
    </div>
  );
};

export default UserTable;
```

## Migration Guide

To migrate existing table components to use the unified styling:

1. **Remove component-specific CSS imports**
2. **Replace container class** with `reusable-table-container`
3. **Add header section** using `reusable-table-header`
4. **Update table class** to `reusable-table`
5. **Apply semantic classes** for dates, times, and actions
6. **Use enhanced action buttons** for consistent UX

## Best Practices

1. Always use `vietnamese-text` class for Vietnamese content
2. Use semantic classes (`date-column`, `time-column`) for appropriate data types
3. Implement consistent action button patterns across all tables
4. Include proper tooltips for action buttons
5. Use Popconfirm for destructive actions
6. Provide meaningful pagination text in Vietnamese
7. Test responsive behavior on different screen sizes

This unified system ensures all tables in the application maintain consistent styling and user experience while remaining flexible for specific use cases.
