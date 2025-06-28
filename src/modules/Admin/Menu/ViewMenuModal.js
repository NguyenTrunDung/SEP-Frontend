import React from 'react';
import { Modal, Descriptions, Tag, Table, Spin, Alert, Empty } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, ShopOutlined } from '@ant-design/icons';
import { useMenu } from '../../../hooks/queries/useMenuQueries';
import { FoodImage } from '../../../components/common/ImageDisplay';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';

/**
 * ViewMenuModal component for displaying detailed menu information
 * Uses real API data from useMenu hook
 */
const ViewMenuModal = ({ open, onCancel, menuId }) => {
    // Fetch menu details using the useMenu hook
    const {
        data: menuData,
        loading,
        error
    } = useMenu(menuId, {
        enabled: open && !!menuId, // Only fetch when modal is open and menuId exists
    });

    // Debug logging for troubleshooting edit->view issues
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
            currency: 'VND'
        }).format(amount);
    };

    // Table columns for menu details
    const detailColumns = [
        {
            title: 'Món ăn',
            dataIndex: 'foodName',
            key: 'foodName',
            width: 200,
            render: (foodName, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FoodImage
                        src={record.food?.image}
                        alt={foodName}
                        size="small"
                        style={{ flexShrink: 0 }}
                    />
                    <div>
                        <div style={{ fontWeight: '500' }}>{foodName || 'N/A'}</div>
                        {record.food?.description && (
                            <div style={{
                                fontSize: '12px',
                                color: '#666',
                                marginTop: '4px'
                            }}>
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
                <Tag color={record.isQty ? 'blue' : 'default'}>
                    {qty || 1}
                </Tag>
            ),
        },
        {
            title: 'Giá khách',
            dataIndex: 'priceForGuest',
            key: 'priceForGuest',
            width: 120,
            align: 'right',
            render: (price) => (
                <span style={{ fontWeight: '500' }}>
                    {formatCurrency(price)}
                </span>
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
            title: 'Giảm giá',
            dataIndex: 'discountPrice',
            key: 'discountPrice',
            width: 120,
            align: 'right',
            render: (discount) => (
                <span style={{
                    fontWeight: '500',
                    color: discount > 0 ? '#fa8c16' : '#666'
                }}>
                    {discount > 0 ? formatCurrency(discount) : '-'}
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
            width={1200}
            destroyOnClose
            styles={{
                body: { padding: '24px' }
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
                        column={2}
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
                            <span style={{ fontWeight: '500' }}>
                                {formatDate(menuData.date)}
                            </span>
                        </Descriptions.Item>

                        <Descriptions.Item
                            label={
                                <span>
                                    <ClockCircleOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
                                    Buổi
                                </span>
                            }
                        >
                            <Tag color="blue">
                                {menuData.timeOfDay || 'Cả ngày'}
                            </Tag>
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
                            <Tag color="cyan">
                                ID: {menuData.branchId}
                            </Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Tổng số món">
                            <Tag color="blue" style={{ fontSize: '14px', fontWeight: '500' }}>
                                {menuData.details?.length || 0} món ăn
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>

                    {/* Menu Details Table */}
                    <div style={{ marginTop: '24px' }}>
                        <h3 style={{
                            marginBottom: '16px',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#262626'
                        }}>
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
                                }}
                                scroll={{ x: 800 }}
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
                    <div style={{
                        marginTop: '24px',
                        padding: '16px',
                        backgroundColor: '#fafafa',
                        borderRadius: '6px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '12px',
                            color: '#666'
                        }}>
                            <span>
                                Tạo lúc: {menuData.createdAt ? dayjs(menuData.createdAt).format('DD/MM/YYYY HH:mm:ss') : 'N/A'}
                            </span>
                            <span>
                                Cập nhật lúc: {menuData.updatedAt ? dayjs(menuData.updatedAt).format('DD/MM/YYYY HH:mm:ss') : 'N/A'}
                            </span>
                        </div>
                        {(menuData.createdBy || menuData.updatedBy) && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '12px',
                                color: '#666',
                                marginTop: '4px'
                            }}>
                                <span>Tạo bởi: {menuData.createdBy || 'N/A'}</span>
                                <span>Cập nhật bởi: {menuData.updatedBy || 'N/A'}</span>
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