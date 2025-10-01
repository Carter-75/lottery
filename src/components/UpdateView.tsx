"use client";

import React, { useState } from 'react';
import Card from './Card';
import { LotteryData } from '../lib/types';
import { calculateUpdate, calculateWithdrawalLimits, formatMoney } from '../lib/lottery-logic';
import { downloadCSV, shareScenario, copyToClipboard } from '../lib/export-utils';

interface UpdateViewProps {
  data: LotteryData;
  onUpdate: (data: LotteryData) => void;
  onReset: () => void;
}

const UpdateView: React.FC<UpdateViewProps> = ({ data, onUpdate, onReset }) => {
  const [spending, setSpending] = useState('0.00');
  const [updateDate, setUpdateDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const withdrawalLimits = calculateWithdrawalLimits(data);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (window.confirm("Are you sure you want to process this update? This cannot be undone.")) {
      try {
        const updatedData = calculateUpdate(data, parseFloat(spending), new Date(updateDate));
        onUpdate(updatedData);
        setSpending('0.00');
      } catch (err: any) {
        setError(err.message || 'Failed to update.');
      }
    }
  };

  const handleExport = () => {
    try {
      downloadCSV(data);
    } catch (err) {
      setError('Failed to export data.');
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = shareScenario(data);
      await copyToClipboard(shareUrl);
      setShareMessage('Share URL copied to clipboard!');
      setTimeout(() => setShareMessage(null), 3000);
    } catch (err) {
      setError('Failed to copy share URL.');
    }
  };
  
  const SummaryItem: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
    <div className="level is-mobile">
      <div className="level-left">
        <p className="level-item">{label}</p>
      </div>
      <div className="level-right">
        <p className="level-item has-text-weight-bold">{typeof value === 'number' ? formatMoney(value) : value}</p>
      </div>
    </div>
  );

  const LimitsTable: React.FC<{limits: any, title: string}> = ({limits, title}) => (
    <div className="box">
        <h4 className="title is-4 has-text-centered" style={{color: 'var(--primary-orange)'}}>{title}</h4>
        <hr className="my-2" />
        {Object.entries(limits).map(([freq, value]: [string, any]) => (
            <div key={freq} className="level is-mobile">
                <div className="level-left"><span className="level-item is-capitalized">{freq}</span></div>
                <div className="level-right">
                    <div className="level-item has-text-right">
                        <p className="has-text-weight-bold">{formatMoney(value.nominal)}</p>
                        <p className="is-size-7" style={{color: 'var(--text-color-dark)'}}>(now: {formatMoney(value.real)})</p>
                    </div>
                </div>
            </div>
        ))}
    </div>
  );

  return (
    <div className="container">
      <div className="columns is-multiline is-centered">
        
        <div className="column is-12">
          <Card>
            <h2 className="title is-2 has-text-centered" style={{color: 'var(--primary-orange)'}}>Account Summary</h2>
            <hr/>
            <SummaryItem label="Lump Sum Balance" value={data.state.lump_balance} />
            <SummaryItem label="Annual Installments Balance" value={data.state.annual_balance} />
            <SummaryItem label="Last Update Date" value={data.state.last_update_date} />
            <SummaryItem label="Goal at Death" value={`${formatMoney(data.initial_parameters.user_inputs.ml)} (today's dollars)`} />
            {withdrawalLimits && (
                <SummaryItem 
                    label="Inflation-Adjusted Goal" 
                    value={withdrawalLimits.inflation_adjusted_target} 
                />
            )}
          </Card>
        </div>

        <div className="column is-12">
          <Card>
            <h2 className="title is-2 has-text-centered" style={{color: 'var(--primary-orange)'}}>Update Information</h2>
            <form onSubmit={handleUpdate}>
              <div className="field">
                <label htmlFor="updateDate" className="label">Today's date:</label>
                <div className="control">
                  <input
                    type="date"
                    id="updateDate"
                    value={updateDate}
                    onChange={e => setUpdateDate(e.target.value)}
                    required
                    className="input"
                    style={{ minHeight: '44px' }}
                    aria-label="Select today's date for the update"
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="spending" className="label">Amount spent since last update ($):</label>
                <div className="control">
                  <input
                    type="number"
                    id="spending"
                    step="0.01"
                    min="0"
                    value={spending}
                    onChange={e => setSpending(e.target.value)}
                    required
                    className="input"
                    inputMode="decimal"
                    placeholder="0.00"
                    style={{ minHeight: '44px' }}
                    aria-label="Enter the amount spent since the last update"
                  />
                </div>
              </div>
              {error && <div className="notification is-danger is-light">{error}</div>}
              <div className="field">
                <div className="control">
                    <button 
                      type="submit" 
                      className="button is-primary is-fullwidth is-large"
                      style={{ minHeight: '56px' }}
                      aria-label="Update balances and recalculate projections"
                    >
                        📈 Update & Recalculate
                    </button>
                </div>
              </div>
            </form>
          </Card>
        </div>

        {withdrawalLimits ? (
          <div className="column is-12">
            <Card>
                <h2 className="title is-2 has-text-centered" style={{color: 'var(--primary-orange)'}}>Sustainable Withdrawal Limits</h2>
                <div className="columns is-multiline">
                    <div className="column is-full-mobile is-6-tablet"><LimitsTable limits={withdrawalLimits.lump} title="Lump Sum" /></div>
                    <div className="column is-full-mobile is-6-tablet"><LimitsTable limits={withdrawalLimits.annual} title="Annual Installments" /></div>
                </div>
                <p className="has-text-centered" style={{color: 'var(--text-color-dark)'}}>
                    Time remaining: {withdrawalLimits.years_remaining.toFixed(1)} years
                </p>
            </Card>
          </div>
        ) : (
          <div className="column is-12">
            <Card>
                <div className="notification is-warning has-text-centered">Past predicted death. No withdrawal limits can be calculated.</div>
            </Card>
          </div>
        )}

        <div className="column is-12">
          <Card>
            <h3 className="title is-4 has-text-centered" style={{color: 'var(--primary-orange)'}}>Export & Share</h3>
            <div className="buttons is-centered">
              <button
                onClick={handleExport}
                className="button is-primary is-outlined"
                title="Export data to CSV file"
                style={{ minHeight: '48px', margin: '0.25rem' }}
                aria-label="Export lottery data to CSV file"
              >
                📊 Export CSV
              </button>
              <button
                onClick={handleShare}
                className="button is-primary is-outlined" 
                title="Copy shareable URL to clipboard"
                style={{ minHeight: '48px', margin: '0.25rem' }}
                aria-label="Copy shareable URL to clipboard"
              >
                🔗 Share Scenario
              </button>
            </div>
            {shareMessage && (
              <div className="notification is-success is-light has-text-centered">
                {shareMessage}
              </div>
            )}
          </Card>
        </div>

        <div className="column is-12 has-text-centered mt-5">
            <button
            onClick={() => { if (window.confirm("Are you sure you want to delete all data and start over?")) onReset() }}
            className="button is-danger is-outlined"
            style={{ minHeight: '48px' }}
            aria-label="Delete all data and start over with new lottery calculation"
            >
            🔄 Start Over (Delete All Data)
            </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateView; 