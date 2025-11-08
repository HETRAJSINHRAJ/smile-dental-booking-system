# React Native Razorpay Integration Guide

## Overview

The mobile app now uses the `react-native-razorpay` package for direct Razorpay integration. This provides a native checkout experience with support for all Razorpay payment methods.

## Installation

### 1. Install Package

```bash
npm install react-native-razorpay
# or
yarn add react-native-razorpay
```

### 2. Link Native Dependencies

For React Native 0.60+, auto-linking should work:

```bash
cd ios && pod install && cd ..
```

For Android, the package should be automatically linked.

### 3. Verify Installation

Check that the package is installed:
```bash
npm list react-native-razorpay
```

## Configuration

### Environment Variables

Ensure your `.env` file has:

```properties
# Backend API Configuration
BACKEND_URL=http://localhost:3000

# Razorpay Configuration
RAZORPAY_KEY=rzp_test_RbbZlQKYdQ6oAe
RAZORPAY_SECRET=j0YrTVr6k1I204JOkhcSMT2A
```

### Payment Configuration

```properties
APPOINTMENT_RESERVATION_FEE=500
GST_TAX_RATE=0.18
ENABLE_SERVICE_PAYMENT_ONLINE=false
```

## Payment Flow

### 1. Create Order

```
User clicks "Pay" button
    ↓
Backend creates Razorpay order
    ↓
Returns order ID
```

### 2. Open Checkout

```
Mobile app opens Razorpay checkout
    ↓
User selects payment method
    ↓
User completes payment
```

### 3. Handle Response

```
Razorpay returns payment response
    ↓
App verifies payment with backend
    ↓
Appointment created in Firestore
    ↓
Success screen displayed
```

## Code Implementation

### RazorpayGateway Class

```typescript
import RazorpayCheckout from 'react-native-razorpay';

async processPayment(orderData: PaymentOrder, orderId: string): Promise<PaymentResponse> {
  const options = {
    description: 'Appointment Reservation',
    image: 'https://your-logo-url',
    currency: 'INR',
    key: this.config.key,
    amount: orderData.amount, // in paise
    name: 'Dental Clinic',
    order_id: orderId,
    prefill: {
      email: orderData.customerDetails.email,
      contact: orderData.customerDetails.phone,
      name: orderData.customerDetails.name
    },
    notes: orderData.notes || {},
    theme: { color: '#3399cc' }
  };

  return new Promise((resolve, reject) => {
    RazorpayCheckout.open(options)
      .then((data: any) => {
        resolve({
          success: true,
          paymentId: data.razorpay_payment_id,
          orderId: data.razorpay_order_id,
          amount: orderData.amount,
          currency: orderData.currency,
          status: 'success',
          gatewayResponse: data
        });
      })
      .catch((error: any) => {
        reject({
          success: false,
          amount: orderData.amount,
          currency: orderData.currency,
          status: 'failed',
          errorMessage: error.description || 'Payment failed'
        });
      });
  });
}
```

## Razorpay Checkout Options

| Option | Type | Description |
|--------|------|-------------|
| `key` | string | Razorpay API Key |
| `amount` | number | Amount in paise (e.g., 50000 for ₹500) |
| `currency` | string | Currency code (e.g., 'INR') |
| `order_id` | string | Order ID from backend |
| `name` | string | Business/App name |
| `description` | string | Payment description |
| `image` | string | Logo URL |
| `prefill` | object | Pre-fill customer details |
| `notes` | object | Additional notes |
| `theme` | object | Checkout theme (color) |

## Payment Methods Supported

✅ **UPI**
- Google Pay
- PhonePe
- Paytm
- BHIM
- WhatsApp Pay

✅ **Cards**
- Visa
- Mastercard
- RuPay
- American Express

✅ **Net Banking**
- All major Indian banks

✅ **Wallets**
- Paytm
- PhonePe
- Amazon Pay
- Mobikwik

✅ **BNPL**
- Flexipay
- Simpl
- LazyPay

## Testing

### Test Credentials

**Razorpay Test Mode:**
- Key: `rzp_test_RbbZlQKYdQ6oAe`
- Secret: `j0YrTVr6k1I204JOkhcSMT2A`

### Test Payment Methods

**UPI:**
- Any UPI ID format works in test mode
- Payment will be simulated

**Cards:**
- Card: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits

**Net Banking:**
- Select any bank
- Payment will be simulated

## Development Setup

### 1. Start Backend

```bash
cd patient-portal
npm run dev
```

Backend runs at `http://localhost:3000`

### 2. Configure Mobile App

Update `.env`:
```properties
BACKEND_URL=http://localhost:3000
RAZORPAY_KEY=rzp_test_RbbZlQKYdQ6oAe
```

### 3. Run Mobile App

```bash
# Android
npm run android

# iOS
npm run ios
```

### 4. Test Payment Flow

1. Navigate to booking
2. Select service, provider, date, time
3. Click "Confirm Booking"
4. Agree to policy
5. Click "Pay" button
6. Select payment method
7. Complete payment
8. Verify appointment created

## Production Deployment

### 1. Update Razorpay Keys

```properties
RAZORPAY_KEY=rzp_live_xxxxx
RAZORPAY_SECRET=xxxxx
```

### 2. Update Backend URL

```properties
BACKEND_URL=https://your-production-domain.com
```

### 3. Update Logo URL

In `razorpayGateway.ts`:
```typescript
image: 'https://your-clinic-domain.com/logo.png'
```

### 4. Build for Production

**Android:**
```bash
cd android
./gradlew assembleRelease
```

**iOS:**
```bash
cd ios
xcodebuild -workspace patient.xcworkspace -scheme patient -configuration Release
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Payment failed" | User cancelled | Show retry option |
| "Invalid key" | Wrong Razorpay key | Check RAZORPAY_KEY in .env |
| "Order not found" | Backend issue | Verify backend is running |
| "Network error" | Connection issue | Check internet connectivity |

### Error Handling Code

```typescript
const handlePaymentError = (error: string) => {
  console.error('Payment error:', error);
  
  if (error.includes('cancelled')) {
    Alert.alert('Payment Cancelled', 'You cancelled the payment');
  } else if (error.includes('Network')) {
    Alert.alert('Network Error', 'Please check your internet connection');
  } else {
    Alert.alert('Payment Failed', error);
  }
};
```

## Debugging

### Enable Logging

The gateway logs all payment events:

```
Opening Razorpay checkout with options: {...}
Payment successful: { razorpay_payment_id: '...', ... }
```

### Check Console

Monitor console for:
- Order creation logs
- Checkout opening logs
- Payment response logs
- Error messages

### Verify Backend

Test backend API:
```bash
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

### Razorpay Checkout Not Opening

**Cause:** Package not properly installed

**Solution:**
```bash
npm install react-native-razorpay
cd ios && pod install && cd ..
npm start -- --reset-cache
```

### Payment Response Not Received

**Cause:** Promise not resolving

**Solution:** Check console logs for errors

### Backend Order Creation Fails

**Cause:** Backend not running or wrong URL

**Solution:**
1. Verify backend is running: `npm run dev` in patient-portal
2. Check BACKEND_URL in .env
3. Verify Razorpay credentials on backend

### Appointment Not Created After Payment

**Cause:** Payment verification failed

**Solution:**
1. Check payment response in logs
2. Verify Firestore permissions
3. Check appointment creation code

## Advanced Features

### Custom Checkout Theme

```typescript
theme: {
  color: '#3399cc',
  backdrop_color: 'rgba(0, 0, 0, 0.5)'
}
```

### Prefill Customer Details

```typescript
prefill: {
  name: 'John Doe',
  email: 'john@example.com',
  contact: '9876543210'
}
```

### Additional Notes

```typescript
notes: {
  service: 'Dental Cleaning',
  provider: 'Dr. Smith',
  appointment_date: '2024-11-15'
}
```

## References

- [Razorpay Documentation](https://razorpay.com/docs/)
- [React Native Razorpay GitHub](https://github.com/razorpay/react-native-razorpay)
- [Razorpay API Reference](https://razorpay.com/docs/api/)

## Support

For issues:
1. Check console logs
2. Verify configuration
3. Test with backend API
4. Check Razorpay dashboard
5. Review error messages

## Summary

✅ Direct Razorpay integration using react-native-razorpay  
✅ Native checkout experience  
✅ All payment methods supported  
✅ Backend order creation  
✅ Payment verification  
✅ Production ready  

The mobile app now has a complete, production-ready Razorpay payment integration!
