import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Input, Select, message, Divider, Alert, Space, Typography, Tag, Steps } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useCreateVnPayOrder, useCreateOrder } from '../../hooks/queries/userOrderQueries';
import { useCreateVnPayPayment } from '../../hooks/queries/paymentQueries';
import { useAuth } from '../../context/AuthContext';
import { useBranches } from '../../hooks/queries/userBranchesQueries';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

/**
 * VNPay Integration Complete Test Component
 * Tests the full VNPay payment flow with backend redirect
 */
const VnPayIntegrationExample = () => {
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [orderResult, setOrderResult] = useState(null);
    const [paymentUrl, setPaymentUrl] = useState(null);
    const [testMode, setTestMode] = useState('vnpay');

    const { user } = useAuth();
    const { data: branches } = useBranches();
    const createVnPayOrderMutation = useCreateVnPayOrder();
    const createVnPayPaymentMutation = useCreateVnPayPayment();
    const createRegularOrderMutation = useCreateOrder();

    // Realistic sample cart items for testing
    const sampleCartItems = [
        {
            FoodId: 1,
            dishName: "Cơm gà nướng mật ong",
            price: 65000,
            quantity: 1,
            note: "Ít cay, không hành"
        },
        {
            FoodId: 2,
            dishName: "Canh chua cá lóc",
            price: 45000,
            quantity: 1,
            note: null
        },
        {
            FoodId: 3,
            dishName: "Nước cam tươi",
            price: 25000,
            quantity: 2,
            note: "Ít đá"
        }
    ];

    // Get first available branch or default to 1
    const selectedBranchId = branches && branches.length > 0 ? branches[0].id : 1;

    useEffect(() => {
        // Log current stored order info
        const storedOrderId = localStorage.getItem('pendingVnPayOrderId');
        const storedBranchId = localStorage.getItem('pendingVnPayBranchId');

        if (storedOrderId || storedBranchId) {
            console.log('Found stored VNPay order info:', {
                orderId: storedOrderId,
                branchId: storedBranchId
            });
        }
    }, []);

    const calculateTotal = () => {
        const subtotal = sampleCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shippingFee = form.getFieldValue('receiveMethod') === 'Giao tận nơi' ? 15000 : 0;
        const toolFee = form.getFieldValue('includeUtensils') ? 5000 : 0;
        return subtotal + shippingFee + toolFee;
    };

    const handleTestVnPayFlow = async (values) => {
        try {
            setCurrentStep(1);

            // Prepare comprehensive order data
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
                shippingFee: values.receiveMethod === 'Giao tận nơi' ? 15000 : 0,
                cartItems: sampleCartItems
            };

            console.log('🔄 Step 1: Creating VNPay order with data:', orderData);

            // Step 1: Create VNPay order
            message.loading('Đang tạo đơn hàng VNPay...', 0);
            const orderResponse = await createVnPayOrderMutation.mutateAsync({
                orderData,
                branchId: selectedBranchId
            });

            message.destroy();
            console.log('✅ Step 1 Complete: VNPay order created:', orderResponse);
            setOrderResult(orderResponse);
            setCurrentStep(2);

            // Extract order ID with better error handling
            const orderId = orderResponse.data?.id || orderResponse.id;
            if (!orderId) {
                throw new Error('Không thể lấy ID đơn hàng từ response');
            }

            console.log(`📝 Storing order info: OrderID=${orderId}, BranchID=${selectedBranchId}`);

            // Store order info BEFORE creating payment URL
            localStorage.setItem('pendingVnPayOrderId', orderId.toString());
            localStorage.setItem('pendingVnPayBranchId', selectedBranchId.toString());

            // Step 2: Create VNPay payment URL
            message.loading('Đang tạo liên kết thanh toán VNPay...', 0);
            const paymentResponse = await createVnPayPaymentMutation.mutateAsync({
                orderId: orderId,
                amount: values.total
            });

            message.destroy();
            console.log('✅ Step 2 Complete: VNPay payment URL created:', paymentResponse);

            const vnpayUrl = paymentResponse.data || paymentResponse;
            setPaymentUrl(vnpayUrl);
            setCurrentStep(3);

            message.success({
                content: 'Tạo liên kết VNPay thành công! Sẵn sàng để thanh toán.',
                duration: 3
            });

        } catch (error) {
            message.destroy();
            console.error('❌ VNPay flow test failed:', error);
            message.error({
                content: error.message || 'Lỗi test VNPay flow',
                duration: 5
            });
            setCurrentStep(0);
        }
    };

    const handleTestRegularOrder = async (values) => {
        try {
            setCurrentStep(1);

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
                shippingFee: values.receiveMethod === 'Giao tận nơi' ? 15000 : 0,
                cartItems: sampleCartItems
            };

            console.log('🔄 Creating regular order with data:', orderData);

            const orderResponse = await createRegularOrderMutation.mutateAsync({
                orderData,
                branchId: selectedBranchId
            });

            console.log('✅ Regular order created:', orderResponse);
            setOrderResult(orderResponse);
            setCurrentStep(2);
            message.success('Tạo đơn hàng thường thành công!');

        } catch (error) {
            console.error('❌ Regular order test failed:', error);
            message.error(error.message || 'Lỗi test đơn hàng thường');
            setCurrentStep(0);
        }
    };

    const handleRedirectToVnPay = () => {
        if (paymentUrl) {
            console.log('🚀 Redirecting to VNPay URL:', paymentUrl);

            // Final verification of stored data
            const storedOrderId = localStorage.getItem('pendingVnPayOrderId');
            const storedBranchId = localStorage.getItem('pendingVnPayBranchId');

            console.log('📋 Final verification before redirect:', {
                storedOrderId,
                storedBranchId,
                paymentUrl
            });

            if (!storedOrderId || !storedBranchId) {
                message.error('Thiếu thông tin đơn hàng! Vui lòng tạo lại đơn hàng.');
                return;
            }

            message.info({
                content: 'Đang chuyển hướng đến VNPay... Sau khi thanh toán, bạn sẽ được chuyển về trang kết quả.',
                duration: 3
            });

            // Redirect to VNPay (in same window for production-like testing)
            setTimeout(() => {
                window.location.href = paymentUrl;
            }, 1000);
        }
    };

    const resetTest = () => {
        setCurrentStep(0);
        setOrderResult(null);
        setPaymentUrl(null);
        localStorage.removeItem('pendingVnPayOrderId');
        localStorage.removeItem('pendingVnPayBranchId');
        form.resetFields();
        message.success('Reset test thành công!');
    };

    const steps = [
        {
            title: 'Chuẩn bị',
            description: 'Điền thông tin đơn hàng'
        },
        {
            title: 'Tạo đơn hàng',
            description: testMode === 'vnpay' ? 'Tạo đơn hàng VNPay' : 'Tạo đơn hàng thường'
        },
        {
            title: 'Tạo thanh toán',
            description: testMode === 'vnpay' ? 'Tạo liên kết VNPay' : 'Hoàn thành'
        },
        {
            title: 'Thanh toán',
            description: 'Chuyển hướng VNPay'
        }
    ];

    return (
        <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
            <Card>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Title level={2}>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                        VNPay Integration Complete Test
                    </Title>
                    <Paragraph type="secondary">
                        Test hoàn chỉnh flow thanh toán VNPay với backend redirect logic mới
                    </Paragraph>
                </div>

                {/* Test Mode Selection */}
                <Card size="small" style={{ marginBottom: '24px', background: '#f8f9fa' }}>
                    <Space>
                        <Text strong>Chế độ test:</Text>
                        <Tag
                            color={testMode === 'vnpay' ? 'blue' : 'default'}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setTestMode('vnpay')}
                        >
                            VNPay Flow
                        </Tag>
                        <Tag
                            color={testMode === 'regular' ? 'green' : 'default'}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setTestMode('regular')}
                        >
                            Regular Order
                        </Tag>
                        <Button size="small" onClick={resetTest}>Reset</Button>
                    </Space>
                </Card>

                {/* Progress Steps */}
                <Steps current={currentStep} style={{ marginBottom: '32px' }}>
                    {steps.map((step, index) => (
                        <Step
                            key={index}
                            title={step.title}
                            description={step.description}
                            status={currentStep === index ? 'process' : currentStep > index ? 'finish' : 'wait'}
                        />
                    ))}
                </Steps>

                {/* Important Instructions */}
                <Alert
                    message="Hướng dẫn test VNPay flow"
                    description={
                        <div>
                            <p><strong>Bước 1:</strong> Điền form và nhấn "Test VNPay Flow"</p>
                            <p><strong>Bước 2:</strong> Đợi tạo đơn hàng và payment URL thành công</p>
                            <p><strong>Bước 3:</strong> Nhấn "Thanh toán VNPay" để chuyển hướng</p>
                            <p><strong>Bước 4:</strong> Thanh toán trên VNPay (sử dụng thẻ test)</p>
                            <p><strong>Bước 5:</strong> Sau thanh toán, backend sẽ tự động redirect về <code>/vnpay-return</code></p>
                            <p><strong>Thẻ test VNPay:</strong> 9704198526191432198, MM/YY: 07/15, OTP: 123456</p>
                        </div>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: '24px' }}
                />

                {/* Test Form */}
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={(values) => {
                        const totalAmount = calculateTotal();
                        const formData = { ...values, total: totalAmount };

                        if (testMode === 'vnpay') {
                            handleTestVnPayFlow(formData);
                        } else {
                            handleTestRegularOrder(formData);
                        }
                    }}
                    initialValues={{
                        customerName: 'Nguyễn Văn Test',
                        customerPhone: '0987654321',
                        customerAddress: 'Khoa Nội Tổng Hợp - Phòng 205',
                        receiveMethod: 'Giao tận nơi',
                        receiveTime: '45 phút',
                        paymentMethod: testMode === 'vnpay' ? 'VNPay' : 'Tiền mặt',
                        note: `Đơn hàng test ${testMode} - ${new Date().toLocaleString('vi-VN')}`,
                        includeUtensils: true
                    }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            label="Tên khách hàng"
                            name="customerName"
                            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
                        >
                            <Input placeholder="Nhập tên khách hàng" />
                        </Form.Item>

                        <Form.Item
                            label="Số điện thoại"
                            name="customerPhone"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại' },
                                { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                            ]}
                        >
                            <Input placeholder="Nhập số điện thoại" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        label="Địa chỉ giao hàng"
                        name="customerAddress"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                    >
                        <Input placeholder="Ví dụ: Khoa Nội - Phòng 101" />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            label="Hình thức nhận hàng"
                            name="receiveMethod"
                            rules={[{ required: true }]}
                        >
                            <Select>
                                <Option value="Giao tận nơi">Giao tận nơi (+15.000đ)</Option>
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
                                <Option value="90 phút">90 phút</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Phương thức thanh toán"
                            name="paymentMethod"
                            rules={[{ required: true }]}
                        >
                            <Select disabled={testMode === 'vnpay'}>
                                <Option value="VNPay">VNPay (Test)</Option>
                                <Option value="Tiền mặt">Tiền mặt</Option>
                                <Option value="Thẻ ngân hàng">Thẻ ngân hàng</Option>
                                <Option value="Chuyển khoản">Chuyển khoản</Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item label="Ghi chú đặc biệt" name="note">
                        <Input.TextArea
                            rows={2}
                            placeholder="Ví dụ: Giao đúng giờ, gọi điện trước khi giao..."
                        />
                    </Form.Item>

                    <Form.Item name="includeUtensils" valuePropName="checked">
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                            <input type="checkbox" style={{ marginRight: '8px' }} />
                            <span>Lấy dụng cụ ăn (+5.000đ)</span>
                        </label>
                    </Form.Item>

                    {/* Order Summary */}
                    <Card
                        title="Chi tiết đơn hàng"
                        size="small"
                        style={{ marginBottom: '24px', background: '#fafafa' }}
                    >
                        {sampleCartItems.map((item, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '8px',
                                padding: '4px 0'
                            }}>
                                <div>
                                    <Text strong>{item.dishName}</Text>
                                    <Text type="secondary"> x{item.quantity}</Text>
                                    {item.note && <div style={{ fontSize: '12px', color: '#666' }}>Ghi chú: {item.note}</div>}
                                </div>
                                <Text strong>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</Text>
                            </div>
                        ))}

                        <Divider style={{ margin: '12px 0' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <Text>Tạm tính:</Text>
                            <Text>{sampleCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString('vi-VN')}đ</Text>
                        </div>

                        {Form.useWatch('receiveMethod', form) === 'Giao tận nơi' && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <Text>Phí giao hàng:</Text>
                                <Text>15.000đ</Text>
                            </div>
                        )}

                        {Form.useWatch('includeUtensils', form) && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <Text>Dụng cụ ăn:</Text>
                                <Text>5.000đ</Text>
                            </div>
                        )}

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            borderTop: '1px solid #d9d9d9',
                            paddingTop: '8px',
                            marginTop: '8px'
                        }}>
                            <span>Tổng cộng:</span>
                            <span style={{ color: '#f5222d' }}>{calculateTotal().toLocaleString('vi-VN')}đ</span>
                        </div>
                    </Card>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={createVnPayOrderMutation.isPending || createVnPayPaymentMutation.isPending || createRegularOrderMutation.isPending}
                            block
                            size="large"
                            disabled={currentStep > 0}
                        >
                            {testMode === 'vnpay' ? '🚀 Test VNPay Flow' : '📝 Test Regular Order'}
                        </Button>
                    </Form.Item>
                </Form>

                {/* Results Display */}
                {orderResult && (
                    <Card
                        title={<><CheckCircleOutlined style={{ color: '#52c41a' }} /> Kết quả tạo đơn hàng</>}
                        style={{ marginTop: '24px' }}
                    >
                        <div style={{ marginBottom: '16px' }}>
                            <Tag color="green">Đơn hàng đã tạo thành công</Tag>
                            <Tag color="blue">ID: {orderResult.data?.id || orderResult.id}</Tag>
                            {selectedBranchId && <Tag color="orange">Branch: {selectedBranchId}</Tag>}
                        </div>
                        <details style={{ marginTop: '12px' }}>
                            <summary style={{ cursor: 'pointer', color: '#1890ff' }}>
                                Xem chi tiết response (Click để mở)
                            </summary>
                            <pre style={{
                                background: '#f5f5f5',
                                padding: '12px',
                                borderRadius: '4px',
                                marginTop: '8px',
                                overflow: 'auto',
                                maxHeight: '300px'
                            }}>
                                {JSON.stringify(orderResult, null, 2)}
                            </pre>
                        </details>
                    </Card>
                )}

                {paymentUrl && (
                    <Card
                        title={<><ExclamationCircleOutlined style={{ color: '#faad14' }} /> VNPay Payment Ready</>}
                        style={{ marginTop: '24px' }}
                    >
                        <Alert
                            message="Payment URL đã được tạo thành công!"
                            description="Nhấn nút bên dưới để chuyển hướng đến VNPay và thực hiện thanh toán test."
                            type="success"
                            showIcon
                            style={{ marginBottom: '16px' }}
                        />

                        <div style={{
                            background: '#f0f2f5',
                            padding: '12px',
                            borderRadius: '4px',
                            wordBreak: 'break-all',
                            marginBottom: '16px',
                            fontSize: '12px',
                            maxHeight: '100px',
                            overflow: 'auto'
                        }}>
                            <Text type="secondary">Payment URL:</Text><br />
                            {paymentUrl}
                        </div>

                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button
                                type="primary"
                                size="large"
                                onClick={handleRedirectToVnPay}
                                style={{ width: '100%' }}
                            >
                                💳 Thanh toán VNPay (Redirect đến sandbox)
                            </Button>

                            <Alert
                                message="Thông tin thẻ test VNPay"
                                description={
                                    <div>
                                        <p><strong>Số thẻ:</strong> 9704198526191432198</p>
                                        <p><strong>Tên chủ thẻ:</strong> NGUYEN VAN A</p>
                                        <p><strong>Ngày hết hạn:</strong> 07/15</p>
                                        <p><strong>Mã OTP:</strong> 123456</p>
                                    </div>
                                }
                                type="info"
                                showIcon
                            />
                        </Space>
                    </Card>
                )}

                {/* Debug Info */}
                <Card
                    title={<><InfoCircleOutlined /> Debug Information</>}
                    size="small"
                    style={{ marginTop: '24px' }}
                >
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        <p><strong>Current User:</strong> {user ? `${user.fullName} (ID: ${user.id})` : 'Guest'}</p>
                        <p><strong>Selected Branch:</strong> {selectedBranchId}</p>
                        <p><strong>Test Mode:</strong> {testMode}</p>
                        <p><strong>Current Step:</strong> {currentStep}</p>
                        <p><strong>Stored Order ID:</strong> {localStorage.getItem('pendingVnPayOrderId') || 'None'}</p>
                        <p><strong>Stored Branch ID:</strong> {localStorage.getItem('pendingVnPayBranchId') || 'None'}</p>
                        <p><strong>Timestamp:</strong> {new Date().toLocaleString('vi-VN')}</p>
                    </div>
                </Card>
            </Card>
        </div>
    );
};

export default VnPayIntegrationExample; 