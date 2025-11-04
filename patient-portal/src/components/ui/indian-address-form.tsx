/**
 * Indian Address Form Component
 * 
 * A comprehensive form component for collecting and validating Indian addresses
 * with real-time validation, suggestions, and proper formatting.
 */

import React, { useEffect, useState } from 'react';
import { useAddressValidation, useAddressFieldValidation } from '@/lib/validation/useAddressValidation';
import { IndianAddress } from '@/lib/validation/address';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IndianAddressFormProps {
  initialAddress?: Partial<IndianAddress>;
  onAddressChange?: (address: Partial<IndianAddress>, isValid: boolean) => void;
  onValidationComplete?: (validation: any) => void;
  showSuggestions?: boolean;
  autoFormat?: boolean;
  required?: boolean;
  className?: string;
}

export function IndianAddressForm({
  initialAddress = {},
  onAddressChange,
  onValidationComplete,
  showSuggestions = true,
  autoFormat = true,
  required = true,
  className
}: IndianAddressFormProps) {
  const {
    address,
    validation,
    isValid,
    isValidating,
    suggestions,
    setAddress,
    updateField,
    validateAddress,
    formatAddress,
    getStates,
    suggestCities
  } = useAddressValidation(initialAddress, {
    validateOnChange: true,
    autoFormat,
    suggestCities: showSuggestions
  });

  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showStateSuggestions, setShowStateSuggestions] = useState(false);
  const [formattedAddress, setFormattedAddress] = useState('');

  // Notify parent of address changes
  useEffect(() => {
    if (onAddressChange) {
      onAddressChange(address, isValid);
    }
  }, [address, isValid, onAddressChange]);

  // Notify parent of validation completion
  useEffect(() => {
    if (onValidationComplete) {
      onValidationComplete(validation);
    }
  }, [validation, onValidationComplete]);

  // Update formatted address when address changes
  useEffect(() => {
    if (isValid) {
      setFormattedAddress(formatAddress());
    } else {
      setFormattedAddress('');
    }
  }, [address, isValid, formatAddress]);

  const handleFieldUpdate = (field: keyof IndianAddress, value: string) => {
    updateField(field, value);
    
    // Handle suggestions visibility
    if (field === 'city') {
      setShowCitySuggestions(value.length >= 2 && suggestions.cities.length > 0);
    } else if (field === 'state') {
      setShowStateSuggestions(value.length >= 1 && suggestions.states.length > 0);
    }
  };

  const handleCitySelect = (city: string) => {
    updateField('city', city);
    setShowCitySuggestions(false);
  };

  const handleStateSelect = (state: string) => {
    updateField('state', state);
    setShowStateSuggestions(false);
  };

  const states = getStates();

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Indian Address
        </CardTitle>
        <CardDescription>
          Please provide your complete Indian address with PIN code
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Address Line 1 */}
        <div className="space-y-2">
          <Label htmlFor="line1" className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            Address Line 1
          </Label>
          <Input
            id="line1"
            value={address.line1 || ''}
            onChange={(e) => handleFieldUpdate('line1', e.target.value)}
            placeholder="House/Building number, Street name"
            className={cn(
              validation.errors.some(e => e.includes('line1')) && "border-red-500",
              validation.warnings.some(w => w.includes('line1')) && "border-yellow-500"
            )}
            required={required}
          />
          {validation.errors.some(e => e.includes('line1')) && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validation.errors.find(e => e.includes('line1'))}
            </p>
          )}
        </div>

        {/* Address Line 2 */}
        <div className="space-y-2">
          <Label htmlFor="line2">Address Line 2 (Optional)</Label>
          <Input
            id="line2"
            value={address.line2 || ''}
            onChange={(e) => handleFieldUpdate('line2', e.target.value)}
            placeholder="Apartment, Suite, Floor (if applicable)"
          />
        </div>

        {/* Landmark */}
        <div className="space-y-2">
          <Label htmlFor="landmark">Landmark (Optional)</Label>
          <Input
            id="landmark"
            value={address.landmark || ''}
            onChange={(e) => handleFieldUpdate('landmark', e.target.value)}
            placeholder="Near school, temple, market, etc."
          />
        </div>

        {/* City with suggestions */}
        <div className="space-y-2 relative">
          <Label htmlFor="city" className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            City
          </Label>
          <Input
            id="city"
            value={address.city || ''}
            onChange={(e) => handleFieldUpdate('city', e.target.value)}
            onFocus={() => setShowCitySuggestions(true)}
            onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
            placeholder="Enter your city"
            className={cn(
              validation.errors.some(e => e.includes('city')) && "border-red-500",
              validation.warnings.some(w => w.includes('city')) && "border-yellow-500"
            )}
            required={required}
          />
          
          {/* City Suggestions Dropdown */}
          {showCitySuggestions && suggestions.cities.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {suggestions.cities.map((city, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  onClick={() => handleCitySelect(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
          
          {validation.errors.some(e => e.includes('city')) && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validation.errors.find(e => e.includes('city'))}
            </p>
          )}
        </div>

        {/* State Selection */}
        <div className="space-y-2">
          <Label htmlFor="state" className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            State/Union Territory
          </Label>
          <Select
            value={address.state || ''}
            onValueChange={(value) => handleFieldUpdate('state', value)}
            required={required}
          >
            <SelectTrigger className={cn(
              validation.errors.some(e => e.includes('state')) && "border-red-500",
              validation.warnings.some(w => w.includes('state')) && "border-yellow-500"
            )}>
              <SelectValue placeholder="Select your state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {validation.errors.some(e => e.includes('state')) && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validation.errors.find(e => e.includes('state'))}
            </p>
          )}
        </div>

        {/* PIN Code */}
        <div className="space-y-2">
          <Label htmlFor="pinCode" className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            PIN Code
          </Label>
          <Input
            id="pinCode"
            value={address.pinCode || ''}
            onChange={(e) => handleFieldUpdate('pinCode', e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            maxLength={6}
            className={cn(
              validation.errors.some(e => e.includes('pin')) && "border-red-500",
              validation.warnings.some(w => w.includes('pin')) && "border-yellow-500"
            )}
            required={required}
          />
          
          {validation.errors.some(e => e.includes('pin')) && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validation.errors.find(e => e.includes('pin'))}
            </p>
          )}
          
          {validation.warnings.some(w => w.includes('pin')) && (
            <p className="text-sm text-yellow-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validation.warnings.find(w => w.includes('pin'))}
            </p>
          )}
        </div>

        {/* District (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="district">District (Optional)</Label>
          <Input
            id="district"
            value={address.district || ''}
            onChange={(e) => handleFieldUpdate('district', e.target.value)}
            placeholder="District (if different from city)"
          />
        </div>

        {/* Validation Status */}
        {validation.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fix the following errors: {validation.errors.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {validation.warnings.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please review: {validation.warnings.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {isValid && formattedAddress && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <strong>Formatted Address:</strong>
              <br />
              {formattedAddress}
            </AlertDescription>
          </Alert>
        )}

        {/* Validation Summary */}
        <div className="flex items-center justify-between text-sm">
          <span className={cn(
            "flex items-center gap-1",
            isValid ? "text-green-600" : "text-red-600"
          )}>
            {isValid ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Address is valid
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                Address needs corrections
              </>
            )}
          </span>
          
          {isValidating && (
            <span className="text-gray-500">Validating...</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Address Field Component for individual address fields
 */
interface AddressFieldProps {
  field: keyof IndianAddress;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function AddressField({
  field,
  value,
  onChange,
  label,
  placeholder,
  required = false,
  className
}: AddressFieldProps) {
  const {
    value: fieldValue,
    error,
    touched,
    handleChange,
    handleBlur
  } = useAddressFieldValidation(field, value);

  useEffect(() => {
    if (fieldValue !== value) {
      onChange(fieldValue);
    }
  }, [fieldValue, value, onChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor={field} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
        {label}
      </Label>
      <Input
        id={field}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          error && touched && "border-red-500",
          className
        )}
        required={required}
      />
      {error && touched && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}