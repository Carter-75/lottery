import { LotteryData, State, InitialParameters, UserInputParameters } from './types';

export function calculateInitialLotteryData(inputs: UserInputParameters): LotteryData {
    const {
        entry_mode,
        jackpot_annuity,
        cash_value,
        cash_value_ratio,
        already_taxed,
        federal_tax_winnings,
        state_tax_winnings,
        local_tax_winnings,
        age,
        death_age
    } = inputs;

    const years = death_age - age;

    // Validate inputs to prevent calculation errors
    if (years <= 0) {
        throw new Error('Invalid input: years (death age - current age) must be positive');
    }

    // 1. Calculate the initial cash value
    let initial_cash_value = cash_value;
    if (entry_mode === 'annuity') {
        initial_cash_value = jackpot_annuity * cash_value_ratio;
    }

    // 2. Calculate the after-tax lump sum
    let lump_sum_net = initial_cash_value;
    if (!already_taxed) {
        const total_tax_rate_winnings = (federal_tax_winnings + state_tax_winnings + local_tax_winnings) / 100;
        lump_sum_net = initial_cash_value * (1 - total_tax_rate_winnings);
    }

    // Keep annuity option around for purely display/legacy sake if needed, 
    // but the core logic for drawdown will use the lump_sum_net.
    // We'll calculate a theoretical base_annuity_payment for backward compatibility:
    const annuity_growth_rate = 1.05;
    const annuity_tax_rate = (federal_tax_winnings + state_tax_winnings + local_tax_winnings) / 100;
    const gross_annuity_value = jackpot_annuity > 0 ? jackpot_annuity * (1 - annuity_tax_rate) : initial_cash_value / cash_value_ratio * (1 - annuity_tax_rate);

    let base_annuity_payment = 0;
    const annuity_payout_years = 30; // standard lottery annuity length
    if (annuity_growth_rate > 1.0) {
        base_annuity_payment = gross_annuity_value * (annuity_growth_rate - 1) / (Math.pow(annuity_growth_rate, annuity_payout_years) - 1);
    } else {
        base_annuity_payment = gross_annuity_value / annuity_payout_years;
    }

    const currentDate = new Date();
    const initial_parameters: InitialParameters = {
        user_inputs: inputs,
        start_year: currentDate.getFullYear(),
        lump_sum_net,
        base_annuity_payment,
        annuity_growth_rate,
        investment_tax_rate: 0, // Migrated to progressive tax on interest
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

    // Calculate days using UTC to avoid timezone issues
    const days_passed = Math.round((Date.UTC(current_date.getFullYear(), current_date.getMonth(), current_date.getDate()) -
        Date.UTC(last_update_date.getFullYear(), last_update_date.getMonth(), last_update_date.getDate())) /
        (1000 * 60 * 60 * 24));
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
        const annuity_length = 30; // standard lottery length
        if (years_since_start <= 0 || years_since_start >= annuity_length) {
            continue;
        }

        // Check if anniversary has passed
        const lastUpdateDateObj = new Date(state.last_update_date);
        const anniversary_this_year = new Date(lastUpdateDateObj);
        anniversary_this_year.setFullYear(year);

        if (anniversary_this_year > last_update_date && anniversary_this_year <= current_date) {
            const new_payment = initial_parameters.base_annuity_payment * Math.pow(initial_parameters.annuity_growth_rate, years_since_start);
            new_annual_balance += new_payment;
        }
    }

    // Deduct spending proportionally from both accounts based on their balances
    const total_balance = new_lump_balance + new_annual_balance;
    if (total_balance > 0) {
        const lump_ratio = new_lump_balance / total_balance;
        const annual_ratio = new_annual_balance / total_balance;
        new_lump_balance -= spending * lump_ratio;
        new_annual_balance -= spending * annual_ratio;
    }

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

// 2024/2025 Federal Tax Brackets (Single Filer)
const FEDERAL_BRACKETS_SINGLE = [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11601, max: 47150, rate: 0.12 },
    { min: 47151, max: 100525, rate: 0.22 },
    { min: 100526, max: 191950, rate: 0.24 },
    { min: 191951, max: 243725, rate: 0.32 },
    { min: 243726, max: 609350, rate: 0.35 },
    { min: 609351, max: Infinity, rate: 0.37 },
];

const FEDERAL_BRACKETS_MARRIED_JOINT = [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23201, max: 94300, rate: 0.12 },
    { min: 94301, max: 201050, rate: 0.22 },
    { min: 201051, max: 383900, rate: 0.24 },
    { min: 383901, max: 487450, rate: 0.32 },
    { min: 487451, max: 731200, rate: 0.35 },
    { min: 731201, max: Infinity, rate: 0.37 },
];

const FEDERAL_BRACKETS_HEAD_OF_HOUSEHOLD = [
    { min: 0, max: 16550, rate: 0.10 },
    { min: 16551, max: 63100, rate: 0.12 },
    { min: 63101, max: 100500, rate: 0.22 },
    { min: 100501, max: 191950, rate: 0.24 },
    { min: 191951, max: 243700, rate: 0.32 },
    { min: 243701, max: 609350, rate: 0.35 },
    { min: 609351, max: Infinity, rate: 0.37 },
];

function calcFederalTax(taxableIncome: number, filing_status: string): number {
    let brackets = FEDERAL_BRACKETS_SINGLE;
    if (filing_status === 'married_joint') brackets = FEDERAL_BRACKETS_MARRIED_JOINT;
    if (filing_status === 'head_of_household') brackets = FEDERAL_BRACKETS_HEAD_OF_HOUSEHOLD;

    // married_separate uses single brackets usually

    let tax = 0;
    let remainingIncome = taxableIncome;
    for (const bracket of brackets) {
        if (remainingIncome <= 0) break;
        const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min + 1);
        tax += taxableInBracket * bracket.rate;
        remainingIncome -= taxableInBracket;
    }
    return tax;
}

function calculateDeterministicWithdrawal(
    PV: number,
    FV: number,
    APR: number,
    compound_frequency: number,
    years: number,
    periods_per_year: number,
    filing_status: string,
    state_tax_interest: number,
    local_tax_interest: number
): { gross: number, net: number, annual_tax: number } {

    if (years <= 0 || PV <= 0) return { gross: 0, net: 0, annual_tax: 0 };

    // Effective annual rate
    const EAR = Math.pow(1 + (APR / 100) / compound_frequency, compound_frequency) - 1;

    // Tax Estimation
    const AVERAGE_BALANCE = (PV + FV) / 2;
    const ANNUAL_INTEREST_AVG = AVERAGE_BALANCE * EAR;

    const fed_tax = calcFederalTax(ANNUAL_INTEREST_AVG, filing_status);
    const state_tax_val = ANNUAL_INTEREST_AVG * (state_tax_interest / 100);
    const local_tax_val = ANNUAL_INTEREST_AVG * (local_tax_interest / 100);

    const total_annual_tax = fed_tax + state_tax_val + local_tax_val;
    const effective_tax_rate_on_interest = ANNUAL_INTEREST_AVG > 0 ? (total_annual_tax / ANNUAL_INTEREST_AVG) : 0;

    // After-tax effective rate
    const EAR_AFTER_TAX = EAR * (1 - effective_tax_rate_on_interest);

    // Per-period rates
    const r_gross = Math.pow(1 + EAR, 1 / periods_per_year) - 1;
    const r_net = Math.pow(1 + EAR_AFTER_TAX, 1 / periods_per_year) - 1;

    const n = years * periods_per_year;

    let W_gross = 0;
    let W_net = 0;

    if (r_gross > 0) {
        W_gross = (PV - FV / Math.pow(1 + r_gross, n)) * (r_gross / (1 - Math.pow(1 + r_gross, -n)));
    } else {
        W_gross = (PV - FV) / n;
    }

    if (r_net > 0) {
        W_net = (PV - FV / Math.pow(1 + r_net, n)) * (r_net / (1 - Math.pow(1 + r_net, -n)));
    } else {
        W_net = (PV - FV) / n;
    }

    return {
        gross: W_gross,
        net: W_net,
        annual_tax: total_annual_tax
    };
}

export function calculateWithdrawalLimits(data: LotteryData) {
    const { initial_parameters, state } = data;
    const { user_inputs } = initial_parameters;

    const total_years_of_life = user_inputs.death_age - user_inputs.age;
    const years_remaining = total_years_of_life - state.years_passed;

    if (years_remaining <= 0) return null;

    const inflation_rate = initial_parameters.inflation_rate / 100;
    const target_today = user_inputs.ml;
    const inflation_adjusted_target = target_today * Math.pow(1 + inflation_rate, years_remaining);

    const get_limits_for_principal = (principal: number) => {
        const calc_for_freq = (periods_per_year: number) => {
            const result = calculateDeterministicWithdrawal(
                principal,
                inflation_adjusted_target,
                user_inputs.savings_apr,
                user_inputs.compound_frequency || 365,
                years_remaining,
                periods_per_year,
                user_inputs.filing_status || 'single',
                user_inputs.state_tax_interest || 0,
                user_inputs.local_tax_interest || 0
            );

            // Deflate back to today's dollars (real) vs nominal
            const discount_factor = Math.pow(1 + (inflation_rate / periods_per_year), -years_remaining * periods_per_year); // Rough simplistic deflate for UX

            return {
                nominal: result.net,
                real: result.net * discount_factor,
                annual_tax: result.annual_tax
            };
        };

        return {
            daily: calc_for_freq(365),
            weekly: calc_for_freq(52),
            biweekly: calc_for_freq(26),
            monthly: calc_for_freq(12),
        };
    };

    // Calculate future PV of annuity payments (simple version for UX display)
    let pv_future_payments = 0;
    const years_of_payments_made = Math.floor(state.years_passed);
    const investment_apr = user_inputs.savings_apr;
    const daily_rate = Math.pow(1 + (investment_apr / 100 / 12), 12 / 365) - 1;

    // Note: User prompt instructed we can treat the lump sum as the main functional balance,
    // but we'll maintain the annuity fallback to prevent UI breaking.
    const annuity_payout_years = 30;
    for (let i = years_of_payments_made + 1; i < annuity_payout_years; i++) {
        const payment_amount = initial_parameters.base_annuity_payment * Math.pow(initial_parameters.annuity_growth_rate, i);
        const years_to_payment = i - state.years_passed;
        const days_to_payment = years_to_payment * 365.25;
        pv_future_payments += payment_amount / Math.pow(1 + daily_rate, days_to_payment);
    }
    const total_annuity_principal = state.annual_balance + pv_future_payments;

    return {
        lump: get_limits_for_principal(state.lump_balance),
        annual: get_limits_for_principal(total_annuity_principal),
        years_remaining,
        inflation_adjusted_target,
    };
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