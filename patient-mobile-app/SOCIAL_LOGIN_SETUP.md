9# Social Login Setup Guide

This guide explains how to configure and test social login (Google, Facebook, and Apple) in the Patient Mobile App.

## Prerequisites

All social login providers are already configured with the following credentials in `.env`:

- **Google Sign-In**: iOS, Android, and Web Client IDs
- **Facebook Login**: App ID and App Name
- **Apple Sign-In**: Service ID (iOS only)

## iOS Setup

### 1. Install CocoaPods Dependencies

```bash
cd ios
pod install
cd ..
```

### 2. Configure Google Sign-In

The Google Sign-In URL scheme is already configured in `Info.plist`:
- URL Scheme: `com.googleusercontent.apps.721167168669-c4lj90u7gnsvsv53eamdjbq3mi5nvoip`

### 3. Configure Facebook Login

Facebook configuration is already added to `Info.plist`:
- Facebook App ID: `3765907043710785`
- Facebook Display Name: `Smile Dental Booking`
- URL Scheme: `fb3765907043710785`

### 4. Configure Apple Sign-In

To enable Apple Sign-In:

1. Open `patient.xcworkspace` in Xcode
2. Select the project in the navigator
3. Select the `patient` target
4. Go to "Signing & Capabilities"
5. Click "+ Capability"
6. Add "Sign in with Apple"

**Note**: Apple Sign-In requires:
- A paid Apple Developer account
- App ID configured with Sign in with Apple capability
- Service ID configured in Apple Developer Portal

### 5. Add GoogleService-Info.plist

Download `GoogleService-Info.plist` from Firebase Console and add it to the `ios/patient` directory:

1. Go to Firebase Console → Project Settings → iOS App
2. Download `GoogleService-Info.plist`
3. Add it to `ios/patient/` directory
4. In Xcode, right-click on `patient` folder → Add Files to "patient"
5. Select `GoogleService-Info.plist` and ensure "Copy items if needed" is checked

## Android Setup

### 1. Google Sign-In Configuration

The `google-services.json` file is already present in `android/app/`. This file contains the Google Sign-In configuration.

### 2. Facebook Login Configuration

Facebook configuration is already added to:
- `AndroidManifest.xml`: Facebook Activity and meta-data
- `strings.xml`: Facebook App ID and protocol scheme
- `MainApplication.kt`: Facebook SDK initialization

**Important**: You need to add your Facebook Client Token to `strings.xml`:
1. Go to Facebook Developers Console → Settings → Advanced
2. Copy the Client Token
3. Replace `YOUR_FACEBOOK_CLIENT_TOKEN` in `android/app/src/main/res/values/strings.xml`

### 3. Generate Release Key Hash for Facebook

Facebook requires your app's key hash for authentication:

**Debug Key Hash** (for development):
```bash
cd android
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64
```
Default password: `android`

**Release Key Hash** (for production):
```bash
keytool -exportcert -alias YOUR_RELEASE_KEY_ALIAS -keystore YOUR_RELEASE_KEY_PATH | openssl sha1 -binary | openssl base64
```

Add the generated key hash to Facebook Developers Console:
1. Go to Settings → Basic
2. Scroll to "Key Hashes"
3. Add your key hash

## Firebase Console Configuration

### Enable Authentication Providers

1. Go to Firebase Console → Authentication → Sign-in method
2. Enable the following providers:

#### Google Sign-In
- Click "Google" → Enable
- Add support email
- Save

#### Facebook Login
- Click "Facebook" → Enable
- Add Facebook App ID: `3765907043710785`
- Add Facebook App Secret (from Facebook Developers Console)
- Copy the OAuth redirect URI and add it to Facebook Developers Console:
  - Go to Facebook App → Settings → Basic
  - Add OAuth Redirect URI

#### Apple Sign-In (iOS only)
- Click "Apple" → Enable
- No additional configuration needed for basic setup

## Testing Social Login

### Test on iOS Simulator

**Google Sign-In**: ✅ Works on simulator
**Facebook Login**: ⚠️ May not work on simulator (use real device)
**Apple Sign-In**: ⚠️ Requires real device with iOS 13+

### Test on Android Emulator

**Google Sign-In**: ✅ Works on emulator (requires Google Play Services)
**Facebook Login**: ⚠️ May not work on emulator (use real device)

### Test on Real Devices

All social login providers work on real devices with proper configuration.

## Troubleshooting

### Google Sign-In Issues

**Error: DEVELOPER_ERROR**
- Ensure SHA-1 certificate fingerprint is added to Firebase Console
- For debug builds: `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey`
- Add the SHA-1 to Firebase Console → Project Settings → Android App

**Error: SIGN_IN_REQUIRED**
- Ensure Google Sign-In is enabled in Firebase Console
- Check that Web Client ID in `.env` matches Firebase Console

### Facebook Login Issues

**Error: Invalid key hash**
- Generate and add your key hash to Facebook Developers Console (see above)

**Error: App not setup**
- Ensure Facebook App ID in `.env` matches Facebook Developers Console
- Ensure OAuth redirect URI is added to Facebook App settings

### Apple Sign-In Issues

**Error: Not available**
- Apple Sign-In only works on iOS 13+ devices
- Ensure "Sign in with Apple" capability is added in Xcode

**Error: Invalid client**
- Ensure Service ID is configured in Apple Developer Portal
- Ensure Service ID in `.env` matches Apple Developer Portal

## Security Notes

1. **Never commit** `GoogleService-Info.plist` or `google-services.json` to public repositories
2. **Rotate keys** if they are exposed
3. **Use environment variables** for sensitive configuration
4. **Enable App Check** in Firebase for production to prevent abuse

## Additional Resources

- [Google Sign-In for React Native](https://github.com/react-native-google-signin/google-signin)
- [Facebook SDK for React Native](https://github.com/thebergamo/react-native-fbsdk-next)
- [Apple Authentication for React Native](https://github.com/invertase/react-native-apple-authentication)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
