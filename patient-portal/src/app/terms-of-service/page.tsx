'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last Updated: November 18, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-card border rounded-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to SmileDental. These Terms of Service ("Terms") govern your access to and use of our dental booking platform, including our website and mobile application (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              If you do not agree to these Terms, you may not access or use our Services. We reserve the right to modify these Terms at any time, and your continued use of the Services constitutes acceptance of any changes.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              To use our Services, you must:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Be at least 18 years of age or have parental/guardian consent</li>
              <li>Have the legal capacity to enter into a binding agreement</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Not be prohibited from using the Services under applicable law</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Parents or legal guardians may create accounts on behalf of minors and are responsible for all activities under such accounts.
            </p>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Account Registration and Security</h2>
            
            <h3 className="text-xl font-semibold mb-3">3.1 Account Creation</h3>
            <p className="text-muted-foreground leading-relaxed">
              To access certain features of our Services, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.2 Account Security</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access or security breach</li>
              <li>Ensuring you log out from your account at the end of each session</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.3 Account Termination</h3>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or any other reason at our sole discretion. You may also request account deletion at any time through your account settings or by contacting us.
            </p>
          </section>

          {/* Booking and Appointments */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Booking and Appointments</h2>
            
            <h3 className="text-xl font-semibold mb-3">4.1 Appointment Booking</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our Services allow you to book dental appointments with healthcare providers. By booking an appointment, you agree to attend the scheduled appointment or provide timely notice of cancellation.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Appointment Confirmation</h3>
            <p className="text-muted-foreground leading-relaxed">
              All appointments are subject to confirmation by the dental provider. We will notify you of the confirmation status via email, SMS, or push notification. An appointment is not confirmed until you receive confirmation from us.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.3 Rescheduling</h3>
            <p className="text-muted-foreground leading-relaxed">
              You may reschedule your appointment up to 2 times. Rescheduling requests must be made at least 24 hours before the scheduled appointment time. Additional rescheduling may be subject to approval by the dental provider.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.4 No-Show Policy</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you fail to attend a scheduled appointment without prior cancellation, your appointment will be marked as a "no-show." Repeated no-shows may result in restrictions on future bookings or account suspension.
            </p>
          </section>

          {/* Cancellation and Refund Policy */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Cancellation and Refund Policy</h2>
            
            <h3 className="text-xl font-semibold mb-3">5.1 Cancellation by Patient</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You may cancel your appointment according to the following terms:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>More than 24 hours before appointment:</strong> Full refund of reservation fee (minus payment processing fees)</li>
              <li><strong>Less than 24 hours before appointment:</strong> 50% refund of reservation fee</li>
              <li><strong>Less than 2 hours before appointment:</strong> No refund</li>
              <li><strong>No-show:</strong> No refund and may result in booking restrictions</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">5.2 Cancellation by Provider</h3>
            <p className="text-muted-foreground leading-relaxed">
              If the dental provider cancels your appointment for any reason, you will receive a full refund of any fees paid, including the reservation fee. We will make reasonable efforts to reschedule your appointment at a convenient time.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">5.3 Refund Processing</h3>
            <p className="text-muted-foreground leading-relaxed">
              Approved refunds will be processed within 5-7 business days to the original payment method. You will receive an email confirmation once the refund has been initiated. Please allow additional time for your financial institution to process the refund.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">5.4 Service Payment Refunds</h3>
            <p className="text-muted-foreground leading-relaxed">
              Service payments made at the clinic (for the actual dental treatment) are subject to the provider's refund policy. Please contact the dental provider directly for service payment refunds.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">5.5 Disputed Charges</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you believe you have been charged incorrectly, please contact our support team within 30 days of the charge. We will investigate and resolve the issue promptly.
            </p>
          </section>

          {/* Payment Terms */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Payment Terms</h2>
            
            <h3 className="text-xl font-semibold mb-3">6.1 Reservation Fee</h3>
            <p className="text-muted-foreground leading-relaxed">
              A non-refundable reservation fee is required to book an appointment. This fee secures your appointment slot and is separate from the service payment for the actual dental treatment.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">6.2 Service Payment</h3>
            <p className="text-muted-foreground leading-relaxed">
              The service payment for the dental treatment is due at the time of your appointment and is paid directly to the dental provider. Payment methods accepted at the clinic include cash, credit/debit card, and UPI.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">6.3 Payment Processing</h3>
            <p className="text-muted-foreground leading-relaxed">
              All online payments are processed securely through our third-party payment processor, Razorpay. We do not store your complete payment card information on our servers.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">6.4 Pricing and Fees</h3>
            <p className="text-muted-foreground leading-relaxed">
              All prices displayed on our Services are in Indian Rupees (INR) and include applicable taxes (GST at 18%). We reserve the right to change our pricing at any time, but price changes will not affect appointments already booked.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">6.5 Failed Payments</h3>
            <p className="text-muted-foreground leading-relaxed">
              If a payment fails, your appointment will not be confirmed. You may retry the payment or contact our support team for assistance. Repeated payment failures may result in temporary booking restrictions.
            </p>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">7. User Responsibilities and Conduct</h2>
            
            <h3 className="text-xl font-semibold mb-3">7.1 Accurate Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              You agree to provide accurate, current, and complete information when using our Services, including your medical history, contact information, and payment details. Providing false or misleading information may result in account termination.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">7.2 Prohibited Conduct</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Use the Services for any illegal or unauthorized purpose</li>
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Interfere with or disrupt the Services or servers</li>
              <li>Attempt to gain unauthorized access to any part of the Services</li>
              <li>Use automated systems (bots, scrapers) to access the Services</li>
              <li>Transmit viruses, malware, or other harmful code</li>
              <li>Harass, abuse, or harm other users or healthcare providers</li>
              <li>Post false, defamatory, or misleading reviews</li>
              <li>Collect or harvest user information without consent</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">7.3 Reviews and Ratings</h3>
            <p className="text-muted-foreground leading-relaxed">
              You may submit reviews and ratings for healthcare providers after completing an appointment. All reviews must be honest, accurate, and based on your personal experience. We reserve the right to remove reviews that violate our content guidelines, including reviews that are defamatory, offensive, or fraudulent.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">7.4 Communication</h3>
            <p className="text-muted-foreground leading-relaxed">
              You agree to communicate respectfully with healthcare providers, staff, and other users. Abusive, threatening, or inappropriate communication may result in account suspension or termination.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property Rights</h2>
            
            <h3 className="text-xl font-semibold mb-3">8.1 Our Content</h3>
            <p className="text-muted-foreground leading-relaxed">
              All content on our Services, including text, graphics, logos, images, software, and design, is the property of SmileDental or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">8.2 User Content</h3>
            <p className="text-muted-foreground leading-relaxed">
              By submitting content to our Services (such as reviews, comments, or profile information), you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display such content in connection with operating and promoting the Services.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">8.3 Trademarks</h3>
            <p className="text-muted-foreground leading-relaxed">
              "SmileDental" and our logo are trademarks of SmileDental. You may not use our trademarks without our prior written consent.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Third-Party Services and Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Services may contain links to third-party websites or services that are not owned or controlled by us. We are not responsible for the content, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that we shall not be liable for any damage or loss caused by your use of any third-party services.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We use third-party service providers to facilitate our Services, including payment processing (Razorpay), email notifications (Resend), SMS notifications (Twilio), and analytics (Google Analytics). Your use of these services is subject to their respective terms and privacy policies.
            </p>
          </section>

          {/* Disclaimers and Limitations */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Disclaimers and Limitations of Liability</h2>
            
            <h3 className="text-xl font-semibold mb-3">10.1 Service Availability</h3>
            <p className="text-muted-foreground leading-relaxed">
              We strive to provide reliable and uninterrupted Services, but we do not guarantee that the Services will be available at all times or free from errors. We may suspend or discontinue the Services at any time for maintenance, updates, or other reasons.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">10.2 Medical Disclaimer</h3>
            <p className="text-muted-foreground leading-relaxed">
              SmileDental is a booking platform that connects patients with dental healthcare providers. We do not provide medical advice, diagnosis, or treatment. All medical decisions should be made in consultation with qualified healthcare professionals. We are not responsible for the quality of care provided by healthcare providers listed on our platform.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">10.3 "As Is" Basis</h3>
            <p className="text-muted-foreground leading-relaxed">
              THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">10.4 Limitation of Liability</h3>
            <p className="text-muted-foreground leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SMILEDENTAL SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-3">
              <li>Your use or inability to use the Services</li>
              <li>Any unauthorized access to or use of our servers or your personal information</li>
              <li>Any interruption or cessation of the Services</li>
              <li>Any bugs, viruses, or other harmful code transmitted through the Services</li>
              <li>Any errors or omissions in any content or for any loss or damage incurred as a result of your use of any content</li>
              <li>The conduct or content of any third party on the Services</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL DAMAGES EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE LIABILITY, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify, defend, and hold harmless SmileDental, its affiliates, officers, directors, employees, agents, and licensors from and against any claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-3">
              <li>Your use or misuse of the Services</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your violation of any applicable laws or regulations</li>
              <li>Any content you submit or transmit through the Services</li>
            </ul>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Dispute Resolution</h2>
            
            <h3 className="text-xl font-semibold mb-3">12.1 Informal Resolution</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you have any dispute with us, you agree to first contact us at support@smiledental.com and attempt to resolve the dispute informally. We will work with you in good faith to resolve any issues.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">12.2 Arbitration Agreement</h3>
            <p className="text-muted-foreground leading-relaxed">
              If we cannot resolve a dispute informally, you agree that any dispute, claim, or controversy arising out of or relating to these Terms or the Services shall be settled by binding arbitration in accordance with the Arbitration and Conciliation Act, 1996 of India. The arbitration shall be conducted in English in Mumbai, India, by a single arbitrator appointed by mutual agreement.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">12.3 Class Action Waiver</h3>
            <p className="text-muted-foreground leading-relaxed">
              You agree that any arbitration or proceeding shall be limited to the dispute between you and us individually. To the full extent permitted by law, no arbitration or proceeding shall be joined with any other, no dispute shall be arbitrated on a class-action basis, and you waive any right to participate in a class-action lawsuit or class-wide arbitration.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">12.4 Governing Law</h3>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. The courts of Mumbai, India shall have exclusive jurisdiction over any disputes not subject to arbitration.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">12.5 Time Limitation</h3>
            <p className="text-muted-foreground leading-relaxed">
              You agree that any claim or cause of action arising out of or related to the Services must be filed within one (1) year after such claim or cause of action arose, or it shall be forever barred.
            </p>
          </section>

          {/* Modifications to Terms */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Modifications to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the updated Terms on this page and updating the "Last Updated" date. Your continued use of the Services after any changes constitutes your acceptance of the new Terms.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              If you do not agree to the modified Terms, you must stop using the Services and may request account deletion.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Termination</h2>
            
            <h3 className="text-xl font-semibold mb-3">14.1 Termination by You</h3>
            <p className="text-muted-foreground leading-relaxed">
              You may terminate your account at any time by contacting us or using the account deletion feature in your account settings. Upon termination, you will lose access to your account and any associated data.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">14.2 Termination by Us</h3>
            <p className="text-muted-foreground leading-relaxed">
              We may suspend or terminate your account at any time, with or without notice, for any reason, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-3">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Repeated no-shows or cancellations</li>
              <li>Abusive behavior toward staff or providers</li>
              <li>Inactivity for an extended period</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">14.3 Effect of Termination</h3>
            <p className="text-muted-foreground leading-relaxed">
              Upon termination, your right to use the Services will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          {/* General Provisions */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">15. General Provisions</h2>
            
            <h3 className="text-xl font-semibold mb-3">15.1 Entire Agreement</h3>
            <p className="text-muted-foreground leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and SmileDental regarding the Services and supersede all prior agreements and understandings.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">15.2 Severability</h3>
            <p className="text-muted-foreground leading-relaxed">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">15.3 Waiver</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">15.4 Assignment</h3>
            <p className="text-muted-foreground leading-relaxed">
              You may not assign or transfer these Terms or your account without our prior written consent. We may assign or transfer these Terms without restriction.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">15.5 Force Majeure</h3>
            <p className="text-muted-foreground leading-relaxed">
              We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including acts of God, natural disasters, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, pandemics, strikes, or shortages of transportation, facilities, fuel, energy, labor, or materials.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">15.6 Language</h3>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are written in English. Any translations are provided for convenience only. In the event of any conflict between the English version and a translated version, the English version shall prevail.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">16. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have any questions, concerns, or feedback regarding these Terms of Service, please contact us:
            </p>
            <div className="bg-muted/50 p-6 rounded-lg">
              <p className="font-semibold mb-2">SmileDental Support</p>
              <p className="text-muted-foreground">Email: support@smiledental.com</p>
              <p className="text-muted-foreground">Phone: (555) 123-4567</p>
              <p className="text-muted-foreground">Address: 123 Dental Street, Healthcare City, HC 12345</p>
              <p className="text-muted-foreground mt-3">Business Hours: Monday - Friday, 9:00 AM - 6:00 PM IST</p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="border-t pt-6">
            <p className="text-muted-foreground leading-relaxed font-medium">
              By creating an account and using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
