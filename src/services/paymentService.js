import api from './api/config';

export const paymentService = {
    // Create VNPay payment URL
    async createVnPayPayment(orderId, amount) {
        try {
            const response = await api.post('/api/v1/payment/create-vnpay-payment', {
                orderId,
                amount
            });

            return response.data;
        } catch (error) {
            console.error('Failed to create VNPay payment:', error);
            throw error;
        }
    },

    // Process VNPay return (after user completes payment)
    async processVnPayReturn(queryParams) {
        try {
            const response = await api.get('/api/v1/payment/vnpay-return', {
                params: queryParams
            });

            return response.data;
        } catch (error) {
            console.error('Failed to process VNPay return:', error);
            throw error;
        }
    },

    // Get payment status for an order
    async getPaymentStatus(orderId) {
        try {
            const response = await api.get(`/api/v1/order/${orderId}/payment-status`);
            return response.data;
        } catch (error) {
            console.error('Failed to get payment status:', error);
            throw error;
        }
    }
}; 