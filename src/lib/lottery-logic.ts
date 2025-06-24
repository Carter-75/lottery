import { LotteryData, State, InitialParameters } from './types';

export function calculateInitialData(inputs: {
  m: number;
  lst: number;
  at: number;
  mal: number;
  s: number;
  yo: number;
  dd: number;
  ml: number;
  investment_tax_rate: number;
  inflation_rate: number;
  current_date: Date;
}): LotteryData {
  const { m, lst, at, mal, s, yo, dd, ml, investment_tax_rate, inflation_rate, current_date } = inputs;

  const years_to_add = dd - yo;
  let predicted_death_date = new Date(current_date);
  predicted_death_date.setFullYear(current_date.getFullYear() + years_to_add);

  // Lump Sum Scenario: User receives the full net lump sum.
  const net_lump = m * (1 - lst / 100.0);
  const lump_balance = net_lump;

  // Annual Installment Scenario: User receives the first payment of a growing annuity.
  const net_installments = m * (1 - at / 100.0);
  const growth_rate = 1.05; // Payments grow by 5% each year
  const base_payment = net_installments * (growth_rate - 1) / (Math.pow(growth_rate, mal) - 1);
  const annual_balance = base_payment;

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const initial_parameters: InitialParameters = {
    m, lst, at, mal, s, yo, dd, ml,
    investment_tax_rate,
    inflation_rate,
    growth_rate,
    base_payment,
    initial_date: formatDate(current_date),
    predicted_death_date: formatDate(predicted_death_date),
  };

  const state: State = {
    last_update_date: formatDate(current_date),
    lump_balance,
    annual_balance,
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
        throw new Error("Current date cannot be before last update date");
    }

    const days_passed = Math.round((current_date.getTime() - last_update_date.getTime()) / (1000 * 3600 * 24));
    
    // --- Interest rate logic changed to monthly compounding ---
    const monthly_rate = initial_parameters.s / 100 / 12;
    const effective_daily_rate = Math.pow(1 + monthly_rate, 12 / 365) - 1;
    const tax_rate = initial_parameters.investment_tax_rate / 100;

    // --- Balances grow with interest ---
    const calculate_new_balance = (old_balance: number) => {
        const gross_new_balance = old_balance * Math.pow(1 + effective_daily_rate, days_passed);
        const gain = gross_new_balance - old_balance;
        const tax_on_gain = gain > 0 ? gain * tax_rate : 0;
        return gross_new_balance - tax_on_gain;
    }

    let new_lump_balance = calculate_new_balance(state.lump_balance);
    let new_annual_balance = calculate_new_balance(state.annual_balance);

    // --- Add any new annuity payments that would have been received ---
    const initial_date = new Date(initial_parameters.initial_date);
    for (let year = last_update_date.getFullYear(); year <= current_date.getFullYear(); year++) {
        const payment_anniversary = new Date(initial_date);
        payment_anniversary.setFullYear(year);
        
        const years_since_start = payment_anniversary.getFullYear() - initial_date.getFullYear();

        if (years_since_start > 0 && years_since_start < initial_parameters.mal) {
            if (payment_anniversary > last_update_date && payment_anniversary <= current_date) {
                const new_payment = initial_parameters.base_payment * Math.pow(initial_parameters.growth_rate, years_since_start);
                new_annual_balance += new_payment;
            }
        }
    }
    
    // --- CORRECTED: Subtract spending from each scenario independently ---
    new_lump_balance -= spending;
    new_annual_balance -= spending;

    const newState: State = {
        ...state,
        lump_balance: new_lump_balance,
        annual_balance: new_annual_balance,
        last_update_date: current_date.toISOString().split('T')[0],
    };

    return { initial_parameters, state: newState };
}

function calculateSustainableDailyWithdrawal(principal: number, target: number, daily_rate: number, num_days: number, tax_rate: number): number {
    if (num_days <= 0) return 0;
    
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
    const current_date = new Date();
    const predicted_death_date = new Date(initial_parameters.predicted_death_date);

    const days_remaining = Math.round((predicted_death_date.getTime() - current_date.getTime()) / (1000 * 3600 * 24));

    if (days_remaining <= 0) {
        return null;
    }
    
    // --- Interest rate logic changed to monthly compounding ---
    const monthly_rate = initial_parameters.s / 100 / 12;
    const daily_rate = Math.pow(1 + monthly_rate, 12 / 365) - 1;
    const tax_rate = initial_parameters.investment_tax_rate / 100;

    const annual_inflation_rate = initial_parameters.inflation_rate / 100;
    const daily_inflation_rate = Math.pow(1 + annual_inflation_rate, 1 / 365) - 1;

    const target_today = initial_parameters.ml;
    const inflation_adjusted_target = target_today * Math.pow(1 + daily_inflation_rate, days_remaining);

    // --- Lump Sum Withdrawal ---
    const daily_withdraw_lump = calculateSustainableDailyWithdrawal(state.lump_balance, inflation_adjusted_target, daily_rate, days_remaining, tax_rate);

    // --- Annual Installment Withdrawal ---
    // Principal = current cash balance + Present Value of all future payments.
    let pv_future_payments = 0;
    const initial_date = new Date(initial_parameters.initial_date);
    
    for (let i = 0; i < initial_parameters.mal; i++) {
        const payment_date = new Date(initial_date);
        payment_date.setFullYear(initial_date.getFullYear() + i);

        if (payment_date > current_date) {
            const payment_amount = initial_parameters.base_payment * Math.pow(initial_parameters.growth_rate, i);
            const days_to_payment = Math.round((payment_date.getTime() - current_date.getTime()) / (1000 * 3600 * 24));
            pv_future_payments += payment_amount / Math.pow(1 + daily_rate, days_to_payment);
        }
    }
    
    const total_annuity_principal = state.annual_balance + pv_future_payments;
    const daily_withdraw_ann = calculateSustainableDailyWithdrawal(total_annuity_principal, inflation_adjusted_target, daily_rate, days_remaining, tax_rate);
    
    const years_remaining = days_remaining / 365.25;

    const get_limits = (daily_nominal: number) => {
        const daily_real = daily_nominal / Math.pow(1 + daily_inflation_rate, days_remaining);
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
    if (value >= 10000000) {
        return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 100000) {
        return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}; 