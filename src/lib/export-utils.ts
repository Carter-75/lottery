import { LotteryData, formatMoney } from './lottery-logic';

export function exportToCSV(data: LotteryData): string {
  const { initial_parameters, state } = data;
  const { user_inputs } = initial_parameters;
  
  const csvData = [
    ['Lottery Winnings Calculator - Export'],
    ['Generated on:', new Date().toLocaleDateString()],
    [''],
    ['INPUT PARAMETERS'],
    ['Total Winnings', `$${user_inputs.total_winnings.toLocaleString()}`],
    ['Lump Sum Tax Rate', `${user_inputs.lump_sum_tax}%`],
    ['Annuity Tax Rate', `${user_inputs.annuity_tax}%`],
    ['Savings APR', `${user_inputs.savings_apr}%`],
    ['Current Age', user_inputs.age.toString()],
    ['Expected Death Age', user_inputs.death_age.toString()],
    ['Annuity Payment Years', user_inputs.years.toString()],
    ['Inheritance Goal', formatMoney(user_inputs.ml)],
    ['Investment Tax Rate', `${user_inputs.investment_tax_rate}%`],
    ['Inflation Rate', `${user_inputs.inflation_rate}%`],
    [''],
    ['CURRENT BALANCES'],
    ['Lump Sum Balance', formatMoney(state.lump_balance)],
    ['Annuity Balance', formatMoney(state.annual_balance)],
    ['Last Update Date', state.last_update_date],
    ['Years Passed', state.years_passed.toFixed(2)],
  ];
  
  return csvData.map(row => row.join(',')).join('\n');
}

export function downloadCSV(data: LotteryData): void {
  const csvContent = exportToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `lottery-calculator-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function shareScenario(data: LotteryData): string {
  const params = new URLSearchParams();
  const { user_inputs } = data.initial_parameters;
  
  Object.entries(user_inputs).forEach(([key, value]) => {
    params.append(key, value.toString());
  });
  
  return `${window.location.origin}?${params.toString()}`;
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  
  // Fallback for older browsers
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
  return Promise.resolve();
}