/**
 * Firestore Schema Migration Script
 * 
 * This script updates existing Firestore documents to match the new unified schema:
 * 1. Add providerImageUrl field to existing appointments
 * 2. Add paymentStatus and servicePaymentStatus fields to appointments
 * 3. Add preferences object to user profiles
 * 4. Add consent object to user profiles
 * 5. Add rescheduleCount and maxReschedules to appointments
 * 6. Add reminderSent and confirmationSent to appointments
 * 
 * Usage: npx tsx src/scripts/migrateFirestoreSchema.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

// Initialize Firebase Admin
if (getApps().length === 0) {
  // Try to load service account from environment or file
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
    path.join(process.cwd(), 'serviceAccountKey.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({
      credential: cert(serviceAccount)
    });
  } else {
    console.log('Using default credentials or emulator');
    initializeApp();
  }
}

const db = getFirestore();

// Default notification preferences
const defaultNotificationPreferences = {
  email: {
    enabled: true,
    appointmentReminders: true,
    appointmentUpdates: true,
    paymentUpdates: true,
    promotional: false
  },
  sms: {
    enabled: false,
    appointmentReminders: false,
    appointmentUpdates: false,
    paymentUpdates: false
  },
  push: {
    enabled: true,
    appointmentReminders: true,
    appointmentUpdates: true,
    paymentUpdates: true,
    promotional: false
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
    timezone: 'Asia/Kolkata'
  },
  language: 'en' as const
};

// Default consent record
const defaultConsent = {
  privacyPolicy: true,
  termsOfService: true,
  consentDate: Timestamp.now()
};

async function migrateAppointments() {
  console.log('Starting appointment migration...');
  
  const appointmentsRef = db.collection('appointments');
  const snapshot = await appointmentsRef.get();
  
  let updated = 0;
  let skipped = 0;
  
  const batch = db.batch();
  let batchCount = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates: any = {};
    
    // Add providerImageUrl if missing
    if (!data.providerImageUrl && data.providerId) {
      // Fetch provider to get imageUrl
      try {
        const providerDoc = await db.collection('providers').doc(data.providerId).get();
        if (providerDoc.exists) {
          const providerData = providerDoc.data();
          updates.providerImageUrl = providerData?.imageUrl || providerData?.photoUrl || null;
        }
      } catch (error) {
        console.error(`Error fetching provider ${data.providerId}:`, error);
      }
    }
    
    // Add payment fields if missing
    if (!data.paymentStatus) {
      updates.paymentStatus = 'pending';
    }
    
    if (!data.servicePaymentStatus) {
      updates.servicePaymentStatus = 'pending';
    }
    
    if (data.paymentAmount === undefined) {
      updates.paymentAmount = 0;
    }
    
    if (data.servicePaymentAmount === undefined) {
      updates.servicePaymentAmount = data.serviceDuration ? data.serviceDuration * 10 : 0; // Estimate
    }
    
    if (!data.paymentType) {
      updates.paymentType = 'appointment_reservation';
    }
    
    // Add rescheduling fields if missing
    if (data.rescheduleCount === undefined) {
      updates.rescheduleCount = 0;
    }
    
    if (data.maxReschedules === undefined) {
      updates.maxReschedules = 2;
    }
    
    // Add notification tracking fields if missing
    if (data.reminderSent === undefined) {
      updates.reminderSent = false;
    }
    
    if (data.confirmationSent === undefined) {
      updates.confirmationSent = false;
    }
    
    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      batchCount++;
      updated++;
      
      // Commit batch every 500 operations
      if (batchCount >= 500) {
        await batch.commit();
        console.log(`Committed batch of ${batchCount} updates`);
        batchCount = 0;
      }
    } else {
      skipped++;
    }
  }
  
  // Commit remaining updates
  if (batchCount > 0) {
    await batch.commit();
    console.log(`Committed final batch of ${batchCount} updates`);
  }
  
  console.log(`Appointment migration complete: ${updated} updated, ${skipped} skipped`);
}

async function migrateUserProfiles() {
  console.log('Starting user profile migration...');
  
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  
  let updated = 0;
  let skipped = 0;
  
  const batch = db.batch();
  let batchCount = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates: any = {};
    
    // Add preferences if missing
    if (!data.preferences) {
      updates.preferences = defaultNotificationPreferences;
    } else {
      // Ensure all preference fields exist
      const prefs = data.preferences;
      if (!prefs.email) updates['preferences.email'] = defaultNotificationPreferences.email;
      if (!prefs.sms) updates['preferences.sms'] = defaultNotificationPreferences.sms;
      if (!prefs.push) updates['preferences.push'] = defaultNotificationPreferences.push;
      if (!prefs.quietHours) updates['preferences.quietHours'] = defaultNotificationPreferences.quietHours;
      if (!prefs.language) updates['preferences.language'] = defaultNotificationPreferences.language;
    }
    
    // Add consent if missing
    if (!data.consent) {
      updates.consent = defaultConsent;
    }
    
    // Add role if missing
    if (!data.role) {
      updates.role = 'patient';
    }
    
    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      batchCount++;
      updated++;
      
      // Commit batch every 500 operations
      if (batchCount >= 500) {
        await batch.commit();
        console.log(`Committed batch of ${batchCount} updates`);
        batchCount = 0;
      }
    } else {
      skipped++;
    }
  }
  
  // Commit remaining updates
  if (batchCount > 0) {
    await batch.commit();
    console.log(`Committed final batch of ${batchCount} updates`);
  }
  
  console.log(`User profile migration complete: ${updated} updated, ${skipped} skipped`);
}

async function migrateProviders() {
  console.log('Starting provider migration...');
  
  const providersRef = db.collection('providers');
  const snapshot = await providersRef.get();
  
  let updated = 0;
  let skipped = 0;
  
  const batch = db.batch();
  let batchCount = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates: any = {};
    
    // Add rating fields if missing
    if (data.rating === undefined) {
      updates.rating = 0;
    }
    
    if (data.totalReviews === undefined) {
      updates.totalReviews = 0;
    }
    
    if (!data.ratingDistribution) {
      updates.ratingDistribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      };
    }
    
    // Ensure backward compatibility aliases
    if (data.imageUrl && !data.photoUrl) {
      updates.photoUrl = data.imageUrl;
    } else if (data.photoUrl && !data.imageUrl) {
      updates.imageUrl = data.photoUrl;
    }
    
    if (data.yearsOfExperience !== undefined && data.experienceYears === undefined) {
      updates.experienceYears = data.yearsOfExperience;
    } else if (data.experienceYears !== undefined && data.yearsOfExperience === undefined) {
      updates.yearsOfExperience = data.experienceYears;
    }
    
    if (data.education && !data.qualifications) {
      updates.qualifications = data.education;
    } else if (data.qualifications && !data.education) {
      updates.education = data.qualifications;
    }
    
    // Add default arrays if missing
    if (!data.education) updates.education = [];
    if (!data.certifications) updates.certifications = [];
    if (!data.languages) updates.languages = ['English'];
    
    // Add availability fields if missing
    if (data.acceptingNewPatients === undefined) {
      updates.acceptingNewPatients = true;
    }
    
    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      batchCount++;
      updated++;
      
      // Commit batch every 500 operations
      if (batchCount >= 500) {
        await batch.commit();
        console.log(`Committed batch of ${batchCount} updates`);
        batchCount = 0;
      }
    } else {
      skipped++;
    }
  }
  
  // Commit remaining updates
  if (batchCount > 0) {
    await batch.commit();
    console.log(`Committed final batch of ${batchCount} updates`);
  }
  
  console.log(`Provider migration complete: ${updated} updated, ${skipped} skipped`);
}

async function migrateServices() {
  console.log('Starting service migration...');
  
  const servicesRef = db.collection('services');
  const snapshot = await servicesRef.get();
  
  let updated = 0;
  let skipped = 0;
  
  const batch = db.batch();
  let batchCount = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates: any = {};
    
    // Ensure backward compatibility aliases
    if (data.duration !== undefined && data.durationMinutes === undefined) {
      updates.durationMinutes = data.duration;
    } else if (data.durationMinutes !== undefined && data.duration === undefined) {
      updates.duration = data.durationMinutes;
    }
    
    // Add default fields if missing
    if (data.requiresConsultation === undefined) {
      updates.requiresConsultation = false;
    }
    
    if (data.isActive === undefined) {
      updates.isActive = true;
    }
    
    if (data.displayOrder === undefined) {
      updates.displayOrder = 0;
    }
    
    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      batchCount++;
      updated++;
      
      // Commit batch every 500 operations
      if (batchCount >= 500) {
        await batch.commit();
        console.log(`Committed batch of ${batchCount} updates`);
        batchCount = 0;
      }
    } else {
      skipped++;
    }
  }
  
  // Commit remaining updates
  if (batchCount > 0) {
    await batch.commit();
    console.log(`Committed final batch of ${batchCount} updates`);
  }
  
  console.log(`Service migration complete: ${updated} updated, ${skipped} skipped`);
}

async function main() {
  try {
    console.log('='.repeat(60));
    console.log('Starting Firestore Schema Migration');
    console.log('='.repeat(60));
    console.log();
    
    await migrateAppointments();
    console.log();
    
    await migrateUserProfiles();
    console.log();
    
    await migrateProviders();
    console.log();
    
    await migrateServices();
    console.log();
    
    console.log('='.repeat(60));
    console.log('Migration Complete!');
    console.log('='.repeat(60));
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
main();
