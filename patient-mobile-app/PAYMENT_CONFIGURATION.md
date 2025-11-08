# Payment Configuration Guide

This document explains how to configure payment settings for the patient mobile app.

## Overview

The mobile app uses environment variables to configure payment-related settings. These settings control:
- Appointment reservation fees
- Service payment collection method
- Tax rates
- Additional fees

## Environment Variables

All payment configuration is managed through the `.env` file in the project root.

### APPOINTMENT_RESERVATION_FEE

**Type:** Integer (amount in INR)  
**Default:** 500  
**Description:** Fixed appointment reservation fee charged to the patient

**Example:**
```
APPOINTMENT_RESERVATION_FEE=500
```

This means patients will pay ₹500 as a reservation fee for booking an appointment.

### ENABLE_SERVICE_PAYMENT_ONLINE

**Type:** Boolean (true/false)  
**Default:** false  
**Description:** Controls whether service fees are collected online or at the clinic

**Example:**
```
ENABLE_SERVICE_PAYMENT_ONLINE=false
```

**Behavior:**
- `false` (default): Service payment is collected at the clinic during the visit
- `true`: Service payment is collected online during the booking process

### GST_TAX_RATE

**Type:** Decimal (0.0 to 1.0)  
**Default:** 0.18  
**Description:** GST tax rate applied to both appointment and service fees

**Example:**
```
GST_TAX_RATE=0.18
```

This means 18% GST is applied to all fees.

### CONVENIENCE_FEE

**Type:** Decimal (0.0 to 1.0)  
**Default:** 0  
**Description:** Additional convenience fee charged on top of the total amount

**Example:**
```
CONVENIENCE_FEE=0.02
```

This means 2% convenience fee is added to the total payment.

### RAZORPAY_KEY

**Type:** String  
**Description:** Razorpay API key for payment processing

**Example:**
```
RAZORPAY_KEY=rzp_test_RbbZlQKYdQ6oAe
```

### RAZORPAY_SECRET

**Type:** String  
**Description:** Razorpay API secret for payment processing

**Example:**
```
RAZORPAY_SECRET=j0YrTVr6k1I204JOkhcSMT2A
```

## Payment Breakdown Example

With the default configuration:

```
APPOINTMENT_RESERVATION_FEE=500
GST_TAX_RATE=0.18
ENABLE_SERVICE_PAYMENT_ONLINE=false
```

For a service priced at ₹1000:

**Appointment Payment (Payable Now):**
- Reservation Fee: ₹500
- GST (18%): ₹90
- **Total: ₹590**

**Service Payment (At Clinic):**
- Service Fee: ₹1000
- GST (18%): ₹180
- **Total: ₹1180**

## Configuration Scenarios

### Scenario 1: Reservation Fee Only (Default)

```env
APPOINTMENT_RESERVATION_FEE=500
ENABLE_SERVICE_PAYMENT_ONLINE=false
GST_TAX_RATE=0.18
CONVENIENCE_FEE=0
```

**Result:** Patients pay ₹590 (₹500 + 18% GST) online. Service fee collected at clinic.

### Scenario 2: Full Payment Online

```env
APPOINTMENT_RESERVATION_FEE=500
ENABLE_SERVICE_PAYMENT_ONLINE=true
GST_TAX_RATE=0.18
CONVENIENCE_FEE=0
```

**Result:** Patients pay both reservation and service fees online.

### Scenario 3: With Convenience Fee

```env
APPOINTMENT_RESERVATION_FEE=500
ENABLE_SERVICE_PAYMENT_ONLINE=false
GST_TAX_RATE=0.18
CONVENIENCE_FEE=0.02
```

**Result:** Patients pay ₹590 + 2% convenience fee = ₹601.80 online.

### Scenario 4: Higher Reservation Fee

```env
APPOINTMENT_RESERVATION_FEE=1000
ENABLE_SERVICE_PAYMENT_ONLINE=false
GST_TAX_RATE=0.18
CONVENIENCE_FEE=0
```

**Result:** Patients pay ₹1180 (₹1000 + 18% GST) online.

## How to Update Configuration

1. Open the `.env` file in the project root
2. Update the desired environment variables
3. Restart the development server or rebuild the app
4. The new configuration will be automatically loaded

## Synchronization with Web App

The mobile app payment configuration should match the web app configuration:

**Web App (.env.local):**
```
NEXT_PUBLIC_APPOINTMENT_RESERVATION_FEE=500
NEXT_PUBLIC_ENABLE_SERVICE_PAYMENT_ONLINE=false
```

**Mobile App (.env):**
```
APPOINTMENT_RESERVATION_FEE=500
ENABLE_SERVICE_PAYMENT_ONLINE=false
```

## Code Implementation

The payment configuration is implemented in `src/lib/paymentConfig.ts`:

```typescript
export const getPaymentConfig = (): PaymentConfig => {
  const appointmentFee = process.env.APPOINTMENT_RESERVATION_FEE 
    ? parseInt(process.env.APPOINTMENT_RESERVATION_FEE, 10) 
    : 500;
  
  const enableServicePayment = process.env.ENABLE_SERVICE_PAYMENT_ONLINE === 'true';
  
  const taxRate = process.env.GST_TAX_RATE 
    ? parseFloat(process.env.GST_TAX_RATE) 
    : 0.18;
  
  const convenienceFee = process.env.CONVENIENCE_FEE 
    ? parseFloat(process.env.CONVENIENCE_FEE) 
    : 0;

  return {
    appointmentReservationFee: appointmentFee,
    enableServicePaymentOnline: enableServicePayment,
    taxRate: taxRate,
    convenienceFee: convenienceFee,
  };
};
```

## Usage in Components

The payment configuration is used in the `ConfirmBookingScreen` component:

```typescript
import { getPaymentConfig, formatPaymentBreakdown } from '../../lib/paymentConfig';

const paymentConfig = getPaymentConfig();
const paymentBreakdown = formatPaymentBreakdown(servicePrice, paymentConfig);

// paymentBreakdown contains:
// - appointmentReservationFee
// - appointmentTax
// - appointmentTotal
// - servicePrice
// - serviceTax
// - serviceTotal
// - totalAmount
```

## Troubleshooting

### Configuration Not Loading

1. Ensure the `.env` file exists in the project root
2. Check that variable names are spelled correctly
3. Restart the development server
4. Clear any build cache

### Incorrect Payment Amounts

1. Verify the `APPOINTMENT_RESERVATION_FEE` value is correct
2. Check that `GST_TAX_RATE` is a valid decimal (e.g., 0.18 for 18%)
3. Ensure `ENABLE_SERVICE_PAYMENT_ONLINE` is either 'true' or 'false'

### Environment Variables Not Recognized

React Native may require additional configuration to read environment variables. Ensure:
1. The `.env` file is in the project root
2. The app is rebuilt after changing `.env`
3. Use `process.env.VARIABLE_NAME` to access variables

## Best Practices

1. **Keep Sync:** Always keep mobile and web app payment configurations in sync
2. **Test Changes:** Test payment flow after updating configuration
3. **Document Changes:** Document any custom payment configurations
4. **Version Control:** Don't commit sensitive keys to version control (use `.env.local` or `.env.example`)
5. **Validate Input:** Ensure environment variables are valid before using them

## Related Files

- `src/lib/paymentConfig.ts` - Payment configuration logic
- `src/screens/booking/ConfirmBookingScreen.tsx` - Uses payment configuration
- `.env` - Environment variables
- `.env.example` - Example environment variables
