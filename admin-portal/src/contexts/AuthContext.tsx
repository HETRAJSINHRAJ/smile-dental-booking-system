"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { toast } from 'sonner';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'patient' | 'admin';
  phoneNumber?: string;
  dateOfBirth?: string;
  createdAt: any;
  updatedAt: any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, role?: 'patient' | 'admin') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
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
    role: 'patient' | 'admin' = 'patient'
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, { displayName });

      // Create user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userData: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName,
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userDocRef, userData);
      setUserProfile(userData);

      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use. Please login instead.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters.');
      } else {
        toast.error('Failed to create account. Please try again.');
      }
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password. Please try again.');
      } else {
        toast.error('Failed to sign in. Please try again.');
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUserProfile(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      console.error('Password reset error:', error);
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email.');
      } else {
        toast.error('Failed to send reset email. Please try again.');
      }
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.uid);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
