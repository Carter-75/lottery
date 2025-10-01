import { LotteryData } from './types';
import { formatMoney } from './lottery-logic';

export function exportToCSV(data: LotteryData): string {
  const { initial_parameters, state } = data;
  
  const headers = [
    'Parameter',
    'Value'
  ];
  
  const rows = [
    ['Total Winnings', formatMoney(initial_parameters.user_inputs.total_winnings)],
    ['Lump Sum Tax Rate', `${initial_parameters.user_inputs.lump_sum_tax}%`],
    ['Annuity Tax Rate', `${initial_parameters.user_inputs.annuity_tax}%`],
    ['Savings APR', `${initial_parameters.user_inputs.savings_apr}%`],
    ['Age', initial_parameters.user_inputs.age.toString()],
    ['Expected Death Age', initial_parameters.user_inputs.death_age.toString()],
    ['Annuity Years', initial_parameters.user_inputs.years.toString()],
    ['Money to Leave', formatMoney(initial_parameters.user_inputs.ml)],
    ['Investment Tax Rate', `${initial_parameters.user_inputs.investment_tax_rate}%`],
    ['Inflation Rate', `${initial_parameters.user_inputs.inflation_rate}%`],
    ['', ''], // Empty row separator
    ['Current Lump Balance', formatMoney(state.lump_balance)],
    ['Current Annual Balance', formatMoney(state.annual_balance)],
    ['Years Passed', state.years_passed.toFixed(2)],
    ['Last Update Date', state.last_update_date],
  ];
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
}

export function exportToJSON(data: LotteryData): string {
  return JSON.stringify(data, null, 2);
}

export function downloadCSV(data: LotteryData, filename: string = 'lottery-data.csv'): void {
  const csvContent = exportToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function downloadJSON(data: LotteryData, filename: string = 'lottery-data.json'): void {
  const jsonContent = exportToJSON(data);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}