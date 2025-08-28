import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input, DatePicker, Select, Tooltip } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { usePermissions } from '../../hooks/usePermissions';
import './PageWrapperV2.css';
import dayjs from 'dayjs';

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
    extraButtons, // Thêm prop extraButtons
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
    // Permission-based props
    resourceName, // e.g., 'foods', 'orders', 'users'
    requiredPermissions, // Custom permissions array
    addPermission, // Specific add permission (overrides resourceName:add)
    viewPermission, // Permission to view the page
    hideOnNoPermission = true, // Hide completely or show disabled
    permissionFallback, // Custom fallback component/content
    ...props
  }) => {
    const { hasPermission, canPerformAction, isSystemAdmin } = usePermissions();

    // Permission checking functions
    const checkAddPermission = () => {
      if (isSystemAdmin) return true;
      if (addPermission) return hasPermission(addPermission);
      if (resourceName) return canPerformAction('add', resourceName);
      if (requiredPermissions) return requiredPermissions.some(p => hasPermission(p));
      return true; // Default to true if no permissions specified
    };

    const checkViewPermission = () => {
      if (isSystemAdmin) return true;
      if (viewPermission) return hasPermission(viewPermission);
      if (resourceName) return canPerformAction('view', resourceName);
      return true; // Default to true if no permissions specified
    };

    // Check if user can view this page/component
    const canViewPage = checkViewPermission();
    if (!canViewPage && hideOnNoPermission) {
      return permissionFallback || <div>Bạn không có quyền truy cập trang này.</div>;
    }

    // Check add button permission
    const canAddResource = checkAddPermission();
    const shouldShowAddButton = showAddButton && canAddResource;

    const renderFilterField = (field) => {
      if (field.type === 'date') {
        const dateValue = filterProps.filters?.[field.name] ? dayjs(filterProps.filters[field.name]) : null;

        return (
          <DatePicker
            key={field.name}
            placeholder={field.label}
            value={dateValue}
            onChange={(date, dateString) => {
              filterProps.onChange({
                ...filterProps.filters,
                [field.name]: dateString,
              });
            }}
            style={{ width: 180 }}
            allowClear
            disabledDate={(current) => current && current > dayjs().add(1, 'year')}
            showTime={false}
            format="YYYY-MM-DD"
          />
        );
      }
      if (field.type === 'select') {
        return (
          <div key={field.name} className="custom-floating" style={{ width: 180 }}>
            <Select
              allowClear
              placeholder=""
              onChange={(value) =>
                filterProps.onChange({
                  ...filterProps.filters,
                  [field.name]: value,
                })
              }
              className="input-label"
              style={{
                width: '100%',
                height: 36,
                fontSize: 14,
              }}
              value={filterProps.filters?.[field.name] || undefined}
            >
              {field.options.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
            <label className="floating-label">{field.label}</label>
          </div>
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
            {extraButtons} {/* Render extraButtons */}
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
            {shouldShowAddButton ? (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onAdd}
                disabled={loading}
              >
                {addButtonText}
              </Button>
            ) : showAddButton && !hideOnNoPermission && !canAddResource ? (
              <Tooltip title="Bạn không có quyền thêm mới">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  disabled
                >
                  {addButtonText}
                </Button>
              </Tooltip>
            ) : null}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="search-filter-section">
          {showSearch && (
            <Input
              className="search-input-v2"
              placeholder={searchPlaceholder}
              prefix={<SearchOutlined />}
              style={{ width: 220 }}
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
    extraButtons: PropTypes.node, // Thêm propTypes cho extraButtons
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
    // Permission-based props
    resourceName: PropTypes.string,
    requiredPermissions: PropTypes.arrayOf(PropTypes.string),
    addPermission: PropTypes.string,
    viewPermission: PropTypes.string,
    hideOnNoPermission: PropTypes.bool,
    permissionFallback: PropTypes.node,
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
  extraButtons, // Thêm prop extraButtons
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
  // Permission-based props
  resourceName, // e.g., 'foods', 'orders', 'users'
  requiredPermissions, // Custom permissions array
  addPermission, // Specific add permission (overrides resourceName:add)
  viewPermission, // Permission to view the page
  hideOnNoPermission = true, // Hide completely or show disabled
  permissionFallback, // Custom fallback component/content
  ...rest
}) => {
  const { hasPermission, canPerformAction, isSystemAdmin } = usePermissions();

  // Permission checking functions
  const checkAddPermission = () => {
    if (isSystemAdmin) return true;
    if (addPermission) return hasPermission(addPermission);
    if (resourceName) return canPerformAction('add', resourceName);
    if (requiredPermissions) return requiredPermissions.some(p => hasPermission(p));
    return true; // Default to true if no permissions specified
  };

  const checkViewPermission = () => {
    if (isSystemAdmin) return true;
    if (viewPermission) return hasPermission(viewPermission);
    if (resourceName) return canPerformAction('view', resourceName);
    return true; // Default to true if no permissions specified
  };

  // Check if user can view this page/component
  const canViewPage = checkViewPermission();
  if (!canViewPage && hideOnNoPermission) {
    return permissionFallback || <div>Bạn không có quyền truy cập trang này.</div>;
  }

  // Check add button permission
  const canAddResource = checkAddPermission();
  const shouldShowAddButton = showAddButton && canAddResource;
  const renderFilterField = (field) => {
    if (field.type === 'date') {
      return (
        <DatePicker
          key={field.name}
          placeholder={field.label}
          value={filterProps.filters?.[field.name] ? dayjs(filterProps.filters[field.name]) : null}
          onChange={(date, dateString) =>
            filterProps.onChange({
              ...filterProps.filters,
              [field.name]: dateString,
            })
          }
          style={{ width: 160 }}
          allowClear
          disabledDate={(current) => current && current > dayjs().add(1, 'year')}
          showTime={false}
          format="YYYY-MM-DD"
        />
      );
    }
    if (field.type === 'select') {
      return (
        <div key={field.name} className="custom-floating" style={{ width: 160 }}>
          <Select
            allowClear
            placeholder=""
            onChange={(value) =>
              filterProps.onChange({
                ...filterProps.filters,
                [field.name]: value,
              })
            }
            className="input-label"
            style={{
              width: '100%',
              height: 36,
              fontSize: 14,
            }}
            value={filterProps.filters?.[field.name] || undefined}
          >
            {field.options.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <label className="floating-label">{field.label}</label>
        </div>
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
        style={{ width: 160 }}
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
          {extraButtons} {/* Render extraButtons */}
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
          {shouldShowAddButton ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onAdd}
              disabled={loading}
            >
              {addButtonText}
            </Button>
          ) : showAddButton && !hideOnNoPermission && !canAddResource ? (
            <Tooltip title="Bạn không có quyền thêm mới">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                disabled
              >
                {addButtonText}
              </Button>
            </Tooltip>
          ) : null}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filter-section">
        {showSearch && (
          <Input
            className="search-input-v2"
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
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
  extraButtons: PropTypes.node, // Thêm propTypes cho extraButtons
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
  // Permission-based props
  resourceName: PropTypes.string,
  requiredPermissions: PropTypes.arrayOf(PropTypes.string),
  addPermission: PropTypes.string,
  viewPermission: PropTypes.string,
  hideOnNoPermission: PropTypes.bool,
  permissionFallback: PropTypes.node,
};

export default PageWrapperV2;

export { withPageWrapperV2 };