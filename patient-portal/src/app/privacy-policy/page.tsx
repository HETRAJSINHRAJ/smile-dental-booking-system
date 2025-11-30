'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-blue-50 dark:from-background dark:via-background dark:to-muted py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-card border rounded-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to SmileDental ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal and health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our dental booking platform, including our website and mobile application (collectively, the "Services").
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              By using our Services, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our Services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Personal Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We collect personal information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Full name, email address, and phone number</li>
              <li>Date of birth and demographic information</li>
              <li>Account credentials (username and password)</li>
              <li>Profile information and preferences</li>
              <li>Communication preferences and language settings</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Health Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              As a healthcare service provider, we collect and maintain Protected Health Information (PHI) as defined by HIPAA, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Appointment details and medical history</li>
              <li>Treatment information and dental records</li>
              <li>Insurance information and billing records</li>
              <li>Notes and communications with healthcare providers</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Payment Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              We collect payment information necessary to process transactions, including payment card details, billing address, and transaction history. Payment processing is handled by secure third-party payment processors (Razorpay), and we do not store complete payment card information on our servers.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.4 Usage and Technical Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We automatically collect certain information when you use our Services:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Device information (type, operating system, browser type)</li>
              <li>IP address and location data</li>
              <li>Usage patterns and interaction with our Services</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Error logs and performance data</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>To provide, maintain, and improve our Services</li>
              <li>To process and manage your appointments and bookings</li>
              <li>To process payments and send receipts</li>
              <li>To communicate with you about appointments, reminders, and updates</li>
              <li>To send notifications via email, SMS, and push notifications</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To personalize your experience and provide relevant content</li>
              <li>To analyze usage patterns and improve our Services</li>
              <li>To detect, prevent, and address technical issues and security threats</li>
              <li>To comply with legal obligations and enforce our Terms of Service</li>
            </ul>
          </section>

          {/* Information Sharing and Disclosure */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell, rent, or trade your personal information. We may share your information in the following circumstances:
            </p>

            <h3 className="text-xl font-semibold mb-3">4.1 Healthcare Providers</h3>
            <p className="text-muted-foreground leading-relaxed">
              We share your information with dental healthcare providers to facilitate your appointments and provide treatment.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Service Providers</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We may share information with third-party service providers who perform services on our behalf:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Payment processors (Razorpay)</li>
              <li>Email and SMS notification services (Resend, Twilio)</li>
              <li>Cloud storage and hosting providers (Firebase, Vercel)</li>
              <li>Analytics providers (Google Analytics, Firebase Analytics)</li>
              <li>Error tracking services (Sentry)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.3 Legal Requirements</h3>
            <p className="text-muted-foreground leading-relaxed">
              We may disclose your information if required by law, court order, or governmental authority, or to protect our rights, property, or safety.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.4 Business Transfers</h3>
            <p className="text-muted-foreground leading-relaxed">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
            </p>
          </section>

          {/* HIPAA Compliance */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">5. HIPAA Compliance</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              As a healthcare service provider, we comply with the Health Insurance Portability and Accountability Act (HIPAA) and its implementing regulations. We maintain appropriate administrative, physical, and technical safeguards to protect your Protected Health Information (PHI).
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Your rights under HIPAA include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Right to access your health information</li>
              <li>Right to request corrections to your health information</li>
              <li>Right to receive an accounting of disclosures</li>
              <li>Right to request restrictions on uses and disclosures</li>
              <li>Right to request confidential communications</li>
              <li>Right to file a complaint if you believe your privacy rights have been violated</li>
            </ul>
          </section>

          {/* GDPR Compliance */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">6. GDPR Compliance (For EU Users)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you are located in the European Union (EU) or European Economic Area (EEA), you have certain rights under the General Data Protection Regulation (GDPR):
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Right to Access:</strong> You can request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> You can request correction of inaccurate data</li>
              <li><strong>Right to Erasure:</strong> You can request deletion of your personal data ("right to be forgotten")</li>
              <li><strong>Right to Restrict Processing:</strong> You can request limitation of how we use your data</li>
              <li><strong>Right to Data Portability:</strong> You can request your data in a machine-readable format</li>
              <li><strong>Right to Object:</strong> You can object to certain types of processing</li>
              <li><strong>Right to Withdraw Consent:</strong> You can withdraw consent at any time</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, please contact us at privacy@smiledental.com. We will respond to your request within 30 days.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Encryption of data in transit using HTTPS/TLS</li>
              <li>Encryption of data at rest in our databases</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Employee training on data protection and privacy</li>
              <li>Audit logging of all access to sensitive information</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Health information is retained in accordance with applicable healthcare regulations and legal requirements, typically for a minimum of 7 years from the date of last treatment.
            </p>
          </section>

          {/* Your Privacy Rights */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Your Privacy Rights and Choices</h2>
            
            <h3 className="text-xl font-semibold mb-3">9.1 Account Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              You can update your account information at any time by logging into your account settings.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">9.2 Communication Preferences</h3>
            <p className="text-muted-foreground leading-relaxed">
              You can manage your notification preferences in your account settings. You can opt out of promotional communications while still receiving essential service-related notifications.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">9.3 Cookies</h3>
            <p className="text-muted-foreground leading-relaxed">
              You can control cookies through your browser settings. However, disabling cookies may affect the functionality of our Services.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">9.4 Data Export</h3>
            <p className="text-muted-foreground leading-relaxed">
              You can request a copy of your personal data in a machine-readable format by contacting us at privacy@smiledental.com.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">9.5 Account Deletion</h3>
            <p className="text-muted-foreground leading-relaxed">
              You can request deletion of your account and personal data. Please note that we may retain certain information as required by law or for legitimate business purposes.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us, and we will delete such information.
            </p>
          </section>

          {/* International Data Transfers */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">11. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. By using our Services, you consent to the transfer of your information to these countries.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-muted/50 p-6 rounded-lg">
              <p className="font-semibold mb-2">SmileDental Privacy Office</p>
              <p className="text-muted-foreground">Email: privacy@smiledental.com</p>
              <p className="text-muted-foreground">Phone: (555) 123-4567</p>
              <p className="text-muted-foreground">Address: 123 Dental Street, Healthcare City, HC 12345</p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="border-t pt-6">
            <p className="text-muted-foreground leading-relaxed">
              By using our Services, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
