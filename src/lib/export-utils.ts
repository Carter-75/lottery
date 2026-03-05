import { LotteryData } from './types';
import { formatMoney } from './lottery-logic';

export function exportToCSV(data: LotteryData): string {
  const { initial_parameters, state } = data;
  const inputs = initial_parameters.user_inputs;

  const headers = [
    'Parameter',
    'Value'
  ];

  const rows = [
    ['Entry Mode', inputs.entry_mode],
    ['Jackpot Annuity', formatMoney(inputs.jackpot_annuity)],
    ['Cash Value', formatMoney(inputs.cash_value)],
    ['Cash Value Ratio', inputs.cash_value_ratio.toString()],
    ['Already Taxed', inputs.already_taxed ? 'Yes' : 'No'],
    ['Federal Tax Winnings', `${inputs.federal_tax_winnings}%`],
    ['State Tax Winnings', `${inputs.state_tax_winnings}%`],
    ['Local Tax Winnings', `${inputs.local_tax_winnings}%`],
    ['Savings APR', `${inputs.savings_apr}%`],
    ['Compound Frequency', inputs.compound_frequency.toString()],
    ['Current Age', inputs.age.toString()],
    ['Expected Death Age', inputs.death_age.toString()],
    ['Legacy Amount', formatMoney(inputs.ml)],
    ['Filing Status', inputs.filing_status],
    ['State Tax Interest', `${inputs.state_tax_interest}%`],
    ['Local Tax Interest', `${inputs.local_tax_interest}%`],
    ['Inflation Rate', `${inputs.inflation_rate}%`],
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