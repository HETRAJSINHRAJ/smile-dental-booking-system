/**
 * GDPR Compliance - Data Export API
 * 
 * Allows users to export all their personal data in machine-readable format
 * as required by GDPR Article 20 (Right to Data Portability)
 */

import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { uploadToUploadcare } from '@/lib/uploadcare';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userEmail, userName } = body;

    if (!userId || !userEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Collect all user data from various collections
    const userData: any = {
      exportDate: new Date().toISOString(),
      userId,
      userEmail,
      userName,
      data: {},
    };

    // 1. User Profile
    try {
      const userDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', userId))
      );
      if (!userDoc.empty) {
        userData.data.profile = userDoc.docs[0].data();
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }

    // 2. Appointments
    try {
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('userId', '==', userId)
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      userData.data.appointments = appointmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }

    // 3. Payment Audit Logs
    try {
      const paymentsQuery = query(
        collection(db, 'payment_audit_logs'),
        where('patientId', '==', userId)
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);
      userData.data.payments = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching payment logs:', error);
    }

    // 4. Reviews
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('userId', '==', userId)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      userData.data.reviews = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }

    // 5. Notification Preferences
    try {
      const prefsDoc = await getDocs(
        query(collection(db, 'notificationPreferences'), where('userId', '==', userId))
      );
      if (!prefsDoc.empty) {
        userData.data.notificationPreferences = prefsDoc.docs[0].data();
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }

    // 6. Audit Logs (user's own actions)
    try {
      const auditQuery = query(
        collection(db, 'auditLogs'),
        where('userId', '==', userId)
      );
      const auditSnapshot = await getDocs(auditQuery);
      userData.data.auditLogs = auditSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }

    // Generate JSON file
    const jsonContent = JSON.stringify(userData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const file = new File([blob], `user-data-${userId}-${Date.now()}.json`, {
      type: 'application/json',
    });

    // Upload to Uploadcare for secure storage
    let downloadUrl: string;
    try {
      downloadUrl = await uploadToUploadcare(file);
    } catch (uploadError) {
      console.error('Error uploading to Uploadcare:', uploadError);
      // Fallback: return data directly if upload fails
      return NextResponse.json({
        success: true,
        data: userData,
        message: 'Data export completed. Download link could not be generated.',
      });
    }

    // Send email with download link
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromEmail = process.env.EMAIL_FROM || 'noreply@smiledental.com';
      const fromName = process.env.EMAIL_FROM_NAME || 'Smile Dental';
      
      await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: userEmail,
        subject: 'Your Data Export is Ready',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Your Data Export is Ready</h2>
            <p>Hello ${userName || 'there'},</p>
            <p>Your personal data export has been completed as requested. You can download your data using the link below:</p>
            <p style="margin: 30px 0;">
              <a href="${downloadUrl}" 
                 style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Download Your Data
              </a>
            </p>
            <p><strong>Important:</strong> This link will expire in 7 days for security reasons.</p>
            <p>The export includes:</p>
            <ul>
              <li>Your profile information</li>
              <li>Appointment history</li>
              <li>Payment records</li>
              <li>Reviews and ratings</li>
              <li>Notification preferences</li>
              <li>Activity logs</li>
            </ul>
            <p>If you did not request this export, please contact us immediately.</p>
            <p>Best regards,<br>The Dental Care Team</p>
          </div>
        `,
        text: `
Your Data Export is Ready

Hello ${userName || 'there'},

Your personal data export has been completed as requested. You can download your data using the link below:

${downloadUrl}

Important: This link will expire in 7 days for security reasons.

The export includes:
- Your profile information
- Appointment history
- Payment records
- Reviews and ratings
- Notification preferences
- Activity logs

If you did not request this export, please contact us immediately.

Best regards,
The Dental Care Team
        `,
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue even if email fails - user can still get the download link
    }

    return NextResponse.json({
      success: true,
      downloadUrl,
      message: 'Data export completed successfully. Check your email for the download link.',
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to export user data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
