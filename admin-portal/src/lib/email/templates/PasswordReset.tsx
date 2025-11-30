import React from 'react';

interface PasswordResetProps {
  name: string;
  resetLink: string;
}

export const PasswordReset: React.FC<PasswordResetProps> = ({
  name,
  resetLink,
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Reset Request</title>
      </head>
      <body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '30px', textAlign: 'center', borderRadius: '10px 10px 0 0' }}>
          <h1 style={{ color: 'white', margin: 0 }}>🔐 Password Reset Request</h1>
        </div>
        
        <div style={{ background: '#f9f9f9', padding: '30px', borderRadius: '0 0 10px 10px' }}>
          <p style={{ fontSize: '16px' }}>Dear {name},</p>
          
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <a href={resetLink} 
               style={{ background: '#f5576c', color: 'white', padding: '12px 30px', textDecoration: 'none', borderRadius: '5px', display: 'inline-block' }}>
              Reset Password
            </a>
          </div>
          
          <p style={{ fontSize: '14px', color: '#666' }}>
            This link will expire in 1 hour for security reasons.
          </p>
          
          <p style={{ fontSize: '14px', color: '#666' }}>
            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
          
          <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '30px' }}>
            Smile Dental
          </p>
        </div>
      </body>
    </html>
  );
};

export const PasswordResetText = ({
  name,
  resetLink,
}: PasswordResetProps): string => {
  return `
Password Reset Request

Dear ${name},

We received a request to reset your password. Click the link below to create a new password:

${resetLink}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

Smile Dental
  `.trim();
};
