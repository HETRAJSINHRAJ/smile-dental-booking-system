/**
 * Indian Name Form Component
 * 
 * A comprehensive form component for collecting and validating Indian names
 * with real-time validation, suggestions, and proper formatting.
 */

import React, { useEffect, useState } from 'react';
import { useIndianName, useNameFieldValidation } from '@/lib/validation/useIndianName';
import { IndianName, INDIAN_TITLES } from '@/lib/validation/indianNames';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IndianNameFormProps {
  initialName?: Partial<IndianName>;
  onNameChange?: (name: IndianName, isValid: boolean) => void;
  onValidationComplete?: (validation: any) => void;
  showSuggestions?: boolean;
  autoFormat?: boolean;
  required?: boolean;
  allowTitle?: boolean;
  allowMiddleName?: boolean;
  allowPreferredName?: boolean;
  className?: string;
}

export function IndianNameForm({
  initialName = {},
  onNameChange,
  onValidationComplete,
  showSuggestions = true,
  autoFormat = true,
  required = true,
  allowTitle = true,
  allowMiddleName = true,
  allowPreferredName = true,
  className
}: IndianNameFormProps) {
  const {
    name,
    validation,
    isValid,
    isValidating,
    suggestions,
    displayName,
    salutation,
    setName,
    updateField,
    validateName,
    formatName,
    parseFullName,
    reset
  } = useIndianName(initialName, {
    validateOnChange: true,
    autoFormat,
    suggestNames: showSuggestions,
    allowTitle,
    allowMiddleName,
    allowPreferredName
  });

  const [showFirstNameSuggestions, setShowFirstNameSuggestions] = useState(false);
  const [showLastNameSuggestions, setShowLastNameSuggestions] = useState(false);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'unisex'>('unisex');

  // Notify parent of name changes
  useEffect(() => {
    if (onNameChange) {
      onNameChange(name, isValid);
    }
  }, [name, isValid, onNameChange]);

  // Notify parent of validation completion
  useEffect(() => {
    if (onValidationComplete) {
      onValidationComplete(validation);
    }
  }, [validation, onValidationComplete]);

  const handleFieldUpdate = (field: keyof IndianName, value: string) => {
    updateField(field, value);
    
    // Handle suggestions visibility
    if (field === 'firstName') {
      setShowFirstNameSuggestions(value.length >= 2 && suggestions.firstNames.length > 0);
    } else if (field === 'lastName') {
      setShowLastNameSuggestions(value.length >= 2 && suggestions.lastNames.length > 0);
    }
  };

  const handleFirstNameSelect = (firstName: string) => {
    updateField('firstName', firstName);
    setShowFirstNameSuggestions(false);
  };

  const handleLastNameSelect = (lastName: string) => {
    updateField('lastName', lastName);
    setShowLastNameSuggestions(false);
  };

  const handleParseFullName = () => {
    const fullName = `${name.firstName} ${name.middleName || ''} ${name.lastName}`.trim();
    if (fullName) {
      parseFullName(fullName);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Indian Name
        </CardTitle>
        <CardDescription>
          Please provide your name as it appears on official documents
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Gender Selection for Better Suggestions */}
        {showSuggestions && (
          <div className="space-y-2">
            <Label htmlFor="gender">Gender (for name suggestions)</Label>
            <Select
              value={selectedGender}
              onValueChange={(value) => setSelectedGender(value as 'male' | 'female' | 'unisex')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unisex">Unisex</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Title Selection */}
        {allowTitle && (
          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Select
              value={name.title || ''}
              onValueChange={(value) => handleFieldUpdate('title', value)}
            >
              <SelectTrigger className={cn(
                validation.errors.some(e => e.includes('title')) && "border-red-500"
              )}>
                <SelectValue placeholder="Select title" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Title</SelectItem>
                {INDIAN_TITLES.map((title) => (
                  <SelectItem key={title} value={title}>
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {validation.errors.some(e => e.includes('title')) && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validation.errors.find(e => e.includes('title'))}
              </p>
            )}
          </div>
        )}

        {/* First Name with suggestions */}
        <div className="space-y-2 relative">
          <Label htmlFor="firstName" className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            First Name
          </Label>
          <Input
            id="firstName"
            value={name.firstName || ''}
            onChange={(e) => handleFieldUpdate('firstName', e.target.value)}
            onFocus={() => setShowFirstNameSuggestions(true)}
            onBlur={() => setTimeout(() => setShowFirstNameSuggestions(false), 200)}
            placeholder="Enter your first name"
            className={cn(
              validation.errors.some(e => e.includes('first')) && "border-red-500",
              validation.warnings.some(w => w.includes('first')) && "border-yellow-500"
            )}
            required={required}
          />
          
          {/* First Name Suggestions Dropdown */}
          {showFirstNameSuggestions && suggestions.firstNames.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {suggestions.firstNames.map((suggestedName, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  onClick={() => handleFirstNameSelect(suggestedName)}
                >
                  {suggestedName}
                </button>
              ))}
            </div>
          )}
          
          {validation.errors.some(e => e.includes('first')) && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validation.errors.find(e => e.includes('first'))}
            </p>
          )}
          
          {validation.warnings.some(w => w.includes('first')) && (
            <p className="text-sm text-yellow-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validation.warnings.find(w => w.includes('first'))}
            </p>
          )}
        </div>

        {/* Middle Name */}
        {allowMiddleName && (
          <div className="space-y-2">
            <Label htmlFor="middleName">Middle Name (Optional)</Label>
            <Input
              id="middleName"
              value={name.middleName || ''}
              onChange={(e) => handleFieldUpdate('middleName', e.target.value)}
              placeholder="Your middle name or father's name"
              className={cn(
                validation.errors.some(e => e.includes('middle')) && "border-red-500"
              )}
            />
            
            {validation.errors.some(e => e.includes('middle')) && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validation.errors.find(e => e.includes('middle'))}
              </p>
            )}
          </div>
        )}

        {/* Last Name with suggestions */}
        <div className="space-y-2 relative">
          <Label htmlFor="lastName" className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            Last Name / Surname
          </Label>
          <Input
            id="lastName"
            value={name.lastName || ''}
            onChange={(e) => handleFieldUpdate('lastName', e.target.value)}
            onFocus={() => setShowLastNameSuggestions(true)}
            onBlur={() => setTimeout(() => setShowLastNameSuggestions(false), 200)}
            placeholder="Your family name or surname"
            className={cn(
              validation.errors.some(e => e.includes('last')) && "border-red-500",
              validation.warnings.some(w => w.includes('last')) && "border-yellow-500"
            )}
            required={required}
          />
          
          {/* Last Name Suggestions Dropdown */}
          {showLastNameSuggestions && suggestions.lastNames.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {suggestions.lastNames.map((suggestedSurname, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  onClick={() => handleLastNameSelect(suggestedSurname)}
                >
                  {suggestedSurname}
                </button>
              ))}
            </div>
          )}
          
          {validation.errors.some(e => e.includes('last')) && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validation.errors.find(e => e.includes('last'))}
            </p>
          )}
          
          {validation.warnings.some(w => w.includes('last')) && (
            <p className="text-sm text-yellow-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validation.warnings.find(w => w.includes('last'))}
            </p>
          )}
        </div>

        {/* Preferred Name */}
        {allowPreferredName && (
          <div className="space-y-2">
            <Label htmlFor="preferredName">Preferred Name / Nickname (Optional)</Label>
            <Input
              id="preferredName"
              value={name.preferredName || ''}
              onChange={(e) => handleFieldUpdate('preferredName', e.target.value)}
              placeholder="What you'd like to be called"
              className={cn(
                validation.errors.some(e => e.includes('preferred')) && "border-red-500"
              )}
            />
            
            {validation.errors.some(e => e.includes('preferred')) && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validation.errors.find(e => e.includes('preferred'))}
              </p>
            )}
          </div>
        )}

        {/* Quick Parse Full Name */}
        <div className="flex gap-2">
          <Input
            placeholder="Or paste your full name here to auto-parse"
            onChange={(e) => {
              if (e.target.value.trim()) {
                parseFullName(e.target.value);
              }
            }}
            className="flex-1"
          />
          <button
            type="button"
            onClick={handleParseFullName}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Parse
          </button>
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

        {isValid && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <strong>Display Name:</strong> {displayName}
              <br />
              <strong>Formal Salutation:</strong> {salutation}
              <br />
              <strong>Full Name:</strong> {formatName('full')}
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
                Name is valid
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                Name needs corrections
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
 * Name Field Component for individual name fields
 */
interface NameFieldProps {
  field: 'firstName' | 'lastName' | 'middleName' | 'title' | 'preferredName';
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function NameField({
  field,
  value,
  onChange,
  label,
  placeholder,
  required = false,
  className
}: NameFieldProps) {
  const {
    value: fieldValue,
    error,
    touched,
    handleChange,
    handleBlur
  } = useNameFieldValidation(field, value);

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