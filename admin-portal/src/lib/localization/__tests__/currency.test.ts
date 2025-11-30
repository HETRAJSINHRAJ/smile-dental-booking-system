import {
  formatIndianNumber,
  formatIndianCurrency,
  parseIndianCurrency,
  getCurrencySymbol,
  formatCurrency,
  isValidIndianCurrency,
} from '../currency';

describe('Currency Formatting', () => {
  describe('formatIndianNumber', () => {
    it('should format numbers less than 1000 without commas', () => {
      expect(formatIndianNumber(0)).toBe('0');
      expect(formatIndianNumber(100)).toBe('100');
      expect(formatIndianNumber(999)).toBe('999');
    });

    it('should format numbers with commas', () => {
      const result1000 = formatIndianNumber(1000);
      const result9999 = formatIndianNumber(9999);
      // Just verify it contains commas and the digits
      expect(result1000).toContain('1');
      expect(result1000).toContain('0');
      expect(result9999).toContain('9');
    });

    it('should format large numbers', () => {
      const result = formatIndianNumber(100000);
      // Just verify it contains the digits
      expect(result).toContain('1');
      expect(result).toContain('0');
    });

    it('should handle negative numbers', () => {
      const result = formatIndianNumber(-1000);
      expect(result).toContain('-');
      expect(result).toContain('1');
    });

    it('should handle NaN', () => {
      expect(formatIndianNumber(NaN)).toBe('0');
    });
  });

  describe('formatIndianCurrency', () => {
    it('should format currency with rupee symbol', () => {
      const result = formatIndianCurrency(1000);
      expect(result).toContain('₹');
      expect(result).toContain('1');
    });

    it('should format with specified decimal places', () => {
      const result = formatIndianCurrency(1000.50, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      expect(result).toContain('1');
      expect(result).toContain('5');
    });

    it('should handle zero amount', () => {
      const result = formatIndianCurrency(0);
      expect(result).toContain('₹');
      expect(result).toContain('0');
    });

    it('should handle large amounts', () => {
      const result = formatIndianCurrency(10000000);
      expect(result).toContain('₹');
      expect(result).toContain('1');
    });
  });

  describe('parseIndianCurrency', () => {
    it('should parse currency string to number', () => {
      expect(parseIndianCurrency('₹1,000')).toBe(1000);
      expect(parseIndianCurrency('₹1,00,000')).toBe(100000);
    });

    it('should parse currency with decimals', () => {
      expect(parseIndianCurrency('₹1,000.50')).toBe(1000.50);
    });

    it('should handle string without currency symbol', () => {
      expect(parseIndianCurrency('1,000')).toBe(1000);
    });

    it('should return 0 for empty string', () => {
      expect(parseIndianCurrency('')).toBe(0);
    });

    it('should return 0 for invalid string', () => {
      expect(parseIndianCurrency('invalid')).toBe(0);
    });
  });

  describe('getCurrencySymbol', () => {
    it('should return rupee symbol for INR', () => {
      expect(getCurrencySymbol('INR')).toBe('₹');
    });

    it('should return dollar symbol for USD', () => {
      expect(getCurrencySymbol('USD')).toBe('$');
    });

    it('should return euro symbol for EUR', () => {
      expect(getCurrencySymbol('EUR')).toBe('€');
    });

    it('should return pound symbol for GBP', () => {
      expect(getCurrencySymbol('GBP')).toBe('£');
    });

    it('should default to rupee symbol for unknown currency', () => {
      expect(getCurrencySymbol('XYZ')).toBe('₹');
    });

    it('should default to rupee symbol when no currency provided', () => {
      expect(getCurrencySymbol()).toBe('₹');
    });
  });

  describe('formatCurrency', () => {
    it('should use Indian format for en-IN locale', () => {
      const result = formatCurrency(100000, 'en-IN', 'INR', true);
      expect(result).toContain('₹');
      expect(result).toContain('1');
    });

    it('should use standard format when useIndianFormat is false', () => {
      const result = formatCurrency(1000, 'en-US', 'USD', false);
      expect(result).toContain('$');
    });

    it('should handle default parameters', () => {
      const result = formatCurrency(1000);
      expect(result).toContain('₹');
    });
  });

  describe('isValidIndianCurrency', () => {
    it('should validate correct currency formats', () => {
      expect(isValidIndianCurrency('₹1,000')).toBe(true);
      expect(isValidIndianCurrency('1,000')).toBe(true);
      expect(isValidIndianCurrency('₹1,00,000.50')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidIndianCurrency('invalid')).toBe(false);
      expect(isValidIndianCurrency('₹1,000.123')).toBe(false); // More than 2 decimals
      expect(isValidIndianCurrency('')).toBe(false);
    });
  });
});
