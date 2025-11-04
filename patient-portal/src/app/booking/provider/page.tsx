'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Star, Award, Languages, CheckCircle2, GraduationCap, Loader2 } from 'lucide-react';
import { getProviders } from '@/lib/firebase/firestore';
import { Provider } from '@/types/firebase';
import { useCurrency } from '@/lib/localization/useCurrency';

// Force dynamic rendering to prevent prerendering
export const dynamic = 'force-dynamic';

function SelectProviderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatCurrency } = useCurrency();
  
  const [service, setService] = useState<any>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'name'>('rating');

  useEffect(() => {
    const serviceId = searchParams.get('serviceId');
    const serviceName = searchParams.get('serviceName');
    const servicePrice = searchParams.get('servicePrice');
    const serviceDuration = searchParams.get('serviceDuration');
    
    if (serviceId && serviceName && servicePrice && serviceDuration) {
      setService({
        id: serviceId,
        name: serviceName,
        price: parseFloat(servicePrice),
        duration: parseInt(serviceDuration)
      });
    }

    loadProviders();
  }, [searchParams]);

  const loadProviders = async () => {
    try {
      const providersData = await getProviders();
      setProviders(providersData);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSelect = (provider: Provider) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('providerId', provider.id);
    params.set('providerName', provider.name);
    params.set('providerTitle', provider.title);
    params.set('providerSpecialty', provider.specialty);
    router.push(`/booking/datetime?${params.toString()}`);
  };

  const specialties = ['all', 'General Dentistry', 'Orthodontics', 'Periodontics', 'Endodontics', 'Oral Surgery', 'Pediatric Dentistry'];

  const filteredAndSortedProviders = providers
    .filter(provider => filterSpecialty === 'all' || provider.specialty === filterSpecialty)
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'experience':
          return b.yearsOfExperience - a.yearsOfExperience;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

           <h1 className="text-4xl font-bold mb-4">Choose Your Provider</h1>
           <p className="text-xl text-muted-foreground mb-4">
             Step 2 of 4: Select your preferred dentist
           </p>
          
          {/* Selected Service Info */}
          {service && (
            <div className="inline-block bg-muted px-6 py-3 rounded-lg mb-6">
              <p className="text-sm text-muted-foreground">Selected Service:</p>
              <p className="font-semibold">{service.name}</p>
              <p className="text-sm text-muted-foreground">{service.duration} min • {formatCurrency(service.price)}</p>
            </div>
          )}

          {/* Progress Bar */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-2 bg-primary rounded-full" />
            <div className="w-12 h-2 bg-primary rounded-full" />
            <div className="w-12 h-2 bg-muted rounded-full" />
            <div className="w-12 h-2 bg-muted rounded-full" />
          </div>
        </div>

        {/* Filter and Sort Controls */}
        <div className="max-w-7xl mx-auto mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-background"
            >
              <option value="all">All Specialties</option>
              {specialties.slice(1).map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border rounded-lg bg-background"
            >
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Providers Grid */}
        {filteredAndSortedProviders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👨‍⚕️</div>
            <h3 className="text-2xl font-semibold mb-2">
              No providers available
            </h3>
            <p className="text-muted-foreground mb-6">
              Please try selecting a different service or contact us for assistance
            </p>
            <button
              onClick={() => router.push('/contact')}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90"
            >
              Contact Us
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredAndSortedProviders.map((provider) => (
              <div
                key={provider.id}
                onClick={() => handleProviderSelect(provider)}
                className="bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer group border"
              >
                {/* Provider Photo */}
                <div className="relative h-64">
                  <Image
                    src={provider.imageUrl || '/placeholder-provider.jpg'}
                    alt={provider.name}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {provider.rating && (
                      <div className="bg-background px-3 py-1 rounded-full shadow-lg">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          <span>{provider.rating.toFixed(1)}</span>
                          {provider.totalReviews && (
                            <span className="text-muted-foreground text-xs">({provider.totalReviews})</span>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="bg-background px-3 py-1 rounded-full shadow-lg">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Award className="w-4 h-4 text-primary" />
                        <span>{provider.yearsOfExperience} years</span>
                      </div>
                    </div>
                  </div>

                  {/* Accepting Patients Badge */}
                  {provider.acceptingNewPatients && (
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full shadow-lg text-xs font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Accepting New Patients
                      </div>
                    </div>
                  )}
                </div>

                {/* Provider Details */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">
                    {provider.name}, {provider.title}
                  </h3>
                  <p className="text-primary font-medium mb-3">{provider.specialty}</p>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {provider.bio}
                  </p>

                  {/* Education */}
                  {provider.education && provider.education.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
                        <GraduationCap className="w-4 h-4" />
                        <span>Education</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 pl-6">
                        {provider.education[0]}
                      </p>
                    </div>
                  )}

                  {/* Languages */}
                  {provider.languages && provider.languages.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
                        <Languages className="w-4 h-4" />
                        <span>Languages</span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-6">
                        {provider.languages.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Certifications */}
                  {provider.certifications && provider.certifications.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1">
                      {provider.certifications.slice(0, 2).map((cert, idx) => (
                        <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                          {cert}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Select Button */}
                  <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors mt-2">
                    Book with {provider.name.split(' ')[1] || provider.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SelectProviderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <SelectProviderContent />
    </Suspense>
  );
}