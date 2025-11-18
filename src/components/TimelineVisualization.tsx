"use client";

import React, { useMemo } from 'react';
import { LotteryData } from '@/lib/types';

interface TimelineVisualizationProps {
  data: LotteryData;
}

/**
 * Visual timeline showing progression through life expectancy
 * Displays years passed, current position, and years remaining
 */
const TimelineVisualization: React.FC<TimelineVisualizationProps> = ({ data }) => {
  const { user_inputs } = data.initial_parameters;
  const { years_passed } = data.state;

  const totalYears = user_inputs.death_age - user_inputs.age;
  const progressPercentage = useMemo(() => {
    return Math.min((years_passed / totalYears) * 100, 100);
  }, [years_passed, totalYears]);

  const yearsRemaining = Math.max(0, totalYears - years_passed);
  const currentAge = Math.min(user_inputs.age + years_passed, user_inputs.death_age);

  return (
    <div className="timeline-visualization">
      <h4 className="title is-5 has-text-centered mb-4" style={{ color: 'var(--gold-light)' }}>
        Life Expectancy Timeline
      </h4>

      <div className="box">
        <div className="level is-mobile mb-2">
          <div className="level-item has-text-centered">
            <div>
              <p className="heading">Current Age</p>
              <p className="title is-5">{currentAge.toFixed(1)}</p>
            </div>
          </div>
          <div className="level-item has-text-centered">
            <div>
              <p className="heading">Years Passed</p>
              <p className="title is-5">{years_passed.toFixed(1)}</p>
            </div>
          </div>
          <div className="level-item has-text-centered">
            <div>
              <p className="heading">Years Remaining</p>
              <p className="title is-5">{yearsRemaining.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="timeline-bar" style={{ position: 'relative', marginTop: '2rem' }}>
          <progress 
            className="progress is-primary" 
            value={progressPercentage} 
            max="100"
            style={{ height: '2rem' }}
            aria-label={`${progressPercentage.toFixed(1)}% of expected lifetime has passed`}
          >
            {progressPercentage.toFixed(1)}%
          </progress>
          
          <div style={{ 
            marginTop: '0.5rem', 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '0.875rem',
            color: 'var(--text-color-dark)'
          }}>
            <span>Age {user_inputs.age}</span>
            <span>{progressPercentage.toFixed(0)}% Complete</span>
            <span>Age {user_inputs.death_age}</span>
          </div>
        </div>

        {yearsRemaining < 10 && yearsRemaining > 0 && (
          <div className="notification is-warning mt-4">
            <p className="has-text-centered">
              <strong>Notice:</strong> Less than {Math.ceil(yearsRemaining)} years remaining in planning horizon.
              Consider adjusting your withdrawal strategy.
            </p>
          </div>
        )}

        {yearsRemaining <= 0 && (
          <div className="notification is-danger mt-4">
            <p className="has-text-centered">
              <strong>Warning:</strong> You have exceeded your planned life expectancy.
              Financial projections may no longer be accurate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineVisualization;

