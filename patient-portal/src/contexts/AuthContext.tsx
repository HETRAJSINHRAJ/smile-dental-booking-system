"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  linkWithCredential,
  unlink,
  fetchSignInMethodsForEmail,
  AuthCredential,
  AuthError,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  role: "patient" | "admin";
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
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    phoneNumber?: string,
    role?: "patient" | "admin",
    consent?: ConsentData,
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  linkProvider: (provider: 'google' | 'facebook') => Promise<void>;
  unlinkProvider: (providerId: string) => Promise<void>;
  getLinkedProviders: () => string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    phoneNumber?: string,
    role: "patient" | "admin" = "patient",
    consent?: ConsentData,
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Update profile with display name and phone number
      const profileUpdates: { displayName: string; phoneNumber?: string } = {
        displayName,
      };
      if (phoneNumber) {
        profileUpdates.phoneNumber = phoneNumber;
      }
      await updateProfile(user, profileUpdates);

      // Create user document in Firestore with correct field names
      const userDocRef = doc(db, "users", user.uid);
      const userData: any = {
        id: user.uid,
        uid: user.uid,
        email: user.email!,
        fullName: displayName,
        phone: phoneNumber || "",
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
          consentDate: serverTimestamp(),
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userDocRef, userData);
      setUserProfile(userData);

      toast.success("Account created successfully!");
    } catch (error: unknown) {
      console.error("Sign up error:", error);
      const err = error as { code?: string };
      if (err.code === "auth/email-already-in-use") {
        toast.error("Email already in use. Please login instead.");
      } else if (err.code === "auth/weak-password") {
        toast.error("Password should be at least 6 characters.");
      } else {
        toast.error("Failed to create account. Please try again.");
      }
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!");
    } catch (error: unknown) {
      console.error("Sign in error:", error);
      const err = error as { code?: string };
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        toast.error("Invalid email or password. Please try again.");
      } else {
        toast.error("Failed to sign in. Please try again.");
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUserProfile(null);
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent!");
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      const err = error as { code?: string };
      if (err.code === "auth/user-not-found") {
        toast.error("No account found with this email.");
      } else {
        toast.error("Failed to send reset email. Please try again.");
      }
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.uid);
    }
  };

  const createOrUpdateUserProfile = async (user: User, provider: string) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user profile for first-time social login
        const userData: any = {
          id: user.uid,
          uid: user.uid,
          email: user.email!,
          fullName: user.displayName || '',
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
          consent: {
            privacyPolicy: true, // Assumed consent for social login
            termsOfService: true,
            consentDate: serverTimestamp(),
          },
          linkedProviders: [provider],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(userDocRef, userData);
        setUserProfile(userData);
      } else {
        // Update existing user profile with new provider
        const existingData = userDoc.data();
        const linkedProviders = existingData.linkedProviders || [];
        
        if (!linkedProviders.includes(provider)) {
          linkedProviders.push(provider);
          await updateDoc(userDocRef, {
            linkedProviders,
            updatedAt: serverTimestamp(),
          });
        }
        
        setUserProfile(existingData as UserProfile);
      }
    } catch (error) {
      console.error("Error creating/updating user profile:", error);
      throw error;
    }
  };

  const mergeUserData = (existingData: any, newData: any): any => {
    // Keep most complete profile data
    return {
      ...existingData,
      fullName: existingData.fullName || newData.fullName || '',
      phone: existingData.phone || newData.phone || '',
      dateOfBirth: existingData.dateOfBirth || newData.dateOfBirth,
      avatarUrl: existingData.avatarUrl || newData.avatarUrl,
      // Preserve existing preferences and consent
      preferences: existingData.preferences || newData.preferences,
      consent: existingData.consent || newData.consent,
    };
  };

  const handleAccountLinking = async (
    credential: AuthCredential,
    provider: string,
    email: string
  ): Promise<boolean> => {
    try {
      // Check if an account exists with this email
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      
      if (signInMethods.length === 0) {
        // No existing account, proceed with normal sign in
        return false;
      }

      // Account exists with different provider
      const providerNames = signInMethods.map(method => {
        if (method === 'google.com') return 'Google';
        if (method === 'facebook.com') return 'Facebook';
        if (method === 'password') return 'Email/Password';
        return method;
      }).join(', ');

      // Show confirmation dialog
      const shouldLink = window.confirm(
        `An account already exists with this email (${email}) using ${providerNames}.\n\n` +
        `Would you like to link your ${provider === 'google.com' ? 'Google' : 'Facebook'} account to your existing account?\n\n` +
        `This will allow you to sign in using either method.`
      );

      if (!shouldLink) {
        toast.error("Sign in cancelled. Please use your existing sign-in method.");
        return true; // Handled, but cancelled
      }

      // User wants to link - they need to sign in first
      toast.info("Please sign in with your existing account to link providers.");
      return true; // Handled
    } catch (error) {
      console.error("Error checking account linking:", error);
      return false;
    }
  };

  const signInWithGoogle = async (idToken: string) => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      await createOrUpdateUserProfile(result.user, 'google.com');
      toast.success("Welcome! Signed in with Google");
    } catch (error: unknown) {
      console.error("Google sign in error:", error);
      const err = error as AuthError & { customData?: { email?: string } };
      
      if (err.code === "auth/popup-blocked") {
        toast.error("Popup was blocked. Please allow popups for this site.");
      } else if (err.code === "auth/popup-closed-by-user") {
        toast.error("Sign in cancelled.");
      } else if (err.code === "auth/network-request-failed") {
        toast.error("Network error. Please check your connection.");
      } else if (err.code === "auth/account-exists-with-different-credential") {
        const email = err.customData?.email;
        if (email) {
          const signInMethods = await fetchSignInMethodsForEmail(auth, email);
          const providerNames = signInMethods.map(method => {
            if (method === 'google.com') return 'Google';
            if (method === 'facebook.com') return 'Facebook';
            if (method === 'password') return 'Email/Password';
            return method;
          }).join(', ');
          
          toast.error(
            `An account already exists with this email using ${providerNames}. ` +
            `Please sign in with that method first, then link your Google account in profile settings.`
          );
        } else {
          toast.error("An account already exists with this email using a different sign-in method.");
        }
      } else {
        toast.error("Failed to sign in with Google. Please try again.");
      }
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      await createOrUpdateUserProfile(result.user, 'facebook.com');
      toast.success("Welcome! Signed in with Facebook");
    } catch (error: unknown) {
      console.error("Facebook sign in error:", error);
      const err = error as AuthError & { customData?: { email?: string } };
      
      if (err.code === "auth/popup-blocked") {
        toast.error("Popup was blocked. Please allow popups for this site.");
      } else if (err.code === "auth/popup-closed-by-user") {
        toast.error("Sign in cancelled.");
      } else if (err.code === "auth/network-request-failed") {
        toast.error("Network error. Please check your connection.");
      } else if (err.code === "auth/account-exists-with-different-credential") {
        const email = err.customData?.email;
        if (email) {
          const signInMethods = await fetchSignInMethodsForEmail(auth, email);
          const providerNames = signInMethods.map(method => {
            if (method === 'google.com') return 'Google';
            if (method === 'facebook.com') return 'Facebook';
            if (method === 'password') return 'Email/Password';
            return method;
          }).join(', ');
          
          toast.error(
            `An account already exists with this email using ${providerNames}. ` +
            `Please sign in with that method first, then link your Facebook account in profile settings.`
          );
        } else {
          toast.error("An account already exists with this email using a different sign-in method.");
        }
      } else {
        toast.error("Failed to sign in with Facebook. Please try again.");
      }
      throw error;
    }
  };

  const linkProvider = async (provider: 'google' | 'facebook') => {
    if (!user) {
      toast.error("You must be signed in to link accounts.");
      throw new Error("No user signed in");
    }

    try {
      let credential: AuthCredential;
      
      if (provider === 'google') {
        const googleProvider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, googleProvider);
        credential = GoogleAuthProvider.credential(result.user.getIdToken());
        
        // Link the credential
        await linkWithCredential(user, credential);
        
        // Update user profile with new provider
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const existingData = userDoc.data();
          const linkedProviders = existingData.linkedProviders || [];
          
          if (!linkedProviders.includes('google.com')) {
            linkedProviders.push('google.com');
            await updateDoc(userDocRef, {
              linkedProviders,
              updatedAt: serverTimestamp(),
            });
          }
        }
        
        toast.success("Google account linked successfully!");
      } else if (provider === 'facebook') {
        const facebookProvider = new FacebookAuthProvider();
        const result = await signInWithPopup(auth, facebookProvider);
        credential = FacebookAuthProvider.credential(result.user.getIdToken());
        
        // Link the credential
        await linkWithCredential(user, credential);
        
        // Update user profile with new provider
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const existingData = userDoc.data();
          const linkedProviders = existingData.linkedProviders || [];
          
          if (!linkedProviders.includes('facebook.com')) {
            linkedProviders.push('facebook.com');
            await updateDoc(userDocRef, {
              linkedProviders,
              updatedAt: serverTimestamp(),
            });
          }
        }
        
        toast.success("Facebook account linked successfully!");
      }
      
      await refreshUserProfile();
    } catch (error: unknown) {
      console.error("Error linking provider:", error);
      const err = error as AuthError;
      
      if (err.code === "auth/credential-already-in-use") {
        toast.error("This account is already linked to another user.");
      } else if (err.code === "auth/provider-already-linked") {
        toast.error("This provider is already linked to your account.");
      } else if (err.code === "auth/popup-blocked") {
        toast.error("Popup was blocked. Please allow popups for this site.");
      } else if (err.code === "auth/popup-closed-by-user") {
        toast.error("Linking cancelled.");
      } else {
        toast.error(`Failed to link ${provider} account. Please try again.`);
      }
      throw error;
    }
  };

  const unlinkProvider = async (providerId: string) => {
    if (!user) {
      toast.error("You must be signed in to unlink accounts.");
      throw new Error("No user signed in");
    }

    try {
      // Check if user has at least one other sign-in method
      const providers = user.providerData.map(p => p.providerId);
      
      if (providers.length <= 1) {
        toast.error("You must have at least one sign-in method. Please link another account before unlinking this one.");
        throw new Error("Cannot unlink last provider");
      }

      // Confirm unlinking
      const providerName = providerId === 'google.com' ? 'Google' : 
                          providerId === 'facebook.com' ? 'Facebook' : providerId;
      
      const confirmed = window.confirm(
        `Are you sure you want to unlink your ${providerName} account?\n\n` +
        `You will no longer be able to sign in using ${providerName}.`
      );

      if (!confirmed) {
        return;
      }

      // Unlink the provider
      await unlink(user, providerId);
      
      // Update user profile
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const existingData = userDoc.data();
        const linkedProviders = (existingData.linkedProviders || []).filter(
          (p: string) => p !== providerId
        );
        
        await updateDoc(userDocRef, {
          linkedProviders,
          updatedAt: serverTimestamp(),
        });
      }
      
      toast.success(`${providerName} account unlinked successfully!`);
      await refreshUserProfile();
    } catch (error: unknown) {
      console.error("Error unlinking provider:", error);
      const err = error as AuthError;
      
      if (err.code === "auth/no-such-provider") {
        toast.error("This provider is not linked to your account.");
      } else {
        toast.error("Failed to unlink account. Please try again.");
      }
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
    signOut,
    resetPassword,
    refreshUserProfile,
    linkProvider,
    unlinkProvider,
    getLinkedProviders,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
