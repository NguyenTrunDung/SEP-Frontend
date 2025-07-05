import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Table, Button, Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './ReusableTableV2.css';

/**
 * ReusableTableV2 - Enhanced Ant Design Table with custom styling and features
 * Uses the updated ReusableTableV2.css for styling to match the provided screenshots
 */
const ReusableTableV2 = ({
    columns,
    dataSource,
    loading,
    pagination,
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
    ...rest
}) => {
    // Add action column if needed
    const enhancedColumns = useMemo(() => {
        let cols = [...columns];
        if ((onEdit || onDelete || actions) && !columns.find(col => col.key === 'action')) {
            cols.push({
                title: 'Hành động',
                key: 'action',
                width: 120,
                fixed: 'right',
                render: (_, record) => (
                    <div className="action-buttons">
                        {actions && actions(record)}
                        {onEdit && (
                            <Tooltip title="Chỉnh sửa">
                                <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(record)} />
                            </Tooltip>
                        )}
                        {onDelete && (
                            <Popconfirm
                                title="Bạn có chắc muốn xóa?"
                                onConfirm={() => onDelete(record)}
                                okText="Xóa"
                                cancelText="Hủy"
                            >
                                <Button type="text" icon={<DeleteOutlined />} danger />
                            </Popconfirm>
                        )}
                    </div>
                ),
            });
        }
        return cols;
    }, [columns, onEdit, onDelete, actions]);

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
                dataSource={dataSource}
                loading={loading ? {
                    spinning: true,
                    tip: loadingTip,
                    size: 'large',
                    delay: 100
                } : false}
                pagination={defaultPagination}
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
};

export default ReusableTableV2; 