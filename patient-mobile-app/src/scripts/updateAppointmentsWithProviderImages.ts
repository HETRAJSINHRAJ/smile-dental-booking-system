import firestore from '@react-native-firebase/firestore';

/**
 * Script to update all appointments with provider image URLs
 * This will fetch the provider's imageUrl and add it to each appointment
 */

interface Provider {
  id: string;
  imageUrl: string;
  name: string;
}

interface Appointment {
  id: string;
  providerId: string;
  providerName: string;
  providerImageUrl?: string;
}

export const updateAppointmentsWithProviderImages = async () => {
  try {
    console.log('Starting to update appointments with provider images...');

    // Step 1: Get all providers
    const providersSnapshot = await firestore().collection('providers').get();
    const providersMap = new Map<string, string>();

    providersSnapshot.forEach((doc) => {
      const provider = doc.data() as Provider;
      if (provider.imageUrl) {
        providersMap.set(doc.id, provider.imageUrl);
      }
    });

    console.log(`Found ${providersMap.size} providers with images`);

    // Step 2: Get all appointments
    const appointmentsSnapshot = await firestore().collection('appointments').get();
    console.log(`Found ${appointmentsSnapshot.size} appointments to update`);

    // Step 3: Update each appointment
    const batch = firestore().batch();
    let updateCount = 0;
    let skipCount = 0;

    appointmentsSnapshot.forEach((doc) => {
      const appointment = doc.data() as Appointment;
      const providerImageUrl = providersMap.get(appointment.providerId);

      if (providerImageUrl) {
        // Only update if the appointment doesn't already have the image URL
        if (!appointment.providerImageUrl || appointment.providerImageUrl !== providerImageUrl) {
          batch.update(doc.ref, {
            providerImageUrl: providerImageUrl,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });
          updateCount++;
          console.log(`Queued update for appointment ${doc.id} with provider ${appointment.providerName}`);
        } else {
          skipCount++;
        }
      } else {
        console.warn(`No image found for provider ${appointment.providerId} (${appointment.providerName})`);
        skipCount++;
      }
    });

    // Step 4: Commit the batch
    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ Successfully updated ${updateCount} appointments`);
    } else {
      console.log('No appointments needed updating');
    }

    console.log(`Skipped ${skipCount} appointments (already up to date or no provider image)`);
    console.log('Update complete!');

    return {
      success: true,
      updated: updateCount,
      skipped: skipCount,
      total: appointmentsSnapshot.size,
    };
  } catch (error) {
    console.error('Error updating appointments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Function to update a single appointment
export const updateSingleAppointment = async (appointmentId: string) => {
  try {
    const appointmentDoc = await firestore()
      .collection('appointments')
      .doc(appointmentId)
      .get();

    if (!appointmentDoc.exists) {
      throw new Error('Appointment not found');
    }

    const appointment = appointmentDoc.data() as Appointment;

    const providerDoc = await firestore()
      .collection('providers')
      .doc(appointment.providerId)
      .get();

    if (!providerDoc.exists) {
      throw new Error('Provider not found');
    }

    const provider = providerDoc.data() as Provider;

    if (provider.imageUrl) {
      await appointmentDoc.ref.update({
        providerImageUrl: provider.imageUrl,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ Updated appointment ${appointmentId} with provider image`);
      return { success: true };
    } else {
      console.warn(`Provider ${appointment.providerId} has no image URL`);
      return { success: false, error: 'Provider has no image URL' };
    }
  } catch (error) {
    console.error('Error updating single appointment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
