# VNPay Implementation Guide

## 🔄 **Payment Flow Architecture**

```
User → Frontend Payment → VNPay Gateway → Backend Return → Frontend Result Page
```

## 🎯 **Backend Implementation**

### 1. **VNPay Return Controller**

```csharp
[ApiController]
[Route("api/v1/payment")]
public class PaymentController : ControllerBase
{
    private readonly IVnPayService _vnPayService;
    private readonly IConfiguration _configuration;

    [HttpGet("vnpay-return")]
    public async Task<IActionResult> VnPayReturn([FromQuery] VnPayReturnRequestDto request)
    {
        try
        {
            // Process VNPay response
            var result = await _vnPayService.ProcessPaymentReturn(request);

            // Get frontend URL from configuration
            var frontendUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:3000";

            // Build redirect URL with parameters
            var redirectUrl = $"{frontendUrl}/vnpay-return?" +
                $"status={result.Status}&" +
                $"orderId={result.OrderId}&" +
                $"message={Uri.EscapeDataString(result.Message)}&" +
                $"transactionId={result.TransactionId}&" +
                $"amount={result.Amount}";

            // Redirect to frontend
            return Redirect(redirectUrl);
        }
        catch (Exception ex)
        {
            // Redirect to frontend with error
            var frontendUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:3000";
            var errorUrl = $"{frontendUrl}/vnpay-return?" +
                $"status=error&" +
                $"message={Uri.EscapeDataString("Có lỗi xảy ra khi xử lý thanh toán")}";

            return Redirect(errorUrl);
        }
    }

    [HttpPost("create-vnpay-payment")]
    public async Task<IActionResult> CreateVnPayPayment([FromBody] CreateVnPayRequestDto request)
    {
        var paymentUrl = await _vnPayService.CreatePaymentUrl(request);
        return Ok(new { paymentUrl });
    }
}
```

### 2. **VNPay Service Implementation**

```csharp
public class VnPayService : IVnPayService
{
    public async Task<VnPayReturnResult> ProcessPaymentReturn(VnPayReturnRequestDto request)
    {
        // Validate VNPay signature
        var isValidSignature = ValidateSignature(request);
        if (!isValidSignature)
        {
            throw new Exception("Invalid VNPay signature");
        }

        // Check transaction status
        var isSuccess = request.vnp_TransactionStatus == "00";

        // Update order status in database
        var orderId = request.vnp_TxnRef;
        await UpdateOrderPaymentStatus(orderId, isSuccess);

        return new VnPayReturnResult
        {
            Status = isSuccess ? "success" : "failed",
            OrderId = orderId,
            TransactionId = request.vnp_TransactionNo,
            Amount = request.vnp_Amount,
            Message = isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"
        };
    }

    public async Task<string> CreatePaymentUrl(CreateVnPayRequestDto request)
    {
        // Build VNPay payment URL
        var vnpayConfig = _configuration.GetSection("VnPay");

        var vnpayData = new VnPayLibrary();
        vnpayData.AddRequestData("vnp_Version", "2.1.0");
        vnpayData.AddRequestData("vnp_Command", "pay");
        vnpayData.AddRequestData("vnp_TmnCode", vnpayConfig["TmnCode"]);
        vnpayData.AddRequestData("vnp_Amount", (request.Amount * 100).ToString());
        vnpayData.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
        vnpayData.AddRequestData("vnp_CurrCode", "VND");
        vnpayData.AddRequestData("vnp_IpAddr", GetClientIpAddress());
        vnpayData.AddRequestData("vnp_Locale", "vn");
        vnpayData.AddRequestData("vnp_OrderInfo", $"Thanh toan don hang {request.OrderId}");
        vnpayData.AddRequestData("vnp_OrderType", "other");
        vnpayData.AddRequestData("vnp_ReturnUrl", vnpayConfig["ReturnUrl"]);
        vnpayData.AddRequestData("vnp_TxnRef", request.OrderId);

        var paymentUrl = vnpayData.CreateRequestUrl(vnpayConfig["Url"], vnpayConfig["HashSecret"]);
        return paymentUrl;
    }
}
```

## 🎨 **Frontend Integration**

### 1. **Payment Flow**

```javascript
// Payment.js - Enhanced flow
const handleVnPayPayment = async (orderData, totalAmount) => {
  try {
    setIsProcessingVnPay(true);

    // Step 1: Create order with pending status
    const orderResponse = await createVnPayOrderMutation.mutateAsync({
      orderData,
      branchId: selectedBranch.id,
    });

    const orderId = orderResponse.data.id;

    // Step 2: Store order info for return processing
    localStorage.setItem("pendingVnPayOrderId", orderId);
    localStorage.setItem("pendingVnPayBranchId", selectedBranch.id);

    // Step 3: Create VNPay payment URL
    const paymentResponse = await createVnPayPaymentMutation.mutateAsync({
      orderId,
      amount: totalAmount,
    });

    if (!paymentResponse.data?.paymentUrl) {
      throw new Error("Không thể tạo liên kết thanh toán VNPay");
    }

    // Step 4: Redirect to VNPay
    message.success("Đang chuyển hướng đến VNPay...");
    window.location.href = paymentResponse.data.paymentUrl;
  } catch (error) {
    console.error("VNPay payment failed:", error);
    message.error("Thanh toán VNPay thất bại. Vui lòng thử lại.");
    setIsProcessingVnPay(false);
  }
};
```

### 2. **Return Page Features**

✅ **Dual Flow Support:**

- Direct backend redirect với query params
- Traditional API call flow

✅ **Enhanced UI:**

- Beautiful loading screen với gradient
- Success/error icons
- Transaction details display
- Action buttons với icons

✅ **Better Error Handling:**

- Separate error states
- Retry functionality
- Clear user guidance

✅ **Security:**

- Auto cleanup localStorage
- Input validation
- Error boundary protection

## ⚙️ **Configuration**

### 1. **Backend appsettings.json**

```json
{
  "VnPay": {
    "Url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    "ReturnUrl": "http://localhost:5281/api/v1/payment/vnpay-return",
    "IpnUrl": "http://localhost:5281/api/v1/payment/vnpay-ipn",
    "TmnCode": "YOUR_TMN_CODE",
    "HashSecret": "YOUR_HASH_SECRET"
  },
  "Frontend": {
    "BaseUrl": "http://localhost:3000"
  }
}
```

### 2. **Frontend Environment**

```javascript
// src/config/environment.js
export const PAYMENT_CONFIG = {
  vnpay: {
    returnUrl: `${window.location.origin}/vnpay-return`,
    timeout: 15000, // 15 seconds timeout
  },
};
```

## 🔧 **Testing**

### 1. **VNPay Sandbox Test**

```javascript
// Test VNPay integration
const testVnPayFlow = async () => {
  const testOrder = {
    orderId: "TEST_" + Date.now(),
    amount: 100000, // 100,000 VND
    description: "Test payment",
  };

  // Create payment URL
  const paymentUrl = await paymentService.createVnPayPayment(
    testOrder.orderId,
    testOrder.amount
  );

  console.log("VNPay Payment URL:", paymentUrl);
};
```

### 2. **Return URL Testing**

```bash
# Test direct redirect
http://localhost:3000/vnpay-return?status=success&orderId=123&message=Thanh%20toán%20thành%20công

# Test failure case
http://localhost:3000/vnpay-return?status=failed&orderId=123&message=Thanh%20toán%20thất%20bại
```

## 🚀 **Production Deployment**

### 1. **Backend Configuration**

```json
{
  "VnPay": {
    "Url": "https://pay.vnpay.vn/vpcpay.html",
    "ReturnUrl": "https://yourapi.com/api/v1/payment/vnpay-return",
    "IpnUrl": "https://yourapi.com/api/v1/payment/vnpay-ipn"
  },
  "Frontend": {
    "BaseUrl": "https://yourapp.com"
  }
}
```

### 2. **Security Considerations**

- ✅ Validate VNPay signature
- ✅ Use HTTPS for all communications
- ✅ Implement rate limiting
- ✅ Log all payment transactions
- ✅ Handle timeout scenarios
- ✅ Implement IPN for backup

## 📋 **Checklist**

- [ ] Backend VNPay controller implemented
- [ ] Frontend return page created
- [ ] Error handling implemented
- [ ] Loading states configured
- [ ] Testing completed
- [ ] Security validation added
- [ ] Production configuration ready
- [ ] Monitoring and logging setup

## 🎯 **Best Practices**

1. **Always validate VNPay signature** on backend
2. **Use IPN for critical order updates** (backup mechanism)
3. **Implement proper timeout handling**
4. **Log all payment transactions** for audit
5. **Test thoroughly** with VNPay sandbox
6. **Handle edge cases** (network failures, browser close, etc.)
7. **Provide clear user feedback** at every step
