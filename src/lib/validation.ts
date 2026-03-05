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

  // Cash value validation
  if (inputs.entry_mode === 'cash_value' && (!isFinite(inputs.cash_value) || inputs.cash_value < 0)) {
    errors.push({
      field: 'cash_value',
      message: 'Cash value must be a valid positive number'
    });
  }

  // Jackpot value validation
  if (inputs.entry_mode === 'annuity' && (!isFinite(inputs.jackpot_annuity) || inputs.jackpot_annuity < 0)) {
    errors.push({
      field: 'jackpot_annuity',
      message: 'Jackpot value must be a valid positive number'
    });
  }

  // Tax rate validations
  if (inputs.federal_tax_winnings < 0 || inputs.federal_tax_winnings > 100) {
    errors.push({
      field: 'federal_tax_winnings',
      message: 'Federal tax must be between 0% and 100%'
    });
  }
  if (inputs.state_tax_winnings < 0 || inputs.state_tax_winnings > 100) {
    errors.push({
      field: 'state_tax_winnings',
      message: 'State tax must be between 0% and 100%'
    });
  }
  if (inputs.local_tax_winnings < 0 || inputs.local_tax_winnings > 100) {
    errors.push({
      field: 'local_tax_winnings',
      message: 'Local tax must be between 0% and 100%'
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
  if (inputs.age < 0 || inputs.age > 120) {
    errors.push({
      field: 'age',
      message: 'Current age must be between 0 and 120'
    });
  }
  if (inputs.death_age < 0 || inputs.death_age > 150) {
    errors.push({
      field: 'death_age',
      message: 'Expected age at death must be between 0 and 150'
    });
  }
  if (inputs.death_age <= inputs.age) {
    errors.push({
      field: 'death_age',
      message: 'Expected age at death must be greater than current age'
    });
  }

  // Legacy amount validation
  if (inputs.ml < 0) {
    errors.push({
      field: 'ml',
      message: 'Legacy amount cannot be negative'
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

