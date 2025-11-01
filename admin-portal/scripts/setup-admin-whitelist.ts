/**
 * Admin Whitelist Setup Script
 *
 * This script helps you initialize the admin whitelist in Firestore.
 * Run this script once to set up the initial list of authorized admin emails.
 *
 * Usage:
 *   npx tsx scripts/setup-admin-whitelist.ts
 *
 * Or with Node.js:
 *   node --loader ts-node/esm scripts/setup-admin-whitelist.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import * as readline from 'readline';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Firebase configuration (from environment variables)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('\n❌ Error: Firebase configuration is missing!');
  console.error('\nPlease ensure .env.local exists in the admin-portal directory with:');
  console.error('  - NEXT_PUBLIC_FIREBASE_API_KEY');
  console.error('  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  console.error('  - NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  console.error('  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  console.error('  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  console.error('  - NEXT_PUBLIC_FIREBASE_APP_ID\n');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function setupAdminWhitelist() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         Admin Whitelist Setup Script                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('This script will create or update the admin email whitelist in Firestore.');
  console.log('Only emails in this whitelist can access the admin portal.\n');

  // Get admin emails from user
  const emails: string[] = [];
  let addMore = true;

  while (addMore) {
    const email = await question(`Enter admin email ${emails.length + 1} (or press Enter to finish): `);
    
    if (email.trim() === '') {
      if (emails.length === 0) {
        console.log('⚠️  You must add at least one admin email.');
        continue;
      }
      addMore = false;
    } else {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        console.log('❌ Invalid email format. Please try again.');
        continue;
      }
      
      emails.push(email.trim().toLowerCase());
      console.log(`✅ Added: ${email.trim().toLowerCase()}`);
    }
  }

  console.log('\n📋 Admin emails to be whitelisted:');
  emails.forEach((email, index) => {
    console.log(`   ${index + 1}. ${email}`);
  });

  const confirm = await question('\nDo you want to proceed? (yes/no): ');
  
  if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    console.log('❌ Setup cancelled.');
    rl.close();
    process.exit(0);
  }

  try {
    // Create the whitelist document in Firestore
    await setDoc(doc(db, 'config', 'adminWhitelist'), {
      emails: emails,
      updatedAt: serverTimestamp(),
      updatedBy: 'setup-script',
    });

    console.log('\n✅ Admin whitelist created successfully!');
    console.log('\n📍 Firestore location: config/adminWhitelist');
    console.log('\n📝 Next steps:');
    console.log('   1. Create admin user accounts in Firebase Authentication');
    console.log('   2. Create user profiles in Firestore (users/{uid}) with role: "admin"');
    console.log('   3. Test login at http://localhost:3001/auth/login');
    console.log('\n📖 See ADMIN_SETUP_GUIDE.md for detailed instructions.\n');
  } catch (error) {
    console.error('\n❌ Error creating admin whitelist:', error);
    console.log('\nPlease check:');
    console.log('   1. Firebase configuration is correct in .env.local');
    console.log('   2. Firestore is enabled in Firebase Console');
    console.log('   3. You have internet connection');
  }

  rl.close();
  process.exit(0);
}

// Run the setup
setupAdminWhitelist().catch((error) => {
  console.error('Fatal error:', error);
  rl.close();
  process.exit(1);
});

