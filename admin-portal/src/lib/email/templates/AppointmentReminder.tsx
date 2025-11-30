import React from 'react';

interface AppointmentReminderProps {
  patientName: string;
  serviceName: string;
  providerName: string;
  appointmentDate: string;
  appointmentTime: string;
  patientUrl?: string;
}

export const AppointmentReminder: React.FC<AppointmentReminderProps> = ({
  patientName,
  serviceName,
  providerName,
  appointmentDate,
  appointmentTime,
  patientUrl = 'http://localhost:3000',
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Appointment Reminder</title>
      </head>
      <body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '30px', textAlign: 'center', borderRadius: '10px 10px 0 0' }}>
          <h1 style={{ color: 'white', margin: 0 }}>⏰ Appointment Reminder</h1>
        </div>
        
        <div style={{ background: '#f9f9f9', padding: '30px', borderRadius: '0 0 10px 10px' }}>
          <p style={{ fontSize: '16px' }}>Dear {patientName},</p>
          
          <p>This is a friendly reminder about your appointment <strong>tomorrow</strong>.</p>
          
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', margin: '20px 0', borderLeft: '4px solid #f5576c' }}>
            <h2 style={{ marginTop: 0, color: '#f5576c' }}>Appointment Details</h2>
            <p><strong>Service:</strong> {serviceName}</p>
            <p><strong>Provider:</strong> {providerName}</p>
            <p><strong>Date:</strong> {appointmentDate}</p>
            <p><strong>Time:</strong> {appointmentTime}</p>
          </div>
          
          <p style={{ fontSize: '14px', color: '#666' }}>
            <strong>Need to reschedule?</strong> Please contact us at least 24 hours in advance.
          </p>
          
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <a href={`${patientUrl}/dashboard`} 
               style={{ background: '#f5576c', color: 'white', padding: '12px 30px', textDecoration: 'none', borderRadius: '5px', display: 'inline-block' }}>
              View Appointment
            </a>
          </div>
          
          <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '30px' }}>
            Smile Dental
          </p>
        </div>
      </body>
    </html>
  );
};

export const AppointmentReminderText = ({
  patientName,
  serviceName,
  providerName,
  appointmentDate,
  appointmentTime,
  patientUrl = 'http://localhost:3000',
}: AppointmentReminderProps): string => {
  return `
Appointment Reminder

Dear ${patientName},

This is a friendly reminder about your appointment tomorrow.

Appointment Details:
- Service: ${serviceName}
- Provider: ${providerName}
- Date: ${appointmentDate}
- Time: ${appointmentTime}

Need to reschedule? Please contact us at least 24 hours in advance.

View your appointment: ${patientUrl}/dashboard

Smile Dental
  `.trim();
};
