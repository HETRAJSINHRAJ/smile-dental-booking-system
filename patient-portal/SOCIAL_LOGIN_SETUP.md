# Social Login Setup Guide

This guide explains how to configure social login (Google and Facebook) for the Patient Portal.

## Prerequisites

Task 20.1 must be completed first:
- Google Sign-In provider enabled in Firebase Console
- Facebook Login provider enabled in Firebase Console
- OAuth client IDs configured for web application
- Authorized domains added for OAuth redirects

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Google Sign-In - Get from Google Cloud Console OAuth 2.0 Client IDs
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com

# Facebook Login - Get from Facebook Developers Console
NEXT_PUBLIC_FACEBOOK_APP_ID=1234567890123456
```

### Getting Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to "APIs & Services" > "Credentials"
4. Find your Web client OAuth 2.0 Client ID
5. Copy the Client ID (ends with `.apps.googleusercontent.com`)
6. Add it to your `.env.local` file

### Getting Facebook App ID

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app
3. Navigate to "Settings" > "Basic"
4. Copy the "App ID"
5. Add it to your `.env.local` file

## Implementation Details

### Components Created

1. **SocialLoginButtons** (`src/components/auth/SocialLoginButtons.tsx`)
   - Renders Google and Facebook login buttons
   - Handles loading states
   - Accepts callbacks for success handlers

2. **GoogleOAuthProvider** (`src/components/auth/GoogleOAuthProvider.tsx`)
   - Wraps the app with Google OAuth context
   - Provides Google Client ID to child components

### AuthContext Updates

The `AuthContext` has been enhanced with two new methods:

- `signInWithGoogle(idToken: string)`: Handles Google OAuth sign-in
- `signInWithFacebook()`: Handles Facebook OAuth sign-in

Both methods:
- Create user profile in Firestore on first login
- Track linked providers in user profile
- Handle OAuth errors gracefully
- Show appropriate toast notifications

### User Profile Schema

Social login users have the following additional fields:

```typescript
{
  linkedProviders: ['google.com', 'facebook.com'], // Array of provider IDs
  consent: {
    privacyPolicy: true, // Assumed consent for social login
    termsOfService: true,
    consentDate: Timestamp
  }
}
```

## Error Handling

The implementation handles the following OAuth errors:

- **popup-blocked**: User's browser blocked the popup
- **popup-closed-by-user**: User closed the popup without completing sign-in
- **network-request-failed**: Network connectivity issues
- **account-exists-with-different-credential**: Email already registered with different provider

## Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/auth/login` or `/auth/signup`

3. Click "Continue with Google" or "Continue with Facebook"

4. Complete the OAuth flow in the popup

5. Verify:
   - User is redirected to home page
   - User profile is created in Firestore
   - `linkedProviders` array contains the provider ID
   - Toast notification shows success message

## Security Considerations

- OAuth tokens are handled by Firebase Auth SDK
- User credentials are never stored in the application
- Popup-based OAuth flow prevents CSRF attacks
- Authorized domains must be configured in Firebase Console
- Social login assumes user consent to privacy policy and terms

## Next Steps

After implementing social login in the patient portal:

1. Implement social login in mobile app (Task 20.3)
2. Implement account linking for multiple providers (Task 20.4)
3. Add unlinking capability in user profile settings
4. Test all provider combinations

## Troubleshooting

### Google Sign-In Not Working

- Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set correctly
- Check that the domain is authorized in Google Cloud Console
- Ensure Google Sign-In provider is enabled in Firebase Console
- Check browser console for detailed error messages

### Facebook Login Not Working

- Verify `NEXT_PUBLIC_FACEBOOK_APP_ID` is set correctly
- Check that the domain is authorized in Facebook App settings
- Ensure Facebook Login provider is enabled in Firebase Console
- Verify Facebook App is not in development mode (or add test users)

### Popup Blocked

- Instruct users to allow popups for your domain
- Consider implementing redirect-based OAuth as fallback
- Add clear messaging when popup is blocked

## References

- [Firebase Authentication - Google Sign-In](https://firebase.google.com/docs/auth/web/google-signin)
- [Firebase Authentication - Facebook Login](https://firebase.google.com/docs/auth/web/facebook-login)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Facebook Developers](https://developers.facebook.com/)
