# VNPay Payment Integration Guide

## Overview

This guide covers the complete integration of VNPay payment gateway with the Hospital Order Management System (HOMMS). The integration ensures that orders are created in the database only after successful payment verification.

## Architecture

### Payment Flow

```
1. User selects VNPay payment method
2. Frontend creates order with "PendingPayment" status
3. Frontend creates VNPay payment URL
4. User is redirected to VNPay
5. User completes payment on VNPay
6. VNPay redirects back to frontend
7. Frontend processes return and updates order status
8. Order status changes to "Confirmed" (success) or "Cancelled" (failure)
```

### Data Flow

```
Frontend (Payment.js) → Backend (OrderController) → Database (Order with PendingPayment)
Frontend (Payment.js) → Backend (PaymentController) → VNPay API → Payment URL
User → VNPay → Payment Process → Return to Frontend
Frontend (VnPayReturn.js) → Backend (PaymentController) → Verify Payment
Frontend → Backend (OrderController) → Update Order Status → Database
```

## Backend API Endpoints

### 1. Order Creation for VNPay

- **Endpoint**: `POST /api/v1/order/AddOrderV2`
- **Purpose**: Creates order with `PendingPayment` status
- **Payment Method**: `2` (VNPay enum value)
- **Status**: `PendingPayment`
- **isPaid**: `false`

### 2. VNPay Payment URL Creation

- **Endpoint**: `POST /api/v1/payment/create-vnpay-payment`
- **Purpose**: Generates VNPay payment URL
- **Parameters**:
  ```json
  {
    "orderId": "string",
    "amount": "decimal"
  }
  ```

### 3. VNPay Return Processing

- **Endpoint**: `GET /api/v1/payment/vnpay-return`
- **Purpose**: Processes VNPay return and validates payment
- **Parameters**: VNPay query parameters

### 4. Order Payment Status Update

- **Endpoint**: `PUT /api/v1/order/{orderId}/payment-status`
- **Purpose**: Updates order payment status after verification
- **Parameters**:
  ```json
  {
    "isPaid": "boolean",
    "status": "string"
  }
  ```

## Frontend Components

### 1. Payment Service (`src/services/paymentService.js`)

```javascript
export const paymentService = {
  // Create VNPay payment URL
  async createVnPayPayment(orderId, amount),

  // Process VNPay return
  async processVnPayReturn(queryParams),

  // Get payment status
  async getPaymentStatus(orderId)
};
```

### 2. Payment Queries (`src/hooks/queries/paymentQueries.js`)

```javascript
// React Query hooks for VNPay operations
export const useCreateVnPayPayment = () => // Create payment URL
export const useProcessVnPayReturn = () => // Process payment return
export const usePaymentStatus = (orderId) => // Get payment status
```

## Implementation Details

### 1. Order Status Management

| Status           | Description                         | When Set                |
| ---------------- | ----------------------------------- | ----------------------- |
| `PendingPayment` | Order created, awaiting payment     | VNPay order creation    |
| `Confirmed`      | Payment successful, order confirmed | Successful VNPay return |
| `Cancelled`      | Payment failed, order cancelled     | Failed VNPay return     |

### 2. Frontend VNPay Flow

The Payment component now supports VNPay with these key changes:

- Added VNPay option to payment method select
- Separate flow for VNPay vs other payment methods
- Order creation with pending payment status
- VNPay URL generation and redirect
- Return processing and order status update

### 3. Security & Data Integrity

- Orders created with `PendingPayment` status
- Only confirmed payments update to `Confirmed`
- Failed payments mark orders as `Cancelled`
- Backend validates all VNPay responses
- Order ID stored securely in localStorage during payment flow

## Testing & Troubleshooting

### Common Issues

- **Order not found after payment**: Check localStorage for order ID
- **Payment status not updating**: Verify backend API endpoints
- **VNPay redirect fails**: Check payment URL generation

### Debug Steps

1. Check browser console for errors
2. Verify localStorage contains order ID
3. Check network requests to backend
4. Verify VNPay return parameters
5. Check backend logs for processing errors

## Usage

1. User selects VNPay payment method in payment modal
2. System creates order with pending status
3. User redirected to VNPay for payment
4. After payment, user returns to success/failure page
5. Order status updated based on payment result

This integration ensures secure payment processing while maintaining proper order lifecycle management.
