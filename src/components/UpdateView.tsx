"use client";

import React, { useState, useEffect } from 'react';
import Card from './Card';
import { LotteryData } from '../lib/types';
import { calculateUpdate, calculateWithdrawalLimits, formatMoney } from '../lib/lottery-logic';

interface UpdateViewProps {
  data: LotteryData;
  onUpdate: (data: LotteryData) => void;
  onReset: () => void;
}

interface Limits {
    daily: { nominal: number, real: number },
    weekly: { nominal: number, real: number },
    biweekly: { nominal: number, real: number },
    monthly: { nominal: number, real: number },
}

const UpdateView: React.FC<UpdateViewProps> = ({ data, onUpdate, onReset }) => {
  const [spending, setSpending] = useState('0.00');
  const [updateDate, setUpdateDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);

  const withdrawalLimits = calculateWithdrawalLimits(data);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const updatedData = calculateUpdate(data, parseFloat(spending), new Date(updateDate));
      onUpdate(updatedData);
      setSpending('0.00');
    } catch (err: any) {
      setError(err.message || 'Failed to update.');
    }
  };
  
  const SummaryItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2">
      <span className="text-text-secondary">{label}</span>
      <span className="font-mono text-text">{value}</span>
    </div>
  );

  const LimitsTable: React.FC<{limits: Limits, title: string}> = ({limits, title}) => (
    <div>
        <h4 className="text-lg font-bold text-accent mb-2">{title}</h4>
        {Object.entries(limits).map(([freq, value]) => (
            <div key={freq} className="flex justify-between items-center py-1">
                <span className="capitalize text-text-secondary">{freq}</span>
                <div className="flex flex-col items-end">
                    <span className="font-mono text-text">{formatMoney(value.nominal)}</span>
                    <span className="font-mono text-xs text-text-secondary">(now: {formatMoney(value.real)})</span>
                </div>
            </div>
        ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-bold text-accent mb-4 text-center">Account Summary</h2>
        <SummaryItem label="Lump Sum Balance" value={formatMoney(data.state.lump_balance)} />
        <SummaryItem label="Annual Installments Balance" value={formatMoney(data.state.annual_balance)} />
        <SummaryItem label="Last Update Date" value={data.state.last_update_date} />
        <SummaryItem label="Goal at Death" value={`${formatMoney(data.initial_parameters.ml)} (today's dollars)`} />
        {withdrawalLimits && (
            <SummaryItem 
                label="Inflation-Adjusted Goal" 
                value={`${formatMoney(withdrawalLimits.inflation_adjusted_target)} (future dollars)`} 
            />
        )}
      </Card>

      <Card>
        <h2 className="text-2xl font-bold text-accent mb-4 text-center">Update Information</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label htmlFor="updateDate" className="block text-sm font-medium text-text-secondary mb-1">
              Today's date:
            </label>
            <input
              type="date"
              id="updateDate"
              value={updateDate}
              onChange={e => setUpdateDate(e.target.value)}
              required
              className="w-full bg-entry-bg text-text border border-entry-border rounded-md p-2"
            />
          </div>
          <div>
            <label htmlFor="spending" className="block text-sm font-medium text-text-secondary mb-1">
              Amount spent since last update ($):
            </label>
            <input
              type="number"
              id="spending"
              value={spending}
              onChange={e => setSpending(e.target.value)}
              required
              className="w-full bg-entry-bg text-text border border-entry-border rounded-md p-2"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-run-button hover:bg-run-button-hover text-white font-bold py-3 px-4 rounded-md">
            Update & Recalculate
          </button>
        </form>
      </Card>

      {withdrawalLimits ? (
        <Card>
            <h2 className="text-2xl font-bold text-accent mb-4 text-center">Sustainable Withdrawal Limits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LimitsTable limits={withdrawalLimits.lump} title="Lump Sum" />
                <LimitsTable limits={withdrawalLimits.annual} title="Annual Installments" />
            </div>
            <p className="text-center text-text-secondary mt-4">
                Time remaining: {withdrawalLimits.years_remaining.toFixed(1)} years
            </p>
        </Card>
      ) : (
        <Card>
            <p className="text-center text-red-500">Past predicted death date. No withdrawal limits can be calculated.</p>
        </Card>
      )}

      <div className="text-center">
        <button
          onClick={onReset}
          className="bg-reset-button hover:bg-reset-button-hover text-white font-bold py-2 px-4 rounded-md"
        >
          Start Over (Delete All Data)
        </button>
      </div>
    </div>
  );
};

export default UpdateView; 