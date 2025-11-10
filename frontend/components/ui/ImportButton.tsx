'use client';

import { Button } from './Button';
import { useState, useRef } from 'react';

interface ImportButtonProps {
  onImport: (file: File, format: 'excel' | 'csv') => Promise<void>;
  accept?: string;
  disabled?: boolean;
}

export function ImportButton({ onImport, accept, disabled }: ImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const format = file.name.endsWith('.csv') ? 'csv' : 'excel';
      await onImport(file, format);
    } catch (error) {
      console.error('Import error:', error);
      alert('Gagal mengimpor data. Silakan coba lagi.');
    } finally {
      setIsImporting(false);
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
        disabled={disabled || isImporting}
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isImporting}
        loading={isImporting}
      >
        {isImporting ? 'Mengimpor...' : 'Impor Data'}
      </Button>
    </>
  );
}

