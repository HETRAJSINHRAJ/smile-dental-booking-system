# Razorpay Quick Start Guide

## Installation (5 minutes)

### Step 1: Install Package

```bash
npm install react-native-razorpay
```

### Step 2: Link Dependencies

```bash
cd ios && pod install && cd ..
```

### Step 3: Verify Installation

```bash
npm list react-native-razorpay
```

## Configuration (2 minutes)

### Update `.env`

```properties
BACKEND_URL=http://localhost:3000
RAZORPAY_KEY=rzp_test_RbbZlQKYdQ6oAe
```

## Testing (5 minutes)

### 1. Start Backend

```bash
cd patient-portal
npm run dev
```

### 2. Run Mobile App

```bash
npm run android
# or
npm run ios
```

### 3. Test Payment

1. Go to booking
2. Select service, provider, date, time
3. Click "Confirm Booking"
4. Agree to policy
5. Click "Pay"
6. Select UPI
7. Complete payment

## Payment Flow

```
User clicks Pay
    ↓
Backend creates order
    ↓
Razorpay checkout opens
    ↓
User completes payment
    ↓
Appointment created
    ↓
Success screen
```

## Test Credentials

| Method | Details |
|--------|---------|
| UPI | Any UPI ID |
| Card | 4111 1111 1111 1111 |
| Expiry | Any future date |
| CVV | Any 3 digits |

## Troubleshooting

### Checkout Not Opening
```bash
npm install react-native-razorpay
cd ios && pod install && cd ..
npm start -- --reset-cache
```

### Backend Connection Error
- Verify backend running: `npm run dev` in patient-portal
- Check BACKEND_URL in .env
- Ensure both on same network

### Payment Failed
- Check console logs
- Verify Razorpay key
- Try different payment method

## Production Setup

### 1. Update Keys

```properties
RAZORPAY_KEY=rzp_live_xxxxx
RAZORPAY_SECRET=xxxxx
```

### 2. Update Backend URL

```properties
BACKEND_URL=https://your-production-domain.com
```

### 3. Build App

```bash
# Android
cd android && ./gradlew assembleRelease

# iOS
cd ios && xcodebuild -workspace patient.xcworkspace -scheme patient -configuration Release
```

## Key Files

- `src/lib/payment/razorpayGateway.ts` - Payment gateway
- `src/components/PaymentModal.tsx` - Payment UI
- `src/screens/booking/ConfirmBookingScreen.tsx` - Booking flow
- `.env` - Configuration

## Next Steps

1. ✅ Install react-native-razorpay
2. ✅ Configure .env
3. ✅ Test payment flow
4. ✅ Deploy to production

## Support

- [Razorpay Docs](https://razorpay.com/docs/)
- [React Native Razorpay](https://github.com/razorpay/react-native-razorpay)
- Check console logs for errors

---

**Status:** ✅ Ready to use react-native-razorpay for payments
