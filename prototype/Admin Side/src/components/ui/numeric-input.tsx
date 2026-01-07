import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { cn } from './utils';

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value?: number | string;
  onChange?: (value: string) => void;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  allowDecimal?: boolean;
  errorMessage?: string;
  className?: string;
}

export function NumericInput({
  value = '',
  onChange,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  precision = 1,
  allowDecimal = true,
  errorMessage,
  className,
  placeholder = "0-100",
  ...props
}: NumericInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setInternalValue(String(value || ''));
  }, [value]);

  const validateAndFormat = (inputValue: string) => {
    // Remove non-numeric characters
    let cleaned = inputValue.replace(/[^\d.-]/g, '');
    
    // Handle negative numbers
    if (cleaned.startsWith('-') && min >= 0) {
      cleaned = cleaned.substring(1);
    }
    
    // Handle decimal points
    if (!allowDecimal) {
      cleaned = cleaned.replace(/\./g, '');
    } else {
      // Allow only one decimal point
      const parts = cleaned.split('.');
      if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('');
      }
      
      // Limit decimal precision
      if (parts.length === 2 && parts[1].length > precision) {
        cleaned = parts[0] + '.' + parts[1].substring(0, precision);
      }
    }
    
    return cleaned;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedValue = validateAndFormat(inputValue);
    
    setInternalValue(formattedValue);
    setError('');
    
    // Call onChange callback
    if (onChange) {
      onChange(formattedValue);
    }
    
    // Validate range and call onValueChange
    if (formattedValue !== '') {
      const numValue = parseFloat(formattedValue);
      if (!isNaN(numValue)) {
        if (numValue < min) {
          setError(`Value must be at least ${min}`);
        } else if (numValue > max) {
          setError(`Value must be at most ${max}`);
        } else {
          setError('');
          if (onValueChange) {
            onValueChange(numValue);
          }
        }
      } else {
        setError('Please enter a valid number');
      }
    } else {
      if (onValueChange) {
        onValueChange(null);
      }
    }
  };

  const handleBlur = () => {
    // Format the value on blur
    if (internalValue !== '') {
      const numValue = parseFloat(internalValue);
      if (!isNaN(numValue) && numValue >= min && numValue <= max) {
        const formattedValue = allowDecimal ? 
          numValue.toFixed(precision).replace(/\.?0+$/, '') : 
          Math.round(numValue).toString();
        setInternalValue(formattedValue);
        if (onChange) {
          onChange(formattedValue);
        }
      }
    }
  };

  const displayError = error || errorMessage;

  return (
    <div className="space-y-1">
      <Input
        {...props}
        type="text"
        inputMode="decimal"
        value={internalValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          className,
          displayError && "border-red-500 focus:border-red-500"
        )}
        aria-invalid={!!displayError}
        aria-describedby={displayError ? `${props.id}-error` : undefined}
      />
      {displayError && (
        <p id={`${props.id}-error`} className="text-xs text-red-600">
          {displayError}
        </p>
      )}
    </div>
  );
}