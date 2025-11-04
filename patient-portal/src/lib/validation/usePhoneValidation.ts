import { useState, useCallback } from 'react';
import { 
  validateIndianPhoneNumber, 
  PhoneValidationResult,
  formatIndianPhoneNumber,
  normalizeIndianPhoneNumber,
  getIndianTelecomCircle,
  isValidForSMS
} from './phone';

interface UsePhoneValidationReturn {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  validation: PhoneValidationResult;
  isValid: boolean;
  error: string | undefined;
  formattedNumber: string;
  normalizedNumber: string;
  telecomCircle: string | null;
  canReceiveSMS: boolean;
  clear: () => void;
}

/**
 * React hook for Indian phone number validation
 * Provides real-time validation and formatting
 */
export function usePhoneValidation(initialValue: string = ''): UsePhoneValidationReturn {
  const [phoneNumber, setPhoneNumber] = useState(initialValue);
  
  const validation = validateIndianPhoneNumber(phoneNumber);
  
  const handleSetPhoneNumber = useCallback((value: string) => {
    // Allow only numbers, spaces, dashes, and + symbol
    const cleanedValue = value.replace(/[^\d+\s-]/g, '');
    setPhoneNumber(cleanedValue);
  }, []);
  
  const clear = useCallback(() => {
    setPhoneNumber('');
  }, []);
  
  return {
    phoneNumber,
    setPhoneNumber: handleSetPhoneNumber,
    validation,
    isValid: validation.isValid,
    error: validation.error,
    formattedNumber: validation.formattedNumber,
    normalizedNumber: validation.normalizedNumber,
    telecomCircle: getIndianTelecomCircle(phoneNumber),
    canReceiveSMS: isValidForSMS(phoneNumber),
    clear
  };
}