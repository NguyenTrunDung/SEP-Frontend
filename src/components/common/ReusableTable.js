import React from 'react';
import { Table, Spin } from 'antd';
import PropTypes from 'prop-types';
import './ReusableTable.css';

/**
 * Reusable Table component that extends Ant Design Table
 * Provides full customization while maintaining consistency
 */
const ReusableTable = ({
    columns,
    dataSource,
    loading = false,
    pagination = { pageSize: 10, showSizeChanger: true, showQuickJumper: true },
    size = 'middle',
    scroll,
    rowKey = 'id',
    rowSelection,
    expandable,
    showHeader = true,
    bordered = false,
    className,
    style,
    rowClassName,
    onRow,
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
    onRowClick,
    emptyText = 'Không có dữ liệu',
    loadingTip = 'Đang tải...',
    ...rest
}) => {

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

    const defaultPagination = {
        showTotal: (total, range) =>
            `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} mục`,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        ...pagination
    };

    const handleRowClick = (record, index) => {
        if (onRowClick) {
            onRowClick(record, index);
        }
    };

    const enhancedOnRow = (record, index) => {
        const originalOnRow = onRow ? onRow(record, index) : {};

        return {
            ...originalOnRow,
            onClick: (event) => {
                if (originalOnRow.onClick) {
                    originalOnRow.onClick(event);
                }
                handleRowClick(record, index);
            },
        };
    };

    if (loading) {
        return (
            <div className="reusable-table-loading">
                <Spin size="large" tip={loadingTip} />
            </div>
        );
    }

    return (
        <div className={`reusable-table-container ${className || ''}`} style={style}>
            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={pagination === false ? false : defaultPagination}
                size={size}
                scroll={scroll}
                rowKey={rowKey}
                rowSelection={rowSelection}
                expandable={expandable}
                showHeader={showHeader}
                bordered={bordered}
                rowClassName={rowClassName}
                onRow={enhancedOnRow}
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
                className="reusable-table"
                {...rest}
            />
        </div>
    );
};

ReusableTable.propTypes = {
    columns: PropTypes.array.isRequired,
    dataSource: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    pagination: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    size: PropTypes.oneOf(['small', 'middle', 'large']),
    scroll: PropTypes.object,
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    rowSelection: PropTypes.object,
    expandable: PropTypes.object,
    showHeader: PropTypes.bool,
    bordered: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
    rowClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    onRow: PropTypes.func,
    locale: PropTypes.object,
    sortDirections: PropTypes.array,
    showSorterTooltip: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    sticky: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    summary: PropTypes.func,
    tableLayout: PropTypes.oneOf(['auto', 'fixed']),
    title: PropTypes.func,
    footer: PropTypes.func,
    onChange: PropTypes.func,
    onHeaderRow: PropTypes.func,
    onRowClick: PropTypes.func,
    emptyText: PropTypes.string,
    loadingTip: PropTypes.string,
};

export default ReusableTable; 