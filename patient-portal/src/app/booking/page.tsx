'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Clock, DollarSign, Loader2 } from 'lucide-react';
import { Service } from '@/types/firebase';
import { useCurrency } from '@/lib/localization/useCurrency';

export default function SelectServicePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();

  // Mock data for development (will be replaced by Firestore data)
  const mockServices = [
    {
      id: '1',
      name: 'Dental Cleaning',
      description: 'Professional teeth cleaning to remove plaque, tartar, and stains.',
      category: 'general',
      duration: 60,
      price: 120,
      imageUrl: '',
    },
    {
      id: '2',
      name: 'Teeth Whitening',
      description: 'Professional whitening treatment to brighten your smile.',
      category: 'cosmetic',
      duration: 90,
      price: 450,
      imageUrl: '',
    },
    {
      id: '3',
      name: 'Dental Implants',
      description: 'Permanent tooth replacement solution.',
      category: 'restorative',
      duration: 120,
      price: 3500,
      imageUrl: '',
    },
    {
      id: '4',
      name: 'Invisalign Treatment',
      description: 'Clear aligners to straighten teeth discreetly.',
      category: 'orthodontics',
      duration: 60,
      price: 5000,
      imageUrl: '',
    },
    {
      id: '5',
      name: 'Root Canal Therapy',
      description: 'Treatment to save infected teeth.',
      category: 'general',
      duration: 90,
      price: 800,
      imageUrl: '',
    },
    {
      id: '6',
      name: 'Dental Veneers',
      description: 'Thin porcelain shells to improve tooth appearance.',
      category: 'cosmetic',
      duration: 120,
      price: 1200,
      imageUrl: '',
    },
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      // Try to fetch from Firestore
      const servicesRef = collection(db, 'services');
      const snapshot = await getDocs(servicesRef);
      
      if (snapshot.empty) {
        // Use mock data if Firestore is empty
        setServices(mockServices as any);
      } else {
        const servicesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Service[];
        setServices(servicesData);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      // Fallback to mock data on error
      setServices(mockServices as any);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'general', name: 'General Dentistry' },
    { id: 'cosmetic', name: 'Cosmetic' },
    { id: 'restorative', name: 'Restorative' },
    { id: 'orthodontics', name: 'Orthodontics' },
  ];

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(service => service.category === selectedCategory);

  const handleServiceSelect = (service: Service) => {
    // If not logged in, redirect to login with return URL
    if (!user) {
      router.push(`/auth/login?redirect=/booking/provider?serviceId=${service.id}&serviceName=${encodeURIComponent(service.name)}&duration=${service.duration}&price=${service.price}`);
      return;
    }

    router.push(
      `/booking/provider?serviceId=${service.id}&serviceName=${encodeURIComponent(service.name)}&duration=${service.duration}&price=${service.price}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <span className="text-3xl">🦷</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Your Appointment</h1>
          <p className="text-xl text-gray-600 mb-8">
            Step 1 of 4: Select the service you need
          </p>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-2 bg-blue-600 rounded-full" />
            <div className="w-12 h-2 bg-gray-300 rounded-full" />
            <div className="w-12 h-2 bg-gray-300 rounded-full" />
            <div className="w-12 h-2 bg-gray-300 rounded-full" />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              onClick={() => handleServiceSelect(service)}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer group"
            >
              {/* Service Icon */}
              <div className="bg-linear-to-br from-blue-500 to-blue-600 p-6 text-center">
                <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">
                  🦷
                </div>
                <h3 className="text-xl font-bold text-white">{service.name}</h3>
              </div>

              {/* Service Details */}
              <div className="p-6">
                <p className="text-gray-600 mb-4 line-clamp-2 min-h-[3rem]">
                  {service.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-blue-600 text-lg">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                </div>

                {/* Select Button */}
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Select This Service
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              No services found
            </h3>
            <p className="text-gray-600">
              Try selecting a different category
            </p>
          </div>
        )}

        {/* Need Help Section */}
        <div className="max-w-2xl mx-auto mt-16 bg-blue-50 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Not sure which service you need?
          </h3>
          <p className="text-gray-700 mb-6">
            Our team can help you determine the best treatment for your needs
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}