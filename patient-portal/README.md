# Patient Portal - Smile Dental Booking System

This is the patient-facing portal for the Smile Dental booking system. Patients can browse services, view providers, and book appointments.

## Features

- 🏠 Homepage with dental services overview
- 📋 Services catalog
- 👨‍⚕️ Provider profiles
- 📅 5-step booking flow
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

## Deployment

This application can be deployed to Vercel, Netlify, or any platform that supports Next.js.

### Vercel Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy

## License

Private - All rights reserved

