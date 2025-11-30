import React from 'react';

interface WelcomeEmailProps {
  name: string;
  patientUrl?: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  name,
  patientUrl = 'http://localhost:3000',
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to Smile Dental</title>
      </head>
      <body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '30px', textAlign: 'center', borderRadius: '10px 10px 0 0' }}>
          <h1 style={{ color: 'white', margin: 0 }}>🦷 Welcome to Smile Dental!</h1>
        </div>
        
        <div style={{ background: '#f9f9f9', padding: '30px', borderRadius: '0 0 10px 10px' }}>
          <p style={{ fontSize: '16px' }}>Dear {name},</p>
          
          <p>Welcome to Smile Dental! We're excited to have you as part of our dental family.</p>
          
          <p>With your account, you can:</p>
          <ul>
            <li>Book appointments online 24/7</li>
            <li>View your appointment history</li>
            <li>Manage your profile and medical history</li>
            <li>Receive appointment reminders</li>
            <li>Access payment receipts</li>
          </ul>
          
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <a href={`${patientUrl}/booking`} 
               style={{ background: '#667eea', color: 'white', padding: '12px 30px', textDecoration: 'none', borderRadius: '5px', display: 'inline-block' }}>
              Book Your First Appointment
            </a>
          </div>
          
          <p>If you have any questions, feel free to contact us anytime.</p>
          
          <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '30px' }}>
            Smile Dental
          </p>
        </div>
      </body>
    </html>
  );
};

export const WelcomeEmailText = ({
  name,
  patientUrl = 'http://localhost:3000',
}: WelcomeEmailProps): string => {
  return `
Welcome to Smile Dental!

Dear ${name},

Welcome to Smile Dental! We're excited to have you as part of our dental family.

With your account, you can:
- Book appointments online 24/7
- View your appointment history
- Manage your profile and medical history
- Receive appointment reminders
- Access payment receipts

Book your first appointment: ${patientUrl}/booking

If you have any questions, feel free to contact us anytime.

Smile Dental
  `.trim();
};
