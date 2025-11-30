/**
 * Hindi Email Templates
 * All email templates translated to Hindi for Indian users
 */

import { AppointmentEmailData, PaymentEmailData } from '../emailService';

export class HindiEmailTemplates {
  private fromName: string;
  private patientUrl: string;

  constructor(fromName: string, patientUrl: string) {
    this.fromName = fromName;
    this.patientUrl = patientUrl;
  }

  // ==================== APPOINTMENT CONFIRMATION ====================

  getAppointmentConfirmationHTML(data: AppointmentEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">✅ अपॉइंटमेंट की पुष्टि हो गई</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">प्रिय ${data.patientName},</p>
    
    <p>आपकी अपॉइंटमेंट की पुष्टि हो गई है! हम आपसे मिलने के लिए उत्सुक हैं।</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="margin-top: 0; color: #667eea;">अपॉइंटमेंट विवरण</h2>
      <p><strong>सेवा:</strong> ${data.serviceName}</p>
      <p><strong>डॉक्टर:</strong> ${data.providerName}</p>
      <p><strong>तारीख:</strong> ${data.appointmentDate}</p>
      <p><strong>समय:</strong> ${data.appointmentTime}</p>
      ${data.confirmationNumber ? `<p><strong>पुष्टि संख्या:</strong> ${data.confirmationNumber}</p>` : ''}
    </div>
    
    <p style="font-size: 14px; color: #666;">
      <strong>महत्वपूर्ण:</strong> कृपया चेक-इन के लिए 10 मिनट पहले पहुंचें।
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${this.patientUrl}/dashboard" 
         style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        अपॉइंटमेंट देखें
      </a>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
      ${this.fromName}
    </p>
  </div>
</body>
</html>
    `;
  }

  getAppointmentConfirmationText(data: AppointmentEmailData): string {
    return `
अपॉइंटमेंट की पुष्टि हो गई

प्रिय ${data.patientName},

आपकी अपॉइंटमेंट की पुष्टि हो गई है!

अपॉइंटमेंट विवरण:
- सेवा: ${data.serviceName}
- डॉक्टर: ${data.providerName}
- तारीख: ${data.appointmentDate}
- समय: ${data.appointmentTime}
${data.confirmationNumber ? `- पुष्टि संख्या: ${data.confirmationNumber}` : ''}

कृपया चेक-इन के लिए 10 मिनट पहले पहुंचें।

अपनी अपॉइंटमेंट देखें: ${this.patientUrl}/dashboard

${this.fromName}
    `.trim();
  }

  // ==================== APPOINTMENT REMINDER ====================

  getAppointmentReminderHTML(data: AppointmentEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">⏰ अपॉइंटमेंट रिमाइंडर</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">प्रिय ${data.patientName},</p>
    
    <p>यह आपकी <strong>कल</strong> की अपॉइंटमेंट की एक अनुकूल रिमाइंडर है।</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5576c;">
      <h2 style="margin-top: 0; color: #f5576c;">अपॉइंटमेंट विवरण</h2>
      <p><strong>सेवा:</strong> ${data.serviceName}</p>
      <p><strong>डॉक्टर:</strong> ${data.providerName}</p>
      <p><strong>तारीख:</strong> ${data.appointmentDate}</p>
      <p><strong>समय:</strong> ${data.appointmentTime}</p>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      <strong>रीशेड्यूल करना चाहते हैं?</strong> कृपया कम से कम 24 घंटे पहले हमसे संपर्क करें।
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${this.patientUrl}/dashboard" 
         style="background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        अपॉइंटमेंट देखें
      </a>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
      ${this.fromName}
    </p>
  </div>
</body>
</html>
    `;
  }

  getAppointmentReminderText(data: AppointmentEmailData): string {
    return `
अपॉइंटमेंट रिमाइंडर

प्रिय ${data.patientName},

यह आपकी कल की अपॉइंटमेंट की एक अनुकूल रिमाइंडर है।

अपॉइंटमेंट विवरण:
- सेवा: ${data.serviceName}
- डॉक्टर: ${data.providerName}
- तारीख: ${data.appointmentDate}
- समय: ${data.appointmentTime}

रीशेड्यूल करना चाहते हैं? कृपया कम से कम 24 घंटे पहले हमसे संपर्क करें।

अपनी अपॉइंटमेंट देखें: ${this.patientUrl}/dashboard

${this.fromName}
    `.trim();
  }

  // ==================== APPOINTMENT CANCELLATION ====================

  getAppointmentCancellationHTML(data: AppointmentEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">❌ अपॉइंटमेंट रद्द हो गई</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">प्रिय ${data.patientName},</p>
    
    <p>आपकी अपॉइंटमेंट रद्द कर दी गई है।</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fa709a;">
      <h2 style="margin-top: 0; color: #fa709a;">रद्द की गई अपॉइंटमेंट</h2>
      <p><strong>सेवा:</strong> ${data.serviceName}</p>
      <p><strong>डॉक्टर:</strong> ${data.providerName}</p>
      <p><strong>तारीख:</strong> ${data.appointmentDate}</p>
      <p><strong>समय:</strong> ${data.appointmentTime}</p>
      ${data.cancellationReason ? `<p><strong>कारण:</strong> ${data.cancellationReason}</p>` : ''}
    </div>
    
    <p>यदि आपके कोई प्रश्न हैं या आप नई अपॉइंटमेंट बुक करना चाहते हैं, तो कृपया हमसे संपर्क करें।</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${this.patientUrl}/booking" 
         style="background: #fa709a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        नई अपॉइंटमेंट बुक करें
      </a>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
      ${this.fromName}
    </p>
  </div>
</body>
</html>
    `;
  }

  getAppointmentCancellationText(data: AppointmentEmailData): string {
    return `
अपॉइंटमेंट रद्द हो गई

प्रिय ${data.patientName},

आपकी अपॉइंटमेंट रद्द कर दी गई है।

रद्द की गई अपॉइंटमेंट:
- सेवा: ${data.serviceName}
- डॉक्टर: ${data.providerName}
- तारीख: ${data.appointmentDate}
- समय: ${data.appointmentTime}
${data.cancellationReason ? `- कारण: ${data.cancellationReason}` : ''}

यदि आपके कोई प्रश्न हैं या आप नई अपॉइंटमेंट बुक करना चाहते हैं, तो कृपया हमसे संपर्क करें।

नई अपॉइंटमेंट बुक करें: ${this.patientUrl}/booking

${this.fromName}
    `.trim();
  }

  // ==================== APPOINTMENT RESCHEDULED ====================

  getAppointmentRescheduledHTML(data: AppointmentEmailData & { 
    oldDate: string; 
    oldTime: string;
    rescheduledBy: 'patient' | 'admin';
  }): string {
    const rescheduledByText = data.rescheduledBy === 'admin' 
      ? 'हमारे क्लिनिक स्टाफ द्वारा' 
      : 'आपके अनुरोध के अनुसार';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">🔄 अपॉइंटमेंट रीशेड्यूल हो गई</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">प्रिय ${data.patientName},</p>
    
    <p>आपकी अपॉइंटमेंट ${rescheduledByText} रीशेड्यूल कर दी गई है।</p>
    
    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <h3 style="margin-top: 0; color: #856404;">पिछली अपॉइंटमेंट</h3>
      <p style="margin: 5px 0;"><strong>तारीख:</strong> ${data.oldDate}</p>
      <p style="margin: 5px 0;"><strong>समय:</strong> ${data.oldTime}</p>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="margin-top: 0; color: #667eea;">नई अपॉइंटमेंट विवरण</h2>
      <p><strong>सेवा:</strong> ${data.serviceName}</p>
      <p><strong>डॉक्टर:</strong> ${data.providerName}</p>
      <p><strong>तारीख:</strong> ${data.appointmentDate}</p>
      <p><strong>समय:</strong> ${data.appointmentTime}</p>
      ${data.confirmationNumber ? `<p><strong>पुष्टि संख्या:</strong> ${data.confirmationNumber}</p>` : ''}
    </div>
    
    <p style="font-size: 14px; color: #666;">
      <strong>महत्वपूर्ण:</strong> कृपया चेक-इन के लिए 10 मिनट पहले पहुंचें।
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${this.patientUrl}/dashboard" 
         style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        अपॉइंटमेंट देखें
      </a>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
      ${this.fromName}
    </p>
  </div>
</body>
</html>
    `;
  }

  getAppointmentRescheduledText(data: AppointmentEmailData & { 
    oldDate: string; 
    oldTime: string;
    rescheduledBy: 'patient' | 'admin';
  }): string {
    const rescheduledByText = data.rescheduledBy === 'admin' 
      ? 'हमारे क्लिनिक स्टाफ द्वारा' 
      : 'आपके अनुरोध के अनुसार';

    return `
अपॉइंटमेंट रीशेड्यूल हो गई

प्रिय ${data.patientName},

आपकी अपॉइंटमेंट ${rescheduledByText} रीशेड्यूल कर दी गई है।

पिछली अपॉइंटमेंट:
- तारीख: ${data.oldDate}
- समय: ${data.oldTime}

नई अपॉइंटमेंट विवरण:
- सेवा: ${data.serviceName}
- डॉक्टर: ${data.providerName}
- तारीख: ${data.appointmentDate}
- समय: ${data.appointmentTime}
${data.confirmationNumber ? `- पुष्टि संख्या: ${data.confirmationNumber}` : ''}

कृपया चेक-इन के लिए 10 मिनट पहले पहुंचें।

अपनी अपॉइंटमेंट देखें: ${this.patientUrl}/dashboard

${this.fromName}
    `.trim();
  }

  // ==================== PAYMENT RECEIPT ====================

  getPaymentReceiptHTML(data: PaymentEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">💳 भुगतान रसीद</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">प्रिय ${data.patientName},</p>
    
    <p>आपके भुगतान के लिए धन्यवाद। आपका लेनदेन सफल रहा।</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4facfe;">
      <h2 style="margin-top: 0; color: #4facfe;">भुगतान विवरण</h2>
      <p><strong>भुगतान की गई राशि:</strong> ₹${data.amount.toFixed(2)}</p>
      <p><strong>सेवा:</strong> ${data.serviceName}</p>
      <p><strong>लेनदेन आईडी:</strong> ${data.transactionId}</p>
    </div>
    
    ${data.receiptUrl ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.receiptUrl}" 
         style="background: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        रसीद PDF डाउनलोड करें
      </a>
    </div>
    ` : ''}
    
    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
      ${this.fromName}
    </p>
  </div>
</body>
</html>
    `;
  }

  getPaymentReceiptText(data: PaymentEmailData): string {
    return `
भुगतान रसीद

प्रिय ${data.patientName},

आपके भुगतान के लिए धन्यवाद। आपका लेनदेन सफल रहा।

भुगतान विवरण:
- भुगतान की गई राशि: ₹${data.amount.toFixed(2)}
- सेवा: ${data.serviceName}
- लेनदेन आईडी: ${data.transactionId}

${data.receiptUrl ? `रसीद डाउनलोड करें: ${data.receiptUrl}` : ''}

${this.fromName}
    `.trim();
  }

  // ==================== WELCOME EMAIL ====================

  getWelcomeHTML(name: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">🦷 ${this.fromName} में आपका स्वागत है!</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">प्रिय ${name},</p>
    
    <p>${this.fromName} में आपका स्वागत है! हम आपको अपने डेंटल परिवार का हिस्सा बनाकर खुश हैं।</p>
    
    <p>अपने खाते के साथ, आप कर सकते हैं:</p>
    <ul>
      <li>24/7 ऑनलाइन अपॉइंटमेंट बुक करें</li>
      <li>अपनी अपॉइंटमेंट हिस्ट्री देखें</li>
      <li>अपनी प्रोफाइल और मेडिकल हिस्ट्री प्रबंधित करें</li>
      <li>अपॉइंटमेंट रिमाइंडर प्राप्त करें</li>
      <li>भुगतान रसीदें एक्सेस करें</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${this.patientUrl}/booking" 
         style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        अपनी पहली अपॉइंटमेंट बुक करें
      </a>
    </div>
    
    <p>यदि आपके कोई प्रश्न हैं, तो कभी भी हमसे संपर्क करें।</p>
    
    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
      ${this.fromName}
    </p>
  </div>
</body>
</html>
    `;
  }

  getWelcomeText(name: string): string {
    return `
${this.fromName} में आपका स्वागत है!

प्रिय ${name},

${this.fromName} में आपका स्वागत है! हम आपको अपने डेंटल परिवार का हिस्सा बनाकर खुश हैं।

अपने खाते के साथ, आप कर सकते हैं:
- 24/7 ऑनलाइन अपॉइंटमेंट बुक करें
- अपनी अपॉइंटमेंट हिस्ट्री देखें
- अपनी प्रोफाइल और मेडिकल हिस्ट्री प्रबंधित करें
- अपॉइंटमेंट रिमाइंडर प्राप्त करें
- भुगतान रसीदें एक्सेस करें

अपनी पहली अपॉइंटमेंट बुक करें: ${this.patientUrl}/booking

यदि आपके कोई प्रश्न हैं, तो कभी भी हमसे संपर्क करें।

${this.fromName}
    `.trim();
  }

  // ==================== PASSWORD RESET ====================

  getPasswordResetHTML(name: string, resetLink: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">🔐 पासवर्ड रीसेट अनुरोध</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">प्रिय ${name},</p>
    
    <p>हमें आपका पासवर्ड रीसेट करने का अनुरोध मिला है। नया पासवर्ड बनाने के लिए नीचे दिए गए बटन पर क्लिक करें:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" 
         style="background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        पासवर्ड रीसेट करें
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      सुरक्षा कारणों से यह लिंक 1 घंटे में समाप्त हो जाएगा।
    </p>
    
    <p style="font-size: 14px; color: #666;">
      यदि आपने पासवर्ड रीसेट का अनुरोध नहीं किया है, तो आप इस ईमेल को सुरक्षित रूप से अनदेखा कर सकते हैं। आपका पासवर्ड अपरिवर्तित रहेगा।
    </p>
    
    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
      ${this.fromName}
    </p>
  </div>
</body>
</html>
    `;
  }

  getPasswordResetText(name: string, resetLink: string): string {
    return `
पासवर्ड रीसेट अनुरोध

प्रिय ${name},

हमें आपका पासवर्ड रीसेट करने का अनुरोध मिला है। नया पासवर्ड बनाने के लिए नीचे दिए गए लिंक पर क्लिक करें:

${resetLink}

सुरक्षा कारणों से यह लिंक 1 घंटे में समाप्त हो जाएगा।

यदि आपने पासवर्ड रीसेट का अनुरोध नहीं किया है, तो आप इस ईमेल को सुरक्षित रूप से अनदेखा कर सकते हैं। आपका पासवर्ड अपरिवर्तित रहेगा।

${this.fromName}
    `.trim();
  }

  // ==================== REFUND NOTIFICATION ====================

  getRefundNotificationHTML(data: {
    patientName: string;
    serviceName: string;
    appointmentDate: string;
    refundAmount: number;
    reason: string;
    confirmationNumber: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">💰 रिफंड प्रोसेस हो गया</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">प्रिय ${data.patientName},</p>
    
    <p>आपकी अपॉइंटमेंट के लिए रिफंड प्रोसेस कर दिया गया है। राशि 5-7 व्यावसायिक दिनों के भीतर आपके मूल भुगतान विधि में जमा कर दी जाएगी।</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4facfe;">
      <h2 style="margin-top: 0; color: #4facfe;">रिफंड विवरण</h2>
      <p><strong>रिफंड राशि:</strong> ₹${data.refundAmount.toFixed(2)}</p>
      <p><strong>सेवा:</strong> ${data.serviceName}</p>
      <p><strong>अपॉइंटमेंट तारीख:</strong> ${data.appointmentDate}</p>
      <p><strong>पुष्टि संख्या:</strong> ${data.confirmationNumber}</p>
      <p><strong>कारण:</strong> ${data.reason}</p>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      <strong>नोट:</strong> रिफंड आपके बैंक या भुगतान प्रदाता के आधार पर 5-7 व्यावसायिक दिनों के भीतर आपके खाते में दिखाई देगा।
    </p>
    
    <p>यदि इस रिफंड के बारे में आपके कोई प्रश्न हैं, तो कृपया हमसे संपर्क करने में संकोच न करें।</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${this.patientUrl}/dashboard" 
         style="background: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        डैशबोर्ड देखें
      </a>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
      ${this.fromName}
    </p>
  </div>
</body>
</html>
    `;
  }

  getRefundNotificationText(data: {
    patientName: string;
    serviceName: string;
    appointmentDate: string;
    refundAmount: number;
    reason: string;
    confirmationNumber: string;
  }): string {
    return `
रिफंड प्रोसेस हो गया

प्रिय ${data.patientName},

आपकी अपॉइंटमेंट के लिए रिफंड प्रोसेस कर दिया गया है। राशि 5-7 व्यावसायिक दिनों के भीतर आपके मूल भुगतान विधि में जमा कर दी जाएगी।

रिफंड विवरण:
- रिफंड राशि: ₹${data.refundAmount.toFixed(2)}
- सेवा: ${data.serviceName}
- अपॉइंटमेंट तारीख: ${data.appointmentDate}
- पुष्टि संख्या: ${data.confirmationNumber}
- कारण: ${data.reason}

नोट: रिफंड आपके बैंक या भुगतान प्रदाता के आधार पर 5-7 व्यावसायिक दिनों के भीतर आपके खाते में दिखाई देगा।

यदि इस रिफंड के बारे में आपके कोई प्रश्न हैं, तो कृपया हमसे संपर्क करने में संकोच न करें।

अपना डैशबोर्ड देखें: ${this.patientUrl}/dashboard

${this.fromName}
    `.trim();
  }
}
