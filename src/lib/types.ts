export interface InitialParameters {
  m: number; // Total money won
  lst: number; // Lump sum tax percentage
  at: number; // Annual installment tax percentage
  mal: number; // Years for annual installments
  s: number; // Savings account APR
  yo: number; // User's current age
  dd: number; // User's expected age at death
  ml: number; // Amount to leave at death
  investment_tax_rate: number; // Tax rate on investment gains
  inflation_rate: number; // Estimated annual inflation rate
  growth_rate: number;
  base_payment: number;
  initial_date: string; // "YYYY-MM-DD"
  predicted_death_date: string; // "YYYY-MM-DD"
}

export interface State {
  last_update_date: string; // "YYYY-MM-DD"
  lump_balance: number;
  annual_balance: number;
}

export interface LotteryData {
  initial_parameters: InitialParameters;
  state: State;
} 