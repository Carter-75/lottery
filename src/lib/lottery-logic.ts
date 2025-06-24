import { LotteryData, State, InitialParameters, UserInputParameters } from './types';

export function calculateInitialLotteryData(inputs: UserInputParameters): LotteryData {
  const { total_winnings, lump_sum_tax, annuity_tax, years } = inputs;

  // 1. Calculate the net lump sum
  const lump_sum_net = total_winnings * (1 - lump_sum_tax / 100);

  // 2. Calculate the annuity payments. Assume a 5% growth rate on payments.
  const annuity_growth_rate = 1.05;
  const gross_annuity_value = total_winnings * (1 - annuity_tax / 100);
  let base_annuity_payment = 0;
  if (annuity_growth_rate > 1.0) {
      base_annuity_payment = gross_annuity_value * (annuity_growth_rate - 1) / (Math.pow(annuity_growth_rate, years) - 1);
  } else {
      base_annuity_payment = gross_annuity_value / years;
  }
  
  const currentDate = new Date();
  const initial_parameters: InitialParameters = {
    user_inputs: inputs,
    start_year: currentDate.getFullYear(),
    lump_sum_net,
    base_annuity_payment,
    annuity_growth_rate,
    investment_tax_rate: inputs.investment_tax_rate,
    inflation_rate: inputs.inflation_rate
  };

  const state: State = {
    last_update_date: currentDate.toISOString().split('T')[0],
    lump_balance: lump_sum_net,
    annual_balance: base_annuity_payment, // Assume first payment is received immediately
    years_passed: 0,
  };

  return { initial_parameters, state };
}

export function calculateUpdate(
    currentData: LotteryData, 
    spending: number, 
    current_date: Date
): LotteryData {
    const { initial_parameters, state } = currentData;
    const last_update_date = new Date(state.last_update_date);

    if (current_date < last_update_date) {
        throw new Error("Current date cannot be before the last update date");
    }

    const days_passed = Math.round((current_date.getTime() - last_update_date.getTime()) / (1000 * 3600 * 24));
    const investment_apr = initial_parameters.user_inputs.savings_apr;
    const tax_rate = initial_parameters.investment_tax_rate / 100;

    const calculate_new_balance = (old_balance: number) => {
        if (old_balance <= 0) return 0;
        const monthly_rate = investment_apr / 100 / 12;
        const effective_daily_rate = Math.pow(1 + monthly_rate, 12 / 365) - 1;

        const gross_new_balance = old_balance * Math.pow(1 + effective_daily_rate, days_passed);
        const gain = gross_new_balance - old_balance;
        const tax_on_gain = gain > 0 ? gain * tax_rate : 0;
        return gross_new_balance - tax_on_gain;
    };

    let new_lump_balance = calculate_new_balance(state.lump_balance);
    let new_annual_balance = calculate_new_balance(state.annual_balance);

    // Add annuity payments
    const first_payment_year = initial_parameters.start_year;
    const last_update_year = last_update_date.getFullYear();
    const current_year = current_date.getFullYear();

    for (let year = last_update_year; year <= current_year; year++) {
      const years_since_start = year - first_payment_year;
      if (years_since_start <= 0 || years_since_start >= initial_parameters.user_inputs.years) {
          continue;
      }
      
      // Simple check for anniversary passing
      const anniversary_this_year = new Date(new Date(state.last_update_date).setFullYear(year));
      if (anniversary_this_year > last_update_date && anniversary_this_year <= current_date) {
          const new_payment = initial_parameters.base_annuity_payment * Math.pow(initial_parameters.annuity_growth_rate, years_since_start);
          new_annual_balance += new_payment;
      }
    }
    
    new_lump_balance -= spending;
    new_annual_balance -= spending;
    
    const total_days_passed = state.years_passed * 365.25 + days_passed;

    const newState: State = {
        ...state,
        lump_balance: new_lump_balance > 0 ? new_lump_balance : 0,
        annual_balance: new_annual_balance > 0 ? new_annual_balance : 0,
        last_update_date: current_date.toISOString().split('T')[0],
        years_passed: total_days_passed / 365.25,
    };

    return { initial_parameters, state: newState };
}

function calculateSustainableDailyWithdrawal(principal: number, target: number, daily_rate: number, num_days: number, tax_rate: number): number {
    if (num_days <= 0 || principal <= 0) return 0;
    
    const r = daily_rate;
    const n = num_days;
    const P = principal;
    const T = target;
    const t = tax_rate;
    
    const r_net = r * (1 - t);
    const R_net = Math.pow(1 + r_net, n);
    
    if (Math.abs(R_net - 1) < 1e-9) {
        return (P - T) / n;
    }
    
    const daily_withdrawal = (P * R_net - T) * r_net / (R_net - 1);
    return daily_withdrawal > 0 ? daily_withdrawal : 0;
}

export function calculateWithdrawalLimits(data: LotteryData) {
    const { initial_parameters, state } = data;
    const { user_inputs } = initial_parameters;
    
    const total_years_of_life = user_inputs.death_age - user_inputs.age;
    const years_remaining = total_years_of_life - state.years_passed;
    const days_remaining = years_remaining * 365.25;

    if (days_remaining <= 0) return null;
    
    const tax_rate = initial_parameters.investment_tax_rate / 100;
    const annual_inflation_rate = initial_parameters.inflation_rate / 100;
    const daily_inflation_rate = Math.pow(1 + annual_inflation_rate, 1 / 365) - 1;

    const target_today = user_inputs.ml;
    const inflation_adjusted_target = target_today * Math.pow(1 + daily_inflation_rate, days_remaining);

    const investment_apr = user_inputs.savings_apr;
    const monthly_rate = investment_apr / 100 / 12;
    const daily_rate = Math.pow(1 + monthly_rate, 12 / 365) - 1;

    // --- Lump Sum Calculation ---
    const daily_withdraw_lump = calculateSustainableDailyWithdrawal(state.lump_balance, inflation_adjusted_target, daily_rate, days_remaining, tax_rate);

    // --- Annuity Calculation ---
    let pv_future_payments = 0;
    const years_of_payments_made = Math.floor(state.years_passed);
    
    for (let i = years_of_payments_made + 1; i < user_inputs.years; i++) {
        const payment_amount = initial_parameters.base_annuity_payment * Math.pow(initial_parameters.annuity_growth_rate, i);
        const years_to_payment = i - state.years_passed;
        const days_to_payment = years_to_payment * 365.25;
        pv_future_payments += payment_amount / Math.pow(1 + daily_rate, days_to_payment);
    }

    const total_annuity_principal = state.annual_balance + pv_future_payments;
    const daily_withdraw_ann = calculateSustainableDailyWithdrawal(total_annuity_principal, inflation_adjusted_target, daily_rate, days_remaining, tax_rate);
    
    const get_limits = (daily_nominal: number) => {
        if (daily_nominal <= 0) {
            return {
                daily: { nominal: 0, real: 0 },
                weekly: { nominal: 0, real: 0 },
                biweekly: { nominal: 0, real: 0 },
                monthly: { nominal: 0, real: 0 },
            };
        }
        
        const n = days_remaining;
        const g = daily_inflation_rate;
        let daily_real = daily_nominal;

        if (g > 1e-9) {
            const pv_factor = (1 - Math.pow(1 + g, -n)) / g;
            daily_real = (daily_nominal / n) * pv_factor;
        }

        return {
            daily: { nominal: daily_nominal, real: daily_real },
            weekly: { nominal: daily_nominal * 7, real: daily_real * 7 },
            biweekly: { nominal: daily_nominal * 14, real: daily_real * 14 },
            monthly: { nominal: daily_nominal * 30.44, real: daily_real * 30.44 },
        }
    }

    return {
        lump: get_limits(daily_withdraw_lump),
        annual: get_limits(daily_withdraw_ann),
        years_remaining,
        inflation_adjusted_target,
    }
}

export const formatMoney = (value: number): string => {
    if (typeof value !== 'number' || !isFinite(value)) {
        return '$0.00';
    }
    if (value >= 1000000000) {
        return `$${(value / 1000000000).toFixed(2)}B`;
    }
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}; 