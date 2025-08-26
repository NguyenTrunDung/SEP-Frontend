import React, { useEffect, useState } from 'react';
import {
    Modal,
    Input,
    Button,
    Select,
    Table,
    Switch,
    Row,
    Col,
    DatePicker,
    TimePicker,
    Popconfirm,
    message,
} from 'antd';
import moment from 'moment';
import './ViewOrderPatientDetail.css';
import { useUpdateOrder } from '../../../hooks/queries/useOrders';
import { useTimezone } from '../../../hooks/useTimezone';

const { Option } = Select;

const OrderPatientDetails = ({
    open,
    onCancel,
    orderData = {},
    orderDetails = [],
    branchId,
    onStatusChange,
}) => {
    const [formData, setFormData] = useState({});
    const { mutate: updateOrder, isLoading: isUpdating } = useUpdateOrder();
    const { format, convert } = useTimezone();

    useEffect(() => {
        if (orderData) {
            setFormData(orderData);
        }
        console.log('🔍 Patient Order details received:', orderDetails);
    }, [orderData, orderDetails]);

    const handleDeliverOrder = async () => {
        try {
            await updateOrder({
                orderId: orderData.id,
                branchId,
                newStatus: 'Delivered',
            });
            setFormData((prev) => ({ ...prev, status: 'Delivered' }));
            message.success('Đơn hàng đã được chuyển sang trạng thái Shipper nhận đơn và đi giao!');
            onStatusChange?.();
        } catch (error) {
            console.error('Lỗi giao hàng:', error);
            message.error('Chuyển trạng thái đơn hàng thất bại!');
        }
    };

    const handleCompleteOrder = async () => {
        try {
            await updateOrder({
                orderId: orderData.id,
                branchId,
                newStatus: 'Completed',
            });
            setFormData((prev) => ({ ...prev, status: 'Completed' }));
            message.success('Đơn hàng đã được hoàn thành!');
            onStatusChange?.();
        } catch (error) {
            console.error('Lỗi hoàn thành đơn:', error);
            message.error('Chuyển trạng thái đơn hàng thất bại!');
        }
    };

    const handleConfirmOrder = async () => {
        try {
            await updateOrder({
                orderId: orderData.id,
                orderData: {},
                branchId,
                newStatus: 'Confirmed',
            });
            setFormData((prev) => ({ ...prev, status: 'Confirmed' }));
            message.success('Đơn hàng đã được xác nhận!');
            onStatusChange?.();
        } catch (error) {
            console.error('Lỗi xác nhận đơn:', error);
            message.error('Chuyển trạng thái đơn hàng thất bại!');
        }
    };

    const handleCancelOrder = async () => {
        try {
            await updateOrder({
                orderId: orderData.id,
                branchId,
                newStatus: 'Cancelled',
            });
            setFormData((prev) => ({ ...prev, status: 'Cancelled' }));
            message.success('Đã hủy đơn hàng!');
            onStatusChange?.();
        } catch (error) {
            console.error('Lỗi hủy đơn:', error);
            message.error('Hủy đơn hàng thất bại!');
        }
    };

    const columns = [
        { title: '#', dataIndex: 'index', key: 'index', render: (_, __, idx) => idx + 1 },
        {
            title: 'TÊN MÓN',
            dataIndex: 'foodName',
            key: 'foodName',
            render: (foodName, record) => foodName || record.name || `Món ăn ID ${record.foodId || 'Unknown'}`,
        },
        {
            title: 'BUỔI ĂN',
            dataIndex: 'mealTime',
            key: 'mealTime',
            render: (mealTime) => mealTime || 'Chưa chọn'
        },
        {
            title: 'GIÁ TIỀN',
            dataIndex: 'price',
            key: 'price',
            render: (val) => format.currency(val) || '0'
        },
        {
            title: 'SỐ LƯỢNG',
            dataIndex: 'Qty',
            key: 'qty',
            render: (Qty) => Qty ?? 1,
        },
        { title: 'GHI CHÚ', dataIndex: 'note', key: 'note', render: (note) => note || '' },
        {
            title: 'TIỀN',
            dataIndex: 'total',
            key: 'total',
            render: (val) => format.currency(val) || '0'
        },
    ];

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            closable={false}
            width="100%"
            style={{ top: 0, padding: 0, height: '100vh' }}
            bodyStyle={{ height: '100vh', overflowY: 'auto', padding: 24 }}
            className="custom-view-modal"
        >
            <div className="order-patient-detail-wrapper">
                <Row justify="space-between" align="middle">
                    <Col><h2 style={{ fontWeight: 600 }}>Xem chi tiết đơn hàng bệnh nhân</h2></Col>
                    <Col>
                        <Button
                            danger
                            onClick={onCancel}
                            style={{
                                backgroundColor: '#ff4d4f',
                                color: '#fff',
                                border: 'none',
                                minWidth: 64,
                                height: 32,
                                fontSize: 14,
                            }}
                        >
                            X
                        </Button>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                        <label className="floating-label">Tên bệnh nhân</label>
                        <Input value={formData.customerName} disabled />
                    </Col>
                    <Col span={6}>
                        <label className="floating-label">Số điện thoại</label>
                        <Input value={formData.customerPhone} disabled />
                    </Col>
                    <Col span={6}>
                        <label className="floating-label">Ngày nhận</label>
                        <DatePicker
                            value={formData.receiveDate ? convert.toDatePicker(formData.receiveDate) : null}
                            disabled
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                        />
                    </Col>
                    <Col span={6}>
                        <label className="floating-label">Thời gian nhận</label>
                        <TimePicker
                            value={formData.receiveTime ? convert.timeForPicker(formData.receiveTime) : null}
                            disabled
                            style={{ width: '100%' }}
                            format="HH:mm"
                        />
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                        <label className="floating-label">Hình thức giao</label>
                        <Select value={formData.receiveType} disabled style={{ width: '100%' }}>
                            <Option value="take">Tự đến lấy</Option>
                            <Option value="delivery">Giao hàng</Option>
                        </Select>
                    </Col>
                    <Col span={6}>
                        <label className="floating-label">Địa chỉ</label>
                        <Input value={formData.customerAddress} disabled />
                    </Col>
                    <Col span={6}>
                        <label className="floating-label">Ghi chú</label>
                        <Input value={formData.note} disabled />
                    </Col>
                    <Col span={2}>
                        <div style={{ display: 'flex', alignItems: 'center', height: '100%', marginTop: 1 }}>
                            <Switch checked={formData.getTools} disabled style={{ marginRight: 8 }} />
                            <span style={{ color: '#6B7280', fontSize: 14, whiteSpace: 'nowrap' }}>
                                Lấy dụng cụ
                            </span>
                        </div>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                        <label className="floating-label">Trạng thái</label>
                        <Select value={formData.status} disabled style={{ width: '100%' }}>
                            <Option value="Pending">Đang chờ</Option>
                            <Option value="Confirmed">Đã xác nhận</Option>
                            <Option value="Delivered">Đang giao hàng</Option>
                            <Option value="Completed">Hoàn thành</Option>
                            <Option value="Cancelled">Hủy</Option>
                            <Option value="PendingPayment">Chờ thanh toán</Option>
                        </Select>
                    </Col>
                    <Col span={6}>
                        <label className="floating-label">Phí vận chuyển</label>
                        <Input value={formData.shippingFee} disabled />
                    </Col>
                    <Col span={6}>
                        <label className="floating-label">Thành tiền</label>
                        <Input value={formData.total} disabled />
                    </Col>
                    <Col span={6}>
                        <label className="floating-label">Vị trí</label>
                        <Input value={formData.location} disabled />
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
                    <Col span={6}>
                        <label className="floating-label">Khu vực</label>
                        <Input value={formData.area} disabled />
                    </Col>

                    <Col span={3}>
                        {(formData.status?.toLowerCase() === 'pending') ? (
                            <Button
                                type="primary"
                                style={{ width: '100%', backgroundColor: '#00B8A9', border: 'none' }}
                                onClick={handleConfirmOrder}
                                loading={isUpdating}
                            >
                                Xác Nhận
                            </Button>
                        ) : (formData.status?.toLowerCase() === 'confirmed') ? (
                            <Button
                                type="primary"
                                style={{ width: '100%', backgroundColor: '#0d8ce0', border: 'none' }}
                                onClick={handleDeliverOrder}
                                loading={isUpdating}
                            >
                                Đang giao hàng
                            </Button>
                        ) : formData.status?.toLowerCase() === 'delivered' ? (
                            <Button
                                type="primary"
                                style={{ width: '100%', backgroundColor: '#52c41a', border: 'none' }}
                                onClick={handleCompleteOrder}
                                loading={isUpdating}
                            >
                                Hoàn thành
                            </Button>
                        ) : null}
                    </Col>

                    {['pending', 'confirmed'].includes(formData.status?.toLowerCase()) && (
                        <Col span={3}>
                            <Popconfirm
                                title="Bạn có chắc muốn hủy đơn hàng này?"
                                onConfirm={handleCancelOrder}
                                okText="Hủy đơn"
                                cancelText="Thoát"
                                okButtonProps={{ danger: true }}
                            >
                                <Button
                                    danger
                                    style={{
                                        backgroundColor: '#ff4d4f',
                                        color: '#fff',
                                        border: 'none',
                                        width: '100%',
                                    }}
                                    loading={isUpdating}
                                >
                                    Hủy Đơn
                                </Button>
                            </Popconfirm>
                        </Col>
                    )}
                </Row>

                <Table
                    style={{ marginTop: 32 }}
                    columns={columns}
                    dataSource={orderDetails.map((item, index) => ({ ...item, key: index }))}
                    pagination={false}
                    bordered
                />
            </div>
        </Modal>
    );
};

export default OrderPatientDetails;
