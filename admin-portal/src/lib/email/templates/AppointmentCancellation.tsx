import React from 'react';

interface AppointmentCancellationProps {
  patientName: string;
  serviceName: string;
  providerName: string;
  appointmentDate: string;
  appointmentTime: string;
  cancellationReason?: string;
  patientUrl?: string;
}

export const AppointmentCancellation: React.FC<AppointmentCancellationProps> = ({
  patientName,
  serviceName,
  providerName,
  appointmentDate,
  appointmentTime,
  cancellationReason,
  patientUrl = 'http://localhost:3000',
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Appointment Cancelled</title>
      </head>
      <body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', padding: '30px', textAlign: 'center', borderRadius: '10px 10px 0 0' }}>
          <h1 style={{ color: 'white', margin: 0 }}>❌ Appointment Cancelled</h1>
        </div>
        
        <div style={{ background: '#f9f9f9', padding: '30px', borderRadius: '0 0 10px 10px' }}>
          <p style={{ fontSize: '16px' }}>Dear {patientName},</p>
          
          <p>Your appointment has been cancelled.</p>
          
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', margin: '20px 0', borderLeft: '4px solid #fa709a' }}>
            <h2 style={{ marginTop: 0, color: '#fa709a' }}>Cancelled Appointment</h2>
            <p><strong>Service:</strong> {serviceName}</p>
            <p><strong>Provider:</strong> {providerName}</p>
            <p><strong>Date:</strong> {appointmentDate}</p>
            <p><strong>Time:</strong> {appointmentTime}</p>
            {cancellationReason && <p><strong>Reason:</strong> {cancellationReason}</p>}
          </div>
          
          <p>If you have any questions or would like to book a new appointment, please contact us.</p>
          
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <a href={`${patientUrl}/booking`} 
               style={{ background: '#fa709a', color: 'white', padding: '12px 30px', textDecoration: 'none', borderRadius: '5px', display: 'inline-block' }}>
              Book New Appointment
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

export const AppointmentCancellationText = ({
  patientName,
  serviceName,
  providerName,
  appointmentDate,
  appointmentTime,
  cancellationReason,
  patientUrl = 'http://localhost:3000',
}: AppointmentCancellationProps): string => {
  return `
Appointment Cancelled

Dear ${patientName},

Your appointment has been cancelled.

Cancelled Appointment:
- Service: ${serviceName}
- Provider: ${providerName}
- Date: ${appointmentDate}
- Time: ${appointmentTime}
${cancellationReason ? `- Reason: ${cancellationReason}` : ''}

If you have any questions or would like to book a new appointment, please contact us.

Book new appointment: ${patientUrl}/booking

Smile Dental
  `.trim();
};
