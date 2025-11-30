"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Clock, Loader2, ArrowRight, Search } from "lucide-react";
import { Service } from "@/types/shared";
import { useCurrency } from "@/lib/localization/useCurrency";
import { analyticsService } from "@/lib/analytics/analyticsService";

export default function SelectServicePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { formatCurrency } = useCurrency();

  // Mock data for development (will be replaced by Firestore data)
  const mockServices = [
    {
      id: "1",
      name: "Dental Cleaning",
      description:
        "Professional teeth cleaning to remove plaque, tartar, and stains.",
      category: "general",
      duration: 60,
      price: 120,
      imageUrl: "",
    },
    {
      id: "2",
      name: "Teeth Whitening",
      description: "Professional whitening treatment to brighten your smile.",
      category: "cosmetic",
      duration: 90,
      price: 450,
      imageUrl: "",
    },
    {
      id: "3",
      name: "Dental Implants",
      description: "Permanent tooth replacement solution.",
      category: "restorative",
      duration: 120,
      price: 3500,
      imageUrl: "",
    },
    {
      id: "4",
      name: "Invisalign Treatment",
      description: "Clear aligners to straighten teeth discreetly.",
      category: "orthodontics",
      duration: 60,
      price: 5000,
      imageUrl: "",
    },
    {
      id: "5",
      name: "Root Canal Therapy",
      description: "Treatment to save infected teeth.",
      category: "general",
      duration: 90,
      price: 800,
      imageUrl: "",
    },
    {
      id: "6",
      name: "Dental Veneers",
      description: "Thin porcelain shells to improve tooth appearance.",
      category: "cosmetic",
      duration: 120,
      price: 1200,
      imageUrl: "",
    },
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      // Try to fetch from Firestore
      const servicesRef = collection(db, "services");
      const snapshot = await getDocs(servicesRef);

      if (snapshot.empty) {
        // Use mock data if Firestore is empty
        setServices(mockServices as any);
      } else {
        const servicesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Service[];
        setServices(servicesData);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      // Fallback to mock data on error
      setServices(mockServices as any);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", name: "All Services" },
    { id: "general", name: "General" },
    { id: "cosmetic", name: "Cosmetic" },
    { id: "restorative", name: "Restorative" },
    { id: "orthodontics", name: "Orthodontics" },
  ];

  const filteredServices = services.filter((service) => {
    const matchesCategory =
      selectedCategory === "all" || service.category === selectedCategory;
    const matchesSearch = service.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleServiceSelect = (service: Service) => {
    // Track booking started event
    analyticsService.trackBookingStarted(service.id, service.name);
    
    // If not logged in, redirect to login with return URL
    if (!user) {
      router.push(
        `/auth/login?redirect=/booking/provider?serviceId=${service.id}&serviceName=${encodeURIComponent(service.name)}&duration=${service.duration}&price=${service.price}`,
      );
      return;
    }

    router.push(
      `/booking/provider?serviceId=${service.id}&serviceName=${encodeURIComponent(service.name)}&duration=${service.duration}&price=${service.price}`,
    );
  };

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
              <h1 className="text-2xl font-bold mb-1">Select a Service</h1>
              <p className="text-sm text-muted-foreground">
                Choose the dental service you need
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  1
                </div>
                <span className="text-sm font-medium">Service</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
                  2
                </div>
                <span className="text-sm text-muted-foreground">Provider</span>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                className="bg-card border rounded-lg p-5 hover:border-primary hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {service.name}
                  </h3>
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🦷</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {service.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration} min</span>
                  </div>
                  <span className="font-semibold text-primary">
                    {formatCurrency(service.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg border">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No services found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search or filter
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-card border rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">
            Need help choosing a service?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Our team can help you determine the best treatment for your needs
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
