'use client';

import { Button } from './Button';
import { useState, useRef } from 'react';

export interface ImportButtonProps {
  onImport: (file: File, format: 'excel' | 'csv') => Promise<void>;
  accept?: string;
  disabled?: boolean;
  label?: string;
  loadingLabel?: string;
  isLoading?: boolean;
}

export function ImportButton({
  onImport,
  accept,
  disabled,
  label = 'Impor Data',
  loadingLabel = 'Mengimpor...',
  isLoading,
}: ImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isBusy = (isLoading ?? isImporting) ?? false;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (isLoading === undefined) {
      setIsImporting(true);
    }
    try {
      const format = file.name.endsWith('.csv') ? 'csv' : 'excel';
      await onImport(file, format);
    } catch (error) {
      console.error('Import error:', error);
      alert('Gagal mengimpor data. Silakan coba lagi.');
    } finally {
      if (isLoading === undefined) {
        setIsImporting(false);
      }
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept || '.xlsx,.xls,.csv'}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isBusy}
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isBusy}
        loading={isBusy}
      >
        {isBusy ? loadingLabel : label}
      </Button>
    </>
  );
}

