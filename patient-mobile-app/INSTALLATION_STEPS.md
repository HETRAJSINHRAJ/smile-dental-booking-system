# Installation Steps for New Features

## Required Package Installation

To use the new Splash and Onboarding screens, you need to install AsyncStorage:

```bash
cd patient-mobile-app
npm install @react-native-async-storage/async-storage
```

### For Android
No additional steps required. The package will auto-link.

### For iOS
```bash
cd ios
pod install
cd ..
```

## Rebuild the App

After installing the package:

### Android
```bash
npx react-native run-android
```

### iOS
```bash
npx react-native run-ios
```

## Features Added

### 1. Splash Screen
- Beautiful animated splash screen with logo
- Smooth fade-in and scale animations
- 2.5 second display duration
- Brand colors and identity

### 2. Onboarding Screens
- 4 informative slides:
  - Easy Booking
  - Expert Dentists
  - Smart Reminders
  - Secure & Private
- Smooth horizontal scrolling
- Animated pagination dots
- Skip button for returning users
- Stored in AsyncStorage (shows only once)

### 3. Modern SignUp Screen
- Clean, professional design
- Form validation
- Password confirmation
- Terms & conditions checkbox
- Social sign-up options
- Smooth keyboard handling
- Back navigation

## Testing Onboarding Again

To see the onboarding screens again during development:

1. Clear app data (Android) or delete app (iOS)
2. Or use this code snippet in your app:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.removeItem('@onboarding_completed');
```

## File Structure

```
src/
├── screens/
│   ├── onboarding/
│   │   ├── SplashScreen.tsx
│   │   └── OnboardingScreen.tsx
│   └── auth/
│       ├── LoginScreen.tsx
│       └── SignUpScreen.tsx
└── App.tsx (updated)
```

## Customization

### Change Splash Duration
Edit `SplashScreen.tsx`:
```typescript
const timer = setTimeout(() => {
  onFinish();
}, 2500); // Change this value (in milliseconds)
```

### Modify Onboarding Content
Edit `OnboardingScreen.tsx`:
```typescript
const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    icon: 'calendar', // Change icon
    title: 'Your Title', // Change title
    description: 'Your description', // Change description
    color: colors.primary[500], // Change color
  },
  // Add more slides...
];
```

### Skip Onboarding in Development
In `App.tsx`, comment out the onboarding check:
```typescript
// const hasCompletedOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
// if (!hasCompletedOnboarding) {
//   setShowOnboarding(true);
// }
```
