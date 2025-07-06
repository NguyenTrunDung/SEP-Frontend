import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Result, Button, Spin, Card, Alert, Typography, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, HomeOutlined, HistoryOutlined } from '@ant-design/icons';
import { useProcessVnPayReturn } from '../../hooks/queries/paymentQueries';
import { useUpdateOrderPaymentStatus } from '../../hooks/queries/userOrderQueries';

const { Title, Text } = Typography;

const VnPayReturn = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(true);
    const [paymentResult, setPaymentResult] = useState(null);
    const [error, setError] = useState(null);

    const processVnPayReturnMutation = useProcessVnPayReturn();
    const updateOrderPaymentMutation = useUpdateOrderPaymentStatus();

    useEffect(() => {
        const processPaymentReturn = async () => {
            try {
                setProcessing(true);
                setError(null);

                // Get query parameters from URL
                const queryParams = new URLSearchParams(location.search);
                const queryObject = {};
                for (let [key, value] of queryParams) {
                    queryObject[key] = value;
                }

                console.log('VNPay return query params:', queryObject);

                // Check if this is a direct redirect from backend (contains status, orderId, etc.)
                const isDirectRedirect = queryObject.status || queryObject.vnp_TransactionStatus;

                if (isDirectRedirect) {
                    // Handle direct redirect from backend
                    await handleDirectRedirect(queryObject);
                } else {
                    // Handle traditional flow with API call
                    await handleApiFlow(queryObject);
                }

            } catch (error) {
                console.error('Error processing VNPay return:', error);
                setError(error.message || 'Có lỗi xảy ra khi xử lý thanh toán');

                // Clean up stored data on error
                localStorage.removeItem('pendingVnPayOrderId');
                localStorage.removeItem('pendingVnPayBranchId');
            } finally {
                setProcessing(false);
            }
        };

        const handleDirectRedirect = async (queryObject) => {
            const isSuccess = queryObject.status === 'success' || queryObject.vnp_TransactionStatus === '00';
            const orderId = queryObject.orderId || localStorage.getItem('pendingVnPayOrderId');
            const message = queryObject.message || (isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại');

            setPaymentResult({
                success: isSuccess,
                orderId: orderId,
                message: message,
                transactionId: queryObject.vnp_TxnRef || queryObject.transactionId,
                amount: queryObject.vnp_Amount || queryObject.amount
            });

            // Clean up stored data
            localStorage.removeItem('pendingVnPayOrderId');
            localStorage.removeItem('pendingVnPayBranchId');
        };

        const handleApiFlow = async (queryObject) => {
            // Get stored order information
            const pendingOrderId = localStorage.getItem('pendingVnPayOrderId');
            const pendingBranchId = localStorage.getItem('pendingVnPayBranchId');

            if (!pendingOrderId) {
                throw new Error('Không tìm thấy thông tin đơn hàng');
            }

            // Process VNPay return with backend
            const vnpayResult = await processVnPayReturnMutation.mutateAsync(queryObject);

            console.log('VNPay processing result:', vnpayResult);

            // Determine if payment was successful
            const isPaymentSuccessful = vnpayResult.status === 'success';

            // Update order payment status in database
            if (pendingOrderId && pendingBranchId) {
                await updateOrderPaymentMutation.mutateAsync({
                    orderId: pendingOrderId,
                    isPaid: isPaymentSuccessful,
                    branchId: pendingBranchId
                });
            }

            // Set result for UI display
            setPaymentResult({
                success: isPaymentSuccessful,
                orderId: pendingOrderId,
                message: vnpayResult.message || (isPaymentSuccessful ? 'Thanh toán thành công!' : 'Thanh toán thất bại'),
                transactionId: vnpayResult.transactionId,
                amount: vnpayResult.amount
            });

            // Clean up stored data
            localStorage.removeItem('pendingVnPayOrderId');
            localStorage.removeItem('pendingVnPayBranchId');
        };

        processPaymentReturn();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleViewOrders = () => {
        navigate('/order-history');
    };

    const handleRetryPayment = () => {
        navigate('/payment');
    };

    if (processing) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                flexDirection: 'column',
                gap: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
            }}>
                <Spin size="large" style={{ color: 'white' }} />
                <Title level={3} style={{ color: 'white', margin: 0 }}>
                    Đang xử lý kết quả thanh toán...
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Vui lòng đợi trong giây lát
                </Text>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
                <Result
                    status="error"
                    title="Lỗi xử lý thanh toán"
                    subTitle={error}
                    extra={[
                        <Button type="primary" key="home" onClick={handleBackToHome}>
                            Về trang chủ
                        </Button>,
                        <Button key="retry" onClick={handleRetryPayment}>
                            Thử lại
                        </Button>
                    ]}
                />
            </div>
        );
    }

    if (!paymentResult) {
        return (
            <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
                <Result
                    status="warning"
                    title="Không có thông tin thanh toán"
                    subTitle="Không thể tìm thấy thông tin giao dịch. Vui lòng kiểm tra lại."
                    extra={[
                        <Button type="primary" key="home" onClick={handleBackToHome}>
                            Về trang chủ
                        </Button>
                    ]}
                />
            </div>
        );
    }

    return (
        <div style={{
            padding: '24px',
            maxWidth: '700px',
            margin: '0 auto',
            background: '#f5f5f5',
            minHeight: '100vh'
        }}>
            <Card
                style={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: 'none'
                }}
            >
                <Result
                    icon={
                        paymentResult.success ?
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '72px' }} /> :
                            <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '72px' }} />
                    }
                    title={
                        <Title level={2} style={{
                            color: paymentResult.success ? '#52c41a' : '#ff4d4f',
                            marginBottom: '8px'
                        }}>
                            {paymentResult.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
                        </Title>
                    }
                    subTitle={
                        <div style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
                            {paymentResult.success ? (
                                <>
                                    Đơn hàng <strong>#{paymentResult.orderId}</strong> đã được thanh toán thành công qua VNPay.
                                    <br />
                                    Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
                                </>
                            ) : (
                                <>
                                    {paymentResult.message}
                                    <br />
                                    Đơn hàng đã bị hủy. Vui lòng thử lại.
                                </>
                            )}
                        </div>
                    }
                    extra={
                        <Space size="middle">
                            <Button
                                type="primary"
                                icon={<HomeOutlined />}
                                size="large"
                                onClick={handleBackToHome}
                            >
                                Về trang chủ
                            </Button>
                            {paymentResult.success && (
                                <Button
                                    icon={<HistoryOutlined />}
                                    size="large"
                                    onClick={handleViewOrders}
                                >
                                    Xem đơn hàng
                                </Button>
                            )}
                            {!paymentResult.success && (
                                <Button
                                    type="default"
                                    size="large"
                                    onClick={handleRetryPayment}
                                >
                                    Thử lại
                                </Button>
                            )}
                        </Space>
                    }
                />

                {/* Transaction Details */}
                {paymentResult.transactionId && (
                    <Alert
                        type="info"
                        style={{ marginTop: '24px' }}
                        message="Thông tin giao dịch"
                        description={
                            <div>
                                <Text strong>Mã giao dịch: </Text>
                                <Text code>{paymentResult.transactionId}</Text>
                                <br />
                                {paymentResult.amount && (
                                    <>
                                        <Text strong>Số tiền: </Text>
                                        <Text>{new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(paymentResult.amount / 100)}</Text>
                                    </>
                                )}
                            </div>
                        }
                    />
                )}

                {/* Success Information */}
                {paymentResult.success && (
                    <Alert
                        type="success"
                        style={{ marginTop: '16px' }}
                        message="Thông báo"
                        description={
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                <li>Đơn hàng của bạn đã được xác nhận và sẽ được chuẩn bị</li>
                                <li>Bạn có thể theo dõi trạng thái trong "Lịch sử đơn hàng"</li>
                                <li>Hóa đơn điện tử sẽ được gửi qua email (nếu có)</li>
                            </ul>
                        }
                    />
                )}

                {/* Failure Instructions */}
                {!paymentResult.success && (
                    <Alert
                        type="warning"
                        style={{ marginTop: '16px' }}
                        message="Hướng dẫn xử lý"
                        description={
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                <li>Kiểm tra lại thông tin thẻ và số dư tài khoản</li>
                                <li>Đảm bảo kết nối internet ổn định</li>
                                <li>Thử lại với phương thức thanh toán khác</li>
                                <li>Liên hệ hỗ trợ: 1900-xxxx nếu vấn đề vẫn tiếp tục</li>
                            </ul>
                        }
                    />
                )}
            </Card>
        </div>
    );
};

export default VnPayReturn; 