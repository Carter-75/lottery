/**
 * Local storage utilities for persisting lottery data
 * Handles serialization, deserialization, and error recovery
 */

import { LotteryData } from './types';

const STORAGE_KEY = 'lotteryData';
const STORAGE_VERSION = '1.0';

interface StoredData {
  version: string;
  data: LotteryData;
  lastModified: string;
}

/**
 * Saves lottery data to local storage
 * @param data - Lottery data to save
 * @returns True if save was successful
 */
export function saveLotteryData(data: LotteryData): boolean {
  try {
    const storedData: StoredData = {
      version: STORAGE_VERSION,
      data,
      lastModified: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    return true;
  } catch (error) {
    console.error('Failed to save lottery data:', error);
    return false;
  }
}

/**
 * Loads lottery data from local storage
 * @returns Lottery data if found, null otherwise
 */
export function loadLotteryData(): LotteryData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed: StoredData = JSON.parse(stored);
    
    // Version check for future migrations
    if (parsed.version !== STORAGE_VERSION) {
      console.warn('Storage version mismatch, data may need migration');
    }

    return parsed.data;
  } catch (error) {
    console.error('Failed to load lottery data:', error);
    return null;
  }
}

/**
 * Clears lottery data from local storage
 * @returns True if clear was successful
 */
export function clearLotteryData(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear lottery data:', error);
    return false;
  }
}

/**
 * Exports lottery data as a JSON file
 * @param data - Lottery data to export
 * @param filename - Optional filename for the export
 */
export function exportLotteryData(data: LotteryData, filename?: string): void {
  const exportData: StoredData = {
    version: STORAGE_VERSION,
    data,
    lastModified: new Date().toISOString()
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `lottery-data-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Imports lottery data from a JSON file
 * @param file - File to import
 * @returns Promise that resolves to lottery data
 */
export function importLotteryData(file: File): Promise<LotteryData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed: StoredData = JSON.parse(content);
        
        if (!parsed.data || !parsed.data.initial_parameters || !parsed.data.state) {
          throw new Error('Invalid data format');
        }
        
        resolve(parsed.data);
      } catch (error) {
        reject(new Error('Failed to parse import file. Please ensure it is a valid lottery data export.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

