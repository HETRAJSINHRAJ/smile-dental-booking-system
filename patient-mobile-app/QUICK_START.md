# Quick Start Guide - Patient Mobile App

## Prerequisites Check

Before starting, ensure you have:
- [ ] Node.js 20+ installed
- [ ] Android Studio installed (for Android)
- [ ] Xcode installed (for iOS, macOS only)
- [ ] Git installed

## Windows Users - IMPORTANT

⚠️ **Windows Path Length Issue**: You may encounter build errors due to Windows' 260-character path limit.

**Quick Fix:**
1. Run PowerShell as Administrator
2. Execute:
   ```powershell
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
   ```
3. Restart your computer
4. See `WINDOWS_BUILD_FIX.md` for detailed solutions

## Installation Steps

### 1. Install Dependencies

```bash
cd patient-mobile-app
npm install
```

### 2. iOS Setup (macOS only)

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

### 3. Android Setup

No additional setup needed. Android dependencies are managed by Gradle.

### 4. Configure Firebase

**Option A: Use Existing Firebase Project**
1. Get Firebase config from your team
2. Place files:
   - `google-services.json` → `android/app/`
   - `GoogleService-Info.plist` → `ios/`

**Option B: Create New Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add Android app:
   - Package name: `com.patient`
   - Download `google-services.json`
   - Place in `android/app/`
4. Add iOS app:
   - Bundle ID: `org.reactjs.native.example.patient`
   - Download `GoogleService-Info.plist`
   - Place in `ios/`
5. Enable Authentication (Email/Password)
6. Create Firestore database

### 5. Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your Firebase credentials:
```env
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### 6. Run the App

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

## Troubleshooting

### Build Fails on Windows
See `WINDOWS_BUILD_FIX.md` for path length solutions.

### Metro Bundler Issues
```bash
npm start -- --reset-cache
```

### Android Build Fails
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### iOS Build Fails
```bash
cd ios
xcodebuild clean
pod install --repo-update
cd ..
npm run ios
```

### Firebase Connection Issues
1. Verify config files are in correct locations
2. Check `.env` file has correct values
3. Ensure Firebase project has Auth and Firestore enabled

## First Run Checklist

After successful build:
- [ ] App launches without crashes
- [ ] Sign up screen is visible
- [ ] Can create a new account
- [ ] Can sign in with created account
- [ ] Home screen loads with data
- [ ] Navigation tabs work

## Development Workflow

1. **Start Metro Bundler:**
   ```bash
   npm start
   ```

2. **Run on Device/Emulator:**
   ```bash
   npm run android  # or npm run ios
   ```

3. **Enable Fast Refresh:**
   - Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
   - Enable "Fast Refresh"

4. **View Logs:**
   ```bash
   npx react-native log-android
   # or
   npx react-native log-ios
   ```

## Common Commands

```bash
# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run tests
npm test

# Lint code
npm run lint

# Clean everything
cd android && ./gradlew clean && cd ..
cd ios && xcodebuild clean && cd ..
rm -rf node_modules
npm install
```

## Next Steps

1. **Test Authentication:**
   - Create a test account
   - Sign in/out
   - Test password reset

2. **Explore Features:**
   - Browse services
   - View providers
   - Check appointments screen
   - Update profile

3. **Review Documentation:**
   - `README.md` - Full documentation
   - `IMPLEMENTATION_GUIDE.md` - Architecture details
   - `MIGRATION_SUMMARY.md` - Web vs Mobile comparison

## Getting Help

If you encounter issues:
1. Check `WINDOWS_BUILD_FIX.md` for Windows-specific issues
2. Review `README.md` troubleshooting section
3. Check React Native documentation
4. Review Firebase setup

## Project Structure Quick Reference

```
patient-mobile-app/
├── src/
│   ├── config/          # Firebase config
│   ├── contexts/        # Auth context
│   ├── lib/            # Utilities
│   ├── navigation/     # Navigation setup
│   ├── screens/        # All screens
│   └── types/          # TypeScript types
├── android/            # Android native code
├── ios/               # iOS native code
├── App.tsx            # Root component
└── package.json       # Dependencies
```

## Success Indicators

You're ready to develop when:
- ✅ App builds without errors
- ✅ Can sign up and sign in
- ✅ Home screen displays data
- ✅ Navigation works smoothly
- ✅ No console errors

Happy coding! 🚀
