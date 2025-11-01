import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="text-2xl">🦷</div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                SmileDental
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Your trusted partner for comprehensive dental care. We're dedicated to creating healthy, beautiful smiles.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-primary transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-primary transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-primary transition-colors">
                  Book Appointment
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/services?category=general" className="hover:text-primary transition-colors">
                  General Dentistry
                </Link>
              </li>
              <li>
                <Link href="/services?category=cosmetic" className="hover:text-primary transition-colors">
                  Cosmetic Dentistry
                </Link>
              </li>
              <li>
                <Link href="/services?category=restorative" className="hover:text-primary transition-colors">
                  Restorative Care
                </Link>
              </li>
              <li>
                <Link href="/services?category=orthodontics" className="hover:text-primary transition-colors">
                  Orthodontics
                </Link>
              </li>
              <li>
                <Link href="/services?category=emergency" className="hover:text-primary transition-colors">
                  Emergency Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>123 Dental Street, Healthcare City, HC 12345</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <a href="tel:+15551234567" className="hover:text-primary transition-colors">
                  (555) 123-4567
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a href="mailto:info@smiledental.com" className="hover:text-primary transition-colors">
                  info@smiledental.com
                </a>
              </li>
            </ul>

            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2">Office Hours</h4>
              <p className="text-sm text-muted-foreground">
                Mon - Fri: 8:00 AM - 6:00 PM<br />
                Saturday: 9:00 AM - 3:00 PM<br />
                Sunday: Closed
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SmileDental. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/sitemap" className="hover:text-primary transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
