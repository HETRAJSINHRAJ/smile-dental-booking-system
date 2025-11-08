# Quick Payment Configuration Reference

## TL;DR - Quick Changes

### Change Appointment Fee
```bash
# Edit .env
APPOINTMENT_RESERVATION_FEE=750  # Change 500 to your desired amount
```

### Enable Full Online Payment
```bash
# Edit .env
ENABLE_SERVICE_PAYMENT_ONLINE=true  # Change false to true
```

### Adjust Tax Rate
```bash
# Edit .env
GST_TAX_RATE=0.05  # Change 0.18 to your desired rate (0.05 = 5%)
```

### Add Convenience Fee
```bash
# Edit .env
CONVENIENCE_FEE=0.02  # Add 2% convenience fee (0 = no fee)
```

## Current Settings

```properties
APPOINTMENT_RESERVATION_FEE=500
ENABLE_SERVICE_PAYMENT_ONLINE=false
GST_TAX_RATE=0.18
CONVENIENCE_FEE=0
```

## Payment Calculation

**Formula:**
```
Appointment Total = (Reservation Fee × (1 + Tax Rate)) + Convenience Fee
Service Total = (Service Price × (1 + Tax Rate))
```

**Example with current settings:**
```
Service Price: ₹1000
Reservation Fee: ₹500
Tax Rate: 18%

Appointment Payment = 500 × 1.18 = ₹590
Service Payment = 1000 × 1.18 = ₹1180
```

## Common Scenarios

### Scenario A: Increase Reservation Fee to ₹750
```properties
APPOINTMENT_RESERVATION_FEE=750
ENABLE_SERVICE_PAYMENT_ONLINE=false
GST_TAX_RATE=0.18
CONVENIENCE_FEE=0
```
**Result:** Patients pay ₹885 (₹750 + 18% GST) online

### Scenario B: Collect Full Payment Online
```properties
APPOINTMENT_RESERVATION_FEE=500
ENABLE_SERVICE_PAYMENT_ONLINE=true
GST_TAX_RATE=0.18
CONVENIENCE_FEE=0
```
**Result:** Patients pay both fees online

### Scenario C: Add Processing Fee
```properties
APPOINTMENT_RESERVATION_FEE=500
ENABLE_SERVICE_PAYMENT_ONLINE=false
GST_TAX_RATE=0.18
CONVENIENCE_FEE=0.03
```
**Result:** Patients pay ₹590 + 3% = ₹607.70 online

### Scenario D: No Tax (0% GST)
```properties
APPOINTMENT_RESERVATION_FEE=500
ENABLE_SERVICE_PAYMENT_ONLINE=false
GST_TAX_RATE=0
CONVENIENCE_FEE=0
```
**Result:** Patients pay ₹500 online

## Environment Variables Explained

| Variable | Type | Example | Notes |
|----------|------|---------|-------|
| `APPOINTMENT_RESERVATION_FEE` | Integer | 500 | Amount in INR |
| `ENABLE_SERVICE_PAYMENT_ONLINE` | Boolean | false | 'true' or 'false' |
| `GST_TAX_RATE` | Decimal | 0.18 | 0.18 = 18% |
| `CONVENIENCE_FEE` | Decimal | 0 | 0.02 = 2% |

## Files to Edit

- **`.env`** - Main configuration file (edit this)
- **`.env.example`** - Template (reference only)
- **`src/lib/paymentConfig.ts`** - Code (don't edit unless needed)

## After Making Changes

1. Save the `.env` file
2. Restart the development server
3. Test the booking flow
4. Verify payment amounts are correct

## Sync with Web App

Keep these in sync:

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

## Troubleshooting

**Changes not taking effect?**
- Restart the development server
- Clear build cache
- Check `.env` file is in project root

**Wrong payment amounts?**
- Verify `APPOINTMENT_RESERVATION_FEE` value
- Check `GST_TAX_RATE` is a valid decimal
- Ensure `ENABLE_SERVICE_PAYMENT_ONLINE` is 'true' or 'false'

**Need more help?**
- See `PAYMENT_CONFIGURATION.md` for detailed guide
- Check `src/lib/paymentConfig.ts` for implementation
- Review `ConfirmBookingScreen.tsx` for usage

## Payment Display in App

The app shows:
- Appointment Reservation Fee
- GST (18%)
- Total Payable Now
- Service Fee (collected at clinic or online based on config)

All amounts are calculated automatically from `.env` configuration.
