import React, { useState } from 'react';
import { Card, Button, Form, Input, Select, message, Divider, Alert } from 'antd';
import { useCreateVnPayOrder, useCreateOrder } from '../../hooks/queries/userOrderQueries';
import { useCreateVnPayPayment } from '../../hooks/queries/paymentQueries';
import { useAuth } from '../../context/AuthContext';

const { Option } = Select;

/**
 * VNPay Integration Example Component
 * Demonstrates the complete VNPay payment flow
 */
const VnPayIntegrationExample = () => {
    const [form] = Form.useForm();
    const [orderResult, setOrderResult] = useState(null);
    const [paymentUrl, setPaymentUrl] = useState(null);

    const { user } = useAuth();
    const createVnPayOrderMutation = useCreateVnPayOrder();
    const createVnPayPaymentMutation = useCreateVnPayPayment();
    const createRegularOrderMutation = useCreateOrder();

    // Sample cart items for testing
    const sampleCartItems = [
        {
            FoodId: 1,
            dishName: "Cơm gà nướng",
            price: 45000,
            quantity: 2,
            note: "Ít cay"
        },
        {
            FoodId: 2,
            dishName: "Nước cam",
            price: 15000,
            quantity: 1,
            note: null
        }
    ];

    const sampleBranchId = 1; // Replace with actual branch ID

    const handleTestVnPayFlow = async (values) => {
        try {
            // Prepare order data
            const orderData = {
                userId: user?.id || null,
                customerName: values.customerName,
                customerPhone: values.customerPhone,
                customerAddress: values.customerAddress,
                receiveMethod: values.receiveMethod,
                receiveTime: values.receiveTime,
                paymentMethod: 'VNPay',
                note: values.note,
                includeUtensils: values.includeUtensils || false,
                total: values.total,
                shippingFee: values.receiveMethod === 'Giao tận nơi' ? 5000 : 0,
                cartItems: sampleCartItems
            };

            console.log('Testing VNPay flow with order data:', orderData);

            // Step 1: Create VNPay order
            message.loading('Đang tạo đơn hàng VNPay...', 0);
            const orderResponse = await createVnPayOrderMutation.mutateAsync({
                orderData,
                branchId: sampleBranchId
            });

            message.destroy();
            console.log('VNPay order created:', orderResponse);
            setOrderResult(orderResponse);

            // Extract order ID
            const orderId = orderResponse.data?.id || orderResponse.id;
            if (!orderId) {
                throw new Error('Không thể lấy ID đơn hàng');
            }

            // Step 2: Create VNPay payment URL
            message.loading('Đang tạo liên kết thanh toán...', 0);
            const paymentResponse = await createVnPayPaymentMutation.mutateAsync({
                orderId: orderId,
                amount: values.total
            });

            message.destroy();
            console.log('VNPay payment URL created:', paymentResponse);

            const vnpayUrl = paymentResponse.data || paymentResponse;
            setPaymentUrl(vnpayUrl);

            message.success('Tạo liên kết VNPay thành công!');

        } catch (error) {
            message.destroy();
            console.error('VNPay flow test failed:', error);
            message.error(error.message || 'Lỗi test VNPay flow');
        }
    };

    const handleTestRegularOrder = async (values) => {
        try {
            const orderData = {
                userId: user?.id || null,
                customerName: values.customerName,
                customerPhone: values.customerPhone,
                customerAddress: values.customerAddress,
                receiveMethod: values.receiveMethod,
                receiveTime: values.receiveTime,
                paymentMethod: values.paymentMethod,
                note: values.note,
                includeUtensils: values.includeUtensils || false,
                total: values.total,
                shippingFee: values.receiveMethod === 'Giao tận nơi' ? 5000 : 0,
                cartItems: sampleCartItems
            };

            console.log('Testing regular order with data:', orderData);

            const orderResponse = await createRegularOrderMutation.mutateAsync({
                orderData,
                branchId: sampleBranchId
            });

            console.log('Regular order created:', orderResponse);
            setOrderResult(orderResponse);

        } catch (error) {
            console.error('Regular order test failed:', error);
            message.error(error.message || 'Lỗi test đơn hàng thường');
        }
    };

    const handleRedirectToVnPay = () => {
        if (paymentUrl) {
            // Store test order ID for return processing
            const orderId = orderResult?.data?.id || orderResult?.id;
            localStorage.setItem('pendingVnPayOrderId', orderId);
            localStorage.setItem('pendingVnPayBranchId', sampleBranchId);

            // Open VNPay in new tab for testing
            window.open(paymentUrl, '_blank');
            message.info('VNPay đã mở trong tab mới. Sau khi thanh toán, kiểm tra trang /vnpay-return');
        }
    };

    const calculateTotal = () => {
        const subtotal = sampleCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shippingFee = form.getFieldValue('receiveMethod') === 'Giao tận nơi' ? 5000 : 0;
        const toolFee = form.getFieldValue('includeUtensils') ? 5000 : 0;
        return subtotal + shippingFee + toolFee;
    };

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <Card title="VNPay Integration Testing" style={{ marginBottom: '24px' }}>
                <Alert
                    message="VNPay Integration Test"
                    description="This component allows you to test the VNPay payment integration flow. Fill in the form and test both VNPay and regular order creation."
                    type="info"
                    showIcon
                    style={{ marginBottom: '24px' }}
                />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={(values) => {
                        const totalAmount = calculateTotal();
                        const formData = { ...values, total: totalAmount };

                        if (values.paymentMethod === 'VNPay') {
                            handleTestVnPayFlow(formData);
                        } else {
                            handleTestRegularOrder(formData);
                        }
                    }}
                    initialValues={{
                        customerName: 'Nguyễn Văn Test',
                        customerPhone: '0123456789',
                        customerAddress: 'Khoa Nội - Phòng 101',
                        receiveMethod: 'Giao tận nơi',
                        receiveTime: '30 phút',
                        paymentMethod: 'VNPay',
                        note: 'Đơn hàng test VNPay',
                        includeUtensils: false
                    }}
                >
                    <Form.Item
                        label="Tên khách hàng"
                        name="customerName"
                        rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Số điện thoại"
                        name="customerPhone"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Địa chỉ"
                        name="customerAddress"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Hình thức nhận hàng"
                        name="receiveMethod"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Option value="Giao tận nơi">Giao tận nơi</Option>
                            <Option value="Nhận tại quầy">Nhận tại quầy</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Thời gian giao hàng"
                        name="receiveTime"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Option value="30 phút">30 phút</Option>
                            <Option value="45 phút">45 phút</Option>
                            <Option value="60 phút">60 phút</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Phương thức thanh toán"
                        name="paymentMethod"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Option value="VNPay">VNPay (Test)</Option>
                            <Option value="Tiền mặt">Tiền mặt</Option>
                            <Option value="Thẻ ngân hàng">Thẻ ngân hàng</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Ghi chú" name="note">
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item name="includeUtensils" valuePropName="checked">
                        <input type="checkbox" style={{ marginRight: '8px' }} />
                        Lấy dụng cụ ăn (+5.000đ)
                    </Form.Item>

                    <div style={{
                        background: '#f5f5f5',
                        padding: '16px',
                        borderRadius: '4px',
                        marginBottom: '16px'
                    }}>
                        <h4>Chi tiết đơn hàng test:</h4>
                        {sampleCartItems.map((item, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '8px'
                            }}>
                                <span>{item.dishName} x{item.quantity}</span>
                                <span>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                            </div>
                        ))}
                        <Divider style={{ margin: '12px 0' }} />
                        <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Tổng cộng:</span>
                            <span>{calculateTotal().toLocaleString('vi-VN')}đ</span>
                        </div>
                    </div>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={createVnPayOrderMutation.isPending || createVnPayPaymentMutation.isPending || createRegularOrderMutation.isPending}
                            block
                        >
                            {Form.useWatch('paymentMethod', form) === 'VNPay' ? 'Test VNPay Flow' : 'Test Regular Order'}
                        </Button>
                    </Form.Item>
                </Form>

                {orderResult && (
                    <Card title="Kết quả tạo đơn hàng" style={{ marginTop: '24px' }}>
                        <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                            {JSON.stringify(orderResult, null, 2)}
                        </pre>
                    </Card>
                )}

                {paymentUrl && (
                    <Card title="VNPay Payment URL" style={{ marginTop: '24px' }}>
                        <p>Payment URL đã được tạo thành công:</p>
                        <div style={{
                            background: '#f0f2f5',
                            padding: '12px',
                            borderRadius: '4px',
                            wordBreak: 'break-all',
                            marginBottom: '12px'
                        }}>
                            {paymentUrl}
                        </div>
                        <Button type="primary" onClick={handleRedirectToVnPay}>
                            Mở VNPay để test thanh toán
                        </Button>
                        <p style={{ marginTop: '8px', color: '#666' }}>
                            Sau khi thanh toán trên VNPay, kiểm tra trang <code>/vnpay-return</code> để xem kết quả.
                        </p>
                    </Card>
                )}
            </Card>
        </div>
    );
};

export default VnPayIntegrationExample; 