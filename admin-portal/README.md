# Admin Portal - Smile Dental Management System

This is the admin panel for the Smile Dental booking system. Administrators can manage appointments, patients, providers, and services.

## Features

- 📊 Dashboard with statistics
- 📅 Appointments management
- 👥 Patients management
- 👨‍⚕️ Providers CRUD operations
- 🦷 Services CRUD operations
- 🔐 Secure admin authentication with email whitelist
- 🛡️ Two-layer security (whitelist + role verification)

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

3. Set up admin access:

**IMPORTANT:** The admin portal uses a secure two-layer authentication system:
- **Email Whitelist**: Only pre-approved emails can access the admin portal
- **Admin Role**: Users must have `role: "admin"` in their Firestore profile

See [ADMIN_SETUP_GUIDE.md](../ADMIN_SETUP_GUIDE.md) for detailed instructions on:
- Creating admin accounts in Firebase Console
- Setting up the email whitelist
- Configuring Firestore security rules

Quick setup using the script:
```bash
npx tsx scripts/setup-admin-whitelist.ts
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser.

**Note:** The admin portal runs on port 3001 by default to avoid conflicts with the patient portal.

## Project Structure

```
admin-portal/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── page.tsx      # Redirects to /dashboard
│   │   ├── dashboard/    # Dashboard page
│   │   ├── appointments/ # Appointments management
│   │   ├── patients/     # Patients management
│   │   ├── providers/    # Providers CRUD
│   │   ├── services/     # Services CRUD
│   │   ├── auth/         # Authentication pages
│   │   └── layout.tsx    # Root layout with AdminSidebar
│   ├── components/       # React components
│   │   ├── layout/       # Layout components (AdminSidebar, AdminGuard)
│   │   └── ui/           # UI components (shadcn/ui)
│   ├── contexts/         # React contexts
│   ├── lib/              # Utilities and Firebase config
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript types
├── public/               # Static assets
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build for production
- `npm run start` - Start production server on port 3001
- `npm run lint` - Run ESLint
- `npx tsx scripts/setup-admin-whitelist.ts` - Initialize admin email whitelist

## Admin Authentication

### Security Model

The admin portal implements a **two-layer security system**:

1. **Email Whitelist** (Firestore: `config/adminWhitelist`)
   - Only pre-approved email addresses can attempt login
   - Managed through Firebase Console or setup script
   - Cannot be modified from the client application

2. **Admin Role** (Firestore: `users/{uid}`)
   - User profile must have `role: "admin"` field
   - Verified on every protected route access
   - Only admins can modify user roles

### Creating Admin Accounts

Admin accounts **cannot be created through the application**. They must be created manually:

1. **Create user in Firebase Authentication**
   - Go to Firebase Console → Authentication → Users
   - Add user with email and password

2. **Create user profile in Firestore**
   - Go to Firestore Database → `users` collection
   - Create document with user's UID
   - Set `role: "admin"` field

3. **Add email to whitelist**
   - Go to Firestore Database → `config/adminWhitelist`
   - Add email to the `emails` array
   - Or use the setup script: `npx tsx scripts/setup-admin-whitelist.ts`

📖 **See [ADMIN_SETUP_GUIDE.md](../ADMIN_SETUP_GUIDE.md) for detailed step-by-step instructions.**

### Login Flow

```
User enters email/password
    ↓
Check email whitelist ──→ Not whitelisted ──→ ❌ Access Denied
    ↓ Whitelisted
Firebase Authentication ──→ Invalid credentials ──→ ❌ Login Failed
    ↓ Authenticated
Check admin role ──→ Not admin ──→ ❌ Access Denied
    ↓ Admin
✅ Access Granted → Dashboard
```

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

