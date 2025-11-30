import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Platform, Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import appleAuth from '@invertase/react-native-apple-authentication';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import { useToast } from './ToastContext';
import notificationService from '../services/notificationService';

interface UserProfile {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'patient' | 'admin';
  dateOfBirth?: string;
  preferences?: {
    language?: string;
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
  };
  createdAt: unknown;
  updatedAt: unknown;
}

interface ConsentData {
  privacyPolicy: boolean;
  termsOfService: boolean;
}

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    phoneNumber?: string,
    role?: 'patient' | 'admin',
    consent?: ConsentData
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  linkProvider: (provider: 'google' | 'facebook' | 'apple') => Promise<void>;
  unlinkProvider: (providerId: string) => Promise<void>;
  getLinkedProviders: () => string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID || '',
  offlineAccess: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchUserProfile = async (uid: string) => {
    try {
      const userDoc = await firestore().collection('users').doc(uid).get();
      if (userDoc.exists) {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const createOrUpdateSocialUserProfile = async (
    user: FirebaseAuthTypes.User,
    provider: 'google' | 'facebook' | 'apple'
  ) => {
    try {
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      const providerIdMap: Record<string, string> = {
        google: 'google.com',
        facebook: 'facebook.com',
        apple: 'apple.com',
      };
      const providerId = providerIdMap[provider];
      
      if (userDoc.exists) {
        // User already exists, update linked providers
        const existingData = userDoc.data() as any;
        const linkedProviders = existingData.linkedProviders || [];
        
        if (!linkedProviders.includes(providerId)) {
          linkedProviders.push(providerId);
          await firestore().collection('users').doc(user.uid).update({
            linkedProviders,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });
        }
        
        setUserProfile(existingData as UserProfile);
        return;
      }

      // Create new user profile for first-time social login
      const userData: any = {
        id: user.uid,
        uid: user.uid,
        email: user.email || '',
        fullName: user.displayName || 'User',
        phone: user.phoneNumber || '',
        role: 'patient',
        preferences: {
          language: 'en',
          notifications: {
            email: {
              enabled: true,
              appointmentReminders: true,
              appointmentUpdates: true,
              paymentUpdates: true,
              promotional: false,
            },
            sms: {
              enabled: false,
              appointmentReminders: false,
              appointmentUpdates: false,
              paymentUpdates: false,
            },
            push: {
              enabled: true,
              appointmentReminders: true,
              appointmentUpdates: true,
              paymentUpdates: true,
              promotional: false,
            },
            quietHours: {
              enabled: true,
              start: '22:00',
              end: '08:00',
              timezone: 'Asia/Kolkata',
            },
          },
        },
        authProvider: provider,
        linkedProviders: [providerId],
        photoURL: user.photoURL || null,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore().collection('users').doc(user.uid).set(userData);
      setUserProfile(userData);
    } catch (error) {
      console.error('Error creating/updating social user profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    let profileUnsubscribe: (() => void) | undefined;

    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        // Set up real-time listener for user profile
        profileUnsubscribe = firestore()
          .collection('users')
          .doc(user.uid)
          .onSnapshot(
            (doc) => {
              if (doc.exists) {
                const profileData = doc.data() as UserProfile;
                setUserProfile(profileData);
                console.log('✅ User profile updated from Firestore');
              }
            },
            (error) => {
              console.error('❌ Error listening to user profile:', error);
              // Fallback to one-time fetch on error
              fetchUserProfile(user.uid);
            }
          );

        // Initialize notifications when user logs in
        try {
          await notificationService.initialize(user.uid);
          console.log('✅ Notifications initialized for user:', user.uid);
        } catch (error) {
          console.error('❌ Failed to initialize notifications:', error);
        }
      } else {
        setUserProfile(null);
        // Clean up profile listener when user logs out
        if (profileUnsubscribe) {
          profileUnsubscribe();
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    phoneNumber?: string,
    role: 'patient' | 'admin' = 'patient',
    consent?: ConsentData
  ) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await user.updateProfile({ displayName });

      const userData: any = {
        id: user.uid,
        uid: user.uid,
        email: user.email!,
        fullName: displayName,
        phone: phoneNumber || '',
        role,
        preferences: {
          language: 'en',
          notifications: {
            email: {
              enabled: true,
              appointmentReminders: true,
              appointmentUpdates: true,
              paymentUpdates: true,
              promotional: false,
            },
            sms: {
              enabled: false,
              appointmentReminders: false,
              appointmentUpdates: false,
              paymentUpdates: false,
            },
            push: {
              enabled: true,
              appointmentReminders: true,
              appointmentUpdates: true,
              paymentUpdates: true,
              promotional: false,
            },
            quietHours: {
              enabled: true,
              start: '22:00',
              end: '08:00',
              timezone: 'Asia/Kolkata',
            },
          },
        },
        consent: {
          privacyPolicy: consent?.privacyPolicy || false,
          termsOfService: consent?.termsOfService || false,
          consentDate: firestore.FieldValue.serverTimestamp(),
        },
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore().collection('users').doc(user.uid).set(userData);
      setUserProfile(userData);

      toast.showSuccess('Account created successfully! 🎉');
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.showError('Email already in use. Please login instead.');
      } else if (error.code === 'auth/weak-password') {
        toast.showError('Password should be at least 6 characters.');
      } else {
        toast.showError('Failed to create account. Please try again.');
      }
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      toast.showSuccess('Welcome back! 👋');
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        toast.showError('Invalid email or password. Please try again.');
      } else {
        toast.showError('Failed to sign in. Please try again.');
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Delete FCM token before signing out
      if (user) {
        try {
          await notificationService.deleteFCMToken(user.uid);
          console.log('✅ FCM token deleted for user:', user.uid);
        } catch (error) {
          console.error('❌ Failed to delete FCM token:', error);
        }
      }
      
      await auth().signOut();
      setUserProfile(null);
      toast.showSuccess('Signed out successfully 👋');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.showError('Failed to sign out');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await auth().sendPasswordResetEmail(email);
      toast.showSuccess('Password reset email sent! 📧');
    } catch (error: any) {
      console.error('Password reset error:', error);
      if (error.code === 'auth/user-not-found') {
        toast.showError('No account found with this email.');
      } else {
        toast.showError('Failed to send reset email. Please try again.');
      }
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.uid);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      // Optimistically update local state
      if (userProfile) {
        setUserProfile({ ...userProfile, ...data });
      }

      // Update Firestore with merge option to preserve other fields
      await firestore()
        .collection('users')
        .doc(user.uid)
        .set(
          {
            ...data,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

      toast.showSuccess('Profile updated successfully! ✅');
      console.log('✅ Profile updated in Firestore');
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      toast.showError('Failed to update profile. Please try again.');
      // Revert optimistic update on error
      await refreshUserProfile();
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Check if device supports Google Play services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get user info from Google
      const { idToken } = await GoogleSignin.signIn();
      
      // Create Firebase credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      // Sign in with Firebase
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      // Create or update user profile
      await createOrUpdateSocialUserProfile(userCredential.user, 'google');
      
      toast.showSuccess('Welcome! Signed in with Google 🎉');
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      
      if (error.code === 'SIGN_IN_CANCELLED') {
        toast.showError('Sign in was cancelled');
      } else if (error.code === 'IN_PROGRESS') {
        toast.showError('Sign in is already in progress');
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        toast.showError('Google Play Services not available');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        toast.showError(
          'An account already exists with this email using a different sign-in method. ' +
          'Please sign in with that method first, then link your Google account in profile settings.'
        );
      } else {
        toast.showError('Failed to sign in with Google. Please try again.');
      }
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      // Attempt login with permissions
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      
      if (result.isCancelled) {
        toast.showError('Sign in was cancelled');
        throw new Error('User cancelled the login process');
      }
      
      // Get the access token
      const data = await AccessToken.getCurrentAccessToken();
      
      if (!data) {
        toast.showError('Failed to get Facebook access token');
        throw new Error('Something went wrong obtaining access token');
      }
      
      // Create Firebase credential with the token
      const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);
      
      // Sign in with Firebase
      const userCredential = await auth().signInWithCredential(facebookCredential);
      
      // Create or update user profile
      await createOrUpdateSocialUserProfile(userCredential.user, 'facebook');
      
      toast.showSuccess('Welcome! Signed in with Facebook 🎉');
    } catch (error: any) {
      console.error('Facebook Sign-In error:', error);
      
      if (error.code === 'auth/account-exists-with-different-credential') {
        toast.showError(
          'An account already exists with this email using a different sign-in method. ' +
          'Please sign in with that method first, then link your Facebook account in profile settings.'
        );
      } else {
        toast.showError('Failed to sign in with Facebook. Please try again.');
      }
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      // Only available on iOS 13+
      if (Platform.OS !== 'ios') {
        toast.showError('Apple Sign-In is only available on iOS');
        throw new Error('Apple Sign-In is only available on iOS');
      }
      
      // Start the sign-in request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
      
      // Ensure Apple returned a user identityToken
      if (!appleAuthRequestResponse.identityToken) {
        toast.showError('Apple Sign-In failed - no identity token returned');
        throw new Error('Apple Sign-In failed - no identify token returned');
      }
      
      // Create a Firebase credential from the response
      const { identityToken, nonce } = appleAuthRequestResponse;
      const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
      
      // Sign in with Firebase
      const userCredential = await auth().signInWithCredential(appleCredential);
      
      // Update display name if provided by Apple (only on first sign-in)
      if (appleAuthRequestResponse.fullName) {
        const { givenName, familyName } = appleAuthRequestResponse.fullName;
        const displayName = [givenName, familyName].filter(Boolean).join(' ');
        
        if (displayName) {
          await userCredential.user.updateProfile({ displayName });
        }
      }
      
      // Create or update user profile
      await createOrUpdateSocialUserProfile(userCredential.user, 'apple');
      
      toast.showSuccess('Welcome! Signed in with Apple 🎉');
    } catch (error: any) {
      console.error('Apple Sign-In error:', error);
      
      if (error.code === appleAuth.Error.CANCELED) {
        toast.showError('Sign in was cancelled');
      } else if (error.code === appleAuth.Error.FAILED) {
        toast.showError('Apple Sign-In failed');
      } else if (error.code === appleAuth.Error.NOT_HANDLED) {
        toast.showError('Apple Sign-In not handled');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        toast.showError(
          'An account already exists with this email using a different sign-in method. ' +
          'Please sign in with that method first, then link your Apple account in profile settings.'
        );
      } else {
        toast.showError('Failed to sign in with Apple. Please try again.');
      }
      throw error;
    }
  };

  const linkProvider = async (provider: 'google' | 'facebook' | 'apple') => {
    if (!user) {
      toast.showError('You must be signed in to link accounts.');
      throw new Error('No user signed in');
    }

    try {
      let credential: any;
      
      if (provider === 'google') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const { idToken } = await GoogleSignin.signIn();
        credential = auth.GoogleAuthProvider.credential(idToken);
      } else if (provider === 'facebook') {
        const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
        
        if (result.isCancelled) {
          toast.showError('Linking cancelled');
          throw new Error('User cancelled the linking process');
        }
        
        const data = await AccessToken.getCurrentAccessToken();
        if (!data) {
          toast.showError('Failed to get Facebook access token');
          throw new Error('Something went wrong obtaining access token');
        }
        
        credential = auth.FacebookAuthProvider.credential(data.accessToken);
      } else if (provider === 'apple') {
        if (Platform.OS !== 'ios') {
          toast.showError('Apple Sign-In is only available on iOS');
          throw new Error('Apple Sign-In is only available on iOS');
        }
        
        const appleAuthRequestResponse = await appleAuth.performRequest({
          requestedOperation: appleAuth.Operation.LOGIN,
          requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });
        
        if (!appleAuthRequestResponse.identityToken) {
          toast.showError('Apple Sign-In failed - no identity token returned');
          throw new Error('Apple Sign-In failed - no identify token returned');
        }
        
        const { identityToken, nonce } = appleAuthRequestResponse;
        credential = auth.AppleAuthProvider.credential(identityToken, nonce);
      }
      
      // Link the credential
      await user.linkWithCredential(credential);
      
      // Update user profile with new provider
      const providerIdMap: Record<string, string> = {
        google: 'google.com',
        facebook: 'facebook.com',
        apple: 'apple.com',
      };
      const providerId = providerIdMap[provider];
      
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      
      if (userDoc.exists) {
        const existingData = userDoc.data();
        const linkedProviders = existingData?.linkedProviders || [];
        
        if (!linkedProviders.includes(providerId)) {
          linkedProviders.push(providerId);
          await firestore().collection('users').doc(user.uid).update({
            linkedProviders,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });
        }
      }
      
      const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
      toast.showSuccess(`${providerName} account linked successfully! ✅`);
      await refreshUserProfile();
    } catch (error: any) {
      console.error('Error linking provider:', error);
      
      if (error.code === 'auth/credential-already-in-use') {
        toast.showError('This account is already linked to another user.');
      } else if (error.code === 'auth/provider-already-linked') {
        toast.showError('This provider is already linked to your account.');
      } else if (error.message?.includes('cancelled')) {
        // Already handled
      } else {
        toast.showError(`Failed to link ${provider} account. Please try again.`);
      }
      throw error;
    }
  };

  const unlinkProvider = async (providerId: string) => {
    if (!user) {
      toast.showError('You must be signed in to unlink accounts.');
      throw new Error('No user signed in');
    }

    try {
      // Check if user has at least one other sign-in method
      const providers = user.providerData.map(p => p.providerId);
      
      if (providers.length <= 1) {
        toast.showError('You must have at least one sign-in method. Please link another account before unlinking this one.');
        throw new Error('Cannot unlink last provider');
      }

      // Confirm unlinking
      const providerName = providerId === 'google.com' ? 'Google' : 
                          providerId === 'facebook.com' ? 'Facebook' :
                          providerId === 'apple.com' ? 'Apple' : providerId;
      
      return new Promise<void>((resolve, reject) => {
        Alert.alert(
          'Unlink Account',
          `Are you sure you want to unlink your ${providerName} account?\n\nYou will no longer be able to sign in using ${providerName}.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(),
            },
            {
              text: 'Unlink',
              style: 'destructive',
              onPress: async () => {
                try {
                  // Unlink the provider
                  await user.unlink(providerId);
                  
                  // Update user profile
                  const userDoc = await firestore().collection('users').doc(user.uid).get();
                  
                  if (userDoc.exists) {
                    const existingData = userDoc.data();
                    const linkedProviders = (existingData?.linkedProviders || []).filter(
                      (p: string) => p !== providerId
                    );
                    
                    await firestore().collection('users').doc(user.uid).update({
                      linkedProviders,
                      updatedAt: firestore.FieldValue.serverTimestamp(),
                    });
                  }
                  
                  toast.showSuccess(`${providerName} account unlinked successfully! ✅`);
                  await refreshUserProfile();
                  resolve();
                } catch (error: any) {
                  console.error('Error unlinking provider:', error);
                  
                  if (error.code === 'auth/no-such-provider') {
                    toast.showError('This provider is not linked to your account.');
                  } else {
                    toast.showError('Failed to unlink account. Please try again.');
                  }
                  reject(error);
                }
              },
            },
          ]
        );
      });
    } catch (error) {
      console.error('Error in unlinkProvider:', error);
      throw error;
    }
  };

  const getLinkedProviders = (): string[] => {
    if (!user) return [];
    return user.providerData.map(p => p.providerId);
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
    signOut,
    resetPassword,
    refreshUserProfile,
    updateUserProfile,
    linkProvider,
    unlinkProvider,
    getLinkedProviders,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
