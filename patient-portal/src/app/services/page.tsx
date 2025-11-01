'use client';

import { Metadata } from 'next';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Sparkles, Clock, DollarSign } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  price: number;
  iconName: string;
  isActive: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock data for development (replace with Firestore data later)
  const mockServices: Service[] = [
    {
      id: '1',
      name: 'Dental Cleaning',
      description: 'Professional teeth cleaning to remove plaque, tartar, and stains. Includes polishing and fluoride treatment.',
      category: 'general',
      durationMinutes: 60,
      price: 120,
      iconName: '🦷',
      isActive: true,
    },
    {
      id: '2',
      name: 'Teeth Whitening',
      description: 'Professional whitening treatment to brighten your smile by several shades in just one visit.',
      category: 'cosmetic',
      durationMinutes: 90,
      price: 450,
      iconName: '✨',
      isActive: true,
    },
    {
      id: '3',
      name: 'Dental Implants',
      description: 'Permanent tooth replacement solution that looks and functions like natural teeth.',
      category: 'restorative',
      durationMinutes: 120,
      price: 3500,
      iconName: '🔧',
      isActive: true,
    },
    {
      id: '4',
      name: 'Invisalign Treatment',
      description: 'Clear aligners to straighten teeth discreetly without traditional braces.',
      category: 'orthodontics',
      durationMinutes: 60,
      price: 5000,
      iconName: '😁',
      isActive: true,
    },
    {
      id: '5',
      name: 'Root Canal Therapy',
      description: 'Treatment to save infected teeth by removing damaged pulp and sealing the tooth.',
      category: 'general',
      durationMinutes: 90,
      price: 800,
      iconName: '🩺',
      isActive: true,
    },
    {
      id: '6',
      name: 'Dental Veneers',
      description: 'Thin porcelain shells bonded to teeth to improve appearance and correct imperfections.',
      category: 'cosmetic',
      durationMinutes: 120,
      price: 1200,
      iconName: '💎',
      isActive: true,
    },
    {
      id: '7',
      name: 'Dental Crowns',
      description: 'Custom-made caps that cover damaged teeth to restore shape, size, and strength.',
      category: 'restorative',
      durationMinutes: 90,
      price: 1100,
      iconName: '👑',
      isActive: true,
    },
    {
      id: '8',
      name: 'Pediatric Dentistry',
      description: 'Comprehensive dental care for children in a fun, comfortable environment.',
      category: 'general',
      durationMinutes: 45,
      price: 90,
      iconName: '👶',
      isActive: true,
    },
    {
      id: '9',
      name: 'Emergency Care',
      description: 'Immediate treatment for dental emergencies including pain, trauma, and infections.',
      category: 'general',
      durationMinutes: 60,
      price: 200,
      iconName: '🚨',
      isActive: true,
    },
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setServices(mockServices);
      setLoading(false);
    }, 500);

    // TODO: Replace with actual Firestore fetch
    // fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const q = query(
        collection(db, 'services'),
        where('isActive', '==', true),
        orderBy('displayOrder', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
      
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      // Use mock data as fallback
      setServices(mockServices);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Services', icon: '🌟' },
    { id: 'general', name: 'General Dentistry', icon: '🦷' },
    { id: 'cosmetic', name: 'Cosmetic', icon: '✨' },
    { id: 'restorative', name: 'Restorative', icon: '🔧' },
    { id: 'orthodontics', name: 'Orthodontics', icon: '😁' },
  ];

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(service => service.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Services</h1>
            <p className="text-xl md:text-2xl text-blue-100">
              Comprehensive dental care tailored to your unique needs
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                <span className="text-sm opacity-75">
                  ({category.id === 'all' ? services.length : services.filter(s => s.category === category.id).length})
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 group"
              >
                {/* Service Icon */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-center">
                  <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">
                    {service.iconName}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{service.name}</h3>
                </div>

                {/* Service Details */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6 line-clamp-3">{service.description}</p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{service.durationMinutes} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold text-blue-600 text-lg">
                        ${service.price}
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <a
                    href="/booking"
                    className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Book This Service
                  </a>
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Sparkles className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Not Sure Which Service You Need?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Schedule a consultation with our experienced team, and we'll help you find the perfect treatment plan
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/booking"
                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition-colors shadow-xl"
              >
                Book an Appointment
              </a>
              <a
                href="/contact"
                className="inline-block border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
