'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils/cn';
import { useToastStore } from '@/lib/store/toast';

export interface BulkAction {
  label: string;
  action: (selectedIds: (string | number)[]) => Promise<void> | void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  icon?: React.ReactNode;
  confirmMessage?: string;
  requireConfirmation?: boolean;
}

export interface BulkActionsProps {
  selectedItems: (string | number)[];
  actions: BulkAction[];
  onSelectionChange?: (selected: (string | number)[]) => void;
  onClearSelection?: () => void;
  className?: string;
  showCount?: boolean;
  maxSelection?: number;
}

export function BulkActions({
  selectedItems,
  actions,
  onSelectionChange,
  onClearSelection,
  className,
  showCount = true,
  maxSelection,
}: BulkActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const { promise } = useToastStore();

  const handleAction = useCallback(async (action: BulkAction) => {
    if (selectedItems.length === 0) return;

    // Confirmation
    if (action.requireConfirmation !== false) {
      const message = action.confirmMessage || `Apakah Anda yakin ingin ${action.label.toLowerCase()} ${selectedItems.length} item?`;
      if (!window.confirm(message)) {
        return;
      }
    }

    setIsProcessing(true);
    setProcessingAction(action.label);

    try {
      await promise(
        Promise.resolve(action.action(selectedItems)),
        {
          loading: `Memproses ${action.label}...`,
          success: `${action.label} berhasil untuk ${selectedItems.length} item`,
          error: (error) => `Gagal ${action.label.toLowerCase()}: ${error?.message || 'Terjadi kesalahan'}`,
        }
      );
      
      // Clear selection after successful action
      if (onClearSelection) {
        onClearSelection();
      }
    } catch (error) {
      // Error sudah ditangani oleh promise toast
      console.error('Bulk action error:', error);
    } finally {
      setIsProcessing(false);
      setProcessingAction(null);
    }
  }, [selectedItems, actions, promise, onClearSelection]);

  if (selectedItems.length === 0) {
    return null;
  }

  const isDisabled = isProcessing || (maxSelection && selectedItems.length > maxSelection);

  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl',
        'px-4 py-3 flex items-center gap-3',
        'animate-slide-up',
        className
      )}
    >
      {/* Selection Count */}
      {showCount && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            {selectedItems.length} item dipilih
            {maxSelection && selectedItems.length > maxSelection && (
              <span className="text-red-600 dark:text-red-400 ml-1">
                (Maks: {maxSelection})
              </span>
            )}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'primary'}
            size="sm"
            onClick={() => handleAction(action)}
            disabled={isDisabled || isProcessing}
            className="flex items-center gap-2"
          >
            {isProcessing && processingAction === action.label ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Memproses...
              </>
            ) : (
              <>
                {action.icon}
                {action.label}
              </>
            )}
          </Button>
        ))}
      </div>

      {/* Clear Selection */}
      <Button
        variant="outline"
        size="sm"
        onClick={onClearSelection}
        disabled={isProcessing}
        className="ml-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Batal
      </Button>
    </div>
  );
}

/**
 * Hook untuk mengelola bulk selection
 */
export function useBulkSelection<T extends { id: string | number }>(
  items: T[],
  options?: {
    maxSelection?: number;
    onSelectionChange?: (selected: (string | number)[]) => void;
  }
) {
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const toggleSelection = useCallback((id: string | number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      }
      
      if (options?.maxSelection && prev.length >= options.maxSelection) {
        return prev;
      }
      
      return [...prev, id];
    });
  }, [options?.maxSelection]);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      const max = options?.maxSelection || items.length;
      setSelectedIds(items.slice(0, max).map((item) => item.id));
    }
  }, [items, selectedIds.length, options?.maxSelection]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback((id: string | number) => {
    return selectedIds.includes(id);
  }, [selectedIds]);

  const isAllSelected = selectedIds.length === items.length && items.length > 0;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < items.length;

  // Notify parent of selection changes
  useEffect(() => {
    options?.onSelectionChange?.(selectedIds);
  }, [selectedIds, options]);

  return {
    selectedIds,
    setSelectedIds,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isIndeterminate,
    selectedCount: selectedIds.length,
    selectedItems: items.filter((item) => selectedIds.includes(item.id)),
  };
}

