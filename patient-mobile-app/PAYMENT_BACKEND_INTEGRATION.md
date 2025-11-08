# Payment Backend Integration Guide

## Overview

The mobile app now uses the same backend API endpoints as the web app for payment processing. This ensures consistency across both platforms and leverages the existing Razorpay integration on the backend.

## Architecture

```
Mobile App (React Native)
    ↓
PaymentModal Component
    ↓
useRazorpayPayment Hook
    ↓
RazorpayGateway Class
    ↓
Backend API (patient-portal)
    ↓
Razorpay API
```

## Backend API Endpoints

The mobile app calls the same endpoints as the web app:

### 1. Create Order
**Endpoint:** `POST /api/payments/create-order`

**Request:**
```json
{
  "amount": 59000,
  "currency": "INR",
  "receipt": "rcpt_1234567890",
  "notes": {
    "service": "Dental Cleaning",
    "payment_method": "upi"
  },
  "gateway": "razorpay",
  "environment": "test"
}
```

**Response:**
```json
{
  "orderId": "order_XXXXXXXXXXXX",
  "amount": 59000,
  "currency": "INR",
  "status": "created"
}
```

### 2. Verify Payment
**Endpoint:** `POST /api/payments/verify`

**Request:**
```json
{
  "paymentId": "pay_XXXXXXXXXXXX",
  "orderId": "order_XXXXXXXXXXXX",
  "signature": "signature_hash",
  "amount": 59000,
  "gateway": "razorpay"
}
```

**Response:**
```json
{
  "verified": true,
  "paymentId": "pay_XXXXXXXXXXXX",
  "orderId": "order_XXXXXXXXXXXX",
  "message": "Payment verified successfully"
}
```

## Configuration

### Environment Variables

Add to `.env`:

```properties
# Backend API URL
BACKEND_URL=http://localhost:3000

# For production:
# BACKEND_URL=https://your-production-domain.com
```

### Payment Configuration

```properties
APPOINTMENT_RESERVATION_FEE=500
GST_TAX_RATE=0.18
ENABLE_SERVICE_PAYMENT_ONLINE=false
RAZORPAY_KEY=rzp_test_RbbZlQKYdQ6oAe
```

## Payment Flow

### 1. User Initiates Payment
```
User clicks "Confirm Booking"
    ↓
Policy agreement validated
    ↓
PaymentModal opens
```

### 2. Payment Processing
```
User selects payment method
    ↓
User clicks "Pay" button
    ↓
Payment data validated
    ↓
Backend creates Razorpay order
    ↓
Razorpay checkout opens
    ↓
User completes payment
```

### 3. Payment Success
```
Razorpay returns payment response
    ↓
Payment verified with backend
    ↓
Appointment created in Firestore
    ↓
Success screen displayed
```

## Code Implementation

### RazorpayGateway Class

```typescript
// Create order via backend API
async createOrder(orderData: PaymentOrder): Promise<string> {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  
  const response = await fetch(`${backendUrl}/api/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      notes: orderData.notes,
      gateway: 'razorpay',
      environment: this.config.environment
    }),
  });

  const data = await response.json();
  return data.orderId;
}
```

### Payment Modal Integration

```typescript
const handlePayment = async () => {
  // Validate payment data
  const validation = validatePaymentData(orderData);
  if (!validation.valid) {
    Alert.alert('Validation Error', validation.errors[0]);
    return;
  }

  setProcessing(true);

  try {
    // Process payment through backend
    await processPayment({
      amount: convertRupeesToPaise(amount),
      currency: 'INR',
      notes: { service: serviceName, payment_method: selectedMethod },
      customerDetails,
    });
  } catch (err) {
    setProcessing(false);
    onError(err.message);
  }
};
```

## Development Setup

### Prerequisites

1. **Patient Portal Running**
   ```bash
   cd patient-portal
   npm install
   npm run dev
   ```
   This starts the backend at `http://localhost:3000`

2. **Mobile App Configuration**
   - Ensure `.env` has `BACKEND_URL=http://localhost:3000`
   - Razorpay test keys configured

### Testing Payment Flow

1. Open mobile app
2. Navigate to booking
3. Select service, provider, date, and time
4. Click "Confirm Booking"
5. Agree to policy
6. Click "Pay" button
7. Select payment method
8. Complete payment in Razorpay checkout
9. Verify appointment created in Firestore

## Production Deployment

### 1. Update Backend URL

```properties
BACKEND_URL=https://your-production-domain.com
```

### 2. Update Razorpay Keys

```properties
RAZORPAY_KEY=rzp_live_xxxxx
RAZORPAY_SECRET=xxxxx
```

### 3. Ensure Backend APIs are Deployed

The patient-portal backend must be deployed with:
- `/api/payments/create-order` endpoint
- `/api/payments/verify` endpoint
- `/api/payments/refund` endpoint
- `/api/payments/status/:paymentId` endpoint

## Error Handling

### Network Errors

If backend is unreachable:
```
Error: Failed to create payment order
```

**Solution:** Verify `BACKEND_URL` is correct and backend is running

### Payment Creation Errors

If Razorpay order creation fails:
```
Error: Failed to create payment order
Details: [Razorpay error message]
```

**Solution:** Check Razorpay credentials and API limits

### Verification Errors

If payment verification fails:
```
Error: Payment verification failed
```

**Solution:** Ensure payment signature is correct

## Debugging

### Enable Logging

Check console logs for:
```
Payment order created: { orderId: 'order_...', amount: 59000, ... }
Processing payment with method: upi
Amount: 590 Paise: 59000
```

### Verify Backend Connection

```bash
# Test backend API
curl -X POST http://localhost:3000/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 59000,
    "currency": "INR",
    "receipt": "test_receipt",
    "gateway": "razorpay",
    "environment": "test"
  }'
```

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Network request failed | Backend URL incorrect | Update `BACKEND_URL` in `.env` |
| Order creation fails | Razorpay credentials missing | Check `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` on backend |
| Payment not verified | Signature mismatch | Ensure payment response is correct |
| Appointment not created | Firestore permissions | Check Firestore rules |

## Files Modified

1. **`src/lib/payment/razorpayGateway.ts`**
   - Updated `createOrder()` to call backend API
   - Uses `BACKEND_URL` environment variable

2. **`.env`**
   - Added `BACKEND_URL` configuration

3. **`.env.example`**
   - Added `BACKEND_URL` template

## Summary

The mobile app now uses the same backend payment API as the web app, ensuring:
- ✅ Consistent payment processing
- ✅ Centralized Razorpay integration
- ✅ Shared order creation logic
- ✅ Unified payment verification
- ✅ Simplified maintenance

The payment flow is now fully integrated with the backend and ready for production deployment.
