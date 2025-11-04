/**
 * Indian Address Validation Utilities
 * 
 * This module provides comprehensive validation and formatting for Indian addresses,
 * including support for different address formats, postal codes (PIN codes), 
 * state/UT validation, and address standardization.
 */

export interface IndianAddress {
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  country: string; // Should always be "India"
}

export interface AddressValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
  formattedAddress?: string;
}

// Indian States and Union Territories with their codes
export const INDIAN_STATES_AND_UTS = {
  // States
  'Andhra Pradesh': 'AP',
  'Arunachal Pradesh': 'AR',
  'Assam': 'AS',
  'Bihar': 'BR',
  'Chhattisgarh': 'CG',
  'Goa': 'GA',
  'Gujarat': 'GJ',
  'Haryana': 'HR',
  'Himachal Pradesh': 'HP',
  'Jharkhand': 'JH',
  'Karnataka': 'KA',
  'Kerala': 'KL',
  'Madhya Pradesh': 'MP',
  'Maharashtra': 'MH',
  'Manipur': 'MN',
  'Meghalaya': 'ML',
  'Mizoram': 'MZ',
  'Nagaland': 'NL',
  'Odisha': 'OR',
  'Punjab': 'PB',
  'Rajasthan': 'RJ',
  'Sikkim': 'SK',
  'Tamil Nadu': 'TN',
  'Telangana': 'TG',
  'Tripura': 'TR',
  'Uttar Pradesh': 'UP',
  'Uttarakhand': 'UK',
  'West Bengal': 'WB',
  
  // Union Territories
  'Andaman and Nicobar Islands': 'AN',
  'Chandigarh': 'CH',
  'Dadra and Nagar Haveli and Daman and Diu': 'DD',
  'Delhi': 'DL',
  'Jammu and Kashmir': 'JK',
  'Ladakh': 'LA',
  'Lakshadweep': 'LD',
  'Puducherry': 'PY'
} as const;

export type IndianState = keyof typeof INDIAN_STATES_AND_UTS;
export type StateCode = typeof INDIAN_STATES_AND_UTS[IndianState];

// PIN code patterns by state/region (first digit indicates region)
const PIN_CODE_PATTERNS = {
  '1': ['Delhi', 'Haryana', 'Punjab', 'Himachal Pradesh', 'Jammu and Kashmir', 'Ladakh'],
  '2': ['Uttar Pradesh', 'Uttarakhand'],
  '3': ['Rajasthan'],
  '4': ['Maharashtra', 'Goa', 'Madhya Pradesh', 'Chhattisgarh'],
  '5': ['Karnataka', 'Andhra Pradesh', 'Telangana'],
  '6': ['Tamil Nadu', 'Kerala', 'Puducherry', 'Lakshadweep'],
  '7': ['West Bengal', 'Odisha', 'Jharkhand', 'Andaman and Nicobar Islands'],
  '8': ['Bihar', 'Assam', 'Meghalaya', 'Manipur', 'Mizoram', 'Nagaland', 'Tripura', 'Arunachal Pradesh', 'Sikkim'],
  '9': ['Gujarat', 'Dadra and Nagar Haveli and Daman and Diu']
};

// Major cities with their districts and states
const MAJOR_CITIES = {
  'Mumbai': { district: 'Mumbai City', state: 'Maharashtra' },
  'Delhi': { district: 'New Delhi', state: 'Delhi' },
  'Bangalore': { district: 'Bangalore Urban', state: 'Karnataka' },
  'Hyderabad': { district: 'Hyderabad', state: 'Telangana' },
  'Ahmedabad': { district: 'Ahmedabad', state: 'Gujarat' },
  'Chennai': { district: 'Chennai', state: 'Tamil Nadu' },
  'Kolkata': { district: 'Kolkata', state: 'West Bengal' },
  'Surat': { district: 'Surat', state: 'Gujarat' },
  'Pune': { district: 'Pune', state: 'Maharashtra' },
  'Jaipur': { district: 'Jaipur', state: 'Rajasthan' },
  'Lucknow': { district: 'Lucknow', state: 'Uttar Pradesh' },
  'Kanpur': { district: 'Kanpur Nagar', state: 'Uttar Pradesh' },
  'Nagpur': { district: 'Nagpur', state: 'Maharashtra' },
  'Indore': { district: 'Indore', state: 'Madhya Pradesh' },
  'Thane': { district: 'Thane', state: 'Maharashtra' },
  'Bhopal': { district: 'Bhopal', state: 'Madhya Pradesh' },
  'Visakhapatnam': { district: 'Visakhapatnam', state: 'Andhra Pradesh' },
  'Pimpri-Chinchwad': { district: 'Pune', state: 'Maharashtra' },
  'Patna': { district: 'Patna', state: 'Bihar' },
  'Vadodara': { district: 'Vadodara', state: 'Gujarat' },
  'Ghaziabad': { district: 'Ghaziabad', state: 'Uttar Pradesh' },
  'Ludhiana': { district: 'Ludhiana', state: 'Punjab' },
  'Agra': { district: 'Agra', state: 'Uttar Pradesh' },
  'Nashik': { district: 'Nashik', state: 'Maharashtra' },
  'Faridabad': { district: 'Faridabad', state: 'Haryana' },
  'Meerut': { district: 'Meerut', state: 'Uttar Pradesh' },
  'Rajkot': { district: 'Rajkot', state: 'Gujarat' },
  'Kalyan-Dombivali': { district: 'Thane', state: 'Maharashtra' },
  'Vasai-Virar': { district: 'Thane', state: 'Maharashtra' },
  'Varanasi': { district: 'Varanasi', state: 'Uttar Pradesh' },
  'Srinagar': { district: 'Srinagar', state: 'Jammu and Kashmir' },
  'Aurangabad': { district: 'Aurangabad', state: 'Maharashtra' },
  'Dhanbad': { district: 'Dhanbad', state: 'Jharkhand' },
  'Amritsar': { district: 'Amritsar', state: 'Punjab' },
  'Navi Mumbai': { district: 'Thane', state: 'Maharashtra' },
  'Allahabad': { district: 'Prayagraj', state: 'Uttar Pradesh' },
  'Ranchi': { district: 'Ranchi', state: 'Jharkhand' },
  'Howrah': { district: 'Howrah', state: 'West Bengal' },
  'Coimbatore': { district: 'Coimbatore', state: 'Tamil Nadu' },
  'Jabalpur': { district: 'Jabalpur', state: 'Madhya Pradesh' },
  'Gwalior': { district: 'Gwalior', state: 'Madhya Pradesh' },
  'Vijayawada': { district: 'NTR', state: 'Andhra Pradesh' },
  'Jodhpur': { district: 'Jodhpur', state: 'Rajasthan' },
  'Madurai': { district: 'Madurai', state: 'Tamil Nadu' },
  'Raipur': { district: 'Raipur', state: 'Chhattisgarh' },
  'Kota': { district: 'Kota', state: 'Rajasthan' },
  'Guwahati': { district: 'Kamrup Metropolitan', state: 'Assam' },
  'Chandigarh': { district: 'Chandigarh', state: 'Chandigarh' },
  'Solapur': { district: 'Solapur', state: 'Maharashtra' },
  'Hubli-Dharwad': { district: 'Dharwad', state: 'Karnataka' },
  'Tiruchirappalli': { district: 'Tiruchirappalli', state: 'Tamil Nadu' },
  'Bareilly': { district: 'Bareilly', state: 'Uttar Pradesh' },
  'Moradabad': { district: 'Moradabad', state: 'Uttar Pradesh' },
  'Mysore': { district: 'Mysuru', state: 'Karnataka' },
  'Tiruppur': { district: 'Tiruppur', state: 'Tamil Nadu' },
  'Gurgaon': { district: 'Gurugram', state: 'Haryana' },
  'Aligarh': { district: 'Aligarh', state: 'Uttar Pradesh' },
  'Jalandhar': { district: 'Jalandhar', state: 'Punjab' },
  'Bhubaneswar': { district: 'Khordha', state: 'Odisha' },
  'Salem': { district: 'Salem', state: 'Tamil Nadu' },
  'Warangal': { district: 'Warangal', state: 'Telangana' },
  'Guntur': { district: 'Guntur', state: 'Andhra Pradesh' },
  'Bhiwandi': { district: 'Thane', state: 'Maharashtra' },
  'Saharanpur': { district: 'Saharanpur', state: 'Uttar Pradesh' },
  'Gorakhpur': { district: 'Gorakhpur', state: 'Uttar Pradesh' },
  'Bikaner': { district: 'Bikaner', state: 'Rajasthan' },
  'Amravati': { district: 'Amravati', state: 'Maharashtra' },
  'Noida': { district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh' },
  'Jamshedpur': { district: 'East Singhbhum', state: 'Jharkhand' },
  'Bhilai Nagar': { district: 'Durg', state: 'Chhattisgarh' },
  'Cuttack': { district: 'Cuttack', state: 'Odisha' },
  'Firozabad': { district: 'Firozabad', state: 'Uttar Pradesh' },
  'Kochi': { district: 'Ernakulam', state: 'Kerala' },
  'Bhavnagar': { district: 'Bhavnagar', state: 'Gujarat' },
  'Dehradun': { district: 'Dehradun', state: 'Uttarakhand' },
  'Durgapur': { district: 'Paschim Bardhaman', state: 'West Bengal' },
  'Asansol': { district: 'Paschim Bardhaman', state: 'West Bengal' },
  'Rourkela': { district: 'Sundargarh', state: 'Odisha' },
  'Nanded': { district: 'Nanded', state: 'Maharashtra' },
  'Kolhapur': { district: 'Kolhapur', state: 'Maharashtra' },
  'Ajmer': { district: 'Ajmer', state: 'Rajasthan' }
} as const;

/**
 * Validates an Indian PIN code
 * @param pinCode - 6-digit PIN code
 * @returns Validation result with detailed feedback
 */
export function validateIndianPinCode(pinCode: string): AddressValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Remove spaces and convert to string
  const cleanPinCode = pinCode.toString().replace(/\s/g, '');

  // Basic format validation
  if (!/^\d{6}$/.test(cleanPinCode)) {
    errors.push('PIN code must be exactly 6 digits');
    return { isValid: false, errors, warnings, suggestions };
  }

  // Check first digit for regional validation
  const firstDigit = cleanPinCode[0];
  const validRegions = PIN_CODE_PATTERNS[firstDigit as keyof typeof PIN_CODE_PATTERNS];
  
  if (!validRegions) {
    warnings.push('PIN code first digit does not correspond to a valid Indian postal region');
  }

  // Check for common invalid patterns
  if (/^(\d)\1{5}$/.test(cleanPinCode)) {
    warnings.push('PIN code appears to have repeating digits - please verify');
  }

  // Special cases for specific regions
  if (firstDigit === '1' && cleanPinCode.startsWith('11')) {
    suggestions.push('This appears to be a Delhi NCR PIN code');
  } else if (firstDigit === '4' && cleanPinCode.startsWith('40')) {
    suggestions.push('This appears to be a Mumbai/Maharashtra PIN code');
  } else if (firstDigit === '5' && cleanPinCode.startsWith('56')) {
    suggestions.push('This appears to be a Bangalore/Karnataka PIN code');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    formattedAddress: cleanPinCode
  };
}

/**
 * Validates an Indian state or union territory name
 * @param state - State or UT name
 * @returns Validation result
 */
export function validateIndianState(state: string): AddressValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!state || state.trim().length === 0) {
    errors.push('State/UT is required');
    return { isValid: false, errors, warnings };
  }

  const normalizedState = state.trim();
  const validStates = Object.keys(INDIAN_STATES_AND_UTS);
  
  // Exact match
  if (validStates.includes(normalizedState)) {
    return { isValid: true, errors, warnings };
  }

  // Check for common variations and abbreviations
  const stateVariations: Record<string, string[]> = {
    'Andhra Pradesh': ['AP', 'A.P.', 'Andhra'],
    'Tamil Nadu': ['TN', 'T.N.', 'TamilNadu'],
    'Uttar Pradesh': ['UP', 'U.P.', 'UttarPradesh'],
    'West Bengal': ['WB', 'W.B.', 'WestBengal'],
    'Madhya Pradesh': ['MP', 'M.P.', 'MadhyaPradesh'],
    'Jammu and Kashmir': ['JK', 'J&K', 'JammuKashmir'],
    'Andaman and Nicobar Islands': ['Andaman', 'Nicobar'],
    'Dadra and Nagar Haveli and Daman and Diu': ['Dadra Nagar Haveli', 'Daman Diu', 'DNHDD'],
    'Puducherry': ['Pondicherry', 'Pondy']
  };

  for (const [officialName, variations] of Object.entries(stateVariations)) {
    if (variations.some(variation => 
      normalizedState.toLowerCase() === variation.toLowerCase() ||
      normalizedState.toLowerCase().includes(variation.toLowerCase())
    )) {
      warnings.push(`State name corrected from "${normalizedState}" to "${officialName}"`);
      return { isValid: true, errors, warnings };
    }
  }

  // Check for typos using Levenshtein distance
  const closestMatch = findClosestMatch(normalizedState, validStates);
  if (closestMatch && getLevenshteinDistance(normalizedState.toLowerCase(), closestMatch.toLowerCase()) <= 3) {
    warnings.push(`Did you mean "${closestMatch}" instead of "${normalizedState}"?`);
  }

  errors.push(`"${normalizedState}" is not a valid Indian state or union territory`);
  return { isValid: false, errors, warnings };
}

/**
 * Validates an Indian city/district name
 * @param city - City name
 * @param state - State name (optional, for cross-validation)
 * @returns Validation result
 */
export function validateIndianCity(city: string, state?: string): AddressValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (!city || city.trim().length === 0) {
    errors.push('City is required');
    return { isValid: false, errors, warnings, suggestions };
  }

  const normalizedCity = city.trim();
  
  // Basic validation - check for minimum length
  if (normalizedCity.length < 2) {
    errors.push('City name must be at least 2 characters long');
  }

  // Check for valid characters (letters, spaces, hyphens)
  if (!/^[a-zA-Z\s\-]+$/.test(normalizedCity)) {
    warnings.push('City name contains invalid characters (only letters, spaces, and hyphens allowed)');
  }

  // Check against major cities for validation and suggestions
  const majorCities = Object.keys(MAJOR_CITIES);
  if (majorCities.includes(normalizedCity)) {
    const cityInfo = MAJOR_CITIES[normalizedCity as keyof typeof MAJOR_CITIES];
    if (state && cityInfo.state !== state) {
      warnings.push(`City "${normalizedCity}" is typically in ${cityInfo.state}, not ${state}`);
    }
    suggestions.push(`Major city: ${normalizedCity}, ${cityInfo.district} district, ${cityInfo.state}`);
  }

  // Common city name corrections
  const cityCorrections: Record<string, string> = {
    'Bangalore': 'Bengaluru',
    'Madras': 'Chennai',
    'Calcutta': 'Kolkata',
    'Bombay': 'Mumbai',
    'Baroda': 'Vadodara',
    'Poona': 'Pune',
    'Trivandrum': 'Thiruvananthapuram',
    'Cochin': 'Kochi',
    'Benares': 'Varanasi',
    'Allahabad': 'Prayagraj',
    'Gurgaon': 'Gurugram'
  };

  if (cityCorrections[normalizedCity]) {
    warnings.push(`City name updated from "${normalizedCity}" to "${cityCorrections[normalizedCity]}"`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

/**
 * Validates a complete Indian address
 * @param address - Complete address object
 * @returns Comprehensive validation result
 */
export function validateIndianAddress(address: Partial<IndianAddress>): AddressValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Validate required fields
  if (!address.line1 || address.line1.trim().length === 0) {
    errors.push('Address line 1 is required');
  }

  if (!address.city || address.city.trim().length === 0) {
    errors.push('City is required');
  }

  if (!address.state || address.state.trim().length === 0) {
    errors.push('State/UT is required');
  }

  if (!address.pinCode || address.pinCode.trim().length === 0) {
    errors.push('PIN code is required');
  }

  // Validate individual components
  if (address.pinCode) {
    const pinValidation = validateIndianPinCode(address.pinCode);
    if (!pinValidation.isValid) {
      errors.push(...pinValidation.errors);
    }
    warnings.push(...pinValidation.warnings);
    suggestions.push(...(pinValidation.suggestions || []));
  }

  if (address.state) {
    const stateValidation = validateIndianState(address.state);
    if (!stateValidation.isValid) {
      errors.push(...stateValidation.errors);
    }
    warnings.push(...stateValidation.warnings);
  }

  if (address.city) {
    const cityValidation = validateIndianCity(address.city, address.state);
    if (!cityValidation.isValid) {
      errors.push(...cityValidation.errors);
    }
    warnings.push(...cityValidation.warnings);
    suggestions.push(...(cityValidation.suggestions || []));
  }

  // Cross-validation: Check if PIN code matches state
  if (address.pinCode && address.state) {
    const firstDigit = address.pinCode.toString()[0];
    const expectedStates = PIN_CODE_PATTERNS[firstDigit as keyof typeof PIN_CODE_PATTERNS];
    
    if (expectedStates && !expectedStates.includes(address.state)) {
      warnings.push(`PIN code starting with ${firstDigit} typically corresponds to ${expectedStates.join(', ')}, not ${address.state}`);
    }
  }

  // Generate formatted address
  const formattedAddress = formatIndianAddress(address as IndianAddress);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
    formattedAddress
  };
}

/**
 * Formats an Indian address in a standard format
 * @param address - Complete address object
 * @returns Formatted address string
 */
export function formatIndianAddress(address: IndianAddress): string {
  const lines: string[] = [];
  
  // Address lines
  if (address.line1) lines.push(address.line1.trim());
  if (address.line2) lines.push(address.line2.trim());
  if (address.landmark) lines.push(`Landmark: ${address.landmark.trim()}`);
  
  // City, District, State, PIN
  const locationLine = [
    address.city,
    address.district !== address.city ? address.district : null,
    `${address.state} - ${address.pinCode}`
  ].filter(Boolean).join(', ');
  
  if (locationLine) lines.push(locationLine);
  
  // Country
  if (address.country) lines.push(address.country);
  
  return lines.join('\n');
}

/**
 * Parses and standardizes an Indian address from raw text
 * @param rawAddress - Raw address text
 * @returns Parsed and standardized address
 */
export function parseIndianAddress(rawAddress: string): Partial<IndianAddress> {
  const lines = rawAddress.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const address: Partial<IndianAddress> = {
    country: 'India'
  };

  // Look for PIN code (6 digits)
  const pinCodeMatch = rawAddress.match(/\b\d{6}\b/);
  if (pinCodeMatch) {
    address.pinCode = pinCodeMatch[0];
  }

  // Look for state names
  const validStates = Object.keys(INDIAN_STATES_AND_UTS);
  for (const state of validStates) {
    if (rawAddress.toLowerCase().includes(state.toLowerCase())) {
      address.state = state;
      break;
    }
  }

  // Look for major cities
  const majorCities = Object.keys(MAJOR_CITIES);
  for (const city of majorCities) {
    if (rawAddress.toLowerCase().includes(city.toLowerCase())) {
      address.city = city;
      if (!address.state && MAJOR_CITIES[city as keyof typeof MAJOR_CITIES]) {
        address.state = MAJOR_CITIES[city as keyof typeof MAJOR_CITIES].state;
      }
      break;
    }
  }

  // Assign address lines
  if (lines.length > 0) {
    address.line1 = lines[0];
    if (lines.length > 1 && !address.city && !address.state && !address.pinCode) {
      address.line2 = lines[1];
    }
  }

  return address;
}

/**
 * Gets all Indian states and union territories
 * @returns Array of state/UT names
 */
export function getAllIndianStates(): string[] {
  return Object.keys(INDIAN_STATES_AND_UTS);
}

/**
 * Gets state code for a given state name
 * @param stateName - Full state name
 * @returns State code or null if not found
 */
export function getStateCode(stateName: string): string | null {
  return INDIAN_STATES_AND_UTS[stateName as IndianState] || null;
}

/**
 * Gets state name for a given state code
 * @param stateCode - Two-letter state code
 * @returns State name or null if not found
 */
export function getStateName(stateCode: string): string | null {
  const entry = Object.entries(INDIAN_STATES_AND_UTS).find(([_, code]) => code === stateCode.toUpperCase());
  return entry ? entry[0] : null;
}

/**
 * Suggests cities based on state and partial city name
 * @param partialCity - Partial city name
 * @param state - State name (optional)
 * @returns Array of matching cities
 */
export function suggestIndianCities(partialCity: string, state?: string): string[] {
  if (!partialCity || partialCity.length < 2) return [];

  const normalizedPartial = partialCity.toLowerCase();
  const allCities = Object.keys(MAJOR_CITIES);
  
  let matchingCities = allCities.filter(city => 
    city.toLowerCase().includes(normalizedPartial)
  );

  // If state is provided, filter by state
  if (state) {
    matchingCities = matchingCities.filter(city => {
      const cityInfo = MAJOR_CITIES[city as keyof typeof MAJOR_CITIES];
      return cityInfo && cityInfo.state === state;
    });
  }

  return matchingCities.slice(0, 10); // Return top 10 matches
}

// Helper function to find closest string match
function findClosestMatch(target: string, candidates: string[]): string | null {
  let closest = null;
  let minDistance = Infinity;

  for (const candidate of candidates) {
    const distance = getLevenshteinDistance(target.toLowerCase(), candidate.toLowerCase());
    if (distance < minDistance) {
      minDistance = distance;
      closest = candidate;
    }
  }

  return closest;
}

// Helper function to calculate Levenshtein distance
function getLevenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,      // deletion
        matrix[j - 1][i] + 1,      // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}