export interface UserInputParameters {
  entry_mode: 'annuity' | 'cash_value';
  jackpot_annuity: number;
  cash_value: number;
  cash_value_ratio: number;
  already_taxed: boolean;
  
  federal_tax_winnings: number; // percentage
  state_tax_winnings: number;   // percentage
  local_tax_winnings: number;   // percentage
  
  savings_apr: number;          // single APR
  compound_frequency: number;   // 365, 52, 12, etc. (usually 365)
  
  age: number;
  death_age: number;
  ml: number;                   // Amount to leave behind (target_remaining)
  
  filing_status: 'single' | 'married_joint' | 'married_separate' | 'head_of_household';
  state_tax_interest: number;   // percentage
  local_tax_interest: number;   // percentage
  
  inflation_rate: number;       // percentage
}


// All parameters (a mix of user-provided and calculated) needed for the financial logic.
export interface InitialParameters {
  // User inputs are stored here for reference
  user_inputs: UserInputParameters;
  
  // Calculated values
  start_year: number;
  lump_sum_net: number;         // Net lump sum after tax
  base_annuity_payment: number; // First year's payment for a growing annuity
  annuity_growth_rate: number;  // How much the annuity payment increases each year (e.g., 1.05 for 5%)
  
  // Copied from user inputs for easier access in logic
  investment_tax_rate: number;
  inflation_rate: number;
}

export interface State {
  last_update_date: string; // "YYYY-MM-DD"
  lump_balance: number;
  annual_balance: number;
  years_passed: number;
}

export interface LotteryData {
  initial_parameters: InitialParameters;
  state: State;
} 