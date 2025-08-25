import React from 'react';
import { Modal, Descriptions, Tag, Table, Spin, Alert, Empty } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, ShopOutlined } from '@ant-design/icons';
import { useMenu } from '../../../hooks/queries/useMenuQueries';
import { useBranches } from '../../../hooks/queries/userBranchesQueries';
import { useAuth } from '../../../context/AuthContext';
import { FoodImage } from '../../../components/common/ImageDisplay';
import { useTimezone } from '../../../hooks/useTimezone';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

// Custom CSS for responsive design
const responsiveStyles = `
  .responsive-modal {
    width: 100% !important;
    max-width: 1200px;
  }

  .food-image-container {
    width: 48px !important;
    height: 48px !important;
    max-width: 48px;
    max-height: 48px;
    object-fit: cover;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .food-name-container {
    flex: 1;
    min-width: 100px;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .food-name-container .food-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .food-name-container .food-description {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 768px) {
    .responsive-modal {
      width: 90% !important;
      max-width: none;
    }

    .ant-descriptions-item-label {
      font-size: 14px;
    }

    .ant-descriptions-item-content {
      font-size: 14px;
    }

    .menu-details-table .ant-table {
      font-size: 12px;
    }

    .menu-details-table .ant-table-cell {
      padding: 6px !important;
    }

    .food-image-container {
      width: 36px !important;
      height: 36px !important;
      max-width: 36px;
      max-height: 36px;
    }

    .food-name-container {
      min-width: 80px;
      max-width: 120px;
      font-size: 11px;
    }
  }

  @media (max-width: 576px) {
    .responsive-modal {
      width: 95% !important;
      top: 10px;
    }

    .ant-descriptions-item-label,
    .ant-descriptions-item-content {
      font-size: 12px;
    }

    .ant-descriptions-title {
      font-size: 16px !important;
    }

    .menu-details-table .ant-table-cell {
      padding: 4px !important;
    }

    .food-image-container {
      width: 28px !important;
      height: 28px !important;
      max-width: 28px;
      max-height: 28px;
    }

    .food-name-container {
      min-width: 60px;
      max-width: 100px;
      font-size: 10px;
    }
  }
`;

/**
 * ViewMenuModal component for displaying detailed menu information
 * Uses real API data from useMenu hook
 * Enhanced for full responsiveness
 */
const ViewMenuModal = ({ open, onCancel, menuId }) => {
  // Inject custom styles
  React.useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.innerText = responsiveStyles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  // Fetch menu details using the useMenu hook
  const {
    data: menuData,
    loading,
    error,
  } = useMenu(menuId, {
    enabled: open && !!menuId,
  });

  // Fetch branches for branch name mapping
  const { data: branches } = useBranches();

  // Get current user for user information mapping
  const { user: currentUser } = useAuth();

  // Debug logging
  React.useEffect(() => {
    if (open && menuId) {
      console.log('👁️ ViewMenuModal - Opening with menuId:', menuId);
      console.log('👁️ ViewMenuModal - Loading state:', loading);
      console.log('👁️ ViewMenuModal - Error state:', error);
      console.log('👁️ ViewMenuModal - Menu data:', menuData);
    }
  }, [open, menuId, loading, error, menuData]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString;
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (!amount) return '0 VND';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Get branch name by ID
  const getBranchName = (branchId) => {
    if (!branches || !branchId) return 'N/A';
    const branch = branches.find((b) => b.id === branchId);
    return branch ? branch.name : `ID: ${branchId}`;
  };

  // Get user information by ID
  const getUserInfo = (userId) => {
    if (!userId) return 'N/A';
    if (currentUser && currentUser.id === userId) {
      return (
        currentUser.fullName ||
        `${currentUser.firstName} ${currentUser.lastName}`.trim() ||
        currentUser.email ||
        'N/A'
      );
    }
    return `User ID: ${userId}`;
  };

  // Responsive table columns
  const detailColumns = [
    {
      title: 'Món ăn',
      dataIndex: 'foodName',
      key: 'foodName',
      align: 'left',
      width: 200,
      render: (foodName, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FoodImage
            src={record.food?.image || 'https://via.placeholder.com/48'} // Fallback image
            alt={foodName || 'No image'}
            size="small"
            className="food-image-container"
          />
          <div className="food-name-container">
            <div className="food-name" style={{ fontWeight: '500' }}>
              {foodName || 'N/A'}
            </div>
            {record.food?.description && (
              <div className="food-description" style={{ color: '#666', marginTop: '2px' }}>
                {record.food.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'qty',
      key: 'qty',
      width: 100,
      align: 'center',
      render: (qty, record) => (
        <Tag color={record.isQty ? 'blue' : 'default'}>{qty || 1}</Tag>
      ),
    },
    {
      title: 'Giá khách',
      dataIndex: 'priceForGuest',
      key: 'priceForGuest',
      width: 120,
      align: 'right',
      render: (price) => (
        <span style={{ fontWeight: '500' }}>{formatCurrency(price)}</span>
      ),
    },
    {
      title: 'Giá bệnh nhân',
      dataIndex: 'priceForPatient',
      key: 'priceForPatient',
      width: 120,
      align: 'right',
      render: (price) => (
        <span style={{ fontWeight: '500', color: '#52c41a' }}>
          {formatCurrency(price)}
        </span>
      ),
    },
    {
      title: 'Giá nhân viên',
      dataIndex: 'priceForStaff',
      key: 'priceForStaff',
      width: 120,
      align: 'right',
      render: (price) => (
        <span style={{ fontWeight: '500', color: '#1890ff' }}>
          {formatCurrency(price)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => (
        <Tag color={status ? 'green' : 'red'}>
          {status ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarOutlined style={{ color: '#1890ff' }} />
          Chi tiết thực đơn
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      className="responsive-modal"
      destroyOnClose
      styles={{
        body: { padding: '24px' },
        content: { padding: '0' },
      }}
    >
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px', color: '#666' }}>
            Đang tải thông tin menu...
          </div>
        </div>
      )}

      {error && (
        <Alert
          message="Lỗi tải dữ liệu"
          description={error.message || 'Không thể tải thông tin menu. Vui lòng thử lại sau.'}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      {menuData && !loading && !error && (
        <div>
          {/* Menu Basic Information */}
          <Descriptions
            title="Thông tin cơ bản"
            bordered
            column={{ xs: 1, sm: 2, md: 2 }} // Responsive columns
            style={{ marginBottom: '24px' }}
          >
            <Descriptions.Item
              label={
                <span>
                  <CalendarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  Tên menu
                </span>
              }
            >
              <span style={{ fontWeight: '500', fontSize: '16px' }}>
                {menuData.name || 'N/A'}
              </span>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span>
                  <CalendarOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                  Ngày
                </span>
              }
            >
              <span style={{ fontWeight: '500' }}>{formatDate(menuData.date)}</span>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span>
                  <ClockCircleOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
                  Buổi
                </span>
              }
            >
              <Tag color="blue">{menuData.timeOfDay || 'Cả ngày'}</Tag>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span>
                  <ClockCircleOutlined style={{ marginRight: '8px', color: '#722ed1' }} />
                  Thời gian phục vụ
                </span>
              }
            >
              <Tag color={menuData.isTime ? 'green' : 'red'}>
                {menuData.isTime ? 'Có giới hạn thời gian' : 'Cả ngày'}
              </Tag>
            </Descriptions.Item>

            {menuData.isTime && (
              <>
                <Descriptions.Item label="Thời gian từ">
                  <span style={{ fontWeight: '500' }}>
                    {formatTime(menuData.timeFrom)}
                  </span>
                </Descriptions.Item>

                <Descriptions.Item label="Thời gian đến">
                  <span style={{ fontWeight: '500' }}>
                    {formatTime(menuData.timeTo)}
                  </span>
                </Descriptions.Item>
              </>
            )}

            <Descriptions.Item
              label={
                <span>
                  <ShopOutlined style={{ marginRight: '8px', color: '#13c2c2' }} />
                  Chi nhánh
                </span>
              }
            >
              <Tag color="cyan">{getBranchName(menuData.branchId)}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Tổng số món">
              <Tag color="blue" style={{ fontSize: '14px', fontWeight: '500' }}>
                {menuData.details?.length || 0} món ăn
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          {/* Menu Details Table */}
          <div style={{ marginTop: '24px' }} className="menu-details-table">
            <h3
              style={{
                marginBottom: '16px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#262626',
              }}
            >
              Chi tiết món ăn ({menuData.details?.length || 0} món)
            </h3>

            {menuData.details && menuData.details.length > 0 ? (
              <Table
                columns={detailColumns}
                dataSource={menuData.details}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} món ăn`,
                  responsive: true,
                }}
                scroll={{ x: 'max-content' }} // Ensure horizontal scroll on small screens
                size="middle"
              />
            ) : (
              <Empty
                description="Chưa có món ăn nào trong menu này"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>

          {/* Metadata */}
          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#fafafa',
              borderRadius: '6px',
            }}
            className="menu-metadata"
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#666',
              }}
            >
              <span>
                Tạo lúc:{' '}
                {menuData.createdAt
                  ? dayjs(menuData.createdAt).format('DD/MM/YYYY HH:mm:ss')
                  : 'N/A'}
              </span>
              <span>
                Cập nhật lúc:{' '}
                {menuData.updatedAt
                  ? dayjs(menuData.updatedAt).format('DD/MM/YYYY HH:mm:ss')
                  : 'N/A'}
              </span>
            </div>
            {(menuData.createdBy || menuData.updatedBy) && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '4px',
                }}
              >
                <span>Tạo bởi: {getUserInfo(menuData.createdBy)}</span>
                <span>Cập nhật bởi: {getUserInfo(menuData.updatedBy)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

ViewMenuModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  menuId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ViewMenuModal;