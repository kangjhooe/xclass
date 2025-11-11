'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { cn } from '@/lib/utils/cn';

export type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'daterange';
  options?: { value: string | number; label: string }[];
  operator?: FilterOperator;
  placeholder?: string;
}

export interface FilterValue {
  field: string;
  operator: FilterOperator;
  value: any;
  value2?: any; // For between operator
}

export interface AdvancedFilterProps {
  fields: FilterField[];
  onFilterChange: (filters: FilterValue[]) => void;
  onReset?: () => void;
  className?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (query: string) => void;
  defaultFilters?: FilterValue[];
}

export function AdvancedFilter({
  fields,
  onFilterChange,
  onReset,
  className,
  showSearch = true,
  searchPlaceholder = 'Cari...',
  onSearchChange,
  defaultFilters = [],
}: AdvancedFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterValue[]>(defaultFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newFilter, setNewFilter] = useState<Partial<FilterValue>>({
    field: fields[0]?.key || '',
    operator: 'contains',
  });

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  }, [onSearchChange]);

  const handleAddFilter = useCallback(() => {
    if (!newFilter.field || newFilter.value === undefined || newFilter.value === '') {
      return;
    }

    const field = fields.find((f) => f.key === newFilter.field);
    if (!field) return;

    const filter: FilterValue = {
      field: newFilter.field,
      operator: newFilter.operator || field.operator || 'contains',
      value: newFilter.value,
      value2: newFilter.value2,
    };

    const updated = [...activeFilters, filter];
    setActiveFilters(updated);
    onFilterChange(updated);
    setNewFilter({ field: fields[0]?.key || '', operator: 'contains' });
  }, [newFilter, activeFilters, fields, onFilterChange]);

  const handleRemoveFilter = useCallback((index: number) => {
    const updated = activeFilters.filter((_, i) => i !== index);
    setActiveFilters(updated);
    onFilterChange(updated);
  }, [activeFilters, onFilterChange]);

  const handleReset = useCallback(() => {
    setSearchQuery('');
    setActiveFilters([]);
    setNewFilter({ field: fields[0]?.key || '', operator: 'contains' });
    onFilterChange([]);
    onSearchChange?.('');
    onReset?.();
  }, [fields, onFilterChange, onSearchChange, onReset]);

  const operators: { value: FilterOperator; label: string }[] = useMemo(() => [
    { value: 'equals', label: 'Sama dengan' },
    { value: 'contains', label: 'Mengandung' },
    { value: 'startsWith', label: 'Dimulai dengan' },
    { value: 'endsWith', label: 'Diakhiri dengan' },
    { value: 'greaterThan', label: 'Lebih besar dari' },
    { value: 'lessThan', label: 'Lebih kecil dari' },
    { value: 'between', label: 'Antara' },
    { value: 'in', label: 'Salah satu dari' },
  ], []);

  const selectedField = fields.find((f) => f.key === newFilter.field);
  const availableOperators = selectedField?.type === 'number' || selectedField?.type === 'date'
    ? operators.filter((op) => ['equals', 'greaterThan', 'lessThan', 'between'].includes(op.value))
    : selectedField?.type === 'select' || selectedField?.type === 'multiselect'
    ? operators.filter((op) => ['equals', 'in'].includes(op.value))
    : operators.filter((op) => ['equals', 'contains', 'startsWith', 'endsWith'].includes(op.value));

  const hasActiveFilters = activeFilters.length > 0 || searchQuery.length > 0;

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4', className)}>
      {/* Search Bar */}
      {showSearch && (
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => {
            const field = fields.find((f) => f.key === filter.field);
            const operator = operators.find((op) => op.value === filter.operator);
            return (
              <div
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm"
              >
                <span className="font-medium text-blue-700 dark:text-blue-300">{field?.label}:</span>
                <span className="text-blue-600 dark:text-blue-400">{operator?.label}</span>
                <span className="text-blue-800 dark:text-blue-200 font-semibold">
                  {Array.isArray(filter.value) ? filter.value.join(', ') : String(filter.value)}
                </span>
                {filter.value2 && (
                  <>
                    <span className="text-blue-600 dark:text-blue-400">dan</span>
                    <span className="text-blue-800 dark:text-blue-200 font-semibold">{String(filter.value2)}</span>
                  </>
                )}
                <button
                  onClick={() => handleRemoveFilter(index)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Advanced Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm"
        >
          <svg
            className={cn('w-4 h-4 mr-2 transition-transform', showAdvanced && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Filter Lanjutan
        </Button>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-sm text-red-600 hover:text-red-700 hover:border-red-300"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reset Semua
          </Button>
        )}
      </div>

      {/* Advanced Filter Form */}
      {showAdvanced && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Field Select */}
            <Select
              value={newFilter.field || ''}
              onChange={(e) => {
                const field = fields.find((f) => f.key === e.target.value);
                setNewFilter({
                  field: e.target.value,
                  operator: field?.operator || 'contains',
                  value: undefined,
                });
              }}
            >
              <option value="">Pilih Field</option>
              {fields.map((field) => (
                <option key={field.key} value={field.key}>
                  {field.label}
                </option>
              ))}
            </Select>

            {/* Operator Select */}
            {newFilter.field && (
              <Select
                value={newFilter.operator || 'contains'}
                onChange={(e) => setNewFilter({ ...newFilter, operator: e.target.value as FilterOperator })}
              >
                {availableOperators.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </Select>
            )}

            {/* Value Input */}
            {newFilter.field && selectedField && (
              <div className="md:col-span-2">
                {selectedField.type === 'select' ? (
                  <Select
                    value={newFilter.value || ''}
                    onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                  >
                    <option value="">Pilih {selectedField.label}</option>
                    {selectedField.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                ) : selectedField.type === 'multiselect' ? (
                  <Select
                    multiple
                    value={Array.isArray(newFilter.value) ? newFilter.value : []}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
                      setNewFilter({ ...newFilter, value: values });
                    }}
                  >
                    {selectedField.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                ) : selectedField.type === 'boolean' ? (
                  <Select
                    value={newFilter.value !== undefined ? String(newFilter.value) : ''}
                    onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value === 'true' })}
                  >
                    <option value="">Pilih</option>
                    <option value="true">Ya</option>
                    <option value="false">Tidak</option>
                  </Select>
                ) : selectedField.type === 'daterange' || newFilter.operator === 'between' ? (
                  <div className="flex gap-2">
                    <Input
                      type={selectedField.type === 'date' || selectedField.type === 'daterange' ? 'date' : 'number'}
                      value={newFilter.value || ''}
                      onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                      placeholder="Dari"
                    />
                    <Input
                      type={selectedField.type === 'date' || selectedField.type === 'daterange' ? 'date' : 'number'}
                      value={newFilter.value2 || ''}
                      onChange={(e) => setNewFilter({ ...newFilter, value2: e.target.value })}
                      placeholder="Sampai"
                    />
                  </div>
                ) : (
                  <Input
                    type={selectedField.type === 'number' ? 'number' : selectedField.type === 'date' ? 'date' : 'text'}
                    value={newFilter.value || ''}
                    onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                    placeholder={selectedField.placeholder || `Masukkan ${selectedField.label}`}
                  />
                )}
              </div>
            )}

            {/* Add Button */}
            <div className="flex items-end">
              <Button
                onClick={handleAddFilter}
                disabled={!newFilter.field || newFilter.value === undefined || newFilter.value === ''}
                size="sm"
                className="w-full"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Filter
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hook untuk menggunakan advanced filter dengan mudah
 */
export function useAdvancedFilter<T>(
  data: T[],
  fields: FilterField[],
  searchFields?: (keyof T)[]
) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterValue[]>([]);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchQuery && searchFields) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(query);
        })
      );
    }

    // Apply filters
    filters.forEach((filter) => {
      const field = fields.find((f) => f.key === filter.field);
      if (!field) return;

      result = result.filter((item) => {
        const itemValue = (item as any)[filter.field];
        const filterValue = filter.value;

        switch (filter.operator) {
          case 'equals':
            return itemValue === filterValue;
          case 'contains':
            return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'startsWith':
            return String(itemValue).toLowerCase().startsWith(String(filterValue).toLowerCase());
          case 'endsWith':
            return String(itemValue).toLowerCase().endsWith(String(filterValue).toLowerCase());
          case 'greaterThan':
            return Number(itemValue) > Number(filterValue);
          case 'lessThan':
            return Number(itemValue) < Number(filterValue);
          case 'between':
            return Number(itemValue) >= Number(filterValue) && Number(itemValue) <= Number(filter.value2 || 0);
          case 'in':
            return Array.isArray(filterValue) ? filterValue.includes(itemValue) : filterValue === itemValue;
          default:
            return true;
        }
      });
    });

    return result;
  }, [data, searchQuery, filters, fields, searchFields]);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredData,
    hasActiveFilters: searchQuery.length > 0 || filters.length > 0,
    reset: () => {
      setSearchQuery('');
      setFilters([]);
    },
  };
}

