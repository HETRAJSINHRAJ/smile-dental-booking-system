import React from 'react';

interface AppointmentConfirmationProps {
  patientName: string;
  serviceName: string;
  providerName: string;
  appointmentDate: string;
  appointmentTime: string;
  confirmationNumber?: string;
  patientUrl?: string;
}

export const AppointmentConfirmation: React.FC<AppointmentConfirmationProps> = ({
  patientName,
  serviceName,
  providerName,
  appointmentDate,
  appointmentTime,
  confirmationNumber,
  patientUrl = 'http://localhost:3000',
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Appointment Confirmed</title>
      </head>
      <body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '30px', textAlign: 'center', borderRadius: '10px 10px 0 0' }}>
          <h1 style={{ color: 'white', margin: 0 }}>✅ Appointment Confirmed</h1>
        </div>
        
        <div style={{ background: '#f9f9f9', padding: '30px', borderRadius: '0 0 10px 10px' }}>
          <p style={{ fontSize: '16px' }}>Dear {patientName},</p>
          
          <p>Your appointment has been confirmed! We look forward to seeing you.</p>
          
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', margin: '20px 0', borderLeft: '4px solid #667eea' }}>
            <h2 style={{ marginTop: 0, color: '#667eea' }}>Appointment Details</h2>
            <p><strong>Service:</strong> {serviceName}</p>
            <p><strong>Provider:</strong> {providerName}</p>
            <p><strong>Date:</strong> {appointmentDate}</p>
            <p><strong>Time:</strong> {appointmentTime}</p>
            {confirmationNumber && <p><strong>Confirmation #:</strong> {confirmationNumber}</p>}
          </div>
          
          <p style={{ fontSize: '14px', color: '#666' }}>
            <strong>Important:</strong> Please arrive 10 minutes early for check-in.
          </p>
          
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <a href={`${patientUrl}/dashboard`} 
               style={{ background: '#667eea', color: 'white', padding: '12px 30px', textDecoration: 'none', borderRadius: '5px', display: 'inline-block' }}>
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

export const AppointmentConfirmationText = ({
  patientName,
  serviceName,
  providerName,
  appointmentDate,
  appointmentTime,
  confirmationNumber,
  patientUrl = 'http://localhost:3000',
}: AppointmentConfirmationProps): string => {
  return `
Appointment Confirmed

Dear ${patientName},

Your appointment has been confirmed!

Appointment Details:
- Service: ${serviceName}
- Provider: ${providerName}
- Date: ${appointmentDate}
- Time: ${appointmentTime}
${confirmationNumber ? `- Confirmation #: ${confirmationNumber}` : ''}

Please arrive 10 minutes early for check-in.

View your appointment: ${patientUrl}/dashboard

Smile Dental
  `.trim();
};
