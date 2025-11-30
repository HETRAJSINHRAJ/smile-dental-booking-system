"use client";

import { useState, useEffect } from "react";
import { getServices } from "@/lib/firebase/firestore";
import {
  Sparkles,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Shield,
  Award,
  Heart,
  Loader2,
} from "lucide-react";
import { useCurrency } from "@/lib/localization/useCurrency";
import Link from "next/link";
import { Service } from "@/types/shared";
import { analyticsService } from "@/lib/analytics/analyticsService";

// Icon mapping based on category
const getCategoryIcon = (category: string): string => {
  const iconMap: { [key: string]: string } = {
    general: "🦷",
    cosmetic: "✨",
    restorative: "🔧",
    orthodontics: "😁",
    emergency: "🚨",
  };
  return iconMap[category.toLowerCase()] || "🦷";
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    // Fetch services using cached one-time read (5-minute TTL)
    const fetchServices = async () => {
      try {
        setLoading(true);
        const servicesData = await getServices();
        
        if (servicesData.length === 0) {
          console.log("No services found in Firestore");
          setServices([]);
          setError(
            "No services available at the moment. Please check back later.",
          );
        } else {
          // Sort by category and name
          const sortedServices = servicesData.sort((a, b) => {
            if (a.category === b.category) {
              return a.name.localeCompare(b.name);
            }
            return a.category.localeCompare(b.category);
          });

          setServices(sortedServices);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Unable to load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const categories = [
    {
      id: "all",
      name: "All Services",
      icon: "🌟",
      description: "View our complete range of dental services",
    },
    {
      id: "general",
      name: "General Dentistry",
      icon: "🦷",
      description: "Routine care and preventive treatments",
    },
    {
      id: "cosmetic",
      name: "Cosmetic",
      icon: "✨",
      description: "Enhance your smile aesthetically",
    },
    {
      id: "restorative",
      name: "Restorative",
      icon: "🔧",
      description: "Restore damaged or missing teeth",
    },
    {
      id: "orthodontics",
      name: "Orthodontics",
      icon: "😁",
      description: "Straighten and align your teeth",
    },
  ];

  const filteredServices =
    selectedCategory === "all"
      ? services
      : services.filter((service) => service.category === selectedCategory);

  // Track service views when services are displayed
  useEffect(() => {
    if (filteredServices.length > 0) {
      filteredServices.forEach((service) => {
        analyticsService.trackServiceView(service.id, service.name);
      });
    }
  }, [filteredServices]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Comprehensive Dental Services for Your Perfect Smile
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              From routine cleanings to advanced cosmetic procedures, we offer
              complete dental care tailored to your unique needs
            </p>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition-colors shadow-xl"
            >
              Book Your Appointment
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              Why Choose Our Dental Services?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Award className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Expert Professionals
                </h3>
                <p className="text-gray-600">
                  Experienced dentists with advanced training in the latest
                  dental techniques and technologies
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  State-of-the-Art Equipment
                </h3>
                <p className="text-gray-600">
                  Modern technology and equipment ensuring safe, comfortable,
                  and effective treatments
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Heart className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Patient-Centered Care
                </h3>
                <p className="text-gray-600">
                  Personalized treatment plans focused on your comfort, health,
                  and satisfaction
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-12 bg-gray-50 border-y sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
            Explore Our Services by Category
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-100 shadow"
                }`}
                title={category.description}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                <span className="text-sm opacity-75">
                  (
                  {category.id === "all"
                    ? services.length
                    : services.filter((s) => s.category === category.id).length}
                  )
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
              <article
                key={service.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 group flex flex-col"
              >
                {/* Service Icon */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-center">
                  <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="w-20 h-20 mx-auto object-contain"
                      />
                    ) : (
                      <span>{getCategoryIcon(service.category)}</span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {service.name}
                  </h3>
                </div>

                {/* Service Details */}
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Benefits List */}
                  <div className="mb-6 space-y-2">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Professional treatment</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Latest technology</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Comfortable experience</span>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-600 text-lg">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                  </div>

                  {/* Book Button */}
                  <Link
                    href="/booking"
                    className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-auto"
                  >
                    Book This Service
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Empty State */}
          {filteredServices.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                {error ? "Unable to load services" : "No services found"}
              </h3>
              <p className="text-gray-600">
                {error ||
                  "Try selecting a different category or check back later"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  How often should I get a dental cleaning?
                </h3>
                <p className="text-gray-600">
                  Most dentists recommend getting a professional dental cleaning
                  every 6 months. However, depending on your oral health, your
                  dentist may suggest more frequent visits.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Are cosmetic procedures covered by insurance?
                </h3>
                <p className="text-gray-600">
                  Cosmetic procedures like teeth whitening and veneers are
                  typically not covered by insurance. However, some restorative
                  procedures may be partially covered. We recommend checking
                  with your insurance provider.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Do you offer payment plans?
                </h3>
                <p className="text-gray-600">
                  Yes! We offer flexible payment plans for most procedures. Our
                  staff can discuss financing options during your consultation
                  to make your dental care affordable.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  What should I expect during my first visit?
                </h3>
                <p className="text-gray-600">
                  Your first visit will include a comprehensive examination,
                  X-rays if needed, and a discussion about your oral health
                  goals. We&apos;ll create a personalized treatment plan based
                  on your needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              What Our Patients Say
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  &quot;The teeth whitening service was amazing! My smile has
                  never looked better. The staff was professional and made me
                  feel comfortable throughout.&quot;
                </p>
                <p className="font-semibold text-gray-900">- Sarah M.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  &quot;I was nervous about getting dental implants, but the
                  team made the process smooth and painless. Highly recommend
                  their restorative services!&quot;
                </p>
                <p className="font-semibold text-gray-900">- John D.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  &quot;Best dental experience ever! The cleaning was thorough,
                  and they took time to explain everything. Will definitely be
                  coming back!&quot;
                </p>
                <p className="font-semibold text-gray-900">- Emily R.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Sparkles className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Smile?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Book your appointment today and experience the difference of
              personalized, professional dental care
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition-colors shadow-xl"
              >
                Book an Appointment
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
            <p className="mt-6 text-blue-100 text-sm">
              Not sure which service you need? Our team is here to help you find
              the perfect treatment
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
