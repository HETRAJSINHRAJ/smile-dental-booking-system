'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxImage, setLightboxImage] = useState<number | null>(null);

  const categories = [
    { id: 'all', name: 'All Photos' },
    { id: 'office', name: 'Our Office' },
    { id: 'team', name: 'Our Team' },
    { id: 'beforeafter', name: 'Before & After' },
    { id: 'technology', name: 'Technology' },
  ];

  const galleryImages = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=600&fit=crop',
      category: 'office',
      title: 'Modern Reception Area',
      description: 'Welcome to our comfortable and inviting reception area',
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&h=600&fit=crop',
      category: 'office',
      title: 'Treatment Room',
      description: 'State-of-the-art treatment rooms equipped with the latest technology',
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&h=600&fit=crop',
      category: 'team',
      title: 'Our Dental Team',
      description: 'Meet our friendly and experienced dental professionals',
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1626736985932-b1a1cd6b461c?w=800&h=600&fit=crop',
      category: 'technology',
      title: 'Digital X-Ray Equipment',
      description: 'Advanced digital imaging for accurate diagnostics',
    },
    {
      id: 5,
      src: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&h=600&fit=crop',
      category: 'beforeafter',
      title: 'Smile Transformation',
      description: 'Real results from our cosmetic dentistry treatments',
    },
    {
      id: 6,
      src: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&h=600&fit=crop',
      category: 'office',
      title: 'Waiting Area',
      description: 'Relax in our comfortable waiting area',
    },
    {
      id: 7,
      src: 'https://images.unsplash.com/photo-1629909615957-be38c5e90e04?w=800&h=600&fit=crop',
      category: 'technology',
      title: 'Modern Equipment',
      description: 'Latest dental technology for your comfort and care',
    },
    {
      id: 8,
      src: 'https://images.unsplash.com/photo-1609840112855-9ab5ad8f66e4?w=800&h=600&fit=crop',
      category: 'team',
      title: 'Dentist at Work',
      description: 'Our team providing excellent patient care',
    },
    {
      id: 9,
      src: 'https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=800&h=600&fit=crop',
      category: 'office',
      title: 'Sterilization Area',
      description: 'Maintaining the highest standards of cleanliness',
    },
  ];

  const filteredImages = selectedCategory === 'all'
    ? galleryImages
    : galleryImages.filter(img => img.category === selectedCategory);

  const openLightbox = (id: number) => {
    setLightboxImage(id);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (lightboxImage === null) return;
    
    const currentIndex = filteredImages.findIndex(img => img.id === lightboxImage);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? filteredImages.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === filteredImages.length - 1 ? 0 : currentIndex + 1;
    }
    
    setLightboxImage(filteredImages[newIndex].id);
  };

  const currentLightboxImage = filteredImages.find(img => img.id === lightboxImage);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Gallery</h1>
            <p className="text-xl md:text-2xl text-blue-100">
              Take a virtual tour of our modern practice and see the smiles we've created
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
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
                <span className="ml-2 text-sm opacity-75">
                  ({category.id === 'all' ? galleryImages.length : galleryImages.filter(img => img.category === category.id).length})
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg cursor-pointer hover:shadow-2xl transition-all"
                onClick={() => openLightbox(image.id)}
              >
                <Image
                  src={image.src}
                  alt={image.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                    <p className="text-sm text-gray-200">{image.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredImages.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📷</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                No images in this category
              </h3>
              <p className="text-gray-600">
                Try selecting a different category
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImage !== null && currentLightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X className="w-10 h-10" />
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={() => navigateLightbox('prev')}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>
          <button
            onClick={() => navigateLightbox('next')}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <ChevronRight className="w-12 h-12" />
          </button>

          {/* Image */}
          <div className="relative w-full h-full max-w-5xl max-h-[80vh]">
            <Image
              src={currentLightboxImage.src}
              alt={currentLightboxImage.title}
              fill
              className="object-contain"
            />
          </div>

          {/* Image Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-2">{currentLightboxImage.title}</h3>
            <p className="text-gray-300">{currentLightboxImage.description}</p>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Experience It for Yourself
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Visit our modern practice and see why patients love coming here
          </p>
          <a
            href="/booking"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition-colors shadow-xl"
          >
            Schedule Your Visit
          </a>
        </div>
      </section>
    </div>
  );
}
