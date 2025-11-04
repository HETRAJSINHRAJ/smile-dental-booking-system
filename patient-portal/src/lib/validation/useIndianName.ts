/**
 * React Hook for Indian Name Validation
 * 
 * This hook provides state management and validation for Indian names,
 * including real-time validation, suggestions, and formatting.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  IndianName,
  validateIndianName,
  validateIndianFirstName,
  validateIndianLastName,
  suggestIndianFirstNames,
  suggestIndianSurnames,
  formatIndianName,
  parseIndianName,
  generateDisplayName,
  generateSalutation,
  IndianNameValidationResult
} from './indianNames';

export interface UseIndianNameOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  autoFormat?: boolean;
  suggestNames?: boolean;
  allowMiddleName?: boolean;
  allowTitle?: boolean;
  allowPreferredName?: boolean;
}

export interface UseIndianNameReturn {
  // State
  name: IndianName;
  validation: IndianNameValidationResult;
  isValid: boolean;
  isValidating: boolean;
  suggestions: {
    firstNames: string[];
    lastNames: string[];
  };
  displayName: string;
  salutation: string;
  
  // Actions
  setName: (name: IndianName) => void;
  updateField: (field: keyof IndianName, value: string) => void;
  validateName: () => Promise<IndianNameValidationResult>;
  formatName: (format?: 'full' | 'short' | 'formal') => string;
  parseFullName: (fullName: string) => IndianName;
  reset: () => void;
  
  // Utility functions
  suggestFirstNames: (partial: string, gender?: 'male' | 'female' | 'unisex') => string[];
  suggestLastNames: (partial: string, region?: any) => string[];
  validateFirstName: (firstName: string) => IndianNameValidationResult;
  validateLastName: (lastName: string) => IndianNameValidationResult;
}

/**
 * Hook for managing Indian name validation and state
 */
export function useIndianName(
  initialName: Partial<IndianName> = {},
  options: UseIndianNameOptions = {}
): UseIndianNameReturn {
  const {
    validateOnChange = true,
    validateOnBlur = false,
    autoFormat = true,
    suggestNames = true,
    allowMiddleName = true,
    allowTitle = true,
    allowPreferredName = true
  } = options;

  const [name, setName] = useState<IndianName>({
    firstName: '',
    lastName: '',
    ...initialName
  });
  
  const [validation, setValidation] = useState<IndianNameValidationResult>({
    isValid: false,
    errors: [],
    warnings: [],
    suggestions: []
  });
  
  const [isValidating, setIsValidating] = useState(false);
  const [suggestions, setSuggestions] = useState({
    firstNames: [] as string[],
    lastNames: [] as string[]
  });

  // Validate name whenever it changes
  useEffect(() => {
    if (validateOnChange) {
      validateName();
    }
  }, [name, validateOnChange]);

  // Update name suggestions when first name changes
  useEffect(() => {
    if (suggestNames && name.firstName && name.firstName.length >= 2) {
      const firstNameSuggestions = suggestIndianFirstNames(name.firstName);
      setSuggestions(prev => ({ ...prev, firstNames: firstNameSuggestions }));
    } else {
      setSuggestions(prev => ({ ...prev, firstNames: [] }));
    }
  }, [name.firstName, suggestNames]);

  // Update surname suggestions when last name changes
  useEffect(() => {
    if (suggestNames && name.lastName && name.lastName.length >= 2) {
      const lastNameSuggestions = suggestIndianSurnames(name.lastName);
      setSuggestions(prev => ({ ...prev, lastNames: lastNameSuggestions }));
    } else {
      setSuggestions(prev => ({ ...prev, lastNames: [] }));
    }
  }, [name.lastName, suggestNames]);

  /**
   * Updates the entire name object
   */
  const updateName = useCallback((newName: IndianName) => {
    const updatedName = { ...name, ...newName };
    
    if (autoFormat) {
      // Auto-format name fields
      updatedName.firstName = updatedName.firstName.trim();
      updatedName.lastName = updatedName.lastName.trim();
      if (updatedName.middleName) {
        updatedName.middleName = updatedName.middleName.trim();
      }
      if (updatedName.title) {
        updatedName.title = updatedName.title.trim();
      }
      if (updatedName.preferredName) {
        updatedName.preferredName = updatedName.preferredName.trim();
      }
    }
    
    setName(updatedName);
  }, [name, autoFormat]);

  /**
   * Updates a specific field in the name
   */
  const updateField = useCallback((field: keyof IndianName, value: string) => {
    updateName({ ...name, [field]: value } as IndianName);
  }, [name, updateName]);

  /**
   * Validates the current name
   */
  const validateName = useCallback(async (): Promise<IndianNameValidationResult> => {
    setIsValidating(true);
    
    try {
      const result = validateIndianName(name);
      setValidation(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, [name]);

  /**
   * Formats the current name
   */
  const formatName = useCallback((format: 'full' | 'short' | 'formal' = 'full'): string => {
    return formatIndianName(name, format);
  }, [name]);

  /**
   * Parses a full name string
   */
  const parseFullName = useCallback((fullName: string): IndianName => {
    const parsed = parseIndianName(fullName);
    const updatedName = { ...name, ...parsed };
    setName(updatedName);
    return updatedName;
  }, [name]);

  /**
   * Resets the name to initial state
   */
  const reset = useCallback(() => {
    setName({
      firstName: '',
      lastName: '',
      ...initialName
    });
    setValidation({
      isValid: false,
      errors: [],
      warnings: [],
      suggestions: []
    });
    setSuggestions({ firstNames: [], lastNames: [] });
  }, [initialName]);

  /**
   * Suggests first names based on partial input
   */
  const suggestFirstNames = useCallback((partial: string, gender?: 'male' | 'female' | 'unisex'): string[] => {
    return suggestIndianFirstNames(partial, gender);
  }, []);

  /**
   * Suggests last names based on partial input
   */
  const suggestLastNames = useCallback((partial: string, region?: any): string[] => {
    return suggestIndianSurnames(partial, region);
  }, []);

  /**
   * Validates a first name
   */
  const validateFirstName = useCallback((firstName: string): IndianNameValidationResult => {
    return validateIndianFirstName(firstName);
  }, []);

  /**
   * Validates a last name
   */
  const validateLastName = useCallback((lastName: string): IndianNameValidationResult => {
    return validateIndianLastName(lastName);
  }, []);

  // Calculate derived values
  const displayName = generateDisplayName(name);
  const salutation = generateSalutation(name);

  return {
    // State
    name,
    validation,
    isValid: validation.isValid,
    isValidating,
    suggestions,
    displayName,
    salutation,
    
    // Actions
    setName: updateName,
    updateField,
    validateName,
    formatName,
    parseFullName,
    reset,
    
    // Utility functions
    suggestFirstNames,
    suggestLastNames,
    validateFirstName,
    validateLastName
  };
}

/**
 * Hook for individual name field validation
 */
export function useNameFieldValidation(
  field: 'firstName' | 'lastName' | 'middleName' | 'title' | 'preferredName',
  initialValue: string = ''
) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string>('');
  const [touched, setTouched] = useState(false);

  const validate = useCallback((currentValue: string): string => {
    let validationError = '';
    
    switch (field) {
      case 'firstName':
        const firstResult = validateIndianFirstName(currentValue);
        if (!firstResult.isValid) {
          validationError = firstResult.errors[0] || 'Invalid first name';
        }
        break;
        
      case 'lastName':
        const lastResult = validateIndianLastName(currentValue);
        if (!lastResult.isValid) {
          validationError = lastResult.errors[0] || 'Invalid last name';
        }
        break;
        
      case 'middleName':
        if (currentValue.trim().length > 50) {
          validationError = 'Middle name must not exceed 50 characters';
        } else if (!/^[a-zA-Z\s\-']*$/.test(currentValue)) {
          validationError = 'Middle name can only contain letters, spaces, hyphens, and apostrophes';
        }
        break;
        
      case 'title':
        if (currentValue.trim().length > 10) {
          validationError = 'Title must not exceed 10 characters';
        }
        break;
        
      case 'preferredName':
        if (currentValue.trim().length > 50) {
          validationError = 'Preferred name must not exceed 50 characters';
        } else if (!/^[a-zA-Z\s\-']*$/.test(currentValue)) {
          validationError = 'Preferred name can only contain letters, spaces, hyphens, and apostrophes';
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
 * Hook for name autocomplete functionality
 */
export function useNameAutocomplete(type: 'firstName' | 'lastName', minLength: number = 2) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = useCallback(async (searchQuery: string, gender?: 'male' | 'female' | 'unisex') => {
    if (!searchQuery || searchQuery.length < minLength) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real implementation, this would call an API
      // For now, we'll use the suggest functions
      if (type === 'firstName') {
        const nameSuggestions = suggestIndianFirstNames(searchQuery, gender);
        setSuggestions(nameSuggestions);
      } else {
        const surnameSuggestions = suggestIndianSurnames(searchQuery);
        setSuggestions(surnameSuggestions);
      }
    } catch (err) {
      setError('Failed to fetch suggestions');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [type, minLength]);

  const handleInputChange = useCallback((value: string, gender?: 'male' | 'female' | 'unisex') => {
    setQuery(value);
    search(value, gender);
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