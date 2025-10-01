"use client";

import React, { useState } from 'react';
import Card from './Card';
import { UserInputParameters, LotteryData } from '../lib/types';
import { calculateInitialLotteryData } from '../lib/lottery-logic';

interface SetupFormProps {
  onSetupComplete: (data: LotteryData) => void;
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
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.age <= 0 || formData.death_age <= 0) {
        setError("Please enter a valid age and life expectancy.");
        return;
    }
    if (formData.death_age <= formData.age) {
        setError("Life expectancy must be greater than current age.");
        return;
    }

    try {
      const initialData = calculateInitialLotteryData(formData);
      onSetupComplete(initialData);
    } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
    }
  };

  const formRow = (label: string, name: keyof UserInputParameters, type: string, helpText?: string, props: Record<string, any> = {}) => (
    <div className="field">
      <label htmlFor={name} className="label" style={{ color: 'var(--text-color)', fontSize: '0.95rem', fontWeight: '600' }}>
        {label}
      </label>
      <div className="control">
        <input
          className="input"
          type={type}
          id={name}
          name={name}
          value={String(formData[name])}
          onChange={handleChange}
          required
          aria-describedby={helpText ? `${name}-help` : undefined}
          style={{
            backgroundColor: 'var(--background-light)',
            color: 'var(--text-color)',
            border: '2px solid rgba(232, 93, 4, 0.3)',
            borderRadius: '8px',
            fontSize: '1rem',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            minHeight: '44px' // Ensure touch-friendly targets on mobile
          }}
          {...props}
        />
      </div>
      {helpText && <p id={`${name}-help`} className="help" style={{ color: 'var(--text-color-dark)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{helpText}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <h2 className="title is-3 has-text-centered" style={{ color: 'var(--primary-orange)' }}>Lottery Setup</h2>
        <hr className="my-3"/>
        
        <div className="columns is-multiline">
            <div className="column is-full">{formRow("Total money won ($)", "total_winnings", "number", "Enter your total lottery winnings amount", {step: 1000000, min: "0", inputMode: "numeric"})}</div>
            <div className="column is-full-mobile is-6-tablet">{formRow("Lump sum tax (%)", "lump_sum_tax", "number", "Estimated combined tax on lump sum.", {step: "0.1", min: "0", max: "100", inputMode: "decimal"})}</div>
            <div className="column is-full-mobile is-6-tablet">{formRow("Annual installment tax (%)", "annuity_tax", "number", "Estimated combined tax on annual payments.", {step: "0.1", min: "0", max: "100", inputMode: "decimal"})}</div>
            <div className="column is-full">{formRow("Savings account APR (%)", "savings_apr", "number", "The estimated annual return for all investments.", {step: 0.1, min: "0", max: "100", inputMode: "decimal"})}</div>
            <div className="column is-full-mobile is-6-tablet">{formRow("Your current age", "age", "number", "Your age today", {min: "1", max: "120", inputMode: "numeric"})}</div>
            <div className="column is-full-mobile is-6-tablet">{formRow("Your expected age at death", "death_age", "number", "Life expectancy estimate", {min: "1", max: "120", inputMode: "numeric"})}</div>
            <div className="column is-full-mobile is-6-tablet">{formRow("Years for annual installments", "years", "number", "The number of years the annuity pays out.", {min: "1", max: "50", inputMode: "numeric"})}</div>
            <div className="column is-full-mobile is-6-tablet">{formRow("Amount you want left at death ($)", "ml", "number", "Goal amount, in today's dollars, for inheritance.", {step: 100000, min: "0", inputMode: "numeric"})}</div>
        </div>

        <div className="notification is-themed-info mt-5">
            {formRow("Tax Rate on Investment Gains (%)", "investment_tax_rate", "number", "20% is a recent estimate for the top federal bracket.", { step: "0.1", min: "0", max: "100" })}
            {formRow("Estimated Annual Inflation (%)", "inflation_rate", "number", "3.5% is a recent approximate annual rate.", { step: "0.1", min: "0", max: "100" })}
        </div>
        
        {error && <div className="notification is-danger mt-4">{error}</div>}

        <div className="field mt-5">
          <div className="control">
            <button 
              type="submit" 
              className="button is-primary is-fullwidth is-large is-uppercase has-text-weight-bold" 
              style={{ 
                fontSize: '1.1rem', 
                padding: '1rem 2rem',
                minHeight: '56px' // Touch-friendly button size
              }}
              aria-label="Calculate lottery financial projections"
            >
              🚀 Calculate My Financial Future
            </button>
          </div>
        </div>
      </Card>
    </form>
  );
};

export default SetupForm; 