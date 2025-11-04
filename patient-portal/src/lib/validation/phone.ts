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
 * Check if phone number is from specific Indian telecom circles
 */
export function getIndianTelecomCircle(phoneNumber: string): string | null {
  const validation = validateIndianPhoneNumber(phoneNumber);
  if (!validation.isValid || validation.type !== 'mobile') {
    return null;
  }
  
  const number = validation.normalizedNumber.replace('+91', '');
  const firstFourDigits = number.substring(0, 4);
  
  // Major telecom circles based on first 4 digits
  const circles: Record<string, string> = {
    // Delhi
    '9810': 'Delhi', '9811': 'Delhi', '9818': 'Delhi', '9999': 'Delhi',
    // Mumbai
    '9820': 'Mumbai', '9821': 'Mumbai', '9920': 'Mumbai', '9996': 'Mumbai',
    // Kolkata
    '9830': 'Kolkata', '9831': 'Kolkata', '9930': 'Kolkata', '9903': 'Kolkata',
    // Chennai
    '9840': 'Chennai', '9841': 'Chennai', '9940': 'Chennai', '9963': 'Chennai',
    // Karnataka
    '9844': 'Karnataka', '9845': 'Karnataka', '9945': 'Karnataka', '9900': 'Karnataka',
    // Andhra Pradesh
    '9848': 'Andhra Pradesh', '9849': 'Andhra Pradesh', '9949': 'Andhra Pradesh',
    // Kerala
    '9847': 'Kerala', '9947': 'Kerala', '9995': 'Kerala',
    // Tamil Nadu
    '9842': 'Tamil Nadu', '9843': 'Tamil Nadu', '9942': 'Tamil Nadu', '9943': 'Tamil Nadu',
    // Maharashtra
    '9823': 'Maharashtra', '9824': 'Maharashtra', '9924': 'Maharashtra', '9997': 'Maharashtra',
    // Gujarat
    '9825': 'Gujarat', '9925': 'Gujarat', '9998': 'Gujarat',
    // Rajasthan
    '9828': 'Rajasthan', '9829': 'Rajasthan', '9928': 'Rajasthan', '9929': 'Rajasthan',
    // Punjab
    '9814': 'Punjab', '9815': 'Punjab', '9914': 'Punjab', '9915': 'Punjab',
    // Haryana
    '9813': 'Haryana', '9812': 'Haryana', '9912': 'Haryana', '9913': 'Haryana',
    // Uttar Pradesh
    '9837': 'Uttar Pradesh', '9838': 'Uttar Pradesh', '9937': 'Uttar Pradesh', '9938': 'Uttar Pradesh',
    // West Bengal
    '9832': 'West Bengal', '9833': 'West Bengal', '9932': 'West Bengal', '9933': 'West Bengal',
    // Odisha
    '9861': 'Odisha', '9862': 'Odisha', '9961': 'Odisha', '9962': 'Odisha',
    // Bihar
    '9835': 'Bihar', '9836': 'Bihar', '9935': 'Bihar', '9936': 'Bihar',
    // Madhya Pradesh
    '9826': 'Madhya Pradesh', '9926': 'Madhya Pradesh', '9927': 'Madhya Pradesh',
    // Chhattisgarh
    '9992': 'Chhattisgarh',
    // Jharkhand
    '9834': 'Jharkhand', '9934': 'Jharkhand',
    // Himachal Pradesh
    '9816': 'Himachal Pradesh', '9817': 'Himachal Pradesh', '9916': 'Himachal Pradesh', '9917': 'Himachal Pradesh',
    // Jammu & Kashmir
    '9906': 'Jammu & Kashmir', '9907': 'Jammu & Kashmir',
    // Assam
    '9854': 'Assam', '9855': 'Assam', '9954': 'Assam', '9955': 'Assam',
    // North East
    '9856': 'North East', '9857': 'North East', '9956': 'North East', '9957': 'North East',
    // Goa
    '9822': 'Goa', '9922': 'Goa'
  };
  
  return circles[firstFourDigits] || 'Unknown Circle';
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