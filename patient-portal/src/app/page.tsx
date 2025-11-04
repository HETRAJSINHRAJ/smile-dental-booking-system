"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Shield, Star, Users, Clock, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  const services = [
    {
      icon: "🦷",
      title: "General Dentistry",
      description: "Comprehensive oral health care including cleanings, exams, and preventive treatments",
    },
    {
      icon: "✨",
      title: "Cosmetic Dentistry",
      description: "Transform your smile with whitening, veneers, and aesthetic procedures",
    },
    {
      icon: "🔧",
      title: "Restorative Care",
      description: "Repair and restore damaged teeth with crowns, bridges, and implants",
    },
    {
      icon: "😁",
      title: "Orthodontics",
      description: "Straighten your teeth with braces, aligners, and other orthodontic solutions",
    },
    {
      icon: "🚨",
      title: "Emergency Care",
      description: "Same-day appointments for urgent dental issues and tooth pain",
    },
    {
      icon: "👶",
      title: "Pediatric Dentistry",
      description: "Gentle, specialized care for children and adolescents",
    },
  ];

  const dentists = [
    {
      name: "Dr. Sarah Johnson",
      specialty: "General & Cosmetic Dentistry",
      experience: "15+ years",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
    },
    {
      name: "Dr. Michael Chen",
      specialty: "Orthodontics",
      experience: "12+ years",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
    },
    {
      name: "Dr. Emily Rodriguez",
      specialty: "Pediatric Dentistry",
      experience: "10+ years",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop",
    },
  ];

  const testimonials = [
    {
      name: "Jessica Miller",
      review: "The best dental experience I've ever had! The staff is incredibly friendly and professional.",
      rating: 5,
    },
    {
      name: "Robert Davis",
      review: "Dr. Johnson transformed my smile. I couldn't be happier with the results!",
      rating: 5,
    },
    {
      name: "Amanda Lee",
      review: "My kids actually look forward to dental visits now. The pediatric team is amazing!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`,
        }}
      />

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-20 pb-32 sm:pt-32 sm:pb-40">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <Badge className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300">
              <Heart className="w-4 h-4 mr-2 inline" />
              Your Smile, Our Priority
            </Badge>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6"
          >
            Experience{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Exceptional
            </span>
            <br />
            Dental Care
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Your trusted partner for comprehensive dental care. From routine checkups to smile transformations.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Button size="lg" className="group text-base px-8 py-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700" asChild>
              <Link href="/booking">
                Book Appointment
                <Calendar className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 py-6 border-2" asChild>
              <Link href="/services">
                Explore Services
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              { icon: Users, value: "10,000+", label: "Happy Patients" },
              { icon: Star, value: "4.9/5", label: "Average Rating" },
              { icon: Shield, value: "15+", label: "Years Experience" },
              { icon: Clock, value: "24/7", label: "Emergency Care" },
            ].map((stat, index) => (
              <Card key={index} className="p-6 text-center border-2 hover:shadow-lg transition-all">
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 bg-muted/30 rounded-3xl my-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2">Our Services</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Comprehensive Dental Solutions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From preventive care to advanced treatments, we offer a full range of dental services
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Card className="p-6 h-full border-2 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/services">
                View All Services
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Dentists Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2">Our Team</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Meet Our Expert Dentists
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Highly qualified professionals dedicated to your oral health
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {dentists.map((dentist, index) => (
              <motion.div
                key={dentist.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={dentist.image}
                      alt={dentist.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{dentist.name}</h3>
                    <p className="text-sm text-blue-600 font-medium mb-1">{dentist.specialty}</p>
                    <p className="text-sm text-muted-foreground">{dentist.experience} experience</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">
                Learn More About Our Team
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 bg-muted/30 rounded-3xl my-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              What Our Patients Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real stories from real patients who trust us with their smiles
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full">
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.review}"</p>
                  <p className="font-semibold">{testimonial.name}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Card className="p-8 sm:p-12 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/20">
            <div className="text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready for Your Best Smile?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Book your appointment today and experience the SmileDental difference. 
                Your journey to a healthier, brighter smile starts here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-base px-8 py-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700" asChild>
                  <Link href="/booking">
                    Book Your Appointment
                    <Calendar className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base px-8 py-6 border-2" asChild>
                  <Link href="/contact">
                    Contact Us
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
