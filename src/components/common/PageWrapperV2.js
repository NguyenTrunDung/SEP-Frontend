import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input, DatePicker, Select } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import './PageWrapperV2.css';

const { Option } = Select;

/**
 * PageWrapperV2 HOC - Provides consistent page layout structure with V2 styling
 */
const withPageWrapperV2 = (WrappedComponent) => {
  const PageWrapperV2Component = ({
    title,
    onAdd,
    onRefresh,
    searchProps,
    filterProps,
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
    const renderFilterField = (field) => {
      if (field.type === 'date') {
        return (
          <DatePicker
            key={field.name}
            placeholder={field.label}
            onChange={(date, dateString) =>
              filterProps.onChange({
                ...filterProps.filters,
                [field.name]: dateString,
              })
            }
            style={{ width: 180 }}
          />
        );
      }
      if (field.type === 'select') {
        return (
          <Select
            key={field.name}
            placeholder={field.label}
            allowClear
            onChange={(value) =>
              filterProps.onChange({
                ...filterProps.filters,
                [field.name]: value,
              })
            }
            style={{ width: 180 }}
          >
            {field.options.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );
      }
      return (
        <Input
          key={field.name}
          placeholder={field.label}
          onChange={(e) =>
            filterProps.onChange({
              ...filterProps.filters,
              [field.name]: e.target.value,
            })
          }
          style={{ width: 180 }}
        />
      );
    };

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

        {/* Search and Filters */}
        <div className="search-filter-section">
          {showSearch && (
            <Input
              className="search-input-v2"
              placeholder={searchPlaceholder}
              prefix={<SearchOutlined />}
              style={{ width: 180 }}
              {...searchProps}
            />
          )}
          {filterProps && filterProps.fields.map((field) => renderFilterField(field))}
        </div>

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

  PageWrapperV2Component.displayName = `withPageWrapperV2(${WrappedComponent.displayName || WrappedComponent.name})`;

  PageWrapperV2Component.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    onAdd: PropTypes.func,
    onRefresh: PropTypes.func,
    searchProps: PropTypes.object,
    filterProps: PropTypes.object,
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

// Direct component
const PageWrapperV2 = ({
  title,
  children,
  onAdd,
  onRefresh,
  searchProps,
  filterProps,
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
  const renderFilterField = (field) => {
    if (field.type === 'date') {
      return (
        <DatePicker
          key={field.name}
          placeholder={field.label}
          onChange={(date, dateString) =>
            filterProps.onChange({
              ...filterProps.filters,
              [field.name]: dateString,
            })
          }
          style={{ width: 180 }}
        />
      );
    }
    if (field.type === 'select') {
      return (
        <Select
          key={field.name}
          placeholder={field.label}
          allowClear
          onChange={(value) =>
            filterProps.onChange({
              ...filterProps.filters,
              [field.name]: value,
            })
          }
          style={{ width: 180 }}
        >
          {field.options.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      );
    }
    return (
      <Input
        key={field.name}
        placeholder={field.label}
        onChange={(e) =>
          filterProps.onChange({
            ...filterProps.filters,
            [field.name]: e.target.value,
          })
        }
        style={{ width: 180 }}
      />
    );
  };

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

      {/* Search and Filters */}
      <div className="search-filter-section">
        {showSearch && (
          <Input
            className="search-input-v2"
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined />}
            style={{ width: 180 }}
            {...searchProps}
          />
        )}
        {filterProps && filterProps.fields.map((field) => renderFilterField(field))}
      </div>

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
  filterProps: PropTypes.object,
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
