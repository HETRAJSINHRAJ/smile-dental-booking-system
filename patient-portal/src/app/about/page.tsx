'use client';

import { Metadata } from 'next';
import Image from 'next/image';
import { Award, Heart, Shield, Users } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: 'Patient-Centered Care',
      description: 'Your comfort and satisfaction are our top priorities. We listen to your concerns and tailor treatments to your needs.',
    },
    {
      icon: Shield,
      title: 'Advanced Technology',
      description: 'We invest in the latest dental technology to provide safe, efficient, and comfortable treatments.',
    },
    {
      icon: Award,
      title: 'Excellence in Dentistry',
      description: 'Our team maintains the highest standards through continuous education and proven clinical practices.',
    },
    {
      icon: Users,
      title: 'Family-Friendly',
      description: 'We welcome patients of all ages and provide a warm, welcoming environment for the whole family.',
    },
  ];

  const teamMembers = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'General Dentist',
      specialty: 'Cosmetic Dentistry',
      experience: '15 years',
      education: 'DDS, University of California',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
      bio: 'Dr. Johnson is passionate about creating beautiful, healthy smiles. She specializes in cosmetic procedures and takes pride in her gentle approach.',
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Orthodontist',
      specialty: 'Invisalign & Braces',
      experience: '12 years',
      education: 'DMD, Harvard School of Dental Medicine',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
      bio: 'Dr. Chen is an expert in orthodontics, helping patients achieve perfectly aligned smiles using the latest technologies.',
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Pediatric Dentist',
      specialty: 'Children\'s Dentistry',
      experience: '10 years',
      education: 'DDS, NYU College of Dentistry',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
      bio: 'Dr. Rodriguez creates a fun and comfortable environment for children, making dental visits an enjoyable experience.',
    },
    {
      name: 'Dr. James Wilson',
      role: 'Oral Surgeon',
      specialty: 'Surgical Procedures',
      experience: '18 years',
      education: 'DDS, University of Pennsylvania',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop',
      bio: 'Dr. Wilson performs complex oral surgeries with precision and care, ensuring optimal outcomes for his patients.',
    },
  ];

  const certifications = [
    'American Dental Association',
    'Academy of General Dentistry',
    'American Academy of Cosmetic Dentistry',
    'International Congress of Oral Implantologists',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">About Our Practice</h1>
            <p className="text-xl md:text-2xl text-blue-100">
              Dedicated to providing exceptional dental care with compassion and expertise since 2008
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              At Smile Dental Practice, our mission is to provide comprehensive, compassionate dental care 
              that improves not just smiles, but lives. We believe that excellent oral health is the foundation 
              of overall wellness, and we're committed to helping every patient achieve and maintain their 
              healthiest, most confident smile.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We combine state-of-the-art technology with personalized care, ensuring each visit is 
              comfortable, efficient, and tailored to your unique needs. Your smile is our passion.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Expert Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our experienced dentists are dedicated to providing you with the highest quality care
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="relative h-64">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p className="font-medium">{member.specialty}</p>
                    <p>{member.experience} experience</p>
                    <p className="text-xs">{member.education}</p>
                  </div>
                  <p className="text-sm text-gray-700">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications & Awards */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Certifications & Memberships
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-800">{cert}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience the Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our family of satisfied patients and take the first step toward your healthiest smile
          </p>
          <a
            href="/booking"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition-colors shadow-xl"
          >
            Book Your Appointment Today
          </a>
        </div>
      </section>
    </div>
  );
}
