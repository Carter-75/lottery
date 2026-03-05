"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Card from './Card';
import LoadingSpinner from './LoadingSpinner';
import { UserInputParameters, LotteryData } from '../lib/types';
import { calculateInitialLotteryData } from '../lib/lottery-logic';
import axios from 'axios';

interface SetupFormProps {
    onSetupComplete: (data: LotteryData) => void;
}

const US_STATES = [
    { name: 'Alabama', winningsTax: 5.0, interestTax: 5.0 },
    { name: 'Alaska', winningsTax: 0.0, interestTax: 0.0 },
    { name: 'Arizona', winningsTax: 2.5, interestTax: 2.5 },
    { name: 'Arkansas', winningsTax: 4.4, interestTax: 4.4 },
    { name: 'California', winningsTax: 0.0, interestTax: 13.3 }, // CA lottery is tax free state-level, but interest is taxed heavily
    { name: 'Colorado', winningsTax: 4.4, interestTax: 4.4 },
    { name: 'Connecticut', winningsTax: 6.99, interestTax: 6.99 },
    { name: 'Delaware', winningsTax: 0.0, interestTax: 6.6 }, // No DE lottery tax
    { name: 'Florida', winningsTax: 0.0, interestTax: 0.0 },
    { name: 'Georgia', winningsTax: 5.49, interestTax: 5.49 },
    { name: 'Hawaii', winningsTax: 11.0, interestTax: 11.0 }, // No lottery but if won out of state
    { name: 'Idaho', winningsTax: 5.8, interestTax: 5.8 },
    { name: 'Illinois', winningsTax: 4.95, interestTax: 4.95 },
    { name: 'Indiana', winningsTax: 3.05, interestTax: 3.05 },
    { name: 'Iowa', winningsTax: 5.7, interestTax: 5.7 },
    { name: 'Kansas', winningsTax: 5.7, interestTax: 5.7 },
    { name: 'Kentucky', winningsTax: 4.0, interestTax: 4.0 },
    { name: 'Louisiana', winningsTax: 4.25, interestTax: 4.25 },
    { name: 'Maine', winningsTax: 7.15, interestTax: 7.15 },
    { name: 'Maryland', winningsTax: 5.75, interestTax: 5.75 },
    { name: 'Massachusetts', winningsTax: 5.0, interestTax: 5.0 },
    { name: 'Michigan', winningsTax: 4.25, interestTax: 4.25 },
    { name: 'Minnesota', winningsTax: 9.85, interestTax: 9.85 },
    { name: 'Mississippi', winningsTax: 5.0, interestTax: 5.0 },
    { name: 'Missouri', winningsTax: 4.8, interestTax: 4.8 },
    { name: 'Montana', winningsTax: 5.9, interestTax: 5.9 },
    { name: 'Nebraska', winningsTax: 5.84, interestTax: 5.84 },
    { name: 'Nevada', winningsTax: 0.0, interestTax: 0.0 },
    { name: 'New Hampshire', winningsTax: 0.0, interestTax: 0.0 }, // Has interest tax only, repealing soon, treating as 0
    { name: 'New Jersey', winningsTax: 10.75, interestTax: 10.75 },
    { name: 'New Mexico', winningsTax: 5.9, interestTax: 5.9 },
    { name: 'New York', winningsTax: 8.82, interestTax: 8.82 },
    { name: 'North Carolina', winningsTax: 4.5, interestTax: 4.5 },
    { name: 'North Dakota', winningsTax: 2.5, interestTax: 2.5 },
    { name: 'Ohio', winningsTax: 3.5, interestTax: 3.5 },
    { name: 'Oklahoma', winningsTax: 4.75, interestTax: 4.75 },
    { name: 'Oregon', winningsTax: 9.9, interestTax: 9.9 },
    { name: 'Pennsylvania', winningsTax: 3.07, interestTax: 3.07 },
    { name: 'Rhode Island', winningsTax: 5.99, interestTax: 5.99 },
    { name: 'South Carolina', winningsTax: 6.4, interestTax: 6.4 },
    { name: 'South Dakota', winningsTax: 0.0, interestTax: 0.0 },
    { name: 'Tennessee', winningsTax: 0.0, interestTax: 0.0 },
    { name: 'Texas', winningsTax: 0.0, interestTax: 0.0 },
    { name: 'Utah', winningsTax: 4.65, interestTax: 4.65 },
    { name: 'Vermont', winningsTax: 8.75, interestTax: 8.75 },
    { name: 'Virginia', winningsTax: 5.75, interestTax: 5.75 },
    { name: 'Washington', winningsTax: 0.0, interestTax: 0.0 }, // No state income tax generally
    { name: 'West Virginia', winningsTax: 5.12, interestTax: 5.12 },
    { name: 'Wisconsin', winningsTax: 7.65, interestTax: 7.65 },
    { name: 'Wyoming', winningsTax: 0.0, interestTax: 0.0 },
];

const SetupForm: React.FC<SetupFormProps> = ({ onSetupComplete }) => {
    const [formData, setFormData] = useState<UserInputParameters>({
        entry_mode: 'cash_value',
        jackpot_annuity: 0,
        cash_value: 0,
        cash_value_ratio: 0.5,
        already_taxed: false,

        federal_tax_winnings: 37,
        state_tax_winnings: 0,
        local_tax_winnings: 0,

        savings_apr: 4.25,
        compound_frequency: 365,

        age: 20,
        death_age: 100,
        ml: 100000,

        filing_status: 'single',
        state_tax_interest: 0,
        local_tax_interest: 0,

        inflation_rate: 3.5,
    });

    const [selectedState, setSelectedState] = useState<string>('');
    const [detectingState, setDetectingState] = useState(true);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // Auto-detect user state on load
    useEffect(() => {
        const fetchState = async () => {
            try {
                const res = await axios.get('https://ipapi.co/json/');
                const stateName = res.data.region;
                if (stateName) {
                    const foundState = US_STATES.find(s => s.name === stateName);
                    if (foundState) {
                        handleStateSelection(foundState.name);
                    }
                }
            } catch (e) {
                console.warn("Could not geolocate IP for state taxes");
            } finally {
                setDetectingState(false);
            }
        };
        fetchState();
    }, []);

    const handleStateSelection = (stateName: string) => {
        setSelectedState(stateName);
        const s = US_STATES.find(s => s.name === stateName);
        if (s) {
            setFormData(prev => ({
                ...prev,
                state_tax_winnings: s.winningsTax,
                state_tax_interest: s.interestTax
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                state_tax_winnings: 0,
                state_tax_interest: 0
            }));
        }
    };

    const validateField = useCallback((name: keyof UserInputParameters, value: any): string | null => {
        if (typeof value === 'number') {
            if (['jackpot_annuity', 'cash_value', 'ml'].includes(name) && value < 0) return 'Cannot be negative';
            if (name === 'age' && (value <= 0 || value > 120)) return 'Invalid age';
            if (name === 'death_age' && (value <= formData.age || value > 120)) return 'Invalid life expectancy';
            if (name.includes('tax') && (value < 0 || value > 100)) return 'Tax rates must be 0-100%';
            if (name === 'savings_apr' && (value < 0 || value > 50)) return 'Unrealistic APR';
            if (name === 'inflation_rate' && (value < 0 || value > 50)) return 'Unrealistic inflation';
        }
        return null;
    }, [formData.age]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        let parsedValue: any = value;
        if (type === 'number') {
            // Allow empty string to let users clear the field, otherwise parse.
            parsedValue = value === '' ? '' : parseFloat(value);
            if (isNaN(parsedValue) && value !== '') parsedValue = 0;
        } else if (type === 'checkbox') {
            parsedValue = (e.target as HTMLInputElement).checked;
        }

        const fieldName = name as keyof UserInputParameters;

        setFormData(prev => ({
            ...prev,
            [fieldName]: parsedValue,
        }));

        if (type === 'number') {
            const error = validateField(fieldName, parsedValue);
            setErrors(prev => ({
                ...prev,
                [fieldName]: error || ''
            }));
        }
    }, [validateField]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        Object.entries(formData).forEach(([key, value]) => {
            const error = validateField(key as keyof UserInputParameters, value);
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
            await new Promise(resolve => setTimeout(resolve, 300));
            const initialData = calculateInitialLotteryData(formData);
            onSetupComplete(initialData);
        } catch (err: any) {
            setErrors({ form: err.message || "An unexpected error occurred." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep1 = () => (
        <div className="columns is-multiline">
            <div className="column is-12 mb-4">
                <div className="tabs is-toggle is-fullwidth">
                    <ul>
                        <li className={formData.entry_mode === 'cash_value' ? 'is-active' : ''}>
                            <a onClick={() => handleChange({ target: { name: 'entry_mode', value: 'cash_value', type: 'text' } } as any)}>
                                <span>💵 Enter Cash Value directly</span>
                            </a>
                        </li>
                        <li className={formData.entry_mode === 'annuity' ? 'is-active' : ''}>
                            <a onClick={() => handleChange({ target: { name: 'entry_mode', value: 'annuity', type: 'text' } } as any)}>
                                <span>🎰 Enter Advertised Jackpot (Annuity)</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {formData.entry_mode === 'cash_value' ? (
                <div className="column is-12">
                    <div className="field">
                        <label className="label">Lump Sum Cash Value <span className="has-text-danger">*</span></label>
                        <div className="control has-icons-left">
                            <input className="input is-large" type="number" name="cash_value" value={formData.cash_value || ''} onChange={handleChange} placeholder="e.g. 50000000" />
                            <span className="icon is-left">💰</span>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="column is-6">
                        <div className="field">
                            <label className="label">Advertised Jackpot <span className="has-text-danger">*</span></label>
                            <div className="control has-icons-left">
                                <input className="input is-large" type="number" name="jackpot_annuity" value={formData.jackpot_annuity || ''} onChange={handleChange} placeholder="e.g. 100000000" />
                                <span className="icon is-left">🎰</span>
                            </div>
                        </div>
                    </div>
                    <div className="column is-6">
                        <div className="field">
                            <label className="label">Cash Value Ratio (Typical: 0.45 - 0.55)</label>
                            <div className="control">
                                <input className="input is-large" type="number" step="0.01" name="cash_value_ratio" value={formData.cash_value_ratio} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="column is-12 mt-4">
                <div className="field">
                    <label className="checkbox box" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="checkbox" name="already_taxed" checked={formData.already_taxed} onChange={handleChange} />
                        <strong>Are these winnings already post-tax?</strong> (Check this if you are entering an amount that has already had taxes deducted)
                    </label>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="columns is-multiline">
            {!formData.already_taxed && (
                <div className="column is-12 mb-5">
                    <div className="notification is-info is-light">
                        <strong>Note:</strong> We attempt to auto-detect your state to pull the correct Winnings and Interest tax rates.
                    </div>

                    <div className="field">
                        <label className="label">Your US State</label>
                        <div className="control has-icons-left">
                            <div className={`select is-fullwidth ${detectingState ? 'is-loading' : ''}`}>
                                <select value={selectedState} onChange={(e) => handleStateSelection(e.target.value)}>
                                    <option value="">-- Manual entry (Select State) --</option>
                                    {US_STATES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>
                            <span className="icon is-left">📍</span>
                        </div>
                    </div>
                </div>
            )}

            {!formData.already_taxed && (
                <>
                    <div className="column is-4">
                        <div className="field">
                            <label className="label">Federal Tax (Winnings) %</label>
                            <div className="control">
                                <input className="input" type="number" step="0.1" name="federal_tax_winnings" value={formData.federal_tax_winnings} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                    <div className="column is-4">
                        <div className="field">
                            <label className="label">State Tax (Winnings) %</label>
                            <div className="control">
                                <input className="input" type="number" step="0.1" name="state_tax_winnings" value={formData.state_tax_winnings} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                    <div className="column is-4">
                        <div className="field">
                            <label className="label">Local Tax (Winnings) %</label>
                            <div className="control">
                                <input className="input" type="number" step="0.1" name="local_tax_winnings" value={formData.local_tax_winnings} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="column is-12 pt-5 mt-3" style={{ borderTop: '1px solid var(--bg-tertiary)' }}>
                <h4 className="title is-5 mb-4">Personal Info</h4>
            </div>

            <div className="column is-6">
                <div className="field">
                    <label className="label">Current Age <span className="has-text-danger">*</span></label>
                    <div className="control">
                        <input className="input" type="number" name="age" value={formData.age} onChange={handleChange} />
                    </div>
                </div>
            </div>
            <div className="column is-6">
                <div className="field">
                    <label className="label">Expected Life Expectancy <span className="has-text-danger">*</span></label>
                    <div className="control">
                        <input className="input" type="number" name="death_age" value={formData.death_age} onChange={handleChange} />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="columns is-multiline">
            <div className="column is-6">
                <div className="field">
                    <label className="label">Savings Return (APR) %</label>
                    <div className="control">
                        <input className="input" type="number" step="0.01" name="savings_apr" value={formData.savings_apr} onChange={handleChange} />
                    </div>
                    <p className="help">Typical safe bounds: 4% to 8%</p>
                </div>
            </div>
            <div className="column is-6">
                <div className="field">
                    <label className="label">Legacy Amount to leave behind</label>
                    <div className="control">
                        <input className="input" type="number" step="1000" name="ml" value={formData.ml} onChange={handleChange} />
                    </div>
                    <p className="help">Target remaining balance exactly at life expectancy</p>
                </div>
            </div>

            <div className="column is-12 pt-5 mt-3" style={{ borderTop: '1px solid var(--bg-tertiary)' }}>
                <h4 className="title is-5 mb-4">Taxes on Interest Income</h4>
            </div>

            <div className="column is-12">
                <div className="field">
                    <label className="label">Tax Filing Status</label>
                    <div className="control">
                        <div className="select is-fullwidth">
                            <select name="filing_status" value={formData.filing_status} onChange={handleChange}>
                                <option value="single">Single</option>
                                <option value="married_joint">Married Filing Jointly</option>
                                <option value="married_separate">Married Filing Separately</option>
                                <option value="head_of_household">Head of Household</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="column is-6">
                <div className="field">
                    <label className="label">State Income Tax %</label>
                    <div className="control">
                        <input className="input" type="number" step="0.1" name="state_tax_interest" value={formData.state_tax_interest} onChange={handleChange} />
                    </div>
                    <p className="help">Auto-filled if you selected a state</p>
                </div>
            </div>
            <div className="column is-6">
                <div className="field">
                    <label className="label">Local Income Tax %</label>
                    <div className="control">
                        <input className="input" type="number" step="0.1" name="local_tax_interest" value={formData.local_tax_interest} onChange={handleChange} />
                    </div>
                </div>
            </div>

            <div className="column is-12 pt-5 mt-3" style={{ borderTop: '1px solid var(--bg-tertiary)' }}>
                <h4 className="title is-5 mb-4">Economy Model</h4>
            </div>

            <div className="column is-6">
                <div className="field">
                    <label className="label">Inflation Rate %</label>
                    <div className="control">
                        <input className="input" type="number" step="0.1" name="inflation_rate" value={formData.inflation_rate} onChange={handleChange} />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <div className="has-text-centered mb-6">
                    <h2 className="title is-2" style={{ color: 'var(--primary-400)' }}>
                        💰 Lottery Calculator Setup
                    </h2>
                    <p className="subtitle is-5" style={{ color: 'var(--text-secondary)' }}>
                        Map out your exact deterministic withdrawal limits.
                    </p>
                </div>

                <div className="mb-6">
                    <div className="columns is-mobile is-multiline">
                        {['Lottery Winnings', 'Taxes & Info', 'Investments'].map((label, index) => (
                            <div key={index} className="column is-4-desktop is-12-mobile">
                                <div
                                    className={`box has-text-centered p-3 ${currentStep === index + 1 ? 'has-background-primary-light' : ''}`}
                                    style={{
                                        background: currentStep === index + 1 ? 'var(--primary-600)' :
                                            currentStep > index + 1 ? 'var(--success)' : 'var(--bg-tertiary)',
                                        color: currentStep >= index + 1 ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                        border: `2px solid ${currentStep === index + 1 ? 'var(--primary-400)' : 'transparent'}`,
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setCurrentStep(index + 1)}
                                >
                                    <span className="is-size-6 has-text-weight-bold">
                                        {index + 1}. {label}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                </div>

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

                    {currentStep < 3 ? (
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
                                className="button is-primary is-large button-long-text"
                                disabled={isSubmitting || Object.values(errors).some(err => err)}
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoadingSpinner size="small" />
                                        <span className="ml-2">Calculating...</span>
                                    </>
                                ) : (
                                    <span className="button-text-responsive">🚀 Calculate My Financial Plan</span>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {errors.form && (
                    <div className="notification is-danger mt-4">
                        <strong>Error:</strong> {errors.form}
                    </div>
                )}
            </Card>
        </form>
    );
};

export default SetupForm; 
