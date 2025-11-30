import React from 'react';

interface PaymentReceiptProps {
  patientName: string;
  serviceName: string;
  amount: number;
  transactionId: string;
  receiptUrl?: string;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  patientName,
  serviceName,
  amount,
  transactionId,
  receiptUrl,
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Payment Receipt</title>
      </head>
      <body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '30px', textAlign: 'center', borderRadius: '10px 10px 0 0' }}>
          <h1 style={{ color: 'white', margin: 0 }}>💳 Payment Receipt</h1>
        </div>
        
        <div style={{ background: '#f9f9f9', padding: '30px', borderRadius: '0 0 10px 10px' }}>
          <p style={{ fontSize: '16px' }}>Dear {patientName},</p>
          
          <p>Thank you for your payment. Your transaction was successful.</p>
          
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', margin: '20px 0', borderLeft: '4px solid #4facfe' }}>
            <h2 style={{ marginTop: 0, color: '#4facfe' }}>Payment Details</h2>
            <p><strong>Amount Paid:</strong> ₹{amount.toFixed(2)}</p>
            <p><strong>Service:</strong> {serviceName}</p>
            <p><strong>Transaction ID:</strong> {transactionId}</p>
          </div>
          
          {receiptUrl && (
            <div style={{ textAlign: 'center', margin: '30px 0' }}>
              <a href={receiptUrl} 
                 style={{ background: '#4facfe', color: 'white', padding: '12px 30px', textDecoration: 'none', borderRadius: '5px', display: 'inline-block' }}>
                Download Receipt PDF
              </a>
            </div>
          )}
          
          <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '30px' }}>
            Smile Dental
          </p>
        </div>
      </body>
    </html>
  );
};

export const PaymentReceiptText = ({
  patientName,
  serviceName,
  amount,
  transactionId,
  receiptUrl,
}: PaymentReceiptProps): string => {
  return `
Payment Receipt

Dear ${patientName},

Thank you for your payment. Your transaction was successful.

Payment Details:
- Amount Paid: ₹${amount.toFixed(2)}
- Service: ${serviceName}
- Transaction ID: ${transactionId}

${receiptUrl ? `Download receipt: ${receiptUrl}` : ''}

Smile Dental
  `.trim();
};
