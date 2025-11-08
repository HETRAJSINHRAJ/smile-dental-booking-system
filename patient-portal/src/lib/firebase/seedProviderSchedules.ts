import { db } from './config';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

/**
 * Seed provider schedules for all providers
 * This creates a default schedule (Monday-Saturday, 9 AM - 5 PM) for each provider
 */
export async function seedProviderSchedules() {
  try {
    console.log('Starting to seed provider schedules...');

    // Get all providers
    const providersSnapshot = await getDocs(collection(db, 'providers'));
    const providers = providersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`Found ${providers.length} providers`);

    for (const provider of providers) {
      // Check if schedules already exist for this provider
      const existingSchedulesQuery = query(
        collection(db, 'providerSchedules'),
        where('providerId', '==', provider.id)
      );
      const existingSchedules = await getDocs(existingSchedulesQuery);

      if (existingSchedules.empty) {
        console.log(`Creating schedules for provider: ${provider.name}`);

        // Create schedule for Monday through Saturday (1-6)
        // Sunday (0) is excluded
        for (let dayOfWeek = 1; dayOfWeek <= 6; dayOfWeek++) {
          const scheduleData = {
            providerId: provider.id,
            dayOfWeek: dayOfWeek,
            startTime: '09:00',
            endTime: '17:00',
            breakStartTime: '13:00',
            breakEndTime: '14:00',
            isAvailable: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await addDoc(collection(db, 'providerSchedules'), scheduleData);
          console.log(`  ✓ Created schedule for day ${dayOfWeek}`);
        }
      } else {
        console.log(`Schedules already exist for provider: ${provider.name}`);
      }
    }

    console.log('✅ Provider schedules seeded successfully!');
    return { success: true, message: 'Provider schedules seeded successfully' };
  } catch (error) {
    console.error('Error seeding provider schedules:', error);
    throw error;
  }
}

/**
 * Create a custom schedule for a specific provider
 */
export async function createProviderSchedule(
  providerId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  breakStartTime?: string,
  breakEndTime?: string
) {
  try {
    const scheduleData = {
      providerId,
      dayOfWeek,
      startTime,
      endTime,
      breakStartTime: breakStartTime || null,
      breakEndTime: breakEndTime || null,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, 'providerSchedules'), scheduleData);
    console.log(`Schedule created with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('Error creating provider schedule:', error);
    throw error;
  }
}

/**
 * Get all schedules for a provider
 */
export async function getProviderSchedules(providerId: string) {
  try {
    const schedulesQuery = query(
      collection(db, 'providerSchedules'),
      where('providerId', '==', providerId)
    );
    const snapshot = await getDocs(schedulesQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting provider schedules:', error);
    throw error;
  }
}
