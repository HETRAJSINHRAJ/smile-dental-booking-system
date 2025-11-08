# Razorpay Payment Integration Guide

## Overview

The patient mobile app now includes Razorpay payment gateway integration for appointment reservation fees. Users must complete payment before confirming their appointment booking.

## Payment Flow

1. **User Reviews Appointment Details** → ConfirmBookingScreen
2. **User Agrees to Cancellation Policy** → Enables "Confirm Booking" button
3. **User Clicks "Confirm Booking"** → Shows PaymentModal
4. **User Selects Payment Method** → UPI, Cards, Net Banking, or Wallets
5. **User Completes Payment** → Razorpay processes payment
6. **Payment Success** → Appointment created with "confirmed" status
7. **Navigation to Success Screen** → Shows confirmation details

## Files Created/Modified

### New Files

1. **`src/lib/payment/razorpayGateway.ts`**
   - Razorpay payment gateway class
   - Handles order creation, payment processing, verification, and refunds
   - Interfaces for payment data structures

2. **`src/lib/payment/useRazorpayPayment.ts`**
   - React hook for payment processing
   - Handles payment flow and state management
   - Includes validation and amount calculation hooks

3. **`src/components/PaymentModal.tsx`**
   - Modal component for payment UI
   - Payment method selection
   - Customer details display
   - Security information

### Modified Files

1. **`src/screens/booking/ConfirmBookingScreen.tsx`**
   - Added payment modal integration
   - Changed flow to show payment before creating appointment
   - Updated appointment status to "confirmed" after payment
   - Added payment transaction ID tracking

2. **`.env`**
   - Added `RAZORPAY_KEY` configuration

## Configuration

### Environment Variables

```properties
# .env
RAZORPAY_KEY=rzp_test_RbbZlQKYdQ6oAe
RAZORPAY_SECRET=j0YrTVr6k1I204JOkhcSMT2A
```

### Payment Configuration

From `paymentConfig.ts`:
```typescript
APPOINTMENT_RESERVATION_FEE=500  // ₹500
GST_TAX_RATE=0.18               // 18%
ENABLE_SERVICE_PAYMENT_ONLINE=false
```

## Payment Breakdown Example

For a ₹1000 service:

**Appointment Payment (Payable Now):**
- Reservation Fee: ₹500
- GST (18%): ₹90
- **Total: ₹590**

**Service Payment (At Clinic):**
- Service Fee: ₹1000
- GST (18%): ₹180
- **Total: ₹1180**

## Key Features

### 1. Payment Methods
- ✅ UPI (Google Pay, PhonePe, Paytm, BHIM)
- ✅ Credit/Debit Cards (Visa, Mastercard, RuPay)
- ✅ Net Banking (All major Indian banks)
- ✅ Digital Wallets (Paytm, PhonePe, Amazon Pay)

### 2. Security
- Industry-standard encryption
- RBI compliance
- Secure payment processing
- Transaction verification

### 3. Payment Status Tracking
- Payment status stored in appointment
- Transaction ID recorded
- Payment method tracked
- Payment date recorded

### 4. Error Handling
- Payment validation
- Error messages displayed
- Retry capability
- Cancel option

## Implementation Details

### PaymentModal Component

```typescript
<PaymentModal
  visible={showPayment}
  amount={paymentBreakdown.appointmentTotal}
  serviceName={service?.name}
  customerDetails={{
    name: user?.displayName,
    email: user?.email,
    phone: userProfile?.phone,
  }}
  onSuccess={handlePaymentSuccess}
  onError={handlePaymentError}
  onCancel={handlePaymentCancel}
/>
```

### Payment Success Handler

```typescript
const handlePaymentSuccess = async (response: any) => {
  // Create appointment with confirmed status
  const appointmentData = {
    ...details,
    status: 'confirmed',
    paymentStatus: 'reservation_paid',
    paymentTransactionId: response.paymentId,
    paymentMethod: 'razorpay',
  };
  
  const appointmentId = await createDocument('appointments', appointmentData);
  navigation.navigate('BookingSuccess', { appointmentId });
};
```

## Appointment Status After Payment

### Before Payment
```typescript
{
  status: 'pending',
  paymentStatus: 'pending',
  paymentAmount: 0,
  paymentTransactionId: null,
}
```

### After Successful Payment
```typescript
{
  status: 'confirmed',
  paymentStatus: 'reservation_paid',
  paymentAmount: 590,
  paymentTransactionId: 'pay_xxxxx',
  paymentMethod: 'razorpay',
  paymentDate: Timestamp.now(),
}
```

## Testing

### Test Credentials

**Razorpay Test Mode:**
- Key: `rzp_test_RbbZlQKYdQ6oAe`
- Secret: `j0YrTVr6k1I204JOkhcSMT2A`

### Test Payment Methods

1. **UPI Test:**
   - Use any UPI ID format
   - Payment will be simulated

2. **Card Test:**
   - Card: 4111 1111 1111 1111
   - Expiry: Any future date
   - CVV: Any 3 digits

3. **Net Banking Test:**
   - Select any bank
   - Payment will be simulated

## Production Deployment

### Before Going Live

1. **Update Razorpay Keys**
   ```properties
   RAZORPAY_KEY=rzp_live_xxxxx
   RAZORPAY_SECRET=xxxxx
   ```

2. **Update Environment**
   ```typescript
   environment: 'production'
   ```

3. **Test Payment Flow**
   - Test with real payment methods
   - Verify transaction recording
   - Check appointment creation

4. **Enable Service Payment Online (Optional)**
   ```properties
   ENABLE_SERVICE_PAYMENT_ONLINE=true
   ```

## Troubleshooting

### Payment Modal Not Showing
- Check `showPayment` state
- Verify `paymentBreakdown` is calculated
- Check component imports

### Payment Fails
- Verify Razorpay key is correct
- Check network connectivity
- Review error message
- Check payment amount

### Appointment Not Created
- Verify payment success response
- Check Firestore permissions
- Review error logs
- Check user authentication

### Transaction Not Recorded
- Verify payment response structure
- Check transaction ID extraction
- Review Firestore write permissions

## API Integration

### Backend Requirements

The app expects these backend endpoints:

1. **POST /api/payments/create-order**
   - Creates Razorpay order
   - Returns `orderId`

2. **POST /api/payments/verify**
   - Verifies payment signature
   - Returns `verified: boolean`

3. **POST /api/payments/refund**
   - Processes refund
   - Returns `success: boolean`

4. **GET /api/payments/status/:paymentId**
   - Gets payment status
   - Returns `status: string`

## Future Enhancements

- [ ] Payment history view
- [ ] Refund processing UI
- [ ] Multiple payment methods per user
- [ ] Saved payment methods
- [ ] Subscription payments
- [ ] Partial refunds
- [ ] Payment receipts
- [ ] Invoice generation

## Support

For issues or questions:
1. Check this documentation
2. Review error messages
3. Check Razorpay dashboard
4. Review Firestore logs
5. Contact support

## References

- [Razorpay Documentation](https://razorpay.com/docs/)
- [React Native Razorpay SDK](https://github.com/razorpay/react-native-razorpay)
- [Payment Configuration Guide](./PAYMENT_CONFIGURATION.md)
