"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Star,
  Clock,
  Loader2,
  User,
  ArrowRight,
} from "lucide-react";
import { getProviders } from "@/lib/firebase/firestore";
import { Provider } from "@/types/shared";
import { useCurrency } from "@/lib/localization/useCurrency";
import { analyticsService } from "@/lib/analytics/analyticsService";

// Force dynamic rendering to prevent prerendering
export const dynamic = "force-dynamic";

function SelectProviderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatCurrency } = useCurrency();

  const [service, setService] = useState<any>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSpecialty, setFilterSpecialty] = useState("all");

  useEffect(() => {
    const serviceId = searchParams.get("serviceId");
    const serviceName = searchParams.get("serviceName");
    const servicePrice = searchParams.get("price");
    const serviceDuration = searchParams.get("duration");

    if (serviceId && serviceName && servicePrice && serviceDuration) {
      setService({
        id: serviceId,
        name: serviceName,
        price: parseFloat(servicePrice),
        duration: parseInt(serviceDuration),
      });
    }

    loadProviders();
  }, [searchParams]);

  const loadProviders = async () => {
    try {
      const providersData = await getProviders();
      setProviders(providersData);
    } catch (error) {
      console.error("Error loading providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSelect = (provider: Provider) => {
    // Track provider view
    analyticsService.trackProviderView(provider.id, provider.name, service?.id);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("providerId", provider.id);
    params.set("providerName", provider.name);
    params.set("providerTitle", provider.title);
    params.set("providerSpecialty", provider.specialty);
    router.push(`/booking/datetime?${params.toString()}`);
  };

  const specialties = [
    { id: "all", name: "All Specialties" },
    { id: "General Dentistry", name: "General" },
    { id: "Orthodontics", name: "Orthodontics" },
    { id: "Periodontics", name: "Periodontics" },
    { id: "Endodontics", name: "Endodontics" },
    { id: "Oral Surgery", name: "Oral Surgery" },
    { id: "Pediatric Dentistry", name: "Pediatric" },
  ];

  const filteredProviders = providers.filter((provider) => {
    // First check if provider offers the selected service
    const offersService = service && provider.serviceIds && provider.serviceIds.includes(service.id);
    
    // If no service is selected or provider doesn't offer it, exclude them
    if (!offersService) {
      return false;
    }
    
    // Then filter by specialty
    return filterSpecialty === "all" || provider.specialty === filterSpecialty;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <h1 className="text-2xl font-bold mb-1">Select a Provider</h1>
              <p className="text-sm text-muted-foreground">
                Choose your preferred dentist
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  ✓
                </div>
                <span className="text-sm font-medium">Service</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  2
                </div>
                <span className="text-sm font-medium">Provider</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
                  3
                </div>
                <span className="text-sm text-muted-foreground">Date & Time</span>
              </div>
            </div>
          </div>

          {/* Selected Service Info */}
          {service && (
            <div className="bg-card border rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Selected Service</p>
                  <p className="font-semibold">{service.name}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration} min</span>
                  </div>
                  <p className="font-semibold text-primary">
                    {formatCurrency(service.price)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {specialties.map((specialty) => (
              <button
                key={specialty.id}
                onClick={() => setFilterSpecialty(specialty.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  filterSpecialty === specialty.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {specialty.name}
              </button>
            ))}
          </div>
        </div>

        {/* Providers Grid */}
        {filteredProviders.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredProviders.map((provider) => (
              <div
                key={provider.id}
                onClick={() => handleProviderSelect(provider)}
                className="bg-card border rounded-lg overflow-hidden hover:border-primary hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Provider Photo */}
                <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5">
                  {provider.imageUrl ? (
                    <Image
                      src={provider.imageUrl}
                      alt={provider.name}
                      fill
                      className="object-cover"
                      unoptimized={provider.imageUrl?.includes("ucarecdn.com")}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <User className="w-16 h-16 text-primary/20" />
                    </div>
                  )}

                  {/* Rating Badge */}
                  {provider.rating && (
                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <span>{provider.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Provider Details */}
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {provider.name}
                  </h3>
                  <p className="text-sm text-primary font-medium mb-2">
                    {provider.specialty}
                  </p>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {provider.bio}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-sm text-muted-foreground">
                      {provider.yearsOfExperience} years experience
                    </span>
                    {provider.acceptingNewPatients && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Available
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg border">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No providers found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try selecting a different specialty or contact us for assistance
            </p>
            <button
              onClick={() => setFilterSpecialty("all")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors mr-2"
            >
              Show All Providers
            </button>
            <button
              onClick={() => router.push("/contact")}
              className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              Contact Us
            </button>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-card border rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">
            Need help choosing a provider?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Our team can help you find the right dentist for your needs
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Contact Us
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SelectProviderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      }
    >
      <SelectProviderContent />
    </Suspense>
  );
}
