/**
 * Indian Naming Conventions Validation
 * 
 * This module provides comprehensive validation and utilities for Indian names,
 * including support for various naming patterns, titles, and cultural considerations.
 */

export interface IndianName {
  firstName: string;
  middleName?: string;
  lastName: string;
  title?: string;
  preferredName?: string;
}

export interface IndianNameValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Common Indian titles and honorifics
export const INDIAN_TITLES = [
  'Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Shri', 'Smt.', 'Kumari',
  'Late', 'Advocate', 'CA', 'CS', 'ICWA', 'Er.', 'Architect'
] as const;

// Common Indian first names by gender
export const COMMON_INDIAN_FIRST_NAMES = {
  male: [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Mohammed', 'Ayaan', 'Arnav',
    'Krishna', 'Ishaan', 'Shaurya', 'Atharva', 'Dhruv', 'Kabir', 'Rudra', 'Aarush', 'Advik', 'Pranav',
    'Ananya', 'Vedant', 'Rahul', 'Rohit', 'Raj', 'Amit', 'Sanjay', 'Vijay', 'Ramesh', 'Suresh',
    'Ashok', 'Manoj', 'Pankaj', 'Sanjeev', 'Ravi', 'Sunil', 'Anil', 'Rajesh', 'Mahesh', 'Dinesh'
  ],
  female: [
    'Ananya', 'Aadhya', 'Saanvi', 'Anika', 'Pari', 'Aaradhya', 'Aditi', 'Aarohi', 'Sara', 'Ira',
    'Diya', 'Riya', 'Kavya', 'Siya', 'Pihu', 'Aanya', 'Avni', 'Myra', 'Prisha', 'Sneha',
    'Priya', 'Neha', 'Pooja', 'Ritu', 'Sonia', 'Kiran', 'Meera', 'Sita', 'Gita', 'Radha',
    'Lakshmi', 'Saraswati', 'Parvati', 'Durga', 'Kali', 'Anita', 'Sunita', 'Rekha', 'Suman', 'Kavita'
  ],
  unisex: [
    'Arya', 'Aditya', 'Siddharth', 'Krishna', 'Shiva', 'Ganesh', 'Rama', 'Vishnu', 'Lakshman',
    'Arjun', 'Karan', 'Dev', 'Raj', 'Kumar', 'Singh', 'Sharma', 'Verma', 'Gupta', 'Joshi'
  ]
};

// Common Indian surnames by region/community
export const COMMON_INDIAN_SURNAMES = {
  north: ['Sharma', 'Verma', 'Gupta', 'Agarwal', 'Jain', 'Singh', 'Yadav', 'Kumar', 'Choudhary', 'Thakur'],
  south: ['Reddy', 'Rao', 'Nair', 'Pillai', 'Menon', 'Iyer', 'Naidu', 'Gowda', 'Raj', 'Chowdary'],
  east: ['Banerjee', 'Chatterjee', 'Mukherjee', 'Das', 'Bose', 'Sen', 'Ghosh', 'Mitra', 'Roy', 'Chakraborty'],
  west: ['Patel', 'Shah', 'Desai', 'Joshi', 'Kulkarni', 'Pawar', 'Bhosale', 'Chavan', 'Rane', 'Gaikwad'],
  central: ['Thakur', 'Chauhan', 'Rathore', 'Solanki', 'Parmar', 'Chandel', 'Bundela', 'Dixit', 'Tiwari', 'Pandey']
};

// Maximum lengths for different name parts
export const NAME_LENGTH_LIMITS = {
  firstName: { min: 2, max: 50 },
  middleName: { min: 0, max: 50 },
  lastName: { min: 1, max: 50 },
  title: { min: 0, max: 10 },
  preferredName: { min: 0, max: 50 }
};

/**
 * Validates an Indian name
 */
export function validateIndianName(name: IndianName): IndianNameValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Validate first name
  if (!name.firstName || name.firstName.trim().length === 0) {
    errors.push('First name is required');
  } else {
    const firstName = name.firstName.trim();
    
    if (firstName.length < NAME_LENGTH_LIMITS.firstName.min) {
      errors.push(`First name must be at least ${NAME_LENGTH_LIMITS.firstName.min} characters`);
    }
    
    if (firstName.length > NAME_LENGTH_LIMITS.firstName.max) {
      errors.push(`First name must not exceed ${NAME_LENGTH_LIMITS.firstName.max} characters`);
    }
    
    if (!/^[a-zA-Z\s\-']+$/.test(firstName)) {
      errors.push('First name can only contain letters, spaces, hyphens, and apostrophes');
    }
    
    // Check for common Indian first names
    const isCommonName = [
      ...COMMON_INDIAN_FIRST_NAMES.male,
      ...COMMON_INDIAN_FIRST_NAMES.female,
      ...COMMON_INDIAN_FIRST_NAMES.unisex
    ].some(common => common.toLowerCase() === firstName.toLowerCase());
    
    if (!isCommonName) {
      warnings.push('First name may not be a common Indian name');
    }
  }

  // Validate middle name (optional)
  if (name.middleName && name.middleName.trim().length > 0) {
    const middleName = name.middleName.trim();
    
    if (middleName.length > NAME_LENGTH_LIMITS.middleName.max) {
      errors.push(`Middle name must not exceed ${NAME_LENGTH_LIMITS.middleName.max} characters`);
    }
    
    if (!/^[a-zA-Z\s\-']+$/.test(middleName)) {
      errors.push('Middle name can only contain letters, spaces, hyphens, and apostrophes');
    }
  }

  // Validate last name
  if (!name.lastName || name.lastName.trim().length === 0) {
    errors.push('Last name is required');
  } else {
    const lastName = name.lastName.trim();
    
    if (lastName.length < NAME_LENGTH_LIMITS.lastName.min) {
      errors.push(`Last name must be at least ${NAME_LENGTH_LIMITS.lastName.min} character`);
    }
    
    if (lastName.length > NAME_LENGTH_LIMITS.lastName.max) {
      errors.push(`Last name must not exceed ${NAME_LENGTH_LIMITS.lastName.max} characters`);
    }
    
    if (!/^[a-zA-Z\s\-']+$/.test(lastName)) {
      errors.push('Last name can only contain letters, spaces, hyphens, and apostrophes');
    }
    
    // Check for common Indian surnames
    const allCommonSurnames = [
      ...COMMON_INDIAN_SURNAMES.north,
      ...COMMON_INDIAN_SURNAMES.south,
      ...COMMON_INDIAN_SURNAMES.east,
      ...COMMON_INDIAN_SURNAMES.west,
      ...COMMON_INDIAN_SURNAMES.central
    ];
    
    const isCommonSurname = allCommonSurnames.some(common => 
      common.toLowerCase() === lastName.toLowerCase()
    );
    
    if (!isCommonSurname) {
      warnings.push('Last name may not be a common Indian surname');
    }
  }

  // Validate title (optional)
  if (name.title && name.title.trim().length > 0) {
    const title = name.title.trim();
    
    if (!INDIAN_TITLES.includes(title as any)) {
      warnings.push(`Title '${title}' may not be a common Indian title`);
      suggestions.push(`Consider using: ${INDIAN_TITLES.join(', ')}`);
    }
  }

  // Validate preferred name (optional)
  if (name.preferredName && name.preferredName.trim().length > 0) {
    const preferredName = name.preferredName.trim();
    
    if (preferredName.length > NAME_LENGTH_LIMITS.preferredName.max) {
      errors.push(`Preferred name must not exceed ${NAME_LENGTH_LIMITS.preferredName.max} characters`);
    }
    
    if (!/^[a-zA-Z\s\-']+$/.test(preferredName)) {
      errors.push('Preferred name can only contain letters, spaces, hyphens, and apostrophes');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

/**
 * Validates a single first name
 */
export function validateIndianFirstName(firstName: string): IndianNameValidationResult {
  return validateIndianName({
    firstName,
    lastName: 'Doe' // Dummy last name for validation
  });
}

/**
 * Validates a single last name
 */
export function validateIndianLastName(lastName: string): IndianNameValidationResult {
  return validateIndianName({
    firstName: 'John', // Dummy first name for validation
    lastName
  });
}

/**
 * Suggests common Indian first names based on partial input
 */
export function suggestIndianFirstNames(partial: string, gender?: 'male' | 'female' | 'unisex'): string[] {
  const searchTerm = partial.toLowerCase();
  const names = gender ? COMMON_INDIAN_FIRST_NAMES[gender] : [
    ...COMMON_INDIAN_FIRST_NAMES.male,
    ...COMMON_INDIAN_FIRST_NAMES.female,
    ...COMMON_INDIAN_FIRST_NAMES.unisex
  ];
  
  return names
    .filter(name => name.toLowerCase().startsWith(searchTerm))
    .slice(0, 10);
}

/**
 * Suggests common Indian surnames based on partial input
 */
export function suggestIndianSurnames(partial: string, region?: keyof typeof COMMON_INDIAN_SURNAMES): string[] {
  const searchTerm = partial.toLowerCase();
  const surnames = region ? COMMON_INDIAN_SURNAMES[region] : [
    ...COMMON_INDIAN_SURNAMES.north,
    ...COMMON_INDIAN_SURNAMES.south,
    ...COMMON_INDIAN_SURNAMES.east,
    ...COMMON_INDIAN_SURNAMES.west,
    ...COMMON_INDIAN_SURNAMES.central
  ];
  
  return surnames
    .filter(surname => surname.toLowerCase().startsWith(searchTerm))
    .slice(0, 10);
}

/**
 * Formats an Indian name for display
 */
export function formatIndianName(name: IndianName, format: 'full' | 'short' | 'formal' = 'full'): string {
  const parts: string[] = [];
  
  if (name.title) {
    parts.push(name.title);
  }
  
  parts.push(name.firstName);
  
  if (name.middleName && name.middleName.trim().length > 0) {
    if (format === 'short') {
      parts.push(name.middleName.trim().charAt(0) + '.');
    } else {
      parts.push(name.middleName.trim());
    }
  }
  
  parts.push(name.lastName);
  
  if (name.preferredName && name.preferredName.trim().length > 0 && format === 'formal') {
    parts.push(`(${name.preferredName.trim()})`);
  }
  
  return parts.join(' ');
}

/**
 * Parses a full name into Indian name components
 */
export function parseIndianName(fullName: string): Partial<IndianName> {
  const parts = fullName.trim().split(/\s+/);
  
  if (parts.length === 0) {
    return {};
  }
  
  // Check if first part is a title
  let title: string | undefined;
  let nameStartIndex = 0;
  
  if (INDIAN_TITLES.includes(parts[0] as any)) {
    title = parts[0];
    nameStartIndex = 1;
  }
  
  // Extract name parts
  const nameParts = parts.slice(nameStartIndex);
  
  if (nameParts.length === 1) {
    // Single name - treat as first name
    return {
      title,
      firstName: nameParts[0],
      lastName: ''
    };
  } else if (nameParts.length === 2) {
    // Two names - first and last
    return {
      title,
      firstName: nameParts[0],
      lastName: nameParts[1]
    };
  } else {
    // Three or more names - first, middle, last
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    const middleName = nameParts.slice(1, -1).join(' ');
    
    return {
      title,
      firstName,
      middleName,
      lastName
    };
  }
}

/**
 * Generates a display name suitable for UI
 */
export function generateDisplayName(name: IndianName): string {
  if (name.preferredName && name.preferredName.trim().length > 0) {
    return name.preferredName.trim();
  }
  
  return name.firstName;
}

/**
 * Generates a formal salutation
 */
export function generateSalutation(name: IndianName): string {
  if (name.title) {
    return `${name.title} ${name.lastName}`;
  }
  
  return `${name.firstName} ${name.lastName}`;
}

/**
 * Validates name length limits
 */
export function validateNameLength(name: string, field: keyof typeof NAME_LENGTH_LIMITS): boolean {
  const limits = NAME_LENGTH_LIMITS[field];
  return name.length >= limits.min && name.length <= limits.max;
}

/**
 * Checks if a name contains only valid characters
 */
export function isValidNameCharacters(name: string): boolean {
  return /^[a-zA-Z\s\-']+$/.test(name);
}