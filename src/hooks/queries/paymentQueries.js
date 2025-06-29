import { useMutation, useQuery } from '@tanstack/react-query';
import { paymentService } from '../../services/paymentService';
import { message } from 'antd';

// Query keys for payment operations
export const PAYMENT_QUERY_KEYS = {
    all: ['payments'],
    vnpay: (orderId) => ['payments', 'vnpay', orderId],
    status: (orderId) => ['payments', 'status', orderId]
};

// Create VNPay payment URL
export const useCreateVnPayPayment = () => {
    return useMutation({
        mutationFn: ({ orderId, amount }) => paymentService.createVnPayPayment(orderId, amount),
        onSuccess: (data) => {
            console.log('VNPay payment URL created:', data);
        },
        onError: (error) => {
            console.error('Failed to create VNPay payment:', error);
            message.error('Không thể tạo thanh toán VNPay. Vui lòng thử lại.');
        }
    });
};

// Process VNPay return
export const useProcessVnPayReturn = () => {
    return useMutation({
        mutationFn: (queryParams) => paymentService.processVnPayReturn(queryParams),
        onSuccess: (data) => {
            if (data.status === 'success') {
                message.success('Thanh toán thành công!');
            } else {
                message.error('Thanh toán thất bại. Vui lòng thử lại.');
            }
        },
        onError: (error) => {
            console.error('Failed to process VNPay return:', error);
            message.error('Có lỗi xảy ra khi xử lý thanh toán. Vui lòng liên hệ hỗ trợ.');
        }
    });
};

// Get payment status for an order
export const usePaymentStatus = (orderId, options = {}) => {
    return useQuery({
        queryKey: PAYMENT_QUERY_KEYS.status(orderId),
        queryFn: () => paymentService.getPaymentStatus(orderId),
        enabled: !!orderId,
        refetchInterval: 5000, // Poll every 5 seconds to check payment status
        ...options
    });
}; 