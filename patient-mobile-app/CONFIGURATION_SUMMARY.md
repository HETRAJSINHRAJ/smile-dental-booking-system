# Mobile App Configuration Summary

## Overview

The patient mobile app now uses environment variables for all payment-related configuration, matching the web app's approach. This allows easy customization without code changes.

## Files Updated/Created

### 1. `.env` (Updated)
**Location:** `patient-mobile-app/.env`

**New Payment Configuration Variables:**
```properties
# Appointment reservation fee (fixed amount in INR)
APPOINTMENT_RESERVATION_FEE=500

# Enable online payment for service fees
ENABLE_SERVICE_PAYMENT_ONLINE=false

# GST Tax Rate
GST_TAX_RATE=0.18

# Convenience Fee
CONVENIENCE_FEE=0
```

### 2. `.env.example` (Created)
**Location:** `patient-mobile-app/.env.example`

Provides a template for developers to understand all available configuration options with detailed comments.

### 3. `src/lib/paymentConfig.ts` (Updated)
**Location:** `patient-mobile-app/src/lib/paymentConfig.ts`

**Changes:**
- Now reads `APPOINTMENT_RESERVATION_FEE` from environment variables
- Now reads `ENABLE_SERVICE_PAYMENT_ONLINE` from environment variables
- Now reads `GST_TAX_RATE` from environment variables
- Now reads `CONVENIENCE_FEE` from environment variables
- Includes fallback defaults matching web app configuration
- Fully documented with comments

### 4. `PAYMENT_CONFIGURATION.md` (Created)
**Location:** `patient-mobile-app/PAYMENT_CONFIGURATION.md`

Comprehensive guide covering:
- All environment variables and their purposes
- Payment breakdown examples
- Configuration scenarios
- How to update configuration
- Synchronization with web app
- Troubleshooting guide
- Best practices

## Configuration Comparison

### Web App (patient-portal)
```
NEXT_PUBLIC_APPOINTMENT_RESERVATION_FEE=500
NEXT_PUBLIC_ENABLE_SERVICE_PAYMENT_ONLINE=false
```

### Mobile App (patient-mobile-app)
```
APPOINTMENT_RESERVATION_FEE=500
ENABLE_SERVICE_PAYMENT_ONLINE=false
GST_TAX_RATE=0.18
CONVENIENCE_FEE=0
```

## Current Configuration

The mobile app is configured with:

| Setting | Value | Description |
|---------|-------|-------------|
| Appointment Reservation Fee | ₹500 | Fixed fee charged for booking |
| Service Payment Online | false | Service fees collected at clinic |
| GST Tax Rate | 18% | Applied to all fees |
| Convenience Fee | 0% | No additional convenience fee |

## Payment Flow Example

With current configuration, for a ₹1000 service:

**Step 1: Appointment Booking**
- Reservation Fee: ₹500
- GST (18%): ₹90
- **Total to Pay Online: ₹590**

**Step 2: At Clinic**
- Service Fee: ₹1000
- GST (18%): ₹180
- **Total to Pay at Clinic: ₹1180**

## How to Modify Configuration

### Change Appointment Fee
Edit `.env`:
```properties
APPOINTMENT_RESERVATION_FEE=750  # Changed from 500
```

### Enable Online Service Payment
Edit `.env`:
```properties
ENABLE_SERVICE_PAYMENT_ONLINE=true  # Changed from false
```

### Adjust Tax Rate
Edit `.env`:
```properties
GST_TAX_RATE=0.05  # Changed from 0.18 (5% instead of 18%)
```

### Add Convenience Fee
Edit `.env`:
```properties
CONVENIENCE_FEE=0.03  # Added 3% convenience fee
```

## Implementation Details

### Payment Configuration Module
**File:** `src/lib/paymentConfig.ts`

```typescript
export interface PaymentConfig {
  appointmentReservationFee: number;
  enableServicePaymentOnline: boolean;
  taxRate: number;
  convenienceFee: number;
}

export const getPaymentConfig = (): PaymentConfig => {
  // Reads from environment variables with fallback defaults
}

export const formatPaymentBreakdown = (servicePrice: number, config: PaymentConfig) => {
  // Calculates payment breakdown based on configuration
}
```

### Usage in ConfirmBookingScreen
**File:** `src/screens/booking/ConfirmBookingScreen.tsx`

```typescript
import { getPaymentConfig, formatPaymentBreakdown } from '../../lib/paymentConfig';

const paymentConfig = getPaymentConfig();
const paymentBreakdown = formatPaymentBreakdown(service.price, paymentConfig);

// Display payment breakdown to user
```

## Benefits

✅ **No Code Changes Required** - Update fees by editing `.env`  
✅ **Synchronized with Web App** - Same configuration approach  
✅ **Flexible** - Easy to test different pricing models  
✅ **Maintainable** - Centralized configuration management  
✅ **Documented** - Clear comments and examples  
✅ **Fallback Defaults** - Works even if env variables are missing  

## Next Steps

1. Review the payment configuration in `.env`
2. Adjust values as needed for your clinic
3. Test the booking flow with different configurations
4. Keep mobile and web app configurations in sync
5. Refer to `PAYMENT_CONFIGURATION.md` for detailed guidance

## Support

For questions about payment configuration:
1. Check `PAYMENT_CONFIGURATION.md` for detailed documentation
2. Review `.env.example` for all available options
3. Examine `src/lib/paymentConfig.ts` for implementation details
4. Check `src/screens/booking/ConfirmBookingScreen.tsx` for usage examples
