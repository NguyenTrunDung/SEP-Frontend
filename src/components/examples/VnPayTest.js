import React, { useState } from 'react';
import { Card, Button, Form, Input, Select, message, Alert } from 'antd';
import { useCreateVnPayOrder } from '../../hooks/queries/userOrderQueries';
import { useCreateVnPayPayment } from '../../hooks/queries/paymentQueries';

const { Option } = Select;

const VnPayTest = () => {
    const [form] = Form.useForm();
    const [orderResult, setOrderResult] = useState(null);
    const [paymentUrl, setPaymentUrl] = useState(null);

    const createVnPayOrderMutation = useCreateVnPayOrder();
    const createVnPayPaymentMutation = useCreateVnPayPayment();

    const handleTestVnPay = async (values) => {
        try {
            // Test order data
            const orderData = {
                userId: null,
                customerName: values.customerName,
                customerPhone: values.customerPhone,
                customerAddress: values.customerAddress,
                receiveMethod: 'Giao tận nơi',
                receiveTime: '30 phút',
                paymentMethod: 'VNPay',
                note: 'Test VNPay order',
                includeUtensils: false,
                total: 50000,
                shippingFee: 5000,
                cartItems: [{
                    FoodId: 1,
                    dishName: "Test Dish",
                    price: 45000,
                    quantity: 1,
                    note: null
                }]
            };

            // Step 1: Create VNPay order
            const orderResponse = await createVnPayOrderMutation.mutateAsync({
                orderData,
                branchId: 1
            });

            setOrderResult(orderResponse);
            const orderId = orderResponse.data?.id || orderResponse.id;

            // Step 2: Create VNPay payment URL
            const paymentResponse = await createVnPayPaymentMutation.mutateAsync({
                orderId: orderId,
                amount: 50000
            });

            setPaymentUrl(paymentResponse.data || paymentResponse);
            message.success('VNPay test thành công!');

        } catch (error) {
            console.error('VNPay test failed:', error);
            message.error('VNPay test thất bại: ' + error.message);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
            <Card title="VNPay Integration Test">
                <Alert
                    message="VNPay Test"
                    description="Test VNPay order creation and payment URL generation"
                    type="info"
                    style={{ marginBottom: '24px' }}
                />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleTestVnPay}
                    initialValues={{
                        customerName: 'Test User',
                        customerPhone: '0123456789',
                        customerAddress: 'Test Address'
                    }}
                >
                    <Form.Item label="Customer Name" name="customerName" required>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Phone" name="customerPhone" required>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Address" name="customerAddress" required>
                        <Input />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={createVnPayOrderMutation.isPending || createVnPayPaymentMutation.isPending}
                            block
                        >
                            Test VNPay Integration
                        </Button>
                    </Form.Item>
                </Form>

                {orderResult && (
                    <Alert
                        message="Order Created"
                        description={`Order ID: ${orderResult.data?.id || orderResult.id}`}
                        type="success"
                        style={{ marginTop: '16px' }}
                    />
                )}

                {paymentUrl && (
                    <Alert
                        message="Payment URL Generated"
                        description={
                            <div>
                                <p>VNPay URL created successfully!</p>
                                <Button
                                    type="link"
                                    onClick={() => window.open(paymentUrl, '_blank')}
                                >
                                    Open VNPay (New Tab)
                                </Button>
                            </div>
                        }
                        type="success"
                        style={{ marginTop: '16px' }}
                    />
                )}
            </Card>
        </div>
    );
};

export default VnPayTest; 