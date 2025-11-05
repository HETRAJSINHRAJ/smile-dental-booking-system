# Patient Portal - Smile Dental Booking System

This is the patient-facing portal for the Smile Dental booking system. Patients can browse services, view providers, and book appointments.

## Features

- 🏠 Homepage with dental services overview
- 📋 Services catalog
- 👨‍⚕️ Provider profiles
- 📅 5-step booking flow
- 💳 Integrated payment gateway with reservation fees
- 🧾 PDF receipt generation and download
- 🖼️ Gallery
- 📞 Contact page
- 🔐 Patient authentication

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project configured

### Installation

1. Install dependencies:
```bash
npm install
```

This includes:
- `@react-pdf/renderer` - Professional PDF generation using React components

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Firebase configuration.

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
patient-portal/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── page.tsx      # Homepage
│   │   ├── about/        # About page
│   │   ├── services/     # Services catalog
│   │   ├── gallery/      # Gallery page
│   │   ├── contact/      # Contact page
│   │   ├── booking/      # Booking flow
│   │   └── auth/         # Authentication pages
│   ├── components/       # React components
│   │   ├── layout/       # Layout components (Navbar, Footer)
│   │   └── ui/           # UI components (shadcn/ui)
│   ├── contexts/         # React contexts
│   ├── lib/              # Utilities and Firebase config
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript types
├── public/               # Static assets
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID

## Payment Receipt PDF Feature

### Overview
After successful appointment reservation and payment, users are redirected to a success page where they can view and download a professional PDF receipt.

### User Flow
1. **Confirmation Page** → User confirms booking details and agrees to policy
2. **Payment Component** → User completes payment
3. **Success Redirect** → Automatically redirected to success page with payment data
4. **Success Page** → Shows confirmation, appointment details, and payment receipt
5. **PDF Download** → User can download PDF receipt for their records

### PDF Receipt Contents
The generated PDF includes:
- **Header:** Payment Receipt title with "PAID" status badge
- **Appointment Details:** Service, provider, date, and time
- **Patient Information:** Name, email, and phone number
- **Payment Information:** Transaction ID, payment date/time, method
- **Amount Breakdown:** Reservation fee, GST (18%), and total paid
- **Service Payment Due:** Remaining amount to be paid at clinic (if applicable)
- **Footer:** Computer-generated notice and timestamp

### Key Components
- `src/components/payment/PaymentReceiptPDF.tsx` - Receipt component with PDF generation
- `src/app/booking/confirm/page.tsx` - Handles payment and redirects to success page
- `src/app/booking/success/page.tsx` - Displays receipt with download button

### Technical Implementation
- Uses `@react-pdf/renderer` library for React-based PDF generation
- Professional A4-sized document with proper formatting
- Perfect currency and text rendering (no spacing issues)
- Color-coded sections for easy reading
- Downloads with formatted filename: `receipt_{transactionId}_{date}.pdf`
- Payment data passed via secure URL parameters
- No additional API calls needed for receipt generation
- Client-side PDF generation for instant download

### Browser Compatibility
Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Deployment

This application can be deployed to Vercel, Netlify, or any platform that supports Next.js.

### Vercel Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy

## License

Private - All rights reserved

