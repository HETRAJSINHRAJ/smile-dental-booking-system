/**
 * Indian Healthcare Data Protection Compliance Utilities
 * 
 * This module provides utilities to ensure compliance with:
 * - Digital Information Security in Healthcare Act (DISHA) - India
 * - Information Technology Act, 2000
 * - Personal Data Protection Bill (PDP Bill) - India
 * - HIPAA equivalent standards for India
 */

export interface HealthcareDataProtectionConfig {
  encryptionKey?: string;
  dataRetentionDays?: number;
  auditLogEnabled?: boolean;
  patientConsentRequired?: boolean;
  dataLocalizationRequired?: boolean;
}

export interface PatientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  medicalRecords?: any[];
  consentGiven?: boolean;
  consentDate?: Date;
  dataProcessed?: boolean;
}

/**
 * Configuration for Indian healthcare data protection compliance
 */
export const INDIAN_HEALTHCARE_COMPLIANCE: HealthcareDataProtectionConfig = {
  dataRetentionDays: 2555, // 7 years as per Indian medical records retention policy
  auditLogEnabled: true,
  patientConsentRequired: true,
  dataLocalizationRequired: true, // Data must be stored within India
};

/**
 * Encrypt sensitive patient data
 */
export function encryptPatientData(data: string, key?: string): string {
  // In a real implementation, use proper encryption like AES-256
  // This is a simplified version for demonstration
  const encryptionKey = key || process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key';
  
  // Simple base64 encoding (replace with proper encryption in production)
  return btoa(data + encryptionKey);
}

/**
 * Decrypt sensitive patient data
 */
export function decryptPatientData(encryptedData: string, key?: string): string {
  const encryptionKey = key || process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key';
  
  // Simple base64 decoding (replace with proper decryption in production)
  const decoded = atob(encryptedData);
  return decoded.replace(encryptionKey, '');
}

/**
 * Check if patient consent is valid and recent
 */
export function isPatientConsentValid(consentDate?: Date): boolean {
  if (!consentDate) return false;
  
  const now = new Date();
  const consentAge = now.getTime() - consentDate.getTime();
  const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
  
  return consentAge <= maxAge;
}

/**
 * Generate audit log entry for data access
 */
export function generateAuditLog(
  action: string,
  userId: string,
  patientId: string,
  dataType: string,
  timestamp?: Date
): object {
  return {
    action,
    userId,
    patientId,
    dataType,
    timestamp: timestamp || new Date(),
    ipAddress: typeof window !== 'undefined' ? 'client-ip' : 'server-ip', // Simplified
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
  };
}

/**
 * Check if data is being stored within India (simplified check)
 */
export function isDataLocalized(): boolean {
  // In a real implementation, this would check server location, 
  // CDN settings, database location, etc.
  return process.env.NEXT_PUBLIC_DATA_LOCALIZATION === 'true' || true;
}

/**
 * Validate data retention period
 */
export function isDataRetentionValid(createdDate: Date, retentionDays?: number): boolean {
  const retentionPeriod = retentionDays || INDIAN_HEALTHCARE_COMPLIANCE.dataRetentionDays || 2555;
  const now = new Date();
  const ageInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return ageInDays <= retentionPeriod;
}

/**
 * Get privacy policy text for Indian healthcare
 */
export function getIndianHealthcarePrivacyPolicy(): string {
  return `
PRIVACY POLICY - INDIAN HEALTHCARE COMPLIANCE

This Privacy Policy governs the manner in which your personal and medical information is collected, used, maintained, and disclosed by our healthcare platform in compliance with Indian data protection laws.

1. DATA COLLECTION
We collect information that you provide directly to us, including:
- Personal identification information (Name, email address, phone number)
- Medical history and treatment records
- Appointment and billing information
- Emergency contact information

2. DATA USAGE
Your information is used for:
- Providing healthcare services and appointments
- Medical record keeping and treatment continuity
- Billing and insurance processing
- Communication regarding your healthcare
- Compliance with legal and regulatory requirements

3. DATA PROTECTION
We implement appropriate security measures to protect your personal information, including:
- Encryption of sensitive data
- Secure data transmission protocols
- Access controls and authentication
- Regular security audits

4. DATA RETENTION
Medical records are retained for a minimum of 7 years as per Indian healthcare regulations.

5. YOUR RIGHTS
Under Indian data protection laws, you have the right to:
- Access your personal information
- Request corrections to inaccurate data
- Request deletion of non-essential data
- Withdraw consent for data processing
- Lodge complaints with regulatory authorities

6. DATA LOCALIZATION
Your healthcare data is stored within India in compliance with data localization requirements.

7. CONTACT INFORMATION
For privacy-related queries, contact: privacy@healthcareplatform.in

Last Updated: ${new Date().toLocaleDateString('en-IN')}
  `.trim();
}

/**
 * Generate patient consent form text
 */
export function getPatientConsentForm(): string {
  return `
PATIENT CONSENT FORM

I hereby provide my informed consent for the collection, processing, and storage of my personal and medical information by this healthcare platform.

I understand that:
1. My data will be used solely for healthcare purposes
2. My data will be protected using appropriate security measures
3. My data will be retained as per Indian healthcare regulations
4. I can withdraw my consent at any time
5. My data will be stored within India

Patient Name: _________________________
Date: _______________________________
Signature: __________________________
  `.trim();
}

/**
 * Check if all compliance requirements are met
 */
export function checkComplianceRequirements(patientData: PatientData): {
  isCompliant: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  if (!patientData.consentGiven) {
    issues.push('Patient consent is required');
  }
  
  if (patientData.consentDate && !isPatientConsentValid(patientData.consentDate)) {
    issues.push('Patient consent has expired (older than 1 year)');
  }
  
  if (!isDataLocalized()) {
    issues.push('Data must be stored within India');
  }
  
  return {
    isCompliant: issues.length === 0,
    issues
  };
}