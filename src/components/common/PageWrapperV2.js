import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import './PageWrapperV2.css';

/**
 * PageWrapperV2 HOC - Provides consistent page layout structure with V2 styling
 * Simple HOC that wraps components with the same interface as the original PageWrapperV2
 */
const withPageWrapperV2 = (WrappedComponent) => {
    const PageWrapperV2Component = ({
        title,
        onAdd,
        onRefresh,
        searchProps,
        headerActions,
        loading = false,
        emptyMessage = 'Không có dữ liệu nào.',
        showSearch = true,
        showAddButton = true,
        showRefreshButton = true,
        addButtonText = 'Thêm',
        refreshButtonText = 'Làm mới',
        searchPlaceholder = 'Tìm kiếm...',
        className,
        style,
        children,
        ...props
    }) => {
        return (
            <div className={`page-wrapper-v2 ${className || ''}`} style={style}>
                {/* Header */}
                <div className="page-header-v2">
                    <h2 className="page-title-v2">{title}</h2>
                    <div className="header-actions-v2">
                        {headerActions}
                        {showRefreshButton && (
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={onRefresh}
                                style={{ marginRight: 8 }}
                                disabled={loading}
                            >
                                {refreshButtonText}
                            </Button>
                        )}
                        {showAddButton && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={onAdd}
                                disabled={loading}
                            >
                                {addButtonText}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search */}
                {showSearch && (
                    <Input
                        className="search-input-v2"
                        placeholder={searchPlaceholder}
                        prefix={<SearchOutlined />}
                        {...searchProps}
                    />
                )}

                {/* Content */}
                <div className="page-content-v2">
                    {loading ? (
                        <div className="loading-state-v2">Đang tải...</div>
                    ) : (
                        <WrappedComponent loading={loading} {...props}>
                            {children}
                        </WrappedComponent>
                    )}
                </div>
            </div>
        );
    };

    // Set display name for debugging
    PageWrapperV2Component.displayName = `withPageWrapperV2(${WrappedComponent.displayName || WrappedComponent.name})`;

    // PropTypes for the wrapper (same as original PageWrapperV2)
    PageWrapperV2Component.propTypes = {
        title: PropTypes.string.isRequired,
        children: PropTypes.node.isRequired,
        onAdd: PropTypes.func,
        onRefresh: PropTypes.func,
        searchProps: PropTypes.object,
        headerActions: PropTypes.node,
        className: PropTypes.string,
        style: PropTypes.object,
        loading: PropTypes.bool,
        emptyMessage: PropTypes.string,
        showSearch: PropTypes.bool,
        showAddButton: PropTypes.bool,
        showRefreshButton: PropTypes.bool,
        addButtonText: PropTypes.string,
        refreshButtonText: PropTypes.string,
        searchPlaceholder: PropTypes.string,
    };

    return PageWrapperV2Component;
};

// Direct component (same as original)
const PageWrapperV2 = ({
    title,
    children,
    onAdd,
    onRefresh,
    searchProps,
    headerActions,
    className,
    style,
    loading = false,
    emptyMessage = 'Không có dữ liệu nào.',
    showSearch = true,
    showAddButton = true,
    showRefreshButton = true,
    addButtonText = 'Thêm',
    refreshButtonText = 'Làm mới',
    searchPlaceholder = 'Tìm kiếm...',
    ...rest
}) => {
    return (
        <div className={`page-wrapper-v2 ${className || ''}`} style={style} {...rest}>
            {/* Header */}
            <div className="page-header-v2">
                <h2 className="page-title-v2">{title}</h2>
                <div className="header-actions-v2">
                    {headerActions}
                    {showRefreshButton && (
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={onRefresh}
                            style={{ marginRight: 8 }}
                            disabled={loading}
                        >
                            {refreshButtonText}
                        </Button>
                    )}
                    {showAddButton && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={onAdd}
                            disabled={loading}
                        >
                            {addButtonText}
                        </Button>
                    )}
                </div>
            </div>

            {/* Search */}
            {showSearch && (
                <Input
                    className="search-input-v2"
                    placeholder={searchPlaceholder}
                    prefix={<SearchOutlined />}
                    {...searchProps}
                />
            )}

            {/* Content */}
            <div className="page-content-v2">
                {loading ? (
                    <div className="loading-state-v2">Đang tải...</div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
};

PageWrapperV2.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    onAdd: PropTypes.func,
    onRefresh: PropTypes.func,
    searchProps: PropTypes.object,
    headerActions: PropTypes.node,
    className: PropTypes.string,
    style: PropTypes.object,
    loading: PropTypes.bool,
    emptyMessage: PropTypes.string,
    showSearch: PropTypes.bool,
    showAddButton: PropTypes.bool,
    showRefreshButton: PropTypes.bool,
    addButtonText: PropTypes.string,
    refreshButtonText: PropTypes.string,
    searchPlaceholder: PropTypes.string,
};

export { withPageWrapperV2 };
export default PageWrapperV2; 