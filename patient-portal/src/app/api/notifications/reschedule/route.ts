import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import emailService from '@/lib/email/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, oldDate, oldTime, newDate, newTime, rescheduledBy } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Fetch appointment details
    const appointmentDoc = await adminDb.collection('appointments').doc(appointmentId).get();
    
    if (!appointmentDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const appointment = appointmentDoc.data();

    // Send email to patient
    await emailService.sendAppointmentRescheduled({
      patientName: appointment?.userName || appointment?.patientName || 'Patient',
      patientEmail: appointment?.userEmail || appointment?.patientEmail || '',
      serviceName: appointment?.serviceName || '',
      providerName: appointment?.providerName || '',
      appointmentDate: newDate,
      appointmentTime: newTime,
      confirmationNumber: appointment?.confirmationNumber,
      appointmentId: appointmentId,
      oldDate: oldDate,
      oldTime: oldTime,
      rescheduledBy: rescheduledBy || 'patient',
    });

    // Send notification to admin (optional - could be implemented later)
    // This could send an email to admin or create a notification in the system

    return NextResponse.json({
      success: true,
      message: 'Reschedule notifications sent successfully',
    });
  } catch (error) {
    console.error('Error sending reschedule notifications:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send notifications' 
      },
      { status: 500 }
    );
  }
}
