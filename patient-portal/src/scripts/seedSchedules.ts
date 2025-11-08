/**
 * Script to seed provider schedules in Firestore
 * Run this script once to create default schedules for all providers
 * 
 * Usage:
 * 1. Make sure you're in the patient-portal directory
 * 2. Run: npx ts-node src/scripts/seedSchedules.ts
 */

import { seedProviderSchedules } from '../lib/firebase/seedProviderSchedules';

async function main() {
  console.log('🚀 Starting provider schedules seeding...\n');
  
  try {
    await seedProviderSchedules();
    console.log('\n✅ All done! Provider schedules have been created.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding schedules:', error);
    process.exit(1);
  }
}

main();
