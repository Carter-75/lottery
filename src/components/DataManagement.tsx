"use client";

import React, { useRef, useState } from 'react';
import { LotteryData } from '@/lib/types';
import { exportLotteryData, importLotteryData } from '@/lib/storage';

interface DataManagementProps {
  data: LotteryData | null;
  onImport: (data: LotteryData) => void;
}

/**
 * Component for importing and exporting lottery data
 * Allows users to backup and restore their calculations
 */
const DataManagement: React.FC<DataManagementProps> = ({ data, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleExport = () => {
    if (!data) {
      alert('No data to export. Please complete the setup first.');
      return;
    }

    try {
      const filename = `lottery-calculator-${new Date().toISOString().split('T')[0]}.json`;
      exportLotteryData(data, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    try {
      const importedData = await importLotteryData(file);
      
      const confirmed = window.confirm(
        'Importing data will replace your current calculations. Are you sure you want to continue?'
      );
      
      if (confirmed) {
        onImport(importedData);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import data';
      setImportError(errorMessage);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="data-management">
      <div className="box">
        <h3 className="title is-5 has-text-centered mb-4" style={{ color: 'var(--gold-light)' }}>
          Data Management
        </h3>

        <div className="buttons is-centered">
          <button
            className="button is-info"
            onClick={handleExport}
            disabled={!data}
            aria-label="Export lottery data to JSON file"
          >
            <span className="icon">
              <i className="icon-download">⬇</i>
            </span>
            <span>Export Data</span>
          </button>

          <button
            className="button is-warning"
            onClick={handleImportClick}
            aria-label="Import lottery data from JSON file"
          >
            <span className="icon">
              <i className="icon-upload">⬆</i>
            </span>
            <span>Import Data</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          aria-hidden="true"
        />

        {importError && (
          <div className="notification is-danger is-light mt-3">
            <button 
              className="delete" 
              onClick={() => setImportError(null)}
              aria-label="Dismiss error"
            />
            {importError}
          </div>
        )}

        {importSuccess && (
          <div className="notification is-success is-light mt-3">
            <button 
              className="delete" 
              onClick={() => setImportSuccess(false)}
              aria-label="Dismiss notification"
            />
            Data imported successfully!
          </div>
        )}

        <div className="content mt-4">
          <p className="has-text-centered" style={{ color: 'var(--text-color-dark)', fontSize: '0.875rem' }}>
            Export your data to create a backup or transfer to another device.
            Import previously exported data to restore your calculations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;

