# Patient Mobile App - Implementation Guide

## Overview
This React Native mobile application is built to mirror the functionality of the patient-portal web application, providing patients with a native mobile experience for booking dental appointments.

## Architecture

### Key Features Implemented
1. **Authentication System**
   - Email/Password authentication via Firebase
   - Sign up, Sign in, Password reset
   - User profile management
   - Role-based access (patient/admin)

2. **Navigation Structure**
   - Bottom tab navigation for main screens
   - Stack navigation for booking flow
   - Auth flow separation

3. **Main Screens**
   - Home: Dashboard with stats, featured services, and providers
   - Services: Browse all available dental services
   - Booking: Start appointment booking process
   - Appointments: View user's appointment history
   - Profile: User account management

4. **Booking Flow**
   - Select Service
   - Select Provider
   - Select Date & Time
   - Confirm Booking
   - Success Screen

### Technology Stack
- **React Native 0.82.1**: Core framework
- **React Navigation 7.x**: Navigation library
- **Firebase**: Backend services
  - Authentication
  - Firestore database
  - Storage
- **TypeScript**: Type safety
- **React Native Vector Icons**: Icon library

## Setup Instructions

### Prerequisites
- Node.js >= 20
- React Native development environment set up
- iOS: Xcode and CocoaPods
- Android: Android Studio and SDK

### Installation

1. **Install Dependencies**
   ```bash
   cd patient-mobile-app
   npm install
   ```

2. **iOS Setup**
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Configure Firebase**
   - Create a Firebase project
   - Add iOS and Android apps to your Firebase project
   - Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
   - Place files in appropriate directories:
     - Android: `android/app/google-services.json`
     - iOS: `ios/GoogleService-Info.plist`

4. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values

5. **Run the App**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## Project Structure

```
patient-mobile-app/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Firebase configuration
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication context
│   ├── lib/
│   │   └── firestore.ts         # Firestore helper functions
│   ├── navigation/
│   │   └── AppNavigator.tsx     # Navigation configuration
│   ├── screens/
│   │   ├── auth/                # Authentication screens
│   │   ├── main/                # Main tab screens
│   │   ├── booking/             # Booking flow screens
│   │   ├── appointments/        # Appointments screen
│   │   └── profile/             # Profile screen
│   └── types/
│       └── firebase.ts          # TypeScript type definitions
├── App.tsx                      # Root component
└── package.json
```

## Features from Web Portal Applied

### 1. Firebase Integration
- Mirrored authentication flow from patient-portal
- Same Firestore data structure
- Shared type definitions

### 2. User Authentication
- Email/password authentication
- User profile creation with role assignment
- Password reset functionality
- Session management

### 3. Data Models
All data models match the web portal:
- Service
- Provider
- Appointment
- UserProfile
- ProviderSchedule
- ContactInquiry

### 4. Firestore Operations
- Generic CRUD operations
- Provider availability checking
- Time slot generation
- Appointment management

### 5. UI/UX Patterns
- Similar color scheme (#3B82F6 primary blue)
- Consistent card-based layouts
- Icon usage for visual hierarchy
- Loading states and error handling

## Next Steps for Full Implementation

### 1. Complete Booking Flow
- [ ] Implement SelectProviderScreen with provider list
- [ ] Add date picker in SelectDateTimeScreen
- [ ] Implement time slot selection
- [ ] Create booking confirmation with payment integration
- [ ] Add booking success screen with appointment details

### 2. Payment Integration
- [ ] Integrate Razorpay SDK for React Native
- [ ] Implement payment gateway wrapper
- [ ] Add payment status tracking
- [ ] Create payment receipt generation

### 3. Enhanced Features
- [ ] Push notifications for appointment reminders
- [ ] In-app messaging with providers
- [ ] Medical history management
- [ ] Document upload (insurance, medical records)
- [ ] Appointment rescheduling
- [ ] Cancellation with refund handling

### 4. Validation Libraries
- [ ] Port Indian phone validation
- [ ] Port Indian address validation
- [ ] Port Indian name validation
- [ ] Add form validation with react-hook-form

### 5. Offline Support
- [ ] Implement offline data caching
- [ ] Queue operations for when online
- [ ] Sync mechanism

### 6. Performance Optimization
- [ ] Image optimization and caching
- [ ] Lazy loading for lists
- [ ] Memoization for expensive operations
- [ ] Bundle size optimization

### 7. Testing
- [ ] Unit tests for utilities
- [ ] Integration tests for flows
- [ ] E2E tests with Detox
- [ ] Accessibility testing

## Key Differences from Web Portal

1. **Navigation**: Uses native navigation instead of Next.js routing
2. **Styling**: React Native StyleSheet instead of Tailwind CSS
3. **Components**: Native components instead of Radix UI
4. **Animations**: React Native Animated API instead of Framer Motion
5. **Icons**: react-native-vector-icons instead of lucide-react

## Firebase Configuration Notes

The app uses the same Firebase project as the web portal, ensuring:
- Shared user authentication
- Consistent data structure
- Real-time synchronization between web and mobile
- Single source of truth for appointments and services

## Development Tips

1. **Hot Reload**: Use Fast Refresh for quick development
2. **Debugging**: Use React Native Debugger or Flipper
3. **Testing on Device**: Use Expo Go or build development builds
4. **State Management**: Consider adding Redux/Zustand for complex state
5. **Error Tracking**: Integrate Sentry or similar for production

## Common Issues and Solutions

### iOS Build Issues
- Clean build folder: `cd ios && xcodebuild clean`
- Reinstall pods: `cd ios && pod install --repo-update`

### Android Build Issues
- Clean gradle: `cd android && ./gradlew clean`
- Check google-services.json is in correct location

### Firebase Connection Issues
- Verify Firebase configuration in .env
- Check Firebase project settings
- Ensure app is registered in Firebase console

## Resources

- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Firebase for React Native](https://rnfirebase.io/)
- [React Native Vector Icons](https://github.com/oblador/react-native-vector-icons)

## Contributing

When adding new features:
1. Follow the existing code structure
2. Maintain TypeScript type safety
3. Keep components modular and reusable
4. Add proper error handling
5. Update this documentation

## License

Same as the parent dental-booking-system project.
