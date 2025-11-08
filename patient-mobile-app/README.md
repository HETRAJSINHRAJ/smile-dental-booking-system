# Patient Mobile App - Dental Booking System

A React Native mobile application for patients to book dental appointments, manage their profile, and view appointment history.

## Features

- **User Authentication**: Sign up, sign in, and password reset
- **Home Dashboard**: View featured services, providers, and quick stats
- **Services Browser**: Browse all available dental services
- **Appointment Booking**: Multi-step booking flow
- **Appointment Management**: View and manage appointments
- **Profile Management**: Update user information and settings

## Tech Stack

- React Native 0.82.1
- TypeScript
- Firebase (Auth, Firestore, Storage)
- React Navigation 7.x
- React Native Vector Icons

## Prerequisites

- Node.js >= 20
- React Native development environment
- iOS: Xcode 14+ and CocoaPods
- Android: Android Studio and SDK 33+

## Installation

1. **Clone and navigate to the project**
   ```bash
   cd patient-mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup**
   ```bash
   cd ios
   bundle install
   bundle exec pod install
   cd ..
   ```

4. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Add iOS and Android apps
   - Download configuration files:
     - `google-services.json` → `android/app/`
     - `GoogleService-Info.plist` → `ios/`

5. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase credentials
   ```

6. **Run the app**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## Project Structure

```
src/
├── config/          # Firebase and app configuration
├── contexts/        # React contexts (Auth, etc.)
├── lib/            # Utility functions and helpers
├── navigation/     # Navigation configuration
├── screens/        # Screen components
│   ├── auth/       # Authentication screens
│   ├── main/       # Main tab screens
│   ├── booking/    # Booking flow screens
│   ├── appointments/
│   └── profile/
└── types/          # TypeScript type definitions
```

## Key Features Implemented

### Authentication
- Email/password authentication via Firebase
- User profile creation with role assignment
- Password reset functionality
- Persistent authentication state

### Navigation
- Bottom tab navigation for main features
- Stack navigation for booking flow
- Conditional rendering based on auth state

### Screens
- **Home**: Dashboard with services and providers
- **Services**: Browse all dental services
- **Booking**: Start appointment booking
- **Appointments**: View appointment history
- **Profile**: Manage user account

### Data Management
- Firestore integration for real-time data
- Generic CRUD operations
- Type-safe data models
- Provider availability checking

## Development

### Running in Development
```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Debugging
- Use React Native Debugger or Flipper
- Enable Fast Refresh for quick development
- Check logs with `npx react-native log-ios` or `npx react-native log-android`

### Building for Production

**iOS**
```bash
cd ios
xcodebuild -workspace patient.xcworkspace -scheme patient -configuration Release
```

**Android**
```bash
cd android
./gradlew assembleRelease
```

## Configuration

### Firebase Setup
1. Enable Authentication (Email/Password)
2. Create Firestore database
3. Set up security rules
4. Enable Storage (optional)

### Environment Variables
See `.env.example` for required variables:
- Firebase configuration
- API keys
- Environment settings

## Troubleshooting

### iOS Issues
- **Build fails**: Clean build folder and reinstall pods
  ```bash
  cd ios
  xcodebuild clean
  bundle exec pod install --repo-update
  ```

### Android Issues
- **Build fails**: Clean gradle cache
  ```bash
  cd android
  ./gradlew clean
  ```

### Firebase Issues
- Verify configuration in `.env`
- Check Firebase console for app registration
- Ensure google-services files are in correct locations

## Next Steps

See `IMPLEMENTATION_GUIDE.md` for:
- Complete booking flow implementation
- Payment integration
- Push notifications
- Offline support
- Performance optimization
- Testing strategy

## Related Projects

This mobile app is part of the dental-booking-system monorepo:
- **patient-portal**: Web application (Next.js)
- **admin-portal**: Admin dashboard (Next.js)
- **patient-mobile-app**: This mobile app (React Native)

## Resources

- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Firebase for React Native](https://rnfirebase.io/)
- [TypeScript](https://www.typescriptlang.org/)

## License

Part of the dental-booking-system project.
