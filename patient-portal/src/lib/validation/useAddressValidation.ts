/**
 * React Hook for Indian Address Validation
 * 
 * This hook provides state management and validation for Indian addresses,
 * including real-time validation, suggestions, and formatting.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  IndianAddress,
  validateIndianAddress,
  validateIndianPinCode,
  validateIndianState,
  validateIndianCity,
  suggestIndianCities,
  formatIndianAddress,
  parseIndianAddress,
  getAllIndianStates,
  AddressValidationResult
} from './address';

export interface UseAddressValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  autoFormat?: boolean;
  suggestCities?: boolean;
  suggestStates?: boolean;
}

export interface UseAddressValidationReturn {
  // State
  address: Partial<IndianAddress>;
  validation: AddressValidationResult;
  isValid: boolean;
  isValidating: boolean;
  suggestions: {
    cities: string[];
    states: string[];
  };
  
  // Actions
  setAddress: (address: Partial<IndianAddress>) => void;
  updateField: (field: keyof IndianAddress, value: string) => void;
  validateAddress: () => Promise<AddressValidationResult>;
  formatAddress: () => string;
  parseRawAddress: (rawAddress: string) => Partial<IndianAddress>;
  reset: () => void;
  
  // Utility functions
  getStates: () => string[];
  suggestCities: (partial: string) => string[];
  validatePinCode: (pinCode: string) => AddressValidationResult;
  validateState: (state: string) => AddressValidationResult;
  validateCity: (city: string, state?: string) => AddressValidationResult;
}

/**
 * Hook for managing Indian address validation and state
 */
export function useAddressValidation(
  initialAddress: Partial<IndianAddress> = {},
  options: UseAddressValidationOptions = {}
): UseAddressValidationReturn {
  const {
    validateOnChange = true,
    validateOnBlur = false,
    autoFormat = true,
    suggestCities = true,
    suggestStates = true
  } = options;

  const [address, setAddress] = useState<Partial<IndianAddress>>({
    country: 'India',
    ...initialAddress
  });
  
  const [validation, setValidation] = useState<AddressValidationResult>({
    isValid: false,
    errors: [],
    warnings: []
  });
  
  const [isValidating, setIsValidating] = useState(false);
  const [suggestions, setSuggestions] = useState({
    cities: [] as string[],
    states: [] as string[]
  });

  // Validate address whenever it changes
  useEffect(() => {
    if (validateOnChange) {
      validateAddress();
    }
  }, [address, validateOnChange]);

  // Update city suggestions when city field changes
  useEffect(() => {
    if (suggestCities && address.city && address.city.length >= 2) {
      const citySuggestions = suggestIndianCities(address.city, address.state);
      setSuggestions(prev => ({ ...prev, cities: citySuggestions }));
    } else {
      setSuggestions(prev => ({ ...prev, cities: [] }));
    }
  }, [address.city, address.state, suggestCities]);

  /**
   * Updates the entire address object
   */
  const updateAddress = useCallback((newAddress: Partial<IndianAddress>) => {
    const updatedAddress = { ...address, ...newAddress };
    setAddress(updatedAddress);
    
    if (autoFormat) {
      // Auto-format certain fields
      if (updatedAddress.pinCode) {
        updatedAddress.pinCode = updatedAddress.pinCode.replace(/\s/g, '');
      }
      if (updatedAddress.state) {
        updatedAddress.state = updatedAddress.state.trim();
      }
      if (updatedAddress.city) {
        updatedAddress.city = updatedAddress.city.trim();
      }
    }
  }, [address, autoFormat]);

  /**
   * Updates a specific field in the address
   */
  const updateField = useCallback((field: keyof IndianAddress, value: string) => {
    updateAddress({ [field]: value });
  }, [updateAddress]);

  /**
   * Validates the current address
   */
  const validateAddress = useCallback(async (): Promise<AddressValidationResult> => {
    setIsValidating(true);
    
    try {
      const result = validateIndianAddress(address);
      setValidation(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, [address]);

  /**
   * Formats the current address
   */
  const formatAddress = useCallback((): string => {
    if (!address.line1 || !address.city || !address.state || !address.pinCode) {
      return '';
    }
    
    const completeAddress: IndianAddress = {
      line1: address.line1,
      line2: address.line2,
      landmark: address.landmark,
      city: address.city,
      district: address.district || address.city,
      state: address.state,
      pinCode: address.pinCode,
      country: address.country || 'India'
    };
    
    return formatIndianAddress(completeAddress);
  }, [address]);

  /**
   * Parses a raw address string
   */
  const parseRawAddress = useCallback((rawAddress: string): Partial<IndianAddress> => {
    const parsed = parseIndianAddress(rawAddress);
    const updatedAddress = { ...address, ...parsed };
    setAddress(updatedAddress);
    return updatedAddress;
  }, [address]);

  /**
   * Resets the address to initial state
   */
  const reset = useCallback(() => {
    setAddress({ country: 'India', ...initialAddress });
    setValidation({ isValid: false, errors: [], warnings: [] });
    setSuggestions({ cities: [], states: [] });
  }, [initialAddress]);

  /**
   * Gets all Indian states and UTs
   */
  const getStates = useCallback((): string[] => {
    return getAllIndianStates();
  }, []);

  /**
   * Suggests cities based on partial input
   */
  const getCitySuggestions = useCallback((partial: string): string[] => {
    return suggestIndianCities(partial, address.state);
  }, [address.state]);

  /**
   * Validates a PIN code
   */
  const validatePinCode = useCallback((pinCode: string): AddressValidationResult => {
    return validateIndianPinCode(pinCode);
  }, []);

  /**
   * Validates a state name
   */
  const validateState = useCallback((state: string): AddressValidationResult => {
    return validateIndianState(state);
  }, []);

  /**
   * Validates a city name
   */
  const validateCity = useCallback((city: string, state?: string): AddressValidationResult => {
    return validateIndianCity(city, state || address.state);
  }, [address.state]);

  return {
    // State
    address,
    validation,
    isValid: validation.isValid,
    isValidating,
    suggestions,
    
    // Actions
    setAddress: updateAddress,
    updateField,
    validateAddress,
    formatAddress,
    parseRawAddress,
    reset,
    
    // Utility functions
    getStates,
    suggestCities: getCitySuggestions,
    validatePinCode,
    validateState,
    validateCity
  };
}

/**
 * Hook for form field validation with blur handling
 */
export function useAddressFieldValidation(
  field: keyof IndianAddress,
  initialValue: string = ''
) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string>('');
  const [touched, setTouched] = useState(false);

  const validate = useCallback((currentValue: string): string => {
    let validationError = '';
    
    switch (field) {
      case 'pinCode':
        const pinResult = validateIndianPinCode(currentValue);
        if (!pinResult.isValid) {
          validationError = pinResult.errors[0] || 'Invalid PIN code';
        }
        break;
        
      case 'state':
        const stateResult = validateIndianState(currentValue);
        if (!stateResult.isValid) {
          validationError = stateResult.errors[0] || 'Invalid state';
        }
        break;
        
      case 'city':
        const cityResult = validateIndianCity(currentValue);
        if (!cityResult.isValid) {
          validationError = cityResult.errors[0] || 'Invalid city';
        }
        break;
        
      case 'line1':
        if (!currentValue || currentValue.trim().length === 0) {
          validationError = 'Address line 1 is required';
        } else if (currentValue.trim().length < 5) {
          validationError = 'Address line 1 should be at least 5 characters';
        }
        break;
    }
    
    return validationError;
  }, [field]);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    // Validate on change if field has been touched
    if (touched) {
      setError(validate(newValue));
    }
  }, [touched, validate]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    setError(validate(value));
  }, [value, validate]);

  return {
    value,
    error,
    touched,
    handleChange,
    handleBlur,
    setValue,
    setError
  };
}

/**
 * Hook for address autocomplete functionality
 */
export function useAddressAutocomplete(minLength: number = 3) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < minLength) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real implementation, this would call an API
      // For now, we'll use the suggestIndianCities function
      const citySuggestions = suggestIndianCities(searchQuery);
      setSuggestions(citySuggestions);
    } catch (err) {
      setError('Failed to fetch suggestions');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [minLength]);

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    search(value);
  }, [search]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    query,
    suggestions,
    loading,
    error,
    handleInputChange,
    clearSuggestions,
    setQuery
  };
}