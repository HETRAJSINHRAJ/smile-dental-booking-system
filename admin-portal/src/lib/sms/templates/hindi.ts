/**
 * Hindi SMS Templates
 * All SMS templates translated to Hindi for Indian users
 */

import { AppointmentSMSData, PaymentSMSData } from '../smsService';

export class HindiSMSTemplates {
  getAppointmentConfirmationTemplate(data: AppointmentSMSData): string {
    return `✅ अपॉइंटमेंट की पुष्टि

नमस्ते ${data.patientName},

आपकी अपॉइंटमेंट की पुष्टि हो गई है:
📅 ${data.appointmentDate}
🕐 ${data.appointmentTime}
🏥 ${data.serviceName}
👨‍⚕️ डॉ. ${data.providerName}
${data.confirmationNumber ? `🔖 संदर्भ: ${data.confirmationNumber}` : ''}

कृपया 10 मिनट पहले पहुंचें।

- Smile Dental`;
  }

  getAppointmentReminderTemplate(data: AppointmentSMSData): string {
    return `⏰ अपॉइंटमेंट रिमाइंडर

नमस्ते ${data.patientName},

रिमाइंडर: आपकी कल अपॉइंटमेंट है:
📅 ${data.appointmentDate}
🕐 ${data.appointmentTime}
🏥 ${data.serviceName}
👨‍⚕️ डॉ. ${data.providerName}

रीशेड्यूल करना है? जल्द से जल्द संपर्क करें।

- Smile Dental`;
  }

  getAppointmentCancellationTemplate(data: AppointmentSMSData): string {
    let message = `❌ अपॉइंटमेंट रद्द

नमस्ते ${data.patientName},

आपकी अपॉइंटमेंट रद्द कर दी गई है:
📅 ${data.appointmentDate}
🕐 ${data.appointmentTime}
🏥 ${data.serviceName}`;

    if (data.cancellationReason) {
      message += `\n\nकारण: ${data.cancellationReason}`;
    }

    message += '\n\nनई अपॉइंटमेंट बुक करने के लिए हमारी वेबसाइट पर जाएं या हमें कॉल करें।\n\n- Smile Dental';

    return message;
  }

  getAppointmentRescheduledTemplate(data: AppointmentSMSData): string {
    return `🔄 अपॉइंटमेंट रीशेड्यूल

नमस्ते ${data.patientName},

आपकी अपॉइंटमेंट रीशेड्यूल हो गई है:
📅 ${data.appointmentDate}
🕐 ${data.appointmentTime}
🏥 ${data.serviceName}
👨‍⚕️ डॉ. ${data.providerName}

तब मिलते हैं!

- Smile Dental`;
  }

  getPaymentReceiptTemplate(data: PaymentSMSData): string {
    return `💳 भुगतान प्राप्त हुआ

नमस्ते ${data.patientName},

भुगतान सफल!
💰 राशि: ₹${data.amount.toFixed(2)}
🏥 सेवा: ${data.serviceName}
🔖 लेनदेन आईडी: ${data.transactionId}

आपके भुगतान के लिए धन्यवाद।

- Smile Dental`;
  }

  getVerificationCodeTemplate(code: string): string {
    return `आपका सत्यापन कोड है: ${code}। यह कोड 10 मिनट में समाप्त हो जाएगा। इस कोड को किसी के साथ साझा न करें।`;
  }
}
