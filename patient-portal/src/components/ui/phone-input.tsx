import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { usePhoneValidation } from '@/lib/validation/usePhoneValidation';

export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  showValidation?: boolean;
  showTelecomCircle?: boolean;
  showSMSIndicator?: boolean;
  error?: string;
  className?: string;
}

/**
 * Indian phone number input component with real-time validation
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ 
    value, 
    onChange, 
    showValidation = true,
    showTelecomCircle = false,
    showSMSIndicator = false,
    error: externalError,
    className,
    placeholder = "+91 12345 67890",
    ...props 
  }, ref) => {
    const {
      phoneNumber,
      setPhoneNumber,
      validation,
      isValid,
      error: validationError,
      formattedNumber,
      telecomCircle,
      canReceiveSMS
    } = usePhoneValidation(value);
    
    const displayError = externalError || (showValidation && validationError);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setPhoneNumber(newValue);
      onChange(newValue);
    };
    
    return (
      <div className="space-y-2">
        <div className="relative">
          <input
            ref={ref}
            type="tel"
            value={phoneNumber}
            onChange={handleChange}
            placeholder={placeholder}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              showValidation && phoneNumber && !isValid && "border-red-500 focus-visible:ring-red-500",
              showValidation && phoneNumber && isValid && "border-green-500 focus-visible:ring-green-500",
              className
            )}
            {...props}
          />
          
          {showValidation && phoneNumber && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValid ? (
                <div className="w-4 h-4 text-green-500">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="w-4 h-4 text-red-500">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>
        
        {displayError && (
          <p className="text-sm text-red-600">{displayError}</p>
        )}
        
        {showValidation && phoneNumber && isValid && (
          <div className="text-sm space-y-1">
            
            {showTelecomCircle && telecomCircle && (
              <p className="text-gray-600">
                Telecom Circle: {telecomCircle}
              </p>
            )}
            
            {showSMSIndicator && (
              <p className={cn(
                "text-sm",
                canReceiveSMS ? "text-green-600" : "text-orange-600"
              )}>
                {canReceiveSMS ? "✓ Can receive SMS/OTP" : "⚠ SMS delivery not guaranteed"}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";