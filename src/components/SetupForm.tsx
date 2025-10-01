"use client";

import React, { useState, useCallback } from 'react';
import Card from './Card';
import LoadingSpinner from './LoadingSpinner';
import { UserInputParameters, LotteryData } from '../lib/types';
import { calculateInitialLotteryData } from '../lib/lottery-logic';

interface SetupFormProps {
  onSetupComplete: (data: LotteryData) => void;
}

interface FormField {
  label: string;
  name: keyof UserInputParameters;
  type: string;
  helpText?: string;
  icon?: string;
  props?: Record<string, any>;
  validation?: (value: number) => string | null;
}

const SetupForm: React.FC<SetupFormProps> = ({ onSetupComplete }) => {
  const [formData, setFormData] = useState<UserInputParameters>({
    total_winnings: 0,
    lump_sum_tax: 37,
    annuity_tax: 25,
    savings_apr: 5,
    age: 0,
    death_age: 0,
    years: 30,
    ml: 0,
    investment_tax_rate: 20.0,
    inflation_rate: 3.5,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const validateField = useCallback((name: keyof UserInputParameters, value: number): string | null => {
    switch (name) {
      case 'total_winnings':
        return value <= 0 ? 'Please enter a valid lottery winning amount' : null;
      case 'age':
        return value <= 0 || value > 120 ? 'Please enter a valid age (1-120)' : null;
      case 'death_age':
        return value <= 0 || value > 120 ? 'Please enter a valid life expectancy (1-120)' : 
               value <= formData.age ? 'Life expectancy must be greater than current age' : null;
      case 'lump_sum_tax':
      case 'annuity_tax':
        return value < 0 || value > 100 ? 'Tax rate must be between 0% and 100%' : null;
      case 'savings_apr':
        return value < 0 || value > 50 ? 'APR must be between 0% and 50%' : null;
      case 'years':
        return value <= 0 || value > 50 ? 'Annuity years must be between 1 and 50' : null;
      case 'investment_tax_rate':
      case 'inflation_rate':
        return value < 0 || value > 100 ? 'Rate must be between 0% and 100%' : null;
      default:
        return null;
    }
  }, [formData.age]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const fieldName = name as keyof UserInputParameters;
    const numValue = type === 'number' ? parseFloat(value) || 0 : value as any;
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: numValue,
    }));

    // Real-time validation
    if (type === 'number') {
      const error = validateField(fieldName, numValue);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error || ''
      }));
    }
  }, [validateField]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key as keyof UserInputParameters, value as number);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      const initialData = calculateInitialLotteryData(formData);
      onSetupComplete(initialData);
    } catch (err: any) {
      setErrors({ form: err.message || "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFields: FormField[][] = [
    // Step 1: Basic Information
    [
      {
        label: "Total Lottery Winnings",
        name: "total_winnings",
        type: "number",
        helpText: "Enter the total amount you won before taxes",
        icon: "💰",
        props: { step: 1000000, min: 0, placeholder: "e.g., 100000000" }
      },
      {
        label: "Current Age",
        name: "age",
        type: "number",
        helpText: "Your current age in years",
        icon: "👤",
        props: { min: 1, max: 120, placeholder: "e.g., 35" }
      },
      {
        label: "Life Expectancy",
        name: "death_age",
        type: "number",
        helpText: "Expected age at death for planning purposes",
        icon: "📅",
        props: { min: 1, max: 120, placeholder: "e.g., 85" }
      },
    ],
    // Step 2: Tax Information
    [
      {
        label: "Lump Sum Tax Rate",
        name: "lump_sum_tax",
        type: "number",
        helpText: "Combined federal and state tax rate for lump sum (typically 37-50%)",
        icon: "📋",
        props: { step: 0.1, min: 0, max: 100, placeholder: "37" }
      },
      {
        label: "Annuity Tax Rate",
        name: "annuity_tax",
        type: "number",
        helpText: "Combined tax rate for annual payments (typically 25-40%)",
        icon: "📊",
        props: { step: 0.1, min: 0, max: 100, placeholder: "25" }
      },
      {
        label: "Annuity Payment Years",
        name: "years",
        type: "number",
        helpText: "Number of years the lottery pays annual installments",
        icon: "⏰",
        props: { min: 1, max: 50, placeholder: "30" }
      },
    ],
    // Step 3: Investment & Planning
    [
      {
        label: "Investment Return (APR)",
        name: "savings_apr",
        type: "number",
        helpText: "Expected annual return on your investments (conservative estimate: 4-7%)",
        icon: "📈",
        props: { step: 0.1, min: 0, max: 50, placeholder: "5" }
      },
      {
        label: "Legacy Amount",
        name: "ml",
        type: "number",
        helpText: "Amount you want to leave behind (in today's purchasing power)",
        icon: "🎁",
        props: { step: 100000, min: 0, placeholder: "e.g., 5000000" }
      },
    ],
    // Step 4: Advanced Settings
    [
      {
        label: "Investment Tax Rate",
        name: "investment_tax_rate",
        type: "number",
        helpText: "Tax rate on investment gains (typically 15-20% for long-term capital gains)",
        icon: "💼",
        props: { step: 0.1, min: 0, max: 100, placeholder: "20" }
      },
      {
        label: "Inflation Rate",
        name: "inflation_rate",
        type: "number",
        helpText: "Expected annual inflation rate (historical average: 2-4%)",
        icon: "📊",
        props: { step: 0.1, min: 0, max: 100, placeholder: "3.5" }
      },
    ]
  ];

  const FormField: React.FC<{ field: FormField }> = ({ field }) => (
    <div className="field">
      <label htmlFor={field.name} className="label has-text-weight-semibold">
        {field.icon && <span className="mr-2">{field.icon}</span>}
        {field.label}
        {field.name === 'total_winnings' || field.name === 'age' || field.name === 'death_age' ? 
          <span style={{ color: 'var(--error)' }}> *</span> : null}
      </label>
      <div className="control has-icons-left">
        <input
          className={`input ${errors[field.name] ? 'is-danger' : ''}`}
          type={field.type}
          id={field.name}
          name={field.name}
          value={String(formData[field.name])}
          onChange={handleChange}
          disabled={isSubmitting}
          {...field.props}
        />
        <span className="icon is-small is-left">
          <span>{field.icon || '💡'}</span>
        </span>
      </div>
      {field.helpText && (
        <p className="help" style={{ color: 'var(--text-tertiary)' }}>
          {field.helpText}
        </p>
      )}
      {errors[field.name] && (
        <p className="help is-danger">{errors[field.name]}</p>
      )}
    </div>
  );

  const totalSteps = formFields.length;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        {/* Header */}
        <div className="has-text-centered mb-6">
          <h2 className="title is-2" style={{ color: 'var(--primary-400)' }}>
            💰 Lottery Calculator Setup
          </h2>
          <p className="subtitle is-5" style={{ color: 'var(--text-secondary)' }}>
            Let's analyze your lottery winnings and create a financial plan
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="columns is-mobile is-multiline">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div key={index} className="column is-3-desktop is-6-mobile">
                <div 
                  className={`box has-text-centered p-3 ${currentStep === index + 1 ? 'has-background-primary-light' : ''}`}
                  style={{
                    background: currentStep === index + 1 ? 'var(--primary-600)' : 
                               currentStep > index + 1 ? 'var(--success)' : 'var(--bg-tertiary)',
                    color: currentStep >= index + 1 ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    border: `2px solid ${currentStep === index + 1 ? 'var(--primary-400)' : 'transparent'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCurrentStep(index + 1)}
                >
                  <span className="is-size-6 has-text-weight-bold">
                    {['Basic Info', 'Taxes', 'Investments', 'Advanced'][index]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="mb-6">
          <div className="columns is-multiline">
            {formFields[currentStep - 1]?.map((field) => (
              <div key={field.name} className="column is-6-desktop is-12-mobile">
                <FormField field={field} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="field is-grouped is-grouped-centered">
          {currentStep > 1 && (
            <div className="control">
              <button
                type="button"
                className="button is-outlined"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isSubmitting}
              >
                Previous
              </button>
            </div>
          )}
          
          {currentStep < totalSteps ? (
            <div className="control">
              <button
                type="button"
                className="button is-primary"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={isSubmitting}
              >
                Next Step
              </button>
            </div>
          ) : (
            <div className="control">
              <button 
                type="submit" 
                className="button is-primary is-large"
                disabled={isSubmitting || Object.values(errors).some(err => err)}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Calculating...</span>
                  </>
                ) : (
                  '🚀 Calculate My Financial Plan'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Form Error */}
        {errors.form && (
          <div className="notification is-danger mt-4">
            <strong>Error:</strong> {errors.form}
          </div>
        )}

        {/* Required Fields Note */}
        <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--bg-quaternary)' }}>
          <p className="has-text-centered is-size-7" style={{ color: 'var(--text-tertiary)' }}>
            <span style={{ color: 'var(--error)' }}>*</span> Required fields | 
            All calculations are estimates for planning purposes only
          </p>
        </div>
      </Card>
    </form>
  );
};

export default SetupForm; 