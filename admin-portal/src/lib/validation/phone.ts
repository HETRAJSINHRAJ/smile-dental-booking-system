/**
 * Indian phone number validation utilities
 * Supports various formats including:
 * - 10-digit numbers (1234567890)
 * - Numbers with country code (+911234567890, +91 1234567890)
 * - Numbers with spaces/dashes (+91-1234567890, 12345 67890)
 * - Numbers starting with 6-9 (Indian mobile number rules)
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalizedNumber: string;
  formattedNumber: string;
  error?: string;
  type: 'mobile' | 'landline' | 'invalid';
}

// Indian mobile number patterns
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
const INDIAN_MOBILE_WITH_COUNTRY_CODE = /^\+91[6-9]\d{9}$/;
const INDIAN_MOBILE_WITH_SPACES = /^\+91\s?[6-9]\d{9}$/;
const INDIAN_MOBILE_WITH_DASHES = /^\+91-?[6-9]\d{9}$/;

// Landline patterns (basic support)
const INDIAN_LANDLINE_REGEX = /^0?[1-9]\d{9,11}$/; // STD code + number

// Remove all non-numeric characters except +
function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

// Format Indian mobile number in readable format
function formatIndianMobileNumber(phone: string): string {
  // Remove country code if present
  let number = phone;
  if (phone.startsWith('+91')) {
    number = phone.substring(3);
  }
  
  // Format as +91 XXXXX XXXXX
  if (number.length === 10) {
    return `+91 ${number.substring(0, 5)} ${number.substring(5)}`;
  }
  
  return phone;
}

/**
 * Validate Indian phone number
 */
export function validateIndianPhoneNumber(phone: string): PhoneValidationResult {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      normalizedNumber: '',
      formattedNumber: '',
      error: 'Phone number is required',
      type: 'invalid'
    };
  }

  const cleaned = cleanPhoneNumber(phone.trim());
  
  // Check if it's a mobile number
  const isMobileWithCountryCode = INDIAN_MOBILE_WITH_COUNTRY_CODE.test(cleaned);
  const isMobileWithSpaces = INDIAN_MOBILE_WITH_SPACES.test(cleaned);
  const isMobileWithDashes = INDIAN_MOBILE_WITH_DASHES.test(cleaned);
  
  // Extract 10-digit number for validation
  let tenDigitNumber = cleaned;
  if (cleaned.startsWith('+91')) {
    tenDigitNumber = cleaned.substring(3);
  }
  
  const isValidMobile = INDIAN_MOBILE_REGEX.test(tenDigitNumber);
  
  if (isValidMobile || isMobileWithCountryCode || isMobileWithSpaces || isMobileWithDashes) {
    const normalizedNumber = '+91' + tenDigitNumber;
    return {
      isValid: true,
      normalizedNumber,
      formattedNumber: formatIndianMobileNumber(normalizedNumber),
      type: 'mobile'
    };
  }
  
  // Check for landline (basic validation)
  if (INDIAN_LANDLINE_REGEX.test(cleaned)) {
    return {
      isValid: true,
      normalizedNumber: cleaned,
      formattedNumber: cleaned,
      type: 'landline'
    };
  }
  
  return {
    isValid: false,
    normalizedNumber: '',
    formattedNumber: '',
    error: 'Please enter a valid Indian mobile number',
    type: 'invalid'
  };
}

/**
 * Format phone number for display
 */
export function formatIndianPhoneNumber(phone: string): string {
  const validation = validateIndianPhoneNumber(phone);
  return validation.formattedNumber;
}

/**
 * Check if phone number is valid for OTP/SMS delivery
 */
export function isValidForSMS(phone: string): boolean {
  const validation = validateIndianPhoneNumber(phone);
  return validation.isValid && validation.type === 'mobile';
}

/**
 * Get normalized phone number for database storage
 */
export function normalizeIndianPhoneNumber(phone: string): string {
  const validation = validateIndianPhoneNumber(phone);
  return validation.isValid ? validation.normalizedNumber : '';
}