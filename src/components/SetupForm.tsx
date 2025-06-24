"use client";

import React, { useState } from 'react';
import Card from './Card';
import { calculateInitialData } from '../lib/lottery-logic';
import { LotteryData } from '../lib/types';

interface SetupFormProps {
  onSetupComplete: (data: LotteryData) => void;
}

const SetupForm: React.FC<SetupFormProps> = ({ onSetupComplete }) => {
  const [formData, setFormData] = useState({
    m: '',
    lst: '44.65',
    at: '44.65',
    mal: '30',
    s: '',
    yo: '',
    dd: '',
    ml: '',
    investment_tax_rate: '20',
    inflation_rate: '3.5',
    freq: 'daily',
    date: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
        const requiredFields: (keyof typeof formData)[] = ['m', 's', 'yo', 'dd', 'ml', 'investment_tax_rate', 'inflation_rate'];
        for(const field of requiredFields) {
            if(!formData[field]) {
                throw new Error(`Field "${field}" is required.`);
            }
        }

      const initialData = calculateInitialData({
        m: parseFloat(formData.m),
        lst: parseFloat(formData.lst),
        at: parseFloat(formData.at),
        mal: parseInt(formData.mal, 10),
        s: parseFloat(formData.s),
        yo: parseInt(formData.yo, 10),
        dd: parseInt(formData.dd, 10),
        ml: parseFloat(formData.ml),
        investment_tax_rate: parseFloat(formData.investment_tax_rate),
        inflation_rate: parseFloat(formData.inflation_rate),
        current_date: new Date(formData.date),
      });
      onSetupComplete(initialData);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please check your inputs.');
    }
  };

  const formFields = [
    { id: "m", label: "Total money won ($):", type: "number", required: true },
    { id: "lst", label: "Lump sum tax (%):", type: "number", required: true },
    { id: "at", label: "Annual installment tax (%):", type: "number", required: true },
    { id: "mal", label: "Years for annual installments:", type: "number", required: true },
    { id: "s", label: "Savings account APR (%):", type: "number", required: true },
    { id: "yo", label: "Your current age:", type: "number", required: true },
    { id: "dd", label: "Your expected age at death:", type: "number", required: true },
    { id: "ml", label: "Amount you want left at death ($):", type: "number", required: true },
    { id: "investment_tax_rate", label: "Tax Rate on Investment Gains (%):", type: "number", required: true, note: "20% is a recent estimate for the top federal bracket." },
    { id: "inflation_rate", label: "Estimated Annual Inflation (%):", type: "number", required: true, note: "3.5% is a recent approximate annual rate." },
  ];

  return (
    <Card>
      <h2 className="text-2xl font-bold text-accent mb-4 text-center">Lottery Setup</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {formFields.map(field => (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-medium text-text-secondary mb-1">
              {field.label}
            </label>
            <input
              type={field.type}
              id={field.id}
              name={field.id}
              value={formData[field.id as keyof typeof formData]}
              onChange={handleChange}
              required={field.required}
              className="w-full bg-entry-bg text-text border border-entry-border rounded-md p-2 focus:ring-accent focus:border-accent"
              placeholder={field.type === 'number' ? '0' : ''}
            />
            {field.note && <p className="text-xs text-text-secondary mt-1">{field.note}</p>}
          </div>
        ))}
        
        <div>
            <label htmlFor="freq" className="block text-sm font-medium text-text-secondary mb-1">
                Withdrawal frequency:
            </label>
            <select
                id="freq"
                name="freq"
                value={formData.freq}
                onChange={handleChange}
                className="w-full bg-entry-bg text-text border border-entry-border rounded-md p-2 focus:ring-accent focus:border-accent"
            >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Monthly</option>
            </select>
        </div>

        <div>
            <label htmlFor="date" className="block text-sm font-medium text-text-secondary mb-1">
                Today's date:
            </label>
            <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full bg-entry-bg text-text border border-entry-border rounded-md p-2 focus:ring-accent focus:border-accent"
            />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-run-button hover:bg-run-button-hover text-white font-bold py-3 px-4 rounded-md transition-colors duration-300"
        >
          Calculate Initial Withdrawals
        </button>
      </form>
    </Card>
  );
};

export default SetupForm; 