# 🦷 Smile Dental - Dual Portal System

A modern, **production-ready** dental appointment booking system built with Next.js 15, Firebase, and TypeScript. This project consists of **two separate Next.js applications**:

1. **Patient Portal** - Public-facing booking system (www.smiledental.com)
2. **Admin Portal** - Management dashboard (admin.smiledental.com)

![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black) ![Firebase](https://img.shields.io/badge/Firebase-12.4.0-orange) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-cyan)

---

## 📁 Project Structure

```
dental-booking-system/
├── patient-portal/          # Patient-facing application (port 3000)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── admin-portal/            # Admin management application (port 3001)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── old-monorepo/            # Archived original monorepo code
├── seed-data/               # Firebase seed data (services, providers)
├── firestore.rules          # Firestore security rules
├── SETUP.md                 # 📖 Comprehensive setup guide
├── FIREBASE_SETUP.md        # Firebase configuration guide
├── SEEDING_GUIDE.md         # Data seeding instructions
└── README.md                # This file
```

---

## ✨ Features

### Patient Portal (`patient-portal/`)
- 🏠 **Homepage** - Hero section with call-to-action
- 🦷 **Services Catalog** - Browse dental services with pricing
- 📅 **5-Step Booking Flow**:
  - Service selection
  - Provider selection with ratings & reviews
  - Date & time picker
  - Patient details form
  - Booking confirmation
- 👨‍⚕️ **Provider Profiles** - View dentist credentials and specializations
- 🖼️ **Gallery** - Clinic photos
- 📞 **Contact Form** - Get in touch
- 🔐 **Patient Authentication** - Secure login/signup

### Admin Portal (`admin-portal/`)
- 📊 **Dashboard** - Real-time statistics and metrics
- 📅 **Appointments Management** - View, confirm, cancel, complete appointments
- 👥 **Patients Management** - Patient records and history
- 👨‍⚕️ **Providers Management** - CRUD operations for dentists
- 🦷 **Services Management** - CRUD operations for dental services
- 🔒 **Admin Guard** - Role-based access control
- 🎨 **Admin Sidebar** - Easy navigation

### Technical Features
- ⚡ **Next.js 15** with App Router and Turbopack
- 🔥 **Firebase** - Authentication, Firestore, Storage
- 📘 **TypeScript** - Full type safety
- 🎨 **Tailwind CSS v4** - Modern styling
- 🧩 **shadcn/ui** - Beautiful UI components
- 📱 **Responsive Design** - Mobile, tablet, desktop
- 🔔 **Toast Notifications** - User feedback with Sonner
- ✨ **Framer Motion** - Smooth animations

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase account with project created
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd dental-booking-system
```

### 2. Install Dependencies

**Patient Portal:**
```bash
cd patient-portal
npm install
```

**Admin Portal:**
```bash
cd ../admin-portal
npm install
```

### 3. Set Up Environment Variables

Both portals need Firebase configuration. The `.env.local` files have already been created in each portal directory.

**Edit `patient-portal/.env.local` and `admin-portal/.env.local`:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

> 📖 **See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed Firebase configuration instructions**

### 4. Run Both Applications

Open **two terminal windows**:

**Terminal 1 - Patient Portal:**
```bash
cd patient-portal
npm run dev
```
Access at: **http://localhost:3000**

**Terminal 2 - Admin Portal:**
```bash
cd admin-portal
npm run dev
```
Access at: **http://localhost:3001**

### 5. Seed Initial Data (Optional)

See [SEEDING_GUIDE.md](./SEEDING_GUIDE.md) for instructions on populating your database with sample services and providers.

---

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - 📖 **Comprehensive setup guide for both portals** (START HERE!)
- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Firebase configuration and security rules
- **[SEEDING_GUIDE.md](./SEEDING_GUIDE.md)** - Database seeding instructions
- **[WINDOWS_SETUP.md](./WINDOWS_SETUP.md)** - Windows-specific setup notes
- **[patient-portal/README.md](./patient-portal/README.md)** - Patient portal documentation
- **[admin-portal/README.md](./admin-portal/README.md)** - Admin portal documentation

---

## 🛠️ Development

### Available Scripts

**Patient Portal:**
```bash
cd patient-portal
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

**Admin Portal:**
```bash
cd admin-portal
npm run dev      # Start development server (port 3001)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Tech Stack
- **Framework:** Next.js 15.3.5 with App Router
- **Language:** TypeScript 5.0
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Backend:** Firebase (Firestore, Auth, Storage)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts (admin portal)

---

## 🚢 Deployment

### Deploy Patient Portal

**Vercel (Recommended):**
1. Push code to GitHub
2. Import project in Vercel
3. Set root directory to `patient-portal`
4. Add environment variables
5. Deploy to www.smiledental.com

### Deploy Admin Portal

**Vercel (Recommended):**
1. Import project in Vercel (separate deployment)
2. Set root directory to `admin-portal`
3. Add environment variables (including Firebase Admin SDK)
4. Deploy to admin.smiledental.com

> 📖 **See [SETUP.md](./SETUP.md) for detailed deployment instructions**

---

## 🔒 Security

- ✅ Firestore security rules enforced
- ✅ Environment variables for sensitive data
- ✅ Client-side and server-side route protection
- ✅ Admin-only routes with AdminGuard
- ✅ Input validation on all forms
- ✅ TypeScript for type safety

---

## 📊 Database Collections

- `users` - User authentication and profiles
- `services` - Dental services catalog
- `providers` - Dentist profiles and credentials
- `appointments` - Patient appointment bookings
- `provider_schedules` - Provider availability schedules
- `contact_inquiries` - Contact form submissions

---

## 🐛 Troubleshooting

### Issue: Can't access admin routes
**Solution:** Ensure your user has `role: "admin"` in Firestore `users` collection

### Issue: Firebase not initialized
**Solution:** Check that all environment variables are set correctly in `.env.local`

### Issue: Port already in use
**Solution:** 
```bash
# Patient portal - use different port
npm run dev -- -p 3002

# Admin portal - use different port
npm run dev -- -p 3003
```

### Issue: Build errors
**Solution:**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Firebase](https://firebase.google.com/) - Backend platform
- [Shadcn/UI](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide](https://lucide.dev/) - Beautiful icons

---

Made with ❤️ for modern dental practices

