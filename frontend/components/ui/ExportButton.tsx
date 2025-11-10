'use client';

import { Button } from './Button';
import { useState } from 'react';

interface ExportButtonProps {
  onExport: (format: 'excel' | 'pdf' | 'csv') => Promise<void>;
  filename?: string;
  disabled?: boolean;
}

export function ExportButton({ onExport, filename = 'data', disabled }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    setIsExporting(true);
    setShowMenu(false);
    try {
      await onExport(format);
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal mengekspor data. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <Button
        variant="outline"
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled || isExporting}
        loading={isExporting}
      >
        {isExporting ? 'Mengekspor...' : 'Ekspor Data'}
      </Button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <button
                onClick={() => handleExport('excel')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                📊 Excel (.xlsx)
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                📄 PDF (.pdf)
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                📋 CSV (.csv)
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

