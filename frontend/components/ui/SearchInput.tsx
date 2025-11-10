'use client';

import { Input } from './Input';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useEffect, useState } from 'react';

interface SearchInputProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchInput({
  onSearch,
  placeholder = 'Cari...',
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, debounceMs);

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={className}
    />
  );
}

