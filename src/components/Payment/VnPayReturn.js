import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Result, Button, Spin, message } from 'antd';
import { useProcessVnPayReturn } from '../../hooks/queries/paymentQueries';
import { useUpdateOrderPaymentStatus } from '../../hooks/queries/userOrderQueries';

const VnPayReturn = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(true);
    const [paymentResult, setPaymentResult] = useState(null);

    const processVnPayReturnMutation = useProcessVnPayReturn();
    const updateOrderPaymentMutation = useUpdateOrderPaymentStatus();

    useEffect(() => {
        const processPaymentReturn = async () => {
            try {
                // Get query parameters from URL
                const queryParams = new URLSearchParams(location.search);
                const queryObject = {};
                for (let [key, value] of queryParams) {
                    queryObject[key] = value;
                }

                console.log('VNPay return query params:', queryObject);

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
                await updateOrderPaymentMutation.mutateAsync({
                    orderId: pendingOrderId,
                    isPaid: isPaymentSuccessful,
                    branchId: pendingBranchId
                });

                // Set result for UI display
                setPaymentResult({
                    success: isPaymentSuccessful,
                    orderId: pendingOrderId,
                    message: vnpayResult.message || (isPaymentSuccessful ? 'Thanh toán thành công!' : 'Thanh toán thất bại')
                });

                // Clean up stored data
                localStorage.removeItem('pendingVnPayOrderId');
                localStorage.removeItem('pendingVnPayBranchId');

            } catch (error) {
                console.error('Error processing VNPay return:', error);

                // Clean up stored data on error
                localStorage.removeItem('pendingVnPayOrderId');
                localStorage.removeItem('pendingVnPayBranchId');

                setPaymentResult({
                    success: false,
                    message: error.message || 'Có lỗi xảy ra khi xử lý thanh toán'
                });
            } finally {
                setProcessing(false);
            }
        };

        processPaymentReturn();
    }, [location.search, processVnPayReturnMutation, updateOrderPaymentMutation]);

    const handleBackToHome = () => {
        navigate('/'); // Navigate to home page
    };

    const handleViewOrders = () => {
        navigate('/order-history'); // Navigate to order history page
    };

    if (processing) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '50vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <Spin size="large" />
                <div style={{ fontSize: '16px', color: '#666' }}>
                    Đang xử lý kết quả thanh toán...
                </div>
            </div>
        );
    }

    if (!paymentResult) {
        return (
            <Result
                status="error"
                title="Lỗi xử lý thanh toán"
                subTitle="Không thể xử lý kết quả thanh toán. Vui lòng liên hệ hỗ trợ."
                extra={[
                    <Button type="primary" key="home" onClick={handleBackToHome}>
                        Về trang chủ
                    </Button>
                ]}
            />
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
            <Result
                status={paymentResult.success ? 'success' : 'error'}
                title={paymentResult.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
                subTitle={
                    paymentResult.success
                        ? `Đơn hàng ${paymentResult.orderId} đã được thanh toán thành công qua VNPay.`
                        : `${paymentResult.message}. Đơn hàng đã bị hủy.`
                }
                extra={[
                    <Button type="primary" key="home" onClick={handleBackToHome}>
                        Về trang chủ
                    </Button>,
                    paymentResult.success && (
                        <Button key="orders" onClick={handleViewOrders}>
                            Xem đơn hàng
                        </Button>
                    )
                ].filter(Boolean)}
            />

            {paymentResult.success && (
                <div style={{
                    background: '#f6ffed',
                    border: '1px solid #b7eb8f',
                    borderRadius: '6px',
                    padding: '16px',
                    marginTop: '24px'
                }}>
                    <h4 style={{ color: '#389e0d', marginBottom: '8px' }}>
                        Thông tin thanh toán
                    </h4>
                    <p style={{ margin: 0, color: '#52c41a' }}>
                        ✓ Đơn hàng của bạn đã được xác nhận và sẽ được chuẩn bị trong thời gian sớm nhất.
                    </p>
                    <p style={{ margin: '4px 0 0 0', color: '#52c41a' }}>
                        ✓ Bạn có thể theo dõi trạng thái đơn hàng trong phần "Lịch sử đơn hàng".
                    </p>
                </div>
            )}

            {!paymentResult.success && (
                <div style={{
                    background: '#fff2f0',
                    border: '1px solid #ffccc7',
                    borderRadius: '6px',
                    padding: '16px',
                    marginTop: '24px'
                }}>
                    <h4 style={{ color: '#cf1322', marginBottom: '8px' }}>
                        Hướng dẫn
                    </h4>
                    <p style={{ margin: 0, color: '#a8071a' }}>
                        • Kiểm tra lại thông tin thẻ và số dư tài khoản
                    </p>
                    <p style={{ margin: '4px 0 0 0', color: '#a8071a' }}>
                        • Thử lại với phương thức thanh toán khác
                    </p>
                    <p style={{ margin: '4px 0 0 0', color: '#a8071a' }}>
                        • Liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục
                    </p>
                </div>
            )}
        </div>
    );
};

export default VnPayReturn; 