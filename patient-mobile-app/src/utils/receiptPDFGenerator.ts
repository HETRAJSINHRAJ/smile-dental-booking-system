import { Appointment, Service } from '../types/firebase';

export interface ReceiptData {
  appointment: Appointment;
  service: Service | null;
}

export class ReceiptPDFGenerator {
  /**
   * Format currency for PDF display
   */
  private static formatCurrency(amount: number): string {
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
    return `Rs. ${formatted}`;
  }

  /**
   * Format time to 12-hour format
   */
  private static formatTimeTo12Hour(time24: string): string {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  /**
   * Format date
   */
  private static formatDate(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Escape HTML special characters
   */
  private static escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Generate HTML content for receipt PDF
   */
  static generateReceiptHTML(data: ReceiptData): string {
    const { appointment, service } = data;

    // Calculate tax breakdown (assuming 18% GST)
    const baseAmount = appointment.paymentAmount / 1.18;
    const taxAmount = appointment.paymentAmount - baseAmount;

    // Service payment due calculation
    const serviceDue = service && service.price > appointment.paymentAmount
      ? service.price - appointment.paymentAmount
      : 0;
    const serviceDueBase = serviceDue / 1.18;
    const serviceDueTax = serviceDue - serviceDueBase;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Helvetica, Arial, sans-serif;
      padding: 30px;
      background: #FFFFFF;
      font-size: 9px;
    }
    .header {
      background: #22C55E;
      color: #FFFFFF;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      position: relative;
      margin-bottom: 16px;
    }
    .badge {
      position: absolute;
      top: -6px;
      right: 30px;
      background: #FFFFFF;
      color: #15803D;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 10px;
      letter-spacing: 0.5px;
    }
    .header-title {
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 3px;
      letter-spacing: 0.5px;
    }
    .header-subtitle {
      font-size: 11px;
    }
    .section {
      margin-bottom: 12px;
    }
    .section-title {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 8px;
      color: #000000;
    }
    .appointment-box {
      background: #F3F4F6;
      padding: 10px;
      border-radius: 6px;
    }
    .appointment-grid {
      display: flex;
      justify-content: space-between;
    }
    .appointment-column {
      width: 48%;
    }
    .appointment-item {
      margin-bottom: 8px;
    }
    .label {
      font-size: 9px;
      color: #6B7280;
      margin-bottom: 2px;
    }
    .value {
      font-size: 10px;
      font-weight: bold;
      color: #000000;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      align-items: center;
    }
    .info-label {
      font-size: 9px;
      color: #000000;
    }
    .info-value {
      font-size: 9px;
      font-weight: bold;
      color: #000000;
      text-align: right;
      max-width: 65%;
      word-wrap: break-word;
    }
    .mono-font {
      font-family: Courier, monospace;
      font-size: 8px;
    }
    .amount-box {
      background: #EFF6FF;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      border: 1px solid #BFDBFE;
    }
    .amount-title {
      font-size: 13px;
      font-weight: bold;
      color: #1E40AF;
      margin-bottom: 10px;
    }
    .amount-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .amount-label {
      font-size: 9px;
      color: #000000;
    }
    .amount-value {
      font-size: 9px;
      font-weight: bold;
      color: #000000;
      text-align: right;
    }
    .divider {
      border-bottom: 1px solid #BFDBFE;
      margin-top: 4px;
      margin-bottom: 10px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .total-label {
      font-size: 10px;
      font-weight: bold;
      color: #000000;
    }
    .total-value {
      font-size: 10px;
      font-weight: bold;
      color: #1E40AF;
      text-align: right;
    }
    .service-box {
      background: #FEF9C3;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      border: 1px solid #FCD34D;
    }
    .service-title {
      font-size: 13px;
      font-weight: bold;
      color: #78350F;
      margin-bottom: 6px;
    }
    .service-note {
      font-size: 9px;
      color: #78350F;
      margin-bottom: 12px;
      line-height: 1.4;
    }
    .service-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .service-label {
      font-size: 9px;
      color: #000000;
    }
    .service-value {
      font-size: 9px;
      font-weight: bold;
      color: #000000;
      text-align: right;
    }
    .service-divider {
      border-bottom: 1px solid #FCD34D;
      margin-top: 4px;
      margin-bottom: 10px;
    }
    .service-total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .service-total-label {
      font-size: 10px;
      font-weight: bold;
      color: #78350F;
    }
    .service-total-value {
      font-size: 10px;
      font-weight: bold;
      color: #78350F;
      text-align: right;
    }
    .footer {
      margin-top: 15px;
      text-align: center;
    }
    .footer-text {
      font-size: 9px;
      color: #6B7280;
      margin-bottom: 2px;
    }
  </style>
</head>
<body>
  <!-- Header with Badge -->
  <div class="header">
    <div class="badge">PAID</div>
    <div class="header-title">Payment Receipt</div>
    <div class="header-subtitle">Appointment Reservation Confirmed</div>
  </div>

  <!-- Appointment Details -->
  <div class="section">
    <div class="section-title">Appointment Details</div>
    <div class="appointment-box">
      <div class="appointment-grid">
        <div class="appointment-column">
          <div class="appointment-item">
            <div class="label">Service</div>
            <div class="value">${this.escapeHtml(appointment.serviceName)}</div>
          </div>
          <div class="appointment-item">
            <div class="label">Date</div>
            <div class="value">${this.formatDate(appointment.appointmentDate)}</div>
          </div>
        </div>
        <div class="appointment-column">
          <div class="appointment-item">
            <div class="label">Provider</div>
            <div class="value">${this.escapeHtml(appointment.providerName)}</div>
          </div>
          <div class="appointment-item">
            <div class="label">Time</div>
            <div class="value">${this.formatTimeTo12Hour(appointment.startTime)}</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Patient Information -->
  <div class="section">
    <div class="section-title">Patient Information</div>
    <div>
      <div class="info-row">
        <span class="info-label">Name:</span>
        <span class="info-value">${this.escapeHtml(appointment.userName || 'N/A')}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email:</span>
        <span class="info-value">${this.escapeHtml(appointment.userEmail || 'N/A')}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Phone:</span>
        <span class="info-value">${this.escapeHtml(appointment.userPhone || 'Not provided')}</span>
      </div>
    </div>
  </div>

  <!-- Payment Information -->
  <div class="section">
    <div class="section-title">Payment Information</div>
    <div>
      <div class="info-row">
        <span class="info-label">Transaction ID:</span>
        <span class="info-value mono-font">${this.escapeHtml(appointment.confirmationNumber || appointment.paymentTransactionId || 'N/A')}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Date:</span>
        <span class="info-value">${appointment.paymentDate ? this.formatDate(appointment.paymentDate) : this.formatDate(appointment.appointmentDate)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Method:</span>
        <span class="info-value">${this.escapeHtml((appointment.paymentMethod || 'Online').charAt(0).toUpperCase() + (appointment.paymentMethod || 'Online').slice(1))}</span>
      </div>
    </div>
  </div>

  <!-- Amount Paid -->
  <div class="section">
    <div class="amount-box">
      <div class="amount-title">Amount Paid</div>
      <div class="amount-row">
        <span class="amount-label">Appointment Reservation Fee:</span>
        <span class="amount-value">${this.formatCurrency(baseAmount)}</span>
      </div>
      <div class="amount-row">
        <span class="amount-label">GST (18%):</span>
        <span class="amount-value">${this.formatCurrency(taxAmount)}</span>
      </div>
      <div class="divider"></div>
      <div class="total-row">
        <span class="total-label">Total Paid:</span>
        <span class="total-value">${this.formatCurrency(appointment.paymentAmount)}</span>
      </div>
    </div>
  </div>

  ${serviceDue > 0 ? `
  <!-- Service Payment Due -->
  <div class="section">
    <div class="service-box">
      <div class="service-title">Service Payment Due</div>
      <div class="service-note">
        The following amount will be collected at the clinic during your visit:
      </div>
      <div class="service-row">
        <span class="service-label">Service Fee:</span>
        <span class="service-value">${this.formatCurrency(serviceDueBase)}</span>
      </div>
      <div class="service-row">
        <span class="service-label">GST (18%):</span>
        <span class="service-value">${this.formatCurrency(serviceDueTax)}</span>
      </div>
      <div class="service-divider"></div>
      <div class="service-total-row">
        <span class="service-total-label">Total Due at Clinic:</span>
        <span class="service-total-value">${this.formatCurrency(serviceDue)}</span>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- Footer -->
  <div class="footer">
    <div class="footer-text">This is a computer-generated receipt. No signature required.</div>
    <div class="footer-text">Please keep this receipt for your records.</div>
  </div>
</body>
</html>`;
  }
}
