import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Table, Button, Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { usePermissions } from '../../hooks/usePermissions';
import CustomPagination from './CustomPagination';
import './ReusableTableV2.css';

/**
 * ReusableTableV2 - Enhanced Ant Design Table with custom styling and features
 * Uses the updated ReusableTableV2.css for styling to match the provided screenshots
 */
const ReusableTableV2 = ({
    columns,
    dataSource,
    loading,
    pagination = {},
    rowKey = 'id',
    rowSelection,
    expandable,
    showHeader = true,
    bordered = false,
    className,
    style,
    onEdit,
    onDelete,
    actions,
    locale,
    sortDirections = ['ascend', 'descend'],
    showSorterTooltip = true,
    sticky = false,
    summary,
    tableLayout = 'auto',
    title,
    footer,
    onChange,
    onHeaderRow,
    onRow,
    emptyText = 'Không có dữ liệu',
    loadingTip = 'Đang tải...',
    // Permission-based props
    resourceName, // e.g., 'foods', 'orders', 'users'
    editPermission, // Specific edit permission (overrides resourceName:edit)
    deletePermission, // Specific delete permission (overrides resourceName:delete)
    customPermissionCheck, // Function to check custom permissions per row
    hideActionsOnNoPermission = true, // Hide action buttons completely or show disabled
    showPermissionTooltips = true, // Show tooltips for disabled buttons
    ...rest
}) => {
    const { hasPermission, canPerformAction, isSystemAdmin } = usePermissions();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(pagination.pageSize || 10);

    // Permission checking functions
    const checkEditPermission = (record) => {
        if (isSystemAdmin) return true;
        if (customPermissionCheck) return customPermissionCheck('edit', record);
        if (editPermission) return hasPermission(editPermission);
        if (resourceName) return canPerformAction('edit', resourceName);
        return true; // Default to true if no permissions specified
    };

    const checkDeletePermission = (record) => {
        if (isSystemAdmin) return true;
        if (customPermissionCheck) return customPermissionCheck('delete', record);
        if (deletePermission) return hasPermission(deletePermission);
        if (resourceName) return canPerformAction('delete', resourceName);
        return true; // Default to true if no permissions specified
    };

    // Calculate paginated data
    const paginatedData = useMemo(() => {
        if (!pagination.show) return dataSource;

        const start = (currentPage - 1) * pageSize;
        return dataSource.slice(start, start + pageSize);
    }, [dataSource, currentPage, pageSize, pagination.show]);

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
        if (pagination.onChange) {
            pagination.onChange(page, pageSize);
        }
    };

    // Handle page size change
    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page when changing page size
        if (pagination.onShowSizeChange) {
            pagination.onShowSizeChange(currentPage, newPageSize);
        }
    };

    // Add action column if needed with permission checks
    const enhancedColumns = useMemo(() => {
        let cols = [...columns];
        if ((onEdit || onDelete || actions) && !columns.find(col => col.key === 'action')) {
            cols.push({
                title: 'Hành động',
                key: 'action',
                width: 120,
                fixed: 'right',
                render: (_, record) => {
                    const canEdit = checkEditPermission(record);
                    const canDelete = checkDeletePermission(record);

                    // If hiding actions and no permissions, return null
                    if (hideActionsOnNoPermission && !canEdit && !canDelete && !actions) {
                        return null;
                    }

                    return (
                        <div className="action-buttons">
                            {/* Custom actions - always show if provided */}
                            {actions && actions(record, { canEdit, canDelete })}

                            {/* Edit button */}
                            {onEdit && (
                                canEdit ? (
                                    <Tooltip title="Chỉnh sửa">
                                        <Button
                                            type="text"
                                            icon={<EditOutlined />}
                                            onClick={() => onEdit(record)}
                                        />
                                    </Tooltip>
                                ) : !hideActionsOnNoPermission ? (
                                    <Tooltip title={showPermissionTooltips ? "Bạn không có quyền chỉnh sửa" : "Chỉnh sửa"}>
                                        <Button
                                            type="text"
                                            icon={<EditOutlined />}
                                            disabled
                                        />
                                    </Tooltip>
                                ) : null
                            )}

                            {/* Delete button */}
                            {onDelete && (
                                canDelete ? (
                                    <Popconfirm
                                        title="Bạn có chắc muốn xóa?"
                                        onConfirm={() => onDelete(record)}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                    >
                                        <Button type="text" icon={<DeleteOutlined />} danger />
                                    </Popconfirm>
                                ) : !hideActionsOnNoPermission ? (
                                    <Tooltip title={showPermissionTooltips ? "Bạn không có quyền xóa" : "Xóa"}>
                                        <Button
                                            type="text"
                                            icon={<DeleteOutlined />}
                                            danger
                                            disabled
                                        />
                                    </Tooltip>
                                ) : null
                            )}
                        </div>
                    );
                },
            });
        }
        return cols;
    }, [columns, onEdit, onDelete, actions, checkEditPermission, checkDeletePermission, hideActionsOnNoPermission, showPermissionTooltips]);

    const defaultLocale = {
        emptyText: emptyText,
        filterTitle: 'Bộ lọc',
        filterConfirm: 'Xác nhận',
        filterReset: 'Đặt lại',
        filterSearchPlaceholder: 'Tìm kiếm...',
        selectAll: 'Chọn tất cả',
        selectInvert: 'Chọn ngược lại',
        selectionAll: 'Chọn tất cả dữ liệu',
        sortTitle: 'Sắp xếp',
        expand: 'Mở rộng dòng',
        collapse: 'Thu gọn dòng',
        triggerDesc: 'Nhấn để sắp xếp giảm dần',
        triggerAsc: 'Nhấn để sắp xếp tăng dần',
        cancelSort: 'Nhấn để hủy sắp xếp',
        ...locale
    };

    const defaultPagination = pagination === false ? false : {
        showTotal: (total, range) =>
            `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} mục`,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        ...pagination
    };

    return (
        <div className={`reusable-table-v2 ${className || ''}`} style={style}>
            <Table
                className="reusable-table-v2"
                columns={enhancedColumns}
                dataSource={pagination.show ? paginatedData : dataSource}
                loading={loading ? {
                    spinning: true,
                    tip: loadingTip,
                    size: 'large',
                    delay: 100
                } : false}
                pagination={false}
                rowKey={rowKey}
                rowSelection={rowSelection}
                expandable={expandable}
                showHeader={showHeader}
                bordered={bordered}
                locale={defaultLocale}
                sortDirections={sortDirections}
                showSorterTooltip={showSorterTooltip}
                sticky={sticky}
                summary={summary}
                tableLayout={tableLayout}
                title={title}
                footer={footer}
                onChange={onChange}
                onHeaderRow={onHeaderRow}
                onRow={onRow}
                {...rest}
            />

            {/* Custom Pagination */}
            {pagination.show && (
                <CustomPagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    total={dataSource.length}
                    pageSizeOptions={pagination.pageSizeOptions || [10, 20, 50]}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    showTotal={pagination.showTotal !== false}
                    showPageSizeSelector={pagination.showSizeChanger !== false}
                />
            )}
        </div>
    );
};

ReusableTableV2.propTypes = {
    columns: PropTypes.array.isRequired,
    dataSource: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    pagination: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    rowSelection: PropTypes.object,
    expandable: PropTypes.object,
    showHeader: PropTypes.bool,
    bordered: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    actions: PropTypes.func,
    locale: PropTypes.object,
    sortDirections: PropTypes.array,
    showSorterTooltip: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    sticky: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    summary: PropTypes.func,
    tableLayout: PropTypes.oneOf(['auto', 'fixed']),
    title: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    footer: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    onChange: PropTypes.func,
    onHeaderRow: PropTypes.func,
    onRow: PropTypes.func,
    emptyText: PropTypes.string,
    loadingTip: PropTypes.string,
    // Permission-based props
    resourceName: PropTypes.string,
    editPermission: PropTypes.string,
    deletePermission: PropTypes.string,
    customPermissionCheck: PropTypes.func,
    hideActionsOnNoPermission: PropTypes.bool,
    showPermissionTooltips: PropTypes.bool,
};

export default ReusableTableV2; 