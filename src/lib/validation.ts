/**
 * Input validation utilities for lottery calculator
 * Ensures all user inputs meet business logic requirements
 */

import { UserInputParameters } from './types';

export interface ValidationError {
  field: keyof UserInputParameters;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates all user input parameters
 * @param inputs - User input parameters to validate
 * @returns Validation result with any errors found
 */
export function validateUserInputs(inputs: UserInputParameters): ValidationResult {
  const errors: ValidationError[] = [];

  // Total winnings validation
  if (inputs.total_winnings <= 0) {
    errors.push({
      field: 'total_winnings',
      message: 'Total winnings must be greater than $0'
    });
  }
  if (inputs.total_winnings > 10000000000) {
    errors.push({
      field: 'total_winnings',
      message: 'Total winnings exceeds maximum allowed value'
    });
  }

  // Tax rate validations
  if (inputs.lump_sum_tax < 0 || inputs.lump_sum_tax > 100) {
    errors.push({
      field: 'lump_sum_tax',
      message: 'Lump sum tax must be between 0% and 100%'
    });
  }
  if (inputs.annuity_tax < 0 || inputs.annuity_tax > 100) {
    errors.push({
      field: 'annuity_tax',
      message: 'Annuity tax must be between 0% and 100%'
    });
  }
  if (inputs.investment_tax_rate < 0 || inputs.investment_tax_rate > 100) {
    errors.push({
      field: 'investment_tax_rate',
      message: 'Investment tax rate must be between 0% and 100%'
    });
  }

  // APR validation
  if (inputs.savings_apr < -20 || inputs.savings_apr > 50) {
    errors.push({
      field: 'savings_apr',
      message: 'Savings APR must be between -20% and 50%'
    });
  }

  // Age validations
  if (inputs.age < 18 || inputs.age > 120) {
    errors.push({
      field: 'age',
      message: 'Current age must be between 18 and 120'
    });
  }
  if (inputs.death_age < 18 || inputs.death_age > 150) {
    errors.push({
      field: 'death_age',
      message: 'Expected age at death must be between 18 and 150'
    });
  }
  if (inputs.death_age <= inputs.age) {
    errors.push({
      field: 'death_age',
      message: 'Expected age at death must be greater than current age'
    });
  }

  // Years validation
  if (inputs.years < 1 || inputs.years > 100) {
    errors.push({
      field: 'years',
      message: 'Annuity years must be between 1 and 100'
    });
  }

  // Legacy amount validation
  if (inputs.ml < 0) {
    errors.push({
      field: 'ml',
      message: 'Legacy amount cannot be negative'
    });
  }
  if (inputs.ml > inputs.total_winnings * 10) {
    errors.push({
      field: 'ml',
      message: 'Legacy amount seems unrealistically high compared to winnings'
    });
  }

  // Inflation rate validation
  if (inputs.inflation_rate < -10 || inputs.inflation_rate > 50) {
    errors.push({
      field: 'inflation_rate',
      message: 'Inflation rate must be between -10% and 50%'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitizes numeric input to ensure it's a valid number
 * @param value - Input value to sanitize
 * @param defaultValue - Default value if sanitization fails
 * @returns Sanitized numeric value
 */
export function sanitizeNumericInput(value: string | number, defaultValue: number = 0): number {
  if (typeof value === 'number') {
    return isFinite(value) ? value : defaultValue;
  }
  
  const parsed = parseFloat(value);
  return isFinite(parsed) ? parsed : defaultValue;
}

/**
 * Formats validation errors for display
 * @param errors - Array of validation errors
 * @returns Formatted error message
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0].message;
  return errors.map((err, idx) => `${idx + 1}. ${err.message}`).join('\n');
}

