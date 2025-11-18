"use client";

import React, { useMemo } from 'react';
import { LotteryData } from '@/lib/types';
import { formatMoney } from '@/lib/lottery-logic';

interface ComparisonChartProps {
  data: LotteryData;
}

/**
 * Visual comparison between lump sum and annuity balances
 * Shows current balances with progress bars
 */
const ComparisonChart: React.FC<ComparisonChartProps> = ({ data }) => {
  const { lump_balance, annual_balance } = data.state;
  const total = lump_balance + annual_balance;
  
  const lumpPercentage = useMemo(() => {
    if (total === 0) return 0;
    return (lump_balance / total) * 100;
  }, [lump_balance, total]);

  const annuityPercentage = useMemo(() => {
    if (total === 0) return 0;
    return (annual_balance / total) * 100;
  }, [annual_balance, total]);

  return (
    <div className="comparison-chart">
      <div className="level is-mobile mb-4">
        <div className="level-item has-text-centered">
          <div>
            <p className="heading">Total Assets</p>
            <p className="title is-4" style={{ color: 'var(--gold-light)' }}>
              {formatMoney(total)}
            </p>
          </div>
        </div>
      </div>

      <div className="box">
        <div className="mb-4">
          <div className="level is-mobile">
            <div className="level-left">
              <p className="level-item has-text-weight-bold">Lump Sum Balance</p>
            </div>
            <div className="level-right">
              <p className="level-item has-text-weight-bold" style={{ color: 'var(--green-light)' }}>
                {formatMoney(lump_balance)} ({lumpPercentage.toFixed(1)}%)
              </p>
            </div>
          </div>
          <progress 
            className="progress is-success" 
            value={lumpPercentage} 
            max="100"
            aria-label={`Lump sum represents ${lumpPercentage.toFixed(1)}% of total assets`}
          >
            {lumpPercentage.toFixed(1)}%
          </progress>
        </div>

        <div>
          <div className="level is-mobile">
            <div className="level-left">
              <p className="level-item has-text-weight-bold">Annuity Balance</p>
            </div>
            <div className="level-right">
              <p className="level-item has-text-weight-bold" style={{ color: 'var(--gold-dark)' }}>
                {formatMoney(annual_balance)} ({annuityPercentage.toFixed(1)}%)
              </p>
            </div>
          </div>
          <progress 
            className="progress is-warning" 
            value={annuityPercentage} 
            max="100"
            aria-label={`Annuity represents ${annuityPercentage.toFixed(1)}% of total assets`}
          >
            {annuityPercentage.toFixed(1)}%
          </progress>
        </div>
      </div>

      <div className="content mt-4">
        <p className="has-text-centered" style={{ color: 'var(--text-color-dark)' }}>
          <small>
            Lump sum allows immediate access to funds. Annuity provides structured payments over time.
          </small>
        </p>
      </div>
    </div>
  );
};

export default ComparisonChart;

