# Example: Migrating ViewAllStaff to Unified Table System

This example shows how to migrate the existing `ViewAllStaff` component from custom table styling to the unified `ReusableTable` system.

## Before: Custom Table Styling

```javascript
// Current ViewAllStaff.js implementation
<Table
  columns={columns}
  dataSource={users}
  rowKey="id"
  pagination={{ pageSize: 10, showSizeChanger: false }}
  style={{ marginTop: 8 }}
  rowClassName={(_, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
/>

<style jsx>{`
  .table-row-light {
    background: #ffffff;
  }
  .table-row-dark {
    background: #fafafa;
  }
  :global(.ant-table) {
    border-radius: 8px;
    overflow: hidden;
  }
  :global(.ant-table-thead > tr > th) {
    background: #1890ff;
    color: #ffffff;
    font-weight: 600;
  }
`}</style>
```

## After: Unified Table System

```javascript
// Updated ViewAllStaff.js using ReusableTable
import ReusableTable from "../../../components/common/ReusableTable";

const ViewAllStaff = () => {
  // ... existing state and functions

  // Enhanced columns with semantic classes
  const columns = [
    {
      title: "TÊN",
      dataIndex: "firstName",
      render: (text, record) => (
        <span className="vietnamese-text font-semibold">
          {`${record.firstName} ${record.lastName}`}
        </span>
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
      title: "SỐ ĐIỆN THOẠI",
      dataIndex: "phoneNumber",
      render: (phone) => (
        <span className="vietnamese-text">{phone || "-"}</span>
      ),
    },
    {
      title: "PHÒNG BAN",
      dataIndex: "department",
      render: (department) => (
        <Tag className="vietnamese-text" color="blue">
          {department}
        </Tag>
      ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      align: "center",
      render: (status) => (
        <span className={`status-${status?.toLowerCase() || "active"}`}>
          {status === "active" ? "Hoạt động" : "Không hoạt động"}
        </span>
      ),
    },
    {
      title: "NGÀY TẠO",
      dataIndex: "createdAt",
      render: (date) => (
        <span className="vietnamese-text date-column">
          {date ? dayjs(date).format("DD/MM/YYYY") : "-"}
        </span>
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
              onClick={() => handleViewUser(record)}
              className="action-btn view-btn"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
              className="action-btn edit-btn"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa nhân viên"
              description="Bạn có chắc chắn muốn xóa nhân viên này?"
              onConfirm={() => handleDeleteUser(record.id)}
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
      {/* Enhanced Header with Search and Filters */}
      <div className="reusable-table-header">
        <div
          style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 }}
        >
          <Input.Search
            placeholder="Tìm kiếm nhân viên..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            className="search-input"
            style={{ width: 300 }}
          />

          <Select
            placeholder="Chọn phòng ban"
            allowClear
            style={{ width: 200 }}
            value={selectedDepartment}
            onChange={setSelectedDepartment}
          >
            {departments.map((dept) => (
              <Option key={dept} value={dept}>
                {dept}
              </Option>
            ))}
          </Select>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Tooltip title="Làm mới">
            <Button icon={<ReloadOutlined />} onClick={resetFilters} />
          </Tooltip>
          <Tooltip title="Xuất Excel">
            <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>
              Xuất
            </Button>
          </Tooltip>
          <Button
            type="primary"
            icon={<UserOutlined />}
            onClick={handleAddUser}
          >
            Thêm nhân viên
          </Button>
        </div>
      </div>

      {/* Table using ReusableTable */}
      <ReusableTable
        columns={columns}
        dataSource={filteredUsers}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} nhân viên`,
        }}
        className="reusable-table striped"
        locale={{
          emptyText: (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <UserOutlined
                style={{ fontSize: 48, color: "#bfbfbf", marginBottom: 16 }}
              />
              <p style={{ color: "#8c8c8c", fontSize: 16 }}>
                {Object.keys(filters).length > 0
                  ? "Không tìm thấy nhân viên phù hợp với bộ lọc"
                  : "Chưa có nhân viên nào"}
              </p>
            </div>
          ),
        }}
      />

      {/* Modal remains the same */}
      {/* ... existing modal code ... */}
    </div>
  );
};
```

## Benefits of Migration

### 1. **Consistent Styling**

- Unified header layout across all tables
- Consistent action button styling and behavior
- Standardized typography and spacing

### 2. **Enhanced User Experience**

- Better responsive design
- Improved action button hover effects
- Professional Vietnamese interface

### 3. **Reduced Code Maintenance**

- No more component-specific CSS
- Shared styling means easier updates
- Consistent behavior across the application

### 4. **Better Accessibility**

- Standardized tooltips and confirmations
- Proper semantic markup
- Improved keyboard navigation

## Key Changes Made

### 1. **Container Structure**

```javascript
// Before
<Card>
  <Form>...</Form>
  <Table />
</Card>

// After
<div className="reusable-table-container">
  <div className="reusable-table-header">
    <!-- Search and filters -->
  </div>
  <ReusableTable />
</div>
```

### 2. **Column Rendering**

```javascript
// Before
{
  title: 'Name',
  dataIndex: 'firstName',
  render: (text, record) => `${record.firstName} ${record.lastName}`,
}

// After
{
  title: 'TÊN',
  dataIndex: 'firstName',
  render: (text, record) => (
    <span className="vietnamese-text font-semibold">
      {`${record.firstName} ${record.lastName}`}
    </span>
  ),
}
```

### 3. **Action Buttons**

```javascript
// Before
<Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />

// After
<Tooltip title="Chỉnh sửa">
  <Button
    type="text"
    icon={<EditOutlined />}
    onClick={() => handleEdit(record)}
    className="action-btn edit-btn"
    size="small"
  />
</Tooltip>
```

### 4. **Status Indicators**

```javascript
// Before
<Tag color={status === 'active' ? 'green' : 'red'}>
  {status}
</Tag>

// After
<span className={`status-${status?.toLowerCase() || 'active'}`}>
  {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
</span>
```

## Migration Checklist

- [ ] Replace Table component with ReusableTable
- [ ] Update container structure
- [ ] Add semantic CSS classes to columns
- [ ] Enhance action buttons with tooltips
- [ ] Update status indicators
- [ ] Add Vietnamese text classes
- [ ] Remove component-specific CSS
- [ ] Test responsive behavior
- [ ] Verify accessibility features

## Result

The migrated component will have:

- ✅ Consistent styling with other tables
- ✅ Better user experience
- ✅ Reduced maintenance overhead
- ✅ Professional Vietnamese interface
- ✅ Enhanced responsive design
- ✅ Improved accessibility
