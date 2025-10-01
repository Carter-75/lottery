"use client";

import React, { useState, useCallback } from 'react';
import Card from './Card';
import LoadingSpinner from './LoadingSpinner';
import { LotteryData } from '../lib/types';
import { calculateUpdate, calculateWithdrawalLimits, formatMoney } from '../lib/lottery-logic';
import { exportToCSV, exportToJSON, downloadCSV, downloadJSON } from '../lib/export-utils';

interface UpdateViewProps {
  data: LotteryData;
  onUpdate: (data: LotteryData) => void;
  onReset: () => void;
}

const UpdateView: React.FC<UpdateViewProps> = ({ data, onUpdate, onReset }) => {
  const [spending, setSpending] = useState('0.00');
  const [updateDate, setUpdateDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const withdrawalLimits = calculateWithdrawalLimits(data);

  const handleUpdate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!window.confirm("Are you sure you want to process this update? This cannot be undone.")) {
      return;
    }

    setIsUpdating(true);
    
    try {
      // Add delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      const updatedData = calculateUpdate(data, parseFloat(spending), new Date(updateDate));
      onUpdate(updatedData);
      setSpending('0.00');
    } catch (err: any) {
      setError(err.message || 'Failed to update.');
    } finally {
      setIsUpdating(false);
    }
  }, [data, spending, updateDate, onUpdate]);

  const handleExport = useCallback((format: 'csv' | 'json') => {
    try {
      if (format === 'csv') {
        downloadCSV(data, `lottery-data-${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        downloadJSON(data, `lottery-data-${new Date().toISOString().split('T')[0]}.json`);
      }
      setShowExportMenu(false);
    } catch (err) {
      setError('Failed to export data. Please try again.');
    }
  }, [data]);
  
  const SummaryItem: React.FC<{ 
    label: string; 
    value: string | number; 
    icon?: string;
    trend?: 'up' | 'down' | 'neutral';
    subtitle?: string;
  }> = ({ label, value, icon, trend, subtitle }) => (
    <div className="level is-mobile summary-item">
      <div className="level-left">
        <div className="level-item">
          {icon && <span className="icon mr-2">{icon}</span>}
          <div>
            <p className="has-text-weight-semibold">{label}</p>
            {subtitle && <p className="is-size-7" style={{color: 'var(--text-tertiary)'}}>{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="level-right">
        <div className="level-item has-text-right">
          <p className="has-text-weight-bold is-size-5" style={{color: 'var(--text-primary)'}}>
            {typeof value === 'number' ? formatMoney(value) : value}
          </p>
          {trend && (
            <span className={`tag is-small ${trend === 'up' ? 'is-success' : trend === 'down' ? 'is-danger' : 'is-info'}`}>
              {trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '→'}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const LimitsTable: React.FC<{limits: any, title: string, icon: string}> = ({limits, title, icon}) => (
    <div className="box limits-table">
      <div className="has-text-centered mb-4">
        <h4 className="title is-4" style={{color: 'var(--primary-400)'}}>
          <span className="mr-2">{icon}</span>
          {title}
        </h4>
      </div>
      <div className="divider mb-4"></div>
      {Object.entries(limits).map(([freq, value]: [string, any]) => (
        <div key={freq} className="level is-mobile limit-item">
          <div className="level-left">
            <span className="level-item is-capitalized has-text-weight-semibold">
              {freq}
            </span>
          </div>
          <div className="level-right">
            <div className="level-item has-text-right">
              <p className="has-text-weight-bold is-size-6" style={{color: 'var(--text-primary)'}}>
                {formatMoney(value.nominal)}
              </p>
              <p className="is-size-7" style={{color: 'var(--text-tertiary)'}}>
                Today's value: {formatMoney(value.real)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const yearsPassed = data.state.years_passed;
  const totalYears = data.initial_parameters.user_inputs.death_age - data.initial_parameters.user_inputs.age;
  const progressPercentage = Math.min((yearsPassed / totalYears) * 100, 100);

  return (
    <div className="container">
      <div className="columns is-multiline">
        
        {/* Header with Export */}
        <div className="column is-12">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <h1 className="title is-2" style={{color: 'var(--primary-400)'}}>
                  📊 Financial Dashboard
                </h1>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <div className={`dropdown ${showExportMenu ? 'is-active' : ''}`}>
                  <div className="dropdown-trigger">
                    <button 
                      className="button is-outlined"
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      title="Export Data"
                    >
                      <span className="button-text-responsive">📥 Export Data</span>
                      <span className="icon is-small">
                        <span>▼</span>
                      </span>
                    </button>
                  </div>
                  <div className="dropdown-menu">
                    <div className="dropdown-content">
                      <button 
                        className="dropdown-item button is-ghost"
                        onClick={() => handleExport('csv')}
                        title="Download CSV"
                      >
                        <span className="button-text-responsive">📄 Download CSV</span>
                      </button>
                      <button 
                        className="dropdown-item button is-ghost"
                        onClick={() => handleExport('json')}
                        title="Download JSON"
                      >
                        <span className="button-text-responsive">📋 Download JSON</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Life Progress */}
        <div className="column is-12">
          <Card>
            <div className="has-text-centered mb-4">
              <h3 className="title is-4" style={{color: 'var(--accent-400)'}}>
                🎯 Life Progress
              </h3>
            </div>
            <div className="progress-container">
              <progress 
                className="progress is-primary is-large" 
                value={progressPercentage} 
                max={100}
                style={{height: '1.5rem'}}
              >
                {progressPercentage}%
              </progress>
              <div className="level is-mobile mt-2">
                <div className="level-left">
                  <span className="is-size-7" style={{color: 'var(--text-tertiary)'}}>
                    {yearsPassed.toFixed(1)} years passed
                  </span>
                </div>
                <div className="level-right">
                  <span className="is-size-7" style={{color: 'var(--text-tertiary)'}}>
                    {withdrawalLimits?.years_remaining.toFixed(1) || '0'} years remaining
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Account Summary */}
        <div className="column is-12-tablet is-6-desktop">
          <Card>
            <div className="has-text-centered mb-5">
              <h2 className="title is-3" style={{color: 'var(--primary-400)'}}>
                💰 Account Summary
              </h2>
            </div>
            
            <SummaryItem 
              label="Lump Sum Balance" 
              value={data.state.lump_balance} 
              icon="🏦"
              subtitle="Current investment balance"
            />
            <SummaryItem 
              label="Annuity Balance" 
              value={data.state.annual_balance} 
              icon="📅"
              subtitle="Annual payments received"
            />
            <SummaryItem 
              label="Legacy Goal" 
              value={`${formatMoney(data.initial_parameters.user_inputs.ml)}`} 
              icon="🎁"
              subtitle="Target inheritance (today's value)"
            />
            {withdrawalLimits && (
              <SummaryItem 
                label="Future Legacy Value" 
                value={withdrawalLimits.inflation_adjusted_target} 
                icon="📈"
                subtitle="Inflation-adjusted target"
              />
            )}
            <div className="mt-4 pt-4" style={{borderTop: '1px solid var(--bg-quaternary)'}}>
              <SummaryItem 
                label="Last Updated" 
                value={data.state.last_update_date} 
                icon="🕐"
              />
            </div>
          </Card>
        </div>

        {/* Update Form */}
        <div className="column is-12-tablet is-6-desktop">
          <Card>
            <div className="has-text-centered mb-5">
              <h2 className="title is-3" style={{color: 'var(--primary-400)'}}>
                🔄 Update Account
              </h2>
            </div>
            
            <form onSubmit={handleUpdate}>
              <div className="field">
                <label htmlFor="updateDate" className="label has-text-weight-semibold">
                  📅 Update Date
                </label>
                <div className="control has-icons-left">
                  <input
                    type="date"
                    id="updateDate"
                    value={updateDate}
                    onChange={e => setUpdateDate(e.target.value)}
                    required
                    disabled={isUpdating}
                    className="input"
                  />
                  <span className="icon is-small is-left">
                    <span>📅</span>
                  </span>
                </div>
              </div>
              
              <div className="field">
                <label htmlFor="spending" className="label has-text-weight-semibold">
                  💸 Amount Spent Since Last Update
                </label>
                <div className="control has-icons-left">
                  <input
                    type="number"
                    id="spending"
                    step="0.01"
                    min="0"
                    value={spending}
                    onChange={e => setSpending(e.target.value)}
                    required
                    disabled={isUpdating}
                    className="input"
                    placeholder="0.00"
                  />
                  <span className="icon is-small is-left">
                    <span>💸</span>
                  </span>
                </div>
                <p className="help" style={{color: 'var(--text-tertiary)'}}>
                  Enter the total amount you've spent from your lottery winnings
                </p>
              </div>

              {error && (
                <div className="notification is-danger">
                  <button 
                    className="delete" 
                    onClick={() => setError(null)}
                    type="button"
                  ></button>
                  <strong>Error:</strong> {error}
                </div>
              )}

              <div className="field mt-5">
                <div className="control">
                  <button 
                    type="submit" 
                    className="button is-primary is-fullwidth is-large button-long-text"
                    disabled={isUpdating}
                    title="Update & Recalculate"
                  >
                    {isUpdating ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span className="ml-2">Updating...</span>
                      </>
                    ) : (
                      <span className="button-text-responsive">🔄 Update & Recalculate</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </Card>
        </div>

        {/* Withdrawal Limits */}
        {withdrawalLimits ? (
          <div className="column is-12">
            <Card>
              <div className="has-text-centered mb-6">
                <h2 className="title is-3" style={{color: 'var(--primary-400)'}}>
                  📊 Sustainable Withdrawal Limits
                </h2>
                <p className="subtitle is-6" style={{color: 'var(--text-secondary)'}}>
                  Safe spending amounts to preserve your legacy goal
                </p>
              </div>
              
              <div className="columns is-desktop">
                <div className="column">
                  <LimitsTable 
                    limits={withdrawalLimits.lump} 
                    title="Lump Sum Strategy" 
                    icon="🏦"
                  />
                </div>
                <div className="column">
                  <LimitsTable 
                    limits={withdrawalLimits.annual} 
                    title="Annuity Strategy" 
                    icon="📅"
                  />
                </div>
              </div>
              
              <div className="has-text-centered mt-5 p-4" style={{
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--bg-quaternary)'
              }}>
                <p className="has-text-weight-semibold" style={{color: 'var(--text-secondary)'}}>
                  ⏰ Planning Horizon: {withdrawalLimits.years_remaining.toFixed(1)} years remaining
                </p>
                <p className="is-size-7 mt-2" style={{color: 'var(--text-tertiary)'}}>
                  Calculations based on {data.initial_parameters.user_inputs.savings_apr}% investment return 
                  and {data.initial_parameters.inflation_rate}% inflation
                </p>
              </div>
            </Card>
          </div>
        ) : (
          <div className="column is-12">
            <Card>
              <div className="notification is-warning has-text-centered">
                <h4 className="title is-5">⚠️ Planning Period Complete</h4>
                <p>You've reached your expected lifespan. No withdrawal limits can be calculated.</p>
              </div>
            </Card>
          </div>
        )}

        {/* Reset Button */}
        <div className="column is-12">
          <div className="has-text-centered pt-5" style={{borderTop: '1px solid var(--bg-quaternary)'}}>
            <button
              onClick={() => { 
                if (window.confirm("⚠️ This will permanently delete all your data and start over. Are you absolutely sure?")) 
                  onReset() 
              }}
              className="button is-danger is-outlined button-extra-long"
              disabled={isUpdating}
              title="Start Over (Delete All Data)"
            >
              <span className="button-text-responsive">🗑️ Start Over (Delete All Data)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateView; 