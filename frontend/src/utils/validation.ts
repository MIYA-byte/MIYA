/**
 * Form validation utilities for MIYA frontend application
 */

/**
 * Validation rules types
 */
export type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  isEmail?: boolean;
  isAddress?: boolean;
  isNumeric?: boolean;
  min?: number;
  max?: number;
  custom?: (value: string) => boolean;
  message?: string;
};

/**
 * Validation result
 */
export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

/**
 * Validates a single field against validation rules
 * @param value - The field value to validate
 * @param rules - Validation rules
 * @returns Validation result
 */
export const validateField = (value: string, rules: ValidationRule): ValidationResult => {
  // Check if required
  if (rules.required && (!value || value.trim() === '')) {
    return {
      isValid: false,
      message: rules.message || 'This field is required',
    };
  }

  // Skip other validations if field is not required and empty
  if (!rules.required && (!value || value.trim() === '')) {
    return { isValid: true };
  }

  // Check min length
  if (rules.minLength !== undefined && value.length < rules.minLength) {
    return {
      isValid: false,
      message: rules.message || `Must be at least ${rules.minLength} characters`,
    };
  }

  // Check max length
  if (rules.maxLength !== undefined && value.length > rules.maxLength) {
    return {
      isValid: false,
      message: rules.message || `Must be at most ${rules.maxLength} characters`,
    };
  }

  // Check pattern
  if (rules.pattern && !rules.pattern.test(value)) {
    return {
      isValid: false,
      message: rules.message || 'Invalid format',
    };
  }

  // Check email
  if (rules.isEmail && !validateEmail(value)) {
    return {
      isValid: false,
      message: rules.message || 'Invalid email address',
    };
  }

  // Check Solana address
  if (rules.isAddress && !validateAddress(value)) {
    return {
      isValid: false,
      message: rules.message || 'Invalid Solana address',
    };
  }

  // Check numeric
  if (rules.isNumeric) {
    const numValue = Number(value.replace(/,/g, ''));
    if (isNaN(numValue)) {
      return {
        isValid: false,
        message: rules.message || 'Must be a number',
      };
    }

    // Check min value
    if (rules.min !== undefined && numValue < rules.min) {
      return {
        isValid: false,
        message: rules.message || `Must be at least ${rules.min}`,
      };
    }

    // Check max value
    if (rules.max !== undefined && numValue > rules.max) {
      return {
        isValid: false,
        message: rules.message || `Must be at most ${rules.max}`,
      };
    }
  }

  // Check custom validation
  if (rules.custom && !rules.custom(value)) {
    return {
      isValid: false,
      message: rules.message || 'Invalid value',
    };
  }

  return { isValid: true };
};

/**
 * Validates a form with multiple fields
 * @param values - Object containing field values
 * @param validationSchema - Object containing validation rules for each field
 * @returns Object with validation results for each field
 */
export const validateForm = (
  values: Record<string, string>,
  validationSchema: Record<string, ValidationRule>
): Record<string, ValidationResult> => {
  const result: Record<string, ValidationResult> = {};

  for (const field in validationSchema) {
    if (Object.prototype.hasOwnProperty.call(validationSchema, field)) {
      result[field] = validateField(values[field] || '', validationSchema[field]);
    }
  }

  return result;
};

/**
 * Checks if all fields in a validation result are valid
 * @param validationResult - Validation result object
 * @returns Boolean indicating if form is valid
 */
export const isFormValid = (validationResult: Record<string, ValidationResult>): boolean => {
  return Object.values(validationResult).every(result => result.isValid);
};

/**
 * Validates an email address
 * @param email - Email address to validate
 * @returns Boolean indicating if email is valid
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a Solana address (base58 string with length 32-44)
 * @param address - Solana address to validate
 * @returns Boolean indicating if address is valid
 */
export const validateAddress = (address: string): boolean => {
  // Basic check: base58 characters only and correct length
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(address) && address.length >= 32 && address.length <= 44;
};

/**
 * Predefined validation rules for common fields
 */
export const validationRules = {
  // Solana address validation
  address: {
    required: true,
    isAddress: true,
    message: 'Please enter a valid Solana address',
  },
  
  // Required field validation
  required: {
    required: true,
    message: 'This field is required',
  },
  
  // Email validation
  email: {
    required: true,
    isEmail: true,
    message: 'Please enter a valid email address',
  },
  
  // Amount validation (positive number)
  amount: {
    required: true,
    isNumeric: true,
    min: 0,
    message: 'Please enter a valid amount',
  },
};

export default {
  validateField,
  validateForm,
  isFormValid,
  validateEmail,
  validateAddress,
  validationRules,
}; 