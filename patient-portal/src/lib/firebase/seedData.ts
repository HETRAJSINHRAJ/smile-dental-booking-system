import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { db } from './config';
import { Service, Provider, ProviderSchedule } from '@/types/firebase';

export async function seedFirestoreData() {
  try {
    console.log('Starting Firestore data seeding...');

    // Seed Services
    const services: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Dental Cleaning',
        description: 'Professional teeth cleaning to remove plaque, tartar, and stains.',
        duration: 60,
        price: 120,
        category: 'general',
        imageUrl: '/images/dental-cleaning.jpg',
      },
      {
        name: 'Teeth Whitening',
        description: 'Professional whitening treatment to brighten your smile.',
        duration: 90,
        price: 450,
        category: 'cosmetic',
        imageUrl: '/images/teeth-whitening.jpg',
      },
      {
        name: 'Dental Implants',
        description: 'Permanent tooth replacement solution for missing teeth.',
        duration: 120,
        price: 3500,
        category: 'restorative',
        imageUrl: '/images/dental-implants.jpg',
      },
      {
        name: 'Invisalign Treatment',
        description: 'Clear aligners to straighten teeth discreetly.',
        duration: 60,
        price: 5000,
        category: 'orthodontics',
        imageUrl: '/images/invisalign.jpg',
      },
      {
        name: 'Root Canal Therapy',
        description: 'Treatment to save infected or damaged teeth.',
        duration: 90,
        price: 800,
        category: 'general',
        imageUrl: '/images/root-canal.jpg',
      },
      {
        name: 'Dental Veneers',
        description: 'Thin porcelain shells to improve tooth appearance.',
        duration: 120,
        price: 1200,
        category: 'cosmetic',
        imageUrl: '/images/veneers.jpg',
      },
    ];

    const serviceIds: string[] = [];
    for (const service of services) {
      const docRef = await addDoc(collection(db, 'services'), {
        ...service,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      serviceIds.push(docRef.id);
      console.log(`✓ Added service: ${service.name}`);
    }

    // Seed Providers with enhanced profiles
    const providers: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Dr. Sarah Johnson',
        title: 'DDS',
        specialty: 'General Dentistry',
        bio: 'Dr. Johnson has over 15 years of experience providing comprehensive dental care with a gentle touch. She is committed to patient education and preventive care.',
        imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
        email: 'dr.sarah@smiledental.com',
        phone: '(555) 123-4567',
        yearsOfExperience: 15,
        serviceIds: serviceIds.slice(0, 3),
        rating: 4.9,
        totalReviews: 127,
        education: ['Harvard School of Dental Medicine', 'Stanford University - BS Biology'],
        certifications: ['Board Certified General Dentist', 'Advanced Implantology Certificate'],
        languages: ['English', 'Spanish'],
        acceptingNewPatients: true,
      },
      {
        name: 'Dr. Michael Chen',
        title: 'DMD',
        specialty: 'Cosmetic Dentistry',
        bio: 'Specializing in smile makeovers and cosmetic procedures, Dr. Chen creates beautiful smiles every day. He stays at the forefront of aesthetic dentistry techniques.',
        imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
        email: 'dr.michael@smiledental.com',
        phone: '(555) 123-4568',
        yearsOfExperience: 12,
        serviceIds: [serviceIds[1], serviceIds[3], serviceIds[5]],
        rating: 4.8,
        totalReviews: 95,
        education: ['UCLA School of Dentistry', 'University of California Berkeley - BS Chemistry'],
        certifications: ['Cosmetic Dentistry Certification', 'Invisalign Platinum Provider'],
        languages: ['English', 'Mandarin', 'Cantonese'],
        acceptingNewPatients: true,
      },
      {
        name: 'Dr. Emily Rodriguez',
        title: 'DDS',
        specialty: 'Orthodontics',
        bio: 'Dr. Rodriguez is passionate about helping patients achieve straight, healthy smiles through advanced orthodontic treatments. She specializes in both traditional braces and clear aligner therapy.',
        imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400',
        email: 'dr.emily@smiledental.com',
        phone: '(555) 123-4569',
        yearsOfExperience: 10,
        serviceIds: [serviceIds[3], serviceIds[0]],
        rating: 5.0,
        totalReviews: 142,
        education: ['Columbia University College of Dental Medicine', 'NYU - Orthodontics Residency'],
        certifications: ['Board Certified Orthodontist', 'Invisalign Diamond Provider', 'Damon System Specialist'],
        languages: ['English', 'Spanish', 'Portuguese'],
        acceptingNewPatients: true,
      },
      {
        name: 'Dr. James Williams',
        title: 'DDS, PhD',
        specialty: 'Endodontics',
        bio: 'With a PhD in dental biomaterials and specialized training in endodontics, Dr. Williams provides exceptional root canal treatments using the latest technology and techniques.',
        imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
        email: 'dr.james@smiledental.com',
        phone: '(555) 123-4570',
        yearsOfExperience: 18,
        serviceIds: [serviceIds[4], serviceIds[0]],
        rating: 4.9,
        totalReviews: 83,
        education: ['University of Pennsylvania School of Dental Medicine', 'MIT - PhD Biomaterials', 'Boston University - Endodontics Residency'],
        certifications: ['Board Certified Endodontist', 'Microscopic Endodontics Specialist'],
        languages: ['English', 'French'],
        acceptingNewPatients: true,
      },
    ];

    const providerIds: string[] = [];
    for (const provider of providers) {
      const docRef = await addDoc(collection(db, 'providers'), {
        ...provider,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      providerIds.push(docRef.id);
      console.log(`✓ Added provider: ${provider.name}`);

      // Add provider schedules to provider_schedules collection
      const schedules: Omit<ProviderSchedule, 'id'>[] = [
        { providerId: docRef.id, dayOfWeek: 1, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00', isAvailable: true },
        { providerId: docRef.id, dayOfWeek: 2, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00', isAvailable: true },
        { providerId: docRef.id, dayOfWeek: 3, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00', isAvailable: true },
        { providerId: docRef.id, dayOfWeek: 4, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00', isAvailable: true },
        { providerId: docRef.id, dayOfWeek: 5, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00', isAvailable: true },
      ];

      for (const schedule of schedules) {
        await addDoc(collection(db, 'provider_schedules'), schedule);
      }
      console.log(`  ✓ Added schedules for ${provider.name}`);
    }

    console.log('✅ Firestore data seeding completed successfully!');
    console.log(`📊 Seeded: ${serviceIds.length} services, ${providerIds.length} providers`);
    return { success: true, serviceIds, providerIds };
  } catch (error) {
    console.error('❌ Error seeding Firestore data:', error);
    return { success: false, error };
  }
}