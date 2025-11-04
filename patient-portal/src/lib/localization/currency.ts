/**
 * Indian Rupee currency formatting utilities
 * Implements Indian number system formatting (lakhs, crores)
 */

export interface CurrencyFormatOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Format number according to Indian number system
 * Uses lakhs (1,00,000) and crores (1,00,00,000) format
 */
export function formatIndianNumber(amount: number): string {
  if (isNaN(amount)) return '0';
  
  // Convert to positive for formatting
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);
  
  // Handle amounts less than 1000
  if (absoluteAmount < 1000) {
    return isNegative ? `-${absoluteAmount.toString()}` : absoluteAmount.toString();
  }
  
  // Convert to string and reverse for easier processing
  const amountStr = absoluteAmount.toString();
  const reversed = amountStr.split('').reverse().join('');
  
  let formatted = '';
  
  // First 3 digits (hundreds)
  if (reversed.length >= 3) {
    formatted = reversed.substring(0, 3) + (reversed.length > 3 ? ',' : '');
  }
  
  // Remaining digits in groups of 2 (thousands, lakhs, crores)
  for (let i = 3; i < reversed.length; i += 2) {
    const group = reversed.substring(i, i + 2);
    if (group) {
      formatted = group + (reversed.length > i + 2 ? ',' : '') + formatted;
    }
  }
  
  // Reverse back and add negative sign if needed
  const result = formatted.split('').reverse().join('');
  return isNegative ? `-${result}` : result;
}

/**
 * Format currency in Indian Rupees with proper symbol and formatting
 */
export function formatIndianCurrency(
  amount: number, 
  options: CurrencyFormatOptions = {}
): string {
  const {
    locale = 'en-IN',
    currency = 'INR',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  } = options;
  
  try {
    // Use Intl.NumberFormat for proper currency formatting
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: minimumFractionDigits,
      maximumFractionDigits: maximumFractionDigits,
    });
    
    return formatter.format(amount);
  } catch (error) {
    // Fallback to manual formatting if Intl is not available
    const formattedNumber = formatIndianNumber(amount);
    return `₹${formattedNumber}`;
  }
}

/**
 * Parse Indian currency string back to number
 */
export function parseIndianCurrency(currencyString: string): number {
  if (!currencyString) return 0;
  
  // Remove currency symbol and commas
  const cleaned = currencyString
    .replace(/[₹$]/g, '')
    .replace(/,/g, '');
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Get currency symbol for display
 * Get currency symbol for display
 */
export function getCurrencySymbol(currencyCode: string = 'INR'): string {
  const symbols: Record<string, string> = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  };
  
  return symbols[currencyCode.toUpperCase()] || '₹';
}

/**
 * Format currency based on locale and preferences
 */
export function formatCurrency(
  amount: number,
  locale: string = 'en-IN',
  currency: string = 'INR',
  useIndianFormat: boolean = true
): string {
  if (useIndianFormat && (locale === 'en-IN' || locale === 'hi-IN')) {
    return formatIndianCurrency(amount, { locale, currency });
  }
  
  // Standard international formatting
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Validate if a string is a valid Indian currency format
 */
export function isValidIndianCurrency(currencyString: string): boolean {
  const pattern = /^[₹]?[\d,]+(\.\d{1,2})?$/;
  return pattern.test(currencyString.trim());
}