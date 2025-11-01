/**
 * Admin User Seeding Script
 * 
 * This script creates an initial admin user in Firebase.
 * 
 * USAGE:
 * 1. Update the admin credentials below
 * 2. Run this in browser console after Firebase is initialized
 * 3. Or call this function from a page component
 * 
 * The admin user will have:
 * - Email: admin@smiledental.com
 * - Password: Admin@123456
 * - Role: admin
 * - Full access to admin dashboard
 */

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

export interface AdminSeedConfig {
  email: string;
  password: string;
  displayName: string;
  phoneNumber?: string;
}

const DEFAULT_ADMIN: AdminSeedConfig = {
  email: 'admin@smiledental.com',
  password: 'Admin@123456',
  displayName: 'Admin User',
  phoneNumber: '+1234567890',
};

export async function seedAdminUser(config: AdminSeedConfig = DEFAULT_ADMIN) {
  try {
    console.log('🌱 Seeding admin user...');

    // Create admin user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      config.email,
      config.password
    );
    const user = userCredential.user;

    console.log('✅ Admin user created in Firebase Auth:', user.uid);

    // Update profile with display name
    await updateProfile(user, {
      displayName: config.displayName,
    });

    // Create admin user document in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      email: config.email,
      displayName: config.displayName,
      phoneNumber: config.phoneNumber,
      role: 'admin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Admin user profile created in Firestore');
    console.log('\n📧 Admin Credentials:');
    console.log(`   Email: ${config.email}`);
    console.log(`   Password: ${config.password}`);
    console.log('\n🎉 Admin user seeded successfully!');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

    return {
      success: true,
      uid: user.uid,
      email: config.email,
    };
  } catch (error: any) {
    console.error('❌ Error seeding admin user:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  Admin user already exists');
      return {
        success: false,
        error: 'Admin user already exists',
      };
    }
    
    throw error;
  }
}

// Helper function to run from browser console
if (typeof window !== 'undefined') {
  (window as any).seedAdminUser = seedAdminUser;
}

export default seedAdminUser;
